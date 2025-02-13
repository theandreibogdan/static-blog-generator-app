class AudioManager {
    constructor() {
        this.sounds = {
            success: new Audio('components/audio/success.mp3'),
            error: new Audio('components/audio/error.mp3')
        };

        // Set default volumes
        this.sounds.success.volume = 0.5;
        this.sounds.error.volume = 0.5;

        // Load user preference from localStorage
        this.enabled = localStorage.getItem('notificationSound') !== 'disabled';
    }

    play(type) {
        if (!this.enabled) return;

        const sound = this.sounds[type];
        if (sound) {
            // Reset the audio to start
            sound.currentTime = 0;
            sound.play().catch(err => {
                console.log('Audio playback failed:', err);
            });
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('notificationSound', this.enabled ? 'enabled' : 'disabled');
        return this.enabled;
    }

    setVolume(volume) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = volume;
        });
    }
}

// Initialize audio manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.audioManager = new AudioManager();
}); 