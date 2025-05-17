
Minor Note:  Download better comments for the best view.  
Minor Note 2: This article consists of multiple parts. I’ll add the other parts here, or pimp the code files. 😎  
Source: Medium – "JavaScript’s Event Loop Visualized: What’s Really Happening When Your Code Runs"  
I paid $5 for this fucking article.


# Introduction

```js
console.log("First");
fetch('https://cors-anywhere.herokuapp.com/https://api.hedef.com/data')
  .then(res => console.log("Second"));
console.log("Third");
```
// Output: First, Third, Second
The biggest misconception about JS is that it executes code strictly line by line. Nah, bra. JS uses a LIFO (Last In, First Out) call stack—functions are pushed and popped.
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
printSquare(5); // 25
```
Call Stack Trace

Initially: []

After printSquare(5): [printSquare]

After square(5): [printSquare, square]

After multiply(5,5): [printSquare, square, multiply]

Then it unwinds back to [].

What about asynchronous operations? JS can’t do network requests, timers or file I/O by itself—your environment (Node.js, my lover) provides that. Enter the Event Loop: it controls the stack and queues.

We have three segments:

Call Stack (synchronous code)

Web APIs (timers, fetch, DOM events)

Task Queues

Microtask Queue (Promise callbacks, queueMicrotask, MutationObserver)

Macrotask Queue (setTimeout, setInterval, I/O, UI events)

When the stack is empty, the event loop:

Drains all microtasks

Renders (if needed)

Executes the next macrotask

### Repeat

```js
function main() {
  console.log("1");                               // Task 1
  setTimeout(() => console.log("2"), 0);          // Task 2 (macrotask)
  Promise.resolve().then(() => console.log("3"));// Task 3 (microtask)
  console.log("4");                               // Task 4
}
main();
// Final output: 1, 4, 3, 2
```
######  Between microtasks, the browser won’t render. If you chain tons of microtasks, you’ll block rendering—this chaos is called JANK.


