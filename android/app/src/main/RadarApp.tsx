import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text, Share, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "../components/Header";
import RadarController from "../controllers/RadarController";
import RadarScreen from "../screens/RadarScreen";
import DevicesScreen from "../screens/DevicesScreen";
import CallsScreen from "../screens/CallsScreen";
import TermsScreen from "../screens/TermsScreen";
import PermissionScreen from "../screens/PermissionScreen";
import HistoryScreen from "../screens/HistoryScreen";
import { PermissionService } from "../services/PermissionService";
import MissionLogService from "../services/MissionLogService";
import { MissionOutcome, MissionRecord } from "../interfaces/MissionRecord";
import { RadarTarget } from "../interfaces/RadarTarget";

type ScreenKey = "radar" | "devices" | "history" | "calls" | "terms";

const IGNORED_IDS_KEY = "@RC:ignored_target_ids";
const IGNORED_TARGETS_KEY = "@RC:ignored_target_records";
const PINNED_IDS_KEY = "@RC:pinned_target_ids";

const RadarApp = () => {
    const [status, setStatus] = useState(RadarController.getStatus());
    const [running, setRunning] = useState(RadarController.isRunning());
    const [missionStatus, setMissionStatus] = useState<any>(null);
    const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [activeScreen, setActiveScreen] = useState<ScreenKey>("radar");
    const [pinnedIds, setPinnedIds] = useState<string[]>([]);
    const [ignoredIds, setIgnoredIds] = useState<string[]>([]);
    const [ignoredTargetRecords, setIgnoredTargetRecords] = useState<RadarTarget[]>([]);
    const [missionRecords, setMissionRecords] = useState<MissionRecord[]>([]);

    const refreshStatus = () => {
        setStatus(RadarController.getStatus());
        setRunning(RadarController.isRunning());
    };

    const refreshMissionStatus = async () => {
        const currentStatus = await PermissionService.getMissionStatus();
        setMissionStatus(currentStatus);
        if (currentStatus.bluetooth || currentStatus.wifi || currentStatus.gps) {
            await PermissionService.rememberActiveServices();
        }
        setPermissionsGranted(currentStatus.permissions);
        return currentStatus;
    };

    const handleTogglePin = (id: string) => {
        setPinnedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleToggleIgnore = (id: string) => {
        const target = (status?.targets ?? []).find(item => item.id === id);

        setPinnedIds(prev => prev.filter(item => item !== id));
        setIgnoredIds(prev => {
            if (prev.includes(id)) {
                setIgnoredTargetRecords(records => records.filter(item => item.id !== id));
                return prev.filter(item => item !== id);
            }

            if (target) {
                setIgnoredTargetRecords(records => [
                    { ...target, lastSeen: Date.now() },
                    ...records.filter(item => item.id !== id)
                ]);
            }

            return [...prev, id];
        });
    };

    const handleRestoreIgnored = (id: string) => {
        setIgnoredIds(prev => prev.filter(item => item !== id));
        setIgnoredTargetRecords(prev => prev.filter(item => item.id !== id));
    };

    const createExportCsv = () => {
        const targets = (status?.targets ?? []).filter(target => !ignoredIds.includes(target.id));
        const getTargetDisplayName = (target: RadarTarget): string =>
            target.bluetooth?.name ||
            target.wifi?.ssid ||
            target.name ||
            `${target.source.toUpperCase()} ${target.id.slice(-6).toUpperCase()}`;

        const header = [
            "ID",
            "Nombre",
            "Fuente",
            "RSSI/Señal",
            "Distancia (m)",
            "Dirección (°)",
            "Activo",
            "Última actualización"
        ].join(",");

        const rows = targets.map(target => {
            const signal = target.bluetooth?.rssi != null
                ? `${target.bluetooth.rssi}`
                : target.wifi?.signalLevel != null
                    ? `${target.wifi.signalLevel}`
                    : "";

            return [
                `"${target.id.replace(/"/g, '""')}"`,
                `"${getTargetDisplayName(target).replace(/"/g, '""')}"`,
                target.source,
                signal,
                target.estimatedDistance.toFixed(1),
                target.heading != null ? target.heading.toFixed(0) : "",
                target.active ? "Sí" : "No",
                new Date(target.lastSeen).toISOString()
            ].join(",");
        });

        return [header, ...rows].join("\n");
    };

    const handleExport = async () => {
        const targets = (status?.targets ?? []).filter(target => !ignoredIds.includes(target.id));
        if (targets.length === 0) {
            setErrorMessage("No hay dispositivos para exportar.");
            return;
        }

        const csv = createExportCsv();

        try {
            await Share.share({
                title: "RadarSuRo - Exportar datos",
                message: csv
            });
        } catch (error) {
            console.error("Export error", error);
            setErrorMessage("No se pudo compartir el archivo. Intente nuevamente.");
        }
    };

    const handleExportMission = async (record: MissionRecord) => {
        try {
            await Share.share({
                title: `RadarSuRo - Registro ${record.id}`,
                message: MissionLogService.createExportText(record)
            });
        } catch (error) {
            console.error("Mission export error", error);
            setErrorMessage("No se pudo compartir el registro de misión.");
        }
    };

    const requestPermissions = async () => {
        const granted = await PermissionService.requestAllPermissions();
        await refreshMissionStatus();
        setPermissionsGranted(granted);
        return granted;
    };

    useEffect(() => {
        refreshStatus();
        (async () => {
            await refreshMissionStatus();
            setMissionRecords(await RadarController.loadMissionRecords());
            try {
                const [savedIgnoredIds, savedIgnoredTargets, savedPinnedIds] = await Promise.all([
                    AsyncStorage.getItem(IGNORED_IDS_KEY),
                    AsyncStorage.getItem(IGNORED_TARGETS_KEY),
                    AsyncStorage.getItem(PINNED_IDS_KEY)
                ]);

                setIgnoredIds(savedIgnoredIds ? JSON.parse(savedIgnoredIds) : []);
                setIgnoredTargetRecords(savedIgnoredTargets ? JSON.parse(savedIgnoredTargets) : []);
                setPinnedIds(savedPinnedIds ? JSON.parse(savedPinnedIds) : []);
            } catch {
                setIgnoredIds([]);
                setIgnoredTargetRecords([]);
                setPinnedIds([]);
            }
        })();
        const interval = setInterval(() => {
            refreshStatus();
            refreshMissionStatus();
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        AsyncStorage.setItem(IGNORED_IDS_KEY, JSON.stringify(ignoredIds)).catch(() => {});
    }, [ignoredIds]);

    useEffect(() => {
        AsyncStorage.setItem(IGNORED_TARGETS_KEY, JSON.stringify(ignoredTargetRecords)).catch(() => {});
    }, [ignoredTargetRecords]);

    useEffect(() => {
        AsyncStorage.setItem(PINNED_IDS_KEY, JSON.stringify(pinnedIds)).catch(() => {});
    }, [pinnedIds]);

    const handleStart = async () => {
        try {
            setErrorMessage("");
            const currentStatus = await refreshMissionStatus();
            if (!currentStatus.permissions || !currentStatus.ready) {
                setErrorMessage(
                    currentStatus.startBlockedReason ||
                    "Permisos o servicios faltantes. Active Bluetooth o WiFi y ubicación, luego intente nuevamente."
                );
                return;
            }
            await RadarController.start();
            refreshStatus();
        } catch (error) {
            console.error("RadarApp: start error", error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "No se pudo iniciar la misión. Verifique permisos y conectividad."
            );
        }
    };

    const handleStop = async (
        outcome: MissionOutcome = "completed",
        note?: string
    ) => {
        await RadarController.stop(outcome, note);
        setMissionRecords(await RadarController.loadMissionRecords());
        refreshStatus();
    };

    const currentTargets = status?.targets ?? [];
    const visibleTargets = currentTargets.filter(target => !ignoredIds.includes(target.id));
    const activeTargets = visibleTargets.filter(target => target.active);
    const pinnedTargets = visibleTargets.filter(target => pinnedIds.includes(target.id));
    const ignoredTargets = [
        ...currentTargets.filter(target => ignoredIds.includes(target.id)),
        ...ignoredTargetRecords.filter(record =>
            ignoredIds.includes(record.id) &&
            !currentTargets.some(target => target.id === record.id)
        )
    ];

    const renderScreen = () => {
        switch (activeScreen) {
            case "devices":
                return (
                    <DevicesScreen
                        targets={visibleTargets}
                        ignoredTargets={ignoredTargets}
                        pinnedTargets={pinnedTargets}
                        activeTargets={activeTargets}
                        pinnedIds={pinnedIds}
                        onIgnore={handleToggleIgnore}
                        onPin={handleTogglePin}
                        onRestore={handleRestoreIgnored}
                        onExport={handleExport}
                    />
                );
            case "history":
                return (
                    <HistoryScreen
                        targets={currentTargets}
                        pinnedIds={pinnedIds}
                        ignoredIds={ignoredIds}
                        missionRecords={missionRecords}
                        onExportMission={handleExportMission}
                    />
                );
            case "calls":
                return <CallsScreen />;
            case "terms":
                return <TermsScreen />;
            default: {
                const radarStatus = {
                    ...status,
                    targets: visibleTargets,
                    nearestTarget: visibleTargets.reduce<RadarTarget | null>(
                        (nearest, current) =>
                            !nearest || current.estimatedDistance < nearest.estimatedDistance
                                ? current
                                : nearest,
                        null
                    )
                };

                return (
                    <RadarScreen
                        status={radarStatus}
                        missionStatus={missionStatus}
                        running={running}
                        onStart={handleStart}
                        onStop={handleStop}
                        errorMessage={errorMessage}
                    />
                );
            }
        }
    };

    if (!permissionsGranted) {
        return (
            <SafeAreaView style={styles.container}>
                <PermissionScreen
                    onRequestPermissions={requestPermissions}
                    status={missionStatus || undefined}
                    errorMessage={errorMessage}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabBar}
                contentContainerStyle={styles.tabBarContent}
            >
                {[
                    { key: "radar", label: "Radar" },
                    { key: "devices", label: "Dispositivos" },
                    { key: "history", label: "Registros" },
                    { key: "calls", label: "Emergencia" },
                    { key: "terms", label: "Condiciones" }
                ].map(item => (
                    <TouchableOpacity
                        key={item.key}
                        style={[
                            styles.tabButton,
                            activeScreen === item.key && styles.tabButtonActive
                        ]}
                        onPress={() => setActiveScreen(item.key as ScreenKey)}
                    >
                        <Text
                            style={[
                                styles.tabLabel,
                                activeScreen === item.key && styles.tabLabelActive
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View style={styles.screenContainer}>
                {renderScreen()}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827"
    },
    tabBar: {
        backgroundColor: "#0F172A",
        borderBottomWidth: 1,
        borderColor: "#1F2937",
        flexGrow: 0
    },
    tabBarContent: {
        flexGrow: 1,
        paddingHorizontal: 8
    },
    tabButton: {
        minWidth: 112,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: "center",
        borderBottomWidth: 2,
        borderColor: "transparent"
    },
    tabButtonActive: {
        borderColor: "#10B981"
    },
    tabLabel: {
        color: "#94A3B8",
        fontWeight: "600",
        fontSize: 13
    },
    tabLabelActive: {
        color: "#FFFFFF"
    },
    screenContainer: {
        flex: 1,
        minHeight: 0
    }
});

export default RadarApp;
