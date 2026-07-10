/**
 * ==========================================================
 * RADARSURO
 * HeatPoint
 * ----------------------------------------------------------
 * Representa una observación realizada por el Radar.
 * Cada punto corresponde a una medición en una posición
 * determinada del rescatista.
 * ==========================================================
 */

export interface HeatPoint {

    /**
     * Identificador único del objetivo.
     */
    targetId: string;

    /**
     * Latitud donde se realizó la medición.
     */
    latitude: number;

    /**
     * Longitud donde se realizó la medición.
     */
    longitude: number;

    /**
     * Precisión GPS.
     */
    accuracy: number;

    /**
     * Momento de la observación.
     */
    timestamp: number;

        /**
     * Intensidad de la señal (0 - 100).
     */
    signalStrength: number;

    /**
     * RSSI original recibido.
     */
    rssi: number;

    /**
     * Distancia estimada al objetivo.
     */
    estimatedDistance: number;

    /**
     * Dirección (brújula) hacia donde apuntaba
     * el dispositivo al realizar la medición.
     */
    azimuth: number;

    /**
     * Inclinación vertical.
     */
    pitch: number;

    /**
     * Inclinación lateral.
     */
    roll: number;

        /**
     * Tecnología que originó la medición.
     */
    source: "bluetooth" | "wifi" | "hybrid";

    /**
     * Nivel de confianza de esta observación.
     * (0 - 100)
     */
    confidence: number;

    /**
     * Número de observaciones acumuladas
     * para este mismo objetivo.
     */
    observations: number;

    /**
     * ¿El objetivo continúa activo?
     */
    active: boolean;


}