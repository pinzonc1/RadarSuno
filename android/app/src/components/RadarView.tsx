import React, { useEffect, useMemo, useRef } from "react";
import { Animated, View, StyleSheet, Text, useWindowDimensions } from "react-native";
import { WebView } from "react-native-webview";
import { RadarTarget } from "../interfaces/RadarTarget";

interface RadarViewProps {
    targets?: RadarTarget[];
    rotation?: number;
    location?: {
        latitude: number;
        longitude: number;
    } | null;
    route?: Array<{
        latitude: number;
        longitude: number;
    }>;
}

export default function RadarView({ targets = [], rotation = 0, location = null, route = [] }: RadarViewProps) {
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const { width, height } = useWindowDimensions();
    const radarSize = Math.max(280, Math.min(width - 18, height * 0.58, 430));
    const center = radarSize / 2;
    const maxRadius = radarSize * 0.43;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 900,
                    useNativeDriver: true
                })
            ])
        ).start();
    }, [pulseAnim]);

    const pulseScale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.4]
    });

    const pulseOpacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.24, 0.05]
    });

    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const mapLocation = useMemo(
        () => location ?? { latitude: 6.2442, longitude: -75.5812 },
        [location]
    );
    const mapHtml = useMemo(() => {
        const mapRoute = route.length > 0 ? route : [mapLocation];
        const encodedRoute = JSON.stringify(mapRoute);

        return `<!doctype html>
<html>
<head>
<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
html, body, #map { height: 100%; width: 100%; padding: 0; margin: 0; background: #0f172a; }
.leaflet-control-container { display: none; }
.pulse {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #22c55e;
  border: 3px solid rgba(255,255,255,.9);
  box-shadow: 0 0 0 12px rgba(34,197,94,.22);
}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var route = ${encodedRoute};
var center = [${mapLocation.latitude}, ${mapLocation.longitude}];
var map = L.map('map', { zoomControl: false, attributionControl: false, dragging: false, touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false }).setView(center, ${location ? 17 : 13});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, crossOrigin: true }).addTo(map);
if (route.length > 1) {
  L.polyline(route.map(function(p) { return [p.latitude, p.longitude]; }), { color: '#38bdf8', weight: 5, opacity: .92 }).addTo(map);
}
L.marker(center, { icon: L.divIcon({ className: '', html: '<div class="pulse"></div>', iconSize: [24, 24], iconAnchor: [12, 12] }) }).addTo(map);
setTimeout(function(){ map.invalidateSize(); }, 150);
</script>
</body>
</html>`;
    }, [location, mapLocation, route]);

    const targetDots = useMemo(
        () => targets.map((target, index) => {
            const distance = Math.min(target.estimatedDistance / 60, 1);
            const heading = (target.heading ?? 0) - normalizedRotation;
            const angle = ((heading + 360) % 360) * Math.PI / 180;
            const radius = distance * maxRadius;
            const x = radius * Math.sin(angle);
            const y = -radius * Math.cos(angle);

            return {
                id: target.id,
                x,
                y,
                active: target.active,
                label: target.bluetooth?.name || target.wifi?.ssid || target.name || "OBJ",
                key: `${target.id}-${index}`
            };
        }),
        [targets, normalizedRotation, maxRadius]
    );

    return (
        <View style={styles.container}>
            <View style={styles.mapLayer} pointerEvents="none">
                <WebView
                    originWhitelist={["*"]}
                    source={{ html: mapHtml }}
                    style={styles.map}
                    javaScriptEnabled
                    domStorageEnabled
                    mixedContentMode="always"
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                />
            </View>
            <View
                style={[
                    styles.radarFrame,
                    {
                        width: radarSize,
                        height: radarSize,
                        borderRadius: center,
                        transform: [{ rotate: `${-normalizedRotation}deg` }]
                    }
                ]}
            >
                <View style={[styles.ring, {
                    width: radarSize * 0.875,
                    height: radarSize * 0.875,
                    borderRadius: radarSize * 0.4375,
                    left: radarSize * 0.0625,
                    top: radarSize * 0.0625,
                    borderColor: "rgba(16, 185, 129, 0.2)"
                }]} />
                <View style={[styles.ring, {
                    width: radarSize * 0.656,
                    height: radarSize * 0.656,
                    borderRadius: radarSize * 0.328,
                    left: radarSize * 0.172,
                    top: radarSize * 0.172,
                    borderColor: "rgba(16, 185, 129, 0.28)"
                }]} />
                <View style={[styles.ring, {
                    width: radarSize * 0.438,
                    height: radarSize * 0.438,
                    borderRadius: radarSize * 0.219,
                    left: radarSize * 0.281,
                    top: radarSize * 0.281,
                    borderColor: "rgba(16, 185, 129, 0.35)"
                }]} />
                <View style={[styles.centerDot, { left: center - 7, top: center - 7 }]} />

                {targetDots.map(dot => (
                    <React.Fragment key={dot.key}>
                        <Animated.View
                            style={[
                                styles.targetPulse,
                                {
                                    left: center + dot.x - 18,
                                    top: center + dot.y - 18,
                                    transform: [{ scale: pulseScale }],
                                    opacity: dot.active ? pulseOpacity : 0.14,
                                    backgroundColor: dot.active ? "rgba(52,211,153,0.22)" : "rgba(251,191,36,0.12)"
                                }
                            ]}
                        />
                        <View
                            style={[
                                styles.targetDot,
                                {
                                    left: center + dot.x - 6,
                                    top: center + dot.y - 6,
                                    backgroundColor: dot.active ? "#34D399" : "#FBBF24"
                                }
                            ]}
                        />
                    </React.Fragment>
                ))}
            </View>
            <Text style={styles.label}>{location ? "RADAR + MAPA GPS" : "RADAR + MAPA OSM"}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 4,
        width: "100%",
        overflow: "hidden"
    },
    mapLayer: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        opacity: 0.62,
        backgroundColor: "#0F172A"
    },
    map: {
        flex: 1,
        backgroundColor: "#0F172A"
    },
    radarFrame: {
        backgroundColor: "rgba(15, 23, 42, 0.44)",
        borderWidth: 2,
        borderColor: "#0F766E",
        overflow: "hidden"
    },
    ring: {
        position: "absolute",
        borderWidth: 1
    },
    targetPulse: {
        position: "absolute",
        width: 36,
        height: 36,
        borderRadius: 18
    },
    centerDot: {
        position: "absolute",
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#34D399",
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.4)"
    },
    targetDot: {
        position: "absolute",
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#0F172A"
    },
    label: {
        marginTop: 6,
        color: "#A7F3D0",
        fontWeight: "700",
        fontSize: 13
    }
});
