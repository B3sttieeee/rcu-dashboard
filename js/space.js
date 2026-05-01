document.addEventListener("DOMContentLoaded", () => {
    // --- 1. SILNIK GWIAZD 3D (CANVAS) ---
    const canvas = document.getElementById('space-canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let stars = [];
    const numStars = 800; // Ilość gwiazd
    const speed = 0.5;    // Prędkość lotu

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    class Star {
        constructor() {
            this.reset();
            // Rozrzuć gwiazdy na start po całej osi Z, żeby nie zaczynały z jednego punktu
            this.z = Math.random() * width; 
        }

        reset() {
            this.x = (Math.random() - 0.5) * width * 2;
            this.y = (Math.random() - 0.5) * height * 2;
            this.z = width;
            this.pz = this.z;
        }

        update() {
            this.z -= speed;
            if (this.z < 1) {
                this.reset();
                this.z = width; // Upewnij się, że zaczyna z daleka
            }
        }

        draw() {
            // Rzutowanie 3D na 2D
            let sx = (this.x / this.z) * width + width / 2;
            let sy = (this.y / this.z) * height + height / 2;
            
            // Wielkość gwiazdy na podstawie odległości
            let r = (1 - this.z / width) * 2.5; 

            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - this.z / width})`;
            ctx.fill();
        }
    }

    function initSpace() {
        resizeCanvas();
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push(new Star());
        }
        window.addEventListener('resize', resizeCanvas);
        requestAnimationFrame(animateSpace);
    }

    function animateSpace() {
        // Czyści ekran, zostawiając leciutką smugę
        ctx.fillStyle = 'rgba(2, 2, 4, 0.4)';
        ctx.fillRect(0, 0, width, height);

        for (let star of stars) {
            star.update();
            star.draw();
        }
        requestAnimationFrame(animateSpace);
    }

    initSpace();

    // --- 2. PŁYNNE POJAWIANIE SIĘ SEKCJI (SCROLL ANIMATION) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // 15% sekcji musi być widoczne, by odpalić animację
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target); // Animuj tylko raz
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));
});
