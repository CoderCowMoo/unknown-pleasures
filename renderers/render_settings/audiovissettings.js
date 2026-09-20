export const audiovisDefinition = {
    id: "audiovis",
    label: "Audio Visualisation",

    // a list of controls for the audiovis.
    controls: [
        {
            id: "Testing ts",
            label: "Testing the settings changing.",
            type: "text",
            // lets see if SHTF if no min, max, step exist
            defaultValue: "Test worked!!!!"
        },
        {
            id: "mic_button",
            label: "Microphone: ",
            type: "button",
            defaultValue: "Start listening"
        }
    ]
}