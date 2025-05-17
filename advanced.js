//* developers named this section "Advanced JS" but i named "Bunu cixardanin var yoxunu sikim" section.
// Common Event Loop Pitfalls and How to Avoid Them
// Even with a good understanding of the event loop, there are common mistakes developers make:

// Pitfall 1: Blocking the Main Thread
// DON'T: This blocks the main thread
function calculateInBrowser() {
    const result = [];
    for (let i = 0; i < 10000000; i++) {
        result.push(heavyCalculation(i));
    }
    return result;
}

// DO: Break up heavy work
async function calculateInChunks() {
    const result = [];
    const CHUNK_SIZE = 1000;
    
    for (let i = 0; i < 10000000; i += CHUNK_SIZE) {
        // Process in chunks, yielding to the event loop between chunks
        await new Promise(resolve => setTimeout(resolve, 0));
        
        for (let j = i; j < Math.min(i + CHUNK_SIZE, 10000000); j++) {
            result.push(heavyCalculation(j));
        }
    }
    
    return result;
}
// Pitfall 2: Infinite Microtask Loops
// DON'T: This will hang the browser by creating an infinite microtask loop
function hangBrowser() {
    Promise.resolve().then(() => hangBrowser());
}

// This is equivalent to an infinite loop in synchronous code
// Pitfall 3: Nested setTimeout for Animation
// DON'T: Animation timing will be inconsistent
function animateWithTimeout() {
    moveElement();
    setTimeout(animateWithTimeout, 16); // ~60fps
}

// DO: Use requestAnimationFrame for smooth animation
function animateWithRAF() {
    moveElement();
    requestAnimationFrame(animateWithRAF);
}
// Pitfall 4: Promise vs. setTimeout Confusion
// DON'T: This won't work as expected due to microtask vs. task timing
let ready = false;

Promise.resolve().then(() => {
    ready = true;
});

setTimeout(() => {
    console.log(ready); // Incorrectly assumes this will log true
}, 0);

// DO: Keep dependent operations in the same queue type
Promise.resolve().then(() => {
    ready = true;
}).then(() => {
    console.log(ready); // Correctly logs true
});
// Pitfall 5: Sync XHR (Still Exists in Some Code)
// DON'T: This blocks the main thread
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data', false); // Synchronous!
xhr.send();
// Browser is completely frozen until response arrives

// DO: Always use async requests
fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        // Process data here
    });

//* In summary, 
//! if you do not take into account some processes, 
//! if you do not care about the chunk, 
//! you will freeze the UI and consume the GPU. 
//? Sometimes, dividing the work into parts and creating a macrotask to take a break 
//? and allow rendering can be a good solution.
