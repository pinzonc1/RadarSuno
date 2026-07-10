import RadarEngine from "../algorithms/RadarEngine";
import HeatMapEngine from "../algorithms/HeatMapEngine";
import TriangulationEngine from "../algorithms/TriangulationEngine";
import TargetFusionEngine from "../algorithms/TargetFusionEngine";
import MissionEngine from "../mission/MissionEngine";
import MissionLogService from "../services/MissionLogService";
import { MissionOutcome } from "../interfaces/MissionRecord";

export default class RadarController {

    /**
     * ==========================================================
     * INICIAR CONTROLADOR
     * ==========================================================
     */

    static async start(): Promise<void> {

        await MissionEngine.startMission();

    }

    /**
     * ==========================================================
     * DETENER CONTROLADOR
     * ==========================================================
     */

    static async stop(
        outcome: MissionOutcome = "completed",
        note?: string
    ): Promise<void> {

        await MissionEngine.stopMission(outcome, note);

    }

    /**
     * ==========================================================
     * OBJETIVOS DETECTADOS
     * ==========================================================
     */

    static getTargets() {

        return RadarEngine.getTargets();

    }

    /**
     * ==========================================================
     * OBJETIVO MÁS CERCANO
     * ==========================================================
     */

    static getNearestTarget() {

        return RadarEngine.getNearestTarget();

    }

    /**
     * ==========================================================
     * CANTIDAD DE OBJETIVOS
     * ==========================================================
     */

    static getTargetCount(): number {

        return RadarEngine.getTargetCount();

    }

    /**
     * ==========================================================
     * ¿MISIÓN ACTIVA?
     * ==========================================================
     */

    static isRunning(): boolean {

        return MissionEngine.getStatus().running;

    }

    /**
     * ==========================================================
     * OBJETIVOS ACTIVOS
     * ==========================================================
     */

    static getActiveTargets() {

        return RadarEngine.getActiveTargets();

    }

    /**
     * ==========================================================
     * MAPA DE CALOR
     * ==========================================================
     */

    static getHeatMap() {

        return HeatMapEngine.getHeatMap();

    }

    /**
     * ==========================================================
     * TRIANGULACIONES
     * ==========================================================
     */

    static getTriangulations() {

        return TriangulationEngine.getTriangulations();

    }

    /**
     * ==========================================================
     * OBJETIVOS FUSIONADOS
     * ==========================================================
     */

    static getFusionTargets() {

        return TargetFusionEngine.getTargets();

    }

    /**
     * ==========================================================
     * INFORMACIÓN DE LA MISIÓN
     * ==========================================================
     */

    static getMission() {

        return MissionEngine.getStatus();

    }

    /**
     * ==========================================================
     * ESTADO COMPLETO DEL RADAR
     * ==========================================================
     */

    static getStatus() {

        return {

            radar: RadarEngine.getStatus(),

            mission: MissionEngine.getStatus(),

            targets: this.getTargets(),

            activeTargets: this.getActiveTargets(),

            nearestTarget: this.getNearestTarget(),

            heatMap: this.getHeatMap(),

            triangulations: this.getTriangulations(),

            fusionTargets: this.getFusionTargets()

        };

    }

    static getMissionRecords() {

        return MissionLogService.getRecords();

    }

    static async loadMissionRecords() {

        return await MissionLogService.loadRecords();

    }

}
