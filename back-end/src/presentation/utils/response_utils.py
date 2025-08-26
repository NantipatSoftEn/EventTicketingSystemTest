"""
Response utilities for converting Pydantic models to dictionaries
"""

from typing import Any, Dict, List, Union
from pydantic import BaseModel


def model_to_dict(model: BaseModel) -> Dict[str, Any]:
    """Convert a Pydantic model to dictionary"""
    return model.model_dump()


def models_to_dict_list(models: List[BaseModel]) -> List[Dict[str, Any]]:
    """Convert a list of Pydantic models to list of dictionaries"""
    return [model.model_dump() for model in models]


def prepare_response_data(data: Union[BaseModel, List[BaseModel], Dict[str, Any], List[Dict[str, Any]]]) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Prepare data for API response by converting models to dictionaries
    """
    if isinstance(data, BaseModel):
        return model_to_dict(data)
    elif isinstance(data, list):
        if data and isinstance(data[0], BaseModel):
            return models_to_dict_list(data)
        else:
            return data
    else:
        return data
