import AsyncStorage from "@react-native-async-storage/async-storage";
import { RadarTarget } from "../interfaces/RadarTarget";
import { MissionOutcome, MissionRecord } from "../interfaces/MissionRecord";

const STORAGE_KEY = "@RC:mission_records";
const MAX_RECORDS = 30;
const MAX_SAMPLES = 900;

export default class MissionLogService {
    private static activeRecord: MissionRecord | null = null;
    private static records: MissionRecord[] = [];
    private static loaded = false;

    static async loadRecords(): Promise<MissionRecord[]> {
        if (this.loaded) {
            return [...this.records];
        }

        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            this.records = raw ? JSON.parse(raw) : [];
        } catch {
            this.records = [];
        }

        this.loaded = true;
        return [...this.records];
    }

    static getRecords(): MissionRecord[] {
        return [...this.records];
    }

    static getActiveRecord(): MissionRecord | null {
        return this.activeRecord ? { ...this.activeRecord } : null;
    }

    static async beginMission(): Promise<MissionRecord> {
        await this.loadRecords();

        const startTime = Date.now();
        this.activeRecord = {
            id: `MISSION-${startTime}`,
            status: "running",
            outcome: null,
            startTime,
            endTime: null,
            elapsedTime: 0,
            totalDistance: 0,
            path: [],
            sensorSamples: [],
            targets: [],
            notes: []
        };

        return this.activeRecord;
    }

    static recordSnapshot(snapshot: {
        gps: any;
        sensors: any;
        targets: RadarTarget[];
    }): void {
        if (!this.activeRecord) {
            return;
        }

        const timestamp = Date.now();
        this.activeRecord.elapsedTime = timestamp - this.activeRecord.startTime;
        this.activeRecord.totalDistance = snapshot.gps?.totalDistance ?? this.activeRecord.totalDistance;
        this.activeRecord.targets = snapshot.targets.map(target => ({ ...target }));

        const hasCoordinates =
            typeof snapshot.gps?.latitude === "number" &&
            typeof snapshot.gps?.longitude === "number" &&
            snapshot.gps.latitude !== 0 &&
            snapshot.gps.longitude !== 0;

        if (hasCoordinates) {
            const previousPoint = this.activeRecord.path[this.activeRecord.path.length - 1];
            const samePoint = previousPoint &&
                previousPoint.latitude === snapshot.gps.latitude &&
                previousPoint.longitude === snapshot.gps.longitude;

            if (!samePoint) {
                this.activeRecord.path.push({
                    latitude: snapshot.gps.latitude,
                    longitude: snapshot.gps.longitude,
                    altitude: snapshot.gps.altitude,
                    accuracy: snapshot.gps.accuracy,
                    speed: snapshot.gps.speed,
                    heading: snapshot.gps.heading,
                    timestamp: snapshot.gps.lastUpdate || timestamp
                });
            }
        }

        this.activeRecord.sensorSamples.push({
            timestamp,
            orientation: {
                azimuth: snapshot.sensors?.azimuth ?? 0,
                pitch: snapshot.sensors?.pitch ?? 0,
                roll: snapshot.sensors?.roll ?? 0
            },
            acceleration: snapshot.sensors?.acceleration ?? { x: 0, y: 0, z: 0 },
            moving: snapshot.sensors?.moving ?? false
        });

        if (this.activeRecord.path.length > MAX_SAMPLES) {
            this.activeRecord.path.shift();
        }

        if (this.activeRecord.sensorSamples.length > MAX_SAMPLES) {
            this.activeRecord.sensorSamples.shift();
        }
    }

    static async finishMission(outcome: MissionOutcome, note?: string): Promise<MissionRecord | null> {
        if (!this.activeRecord) {
            return null;
        }

        await this.loadRecords();

        const endTime = Date.now();
        const finishedRecord: MissionRecord = {
            ...this.activeRecord,
            status: "finished",
            outcome,
            endTime,
            elapsedTime: endTime - this.activeRecord.startTime,
            notes: note ? [...this.activeRecord.notes, note] : [...this.activeRecord.notes]
        };

        this.records = [finishedRecord, ...this.records].slice(0, MAX_RECORDS);
        this.activeRecord = null;
        await this.persist();

        return finishedRecord;
    }

    static async persist(): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
        } catch {
        }
    }

    static createExportText(record: MissionRecord): string {
        const outcomeLabel = record.outcome === "no_result"
            ? "Mision sin resultado util"
            : record.outcome === "cancelled"
                ? "Mision cancelada"
                : "Mision completada";
        const movementSamples = record.sensorSamples.filter(sample => sample.moving).length;

        return JSON.stringify({
            mission: {
                id: record.id,
                status: record.status,
                outcome: record.outcome,
                outcomeLabel,
                startTime: new Date(record.startTime).toISOString(),
                endTime: record.endTime ? new Date(record.endTime).toISOString() : null,
                elapsedSeconds: Math.round(record.elapsedTime / 1000),
                totalDistanceMeters: Number(record.totalDistance.toFixed(2)),
                pathPoints: record.path.length,
                targetCount: record.targets.length,
                sensorSamples: record.sensorSamples.length,
                movementSamples
            },
            locationSummary: {
                firstCoordinate: record.path[0] ?? null,
                lastCoordinate: record.path[record.path.length - 1] ?? null
            },
            path: record.path,
            sensors: record.sensorSamples,
            targets: record.targets,
            notes: record.notes
        }, null, 2);
    }
}
