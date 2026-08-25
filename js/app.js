/* ==========================================================================
   APPLICATION CONTROLLER
   Manages UI views, theme switches, audio/CRT toggles, and live clock.
   ========================================================================== */

class CyberApp {
    constructor() {
        this.themes = ['theme-red', 'theme-matrix', 'theme-cyber', 'theme-amber'];
        this.currentThemeIndex = 0;

        this.init();
    }

    init() {
        // Mode switchers
        const btnTerm = document.getElementById('btn-mode-term');
        const btnGui = document.getElementById('btn-mode-gui');

        if (btnTerm) btnTerm.addEventListener('click', () => this.switchView('terminal'));
        if (btnGui) btnGui.addEventListener('click', () => this.switchView('gui'));

        // Toggle buttons
        const toggleAudio = document.getElementById('toggle-audio');
        const toggleCrt = document.getElementById('toggle-crt');
        const toggleTheme = document.getElementById('toggle-theme');

        if (toggleAudio) {
            toggleAudio.addEventListener('click', () => {
                if (window.cyberAudio) {
                    const enabled = window.cyberAudio.toggleSound();
                    toggleAudio.classList.toggle('active', enabled);
                    document.body.classList.toggle('audio-on', enabled);
                }
            });
        }

        if (toggleCrt) {
            toggleCrt.addEventListener('click', () => {
                const isCrt = document.body.classList.toggle('CRT-on');
                toggleCrt.classList.toggle('active', isCrt);
            });
        }

        if (toggleTheme) {
            toggleTheme.addEventListener('click', () => this.cycleTheme());
        }

        // Print resume button
        const btnPrint = document.getElementById('btn-print-resume');
        if (btnPrint) {
            btnPrint.addEventListener('click', () => {
                window.print();
            });
        }

        // Start live UTC clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    switchView(mode) {
        const viewTerm = document.getElementById('terminal-view');
        const viewGui = document.getElementById('gui-view');
        const btnTerm = document.getElementById('btn-mode-term');
        const btnGui = document.getElementById('btn-mode-gui');

        if (mode === 'terminal') {
            viewTerm.classList.add('active');
            viewGui.classList.remove('active');
            btnTerm.classList.add('active');
            btnGui.classList.remove('active');
            const termInput = document.getElementById('terminal-input');
            if (termInput) termInput.focus();
        } else {
            viewGui.classList.add('active');
            viewTerm.classList.remove('active');
            btnGui.classList.add('active');
            btnTerm.classList.remove('active');
        }

        if (window.cyberAudio) window.cyberAudio.playSuccessChime();
    }

    cycleTheme() {
        document.body.classList.remove(this.themes[this.currentThemeIndex]);
        this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
        const newTheme = this.themes[this.currentThemeIndex];
        document.body.classList.add(newTheme);

        if (window.cyberAudio) window.cyberAudio.playSuccessChime();
        return newTheme;
    }

    updateClock() {
        const clockEl = document.getElementById('live-clock');
        if (!clockEl) return;

        const now = new Date();
        const options = {
            timeZone: 'Asia/Kolkata',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const istTime = new Intl.DateTimeFormat('en-IN', options).format(now);
        clockEl.textContent = `${istTime} IST`;
    }
}

// Global App Instance
window.addEventListener('DOMContentLoaded', () => {
    window.cyberApp = new CyberApp();
});
