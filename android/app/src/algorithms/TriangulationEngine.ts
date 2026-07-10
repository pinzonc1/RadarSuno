import { RadarTarget } from "../interfaces/RadarTarget";

interface TriangulationResult {
    latitude: number;
    longitude: number;
    confidence: number;
    estimatedError: number;
    observations: number;
    timestamp: number;
}

export default class TriangulationEngine {

    /**
     * ==========================================================
     * ÚLTIMA POSICIÓN CALCULADA
     * ==========================================================
     */

    private static latitude = 0;

    private static longitude = 0;

    /**
     * ==========================================================
     * NIVEL DE CONFIANZA
     * ==========================================================
     */

    private static confidence = 0;

    /**
     * ==========================================================
     * ERROR ESTIMADO (metros)
     * ==========================================================
     */

    private static estimatedError = 999;

    /**
     * ==========================================================
     * CANTIDAD DE OBSERVACIONES
     * ==========================================================
     */

    private static observations = 0;

    /**
     * ==========================================================
     * ESTADO DEL MOTOR
     * ==========================================================
     */

    private static running = false;

    /**
     * ==========================================================
     * INICIAR MOTOR
     * ==========================================================
     */

    static start(): void {

        this.running = true;

    }

    /**
     * ==========================================================
     * ¿ESTÁ ACTIVO?
     * ==========================================================
     */

    static isRunning(): boolean {

        return this.running;

    }


        /**
     * ==========================================================
     * CALCULAR POSICIÓN ESTIMADA
     * ==========================================================
     */

    static calculate(targets: RadarTarget[]): void {

        if (targets.length === 0) {

            return;

        }

        let latitudeSum = 0;

        let longitudeSum = 0;

        let weightSum = 0;

        targets.forEach(target => {

            const weight = Math.max(

                target.signalStrength,

                1

            );

            latitudeSum +=
                target.location.latitude * weight;

            longitudeSum +=
                target.location.longitude * weight;

            weightSum += weight;

        });

        this.latitude = latitudeSum / weightSum;

        this.longitude = longitudeSum / weightSum;

        this.observations = targets.length;

        this.calculateConfidence(targets);

        this.triangulations.push({

            latitude: this.latitude,

            longitude: this.longitude,

            confidence: this.confidence,

            estimatedError: this.estimatedError,

            observations: this.observations,

            timestamp: Date.now()

        });

        if (this.triangulations.length > 1000) {

            this.triangulations.shift();

        }

    }

    /**
     * ==========================================================
     * CALCULAR CONFIANZA
     * ==========================================================
     */

    private static calculateConfidence(
        targets: RadarTarget[]
    ): void {

        if (targets.length === 0) {

            this.confidence = 0;

            return;

        }

        let confidence = 0;

        targets.forEach(target => {

            confidence += target.confidence;

        });

        this.confidence =

            confidence / targets.length;

        this.estimatedError =

            Math.max(

                2,

                100 - this.confidence

            );

    }

        /**
     * ==========================================================
     * OBTENER LATITUD ESTIMADA
     * ==========================================================
     */

    static getLatitude(): number {

        return this.latitude;

    }

    /**
     * ==========================================================
     * OBTENER LONGITUD ESTIMADA
     * ==========================================================
     */

    static getLongitude(): number {

        return this.longitude;

    }

    /**
     * ==========================================================
     * OBTENER POSICIÓN ESTIMADA
     * ==========================================================
     */

    static getPosition() {

        return {

            latitude: this.latitude,

            longitude: this.longitude

        };

    }

    /**
     * ==========================================================
     * OBTENER CONFIANZA
     * ==========================================================
     */

    static getConfidence(): number {

        return this.confidence;

    }

    /**
     * ==========================================================
     * OBTENER ERROR ESTIMADO
     * ==========================================================
     */

    static getEstimatedError(): number {

        return this.estimatedError;

    }

    /**
     * ==========================================================
     * CANTIDAD DE OBSERVACIONES
     * ==========================================================
     */

    static getObservationCount(): number {

        return this.observations;

    }

    /**
     * ==========================================================
     * OBTENER TRIANGULACIONES
     * ==========================================================
     */

    static getTriangulations() {

        return [...this.triangulations];

    }

        /**
     * ==========================================================
     * ESTADO DEL MOTOR
     * ==========================================================
     */

    static getStatus() {

        return {

            running: this.running,

            latitude: this.latitude,

            longitude: this.longitude,

            confidence: this.confidence,

            estimatedError: this.estimatedError,

            observations: this.observations,

            triangulations: [...this.triangulations]

        };
        


    }

    /**
     * ==========================================================
     * HISTORIAL DE TRIANGULACIONES
     * ==========================================================
     */

    private static triangulations: TriangulationResult[] = [];

    /**
     * ==========================================================
     * LIMPIAR ESTADO
     * ==========================================================
     */

    static clear(): void {

        this.latitude = 0;

        this.longitude = 0;

        this.confidence = 0;

        this.estimatedError = 999;

        this.observations = 0;

        this.triangulations = [];

    }

    /**
     * ==========================================================
     * REINICIAR MOTOR
     * ==========================================================
     */

    static reset(): void {

        this.clear();

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

        this.reset();


    }

    
}