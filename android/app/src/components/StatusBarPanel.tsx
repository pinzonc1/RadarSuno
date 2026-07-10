import React from "react";

import {
    View,
    Text,
    StyleSheet
} from "react-native";

interface StatusBarPanelProps {
    gps: boolean;
    ble: boolean;
    wifi: boolean;
    sensors: boolean;
}

export default function StatusBarPanel({
    gps,
    ble,
    wifi,
    sensors
}: StatusBarPanelProps) {
    const statusItems = [
        { label: "GPS", active: gps },
        { label: "BLE", active: ble },
        { label: "WiFi", active: wifi },
        { label: "Sensores", active: sensors }
    ];

    return (
        <View style={styles.container}>
            {statusItems.map(item => (
                <View style={styles.item} key={item.label}>
                    <Text style={styles.label}>{item.label}</Text>
                    <Text style={[styles.value, !item.active && styles.disabled]}>
                        {item.active ? "✔" : "✕"}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 64,
        paddingVertical: 8,
        backgroundColor: "#1F2937",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#2C3746"
    },
    item: {
        alignItems: "center",
        flex: 1,
        minWidth: 72
    },
    label: {
        color: "#94A3B8",
        fontSize: 12
    },
    value: {
        color: "#00FF88",
        fontWeight: "700",
        fontSize: 17
    },
    disabled: {
        color: "#F87171"
    }
});
