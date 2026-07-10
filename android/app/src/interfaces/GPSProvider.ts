export interface GPSProvider {

    isEnabled(): Promise<boolean>;

    getCurrentLocation(): Promise<any>;

    watchPosition(): Promise<void>;

    stopWatching(): Promise<void>;

}