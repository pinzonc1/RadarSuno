export const MissionProfiles = {

    rescue:{

        bluetooth:true,

        wifi:true,

        gps:true,

        camera:true,

        microphone:true,

        heatMap:true

    },

    training:{

        bluetooth:true,

        wifi:false,

        gps:false,

        camera:false,

        microphone:false

    },

    testing:{

        bluetooth:true,

        gps:true,

        internet:false

    }

};

export const MissionCapabilities = {

    bluetoothScanning:true,

    wifiScanning:true,

    signalFusion:true,

    heatMap:true,

    gpsTracking:true,

    missionHistory:true,

    cameraEvidence:true,

    offlineMode:true,

    emergencyCalls:true,

    emergencyContacts:true,

    compass:true,

    vibrationAlerts:true,

    audioAlerts:true,

    teamTracking:false,

    cloudSync:false,

    audioRecording:false

};