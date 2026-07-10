/* eslint-env jest */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-ble-plx', () => ({
  State: {
    PoweredOn: 'PoweredOn',
    Unsupported: 'Unsupported',
  },
  BleManager: jest.fn().mockImplementation(() => ({
    state: jest.fn(() => Promise.resolve('PoweredOn')),
    onStateChange: jest.fn(() => ({remove: jest.fn()})),
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    connectToDevice: jest.fn(),
    cancelDeviceConnection: jest.fn(),
    readRSSIForDevice: jest.fn(),
    destroy: jest.fn(),
  })),
}));

jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(() => 1),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
}));

jest.mock('react-native-sensors', () => {
  const sensor = {
    pipe: jest.fn(() => ({
      subscribe: jest.fn(() => ({unsubscribe: jest.fn()})),
    })),
  };

  return {
    accelerometer: sensor,
    magnetometer: sensor,
    gyroscope: sensor,
  };
});

jest.mock('react-native-sound', () => {
  const Sound = jest.fn().mockImplementation((_file, _bundle, onLoad) => {
    setTimeout(() => onLoad?.(null), 0);
    return {
      setNumberOfLoops: jest.fn(),
      setVolume: jest.fn(),
      stop: jest.fn(onStop => onStop?.()),
      play: jest.fn(onPlay => onPlay?.(true)),
      release: jest.fn(),
    };
  });

  Sound.MAIN_BUNDLE = 'MAIN_BUNDLE';
  Sound.setCategory = jest.fn();

  return Sound;
});

jest.mock('react-native-wifi-reborn', () => ({
  getCurrentWifiSSID: jest.fn(() => Promise.resolve('test-wifi')),
  getBSSID: jest.fn(() => Promise.resolve('00:00:00:00:00:00')),
  getFrequency: jest.fn(() => Promise.resolve(2412)),
  getCurrentSignalStrength: jest.fn(() => Promise.resolve(-50)),
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const {View} = require('react-native');
  const MapView = props => React.createElement(View, props, props.children);
  const Child = props => React.createElement(View, props, props.children);

  return {
    __esModule: true,
    default: MapView,
    Marker: Child,
    Circle: Child,
    Polyline: Child,
    UrlTile: Child,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('react-native-webview', () => {
  const React = require('react');
  const {View} = require('react-native');

  return {
    WebView: props => React.createElement(View, props, props.children),
  };
});
