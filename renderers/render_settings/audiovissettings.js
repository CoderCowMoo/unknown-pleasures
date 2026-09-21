export const audiovisDefinition = {
    id: "audiovis",
    label: "Audio Visualisation",

    // a list of controls for the audiovis.
    controls: [
        {
            id: "FFTTest",
            label: "Test range (probs FFT rel): ",
            type: "range",
            defaultValue: "20",
            min: "0",
            max: "100"
        }
    ]
}