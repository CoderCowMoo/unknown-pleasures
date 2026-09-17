// @ts-check
// Standard Normal variate using Box-Muller transform.
// Source - https://stackoverflow.com/a/36481059
// Posted by Maxwell Collard, modified by community. See post 'Timeline' for change history
// Retrieved 2026-09-13, License - CC BY-SA 4.0
export function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

/**
 * @param {number} x
 */
export function clamp(x, lower=0.0, upper=1.0) {
    if (x < lower) {return lower;}
    if (x > upper) {return upper;}
    return x;
}

// defualt to zero and one left and right edges.
// https://en.wikipedia.org/wiki/Smoothstep
/**
 * @param {number} x
 */
export function smoothStep(x) {
    x = clamp(x);
    // 3x^2 - 2x^3
    return x * x * (3.0 - 2.0 * x);
}

/**
 * 
 * @param {number} x 
 * @param {number} center 
 * @param {number} width 
 * @param {number} height 
 * @returns {number}
 */
export function peak(x, center, width, height) {
    const distance = (x - center) / width;
    // distance:   -3    -2    -1     0     1     2     3
    // result:    .01   .14   .61    1.0   .61   .14   .01
    return height * Math.exp(-0.5 * Math.pow(distance, 2))
}

// lets get perlin noise
// https://en.wikipedia.org/wiki/Perlin_noise#Algorithm_detail
/**
 * @param {HTMLCanvasElement} canvas
 * @returns Array
 */
export function perlin1D(canvas) {
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