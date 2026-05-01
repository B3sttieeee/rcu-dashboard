document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('space-canvas');
    const ctx = canvas.getContext('2d');
    let width, height, stars = [], nebulaParticles = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    // --- GENERATOR MGŁAWICY ---
    function createNebula() {
        nebulaParticles = [];
        for (let i = 0; i < 40; i++) {
            nebulaParticles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 400 + 200,
                // Kolory mgławicy Oriona: róż, fiolet, błękit
                color: `hsla(${Math.random() * 60 + 260}, 70%, 20%, 0.03)`,
                vx: Math.random() * 0.2 - 0.1,
                vy: Math.random() * 0.2 - 0.1
            });
        }
    }

    // --- SILNIK CZARNEJ DZIURY ---
    function drawBlackHole(cx, cy) {
        const time = Date.now() * 0.001;
        
        // 1. Dysk akrecyjny (Grawitacyjne zagięcie światła)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.2); // Lekki przechył dysku

        for (let i = 0; i < 3; i++) {
            const grad = ctx.createRadialGradient(0, 0, 90, 0, 0, 250);
            grad.addColorStop(0, 'rgba(255, 120, 0, 0)');
            grad.addColorStop(0.2, 'rgba(255, 180, 50, 0.6)'); // Jasny pierścień
            grad.addColorStop(0.5, 'rgba(100, 30, 200, 0.2)'); // Fioletowa poświata
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            // Asymetryczne rozciągnięcie (efekt rotacji czarnej dziury)
            ctx.ellipse(0, Math.sin(time) * 5, 300 + Math.sin(time + i) * 20, 80, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // 2. Cień Horyzontu Zdarzeń (Absolutna czerń)
        ctx.beginPath();
        ctx.arc(cx, cy, 100, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();

        // 3. Pierścień Fotonowy (Błysk na krawędzi)
        const photonGrad = ctx.createRadialGradient(cx, cy, 98, cx, cy, 102);
        photonGrad.addColorStop(0, 'rgba(0,0,0,0)');
        photonGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
        photonGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = photonGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 102, 0, Math.PI * 2);
        ctx.fill();
    }

    function animate() {
        ctx.fillStyle = '#050508'; // Czyścimy tło
        ctx.fillRect(0, 0, width, height);

        // Rysujemy mgławicę (warstwa gazu)
        nebulaParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        });

        // Gwiazdy
        ctx.fillStyle = '#fff';
        stars.forEach(s => {
            s.y -= s.speed;
            if (s.y < 0) s.y = height;
            ctx.globalAlpha = s.opacity;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });
        ctx.globalAlpha = 1.0;

        // Renderowanie CZARNEJ DZIURY (zawsze na środku lub podąża za myszką)
        drawBlackHole(width / 2, height / 2 - 50);

        requestAnimationFrame(animate);
    }

    // Inicjalizacja gwiazd
    function createStars() {
        stars = [];
        for (let i = 0; i < 400; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random()
            });
        }
    }

    window.addEventListener('resize', () => {
        resize();
        createStars();
        createNebula();
    });

    resize();
    createStars();
    createNebula();
    animate();
});
