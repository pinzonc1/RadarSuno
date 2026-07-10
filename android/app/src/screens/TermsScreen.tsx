import React from "react";
import { Text, ScrollView, StyleSheet } from "react-native";

export default function TermsScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Términos y condiciones</Text>
            <Text style={styles.subtitle}>RadarSuRo</Text>
            <Text style={styles.sectionTitle}>Creadores</Text>
            <Text style={styles.paragraph}>Este proyecto fue desarrollado por Carlos Pinzón y GitHub Copilot para apoyar a Venezuela en situaciones de emergencia y búsqueda.</Text>
            <Text style={styles.sectionTitle}>Sobre el proyecto</Text>
            <Text style={styles.paragraph}>RadarSuRo es una herramienta de apoyo para equipos de rescate y comunidades, que combina detección Bluetooth, Wi-Fi y GPS para ofrecer una visualización de proximidad de posibles señales de dispositivos cercanos.</Text>
            <Text style={styles.paragraph}>El objetivo principal es ayudar a mejorar la respuesta en emergencias en Venezuela, facilitando información de ubicación y estados de conectividad al personal de rescate.</Text>
            <Text style={styles.sectionTitle}>Política de privacidad</Text>
            <Text style={styles.paragraph}>RadarSuRo recolecta únicamente datos temporales del entorno inmediato: objetivos detectados por Bluetooth y Wi-Fi, además de la ubicación GPS cuando el usuario autoriza los permisos. Estos datos se usan exclusivamente para mostrar el radar y exportar estados de misión.</Text>
            <Text style={styles.paragraph}>No se almacena información personal sensible del usuario, y cualquier dato guardado localmente se utiliza para mejorar la experiencia de la aplicación, como recordar servicios activos.</Text>
            <Text style={styles.sectionTitle}>Condiciones de uso</Text>
            <Text style={styles.paragraph}>El uso de RadarSuRo implica que el usuario acepta operar la aplicación en modo horizontal y bajo su propia responsabilidad al acceder a los permisos solicitados.</Text>
            <Text style={styles.paragraph}>La aplicación no reemplaza a los servicios oficiales de emergencia. Se recomienda confirmar los datos de ubicación y conectividad con los equipos de rescate antes de tomar decisiones críticas.</Text>
            <Text style={styles.sectionTitle}>Contacto</Text>
            <Text style={styles.paragraph}>Para reportar errores, mejoras o dudas, escriba a: Youbriefsoft@gmail.com.</Text>
            <Text style={styles.paragraph}>También puede usar los canales habituales de su equipo de rescate para comunicar cualquier requerimiento operativo.</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827"
    },
    content: {
        padding: 24
    },
    title: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8
    },
    subtitle: {
        color: "#94A3B8",
        fontSize: 14,
        marginBottom: 20
    },
    sectionTitle: {
        color: "#10B981",
        fontSize: 16,
        fontWeight: "700",
        marginTop: 16,
        marginBottom: 8
    },
    paragraph: {
        color: "#E5E7EB",
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 12
    }
});
