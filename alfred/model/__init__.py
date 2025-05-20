"""Alfred model management module"""
# type: ignore
from typing import List

from .registry.main import create_registry_app
from .router.main import create_router_app

__all__: List[str] = ["create_router_app", "create_registry_app"]
