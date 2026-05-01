document.addEventListener("DOMContentLoaded", () => {
    // --- 1. OBSŁUGA EKRANU ŁADOWANIA (PRELOADER) ---
    const preloader = document.getElementById('preloader');
    
    // Kiedy cała strona (i skomplikowany kosmos) się załaduje, ukrywamy preloader
    window.addEventListener('load', () => {
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500); // Czeka na zakończenie animacji zanikania (którą dodamy w CSS)
        }
    });

    // --- 2. ANIMACJE POJAWIANIA SIĘ SEKCJI (SCROLL OBSERVER) ---
    // Panele będą płynnie wjeżdżać z dołu, gdy do nich dojedziesz
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Znajdź wszystkie karty i panele i przygotuj je do animacji
    const elementsToAnimate = document.querySelectorAll('.glass-card, .glass-panel');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        observer.observe(el);
    });
});
