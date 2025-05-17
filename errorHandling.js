/*  
? Error Handling Timing
? Errors in promises and async functions aren’t caught by surrounding try/catch blocks 
? if they’re executed as microtasks after the synchronous code completes
? Lets analyse 2 code block 
*/
try {
    Promise.resolve().then(() => {
        throw new Error("Oops!");
    });
} catch (err) {
    console.log("Caught:", err);  //! This will never execute!
}

//! The error will be reported as an unhandled promise rejection
//* Correct approach:

Promise.resolve().then(() => {
    throw new Error("Oops!");
}).catch(err => {
    console.log("Caught:", err);  //* This works
});
/*

Okay my friend . Try catch blocks only working for synchronus . 
This catching error which throwed from same line . 
Because throwing in same time from call stack
But promise.then callbackes working after like microtask
In other words, the try catch block is usually for sync operations.
 If we try to catch a promise error in the catch block, this does not work because, 
 while the try catch is looking at the error thrown on the stack at that moment,
  the promise has put its own error on hold as a task queue microtask.
   If we want to catch the error, we can use the promise's own catch because the microtask also waits and is then thrown on the stack and executed.
    If we are going to catch it with a try catch, we use a try catch inside the asynchronous function.
     Because it does not run immediately on the stack, it has a queue and waits for that queue. 

!Microtasks (Highest Priority)
*Promise callbacks (.then(), .catch(), .finally())
*queueMicrotask() callbacks
*MutationObserver callbacks
*process.nextTick() in Node.js (which actually runs before other microtasks)
!Tasks (Normal Priority)
*setTimeout and setInterval callbacks
*Event listeners (click, keydown, etc.)
*XHR and fetch callbacks (when network responses return)
*requestAnimationFrame callbacks (runs before rendering)
!Special Browser Tasks (Between Frames)
*IntersectionObserver callbacks
*requestIdleCallback (lowest priority, runs during browser idle time)
*/

