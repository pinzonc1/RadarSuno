import { RadarTarget } from "../interfaces/RadarTarget";

export default class TargetFusionEngine {

    /**
     * ==========================================================
     * OBJETIVOS FUSIONADOS
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
     * CONFIGURACIÓN
     * ==========================================================
     */

    /**
     * Distancia máxima (metros) para considerar
     * dos observaciones como el mismo objetivo.
     */
    private static readonly MAX_DISTANCE = 5;

    /**
     * Tiempo máximo (ms) entre observaciones.
     */
    private static readonly MAX_TIME = 10000;

    /**
     * Diferencia máxima de intensidad.
     */
    private static readonly MAX_SIGNAL_DIFFERENCE = 20;

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
     * OBTENER OBJETIVOS FUSIONADOS
     * ==========================================================
     */

    static getTargets(): RadarTarget[] {

        return [...this.targets];

    }

        /**
     * ==========================================================
     * ACTUALIZAR OBJETIVOS
     * ==========================================================
     */

    static update(
        targets: RadarTarget[]
    ): void {

        this.targets = [];

        targets.forEach(target => {

            this.addTarget(target);

        });

    }

    /**
     * ==========================================================
     * AGREGAR OBJETIVO
     * ==========================================================
     */

    private static addTarget(
        target: RadarTarget
    ): void {

        const existing = this.targets.find(existingTarget =>

            this.isSameTarget(

                existingTarget,

                target

            )

        );

        if (existing) {

            this.mergeTargets(

                existing,

                target

            );

            return;

        }

        this.targets.push({

            ...target

        });

    }

        /**
     * ==========================================================
     * ¿SON EL MISMO OBJETIVO?
     * ==========================================================
     */

    private static isSameTarget(
        targetA: RadarTarget,
        targetB: RadarTarget
    ): boolean {

        let score = 0;

        /**
         * ------------------------------------------------------
         * DISTANCIA GPS
         * ------------------------------------------------------
         */

        const distance = this.calculateDistance(

            targetA.location.latitude,
            targetA.location.longitude,

            targetB.location.latitude,
            targetB.location.longitude

        );

        if (distance <= this.MAX_DISTANCE) {

            score += 40;

        }

        /**
         * ------------------------------------------------------
         * DIFERENCIA DE SEÑAL
         * ------------------------------------------------------
         */

        const signalDifference = Math.abs(

            targetA.signalStrength -

            targetB.signalStrength

        );

        if (signalDifference <= this.MAX_SIGNAL_DIFFERENCE) {

            score += 30;

        }

        /**
         * ------------------------------------------------------
         * TIEMPO ENTRE DETECCIONES
         * ------------------------------------------------------
         */

        const elapsed = Math.abs(

            targetA.lastSeen -

            targetB.lastSeen

        );

        if (elapsed <= this.MAX_TIME) {

            score += 30;

        }

        /**
         * ------------------------------------------------------
         * ¿MISMO OBJETIVO?
         * ------------------------------------------------------
         */

        return score >= 70;

    }

    /**
     * ==========================================================
     * DISTANCIA ENTRE DOS COORDENADAS
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
     * FUSIONAR DOS OBJETIVOS
     * ==========================================================
     */

    private static mergeTargets(

        existing: RadarTarget,

        incoming: RadarTarget

    ): void {

        existing.lastSeen = Math.max(

            existing.lastSeen,

            incoming.lastSeen

        );

        existing.observations += incoming.observations;

        existing.signalStrength = Math.max(

            existing.signalStrength,

            incoming.signalStrength

        );

        existing.confidence = Math.max(

            existing.confidence,

            incoming.confidence

        );

        existing.estimatedDistance = Math.min(

            existing.estimatedDistance,

            incoming.estimatedDistance

        );

        /**
         * ------------------------------------------------------
         * BLUETOOTH
         * ------------------------------------------------------
         */

        if (

            !existing.bluetooth &&

            incoming.bluetooth

        ) {

            existing.bluetooth = incoming.bluetooth;

        }

        /**
         * ------------------------------------------------------
         * WIFI
         * ------------------------------------------------------
         */

        if (

            !existing.wifi &&

            incoming.wifi

        ) {

            existing.wifi = incoming.wifi;

        }

        /**
         * ------------------------------------------------------
         * FUENTE
         * ------------------------------------------------------
         */

        if (

            existing.bluetooth &&

            existing.wifi

        ) {

            existing.source = "hybrid";

        }

        existing.active =

            existing.active ||

            incoming.active;

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
     * LIMPIAR OBJETIVOS
     * ==========================================================
     */

    static clear(): void {

        this.targets = [];

    }

    /**
     * ==========================================================
     * ESTADO DEL MOTOR
     * ==========================================================
     */

    static getStatus() {

        return {

            running: this.running,

            targets: this.targets.length,

            maxDistance: this.MAX_DISTANCE,

            maxTime: this.MAX_TIME,

            maxSignalDifference: this.MAX_SIGNAL_DIFFERENCE

        };

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
     * LIBERAR RECURSOS
     * ==========================================================
     */

    static destroy(): void {

        this.stop();

        this.clear();

    }

}