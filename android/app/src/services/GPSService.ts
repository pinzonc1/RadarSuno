import { PermissionsAndroid, Platform } from "react-native";
import Geolocation, {
    GeoPosition,
    GeoWatchOptions
} from "react-native-geolocation-service";

export class GPSService {

    /**
     * ==========================================================
     * ÚLTIMA POSICIÓN CONOCIDA
     * ==========================================================
     */

    private static currentPosition: GeoPosition | null = null;

    /**
     * ==========================================================
     * HISTORIAL DE POSICIONES
     * ==========================================================
     */

    private static history: GeoPosition[] = [];

    /**
     * ==========================================================
     * DISTANCIA TOTAL RECORRIDA (m)
     * ==========================================================
     */

    private static totalDistance = 0;

    /**
     * ==========================================================
     * ÚLTIMA ACTUALIZACIÓN
     * ==========================================================
     */

    private static lastUpdate = 0;

    /**
     * ==========================================================
     * TAMAÑO MÁXIMO DEL HISTORIAL
     * ==========================================================
     */

    private static readonly MAX_HISTORY = 500;

    /**
     * ==========================================================
     * WATCH ID
     * ==========================================================
     */

    private static watchId: number | null = null;

    /**
     * ==========================================================
     * ESTADO DEL SEGUIMIENTO
     * ==========================================================
     */

    private static tracking = false;

    /**
     * ==========================================================
     * CONFIGURACIÓN DEL GPS
     * ==========================================================
     */

    private static readonly options: GeoWatchOptions = {

        enableHighAccuracy: true,

        distanceFilter: 1,

        interval: 1000,

        fastestInterval: 500,

        forceRequestLocation: true,

        showLocationDialog: true

    };

    /**
     * ==========================================================
     * ¿SE ESTÁ SIGUIENDO EL GPS?
     * ==========================================================
     */

    static isTracking(): boolean {

        return this.tracking;

    }

    /**
     * ==========================================================
     * ¿HAY UBICACIÓN DISPONIBLE?
     * ==========================================================
     */

    static hasLocation(): boolean {

        return this.currentPosition !== null;

    }

    /**
     * ==========================================================
     * OBTENER ÚLTIMA POSICIÓN
     * ==========================================================
     */

    static getCurrentPosition(): GeoPosition | null {

        return this.currentPosition;

    }

    /**
     * ==========================================================
     * OBTENER HISTORIAL
     * ==========================================================
     */

    static getHistory(): GeoPosition[] {

        return [...this.history];

    }

    /**
     * ==========================================================
     * LIMPIAR HISTORIAL
     * ==========================================================
     */

    static clearHistory(): void {

        this.history = [];

        this.totalDistance = 0;

        this.lastUpdate = 0;

    }

        /**
     * ==========================================================
     * AGREGAR POSICIÓN AL HISTORIAL
     * ==========================================================
     */

    private static addHistory(
        position: GeoPosition
    ): void {

        const previous =
            this.history[this.history.length - 1];

        if (previous) {

            this.totalDistance += this.calculateDistance(

                previous.coords.latitude,
                previous.coords.longitude,

                position.coords.latitude,
                position.coords.longitude

            );

        }

        this.history.push(position);

        if (this.history.length > this.MAX_HISTORY) {

            this.history.shift();

        }

        this.currentPosition = position;

        this.lastUpdate = Date.now();

    }

    /**
     * ==========================================================
     * CALCULAR DISTANCIA ENTRE DOS COORDENADAS
     * (FÓRMULA DE HAVERSINE)
     * ==========================================================
     */

    private static calculateDistance(

        lat1: number,
        lon1: number,

        lat2: number,
        lon2: number

    ): number {

        const R = 6371000;

        const dLat = (lat2 - lat1) * Math.PI / 180;

        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a =

            Math.sin(dLat / 2) *

            Math.sin(dLat / 2)

            +

            Math.cos(lat1 * Math.PI / 180)

            *

            Math.cos(lat2 * Math.PI / 180)

            *

            Math.sin(dLon / 2)

            *

            Math.sin(dLon / 2);

        const c =

            2 *

            Math.atan2(

                Math.sqrt(a),

                Math.sqrt(1 - a)

            );

        return R * c;

    }

    /**
     * ==========================================================
     * OBTENER UBICACIÓN ACTUAL
     * ==========================================================
     */

    static async hasLocationPermission(): Promise<boolean> {
        if (Platform.OS !== "android") {
            return false;
        }

        const fine = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const coarse = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );

