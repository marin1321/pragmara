# Python asyncio — Overview

## What is asyncio?

`asyncio` is a library in Python for writing concurrent code using the `async`/`await` syntax. It is the foundation for multiple Python asynchronous frameworks including web servers, database connection libraries, and distributed task queues.

## Core Concepts

### Coroutines

A coroutine is a function declared with `async def`. When called, it returns a coroutine object that must be awaited:

```python
import asyncio

async def say_hello():
    print("Hello")
    await asyncio.sleep(1)
    print("World")

asyncio.run(say_hello())
```

### Tasks

Tasks are used to schedule coroutines to run concurrently:

```python
async def fetch_data(url):
    await asyncio.sleep(1)  # Simulating network request
    return f"Data from {url}"

async def main():
    task1 = asyncio.create_task(fetch_data("url1"))
    task2 = asyncio.create_task(fetch_data("url2"))

    result1 = await task1
    result2 = await task2
    print(result1, result2)

asyncio.run(main())
```

### Event Loop

The event loop is the core of every asyncio application. It runs async tasks and callbacks, performs network IO operations, and runs subprocesses.

```python
loop = asyncio.get_event_loop()
loop.run_until_complete(main())
```

In modern Python (3.10+), prefer `asyncio.run()` over manually managing the event loop.

## Gathering Tasks

Use `asyncio.gather()` to run multiple coroutines concurrently and collect results:

```python
async def main():
    results = await asyncio.gather(
        fetch_data("https://api.example.com/users"),
        fetch_data("https://api.example.com/posts"),
        fetch_data("https://api.example.com/comments"),
    )
    users, posts, comments = results
```

## Timeouts

Protect against slow operations with timeouts:

```python
async def slow_operation():
    await asyncio.sleep(10)
    return "Done"

async def main():
    try:
        result = await asyncio.wait_for(slow_operation(), timeout=5.0)
    except asyncio.TimeoutError:
        print("Operation timed out")
```

## Synchronization Primitives

### Lock

```python
lock = asyncio.Lock()

async def safe_increment(counter):
    async with lock:
        value = counter["value"]
        await asyncio.sleep(0.1)
        counter["value"] = value + 1
```

### Semaphore

Limit the number of concurrent operations:

```python
semaphore = asyncio.Semaphore(10)  # Max 10 concurrent

async def limited_fetch(url):
    async with semaphore:
        return await fetch_data(url)
```

## Running Blocking Code

Use `asyncio.to_thread()` for CPU-bound or blocking operations:

```python
import time

def blocking_operation():
    time.sleep(2)
    return "Result from blocking operation"

async def main():
    result = await asyncio.to_thread(blocking_operation)
    print(result)
```

## Error Handling

Handle exceptions in async code:

```python
async def risky_operation():
    raise ValueError("Something went wrong")

async def main():
    try:
        await risky_operation()
    except ValueError as e:
        print(f"Caught error: {e}")
```

For `gather()`, use `return_exceptions=True` to prevent one failure from canceling others:

```python
results = await asyncio.gather(
    operation1(),
    operation2(),
    operation3(),
    return_exceptions=True,
)

for result in results:
    if isinstance(result, Exception):
        print(f"Task failed: {result}")
    else:
        print(f"Task succeeded: {result}")
```

## Best Practices

1. **Use `asyncio.run()`** as the main entry point
2. **Avoid blocking the event loop** — use `to_thread()` for blocking operations
3. **Use `asyncio.gather()`** for parallel independent operations
4. **Set timeouts** on network operations to prevent hanging
5. **Use semaphores** to limit concurrent connections to external services
6. **Handle cancellation** gracefully with try/except CancelledError
