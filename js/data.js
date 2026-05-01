// Baza danych Twoich projektów z GitHuba
const myProjects = [
    {
        title: "RCU Dashboard",
        description: "Główny panel sterowania. Nowoczesny interfejs i zarządzanie danymi w czasie rzeczywistym z wykorzystaniem zaawansowanych algorytmów.",
        techStack: ["HTML", "CSS", "JS"],
        image: "./assets/img/rcu-preview.jpg", // Jak wrzucisz zdjęcie, system sam je zaciągnie
        githubLink: "https://github.com/B3sttieeee/rcu-dashboard",
        liveLink: "https://b3sttieeee.github.io/rcu-dashboard/"
    },
    {
        title: "Kryptografia Wymiarowa",
        description: "Skrypt do zabezpieczania transmisji danych pomiędzy modułami bazy. Narzędzie testowe symulujące podstawy szyfrowania.",
        techStack: ["Python", "C++"],
        image: "./assets/img/project-alpha.jpg",
        githubLink: "https://github.com/B3sttieeee",
        liveLink: "#"
    },
    {
        title: "Moduł VYRN",
        description: "Zautomatyzowany bot zarządzający rolami, logami zdarzeń i powitaniami rekrutów na serwerze discordowym klanu.",
        techStack: ["Node.js", "Discord.js"],
        image: "./assets/img/vyrn-bot.jpg",
        githubLink: "https://github.com/B3sttieeee",
        liveLink: "#"
    }
];

// Wyświetlamy kontrolnie w konsoli (F12), żeby wiedzieć, że baza działa poprawnie
console.log("Moduł bazy danych załadowany. Liczba projektów w archiwum:", myProjects.length);
