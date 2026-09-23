export const audiovisDefinition = {
    id: "audiovis",
    label: "Audio Visualisation",

    // a list of controls for the audiovis.
    controls: [
        {
            id: "scrollSpeed",
            label: "Scroll speed (px per second): ",
            type: "range",
            defaultValue: "80",
            min: "3",
            max: "100"
        }
    ]
}