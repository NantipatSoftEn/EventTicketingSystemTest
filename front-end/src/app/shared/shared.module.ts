import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { LayoutComponent } from './components/layout/layout.component'
import { NavbarComponent } from './components/navbar/navbar.component'
import { FooterComponent } from './components/footer/footer.component'
import { UserSelectorComponent } from './components/user-selector/user-selector.component'

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule,
        LayoutComponent,
        NavbarComponent,
        FooterComponent,
        UserSelectorComponent,
    ],
    exports: [
        LayoutComponent,
        NavbarComponent,
        FooterComponent,
        UserSelectorComponent,
    ],
})
export class SharedModule {}
