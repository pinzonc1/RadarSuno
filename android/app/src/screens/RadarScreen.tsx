import React from "react";

import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";

import RadarView from "../components/RadarView";
import StatusBarPanel from "../components/StatusBarPanel";
import BottomPanel from "../components/BottomPanel";
import { MissionOutcome } from "../interfaces/MissionRecord";

interface RadarScreenProps {
    status: any;
    missionStatus?: {
        bluetooth: boolean;
        wifi: boolean;
        gps: boolean;
    };
    running: boolean;
    onStart: () => Promise<void>;
    onStop: (outcome?: MissionOutcome, note?: string) => Promise<void>;
    errorMessage: string;
}

const RadarScreen: React.FC<RadarScreenProps> = ({
    status,
    missionStatus,
    running,
    onStart,
    onStop,
    errorMessage
}) => {
    const orientation = status?.mission?.sensors?.azimuth ?? 0;
    const elapsedSeconds = Math.round((status?.mission?.elapsedTime ?? 0) / 1000);
    const gps = status?.mission?.gps;
    const sensors = status?.mission?.sensors;

    return (
        <View style={styles.container}>
            <View style={styles.radarContainer}>
                <RadarView
                    targets={status?.targets ?? []}
                    rotation={orientation}
                    location={status?.mission?.gps?.latitude && status?.mission?.gps?.longitude ? {
                        latitude: status.mission.gps.latitude,
                        longitude: status.mission.gps.longitude
                    } : null}
                    route={status?.mission?.gps?.route ?? []}
                />
            </View>
            <View style={styles.actionPanel}>
                <View style={styles.missionStateCard}>
                    <View style={styles.missionStateHeader}>
                        <Text style={styles.missionStateTitle}>
                            {running ? "Misión activa" : status?.mission?.endTime ? "Misión finalizada" : "Misión en espera"}
                        </Text>
                        <Text style={[
                            styles.missionStateBadge,
                            running ? styles.runningBadge : styles.idleBadge
                        ]}>
                            {running ? "REGISTRANDO" : "CERRADA"}
                        </Text>
                    </View>
                    <Text style={styles.missionStateText}>
                        Tiempo: {elapsedSeconds}s · Recorrido: {(gps?.totalDistance ?? 0).toFixed(1)} m
                    </Text>
                    <Text style={styles.missionStateText} numberOfLines={1}>
                        GPS: {(gps?.latitude ?? 0).toFixed(6)}, {(gps?.longitude ?? 0).toFixed(6)} · Precisión {(gps?.accuracy ?? 0).toFixed(1)} m
                    </Text>
                    <Text style={styles.missionStateText}>
                        Acelerómetro: {sensors?.moving ? "movimiento detectado" : "estable"} · Azimut {(sensors?.azimuth ?? 0).toFixed(0)}°
                    </Text>
                </View>
                {running ? (
                    <View style={styles.runningActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.stopButton, styles.splitButton]}
                            onPress={() => onStop("completed", "Misión finalizada por el operador.")}
                        >
                            <Text style={styles.actionText}>Finalizar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.noResultButton, styles.splitButton]}
                            onPress={() => onStop("no_result", "Misión cerrada sin resultado útil.")}
                        >
                            <Text style={styles.actionText}>Sin resultado</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.startButton]}
                        onPress={onStart}
                    >
                        <Text style={styles.actionText}>Iniciar misión</Text>
                    </TouchableOpacity>
                )}
                {errorMessage ? (
                    <Text style={styles.errorText} numberOfLines={2}>{errorMessage}</Text>
                ) : null}
            </View>
            <StatusBarPanel
                gps={missionStatus?.gps ?? false}
                ble={missionStatus?.bluetooth ?? false}
                wifi={missionStatus?.wifi ?? false}
                sensors={status?.mission?.sensors?.running ?? false}
            />
            <BottomPanel
                targetCount={status?.targets?.length ?? 0}
                nearestTarget={status?.nearestTarget ?? null}
            />
        </View>
    );
};

export default RadarScreen;

const styles = StyleSheet.create({

    container: {

        flex: 1,

        backgroundColor: "#111827"

    },

    radarContainer: {

        flex: 1.8,
        minHeight: 340,

        justifyContent: "center",

        alignItems: "center"

    },

    actionPanel: {

        paddingHorizontal: 16,

        paddingBottom: 6

    },

    missionStateCard: {

        backgroundColor: "#0F172A",

        borderColor: "#1E293B",

        borderWidth: 1,

        borderRadius: 8,

        paddingHorizontal: 10,

        paddingVertical: 8,

        marginBottom: 8

    },

    missionStateHeader: {

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-between",

        gap: 10,

        marginBottom: 4

    },

    missionStateTitle: {

        color: "#FFFFFF",

        fontSize: 13,

        fontWeight: "700"

    },

    missionStateBadge: {

        overflow: "hidden",

        borderRadius: 8,

        paddingHorizontal: 8,

        paddingVertical: 3,

        color: "#FFFFFF",

        fontSize: 10,

        fontWeight: "700"

    },

    runningBadge: {

        backgroundColor: "#059669"

    },

    idleBadge: {

        backgroundColor: "#475569"

    },

    missionStateText: {

        color: "#CBD5E1",

        fontSize: 11,

        marginTop: 2

    },

    actionButton: {

        minHeight: 42,

        borderRadius: 14,

        alignItems: "center",

        justifyContent: "center"

    },

    runningActions: {

        flexDirection: "row",

        gap: 10

    },

    splitButton: {

        flex: 1

    },

    startButton: {

        backgroundColor: "#10B981"

    },

    stopButton: {

        backgroundColor: "#EF4444"

    },

    noResultButton: {

        backgroundColor: "#F59E0B"

    },

    actionText: {

        color: "#FFFFFF",

        fontWeight: "700",

        fontSize: 15

    },

    errorText: {

        color: "#FCA5A5",

        fontSize: 12,

        marginTop: 8,

        textAlign: "center"

    }

});
