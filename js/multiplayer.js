/**
 * multiplayer.js - System komunikacji P2P (Peer-to-Peer)
 * Odpowiada za synchronizację pozycji piłek, rund i wyników.
 */

const Multi = {
    peer: null,
    conn: null,
    role: 'local', // 'host' lub 'guest'

    /**
     * Inicjalizacja Hosta - tworzenie pokoju
     */
    initHost: function() {
        this.role = 'host';
        this.peer = new Peer(); // Generuje losowe ID

        this.peer.on('open', (id) => {
            console.log('ID Hosta:', id);
            document.getElementById('my-id').innerText = id;
            document.getElementById('menu-main').classList.add('hidden');
            document.getElementById('menu-host').classList.remove('hidden');
        });

        this.peer.on('connection', (connection) => {
            this.conn = connection;
            this.setupListeners();
            this.startMultiplayerSession();
        });

        this.peer.on('error', (err) => alert('Błąd PeerJS: ' + err.type));
    },

    /**
     * Inicjalizacja Gościa - dołączanie do pokoju
     */
    joinGame: function() {
        this.role = 'guest';
        const targetId = document.getElementById('join-id').value;

        if (!targetId) return alert("Wpisz ID znajomego!");

        this.peer = new Peer();
        this.peer.on('open', () => {
            this.conn = this.peer.connect(targetId);
            this.setupListeners();
            this.startMultiplayerSession();
        });

        this.peer.on('error', (err) => alert('Nie można połączyć: ' + err.type));
    },

    /**
     * Konfiguracja nasłuchiwania danych
     */
    setupListeners: function() {
        this.conn.on('open', () => {
            console.log('Połączono P2P!');
            document.getElementById('gui').classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');
            
            // Inicjalizacja Three.js z poziomu main.js
            Game.init(); 
        });

        this.conn.on('data', (data) => {
            switch(data.type) {
                case 'sync':
                    // Aktualizacja piłki przeciwnika (opponentBall)
                    if (Game.opponent) {
                        Game.opponent.position.set(data.x, data.y, data.z);
                    }
                    break;
                case 'level':
                    // Synchronizacja zmiany poziomu
                    Game.loadLevel(data.levelId);
                    break;
                case 'win':
                    alert('Znajomy trafił do dołka!');
                    break;
            }
        });

        this.conn.on('close', () => {
            alert('Połączenie zerwane!');
            location.reload();
        });
    },

    /**
     * Wysyłanie danych do partnera
     * @param {Object} data - Obiekt z danymi do wysłania
     */
    send: function(data) {
        if (this.conn && this.conn.open) {
            this.conn.send(data);
        }
    },

    /**
     * Start sesji - pokazuje HUD i przygotowuje grę
     */
    startMultiplayerSession: function() {
        // Dodatkowe ustawienia dla multi (np. widoczność drugiej piłki)
        console.log("Sesja multiplayer aktywna jako: " + this.role);
    }
};
