document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return; // Zabezpieczenie przed błędem
    
    const ctx = canvas.getContext('2d');
    let width, height, stars = [];
    const numStars = 2000; // Ilość gwiazd w galaktyce

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function initStars() {
        stars = [];
        // Maksymalny zasięg gwiazd to przekątna ekranu
        const maxRadius = Math.sqrt((width/2)**2 + (height/2)**2) * 1.2;
        
        for (let i = 0; i < numStars; i++) {
            stars.push({
                angle: Math.random() * Math.PI * 2,          // Pozycja na okręgu
                distance: Math.random() * maxRadius,         // Odległość od centrum
                size: Math.random() * 1.5 + 0.2,             // Wielkość kropki
                speed: (Math.random() * 0.001) + 0.0005      // Prędkość obrotu wokół osi
            });
        }
    }

    function animateGalaxy() {
        // Półprzezroczyste czarne tło dla efektu rozmycia (smugi)
        ctx.fillStyle = 'rgba(1, 1, 3, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        ctx.fillStyle = '#ffffff';
        for (let star of stars) {
            // Ruch obrotowy
            star.angle += star.speed;
            
            // Lekkie zasysanie do środka (opcjonalny bajer)
            // star.distance -= 0.1;
            // if (star.distance < 50) star.distance = Math.sqrt((width/2)**2 + (height/2)**2);

            const x = centerX + Math.cos(star.angle) * star.distance;
            const y = centerY + Math.sin(star.angle) * star.distance;
            
            ctx.beginPath();
            ctx.arc(x, y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        requestAnimationFrame(animateGalaxy);
    }

    // Uruchomienie
    window.addEventListener('resize', () => {
        resizeCanvas();
        initStars();
    });
    
    resizeCanvas();
    initStars();
    animateGalaxy();
});
