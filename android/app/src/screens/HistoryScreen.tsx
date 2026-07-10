import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { RadarTarget } from "../interfaces/RadarTarget";
import { MissionRecord } from "../interfaces/MissionRecord";

interface HistoryScreenProps {
    targets: RadarTarget[];
    pinnedIds: string[];
    ignoredIds: string[];
    missionRecords: MissionRecord[];
    onExportMission: (record: MissionRecord) => void;
}

export default function HistoryScreen({
    targets,
    pinnedIds,
    ignoredIds,
    missionRecords,
    onExportMission
}: HistoryScreenProps) {
    const historyItems = [...targets]
        .sort((a, b) => b.lastSeen - a.lastSeen)
        .map(target => ({
            ...target,
            pinned: pinnedIds.includes(target.id),
            ignored: ignoredIds.includes(target.id)
        }));

    const getTargetDisplayName = (target: RadarTarget): string =>
        target.bluetooth?.name ||
        target.wifi?.ssid ||
        target.name ||
        `${target.source.toUpperCase()} ${target.id.slice(-6).toUpperCase()}`;

    const renderHistoryItem = ({ item }: { item: RadarTarget & { pinned: boolean; ignored: boolean } }) => (
        <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>{getTargetDisplayName(item)}</Text>
                <Text style={styles.historyMeta}>{item.pinned ? "PIN" : item.ignored ? "IGNORADO" : item.source.toUpperCase()}</Text>
            </View>
            <Text style={styles.historyText}>Última vez: {new Date(item.lastSeen).toLocaleTimeString()}</Text>
            <Text style={styles.historyText}>Observaciones: {item.observations}</Text>
            <Text style={styles.historyText}>Confianza: {item.confidence}% · Señal: {item.signalStrength}</Text>
        </View>
    );

    const renderMission = (record: MissionRecord) => (
        <View key={record.id} style={styles.missionCard}>
            <View style={styles.historyHeader}>
                <View style={styles.missionTitleBlock}>
                    <Text style={styles.historyTitle} numberOfLines={1}>{record.id}</Text>
                    <Text style={styles.historyText}>
                        {record.outcome === "no_result" ? "Sin resultado" : record.outcome === "cancelled" ? "Cancelada" : "Finalizada"} · {Math.round(record.elapsedTime / 1000)} s
                    </Text>
                </View>
                <TouchableOpacity style={styles.exportButton} onPress={() => onExportMission(record)}>
                    <Text style={styles.exportText}>DESCARGAR</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.historyText}>Inicio: {new Date(record.startTime).toLocaleString()}</Text>
            <Text style={styles.historyText}>Recorrido: {record.totalDistance.toFixed(1)} m · Coordenadas: {record.path.length}</Text>
            <Text style={styles.historyText}>Objetivos registrados: {record.targets.length} · Sensores: {record.sensorSamples.length}</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>Registros de misión</Text>
            <Text style={styles.sectionSubtitle}>Cada cierre genera evidencia exportable de ruta, sensores, objetivos y estado.</Text>
            {missionRecords.length > 0 ? (
                missionRecords.map(renderMission)
            ) : (
                <Text style={styles.emptyText}>Aún no hay misiones finalizadas.</Text>
            )}
            <Text style={[styles.sectionTitle, styles.targetSectionTitle]}>Historial de objetivos</Text>
            <Text style={styles.sectionSubtitle}>Últimos objetivos detectados y su estado operativo.</Text>
            <FlatList
                data={historyItems}
                keyExtractor={item => item.id}
                renderItem={renderHistoryItem}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>Aún no se ha detectado ningún objetivo.</Text>}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827"
    },
    content: {
        padding: 16,
        paddingBottom: 32
    },
    sectionTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4
    },
    sectionSubtitle: {
        color: "#94A3B8",
        marginBottom: 16
    },
    listContent: {
        paddingBottom: 10
    },
    missionCard: {
        backgroundColor: "#0F172A",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#1E293B"
    },
    historyCard: {
        backgroundColor: "#0F172A",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
        gap: 12
    },
    missionTitleBlock: {
        flex: 1
    },
    historyTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700"
    },
    historyMeta: {
        color: "#94A3B8",
        fontSize: 12
    },
    historyText: {
        color: "#CBD5E1",
        fontSize: 13,
        marginBottom: 4
    },
    emptyText: {
        color: "#94A3B8",
        textAlign: "center",
        marginTop: 32
    },
    targetSectionTitle: {
        marginTop: 14
    },
    exportButton: {
        backgroundColor: "#2563EB",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9
    },
    exportText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700"
    }
});
