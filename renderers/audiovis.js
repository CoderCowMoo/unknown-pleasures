// @ts-check

/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {import('../controls.js').GlobalSettings} globalSettings
 * @param {Record<string, number>} rendererSettings
 */
export function createAudioVisualRenderer(canvas, globalSettings, rendererSettings) {

    /**
     * @type {MediaStream | null}
     */
    let mediaStream = null;
    /**
     * @type {AudioContext | null}
     */
    let audioContext = null;
    /**
     * @type {MediaStreamAudioSourceNode | null}
     */
    let source = null;
    /**
     * @type {AudioNode | null}
     */
    let analyser = null;



    const possibleContext = canvas.getContext("2d");
    if (possibleContext === null) {
        throw new Error("Could not create procedural renderer context");
    }
    const ctx = possibleContext;
    
    /**
     * @type {number[]}
     */
    let lines = [];

    function generateLines() {
        lines = Array.from({ length: globalSettings.lineCount }, () => {
            // here is where the frequency over time data should be added
            // to the lines. I think?
            return 0;
        })
    }

    async function initialise() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
        } catch (e) {
            const errorMsg = document.createElement("div");
            errorMsg.innerText = "Couldn't read your mic mate, sorry, you musta refused the permission? Try giving the permission in your browser settings.";
            errorMsg.style.fontSize = "35";
            errorMsg.style.color = "red";
            errorMsg.style.margin = "5px";
            document.body.append(errorMsg);
            throw new Error("User refused mic perms, can't do nuthin boss");
        }

        audioContext = new AudioContext();
        await audioContext.resume();

        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);

        generateLines();
    }

    function render() {
        // clear screen
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw the lines
        for (let i = 0; i < globalSettings.lineCount; i++) {
            // starting x is obviously 0, and ending x is canvas.width
            // convert a range of [0,30], to [canvas.height * 0.2, canvas.height * 0.8]
            let y = (i / globalSettings.lineCount) * (canvas.height * 0.85 - canvas.height * 0.15) + (canvas.height * 0.15);
            
            const line = lines[i]
            
            let lineData = Array.from({length: canvas.width}, (_, x) => {
                return x / 5;
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

    async function destroy() {
        for (const track of mediaStream?.getTracks() ?? []) {
            track.stop();
        }

        source?.disconnect();
        analyser?.disconnect();

        if (audioContext?.state !== "closed") {
            await audioContext?.close();
        }

        mediaStream = null;
        source = null;
        analyser = null;
        audioContext = null;
    }

    return {
        initialise,
        render,
        settingsChanged,
        destroy
    };
}
