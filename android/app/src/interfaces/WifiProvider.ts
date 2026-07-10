export interface WifiProvider {

    isEnabled(): Promise<boolean>;

    startScan(): Promise<void>;

    stopScan(): Promise<void>;

    getNetworks(): Promise<any[]>;

}