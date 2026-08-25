/* ==========================================================================
   HTML5 CANVAS MATRIX RAIN BACKGROUND EFFECT
   Dynamically renders falling katakana/binary characters matching active theme.
   ========================================================================== */

class MatrixRain {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.columns = [];
        this.fontSize = 14;
        this.drops = [];
        this.chars = "01010101010101010101010101010101アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
        this.speed = 1;
        this.paused = false;
        
        this.init();
        window.addEventListener('resize', () => this.init());
        this.animate();
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.floor(Math.random() * -100);
        }
    }

    getThemeColor() {
        // Read CSS variable --main-color
        const style = getComputedStyle(document.body);
        return style.getPropertyValue('--main-color').trim() || '#00ff66';
    }

    animate() {
        if (!this.paused && this.ctx) {
            // Translucent black fill for trail trailing effect
            this.ctx.fillStyle = 'rgba(7, 12, 9, 0.08)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            const themeColor = this.getThemeColor();
            this.ctx.fillStyle = themeColor;
            this.ctx.font = `${this.fontSize}px 'Share Tech Mono', monospace`;

            for (let i = 0; i < this.drops.length; i++) {
                const text = this.chars.charAt(Math.floor(Math.random() * this.chars.length));
                const x = i * this.fontSize;
                const y = this.drops[i] * this.fontSize;

                this.ctx.fillText(text, x, y);

                if (y > this.canvas.height && Math.random() > 0.975) {
                    this.drops[i] = 0;
                }
                this.drops[i]++;
            }
        }
        requestAnimationFrame(() => this.animate());
    }

    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        return !this.paused;
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.matrixEffect = new MatrixRain('matrix-canvas');
});
