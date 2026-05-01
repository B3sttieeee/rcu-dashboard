document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    const numStars = 800; // Ilość gwiazd 3D

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    class Star {
        constructor() {
            // Rozrzuć gwiazdy w przestrzeni X, Y, Z
            this.x = (Math.random() - 0.5) * width * 2;
            this.y = (Math.random() - 0.5) * height * 2;
            this.z = Math.random() * width; // Oś Z odpowiada za głębię
            
            // Losuj kolor: Biały, jasnoniebieski, lekko złoty
            const r = Math.random();
            this.color = r > 0.8 ? '#ffcc00' : (r > 0.5 ? '#00ccff' : '#ffffff');
        }

        update() {
            this.z -= 1.5; // Prędkość lotu w naszą stronę
            
            if (this.z <= 0) {
                this.z = width;
                this.x = (Math.random() - 0.5) * width * 2;
                this.y = (Math.random() - 0.5) * height * 2;
            }
        }

        draw() {
            // Perspektywa (Rzutowanie 3D na 2D)
            let sx = (this.x / this.z) * width + width / 2;
            let sy = (this.y / this.z) * height + height / 2;
            
            // Gwiazda rośnie w miarę zbliżania się do ekranu
            let r = (1 - this.z / width) * 2.5;

            // Rysuj tylko, jeśli jest w kadrze
            if (sx > 0 && sx < width && sy > 0 && sy < height) {
                ctx.beginPath();
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }
    }

    function init() {
        resize();
        window.addEventListener('resize', resize);
        for (let i = 0; i < numStars; i++) stars.push(new Star());
        animate();
    }

    function animate() {
        // Czyści płótno z efektem delikatnej smugi świetlnej za gwiazdą
        ctx.fillStyle = 'rgba(1, 1, 3, 0.4)';
        ctx.fillRect(0, 0, width, height);

        stars.forEach(star => {
            star.update();
            star.draw();
        });

        requestAnimationFrame(animate);
    }

    init();
});
