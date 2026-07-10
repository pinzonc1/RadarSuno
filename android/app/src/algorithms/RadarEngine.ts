import {BluetoothService }from "../services/BluetoothService";
import {GPSService }from "../services/GPSService";
import SensorService from "../services/SensorService";
import SoundService from "../services/SoundService";
import WifiService from "../services/WifiService";

import { RadarTarget } from "../interfaces/RadarTarget";
import { PermissionService } from "../services/PermissionService";


export default class RadarEngine {

    /**
     * ==========================================================
     * OBJETIVOS DETECTADOS
     * ==========================================================
     */

    private static targets: RadarTarget[] = [];

    /**
     * ==========================================================
     * ESTADO DEL MOTOR
     * ==========================================================
     */

    private static running = false;

    /**
     * ==========================================================
     * INTERVALO DE ACTUALIZACIÓN
     * ==========================================================
     */

    private static updateInterval:
        ReturnType<typeof setInterval> | null = null;

    /**
     * ==========================================================
     * CONFIGURACIÓN
     * ==========================================================
     */

    private static readonly UPDATE_RATE = 1000;

    /**
     * ==========================================================
     * INICIAR MOTOR
     * ==========================================================
     */
    static async start(): Promise<void> {

        if (this.running) return;

        const granted =
            await PermissionService.hasAllPermissions() ||
            await PermissionService.requestAllPermissions();

        if (!granted) {
            throw new Error("Permisos denegados.");
        }

        BluetoothService.startScan();

        // await GPSService.startTracking();

        SensorService.start();

        // El sonido queda desactivado durante el arranque critico para evitar
        // cierres nativos mientras validamos el escaneo en dispositivo real.

        try {
            await WifiService.start();
        } catch (error) {
            console.warn("RadarEngine: WiFi no disponible para telemetría", error);
        }

        this.running = true;

        this.updateInterval = setInterval(() => {
            this.update();
        }, this.UPDATE_RATE);

    }

    /**
     * ==========================================================
     * ACTUALIZAR MOTOR
     * ==========================================================
     */
    private static update(): void {

        this.updateBluetoothTargets();

        const nearestTarget = this.getNearestTarget();
        SoundService.update(nearestTarget?.estimatedDistance ?? null);

        // Próximamente:
        // this.updateWifiTargets();
        // this.mergeTargets();
        // this.calculateConfidence();

    }

    /**
     * ==========================================================
     * ACTUALIZAR OBJETIVOS BLUETOOTH
     * ==========================================================
     */

    private static updateBluetoothTargets(): void {

        const devices = BluetoothService.getDevices();

        const location = GPSService.getMissionCoordinates();

        const orientation = SensorService.getOrientation();

        devices.forEach(device => {

            const existing = this.targets.find(target =>
                target.bluetooth?.id === device.id
            );

            const distance = BluetoothService.getEstimatedDistance(device.id) ?? 0;
            const deviceName = this.getBluetoothDeviceName(device, existing?.name);

            if (existing) {

                existing.lastSeen = Date.now();

                existing.observations++;

                existing.signalStrength = Math.abs(device.rssi ?? -100);

                existing.estimatedDistance = distance;

                existing.bluetooth = {

                    id: device.id,

                    name: deviceName,

                    rssi: device.rssi ?? -100

                };

                existing.name = deviceName;

                return;

            }

            const target: RadarTarget = {

                id: device.id,

                name: deviceName,

                firstSeen: Date.now(),

                lastSeen: Date.now(),

                observations: 1,

                signalStrength: Math.abs(device.rssi ?? -100),

                confidence: 50,

                estimatedDistance: distance,
                heading: orientation.azimuth,

                source: "bluetooth",

                bluetooth: {

                    id: device.id,

                    name: deviceName,

                    rssi: device.rssi ?? -100

                },

                location: {

                    latitude: location?.latitude ?? 0,

                    longitude: location?.longitude ?? 0,

                    accuracy: location?.accuracy ?? 0

                },

                orientation: {

                    azimuth: orientation.azimuth,

                    pitch: orientation.pitch,

                    roll: orientation.roll

                },

                active: true

            };

            this.targets.push(target);

        });

    }

    private static getBluetoothDeviceName(
        device: any,
        fallback?: string
    ): string {

        const advertisedName =
            device.localName ||
            device.name ||
            device.serviceData?.localName ||
            fallback;

        if (advertisedName && advertisedName !== "Dispositivo desconocido") {

            return advertisedName;

        }

        return `BLE ${device.id.slice(-5).toUpperCase()}`;

    }

        /**
     * ==========================================================
     * OBTENER TODOS LOS OBJETIVOS
     * ==========================================================
     */

    static getTargets(): RadarTarget[] {

        return [...this.targets];

    }

    /**
     * ==========================================================
     * OBTENER UN OBJETIVO
     * ==========================================================
     */

    static getTarget(id: string): RadarTarget | undefined {

        return this.targets.find(target => target.id === id);

    }

    /**
     * ==========================================================
     * CANTIDAD DE OBJETIVOS
     * ==========================================================
     */

    static getTargetCount(): number {

        return this.targets.length;

    }

    /**
     * ==========================================================
     * OBJETIVO MÁS CERCANO
     * ==========================================================
     */

    static getNearestTarget(): RadarTarget | null {

        if (this.targets.length === 0) {

            return null;

        }

        return this.targets.reduce((nearest, current) =>

            current.estimatedDistance < nearest.estimatedDistance
                ? current
                : nearest

        );

    }

    /**
     * ==========================================================
     * OBJETIVOS ACTIVOS
     * ==========================================================
     */

    static getActiveTargets(): RadarTarget[] {

        return this.targets.filter(target => target.active);

    }

    /**
     * ==========================================================
     * LIMPIAR OBJETIVOS
     * ==========================================================
     */

    static clearTargets(): void {

        this.targets = [];

    }

        /**
     * ==========================================================
     * ¿EL MOTOR ESTÁ ACTIVO?
     * ==========================================================
     */

    static isRunning(): boolean {

        return this.running;

    }

    /**
     * ==========================================================
     * ESTADO GENERAL DEL MOTOR
     * ==========================================================
     */

    static getStatus() {

        return {

            running: this.running,

            targets: this.targets.length,

            activeTargets: this.getActiveTargets().length,

            nearestTarget: this.getNearestTarget(),

            updateRate: this.UPDATE_RATE

        };

    }

    /**
     * ==========================================================
     * DETENER MOTOR
     * ==========================================================
     */

    static stop(): void {

        if (this.updateInterval) {

            clearInterval(this.updateInterval);

            this.updateInterval = null;

        }

        SoundService.stop();

        BluetoothService.stopScan();

        WifiService.stop();

        GPSService.stopAll();

        SensorService.stop();

        this.running = false;

    }

    /**
     * ==========================================================
     * REINICIAR MOTOR
     * ==========================================================
     */

    static reset(): void {

        this.stop();

        this.clearTargets();

    }

        /**
     * ==========================================================
     * LIBERAR RECURSOS
     * ==========================================================
     */

    static destroy(): void {

        this.stop();

        this.clearTargets();

    }

}


