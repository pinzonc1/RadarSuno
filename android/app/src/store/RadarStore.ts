import RadarEngine from "../algorithms/RadarEngine";
import HeatMapEngine from "../algorithms/HeatMapEngine";
import TriangulationEngine from "../algorithms/TriangulationEngine";
import TargetFusionEngine from "../algorithms/TargetFusionEngine";
import MissionEngine from "../mission/MissionEngine";

export default class RadarController {

    /**
     * ==========================================================
     * INICIAR MISIÓN
     * ==========================================================
     */

    static async startMission(): Promise<void> {

        await RadarEngine.start();

        MissionEngine.startMission();

    }

    /**
     * ==========================================================
     * DETENER MISIÓN
     * ==========================================================
     */

    static stopMission(): void {

        RadarEngine.stop();

        MissionEngine.stopMission();

    }

    /**
     * ==========================================================
     * REINICIAR MISIÓN
     * ==========================================================
     */

    static resetMission(): void {

        RadarEngine.reset();

        HeatMapEngine.clear();

        TriangulationEngine.clear();

        TargetFusionEngine.clear();

        MissionEngine.resetMission();

    }

    /**
     * ==========================================================
     * FINALIZAR Y LIBERAR TODO
     * ==========================================================
     */

    static destroy(): void {

        RadarEngine.destroy();

        HeatMapEngine.clear();

        TriangulationEngine.clear();

        TargetFusionEngine.clear();

        MissionEngine.destroy();

    }

    /**
     * ==========================================================
     * ¿MISIÓN ACTIVA?
     * ==========================================================
     */

    static isRunning(): boolean {

        return RadarEngine.isRunning();

    }

}