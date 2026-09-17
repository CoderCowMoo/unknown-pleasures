// @ts-check

import { createProceduralRenderer } from "./renderers/procedural.js";
import { setupControls } from "./controls.js";


// https://stackoverflow.com/questions/63970910/vscode-intellisense-for-javascript-not-working-for-canvas-element
const canvas = document.getElementById('album_canvas');
if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Could not find #album_canvas");
}

const ctx = canvas.getContext("2d");
if (ctx === null) {
    throw new Error("Could not create 2D canvas context");
}

ctx.imageSmoothingEnabled = true;

// ----------- INITIALISATION
// fill canvas with black
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// ----------- RENDERER INIT
// @ts-ignore
/**
 * @type {{ settingsChanged: function; initialise: function; render: function; }}
 */
let activeRenderer;

const {
    globalSettings,
    rendererSettings
    // @ts-ignore
} = setupControls(({scope, id}) => {
    activeRenderer?.settingsChanged(scope, id);
});

// setup the procedural renderer by default
activeRenderer = createProceduralRenderer(
    canvas,
    globalSettings,
    // @ts-ignore
    rendererSettings
)

activeRenderer.initialise();

// ----------- DRAWING
let lastTime = 0;
/**
 * @param {DOMHighResTimeStamp} timestamp
 */
function render(timestamp) {
    // schedule before everything
    requestAnimationFrame(render);

    const fps = globalSettings.animationFps;
    const fpsInterval = 1000 / fps;
    const elapsed = timestamp - lastTime;
    if (elapsed <= fpsInterval) {
        return;
    }
    // forgot where this needs to go.

    activeRenderer.render();

    lastTime = timestamp - (elapsed % fpsInterval);
}

requestAnimationFrame(render);
