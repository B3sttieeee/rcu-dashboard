document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    const numParticles = 3500; // Liczba cząsteczek w dysku akrecyjnym
    
    const eventHorizonRadius = 100; // Wielkość czarnej dziury
    const diskRadius = 400; // Rozmiar rozbłysku

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    // Klasa pojedynczej cząsteczki światła w dysku
    class DiskParticle {
        constructor() {
            this.angle = Math.random() * Math.PI * 2;
            // Większe zagęszczenie blisko horyzontu zdarzeń (symulacja grawitacji)
            const r = Math.pow(Math.random(), 2);
            this.distance = eventHorizonRadius + 5 + (r * diskRadius);
            
            // Im bliżej dziury, tym szybciej wiruje
            this.speed = 15 / Math.pow(this.distance, 1.3);
            this.size = Math.random() * 1.5 + 0.5;
            
            // Kolor zależny od odległości: gorący biały/żółty blisko środka, fiolet/czerwień na zewnątrz
            const intensity = 1 - (this.distance - eventHorizonRadius) / diskRadius;
            if (intensity > 0.8) this.color = '#ffffff';
            else if (intensity > 0.5) this.color = '#ffcc00';
            else if (intensity > 0.2) this.color = '#ff3366';
            else this.color = '#6600cc';
        }

        update() {
            this.angle -= this.speed;
            
            // Obliczanie pozycji X i Z (Z określa głębię obrazu)
            this.x = Math.cos(this.angle) * this.distance;
            this.z = Math.sin(this.angle) * this.distance;
            
            // Spłaszczenie osi Y, by uzyskać efekt pochylenia (tilted view)
            this.y = this.z * 0.25; 
        }
    }

    function init() {
        resize();
        window.addEventListener('resize', resize);
        particles = [];
        for (let i = 0; i < numParticles; i++) {
            particles.push(new DiskParticle());
        }
        animate();
    }

    function animate() {
        // Tło kosmosu (lekkie zmazywanie zostawia płynne smugi świetlne)
        ctx.fillStyle = 'rgba(5, 5, 8, 0.3)';
        ctx.fillRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2; // Możesz odjąć np. 100, żeby przesunąć dziurę wyżej

        // 1. Aktualizacja cząsteczek
        particles.forEach(p => p.update());

        // 2. Sortowanie po osi Z! KRYTYCZNE DLA REALIZMU!
        // Dzięki temu cząsteczki "z tyłu" (z < 0) rysują się pierwsze
        particles.sort((a, b) => a.z - b.z);

        // 3. Rozdzielenie na tył i przód
        const backParticles = particles.filter(p => p.z < 0);
        const frontParticles = particles.filter(p => p.z >= 0);

        // Rysowanie tyłu
        drawParticles(backParticles, centerX, centerY);

        // 4. Rysowanie idealnie czarnego Horyzontu Zdarzeń oraz potężnej "poświaty" w tle
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Poświata grawitacyjna za kulą
        const glow = ctx.createRadialGradient(0, 0, eventHorizonRadius * 0.8, 0, 0, eventHorizonRadius * 2);
        glow.addColorStop(0, 'rgba(0,0,0,1)');
        glow.addColorStop(0.5, 'rgba(138, 43, 226, 0.4)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, eventHorizonRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Absolutnie czarna sfera
        ctx.beginPath();
        ctx.arc(0, 0, eventHorizonRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        
        // Cienka świetlna obwódka "photon ring" (pierścień fotonowy) na krawędzi
        ctx.beginPath();
        ctx.arc(0, 0, eventHorizonRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();

        // 5. Rysowanie przodu (cząsteczki zakrywają czarną kulę)
        drawParticles(frontParticles, centerX, centerY);

        requestAnimationFrame(animate);
    }

    function drawParticles(particleArray, cx, cy) {
        particleArray.forEach(p => {
            ctx.beginPath();
            ctx.arc(cx + p.x, cy + p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            // Dodanie rozmycia dla symulacji żarzącego się gazu
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.fill();
        });
        // Reset cieni dla wydajności
        ctx.shadowBlur = 0; 
    }

    init();
});
