export interface BluetoothProvider {

    isEnabled(): Promise<boolean>;

    requestEnable(): Promise<boolean>;

    startScan(): Promise<void>;

    stopScan(): Promise<void>;

    getDevices(): Promise<any[]>;

}