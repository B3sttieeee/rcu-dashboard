document.addEventListener("DOMContentLoaded", () => {
    const starsContainer = document.getElementById('stars-container');
    const numberOfStars = 150; // Ilość gwiazd do wygenerowania

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Losujemy pozycję (0-100% szerokości/wysokości ekranu)
        const xPos = Math.random() * 100;
        const yPos = Math.random() * 100;

        // Losujemy wielkość gwiazdy (od 1px do 3px)
        const size = Math.random() * 2 + 1;

        // Losujemy czas migotania (od 1s do 4s)
        const duration = Math.random() * 3 + 1;

        // Aplikujemy style
        star.style.left = `${xPos}vw`;
        star.style.top = `${yPos}vh`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDuration = `${duration}s`;

        starsContainer.appendChild(star);
    }
});
