export const RadarConfig = {

    app: {

        scanInterval: 3000,

        maxHistory: 200,

        autoStartScan: true,

        autoReconnect: true

    },

    bluetooth: {

        minimumRSSI: -95,

        maximumRSSI: -20,

        timeout: 8000,

        scanDuration: 5000

    },

    wifi: {

        timeout: 8000,

        scanDuration: 5000

    },

    filters: {

        kalmanSamples: 5,

        averageSamples: 8

    },

    heatMap: {

        enabled: true,

        resolution: 2,

        maxPoints: 500

    },

    alerts: {

        vibrationDistance: 5,

        soundDistance: 3

    }

};