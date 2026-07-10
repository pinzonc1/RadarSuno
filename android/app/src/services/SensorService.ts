import {
    accelerometer,
    magnetometer,
    gyroscope,
    
} from "react-native-sensors";

import {
    map
} from "rxjs/operators";

export default class SensorService {

    /**
     * ==========================================================
     * SUSCRIPCIONES
     * ==========================================================
     */

    private static accelerometerSubscription: any = null;

    private static magnetometerSubscription: any = null;

    private static gyroscopeSubscription: any = null;  

    /**
     * ==========================================================
     * ESTADO DEL SERVICIO
     * ==========================================================
     */

    private static running = false;

    /**
     * ==========================================================
     * ORIENTACIÓN
     * ==========================================================
     */

    private static azimuth = 0;

    private static pitch = 0;

    private static roll = 0;

    /**
     * ==========================================================
     * ACELERACIÓN
     * ==========================================================
     */

    private static acceleration = {

        x: 0,

        y: 0,

        z: 0

    };

    /**
     * ==========================================================
     * GIROSCOPIO
     * ==========================================================
     */

    private static rotation = {

        x: 0,

        y: 0,

        z: 0

    };

    /**
     * ==========================================================
     * MAGNETÓMETRO
     * ==========================================================
     */

    private static magneticField = {

        x: 0,

        y: 0,

        z: 0

    };

    /**
     * ==========================================================
     * MOVIMIENTO
     * ==========================================================
     */

    private static moving = false;

    private static lastMovement = 0;

    /**
     * ==========================================================
     * CONFIGURACIÓN
     * ==========================================================
     */


    /**
     * ==========================================================
     * INICIAR SERVICIO
     * ==========================================================
     */

        static start(): void {

        if (this.running) {

            return;

        }


        this.startSensors();

        this.running = true;

    }

        /**
     * ==========================================================
     * ACELERÓMETRO
     * ==========================================================
     */

    private static startAccelerometer(): void {

        try {
            this.accelerometerSubscription = accelerometer
                .pipe(
                    map(({ x, y, z }) => ({ x, y, z }))
                )
                .subscribe(({ x, y, z }) => {

                    this.acceleration = { x, y, z };

                    const magnitude = Math.sqrt(
                        x * x +
                        y * y +
                        z * z
                    );

                    this.moving = Math.abs(magnitude - 9.81) > 0.35;

                    if (this.moving) {

                        this.lastMovement = Date.now();
                    
                    }
                    this.refresh();

                }, () => {
                    this.accelerometerSubscription = null;
                });
        } catch {
            this.accelerometerSubscription = null;
        }

    }

    /**
     * ==========================================================
     * MAGNETÓMETRO
     * ==========================================================
     */

    private static startMagnetometer(): void {

        try {
            this.magnetometerSubscription = magnetometer
                .pipe(
                    map(({ x, y, z }) => ({ x, y, z }))
                )
                .subscribe(({ x, y, z }) => {

                    this.magneticField = { x, y, z };

                    this.refresh();

                }, () => {
                    this.magnetometerSubscription = null;
                });
        } catch {
            this.magnetometerSubscription = null;
        }

    }

    /**
     * ==========================================================
     * GIROSCOPIO
     * ==========================================================
     */

    private static startGyroscope(): void {

        try {
            this.gyroscopeSubscription = gyroscope
                .pipe(
                    map(({ x, y, z }) => ({ x, y, z }))
                )
                .subscribe(({ x, y, z }) => {

                    this.rotation = { x, y, z };
                
                    this.refresh();

                }, () => {
                    this.gyroscopeSubscription = null;
                });
        } catch {
            this.gyroscopeSubscription = null;
        }

    }

    /**
     * ==========================================================
     * INICIAR TODOS LOS SENSORES
     * ==========================================================
     */

    private static startSensors(): void {

        this.startAccelerometer();

        // Algunos dispositivos cierran la app al activar magnetometro/giroscopio.
        // Para iniciar el escaneo de forma estable usamos primero el acelerometro.

    }

        /**
     * ==========================================================
     * ACTUALIZAR ORIENTACIÓN
     * ==========================================================
     */

    private static updateOrientation(): void {

        const { x, y } = this.magneticField;

        let heading = Math.atan2(y, x) * (180 / Math.PI);

        if (heading < 0) {

            heading += 360;

        }

        this.azimuth = heading;

        this.pitch = Math.atan2(
            this.acceleration.x,
            Math.sqrt(
                this.acceleration.y * this.acceleration.y +
                this.acceleration.z * this.acceleration.z
            )
        ) * (180 / Math.PI);

        this.roll = Math.atan2(
            this.acceleration.y,
            this.acceleration.z
        ) * (180 / Math.PI);

    }

