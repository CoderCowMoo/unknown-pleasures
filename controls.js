// ---------- SLIDERS (GPT-5.6 Sol (Medium))
const sliderInputs = document.querySelectorAll(
    ".sliders input[type='range']"
);

/** 
 * @typedef {Object} GlobalSettings
 * @property {number} animationFps
 * @property {number} lineCount 
 */


export function setupControls(onChange) {
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