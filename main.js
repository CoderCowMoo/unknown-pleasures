// @ts-check

import { createProceduralRenderer } from "./renderers/procedural.js";
import { createAudioVisualRenderer } from "./renderers/audiovis.js";
import { proceduralDefinition } from "./renderers/render_settings/proceduralsettings.js";
import { audiovisDefinition } from "./renderers/render_settings/audiovissettings.js";
import { setupGlobalControls, setupRendererControls, setupRendererRadio } from "./controls.js";


// https://stackoverflow.com/questions/63970910/vscode-intellisense-for-javascript-not-working-for-canvas-element
const canvas = document.getElementById('album_canvas');
if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Could not find #album_canvas");
}

const ctx = canvas.getContext("2d");
if (ctx === null) {
    throw new Error("Could not create 2D canvas context");
}

/**
 * @param {string} id
 * @param {number} value
 */
function setRangeValue(id, value) {
    const input = document.getElementById(id);
    
    if (!(input instanceof HTMLInputElement)) {
        throw new Error(`Couldn't find range input #${id}`);
    }

    input.valueAsNumber = value;
    input.dispatchEvent(new Event("input", {bubbles: true}));
}

ctx.imageSmoothingEnabled = true;

// ----------- INITIALISATION
// fill canvas with black
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// ----------- RENDERER INIT
// @ts-ignore
/**
 * @type {{ settingsChanged: function; initialise: function; render: function; destroy: function; }}
 */
let activeRenderer;

// @ts-ignore
const notifySettingsChange = ({scope, id}) => {
    activeRenderer?.settingsChanged(scope, id);
}

const globalSettings = setupGlobalControls(notifySettingsChange);

let rendererSettings = setupRendererControls(
    proceduralDefinition.controls,
    notifySettingsChange
);

// setup the procedural renderer by default
activeRenderer = createProceduralRenderer(
    canvas,
    globalSettings,
    // @ts-ignore
    rendererSettings
)

activeRenderer.initialise();

// attach the listener to the renderer radio.
const rendererRadioDiv = document.getElementById("rendererSelection");
if (!(rendererRadioDiv instanceof HTMLDivElement)) {
    throw new Error("rendererSelection div not access properly. for some reason.");
}
// i Keep fricking trying to think of the best abstraction to make it all easy
// I need to just crack on.
rendererRadioDiv.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
        throw new Error("There's something other than a radio input\
             that send a change event in rendererSelection, check ts out");
    }

    activeRenderer?.destroy?.();

    // change line count and animationfps to better default
    setRangeValue("animationFps", 10);
    setRangeValue("lineCount", 80);

    if (event.target.value === "procedural") {
        
        // create rendererSettings
        rendererSettings = setupRendererControls(
            proceduralDefinition.controls,
            notifySettingsChange,
            // we don't need to do anything here.
            () => {return;}
        );

        // setup the procedural renderer by default
        activeRenderer = createProceduralRenderer(
            canvas,
            globalSettings,
            // @ts-ignore
            rendererSettings
        );

        activeRenderer.initialise();
    }
    else if (event.target.value === "audio") {
        
        rendererSettings = setupRendererControls(
            audiovisDefinition.controls,
            notifySettingsChange
        );
        
        // change line count and animationfps to better default
        setRangeValue("animationFps", 60);
        setRangeValue("lineCount", 20);

        activeRenderer = createAudioVisualRenderer(
            canvas,
            globalSettings,
            rendererSettings
        );

        activeRenderer.initialise();
    }
});

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

    activeRenderer.render(timestamp);

    lastTime = timestamp - (elapsed % fpsInterval);
}

requestAnimationFrame(render);
