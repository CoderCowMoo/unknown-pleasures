/** 
 * @typedef {Object} GlobalSettings
 * @property {number} animationFps
 * @property {number} lineCount 
 */

/**
 * 
 * @typedef {Object} RenderControl
 * @property {string} id
 * @property {string} label 
 * @property {string} type
 * @property {number} min
 * @property {number} max
 * @property {number} step
 * @property {number} defaultValue
 */

/** @param {RenderControl[]} controls */
function generateHTMLSettings(controls) {
    // first grab the rendererSettings div
    const container = document.querySelector("div.rendererSettings");
    if (!(container instanceof HTMLDivElement)) {
        throw new Error("Couldn't find the div.rendererSettings element.");
    }

    // add to this instead of DOM and then add this to container at the end.
    const tree = document.createDocumentFragment();

    for (const control of controls) {
        // add the label. how you may ask?
        // https://stackoverflow.com/questions/5536596/dynamically-creating-html-elements-using-javascript
        const label = document.createElement("label");
        label.setAttribute("for", control.id);
        // https://stackoverflow.com/questions/35213147/difference-between-textcontent-vs-innertext
        // https://kellegous.com/j/2013/02/27/innertext-vs-textcontent/
        label.textContent = control.label;
        tree.appendChild(label);

        const input = document.createElement("input");
        input.setAttribute("type", control.type);
        input.setAttribute("id", control.id);
        input.setAttribute("min", control.min);
        input.setAttribute("max", control.max);
        input.setAttribute("step", control.step);
        input.setAttribute("value", control.defaultValue);
        tree.appendChild(input);

        // only add a value span afterwards if its a slider
        if (control.type == "range") {
            const value = document.createElement("span");
            value.className = "sliderValue";
            value.textContent = control.defaultValue.toString();
            tree.appendChild(value);
        }

        tree.append(document.createElement("br"));
    }

    container.replaceChildren(tree);
}




export function setupControls(rendererControls, onChange) {
    // generate the html
    generateHTMLSettings(rendererControls);

    // now bind the inputs after this function.
    function bindInputs(selector, target, scope) {
        const inputs = document.querySelectorAll(
            `${selector} input[type="range"]`
        );

        for (const element of inputs) {
            // skip the labels or whatever have you
            if (!(element instanceof HTMLInputElement)) {
                continue;
            }
            
            target[element.id] = element.valueAsNumber;

            // if it changes, change the label next to it.
            element.addEventListener("input", () => {
                target[element.id] = element.valueAsNumber;
                element.nextElementSibling.textContent = element.value;

                onChange({
                    scope,
                    id: element.id,
                    value: element.valueAsNumber
                });
            })
        }
    }

    /** @type {GlobalSettings} */
    const globalSettings = {};

    /** @type {Record<string, number>} */
    const rendererSettings = {};

    bindInputs(".globalSettings", globalSettings, "global");
    bindInputs(".rendererSettings", rendererSettings, "renderer");

    return {
        globalSettings,
        rendererSettings
    };
}

export function setupRendererRadio() {

}