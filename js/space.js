// space.js - Zaawansowane tło kosmiczne z mgławicą i czarną dziurą

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });

    let width = 0;
    let height = 0;
    let stars = [];
    let nebulaParticles = [];
    let time = 0;

    // --- Resize ---
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    // --- Tworzenie gwiazd (z warstwami dla głębi) ---
    function createStars() {
        stars = [];
        
        // Bliskie gwiazdy (jasne, większe)
        for (let i = 0; i < 300; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2.2 + 0.8,
                speed: Math.random() * 0.6 + 0.25,
                opacity: Math.random() * 0.4 + 0.6,
                twinkleSpeed: Math.random() * 0.015 + 0.008,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }

        // Dalekie gwiazdy (małe, słabe)
        for (let i = 0; i < 600; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.1 + 0.4,
                speed: Math.random() * 0.25 + 0.08,
                opacity: Math.random() * 0.35 + 0.25,
                twinkleSpeed: Math.random() * 0.008 + 0.003,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    // --- Tworzenie mgławicy (dużo lepsza jakość) ---
    function createNebula() {
        nebulaParticles = [];

        const colors = [
            'hsla(270, 65%, 25%, 0.035)', // fiolet
            'hsla(290, 70%, 22%, 0.03)',  // magenta
            'hsla(240, 60%, 28%, 0.025)', // błękit
            'hsla(200, 55%, 30%, 0.02)'   // cyjan
        ];

        for (let i = 0; i < 35; i++) {
            nebulaParticles.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.9,
                radius: Math.random() * 520 + 280,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.12,
                distortion: Math.random() * 0.3 + 0.8
            });
        }
    }

    // --- Zaawansowane rysowanie czarnej dziury ---
    function drawBlackHole(cx, cy) {
        time = Date.now() * 0.001;

        ctx.save();

        // 1. Dysk akrecyjny z wieloma warstwami
        ctx.translate(cx, cy);
        ctx.rotate(-0.25 + Math.sin(time * 0.1) * 0.03);

        for (let i = 0; i < 5; i++) {
            const offset = i * 12;
            const grad = ctx.createRadialGradient(0, 0, 85, 0, offset * 0.6, 320);

            grad.addColorStop(0, 'rgba(255, 180, 60, 0)');
            grad.addColorStop(0.15, `rgba(255, 220, 100, ${0.75 - i * 0.12})`);
            grad.addColorStop(0.4, `rgba(180, 80, 255, ${0.45 - i * 0.08})`);
            grad.addColorStop(0.7, 'rgba(80, 30, 180, 0.08)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(
                Math.sin(time + i) * 8,
                Math.cos(time * 1.3 + i) * 6,
                310 + Math.sin(time * 2 + i) * 25,
                65 + Math.sin(time * 1.7) * 12,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();

        // 2. Horyzont zdarzeń (czarna dziura)
        const eventHorizonGrad = ctx.createRadialGradient(cx, cy, 88, cx, cy, 115);
        eventHorizonGrad.addColorStop(0, '#000000');
        eventHorizonGrad.addColorStop(1, 'rgba(20, 10, 40, 0.9)');

        ctx.beginPath();
        ctx.arc(cx, cy, 102, 0, Math.PI * 2);
        ctx.fillStyle = eventHorizonGrad;
        ctx.fill();

        // 3. Pierścień fotonowy (bardzo jasny, dynamiczny)
        const photonRing = ctx.createRadialGradient(cx - 4, cy - 6, 98, cx, cy, 118);
        photonRing.addColorStop(0, 'rgba(255,255,255,0)');
        photonRing.addColorStop(0.45, 'rgba(255, 240, 200, 0.95)');
        photonRing.addColorStop(0.52, 'rgba(255, 180, 100, 0.8)');
        photonRing.addColorStop(0.65, 'rgba(200, 100, 255, 0.6)');
        photonRing.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ffdd88';
        ctx.fillStyle = photonRing;
        ctx.beginPath();
        ctx.arc(cx, cy, 110, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. Delikatna poświata wokół
        ctx.save();
        ctx.shadowBlur = 80;
        ctx.shadowColor = '#a080ff';
        ctx.fillStyle = 'rgba(140, 90, 255, 0.12)';
        ctx.beginPath();
        ctx.arc(cx, cy, 145, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // --- Główna pętla animacji ---
    function animate() {
        // Delikatne czyszczenie z lekkim "motion blur" efektem
        ctx.fillStyle = 'rgba(5, 5, 8, 0.92)';
        ctx.fillRect(0, 0, width, height);

        // Mgławica
        nebulaParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Lekkie zawijanie na krawędziach
            if (p.x < -p.radius) p.x = width + p.radius;
            if (p.x > width + p.radius) p.x = -p.radius;
            if (p.y < -p.radius) p.y = height + p.radius;
            if (p.y > height + p.radius) p.y = -p.radius;

            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            grad.addColorStop(0, p.color);
            grad.addColorStop(0.6, 'transparent');

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        });

        // Gwiazdy z migotaniem
        stars.forEach(s => {
            s.y -= s.speed;

            if (s.y < 0) {
                s.y = height;
                s.x = Math.random() * width;
            }

            const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.15 + 0.85;

            ctx.globalAlpha = s.opacity * twinkle;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(s.x, s.y, s.size, s.size);

            // Bardzo jasne gwiazdy dostają delikatny "glow"
            if (s.size > 2.2) {
                ctx.shadowBlur = 6;
                ctx.shadowColor = '#bbddff';
                ctx.fillRect(s.x - 0.5, s.y - 0.5, s.size + 1, s.size + 1);
                ctx.shadowBlur = 0;
            }
        });

        ctx.globalAlpha = 1.0;

        // Czarna dziura na środku (można później dodać śledzenie myszki)
        const bhX = width / 2;
        const bhY = height * 0.42;

        drawBlackHole(bhX, bhY);

        time += 0.016; // przybliżona delta time
        requestAnimationFrame(animate);
    }

    // --- Event listeners ---
    window.addEventListener('resize', () => {
        resize();
        createStars();
        createNebula();
    });

    // Inicjalizacja
    resize();
    createStars();
    createNebula();
    animate();
});