    /**
     * ==========================================================
     * ACTUALIZAR TODOS LOS DATOS
     * ==========================================================
     */

    private static refresh(): void {

        this.updateOrientation();

    }

    /**
     * ==========================================================
     * AZIMUTH (BRÚJULA)
     * ==========================================================
     */

    static getAzimuth(): number {

        this.refresh();

        return this.azimuth;

    }

    /**
     * ==========================================================
     * PITCH
     * ==========================================================
     */

    static getPitch(): number {

        this.refresh();

        return this.pitch;

    }

    /**
     * ==========================================================
     * ROLL
     * ==========================================================
     */

    static getRoll(): number {

        this.refresh();

        return this.roll;

    }

    /**
     * ==========================================================
     * ORIENTACIÓN COMPLETA
     * ==========================================================
     */

    static getOrientation() {

        this.refresh();

        return {

            azimuth: this.azimuth,

            pitch: this.pitch,

            roll: this.roll

        };

    }


        /**
     * ==========================================================
     * ACELERACIÓN
     * ==========================================================
     */

    static getAcceleration() {

        return {

            ...this.acceleration

        };

    }

    /**
     * ==========================================================
     * CAMPO MAGNÉTICO
     * ==========================================================
     */

    static getMagneticField() {

        return {

            ...this.magneticField

        };

    }

    /**
     * ==========================================================
     * ROTACIÓN
     * ==========================================================
     */

    static getRotation() {

        return {

            ...this.rotation

        };

    }

    /**
     * ==========================================================
     * ¿EL DISPOSITIVO ESTÁ EN MOVIMIENTO?
     * ==========================================================
     */

    static isMoving(): boolean {

        return this.moving;

    }

    /**
     * ==========================================================
     * ÚLTIMO MOVIMIENTO
     * ==========================================================
     */

    static getLastMovement(): number {

        return this.lastMovement;

    }

    /**
     * ==========================================================
     * ¿EL SERVICIO ESTÁ ACTIVO?
     * ==========================================================
     */

    static isRunning(): boolean {

        return this.running;

    }

    /**
     * ==========================================================
     * INFORMACIÓN COMPLETA DE SENSORES
     * ==========================================================
     */

    static getSensorData() {

        return {

            orientation: this.getOrientation(),

            acceleration: this.getAcceleration(),

            rotation: this.getRotation(),

            magneticField: this.getMagneticField(),

            moving: this.isMoving(),

            lastMovement: this.getLastMovement()

        };

    }

    /**
     * ==========================================================
     * ESTADO GENERAL DEL SERVICIO
     * ==========================================================
     */

    static getStatus() {

        return {

            running: this.running,

            moving: this.moving,

            azimuth: this.azimuth,

            pitch: this.pitch,

            roll: this.roll,

            acceleration: this.getAcceleration(),

            rotation: this.getRotation(),

            magneticField: this.getMagneticField(),

            lastMovement: this.lastMovement,

            accelerometer: this.accelerometerSubscription !== null,

            magnetometer: this.magnetometerSubscription !== null,

            gyroscope: this.gyroscopeSubscription !== null

        };

    }

        /**
     * ==========================================================
     * DETENER SERVICIO
     * ==========================================================
     */

    static stop(): void {

        this.accelerometerSubscription?.unsubscribe();

        this.magnetometerSubscription?.unsubscribe();

        this.gyroscopeSubscription?.unsubscribe();

        this.accelerometerSubscription = null;

        this.magnetometerSubscription = null;

        this.gyroscopeSubscription = null;

        this.running = false;

    }

    /**
     * ==========================================================
     * REINICIAR ESTADO
     * ==========================================================
     */

    static reset(): void {

        this.azimuth = 0;

        this.pitch = 0;

        this.roll = 0;

        this.acceleration = {

            x: 0,

            y: 0,

            z: 0

        };

        this.rotation = {

            x: 0,

            y: 0,

            z: 0

        };

        this.magneticField = {

            x: 0,

            y: 0,

            z: 0

        };

        this.moving = false;

        this.lastMovement = 0;

    }

    /**
     * ==========================================================
     * LIBERAR RECURSOS
     * ==========================================================
     */

    static destroy(): void {

        this.stop();

        this.reset();

    }

}
