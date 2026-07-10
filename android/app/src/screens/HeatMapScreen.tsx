import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { HeatPoint } from "../interfaces/HeatPoint";
import { RadarTarget } from "../interfaces/RadarTarget";

interface HeatMapScreenProps {
    heatMap: HeatPoint[];
    targets: RadarTarget[];
}

export default function HeatMapScreen({ heatMap, targets }: HeatMapScreenProps) {
    const renderPoint = ({ item }: { item: HeatPoint }) => (
        <View style={styles.pointCard}>
            <Text style={styles.pointLabel}>ID: {item.targetId}</Text>
            <Text style={styles.pointText}>Lat: {item.latitude.toFixed(5)} / Lon: {item.longitude.toFixed(5)}</Text>
            <Text style={styles.pointText}>RSSI: {item.rssi} dBm · Señal: {item.signalStrength}</Text>
            <Text style={styles.pointText}>Dist: {item.estimatedDistance.toFixed(1)} m · Azim: {item.azimuth.toFixed(0)}°</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Mapa de calor</Text>
            <Text style={styles.sectionSubtitle}>{heatMap.length} puntos registrados</Text>

            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Dispositivos</Text>
                    <Text style={styles.summaryValue}>{targets.length}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Puntos</Text>
                    <Text style={styles.summaryValue}>{heatMap.length}</Text>
                </View>
            </View>

            <FlatList
                data={heatMap}
                keyExtractor={item => `${item.targetId}-${item.timestamp}`}
                renderItem={renderPoint}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay datos de calor disponibles.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
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
        fontSize: 12,
        marginBottom: 6
    },
    summaryValue: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "700"
    },
    listContent: {
        paddingBottom: 40
    },
    pointCard: {
        backgroundColor: "#0F172A",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14
    },
    pointLabel: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 6
    },
    pointText: {
        color: "#CBD5E1",
        fontSize: 12,
        marginBottom: 4
    },
    emptyText: {
        color: "#94A3B8",
        textAlign: "center",
        marginTop: 32
    }
});
