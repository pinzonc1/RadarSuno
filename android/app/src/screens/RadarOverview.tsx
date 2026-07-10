import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import RadarView from "../components/RadarView";
import BottomPanel from "../components/BottomPanel";
import { RadarTarget } from "../interfaces/RadarTarget";

interface RadarOverviewProps {
    status: {
        targets: RadarTarget[];
        nearestTarget: RadarTarget | null;
        mission?: any;
        radar?: any;
    };
    running: boolean;
    onStart: () => Promise<void>;
    onStop: () => void;
    errorMessage: string;
}

export default function RadarOverview({
    status,
    running,
    onStart,
    onStop,
    errorMessage
}: RadarOverviewProps) {
    const activeCount = status.targets.filter(target => target.active).length;
    const totalCount = status.targets.length;

    return (
        <View style={styles.container}>
            <View style={styles.mapCard}>
                <RadarView targets={status.targets} />
            </View>

            <View style={styles.controls}>
                <Text style={styles.sectionTitle}>Estado del Radar</Text>
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, running ? styles.stopButton : styles.startButton]}
                        onPress={running ? onStop : onStart}
                    >
                        <Text style={styles.actionText}>{running ? "DETENER" : "INICIAR"}</Text>
                    </TouchableOpacity>
                    <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>{running ? "Misión activa" : "Misión detenida"}</Text>
                    </View>
                </View>
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            </View>

            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Dispositivos detectados</Text>
                    <Text style={styles.summaryValue}>{totalCount}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Activos</Text>
                    <Text style={styles.summaryValue}>{activeCount}</Text>
                </View>
            </View>

            <View style={styles.orientationCard}>
                <Text style={styles.sectionTitle}>Orientación</Text>
                <Text style={styles.orientationText}>Azimuth: {status.mission?.sensors?.azimuth?.toFixed(0) ?? "--"}°</Text>
                <Text style={styles.orientationText}>Pitch: {status.mission?.sensors?.pitch?.toFixed(0) ?? "--"}°</Text>
                <Text style={styles.orientationText}>Roll: {status.mission?.sensors?.roll?.toFixed(0) ?? "--"}°</Text>
                <Text style={styles.orientationText}>{status.mission?.sensors?.gyroscope ? "Giroscopio activo" : "Giroscopio detenido"}</Text>
            </View>

            <BottomPanel targetCount={totalCount} nearestTarget={status.nearestTarget} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    mapCard: {
        height: 300,
        borderRadius: 20,
        backgroundColor: "#0F172A",
        overflow: "hidden",
        marginBottom: 16
    },
    controls: {
        marginBottom: 16
    },
    sectionTitle: {
        color: "#E2E8F0",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    actionButton: {
        flex: 1,
        backgroundColor: "#10B981",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginRight: 12
    },
    stopButton: {
        backgroundColor: "#EF4444"
    },
    startButton: {
        backgroundColor: "#10B981"
    },
    actionText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700"
    },
    statusPill: {
        backgroundColor: "#1F2937",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14
    },
    statusPillText: {
        color: "#94A3B8",
        fontSize: 13,
        fontWeight: "600"
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16
    },
    summaryCard: {
        flex: 1,
        backgroundColor: "#0F172A",
        borderRadius: 16,
        padding: 16,
        marginRight: 8
    },
    summaryLabel: {
        color: "#94A3B8",
        fontSize: 13,
        marginBottom: 8
    },
    summaryValue: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "700"
    },
    orientationCard: {
        backgroundColor: "#0F172A",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16
    },
    orientationText: {
        color: "#CBD5E1",
        fontSize: 14,
        marginBottom: 6
    },
    errorText: {
        color: "#F87171",
        marginTop: 12,
        fontSize: 14
    }
});
