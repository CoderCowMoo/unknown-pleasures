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


// ----------- DRAWING

// thanks to GPT-5.6 Sol (Medium)
function peak(x, center, width, height) {
    const distance = (x - center) / width;
    // distance:   -3    -2    -1     0     1     2     3
    // result:    .01   .14   .61    1.0   .61   .14   .01
    return height * Math.exp(-0.5 * Math.pow(distance, 2))
}

// lets get perlin noise
/**
 * @returns Array
 */
function perlin1D() {
    // get gradient vectors first for how many points though?
    // let's say between 0 and canvas.width, we split it up into 14 lines?
    // arbitrary choice
    const num_grid_lines = 14
    gradscalar = Array.from({length: num_grid_lines}, () => {Math.random()});

    // 
}

// lets draw 30 lines right now
let num_lines = 25;
for (let i = 0; i < num_lines; i++) {
    // starting x is obviously 0, and ending x is canvas.width?
    // convert a range of [0,30], to [canvas.height * 0.2, canvas.height * 0.8]
    let y = (i / num_lines) * (canvas.height * 0.85 - canvas.height * 0.15) + (canvas.height * 0.15);

    // let's find out if I done goofed. YAYYYYY AMAZING
    // now we need to work on drawing pixels from a line buffer.
    // https://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
    // amazing analysis here, but wow fill rect is faster than image data 1x1 and multiple times. A smart man would 
    // be able to use image data easily, for the entire thing, but that man is not me.
    // line_data will be an array of how many pixels up from y = 0, (or y = y) the line will be
    const center = gaussianRandom(canvas.width / 5 * 2, 20);
    const center2 = gaussianRandom(canvas.width / 5 * 3, 20);
    const width = Math.max(20, gaussianRandom(60, 10));
    const height = Math.max(10, gaussianRandom(80, 15));
    const perlin_noise_1d = perlin1D();
    let line_data = Array.from({length: canvas.width}, (_, x) => {
        return -peak(x, center, width, height) -peak(x, center2, width, height) + perlin_noise_1d[x];
    });

    for (let j = 0; j < canvas.width; j++) {
        let yval = line_data[j];
        ctx.fillStyle = "white";
        ctx.fillRect(j, y + yval, 1, 1);
        // fill underneath
        ctx.fillStyle = "black";
        ctx.fillRect(j, y + yval + 1, 1, canvas.height - (y + yval + 1));
    }
    

    // after each line draw black underneath. oh this wouldn't work :( need to do so under the entire vertical
    // slice.
}