        return fine || coarse;
    }

    static async getLocation(): Promise<GeoPosition | null> {

        if (!(await this.hasLocationPermission())) {
            console.warn("GPS Service: Location permission not granted.");
            return null;
        }

        return new Promise((resolve) => {

            Geolocation.getCurrentPosition(

                (position) => {

                    this.addHistory(position);

                    resolve(position);

                },

                (error) => {

                    console.error(

                        "GPS Error:",

                        error.message

                    );

                    resolve(null);

                },

                this.options

            );

        });

    }

    /**
     * ==========================================================
     * INICIAR SEGUIMIENTO GPS
     * ==========================================================
     */

    static async startTracking(

        callback?: (position: GeoPosition) => void

    ): Promise<void> {

        if (this.tracking) {

            return;

        }

        if (!(await this.hasLocationPermission())) {

            console.warn("GPS Service: Cannot start tracking without location permission.");

            return;

        }

        this.tracking = true;

        this.watchId = Geolocation.watchPosition(

            (position) => {

                this.addHistory(position);

                callback?.(position);

            },

            (error) => {

                console.error(

                    "GPS Watch Error:",

                    error.message

                );

            },

            this.options

        );

    }

        /**
     * ==========================================================
     * DETENER SEGUIMIENTO GPS
     * ==========================================================
     */

    static stopTracking(): void {

        if (this.watchId !== null) {

            Geolocation.clearWatch(this.watchId);

            this.watchId = null;

        }

        this.tracking = false;

    }

    /**
     * ==========================================================
     * OBTENER WATCH ID
     * ==========================================================
     */

    static getWatchId(): number | null {

        return this.watchId;

    }

    /**
     * ==========================================================
     * DISTANCIA TOTAL RECORRIDA
     * ==========================================================
     */

    static getTotalDistance(): number {

        return this.totalDistance;

    }

    /**
     * ==========================================================
     * ÚLTIMA ACTUALIZACIÓN
     * ==========================================================
     */

    static getLastUpdate(): number {

        return this.lastUpdate;

    }

    /**
     * ==========================================================
     * LATITUD
     * ==========================================================
     */

    static getLatitude(): number {

        return this.currentPosition?.coords.latitude ?? 0;

    }

    /**
     * ==========================================================
     * LONGITUD
     * ==========================================================
     */

    static getLongitude(): number {

        return this.currentPosition?.coords.longitude ?? 0;

    }

    /**
     * ==========================================================
     * ALTITUD
     * ==========================================================
     */

    static getAltitude(): number {

        return this.currentPosition?.coords.altitude ?? 0;

    }

    /**
     * ==========================================================
     * PRECISIÓN DEL GPS
     * ==========================================================
     */

    static getAccuracy(): number {

        return this.currentPosition?.coords.accuracy ?? 9999;

    }

    /**
     * ==========================================================
     * VELOCIDAD
     * ==========================================================
     */

    static getSpeed(): number {

        return this.currentPosition?.coords.speed ?? 0;

    }

    /**
     * ==========================================================
     * RUMBO (HEADING)
     * ==========================================================
     */

    static getHeading(): number {

        return this.currentPosition?.coords.heading ?? 0;

    }

        /**
     * ==========================================================
     * OBTENER COORDENADAS
     * ==========================================================
     */

    static getCoordinates() {

        if (!this.currentPosition) {

            return null;

        }

        return {

            latitude: this.currentPosition.coords.latitude,

            longitude: this.currentPosition.coords.longitude

        };

    }

    /**
     * ==========================================================
     * INFORMACIÓN COMPLETA DE MISIÓN
     * ==========================================================
     */

    static getMissionCoordinates() {

        if (!this.currentPosition) {

            return null;

        }

        return {

            latitude: this.currentPosition.coords.latitude,

            longitude: this.currentPosition.coords.longitude,

            altitude: this.currentPosition.coords.altitude,

            accuracy: this.currentPosition.coords.accuracy,

            speed: this.currentPosition.coords.speed,

            heading: this.currentPosition.coords.heading,

            timestamp: this.currentPosition.timestamp

        };

    }

    /**
     * ==========================================================
     * ¿GPS CON PRECISIÓN ACEPTABLE?
     * ==========================================================
     */

    static isAccurate(
        maxAccuracy: number = 10
    ): boolean {

        if (!this.currentPosition) {

            return false;

        }

        return this.currentPosition.coords.accuracy <= maxAccuracy;

    }

    /**
     * ==========================================================
     * ¿EL USUARIO ESTÁ QUIETO?
     * ==========================================================
     */

    static isStationary(
        threshold: number = 0.5
    ): boolean {

        return this.getSpeed() <= threshold;

    }

    /**
     * ==========================================================
     * TIEMPO DESDE LA ÚLTIMA ACTUALIZACIÓN
     * ==========================================================
     */

    static getTimeSinceLastUpdate(): number {

        if (this.lastUpdate === 0) {

            return 0;

        }

        return Date.now() - this.lastUpdate;

    }

    /**
     * ==========================================================
     * ¿LA UBICACIÓN ES RECIENTE?
     * ==========================================================
     */

    static isLocationRecent(
        maxAge: number = 10000
    ): boolean {

        return this.getTimeSinceLastUpdate() <= maxAge;

    }

    /**
     * ==========================================================
     * REINICIAR ESTADÍSTICAS DE MISIÓN
     * ==========================================================
     */

    static resetMission(): void {

        this.totalDistance = 0;

        this.lastUpdate = 0;

        this.history = [];

    }

        /**
     * ==========================================================
     * DETENER TODOS LOS SERVICIOS GPS
     * ==========================================================
     */

    static stopAll(): void {

        this.stopTracking();

        Geolocation.stopObserving();

    }

    /**
     * ==========================================================
     * LIBERAR RECURSOS
     * ==========================================================
     */

    static destroy(): void {

        this.stopAll();

        this.currentPosition = null;

        this.history = [];

        this.totalDistance = 0;

        this.lastUpdate = 0;

    }

    /**
     * ==========================================================
     * ESTADO DEL SERVICIO GPS
     * ==========================================================
     */

    static getStatus() {

        return {

            tracking: this.tracking,

            hasLocation: this.hasLocation(),

            watchId: this.watchId,

            historySize: this.history.length,

            route: this.history.slice(-120).map(position => ({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                altitude: position.coords.altitude,
                accuracy: position.coords.accuracy,
                speed: position.coords.speed,
                heading: position.coords.heading,
                timestamp: position.timestamp
            })),

            totalDistance: this.totalDistance,

            latitude: this.getLatitude(),

            longitude: this.getLongitude(),

            altitude: this.getAltitude(),

            accuracy: this.getAccuracy(),

            speed: this.getSpeed(),

            heading: this.getHeading(),

            lastUpdate: this.lastUpdate,

            locationAge: this.getTimeSinceLastUpdate(),

            locationRecent: this.isLocationRecent(),

            stationary: this.isStationary()

        };

    }

}
