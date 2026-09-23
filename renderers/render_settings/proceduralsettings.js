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
    ]
}