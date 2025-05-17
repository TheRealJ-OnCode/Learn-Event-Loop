
/*
 ! Minor Not : DowNload better comments , for best view / (..)
 ! Minor Not 2 : This articles cosisting 2 or many parts . I will add other parts to there , or check code files PIMP. :)
 * --- Sources ----
 * medium => "JavaScript’s Event Loop Visualized: What’s Really Happening When Your Code Runs"
 ! Minor minor not 1 : i paid 5$ for this fucking article.
*/
// ! Introduction

// * <==== Code ====>
// console.log("First");
// fetch('https://cors-anywhere.herokuapp.com/https://api.hedef.com/data').then(res=>console.log("Second"));
// console.log("Third")
// * <==== Code Ended ====>


/* 
 * Output For This Code : First ,  Third , Second
 * The biggest most conception about JS is this . JS executing code line by line . Nah bra . 
 ? JS use LIFO. (Last in First Out).the most recently added function is the first to be completed....
 ! okay lets code this.
 */

// * <==== Code ====>
function multiply(a, b) {
    return a * b
}
function square(n) {
    return multiply(n, n)
}
function printSquare(n) {
    const result = square(n);
    console.log(result)
}
printSquare(5)
// * <==== Code Ended ====>

/*
 * Of course our output is 25 as we expected. But that is not our concern .
! Initially: []
! After calling printSquare(5): [printSquare]
! After calling square(5): [printSquare, square]
! After calling multiply(5, 5): [printSquare, square, multiply]
! After multiply completes: [printSquare, square]
! After square completes: [printSquare]
! After console.log executes: [printSquare]
! After printSquare completes: []
*/

/*
? What about asynchronous operations ?
* JS can't make network requests , set timers or read files by itself. These capabilities providing by environment which JS working on it --- Node JS (MY lover)
Okay Event Loop . This is oru main character . They have one simple job . Control the stack and queue . Lets clarify this for you .


We have 3 simple segment. Call stack , web apis and task queue . 

syncrhonus functions working on call stack .
   But when we doing network request or settimeout , call stack kicks this operation on wep api 
   and continune it own bussiness. When web api finish it request or timeout operation ,
   they kick answer or output to task queue . 
   Event loop looks ,"Hmm call stack is empty. lets look task queue. AA there is not empty. " Event loop pick thisi response from task queue and kick to call stack , 
   call stack execute this and code finish.
   
   We talked about task queue . The task queue is divided into 2 different places.Microtask queue and macrotaskqueue. Work priority is in micro task.

   Lets coded this :
*/

// * <==== Code ====>
function main() {
    console.log("1");                               // Task 1
    setTimeout(() => console.log("2"), 0);          // Task 2
    Promise.resolve().then(() => console.log("3")); // Task 3
    console.log("4");                               // Task 4
}

main();
// * <==== Code Ended ====>


// Initial State
// Call Stack: []
// Microtask Queue: []
// Task Queue: []
// After calling main()
// Call Stack: [main]
// Microtask Queue: []
// Task Queue: []
// After executing console.log(“1”)
// Call Stack: [main]
// Microtask Queue: []
// Task Queue: []
// Console Output: 1
// After executing setTimeout(…)
// Call Stack: [main]
// Microtask Queue: []
// Task Queue: [() => console.log("2")]  // Added by Web API after 0ms
// Console Output: 1
// After executing Promise.resolve().then(…)
// Call Stack: [main]
// Microtask Queue: [() => console.log("3")]  // Promises go to microtask queue
// Task Queue: [() => console.log("2")]
// Console Output: 1
// After executing console.log(“4”)
// Call Stack: [main]
// Microtask Queue: [() => console.log("3")]
// Task Queue: [() => console.log("2")]
// Console Output: 1, 4
// After main() completes (call stack is now empty)
// Call Stack: []
// Microtask Queue: [() => console.log("3")]
// Task Queue: [() => console.log("2")]
// Console Output: 1, 4
// Event Loop checks: Call stack is empty, so process microtasks first
// Call Stack: [() => console.log("3")]
// Microtask Queue: []
// Task Queue: [() => console.log("2")]
// Console Output: 1, 4
// After executing the microtask
// Call Stack: []
// Microtask Queue: []
// Task Queue: [() => console.log("2")]
// Console Output: 1, 4, 3
// Event Loop checks again: Process the next task from task queue
// Call Stack: [() => console.log("2")]
// Microtask Queue: []
// Task Queue: []
// Console Output: 1, 4, 3
// After executing the task
// Call Stack: []
// Microtask Queue: []
// Task Queue: []
// Console Output: 1, 4, 3, 2
// Now the final output makes sense: “1, 4, 3, 2”. The synchronous code runs first (1, 4), then the microtasks (3), and finally the regular tasks (2).
// ! The browser can render between tasks, but not between microtasks: This has important implications for UI smoothness and animations.
// * <==== Code ====>

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

// Process 1000 items
processData(Array(1000).fill('item'));
// * <==== Code Ended ====>


/*
 ! This creates a chain of 2000 microtasks that will block rendering until all are complete, 
 ! causing the UI to freeze. The progress updates won’t be visible until everything finishes.
 * And we named this chaos JANK. But what is the better approach ? Let's code 
*/
// * <==== Code ====>

 async function processData(items) {
    let result = [];
    
    for (let i = 0; i < items.length; i++) {
        if (i % 10 === 0) {
            // * Force a break in microtasks every 10 items
            await new Promise(resolve => setTimeout(resolve, 0));
            updateProgressUI(i / items.length);
        }
        
        const data = await expensiveOperation(items[i]);
        result.push(data);
    }
    
    return result;
}
// * <==== Code Ended ====>



 


/*
 ! This version periodically yields to the task queue, allowing rendering to occur during processing.
 ! Important: The browser ideally wants to render every 16 ms (≈60 fps). If a macro-task or chained microtasks exceed 16 ms, that frame will be skipped and lag will occur.
 ? Okay what second approach doing actually ? 
 * Second approach , creates macrotask each 10 microtask . They drain microtask list creates macrotask and give permission render.
 * They trying avoid JANK.




 */




