import Sound from "react-native-sound";

export default class SoundService {
    private static sound: Sound | null = null;
    private static loaded = false;
    private static lastPlayTime = 0;

    static start(): void {
        if (this.sound) {
            return;
        }

        Sound.setCategory("Playback");

        this.sound = new Sound("radar_ping.mp3", Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.warn("SoundService: no se pudo cargar el sonido", error);
                this.sound = null;
                return;
            }
            this.loaded = true;
            this.sound?.setNumberOfLoops(0);
            this.sound?.setVolume(0.08);
        });
    }

    static update(distance: number | null): void {
        if (!this.loaded || !this.sound) {
            return;
        }

        const now = Date.now();
        const interval = this.getInterval(distance);

        if (now - this.lastPlayTime < interval) {
            return;
        }

        this.lastPlayTime = now;
        const volume = this.getVolume(distance);
        this.sound.setVolume(volume);

        this.sound.stop(() => {
            this.sound?.play((success) => {
                if (!success) {
                    console.warn("SoundService: reproducción fallida");
                }
            });
        });
    }

    static stop(): void {
        if (!this.sound) {
            return;
        }

        this.sound.stop();
        this.sound.release();
        this.sound = null;
        this.loaded = false;
        this.lastPlayTime = 0;
    }

    private static getInterval(distance: number | null): number {
        if (distance == null) {
            return 1400;
        }
        if (distance <= 3) {
            return 420;
        }
        if (distance <= 10) {
            return 760;
        }
        return 1100;
    }

    private static getVolume(distance: number | null): number {
        if (distance == null) {
            return 0.08;
        }
        const level = 1 - Math.min(distance / 20, 0.85);
        return Math.max(0.08, Math.min(level, 1));
    }
}
