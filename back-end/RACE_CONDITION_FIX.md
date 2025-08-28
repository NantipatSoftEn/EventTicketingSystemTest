# การแก้ไข Race Condition ในระบบจองตั๋ว

## ปัญหาปัจจุบัน
ระบบมีการป้องกัน overselling ที่ระดับ database trigger แล้ว แต่ยังมีช่องโหว่ race condition ในการจอง

## วิธีการแก้ไข

### 1. เพิ่ม Database Transaction ใน BookingUseCases

```python
from tortoise.transactions import in_transaction

async def create_booking(self, booking_dto: BookingCreateDTO) -> BookingResponseDTO:
    """Create a new booking with transaction protection"""
    async with in_transaction():
        # Validate user exists
        user = await self._user_repository.get_by_id(booking_dto.user_id)
        if not user:
            raise ValueError("User not found")
        
        # Validate event exists and get event details
        event = await self._event_repository.get_by_id(booking_dto.event_id)
        if not event:
            raise ValueError("Event not found")
        
        # Re-validate availability within transaction (important!)
        await self._booking_service.validate_booking_availability(
            booking_dto.event_id, booking_dto.quantity
        )
        
        # Calculate total amount
        total_amount = event.calculate_total_price(booking_dto.quantity)
        
        # Create booking domain entity
        booking = Booking(
            id=None,
            user_id=booking_dto.user_id,
            event_id=booking_dto.event_id,
            quantity=booking_dto.quantity,
            total_amount=total_amount,
            booking_date=datetime.now(),
            status=BookingStatus.CONFIRMED
        )
        
        # Save booking (protected by transaction + trigger)
        created_booking = await self._booking_repository.create(booking)
        
        # Generate tickets for the booking
        await self._ticket_service.generate_tickets_for_booking(
            created_booking.id, booking_dto.quantity
        )
        
        return BookingResponseDTO(...)
```

### 2. เพิ่ม Row-level Locking (ทางเลือก)

```python
# ใน BookingRepositoryImpl
async def get_available_capacity_with_lock(self, event_id: int) -> int:
    """Get available capacity with row lock"""
    # SELECT ... FOR UPDATE จะ lock row จนกว่า transaction จะเสร็จ
    event = await EventModel.filter(id=event_id).select_for_update().first()
    if not event:
        raise ValueError("Event not found")
    
    confirmed_bookings = await BookingModel.filter(
        event_id=event_id, 
        status=BookingStatus.CONFIRMED
    ).sum('quantity') or 0
    
    return event.capacity - confirmed_bookings
```

### 3. เพิ่มการจัดการ Error ใน Controller

```python
async def create_booking(self, booking_schema: BookingCreateSchema) -> BookingResponseSchema:
    """Create a new booking with proper error handling"""
    try:
        booking_dto = BookingCreateDTO(...)
        created_booking = await self._booking_use_cases.create_booking(booking_dto)
        return BookingResponseSchema(...)
        
    except ValueError as e:
        # Business logic errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Database constraint violations (from trigger)
        if "exceeds available capacity" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Tickets are no longer available. Please try again."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your booking"
        )
```

### 4. เพิ่มการ Retry ใน Frontend

```typescript
createBookingWithRetry(bookingRequest: BookingApiRequest, maxRetries: number = 3): Observable<Booking> {
  return this.createBookingWithApiFormat(bookingRequest).pipe(
    retryWhen(errors => 
      errors.pipe(
        scan((retryCount, error) => {
          if (retryCount >= maxRetries || error.status !== 409) {
            throw error;
          }
          return retryCount + 1;
        }, 0),
        delay(1000) // รอ 1 วินาทีก่อน retry
      )
    )
  );
}
```

## ระดับการป้องกัน (Defense in Depth)

1. **Frontend Validation** - ป้องกันการเลือกเกินจำนวนที่มี
2. **Application Logic** - ตรวจสอบ availability
3. **Database Transaction** - ป้องกัน race condition  
4. **Database Trigger** - สุดท้ายป้องกัน overselling
5. **Error Handling** - จัดการ error ที่เกิดขึ้นอย่างเหมาะสม

## การทดสอบ Race Condition

```bash
# ใช้ทดสอบด้วย concurrent requests
for i in {1..10}; do
  curl -X POST localhost:8000/api/v1/bookings \
    -H "Content-Type: application/json" \
    -d '{"user_id": '$i', "event_id": 1, "quantity": 1}' &
done
wait
```
