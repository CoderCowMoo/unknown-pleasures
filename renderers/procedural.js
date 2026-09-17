// @ts-check
import {gaussianRandom, peak, perlin1D} from '../util/maths.js';

/**
 * @typedef {Object} ProceduralSettings
 * @property {number} peakOneCenter
 * @property {number} peakOneCenterDeviation
 * @property {number} peakOneWidth
 * @property {number} peakOneWidthDeviation
 * @property {number} peakOneHeight
 * @property {number} peakOneHeightDeviation
 * @property {number} peakTwoCenter
 * @property {number} peakTwoCenterDeviation
 * @property {number} peakTwoWidth
 * @property {number} peakTwoWidthDeviation
 * @property {number} peakTwoHeight
 * @property {number} peakTwoHeightDeviation
 * @property {number} noiseStrength
 */

/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {import('../controls.js').GlobalSettings} globalSettings
 * @param {ProceduralSettings} rendererSettings
 */
export function createProceduralRenderer(canvas, globalSettings, rendererSettings) {
    const possibleContext = canvas.getContext("2d");
    if (possibleContext === null) {
        throw new Error("Could not create procedural renderer context");
    }

    const ctx = possibleContext;

    /**
     * @type {{peakOne: {center: number; width: number; height: number}; peakTwo: {center: number; width: number; height: number}}[]}
     */
    let lines = [];

    function generateLines() {
        lines = Array.from({ length: globalSettings.lineCount }, () => ({
            peakOne: {
                center: gaussianRandom(rendererSettings.peakOneCenter, rendererSettings.peakOneCenterDeviation),
                width: gaussianRandom(rendererSettings.peakOneWidth, rendererSettings.peakOneWidthDeviation),
                height: gaussianRandom(rendererSettings.peakOneHeight, rendererSettings.peakOneHeightDeviation)
            },
            peakTwo: {
                center: gaussianRandom(rendererSettings.peakTwoCenter, rendererSettings.peakTwoCenterDeviation),
                width: gaussianRandom(rendererSettings.peakTwoWidth, rendererSettings.peakTwoWidthDeviation),
                height: gaussianRandom(rendererSettings.peakTwoHeight, rendererSettings.peakTwoHeightDeviation)
            },

        }));
    }

    function initialise() {
        // calculate the peaks before rendering.
        generateLines();
    }

    function render() {
        // clear screen
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw the lines
        for (let i = 0; i < globalSettings.lineCount; i++) {
            // starting x is obviously 0, and ending x is canvas.width?
            // convert a range of [0,30], to [canvas.height * 0.2, canvas.height * 0.8]
            let y = (i / globalSettings.lineCount) * (canvas.height * 0.85 - canvas.height * 0.15) + (canvas.height * 0.15);
            
            // let's find out if I done goofed. YAYYYYY AMAZING
            // now we need to work on drawing pixels from a line buffer.
            // https://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
            // amazing analysis here, but wow fill rect is faster than image data 1x1 applied multiple times. A smart man would 
            // be able to use image data easily, for the entire thing, but that man is not me.
            // line_data will be an array of how many pixels up from y = 0, (or y = y) the line will be
            
            const perlin_noise_1d = perlin1D(canvas);
            const line = lines[i]
            
            let lineData = Array.from({length: canvas.width}, (_, x) => {
                const firstPeak = peak(
                    x,
                    line.peakOne.center,
                    line.peakOne.width,
                    line.peakOne.height
                );
                const secondPeak = peak(
                    x,
                    line.peakTwo.center,
                    line.peakTwo.width,
                    line.peakTwo.height
                );
                return -firstPeak -secondPeak + rendererSettings.noiseStrength * perlin_noise_1d[x];
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
    }

    /**
     * 
     * @param {*} scope 
     * @param {string} id 
     */
    function settingsChanged(scope, id) {
        if (scope === "renderer" || id === "lineCount") {
            generateLines();
        }
    }

    return {
        initialise,
        render,
        settingsChanged
    };
}
