//! These priority differences can be leveraged for optimization. For example, you can use queueMicrotask() for high-priority operations that should happen before the next render, while using requestIdleCallback() for non-urgent work that can be deferred.

//! Advanced Event Loop: Animation and Rendering Timeline
//! In browsers, there’s an additional complexity: the rendering pipeline. While not technically part of the JavaScript event loop, it interacts closely with it:

//* JavaScript Execution: Run tasks from the task queue
//* Style Calculation: Calculate which CSS rules apply to elements
//* Layout: Determine element positions and sizes
//* Paint: Draw pixels to the screen
//* Composite: Combine layers for final display
//* The browser aims to perform these steps 60 times per second (for a 60Hz display) to create smooth animations. However, if JavaScript tasks take too long, frames are dropped, causing animation jank.

//* Here’s how different APIs interact with this timeline:
//? Regular task - may delay rendering if it takes too long
setTimeout(() => {
    expensiveOperation();
}, 0);

//? Runs right before rendering, ideal for animation
requestAnimationFrame(() => {
    updateAnimation();
});

//? Runs during browser idle time, ideal for non-urgent work
requestIdleCallback(() => {
    analytics.send();
});