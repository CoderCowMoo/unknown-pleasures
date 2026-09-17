// @ts-check
import {gaussianRandom, clamp, smoothStep} from '../util/maths.js';

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

// tell others how the settings we have are defined.
export const proceduralDefinition = {
    id: "procedural",
    label: "CoderCowMoo implementation",

    // a list of controls and type of control
    controls: [
        {
            id: "peakOneCenter",
            label: "Peak one center",
            type: "range",
            min: 120,
            max: 1080,
            step: 1,
            defaultValue: 480
        },
        {
            id: "peakOneCenterDeviation",
            label: "Peak one center deviation",
            type: "range",
            min: 0,
            max: 200,
            step: 1,
            defaultValue: 20
        },
        {
            id: "peakOneWidth",
            label: "Peak one width",
            type: "range",
            min: 10,
            max: 200,
            step: 1,
            defaultValue: 60
        },
        {
            id: "peakOneWidthDeviation",
            label: "Peak one width deviation",
            type: "range",
            min: 0,
            max: 100,
            step: 1,
            defaultValue: 10
        },
        {
            id: "peakOneHeight",
            label: "Peak one height",
            type: "range",
            min: 0,
            max: 250,
            step: 1,
            defaultValue: 80
        },
        {
            id: "peakOneHeightDeviation",
            label: "Peak one height deviation",
            type: "range",
            min: 0,
            max: 100,
            step: 1,
            defaultValue: 15
        },
        {
            id: "peakTwoCenter",
            label: "Peak two center",
            type: "range",
            min: 120,
            max: 1080,
            step: 1,
            defaultValue: 720
        },
        {
            id: "peakTwoCenterDeviation",
            label: "Peak two center deviation",
            type: "range",
            min: 0,
            max: 200,
            step: 1,
            defaultValue: 20
        },
        {
            id: "peakTwoWidth",
            label: "Peak two width",
            type: "range",
            min: 10,
            max: 200,
            step: 1,
            defaultValue: 30
        },
        {
            id: "peakTwoWidthDeviation",
            label: "Peak two width deviation",
            type: "range",
            min: 0,
            max: 100,
            step: 1,
            defaultValue: 25
        },
        {
            id: "peakTwoHeight",
            label: "Peak two height",
            type: "range",
            min: 0,
            max: 250,
            step: 1,
            defaultValue: 40
        },
        {
            id: "peakTwoHeightDeviation",
            label: "Peak two height deviation",
            type: "range",
            min: 0,
            max: 100,
            step: 1,
            defaultValue: 15
        },
        {
            id: "noiseStrength",
            label: "Perlin noise strength",
            type: "range",
            min: 0,
            max: 100,
            step: 1,
            defaultValue: 4
        }
    ],

    create: createProceduralRenderer
}


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
    // thanks to GPT-5.6 Sol (Medium)
    /**
     * @param {number} x
     * @param {number} center
     * @param {number} width
     * @param {number} height
     */
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
            
            const perlin_noise_1d = perlin1D();
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
