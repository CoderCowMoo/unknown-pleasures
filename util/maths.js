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