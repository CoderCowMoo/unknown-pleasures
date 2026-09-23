// @ts-check

/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {import('../controls.js').GlobalSettings} globalSettings
 * @param {Record<string, number>} rendererSettings
 */
export function createAudioVisualRenderer(canvas, globalSettings, rendererSettings) {

    const startX = canvas.width / 10;
    const endX = canvas.width / 10 * 9;
    
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
  * @type {AnalyserNode | null}
 */
let analyser = null;



const possibleContext = canvas.getContext("2d");
if (possibleContext === null) {
    throw new Error("Could not create procedural renderer context");
}
const ctx = possibleContext;

/** @type {Uint8Array | null} */
let dataArray = null;

    /**
     * @type {number[][]}
     */
    let lines = [];

    function generateLines() {
        lines = Array.from({ length: globalSettings.lineCount }, () => {
            return Array.from({ length: canvas.width }, () => 0);
        })
    }

    async function initialise() {
        generateLines();

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

        dataArray = new Uint8Array(analyser.frequencyBinCount)

    }


    /**
     * @type {number | null}
     */
    let previousTimeStamp = null;
    let scrollCarry = 0;

    /**
     * @param {number} timestamp
     */
    function render(timestamp) {

        // clear screen
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // antinull field
        if (analyser === null || dataArray === null) {
            return;
        }

        // calc the delta
        if (previousTimeStamp === null) {
            previousTimeStamp = timestamp;
        }
        
        const deltaSeconds = (timestamp - previousTimeStamp) / 1000;
        previousTimeStamp = timestamp;

        const exactMovement = rendererSettings.scrollSpeed * deltaSeconds + scrollCarry;
        const scrollPixels = Math.floor(exactMovement);

        scrollCarry = exactMovement - scrollPixels;
        // interesting data is only in the first half of dataArray.
        // @ts-ignore
        analyser.getByteFrequencyData(dataArray);
        
        // let's shift the data in the lines by 1 to the left.
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            line.copyWithin(startX, startX + scrollPixels, endX);
        }

        // now we'll assign the frequencies to the end of each line.
        let downSample = Array.from({length: globalSettings.lineCount}, () => 0);
        //      we want to downsample from analyser.freqbincount to linecount
        const pointsPer = Math.trunc((dataArray.length - 300) / globalSettings.lineCount);
        let currPoints = 0;
        let currIndex = 0;
        for (let i = 0; i < (dataArray.length - 300); i++) {
            if (currPoints == pointsPer) {
                // avg
                downSample[currIndex] /= pointsPer;
                currIndex++;
                currPoints = 0;
            }
            // sum
            downSample[currIndex] += dataArray[i];
            currPoints++;
        }

        for (let i = 0; i < lines.length; i++) {
            lines[i].fill(downSample[i], endX - scrollPixels, endX);
        }


        // draw the lines
        for (let i = 0; i < globalSettings.lineCount; i++) {
            // starting x is obviously 0, and ending x is canvas.width
            // convert a range of [0,30], to [canvas.height * 0.2, canvas.height * 0.8]
            let y = (i / globalSettings.lineCount) * (canvas.height * 0.85 - canvas.height * 0.15) + (canvas.height * 0.15);
            
            const line = lines[i]
            
            // ok we need to downsample 1024 signal points into endX points.
            // we can do that by averaging the result into each point.
            // NEVERMIND BECAUSE MOST OF THE TIME ENDX IS 1080 WHICH IS MORE!!!!
            // ok we'll just use the 1024 ig.

            // first black mask underneath curve. thanks GPT-5.6 Sol (Medium)
            ctx.beginPath();
            ctx.moveTo(startX, y + line[startX]);
            
            for (let x = startX + 1; x < endX; x++) {
                ctx.lineTo(x, y + line[x]);
            }

            ctx.lineTo(endX, canvas.height);
            ctx.lineTo(startX, canvas.height);
            ctx.closePath();

            ctx.fillStyle = "black";
            ctx.fill();

            // now we can draw an antialiased curve.
            ctx.beginPath();
            ctx.moveTo(startX, y + line[startX]);
            for (let j = startX + 1; j < endX; j++) {
                let yval = line[j];
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
            if (id === "scrollSpeed") {
                return;
            }
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
