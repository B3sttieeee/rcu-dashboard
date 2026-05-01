document.addEventListener("DOMContentLoaded", () => {
    const starsContainer = document.getElementById('stars-container');
    const numberOfStars = 200;

    // Kolory gwiazd (białe, lekko niebieskie, lekko żółte)
    const starColors = ['#ffffff', '#cceeff', '#fffae6'];

    // 1. Generowanie zwykłych gwiazd
    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        const xPos = Math.random() * 100;
        const yPos = Math.random() * 100;
        const size = Math.random() * 2 + 0.5;
        const duration = Math.random() * 4 + 1;
        const color = starColors[Math.floor(Math.random() * starColors.length)];

        star.style.left = `${xPos}vw`;
        star.style.top = `${yPos}vh`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.backgroundColor = color;
        star.style.animationDuration = `${duration}s`;

        starsContainer.appendChild(star);
    }

    // 2. Generowanie spadających gwiazd (Meteorów)
    function createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');

        // Zaczynają z góry lub z prawej strony ekranu
        const startX = Math.random() * 100 + 20; // 20vw do 120vw
        const startY = Math.random() * 50 - 20; // -20vh do 30vh

        shootingStar.style.left = `${startX}vw`;
        shootingStar.style.top = `${startY}vh`;

        starsContainer.appendChild(shootingStar);

        // Usuń meteor po zakończeniu animacji (żeby nie zapychać HTML-a)
        setTimeout(() => {
            shootingStar.remove();
        }, 2000);
    }

    // Losuj spadającą gwiazdę co jakiś czas (od 2 do 6 sekund)
    function randomShootingStarLoop() {
        createShootingStar();
        const nextTime = Math.random() * 4000 + 2000;
        setTimeout(randomShootingStarLoop, nextTime);
    }

    // Uruchom pętlę meteorów
    setTimeout(randomShootingStarLoop, 1000);
});
