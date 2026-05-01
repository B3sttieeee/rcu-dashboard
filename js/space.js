document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    let backgroundStars = [];
    
    const numParticles = 5000; 
    const numStars = 500;      
    const eventHorizonRadius = 110; 
    const diskRadius = 450; 
    
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // NOWOŚĆ: Mnożnik prędkości (zakrzywienie czasoprzestrzeni po kliknięciu)
    let speedMultiplier = 1;
    let targetSpeedMultiplier = 1;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    // Reakcja na kliknięcie myszką (Warp Speed!)
    window.addEventListener('mousedown', () => targetSpeedMultiplier = 8);
    window.addEventListener('mouseup', () => targetSpeedMultiplier = 1);
    window.addEventListener('touchstart', () => targetSpeedMultiplier = 8);
    window.addEventListener('touchend', () => targetSpeedMultiplier = 1);

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    class BackgroundStar {
        constructor() {
            this.x = (Math.random() - 0.5) * width * 2;
            this.y = (Math.random() - 0.5) * height * 2;
            this.size = Math.random() * 1.5;
            this.opacity = Math.random();
            this.speedX = (Math.random() - 0.5) * 0.2;
        }
        update(parallaxX, parallaxY) {
            this.drawX = this.x - parallaxX * 0.1;
            this.drawY = this.y - parallaxY * 0.1;
            // Gwiazdy w tle też lekko przyspieszają
            this.x += this.speedX * speedMultiplier;
        }
        draw() {
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(width/2 + this.drawX, height/2 + this.drawY, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    class DiskParticle {
        constructor() {
            this.angle = Math.random() * Math.PI * 2;
            const r = Math.pow(Math.random(), 2);
            this.distance = eventHorizonRadius + 5 + (r * diskRadius);
            this.baseSpeed = 20 / Math.pow(this.distance, 1.2);
            this.size = Math.random() * 1.8 + 0.5;
        }

        update(parallaxX, parallaxY) {
            // Aplikacja mnożnika prędkości
            this.angle -= this.baseSpeed * speedMultiplier;
            
            const rawX = Math.cos(this.angle) * this.distance;
            const rawZ = Math.sin(this.angle) * this.distance;
            const rawY = rawZ * 0.22; 
            
            const direction = Math.cos(this.angle); 
            const intensity = 1 - (this.distance - eventHorizonRadius) / diskRadius;
            
            if (direction > 0.3) {
                this.color = `rgba(200, 230, 255, ${intensity + 0.2})`;
            } else if (direction < -0.3) {
                this.color = `rgba(200, 50, 100, ${intensity - 0.2})`;
            } else {
                this.color = `rgba(255, 200, 100, ${intensity})`;
            }

            // Podczas przyspieszenia dysk lekko się zacieśnia
            let currentDistance = this.distance;
            if (speedMultiplier > 1) {
                currentDistance -= (speedMultiplier * 2);
                if (currentDistance < eventHorizonRadius) currentDistance = eventHorizonRadius + 2;
            }

            this.x = rawX - parallaxX * (0.5 + currentDistance * 0.001);
            this.y = rawY - parallaxY * (0.5 + currentDistance * 0.001);
            this.z = rawZ; 
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
        ctx.fillStyle = 'rgba(2, 2, 4, 0.3)';
        ctx.fillRect(0, 0, width, height);

        // Płynne zmiany
        targetX += (mouseX * 100 - targetX) * 0.05;
        targetY += (mouseY * 100 - targetY) * 0.05;
        speedMultiplier += (targetSpeedMultiplier - speedMultiplier) * 0.05;

        const centerX = width / 2;
        const centerY = height / 2 - 50; 

        backgroundStars.forEach(star => { star.update(targetX, targetY); star.draw(); });

        particles.forEach(p => p.update(targetX, targetY));
        particles.sort((a, b) => a.z - b.z);

        const backParticles = particles.filter(p => p.z < 0);
        const frontParticles = particles.filter(p => p.z >= 0);

        drawParticles(backParticles, centerX, centerY);

        const bhDrawX = centerX - targetX * 0.3;
        const bhDrawY = centerY - targetY * 0.3;

        ctx.save();
        ctx.translate(bhDrawX, bhDrawY);
        
        const glow = ctx.createRadialGradient(0, 0, eventHorizonRadius * 0.7, 0, 0, eventHorizonRadius * 2.5);
        glow.addColorStop(0, 'rgba(0,0,0,1)');
        // Poświata staje się bardziej czerwona podczas przyspieszenia!
        glow.addColorStop(0.3, speedMultiplier > 2 ? 'rgba(255, 50, 50, 0.5)' : 'rgba(138, 43, 226, 0.4)'); 
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, eventHorizonRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, eventHorizonRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(0, 0, eventHorizonRadius + 1, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.restore();

        drawParticles(frontParticles, centerX, centerY);

        requestAnimationFrame(animate);
    }

    function drawParticles(particleArray, cx, cy) {
        particleArray.forEach(p => {
            ctx.beginPath();
            ctx.arc(cx + p.x, cy + p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
    }

    init();
});
