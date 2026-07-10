module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-ble-plx|react-native-geolocation-service|react-native-sensors|react-native-sound|react-native-wifi-reborn|@react-native-async-storage)/)',
  ],
};
