# JavaScript Event Loop Guide

## Introduction

**Sources**

* Medium article — "JavaScript’s Event Loop Visualized: What’s Really Happening When Your Code Runs"
* Minor note: I paid \$5 for this fucking article.
* MAJOR NOTE : Sorry for gramer mistkes. i dont give a fuck man ...

```js
console.log("First");
fetch('https://cors-anywhere.herokuapp.com/https://api.hedef.com/data')
  .then(res => console.log("Second"));
console.log("Third");
```

**Output for this code:**

* First
* Third
* Second

> The biggest misconception about JavaScript is that it executes code strictly line by line. Nah, bro — not exactly.
> JavaScript uses a LIFO (Last In, First Out) model. The most recently added function is the first to be completed.

Let's code this:

```js
function multiply(a, b) {
    return a * b;
}
function square(n) {
    return multiply(n, n);
}
function printSquare(n) {
    const result = square(n);
    console.log(result);
}
printSquare(5);
```

Of course, our output is `25` as expected. But that's not our concern here.

**Call Stack Trace:**

* Initially: \[]
* After calling `printSquare(5)`: \[printSquare]
* After calling `square(5)`: \[printSquare, square]
* After calling `multiply(5, 5)`: \[printSquare, square, multiply]
* After `multiply` completes: \[printSquare, square]
* After `square` completes: \[printSquare]
* After `console.log(result)` executes: \[printSquare]
* After `printSquare` completes: \[]

## What about asynchronous operations?

JavaScript can't make network requests, set timers, or read files by itself. These capabilities are provided by the environment in which JavaScript is running — like Node.js (my beloved).

Okay, Event Loop. This is our main character. It has one simple job: **control the stack and the queue**.

We have three simple segments:

1. Call Stack
2. Web APIs
3. Task Queue

Synchronous functions work on the **Call Stack**.

When we do something like a network request or a `setTimeout`, the Call Stack pushes this operation to the **Web API** and continues its business.

When the Web API finishes the request or the timeout operation, it pushes the result into the **Task Queue**.

The Event Loop constantly checks: “Is the Call Stack empty?” If yes, it picks the oldest task from the Task Queue and pushes it onto the stack to execute.

Now about **Task Queue types**:

### Microtask Queue vs. Macrotask Queue

The Task Queue is actually split into two:

* **Microtask Queue** (higher priority)

  * `.then()`, `.catch()`, `.finally()`
  * `queueMicrotask()`
  * `MutationObserver`
  * `process.nextTick()` (Node.js)

* **Macrotask Queue**

  * `setTimeout`, `setInterval`
  * Event listeners
  * Network callbacks
  * `requestAnimationFrame`

### Example Code:

```js
function main() {
    console.log("1");
    setTimeout(() => console.log("2"), 0);
    Promise.resolve().then(() => console.log("3"));
    console.log("4");
}
main();
```

**Expected Output:** `1, 4, 3, 2`

Explanation:

1. `1` is logged
2. `setTimeout(..., 0)` is pushed to Web API
3. `.then(...)` is pushed to **Microtask Queue**
4. `4` is logged
5. Call Stack is empty → Microtasks first → `3`
6. Then Macrotasks → `2`

### Microtasks Can Freeze UI

```js
function processData(items) {
    let result = [];

    return items.reduce((promise, item) => {
        return promise.then(() => {
            return expensiveOperation(item);
        }).then(data => {
            result.push(data);
            updateProgressUI(result.length / items.length);
            return result;
        });
    }, Promise.resolve());
}

processData(Array(1000).fill('item'));
```

This creates a chain of 2000 microtasks, which blocks rendering until all of them complete.
As a result, the UI freezes and progress updates won’t be visible until everything finishes.
This is called **JANK**.

### Better Approach: Yield with Macrotasks

```js
async function processData(items) {
    let result = [];

    for (let i = 0; i < items.length; i++) {
        if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
            updateProgressUI(i / items.length);
        }

        const data = await expensiveOperation(items[i]);
        result.push(data);
    }

    return result;
}
```

This version periodically yields to the macrotask queue, allowing rendering to occur during processing.

> *The browser ideally wants to render every 16ms (\~60fps). If a macro or microtask blocks longer than this, frames are dropped.*

## Error Handling

```js
try {
    Promise.resolve().then(() => {
        throw new Error("Oops!");
    });
} catch (err) {
    console.log("Caught:", err); // ❌ Won’t catch!
}
```

> The error will be reported as an unhandled promise rejection.

### Correct approach:

```js
Promise.resolve()
    .then(() => { throw new Error("Oops!"); })
    .catch(err => console.log("Caught:", err)); // ✅ Works
```

### Why?

Because `try/catch` works for synchronous code. Promises operate asynchronously, and their errors are handled via `.catch()` (or `try/catch` inside an `async` function).

## Animation and Browser Rendering

> JavaScript execution timing affects rendering.

**Rendering pipeline (target 60fps):**

1. Run JS
2. Calculate Styles
3. Layout
4. Paint
5. Composite (display)

### Use the right tools:

```js
// Expensive task — may delay rendering
setTimeout(() => {
    expensiveOperation();
}, 0);

// Best for smooth animation
requestAnimationFrame(() => {
    updateAnimation();
});

// Run during browser idle time
requestIdleCallback(() => {
    analytics.send();
});
```

## Advanced Patterns

> This section is called “Advanced JS” — but I prefer to name it: “Bunu cixardanin ***”.

---

### Pitfall 1: Blocking the Main Thread

```js
// ❌ DON'T
function calculateInBrowser() {
    const result = [];
    for (let i = 0; i < 10000000; i++) {
        result.push(heavyCalculation(i));
    }
    return result;
}
```

```js
// ✅ DO
async function calculateInChunks() {
    const result = [];
    const CHUNK_SIZE = 1000;

    for (let i = 0; i < 10000000; i += CHUNK_SIZE) {
        await new Promise(resolve => setTimeout(resolve, 0));
        for (let j = i; j < Math.min(i + CHUNK_SIZE, 10000000); j++) {
            result.push(heavyCalculation(j));
        }
    }
    return result;
}
```

### Pitfall 2: Infinite Microtask Loop

```js
// ❌ DON'T
function hangBrowser() {
    Promise.resolve().then(() => hangBrowser());
}
```

### Pitfall 3: Nested setTimeout for Animation

```js
// ❌ DON'T
function animateWithTimeout() {
    moveElement();
    setTimeout(animateWithTimeout, 16); // ~60fps
}
```

```js
// ✅ DO
function animateWithRAF() {
    moveElement();
    requestAnimationFrame(animateWithRAF);
}
```

### Pitfall 4: Promise vs. setTimeout Confusion

```js
// ❌ DON'T
let ready = false;

Promise.resolve().then(() => {
    ready = true;
});

setTimeout(() => {
    console.log(ready); // false
}, 0);
```

```js
// ✅ DO
Promise.resolve()
    .then(() => {
        ready = true;
    })
    .then(() => {
        console.log(ready); // true
    });
```

### Pitfall 5: Sync XHR (Legacy)

```js
// ❌ DON'T
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data', false); // Synchronous!
xhr.send();
```

```js
// ✅ DO
fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        // Process data
    });
```

> In summary, ignoring task priorities, chunking, or microtask draining can freeze your UI. Be smart. Respect the loop.
