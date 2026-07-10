import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { RadarTarget } from "../interfaces/RadarTarget";

interface DevicesScreenProps {
    targets: RadarTarget[];
    ignoredTargets: RadarTarget[];
    pinnedTargets: RadarTarget[];
    activeTargets: RadarTarget[];
    pinnedIds: string[];
    onIgnore: (id: string) => void;
    onPin: (id: string) => void;
    onRestore: (id: string) => void;
    onExport: () => void;
}

export default function DevicesScreen({
    targets,
    ignoredTargets,
    pinnedTargets,
    activeTargets,
    pinnedIds,
    onIgnore,
    onPin,
    onRestore,
    onExport
}: DevicesScreenProps) {
    const getTargetDisplayName = (target: RadarTarget): string =>
        target.bluetooth?.name ||
        target.wifi?.ssid ||
        target.name ||
        `${target.source.toUpperCase()} ${target.id.slice(-6).toUpperCase()}`;

    const renderTarget = ({ item }: { item: RadarTarget }) => {
        const isPinned = pinnedIds.includes(item.id);
        const displayName = getTargetDisplayName(item);

        return (
            <View style={styles.targetCard}>
                <View style={styles.targetHeader}>
                    <View style={styles.targetTitleBlock}>
                        <Text style={styles.targetName} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
                        <Text style={styles.targetSource}>{item.source.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.targetStatus}>{item.active ? "ACTIVO" : "INACTIVO"}</Text>
                </View>
                <View style={styles.targetRow}>
                    <Text style={styles.targetLabel}>ID:</Text>
                    <Text style={styles.targetValue} numberOfLines={2}>{item.id}</Text>
                </View>
                {item.bluetooth ? (
                    <View style={styles.targetRow}>
                        <Text style={styles.targetLabel}>BLE:</Text>
                        <Text style={styles.targetValue} numberOfLines={2}>{item.bluetooth.name || item.bluetooth.id}</Text>
                    </View>
                ) : null}
                {item.wifi ? (
                    <View style={styles.targetRow}>
                        <Text style={styles.targetLabel}>WiFi:</Text>
                        <Text style={styles.targetValue} numberOfLines={2}>{item.wifi.ssid} / {item.wifi.bssid}</Text>
                    </View>
                ) : null}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => onPin(item.id)}>
                        <Text style={styles.actionText}>{isPinned ? "DESPIN" : "PIN"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => onIgnore(item.id)}>
                        <Text style={styles.actionText}>IGNORAR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderIgnoredTarget = ({ item }: { item: RadarTarget }) => (
        <View style={styles.ignoredCard}>
            <View style={styles.ignoredInfo}>
                <Text style={styles.ignoredName} numberOfLines={1}>{getTargetDisplayName(item)}</Text>
                <Text style={styles.ignoredMeta} numberOfLines={1}>
                    {item.source.toUpperCase()} · {new Date(item.lastSeen).toLocaleTimeString()}
                </Text>
            </View>
            <TouchableOpacity style={styles.restoreButton} onPress={() => onRestore(item.id)}>
                <Text style={styles.restoreText}>REACTIVAR</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.sectionTitle}>Dispositivos escaneados</Text>
                    <Text style={styles.sectionSubtitle}>{targets.length} dispositivos disponibles</Text>
                </View>
                <TouchableOpacity style={styles.exportButton} onPress={onExport}>
                    <Text style={styles.exportText}>EXPORTAR</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Pines</Text>
                    <Text style={styles.summaryValue}>{pinnedTargets.length}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Activos</Text>
                    <Text style={styles.summaryValue}>{activeTargets.length}</Text>
                </View>
            </View>
            <FlatList
                data={targets}
                keyExtractor={item => item.id}
                renderItem={renderTarget}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={
                    ignoredTargets.length > 0 ? (
                        <View style={styles.ignoredBox}>
                            <Text style={styles.ignoredTitle}>Dispositivos ignorados</Text>
                            <Text style={styles.ignoredSubtitle}>Quedan guardados para reactivarlos si vuelve a hacer falta.</Text>
                            {ignoredTargets.map(item => (
                                <View key={item.id}>
                                    {renderIgnoredTarget({ item })}
                                </View>
                            ))}
                        </View>
                    ) : null
                }
                ListEmptyComponent={<Text style={styles.emptyText}>No hay dispositivos detectados aún.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        gap: 12
    },
    targetTitleBlock: {
        flex: 1,
        marginRight: 10
    },
    sectionTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700"
    },
    sectionSubtitle: {
        color: "#94A3B8",
        fontSize: 13,
        marginTop: 4
    },
    exportButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        flexShrink: 0
    },
    exportText: {
        color: "#FFFFFF",
        fontWeight: "700"
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
    targetCard: {
        backgroundColor: "#0F172A",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14
    },
    targetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12
    },
    targetName: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700"
    },
    targetSource: {
        color: "#94A3B8",
        marginTop: 4,
        fontSize: 12
    },
    targetStatus: {
        color: "#10B981",
        fontWeight: "700",
        fontSize: 12
    },
    targetRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8
    },
    targetLabel: {
        color: "#94A3B8",
        fontSize: 12
    },
    targetValue: {
        color: "#E5E7EB",
        fontSize: 12,
        flex: 1,
        textAlign: "right",
        marginLeft: 12
    },
    actionRow: {
        flexDirection: "row",
        marginTop: 12
    },
    actionButton: {
        flex: 1,
        backgroundColor: "#1F2937",
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: "center",
        marginRight: 8,
        minHeight: 44
    },
    actionText: {
        color: "#FFFFFF",
        fontWeight: "700"
    },
    emptyText: {
        color: "#94A3B8",
        textAlign: "center",
        marginTop: 32
    },
    ignoredBox: {
        marginTop: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#1F2937"
    },
    ignoredTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4
    },
    ignoredSubtitle: {
        color: "#94A3B8",
        fontSize: 12,
        marginBottom: 12
    },
    ignoredCard: {
        backgroundColor: "#111827",
        borderColor: "#334155",
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    ignoredInfo: {
        flex: 1
    },
    ignoredName: {
        color: "#E5E7EB",
        fontWeight: "700"
    },
    ignoredMeta: {
        color: "#94A3B8",
        fontSize: 12,
        marginTop: 3
    },
    restoreButton: {
        backgroundColor: "#10B981",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9
    },
    restoreText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700"
    }
});
