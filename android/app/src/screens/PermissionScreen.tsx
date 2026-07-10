import React from "react";

import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking,
    ScrollView
} from "react-native";

interface ServiceStatus {
    permissions: boolean;
    bluetooth: boolean;
    wifi: boolean;
    gps: boolean;
    ready: boolean;
    remembered?: {
        bluetooth: boolean;
        wifi: boolean;
        gps: boolean;
    };
}

interface PermissionScreenProps {
    onRequestPermissions: () => Promise<boolean>;
    onOpenSettings?: () => void;
    status?: ServiceStatus;
    errorMessage: string;
}

export default function PermissionScreen({
    onRequestPermissions,
    onOpenSettings,
    status,
    errorMessage
}: PermissionScreenProps) {
    const handleOpenSettings = async () => {
        if (onOpenSettings) {
            onOpenSettings();
            return;
        }
        await Linking.openSettings();
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Permisos y conectividad</Text>
            <Text style={styles.description}>
                La aplicación necesita permisos y servicios habilitados para operar el radar correctamente.
            </Text>
            {status ? (
                <View style={styles.statusBox}>
                    <Text style={styles.statusTitle}>Estado actual</Text>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Permisos</Text>
                        <Text style={[styles.statusValue, status.permissions ? styles.active : styles.inactive]}>
                            {status.permissions ? "OK" : "Falta"}
                        </Text>
                    </View>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Bluetooth</Text>
                        <Text style={[styles.statusValue, status.bluetooth ? styles.active : styles.inactive]}>
                            {status.bluetooth ? "Activo" : "Inactivo"}
                        </Text>
                    </View>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>WiFi</Text>
                        <Text style={[styles.statusValue, status.wifi ? styles.active : styles.inactive]}>
                            {status.wifi ? "Activo" : "Inactivo"}
                        </Text>
                    </View>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>GPS</Text>
                        <Text style={[styles.statusValue, status.gps ? styles.active : styles.inactive]}>
                            {status.gps ? "Activo" : "Inactivo"}
                        </Text>
                    </View>
                    {status.remembered ? (
                        <View style={styles.rememberedRow}>
                            <Text style={styles.rememberedTitle}>Activación recordada</Text>
                            <Text style={styles.rememberedText}>
                                Bluetooth: {status.remembered.bluetooth ? "Sí" : "No"} · WiFi: {status.remembered.wifi ? "Sí" : "No"} · GPS: {status.remembered.gps ? "Sí" : "No"}
                            </Text>
                        </View>
                    ) : null}
                </View>
            ) : null}
            <TouchableOpacity
                style={styles.button}
                onPress={onRequestPermissions}
            >
                <Text style={styles.buttonText}>Solicitar permisos / actualizar</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleOpenSettings}
            >
                <Text style={styles.buttonText}>Abrir ajustes</Text>
            </TouchableOpacity>
            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827"
    },
    content: {
        flexGrow: 1,
        padding: 24,
        justifyContent: "center",
        alignItems: "center"
    },
    title: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 12,
        textAlign: "center"
    },
    description: {
        color: "#A5B4C3",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22
    },
    statusBox: {
        width: "100%",
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 16,
        marginBottom: 24
    },
    statusTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12
    },
    statusRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8
    },
    statusLabel: {
        color: "#94A3B8",
        fontSize: 14
    },
    statusValue: {
        fontSize: 14,
        fontWeight: "700"
    },
    active: {
        color: "#10B981"
    },
    inactive: {
        color: "#F87171"
    },
    rememberedRow: {
        marginTop: 12
    },
    rememberedTitle: {
        color: "#E2E8F0",
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 4
    },
    rememberedText: {
        color: "#A5B4C3",
        fontSize: 13
    },
    button: {
        width: "100%",
        backgroundColor: "#10B981",
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 12
    },
    secondaryButton: {
        backgroundColor: "#2563EB"
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700"
    },
    errorText: {
        marginTop: 20,
        color: "#F87171",
        textAlign: "center",
        fontSize: 14
    }
});
