import {
    BleManager,
    Device,
    State,
    Subscription
} from "react-native-ble-plx";

export class BluetoothService {

    /**
     * ==========================================================
     * INSTANCIA ÚNICA DEL ADMINISTRADOR BLUETOOTH
     * ==========================================================
     */

    private static manager: BleManager = new BleManager();

    /**
     * ==========================================================
     * DISPOSITIVOS ENCONTRADOS
     * ==========================================================
     */

    private static devices: Map<string, Device> = new Map();

    /**
     * ==========================================================
     * SUSCRIPCIÓN AL ESTADO DEL BLUETOOTH
     * ==========================================================
     */

    private static stateSubscription: Subscription | null = null;

    /**
     * ==========================================================
     * ESCANEO ACTIVO
     * ==========================================================
     */

    private static scanning: boolean = false;

    /**
     * ==========================================================
     * OBTENER EL MANAGER
     * ==========================================================
     */

    static getManager(): BleManager {

        return this.manager;

    }

    /**
     * ==========================================================
     * ¿EL DISPOSITIVO SOPORTA BLUETOOTH LE?
     * ==========================================================
     */

    static async isSupported(): Promise<boolean> {

        try {

            const state = await this.manager.state();

            return state !== State.Unsupported;

        } catch {

            return false;

        }

    }

    /**
     * ==========================================================
     * OBTENER EL ESTADO ACTUAL
     * ==========================================================
     */

    static async getState(): Promise<State> {

        return await this.manager.state();

    }

    /**
     * ==========================================================
     * ¿BLUETOOTH ESTÁ ENCENDIDO?
     * ==========================================================
     */

    static async isEnabled(): Promise<boolean> {

        const state = await this.getState();

        return state === State.PoweredOn;

    }

    /**
     * ==========================================================
     * ¿SE ESTÁ ESCANEANDO?
     * ==========================================================
     */

    static isScanning(): boolean {

        return this.scanning;

    }

        /**
     * ==========================================================
     * MONITOREAR CAMBIOS EN EL ESTADO DEL BLUETOOTH
     * ==========================================================
     */

    static monitorState(
        callback: (state: State) => void
    ): void {

        this.stateSubscription?.remove();

        this.stateSubscription = this.manager.onStateChange(

            (state) => {

                callback(state);

            },

            true

        );

    }

    /**
     * ==========================================================
     * INICIAR ESCANEO BLE
     * ==========================================================
     */

    static startScan(
        onDeviceFound?: (device: Device) => void
    ): void {

        if (this.scanning) {

            return;

        }

        this.scanning = true;

        try {
            this.manager.startDeviceScan(

                null,

                {
                    allowDuplicates: true
                },

                (error, device) => {

                    if (error) {
                    
                        this.scanning = false;

                        console.error(
                            "Bluetooth Scan Error:",
                            error.message
                        );

                        return;

                    }

                    if (!device) {

                        return;

                    }

                    this.updateDevice(device);

                    this.updateHistory(device);

                    onDeviceFound?.(device);

                }

            );
        } catch (error) {
            this.scanning = false;
            console.error("Bluetooth Scan Start Error:", error);
        }

    }

    /**
     * ==========================================================
     * DETENER ESCANEO
     * ==========================================================
     */

    static stopScan(): void {

        if (!this.scanning) {

            return;

        }

        this.manager.stopDeviceScan();

        this.scanning = false;

    }

    /**
     * ==========================================================
     * ACTUALIZAR O AGREGAR DISPOSITIVO
     * ==========================================================
     */

    private static updateDevice(
        device: Device
    ): void {

        this.devices.set(device.id,device);
        

    }

    /**
     * ==========================================================
     * LIMPIAR LISTA DE DISPOSITIVOS
     * ==========================================================
     */

    static clearDevices(): void {

        this.devices.clear();

    }

    /**
     * ==========================================================
     * CANTIDAD DE DISPOSITIVOS
     * ==========================================================
     */

    static getDeviceCount(): number {

        return this.devices.size;

    }

        /**
     * ==========================================================
     * OBTENER TODOS LOS DISPOSITIVOS
     * ==========================================================
     */

    static getDevices(): Device[] {

        return Array.from(this.devices.values());

    }

    /**
     * ==========================================================
     * OBTENER DISPOSITIVO POR ID
     * ==========================================================
     */

    static getDevice(id: string): Device | undefined {

        return this.devices.get(id);

    }

    /**
     * ==========================================================
     * ¿EXISTE EL DISPOSITIVO?
     * ==========================================================
     */

    static hasDevice(id: string): boolean {

        return this.devices.has(id);

    }

    /**
     * ==========================================================
     * ELIMINAR DISPOSITIVO
     * ==========================================================
     */

    static removeDevice(id: string): boolean {

        return this.devices.delete(id);

    }

    /**
     * ==========================================================
     * CONECTAR A UN DISPOSITIVO
     * ==========================================================
     */

    static async connect(
        id: string
    ): Promise<Device | null> {

        try {

            const device =
                await this.manager.connectToDevice(id);

            await device.discoverAllServicesAndCharacteristics();

            return device;

        } catch (error) {

            console.error(
                "Bluetooth Connect:",
                error
            );

            return null;

        }

    }

    /**
     * ==========================================================
     * DESCONECTAR DISPOSITIVO
     * ==========================================================
     */

    static async disconnect(
        id: string
    ): Promise<boolean> {

        try {

            await this.manager.cancelDeviceConnection(id);

            return true;

        } catch {

            return false;

        }

    }

    /**
     * ==========================================================
     * LEER RSSI
     * ==========================================================
     */

