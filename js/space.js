document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    let backgroundStars = [];
    
    // Ustawienia symulacji
    const numParticles = 5000; // Zwiększona gęstość dysku akrecyjnego
    const numStars = 500;      // Gwiazdy w tle
    const eventHorizonRadius = 110; 
    const diskRadius = 450; 
    
    // Zmienne do efektu paralaksy (reakcja na myszkę)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Śledzenie ruchu myszki
    window.addEventListener('mousemove', (e) => {
        // Przekształcamy pozycję myszki na wartości od -1 do 1
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    // Gwiazdy w oddali
    class BackgroundStar {
        constructor() {
            this.x = (Math.random() - 0.5) * width * 2;
            this.y = (Math.random() - 0.5) * height * 2;
            this.size = Math.random() * 1.5;
            this.opacity = Math.random();
            this.speedX = (Math.random() - 0.5) * 0.2;
        }
        update(parallaxX, parallaxY) {
            // Reagują bardzo delikatnie na ruch kamery
            this.drawX = this.x - parallaxX * 0.1;
            this.drawY = this.y - parallaxY * 0.1;
            this.x += this.speedX;
        }
        draw() {
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(width/2 + this.drawX, height/2 + this.drawY, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0; // Reset
        }
    }

    // Cząsteczki dysku akrecyjnego wokół czarnej dziury
    class DiskParticle {
        constructor() {
            this.angle = Math.random() * Math.PI * 2;
            const r = Math.pow(Math.random(), 2);
            this.distance = eventHorizonRadius + 5 + (r * diskRadius);
            
            // Prędkość obrotowa (zgodna z prawami Keplera - im bliżej, tym szybciej)
            this.baseSpeed = 20 / Math.pow(this.distance, 1.2);
            this.size = Math.random() * 1.8 + 0.5;
        }

        update(parallaxX, parallaxY) {
            this.angle -= this.baseSpeed;
            
            // Wyliczanie fizycznej pozycji 3D
            const rawX = Math.cos(this.angle) * this.distance;
            const rawZ = Math.sin(this.angle) * this.distance;
            const rawY = rawZ * 0.22; // Spłaszczenie (tilt) dysku
            
            // Relatywistyczne Przesunięcie Dopplera (MAGIA)
            // Cząsteczki "zbliżające się" do nas (Math.cos(this.angle) > 0) stają się jaśniejsze i bardziej niebieskie
            // Cząsteczki "oddalające się" stają się ciemniejsze i bardziej czerwone
            const direction = Math.cos(this.angle); // Od -1 do 1
            const intensity = 1 - (this.distance - eventHorizonRadius) / diskRadius;
            
            if (direction > 0.3) {
                // Zbiliżają się (Blueshift - gorące, jasne)
                this.color = `rgba(200, 230, 255, ${intensity + 0.2})`;
                this.glowColor = '#aaddff';
            } else if (direction < -0.3) {
                // Oddalają się (Redshift - ciemniejsze, fioletowo/czerwone)
                this.color = `rgba(200, 50, 100, ${intensity - 0.2})`;
                this.glowColor = '#cc0055';
            } else {
                // Neutralna strefa
                this.color = `rgba(255, 200, 100, ${intensity})`;
                this.glowColor = '#ffaa00';
            }

            // Aplikacja Paralaksy (reakcja na myszkę)
            this.x = rawX - parallaxX * (0.5 + this.distance * 0.001);
            this.y = rawY - parallaxY * (0.5 + this.distance * 0.001);
            this.z = rawZ; // Ważne do sortowania głębi
        }
    }

    function init() {
        resize();
        window.addEventListener('resize', resize);
        
        particles = [];
        for (let i = 0; i < numParticles; i++) particles.push(new DiskParticle());
        
        backgroundStars = [];
        for (let i = 0; i < numStars; i++) backgroundStars.push(new BackgroundStar());
        
        animate();
    }

    function animate() {
        // Efekt rozmycia ruchu (Motion Blur)
        ctx.fillStyle = 'rgba(2, 2, 4, 0.3)';
        ctx.fillRect(0, 0, width, height);

        // Płynne podążanie kamery (interpolacja paralaksy)
        targetX += (mouseX * 100 - targetX) * 0.05;
        targetY += (mouseY * 100 - targetY) * 0.05;

        const centerX = width / 2;
        const centerY = height / 2 - 50; // Przesunięte lekko do góry

        // 1. Rysuj tło
        backgroundStars.forEach(star => {
            star.update(targetX, targetY);
            star.draw();
        });

        // 2. Aktualizacja i sortowanie dysku akrecyjnego
        particles.forEach(p => p.update(targetX, targetY));
        particles.sort((a, b) => a.z - b.z);

        const backParticles = particles.filter(p => p.z < 0);
        const frontParticles = particles.filter(p => p.z >= 0);

        // 3. Rysuj TYŁ dysku
        drawParticles(backParticles, centerX, centerY);

        // 4. Rysuj HORYZONT ZDARZEŃ (Czarną kulę z paralaksą)
        const bhDrawX = centerX - targetX * 0.3;
        const bhDrawY = centerY - targetY * 0.3;

        ctx.save();
        ctx.translate(bhDrawX, bhDrawY);
        
        // Zewnętrzna, asymetryczna poświata grawitacyjna (Doppler)
        const glow = ctx.createRadialGradient(0, 0, eventHorizonRadius * 0.7, 0, 0, eventHorizonRadius * 2.5);
        glow.addColorStop(0, 'rgba(0,0,0,1)');
        glow.addColorStop(0.3, 'rgba(138, 43, 226, 0.4)'); // Fioletowa baza
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, eventHorizonRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Absolutna pustka (Horyzont Zdarzeń)
        ctx.beginPath();
        ctx.arc(0, 0, eventHorizonRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        
        // Pierścień fotonowy (cienka granica światła)
        ctx.beginPath();
        ctx.arc(0, 0, eventHorizonRadius + 1, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.restore();

        // 5. Rysuj PRZÓD dysku (Zakrywa czarną kulę)
        drawParticles(frontParticles, centerX, centerY);

        requestAnimationFrame(animate);
    }

    function drawParticles(particleArray, cx, cy) {
        particleArray.forEach(p => {
            ctx.beginPath();
            // Przesunięcie pozycji rysowania o cel paralaksy by dysk zachował spójność
            ctx.arc(cx + p.x, cy + p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
    }

    init();
});
