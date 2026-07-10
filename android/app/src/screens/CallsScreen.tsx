import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, ScrollView } from "react-native";

const contacts = [
    { name: "Protección Civil Venezuela", phone: "+582412345678", role: "Emergencia" },
    { name: "Bomberos Caracas", phone: "+582124567890", role: "Rescate" },
    { name: "Cruz Roja Venezolana", phone: "+582412398765", role: "Asistencia" }
];

export default function CallsScreen() {
    const handleCall = async (phone: string) => {
        const url = `tel:${phone}`;
        const supported = await Linking.canOpenURL(url);

        if (!supported) {
            Alert.alert("No disponible", "El dispositivo no puede realizar llamadas telefónicas.");
            return;
        }

        Linking.openURL(url).catch(() => {
            Alert.alert("Error", "No se pudo iniciar la llamada.");
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Agenda de llamadas</Text>
            <Text style={styles.description}>
                Use estos accesos directos para contactar al equipo de rescate o soporte técnico.
            </Text>
            {contacts.map(contact => (
                <View key={contact.phone} style={styles.contactCard}>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactName} numberOfLines={2}>{contact.name}</Text>
                        <Text style={styles.contactRole}>{contact.role}</Text>
                        <Text style={styles.contactPhone}>{contact.phone}</Text>
                    </View>
                    <TouchableOpacity style={styles.callButton} onPress={() => handleCall(contact.phone)}>
                        <Text style={styles.callText}>LLAMAR</Text>
                    </TouchableOpacity>
                </View>
            ))}
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
        paddingBottom: 28
    },
    title: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 8
    },
    description: {
        color: "#94A3B8",
        fontSize: 14,
        marginBottom: 16
    },
    contactCard: {
        backgroundColor: "#0F172A",
        padding: 16,
        borderRadius: 18,
        marginBottom: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12
    },
    contactInfo: {
        flex: 1
    },
    contactName: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700"
    },
    contactRole: {
        color: "#94A3B8",
        fontSize: 12,
        marginTop: 4
    },
    contactPhone: {
        color: "#A5B4C3",
        fontSize: 12,
        marginTop: 2
    },
    callButton: {
        backgroundColor: "#10B981",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        minWidth: 88,
        alignItems: "center"
    },
    callText: {
        color: "#FFFFFF",
        fontWeight: "700"
    }
});
