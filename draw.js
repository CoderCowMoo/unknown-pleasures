// https://stackoverflow.com/questions/63970910/vscode-intellisense-for-javascript-not-working-for-canvas-element
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('album_canvas');
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

// it looks sorta like a collection of normal distributions. That could be a good
// initial approximation? Maybe add some noise?
// stack overflow amazing copy pasting thanks. Not sarcastic, very thankful for so much info.
// Source - https://stackoverflow.com/a/36481059
// Posted by Maxwell Collard, modified by community. See post 'Timeline' for change history
// Retrieved 2026-09-13, License - CC BY-SA 4.0

// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}


// ----------- INITIALISATION
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// lets draw 30 lines right now
for (let i = 0; i < 30; i++) {
    // starting x is obviously 0, and ending x is canvas.width?
    // convert a range of [0,30], to [canvas.height * 0.2, canvas.height * 0.8]
    let y = (i / 30) * (canvas.height * 0.8 - canvas.height * 0.2) + (canvas.height * 0.2);

    // let's find out if I done goofed.
    ctx.beginPath();
    ctx.strokeStyle = "white"
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
}