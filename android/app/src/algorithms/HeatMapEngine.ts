import { HeatPoint } from "../interfaces/HeatPoint";
import { RadarTarget } from "../interfaces/RadarTarget";

export default class HeatMapEngine {

    /**
     * ==========================================================
     * PUNTOS DEL MAPA DE CALOR
     * ==========================================================
     */

    private static points: HeatPoint[] = [];

    /**
     * ==========================================================
     * ESTADO DEL MOTOR
     * ==========================================================
     */

    private static running = false;

    /**
     * ==========================================================
     * CONFIGURACIÓN
     * ==========================================================
     */

    private static readonly MAX_POINTS = 10000;

    private static readonly HOT_SIGNAL = 80;

    private static readonly WARM_SIGNAL = 60;

    private static readonly COLD_SIGNAL = 40;

    /**
     * ==========================================================
     * INICIAR MOTOR
     * ==========================================================
     */

    static start(): void {

        if (this.running) {

            return;

        }

        this.running = true;

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
     * CANTIDAD DE PUNTOS
     * ==========================================================
     */

    static getPointCount(): number {

        return this.points.length;

    }

    /**
     * ==========================================================
     * OBTENER TODOS LOS PUNTOS
     * ==========================================================
     */

    static getPoints(): HeatPoint[] {

        return [...this.points];

    }

        /**
     * ==========================================================
     * AGREGAR UNA OBSERVACIÓN AL MAPA
     * ==========================================================
     */

    static addPoint(target: RadarTarget): void {

        const point: HeatPoint = {

            targetId: target.id,

            latitude: target.location.latitude,

            longitude: target.location.longitude,

            accuracy: target.location.accuracy,

            timestamp: target.lastSeen,

            signalStrength: target.signalStrength,

            rssi: target.bluetooth?.rssi ?? -100,

            estimatedDistance: target.estimatedDistance,

            azimuth: target.orientation.azimuth,

            pitch: target.orientation.pitch,

            roll: target.orientation.roll,

            source: target.source,

            confidence: target.confidence,

            observations: target.observations,

            active: target.active

        };

        this.points.push(point);

        if (this.points.length > this.MAX_POINTS) {

            this.points.shift();

        }

    }

    /**
     * ==========================================================
     * AGREGAR VARIOS OBJETIVOS
     * ==========================================================
     */

    static update(targets: RadarTarget[]): void {

        targets.forEach(target => {

            this.addPoint(target);

        });

    }

        /**
     * ==========================================================
     * OBTENER LOS PUNTOS ACTIVOS
     * ==========================================================
     */

    static getActivePoints(): HeatPoint[] {

        return this.points.filter(point => point.active);

    }

    /**
     * ==========================================================
     * OBTENER LOS PUNTOS DE UN OBJETIVO
     * ==========================================================
     */

    static getTargetPoints(
        targetId: string
    ): HeatPoint[] {

        return this.points.filter(point =>

            point.targetId === targetId

        );

    }

    /**
     * ==========================================================
     * OBTENER EL PUNTO CON MAYOR SEÑAL
     * ==========================================================
     */

    static getStrongestPoint(): HeatPoint | null {

        if (this.points.length === 0) {

            return null;

        }

        return this.points.reduce((best, current) =>

            current.signalStrength > best.signalStrength

                ? current

                : best

        );

    }

    /**
     * ==========================================================
     * OBTENER EL PUNTO MÁS RECIENTE
     * ==========================================================
     */

    static getLatestPoint(): HeatPoint | null {

        if (this.points.length === 0) {

            return null;

        }

        return this.points.reduce((latest, current) =>

            current.timestamp > latest.timestamp

                ? current

                : latest

        );

    }

        /**
     * ==========================================================
     * PUNTOS CON SEÑAL CALIENTE
     * ==========================================================
     */

    static getHotPoints(): HeatPoint[] {

        return this.points.filter(point =>

            point.signalStrength >= this.HOT_SIGNAL

        );

    }

    /**
     * ==========================================================
     * PUNTOS CON SEÑAL MEDIA
     * ==========================================================
     */

    static getWarmPoints(): HeatPoint[] {

        return this.points.filter(point =>

            point.signalStrength >= this.WARM_SIGNAL &&
            point.signalStrength < this.HOT_SIGNAL

        );

    }

    /**
     * ==========================================================
     * PUNTOS CON SEÑAL DÉBIL
     * ==========================================================
     */

    static getColdPoints(): HeatPoint[] {

        return this.points.filter(point =>

            point.signalStrength >= this.COLD_SIGNAL &&
            point.signalStrength < this.WARM_SIGNAL

        );

    }

    /**
     * ==========================================================
     * OBTENER EL CENTRO DEL MAPA
     * ==========================================================
     */

    static getCenter() {

        if (this.points.length === 0) {

            return null;

        }

        const latitude =

            this.points.reduce(

                (sum, point) => sum + point.latitude,

                0

            ) / this.points.length;

        const longitude =

            this.points.reduce(

                (sum, point) => sum + point.longitude,

                0

            ) / this.points.length;

        return {

            latitude,

            longitude

        };

    }

        /**
     * ==========================================================
     * LIMPIAR MAPA
     * ==========================================================
     */

    static clear(): void {

        this.points = [];
        

    }

    /**
     * ==========================================================
     * DETENER MOTOR
     * ==========================================================
     */

    static stop(): void {

        this.running = false;

    }

    /**
     * ==========================================================
     * REINICIAR MOTOR
     * ==========================================================
     */

    static reset(): void {

        this.clear();

        this.stop();

    }


        /**
     * ==========================================================
     * OBTENER MAPA DE CALOR
     * ==========================================================
     */

    static getHeatMap() {

        return [...this.points];

    }
    /**
     * ==========================================================
     * ESTADÍSTICAS
     * ==========================================================
     */

    static getStatus() {

        return {

            running: this.running,

            totalPoints: this.points.length,

            activePoints: this.getActivePoints().length,

            hotPoints: this.getHotPoints().length,

            warmPoints: this.getWarmPoints().length,

            coldPoints: this.getColdPoints().length,

            strongestPoint: this.getStrongestPoint(),

            latestPoint: this.getLatestPoint(),

            center: this.getCenter()

        };

    }

    /**
     * ==========================================================
     * LIBERAR RECURSOS
     * ==========================================================
     */

    static destroy(): void {

        this.reset();

    }

}