# FastAPI — Getting Started Guide

## What is FastAPI?

FastAPI is a modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints. It is designed to be easy to use while providing automatic interactive documentation and high performance comparable to NodeJS and Go.

### Key Features

- **Fast**: Very high performance, on par with NodeJS and Go (thanks to Starlette and Pydantic)
- **Fast to code**: Increase the speed to develop features by about 200% to 300%
- **Fewer bugs**: Reduce about 40% of human-induced errors
- **Intuitive**: Great editor support with completion everywhere. Less time debugging
- **Easy**: Designed to be easy to use and learn. Less time reading docs
- **Short**: Minimize code duplication
- **Robust**: Get production-ready code with automatic interactive documentation
- **Standards-based**: Based on OpenAPI and JSON Schema

## Installation

Install FastAPI and an ASGI server:

```bash
pip install fastapi uvicorn[standard]
```

## Creating Your First API

Create a file `main.py`:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
```

Run the server:

```bash
uvicorn main:app --reload
```

Your API is now running at `http://127.0.0.1:8000`.

## Path Parameters

You can declare path parameters with Python type annotations:

```python
@app.get("/users/{user_id}")
async def read_user(user_id: int):
    return {"user_id": user_id}
```

The value of `user_id` will be passed as an integer. If you provide a non-integer value, you'll get a clear validation error.

## Query Parameters

When you declare function parameters that are not part of the path, they are automatically interpreted as query parameters:

```python
@app.get("/items/")
async def read_items(skip: int = 0, limit: int = 10):
    return fake_items_db[skip : skip + limit]
```

The query is the set of key-value pairs after `?` in a URL, separated by `&`.

## Request Body

To declare a request body, use Pydantic models:

```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

@app.post("/items/")
async def create_item(item: Item):
    return item
```

## Dependency Injection

FastAPI has a powerful dependency injection system:

```python
from fastapi import Depends

async def common_parameters(q: str = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons
```

Dependencies can have sub-dependencies, creating a tree of dependencies that FastAPI resolves automatically.

## Authentication

FastAPI provides several tools for handling security:

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if not validate_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
    return token

@app.get("/protected")
async def protected_route(token: str = Depends(verify_token)):
    return {"message": "You have access", "token": token}
```

## Error Handling

Use `HTTPException` for error responses:

```python
from fastapi import HTTPException

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    return items[item_id]
```

## Middleware

Add middleware for cross-cutting concerns:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Automatic Documentation

FastAPI generates interactive API documentation automatically:

- **Swagger UI**: Available at `/docs`
- **ReDoc**: Available at `/redoc`

Both are generated from the OpenAPI schema that FastAPI creates from your type annotations.
