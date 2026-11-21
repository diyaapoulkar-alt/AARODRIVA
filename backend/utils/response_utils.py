from typing import Any, Dict, Optional
from fastapi.responses import JSONResponse


def success_response(data: Any, message: str = "Success", status_code: int = 200) -> Dict[str, Any]:
    """Wraps API responses in a standardized payload."""
    return {
        "status": "success",
        "message": message,
        "data": data
    }


def error_response(message: str, status_code: int = 400, details: Optional[Any] = None) -> JSONResponse:
    """Returns standardized JSON error responses."""
    content = {
        "status": "error",
        "message": message,
        "details": details or {}
    }
    return JSONResponse(status_code=status_code, content=content)
