import React from "react";

import {
    View,
    StyleSheet
} from "react-native";

import RadarCard from "./RadarCard";
import { RadarTarget } from "../interfaces/RadarTarget";

interface BottomPanelProps {
    targetCount?: number;
    nearestTarget?: RadarTarget | null;
}

export default function BottomPanel({
    targetCount = 0,
    nearestTarget = null
}: BottomPanelProps) {
    const distance = nearestTarget?.estimatedDistance != null
        ? `${nearestTarget.estimatedDistance.toFixed(1)} m`
        : "N/A";

    const direction = nearestTarget?.heading != null
        ? `${nearestTarget.heading.toFixed(0)}°`
        : "N/A";

    const rssi = nearestTarget?.bluetooth?.rssi != null
        ? `${nearestTarget.bluetooth.rssi} dBm`
        : nearestTarget?.wifi?.signalLevel != null
            ? `${nearestTarget.wifi.signalLevel} dBm`
            : "N/A";

    return (
        <View style={styles.container}>
            <View style={styles.cardSlot}>
                <RadarCard title="Objetivos" value={targetCount} />
            </View>
            <View style={styles.cardSlot}>
                <RadarCard title="Distancia" value={distance} />
            </View>
            <View style={styles.cardSlot}>
                <RadarCard title="Dirección" value={direction} />
            </View>
            <View style={styles.cardSlot}>
                <RadarCard title="RSSI" value={rssi} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 12,
        backgroundColor: "#111827",
        flexDirection: "row",
        flexWrap: "wrap"
    },
    cardSlot: {
        width: "50%",
        padding: 4
    }
});
