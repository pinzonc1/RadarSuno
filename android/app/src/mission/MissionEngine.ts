import { GPSService } from "../services/GPSService";
import SensorService from "../services/SensorService";
import WifiService from "../services/WifiService";

import RadarEngine from "../algorithms/RadarEngine";

import HeatMapEngine from "../algorithms/HeatMapEngine";
import TriangulationEngine from "../algorithms/TriangulationEngine";
import TargetFusionEngine from "../algorithms/TargetFusionEngine";
import MissionLogService from "../services/MissionLogService";
import { MissionOutcome } from "../interfaces/MissionRecord";

export default class MissionEngine {

    /**
     * ==========================================================
     * ESTADO DE LA MISIÓN
     * ==========================================================
     */

    private static running = false;

    /**
     * ==========================================================
     * TIEMPOS
     * ==========================================================
     */

    private static startTime = 0;

    private static endTime = 0;

    /**
     * ==========================================================
     * ACTUALIZACIONES
     * ==========================================================
     */

    private static updateInterval:
        ReturnType<typeof setInterval> | null = null;

    private static readonly UPDATE_RATE = 1000;

    /**
     * ==========================================================
     * INICIAR MISIÓN
     * ==========================================================
     */

    static async startMission(): Promise<void> {

        if (this.running) {

            return;

        }

        this.startTime = Date.now();

        this.endTime = 0;

        GPSService.resetMission();

        await RadarEngine.start();

        await MissionLogService.beginMission();

        HeatMapEngine.start();

        TriangulationEngine.start();

        TargetFusionEngine.start();

        this.running = true;

        this.updateInterval = setInterval(() => {
            MissionLogService.recordSnapshot({
                gps: GPSService.getStatus(),
                sensors: SensorService.getStatus(),
                targets: RadarEngine.getTargets()
            });
        }, this.UPDATE_RATE);

    }

     /**
     * ==========================================================
     * DETENER  MISIÓN
     * ==========================================================
     */

    static async stopMission(
        outcome: MissionOutcome = "completed",
        note?: string
    ): Promise<void> {

        if (!this.running) {

            return;

        }

        this.endTime = Date.now();

        this.running = false;

        /**
         * Detener motores
         */

        RadarEngine.stop();

        HeatMapEngine.stop();

        TriangulationEngine.stop();

        TargetFusionEngine.stop();

        MissionLogService.recordSnapshot({
            gps: GPSService.getStatus(),
            sensors: SensorService.getStatus(),
            targets: RadarEngine.getTargets()
        });

        await MissionLogService.finishMission(outcome, note);
        
        this.destroy();

    }

    static destroy(): void {

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

    }

    /**
 * ==========================================================
 * ESTADO DE LA MISIÓN
 * ==========================================================
 */

static getStatus() {

    return {

        running: this.running,

        startTime: this.startTime,

        endTime: this.endTime,

        elapsedTime:

            this.running

                ? Date.now() - this.startTime

                : this.endTime > 0

                    ? this.endTime - this.startTime

                    : 0,

        radar: RadarEngine.getStatus(),

        heatMap: HeatMapEngine.getStatus(),

        triangulation: TriangulationEngine.getStatus(),

        fusion: TargetFusionEngine.getStatus(),

        gps: GPSService.getStatus(),

        wifi: WifiService.getStatus(),

        sensors: SensorService.getStatus()

    };

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

        this.startTime = 0;

        this.endTime = 0;

    }
}
