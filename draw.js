// https://stackoverflow.com/questions/63970910/vscode-intellisense-for-javascript-not-working-for-canvas-element
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('album_canvas');
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = true;
let printonce = true;

// it looks sorta like a collection of normal distributions. That could be a good
// initial approximation? Maybe add some noise?


// ---------- MATHS FUNCTIONS

// Standard Normal variate using Box-Muller transform.
// Source - https://stackoverflow.com/a/36481059
// Posted by Maxwell Collard, modified by community. See post 'Timeline' for change history
// Retrieved 2026-09-13, License - CC BY-SA 4.0
function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

function clamp(x, lower=0.0, upper=1.0) {
    if (x < lower) {return lower;}
    if (x > upper) {return upper;}
    return x;
}

// defualt to zero and one left and right edges.
// https://en.wikipedia.org/wiki/Smoothstep
function smoothStep(x) {
    x = clamp(x);
    // 3x^2 - 2x^3
    return x * x * (3.0 - 2.0 * x);
}


// ----------- INITIALISATION
// fill canvas with black
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);


// ----------- DRAWING

// thanks to GPT-5.6 Sol (Medium)
function peak(x, center, width, height) {
    const distance = (x - center) / width;
    // distance:   -3    -2    -1     0     1     2     3
    // result:    .01   .14   .61    1.0   .61   .14   .01
    return height * Math.exp(-0.5 * Math.pow(distance, 2))
}

// lets get perlin noise
// https://en.wikipedia.org/wiki/Perlin_noise#Algorithm_detail
/**
 * @returns Array
 */
function perlin1D() {
    // KEEP IN MIND that right now, the width of the lines is NOT [0, canvas.width]
    // rather it is [1/10 canvas width, 9/10 canvas width] let's see if it makes a diff on noise
    // get gradient vectors first for how many points though?
    // let's say between 0 and canvas.width, we split it up into 14 lines?
    // arbitrary choice
    const num_grid_lines = 14
    let gradScalar = Array.from({length: num_grid_lines}, () => Math.random() * 2 - 1);
    let perlinNoise = Array(canvas.width);

    for (let i = 0; i < canvas.width; i++) {
        // for each point here, figure out which cell its in, and get offset vectors.
        // so we're converting a range of [0, canvas.width] into a range of [0, num_grid_lines]
        const gridX = i / canvas.width * num_grid_lines;
        const cellnum = Math.trunc(gridX);

        // offset vector simply reduces the noise when at the gridlines. OK.
        // should just be (cellnum + 1) - (gridX)
        const offsetVectors = [
            cellnum - (gridX),
            cellnum + 1 - (gridX)
        ];
        // then multiply (dot product) gradScalar[cellnum] * offset_vector
        // then 
        const dotProducts = [
            gradScalar[cellnum] * offsetVectors[0],
            gradScalar[cellnum + 1] * offsetVectors[1]
        ];

        // now we just interpolate between dotProducts[0] and dotProducts[1]
        // using a function with a dxdy of 0 at the grid intersections.
        perlinNoise[i] = dotProducts[0] + smoothStep(gridX - cellnum) * (dotProducts[1] - dotProducts[0]);     
    }

    return perlinNoise;
}

// lets draw 30 lines right now
let num_lines = 80;
for (let i = 0; i < num_lines; i++) {
    // starting x is obviously 0, and ending x is canvas.width?
    // convert a range of [0,30], to [canvas.height * 0.2, canvas.height * 0.8]
    let y = (i / num_lines) * (canvas.height * 0.85 - canvas.height * 0.15) + (canvas.height * 0.15);

    // let's find out if I done goofed. YAYYYYY AMAZING
    // now we need to work on drawing pixels from a line buffer.
    // https://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
    // amazing analysis here, but wow fill rect is faster than image data 1x1 applied multiple times. A smart man would 
    // be able to use image data easily, for the entire thing, but that man is not me.
    // line_data will be an array of how many pixels up from y = 0, (or y = y) the line will be
    const center = gaussianRandom(canvas.width / 5 * 2, 20);
    const center2 = gaussianRandom(canvas.width / 5 * 3, 20);
    const width = Math.max(20, gaussianRandom(60, 10));
    const width2 = clamp(gaussianRandom(60, 25), 15, 30);
    const height = Math.max(10, gaussianRandom(80, 15));
    const height2 = clamp(gaussianRandom(40, 15), 10, 90);
    const perlin_noise_1d = perlin1D();
    let lineData = Array.from({length: canvas.width}, (_, x) => {
        return -peak(x, center, width, height) 
               -peak(x, center2, width2, height2) 
               + 10 * perlin_noise_1d[x];
    });

    const startX = canvas.width / 10;
    const endX = canvas.width / 10 * 9;

    // first black mask underneath curve. thanks GPT-5.6 Sol (Medium)
    ctx.beginPath();
    ctx.moveTo(startX, y + lineData[startX]);

    for (let x = startX + 1; x < endX; x++) {
        ctx.lineTo(x, y + lineData[x]);
    }

    ctx.lineTo(endX, canvas.height);
    ctx.lineTo(startX, canvas.height);
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.fill();

    // now we can draw an antialiased curve.
    ctx.beginPath();
    ctx.moveTo(startX, y + lineData[startX]);
    for (let j = startX + 1; j < endX; j++) {
        let yval = lineData[j];
        ctx.lineTo(j, y + yval);
    }

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
}