    static async readRSSI(
        id: string
    ): Promise<number | null> {

        try {

            const device =
                await this.manager.readRSSIForDevice(id);

            return device.rssi ?? null;

        } catch {

            return null;

        }

    }

    /**
     * ==========================================================
     * ACTUALIZAR RSSI DEL DISPOSITIVO
     * ==========================================================
     */

    static async refreshRSSI(
        id: string
    ): Promise<void> {

        try {

            const device =
                await this.manager.readRSSIForDevice(id);

            this.devices.set(id, device);
            this.updateHistory(device);

        } catch {

        }

    }

        /**
     * ==========================================================
     * OBTENER DISPOSITIVOS ORDENADOS POR RSSI
     * ==========================================================
     */

    static getDevicesSortedByRSSI(): Device[] {

        return this.getDevices().sort((a, b) => {

            return (b.rssi ?? -999) - (a.rssi ?? -999);

        });

    }

    /**
     * ==========================================================
     * OBTENER EL DISPOSITIVO MÁS CERCANO
     * ==========================================================
     */

    static getNearestDevice(): Device | null {

        const devices = this.getDevicesSortedByRSSI();

        if (devices.length === 0) {

            return null;

        }

        return devices[0];

    }

    /**
     * ==========================================================
     * FILTRAR DISPOSITIVOS CON SEÑAL MUY DÉBIL
     * ==========================================================
     */

    static getStrongDevices(
        minimumRSSI: number = -90
    ): Device[] {

        return this.getDevices().filter(device => {

            return (device.rssi ?? -999) >= minimumRSSI;

        });

    }

    /**
     * ==========================================================
     * ESTIMAR DISTANCIA (APROXIMADA)
     * ==========================================================
     */

    static estimateDistance(
        rssi: number,
        txPower: number = -59
    ): number {

        const ratio = rssi / txPower;

        if (ratio < 1.0) {

            return Math.pow(ratio, 10);

        }

        return (
            0.89976 *
            Math.pow(ratio, 7.7095)
        ) + 0.111;

    }

    /**
     * ==========================================================
     * DISTANCIA DE UN DISPOSITIVO
     * ==========================================================
     */

    static getEstimatedDistance(
        id: string
    ): number | null {

        const device = this.getDevice(id);

        if (!device) {

            return null;

        }

        if (device.rssi == null) {

            return null;

        }

        return this.estimateDistance(device.rssi);

    }

    /**
     * ==========================================================
     * NIVEL DE SEÑAL
     * ==========================================================
     */

    static getSignalLevel(
        rssi: number
    ): number {

        if (rssi >= -50) {

            return 5;

        }

        if (rssi >= -60) {

            return 4;

        }

        if (rssi >= -70) {

            return 3;

        }

        if (rssi >= -80) {

            return 2;

        }

        return 1;

    }

    /**
     * ==========================================================
     * ¿EL DISPOSITIVO ESTÁ CERCA?
     * ==========================================================
     */

    static isNear(
        id: string,
        meters: number = 5
    ): boolean {

        const distance = this.getEstimatedDistance(id);

        if (distance == null) {

            return false;

        }

        return distance <= meters;

    }

    /**
 * ==========================================================
 * HISTORIAL RSSI
 * ==========================================================
 */

    private static rssiHistory: Map<string, number[]> = new Map();

        /**
     * ==========================================================
     * AGREGAR MEDICIÓN RSSI AL HISTORIAL
     * ==========================================================
     */

    private static addRSSIHistory(
        id: string,
        rssi: number
    ): void {

        let history = this.rssiHistory.get(id) ?? [];

        history.push(rssi);

        if (history.length > 10) {

            history.shift();

        }

        this.rssiHistory.set(id, history);

    }

    /**
     * ==========================================================
     * RSSI PROMEDIO
     * ==========================================================
     */

    static getAverageRSSI(
        id: string
    ): number | null {

        const history = this.rssiHistory.get(id);

        if (!history || history.length === 0) {

            return null;

        }

        const sum = history.reduce((a, b) => a + b, 0);

        return sum / history.length;

    }

    /**
     * ==========================================================
     * ACTUALIZAR HISTORIAL DEL DISPOSITIVO
     * ==========================================================
     */

    static updateHistory(
        device: Device
    ): void {

        if (device.rssi == null) {

            return;

        }

        this.addRSSIHistory(

            device.id,

            device.rssi

        );

    }

    /**
     * ==========================================================
     * LIMPIAR HISTORIAL
     * ==========================================================
     */

    static clearHistory(): void {

        this.rssiHistory.clear();

    }

    /**
     * ==========================================================
     * OBTENER EL RSSI ESTABILIZADO
     * ==========================================================
     */

    static getStableRSSI(
        id: string
    ): number | null {

        const average = this.getAverageRSSI(id);

        if (average == null) {

            return null;

        }

        return Math.round(average);

    }

    /**
     * ==========================================================
     * DISTANCIA ESTABILIZADA
     * ==========================================================
     */

    static getStableDistance(
        id: string
    ): number | null {

        const rssi = this.getStableRSSI(id);

        if (rssi == null) {

            return null;

        }

        return this.estimateDistance(rssi);

    }

    /**
     * ==========================================================
     * LIBERAR RECURSOS
     * ==========================================================
     */

    static destroy(): void {

        this.stopScan();

        this.scanning = false;

        this.clearDevices();

        this.clearHistory();

        this.stateSubscription?.remove();

        this.manager.destroy();

    }

            /**
         * Última actualización
         */

    static getLastSeen(_id:string): number{

        return Date.now();

    }
}
