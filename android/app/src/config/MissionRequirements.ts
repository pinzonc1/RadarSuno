export const MissionRequirements = {

  app: {
    name: "RADARSURO",
    version: "1.0.0",
    platform: "Android",
  },

  permissions: {
    bluetooth: true,
    bluetoothScan: true,
    bluetoothConnect: true,
    bluetoothAdvertise: true,

    fineLocation: true,
    coarseLocation: true,
    backgroundLocation: true,

    camera: true,
    microphone: true,

    storage: true,

    contacts: true,
    phone: true,

    vibration: true,
    internet: true,

    notifications: true,
  },

  sensors: {
    gps: true,
    accelerometer: true,
    compass: true,
    gyroscope: true,
  },

  connectivity: {
    bluetooth: true,
    wifi: true,
    internet: true,
  },

  mission: {
    requireBluetoothEnabled: true,
    requireGPSEnabled: true,
    requireWifiEnabled: true,
    requireInternet: false,

    saveHistory: true,
    savePhotos: true,
    saveAudio: false,

    vibrationAlerts: true,
    audioAlerts: true,

    autoStartScan: true,
    autoReconnect: true,
  }

};
