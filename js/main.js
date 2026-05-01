/**
 * main.js - Główny silnik gry Putt Master 3D
 */

const Game = {
    // Obiekty Three.js
    scene: null,
    camera: null,
    renderer: null,
    
    // Elementy gry
    ball: null,
    opponent: null,
    hole: null,
    obstacles: [],
    aimLine: null, // Linia celowania

    // Stan gry
    isCharging: false,
    power: 0,
    strokes: 0,
    currentLevel: 0,
    isPlaying: false,

    // Konfiguracja rund (Mapy)
    levels: [
        { 
            ball: { x: -200, z: 0 }, 
            hole: { x: 200, z: 0 }, 
            obstacles: [
                { pos: [0, 20, 0], size: [40, 40, 200] } 
            ] 
        },
        { 
            ball: { x: -250, z: 150 }, 
            hole: { x: 250, z: -150 }, 
            obstacles: [
                { pos: [0, 20, 100], size: [20, 40, 400] },
                { pos: [0, 20, -100], size: [20, 40, 400] }
            ] 
        },
        { 
            ball: { x: 0, z: 300 }, 
            hole: { x: 0, z: -300 }, 
            obstacles: [
                { pos: [0, 20, 0], size: [400, 40, 40] },
                { pos: [150, 20, -150], size: [40, 40, 150] },
                { pos: [-150, 20, -150], size: [40, 40, 150] }
            ] 
        }
    ],

    init: function() {
        // 1. Scena i Kamera
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a12);
        
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 5000);
        this.camera.position.set(0, 450, 550);

        // 2. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // 3. Oświetlenie
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);
        
        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(200, 500, 200);
        sun.castShadow = true;
        this.scene.add(sun);

        // 4. Pole (Green)
        const greenGeo = new THREE.BoxGeometry(600, 10, 800);
        const greenMat = new THREE.MeshPhongMaterial({ color: 0x2ecc71 });
        const green = new THREE.Mesh(greenGeo, greenMat);
        green.position.y = -5;
        this.scene.add(green);

        // 5. Piłki
        this.ball = this.createBall(0xffffff); // Twoja piłka
        this.scene.add(this.ball);

        this.opponent = this.createBall(0xff4444); // Piłka przeciwnika
        this.opponent.material.transparent = true;
        this.opponent.material.opacity = 0.6;
        this.opponent.visible = false;
        this.scene.add(this.opponent);

        // 6. Dołek i Linia celowania
        this.createHole();
        this.createAimLine();

        // Start
        this.loadLevel(0);
        this.addEventListeners();
        this.animate();
        this.isPlaying = true;
    },

    createBall: function(color) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(10, 32, 32),
            new THREE.MeshPhongMaterial({ color: color })
        );
        mesh.velocity = new THREE.Vector3();
        mesh.position.y = 10;
        return mesh;
    },

    createHole: function() {
        this.hole = new THREE.Mesh(
            new THREE.CylinderGeometry(20, 20, 2, 32),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        this.hole.position.y = 1;
        this.scene.add(this.hole);
    },

    createAimLine: function() {
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const points = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.aimLine = new THREE.Line(geometry, material);
        this.aimLine.visible = false;
        this.scene.add(this.aimLine);
    },

    loadLevel: function(n) {
        if (n >= this.levels.length) {
            alert("KONIEC GRY! Jesteś mistrzem golfa.");
            location.reload();
            return;
        }

        this.currentLevel = n;
        const lvl = this.levels[n];

        // Reset piłki i statystyk
        this.ball.position.set(lvl.ball.x, 10, lvl.ball.z);
        this.ball.velocity.set(0, 0, 0);
        this.hole.position.set(lvl.hole.x, 1, lvl.hole.z);
        
        document.getElementById('label-hole').innerText = `HOLE: ${n + 1}/${this.levels.length}`;

        // Usuwanie starych przeszkód
        this.obstacles.forEach(o => this.scene.remove(o));
        this.obstacles = [];

        // Tworzenie nowych przeszkód
        lvl.obstacles.forEach(obs => {
            const block = new THREE.Mesh(
                new THREE.BoxGeometry(...obs.size),
                new THREE.MeshPhongMaterial({ color: 0x34495e })
            );
            block.position.set(...obs.pos);
            this.scene.add(block);
            this.obstacles.push(block);
        });

        if (Multi.conn) {
            Multi.send({ type: 'level', levelId: n });
        }
    },

    addEventListeners: function() {
        window.addEventListener('mousedown', (e) => {
            if (this.ball.velocity.length() < 0.2 && this.isPlaying) {
                this.isCharging = true;
                this.aimLine.visible = true;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isCharging) {
                // Aktualizacja linii celowania
                const dir = this.getMouseDirection(e);
                const positions = this.aimLine.geometry.attributes.position.array;
                
                positions[0] = this.ball.position.x;
                positions[1] = this.ball.position.y;
                positions[2] = this.ball.position.z;
                
                positions[3] = this.ball.position.x + dir.x * 0.5;
                positions[4] = this.ball.position.y;
                positions[5] = this.ball.position.z + dir.z * 0.5;
                
                this.aimLine.geometry.attributes.position.needsUpdate = true;
                
                this.power = Math.min(dir.length() * 0.1, 100);
                document.getElementById('power-fill').style.width = this.power + "%";
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (this.isCharging) {
                const dir = this.getMouseDirection(e);
                const force = this.power * 0.18;
                
                this.ball.velocity.set(dir.x, 0, dir.z).normalize().multiplyScalar(force);
                
                this.strokes++;
                document.getElementById('label-strokes').innerText = "STROKES: " + this.strokes;
                
                this.isCharging = false;
                this.aimLine.visible = false;
                this.power = 0;
            }
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    },

    getMouseDirection: function(e) {
        return new THREE.Vector3(
            (window.innerWidth / 2 - e.clientX),
            0,
            (window.innerHeight / 2 - e.clientY)
        );
    },

    animate: function() {
        requestAnimationFrame(() => this.animate());

        // 1. Fizyka i Tarcie
        this.ball.position.add(this.ball.velocity);
        this.ball.velocity.multiplyScalar(0.985); // Płynne hamowanie

        if (this.ball.velocity.length() < 0.1) this.ball.velocity.set(0, 0, 0);

        // 2. Kolizje (z modułu physics.js)
        Physics.checkCollisions(this.ball, [], this.obstacles);

        // 3. Sprawdzanie dołka
        if (Physics.isHoleIn(this.ball, this.hole)) {
            this.ball.velocity.set(0, 0, 0);
            setTimeout(() => {
                this.loadLevel(this.currentLevel + 1);
            }, 500);
        }

        // 4. Synchronizacja Multiplayer (z modułu multiplayer.js)
        if (Multi.conn && Multi.conn.open) {
            this.opponent.visible = true;
            Multi.send({
                type: 'sync',
                x: this.ball.position.x,
                y: this.ball.position.y,
                z: this.ball.position.z
            });
        }

        // 5. Kamera (Dynamiczne śledzenie)
        const targetCamPos = new THREE.Vector3(
            this.ball.position.x,
            450,
            this.ball.position.z + 550
        );
        this.camera.position.lerp(targetCamPos, 0.05);
        this.camera.lookAt(this.ball.position);

        this.renderer.render(this.scene, this.camera);
    },

    startSingle: function() {
        document.getElementById('menu-main').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        this.init();
    }
};
