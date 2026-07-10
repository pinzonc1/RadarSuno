import WifiManager from "react-native-wifi-reborn";


export default class WifiService {

    /**
     * ==========================================================
     * ESTADO DEL SERVICIO
     * ==========================================================
     */

    private static running = false;

    /**
     * ==========================================================
     * ESTADO WIFI
     * ==========================================================
     */

    private static enabled = false;

    private static connected = false;

    /**
     * ==========================================================
     * INFORMACIÓN DE LA RED
     * ==========================================================
     */

    private static ssid = "";

    private static bssid = "";

    private static ipAddress = "";

    private static frequency = 0;

    private static signalLevel = 0;

    /**
     * ==========================================================
     * ÚLTIMA ACTUALIZACIÓN
     * ==========================================================
     */

    private static lastUpdate = 0;
    private static refreshInterval: ReturnType<typeof setInterval> | null = null;

    /**
     * ==========================================================
     * INICIAR SERVICIO
     * ==========================================================
     */

        static async start(): Promise<void> {

        if (this.running) {

            return;

        }

        this.running = true;

        await this.refresh();

        this.refreshInterval = setInterval(() => {
            this.refresh();
        }, 5000); // Actualizar cada 5 segundos

    }


        /**
     * ==========================================================
     * ACTUALIZAR INFORMACIÓN WIFI
     * ==========================================================
     */

    static async refresh(): Promise<void> {

        try {

            const ssid = await WifiManager.getCurrentWifiSSID();

            this.enabled = true;

            this.connected = true;

            this.ssid = ssid;

        } catch {

            this.connected = false;

            this.ssid = "";

        }

        try {

            this.bssid = await WifiManager.getBSSID();

        } catch {

            this.bssid = "";

        }

        try {

            this.frequency = await WifiManager.getFrequency();

        } catch {

            this.frequency = 0;

        }

        try {

            this.signalLevel = await WifiManager.getCurrentSignalStrength();

        } catch {

            this.signalLevel = 0;

        }

        this.lastUpdate = Date.now();

    }

        /**
     * ==========================================================
     * GETTERS
     * ==========================================================
     */

    static isRunning(): boolean {

        return this.running;

    }

    static isEnabled(): boolean {

        return this.enabled;

    }

    static isConnected(): boolean {

        return this.connected;

    }

    static getSSID(): string {

        return this.ssid;

    }

    static getBSSID(): string {

        return this.bssid;

    }

    static getIPAddress(): string {

        return this.ipAddress;

    }

    static getFrequency(): number {

        return this.frequency;

    }

    static getSignalLevel(): number {

        return this.signalLevel;

    }

    /**
     * ==========================================================
     * INFORMACIÓN COMPLETA
     * ==========================================================
     */

    static getStatus() {

        return {

            running: this.running,

            enabled: this.enabled,

            connected: this.connected,

            ssid: this.ssid,

            bssid: this.bssid,

            ipAddress: this.ipAddress,

            frequency: this.frequency,

            signalLevel: this.signalLevel,

            lastUpdate: this.lastUpdate

        };

    }

    /**
     * ==========================================================
     * DETENER SERVICIO
     * ==========================================================
     */

    static stop(): void {

        if (this.refreshInterval) {

            clearInterval(this.refreshInterval);

            this.refreshInterval = null;

        }

        this.running = false;

    }

    /**
     * ==========================================================
     * LIBERAR RECURSOS
     * ==========================================================
     */

    static destroy(): void {

        this.stop();

        this.enabled = false;

        this.connected = false;

        this.ssid = "";

        this.bssid = "";

        this.ipAddress = "";

        this.frequency = 0;

        this.signalLevel = 0;

        this.lastUpdate = 0;

    }

}
