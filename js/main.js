const Game = {
    scene: null, camera: null, renderer: null,
    ball: null, opponent: null, hole: null,
    obstacles: [],
    isCharging: false, power: 0, strokes: 0,
    lvl: 0,

    init: function() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a12);
        
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 5000);
        this.camera.position.set(0, 500, 600);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Światło
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(200, 500, 200);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));

        // Green (Trawa)
        const greenGeo = new THREE.BoxGeometry(600, 10, 800);
        const greenMat = new THREE.MeshPhongMaterial({ color: 0x2ecc71 });
        const green = new THREE.Mesh(greenGeo, greenMat);
        green.position.y = -5;
        this.scene.add(green);

        // Piłka
        this.ball = new THREE.Mesh(
            new THREE.SphereGeometry(10, 32, 32),
            new THREE.MeshPhongMaterial({ color: 0xffffff })
        );
        this.ball.velocity = new THREE.Vector3();
        this.scene.add(this.ball);

        // Dołek
        this.hole = new THREE.Mesh(
            new THREE.CylinderGeometry(20, 20, 2, 32),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        this.scene.add(this.hole);

        this.loadLevel(0);
        this.addControls();
        this.animate();
    },

    loadLevel: function(n) {
        // Usuwanie starych przeszkód
        this.obstacles.forEach(o => this.scene.remove(o));
        this.obstacles = [];

        // Przykładowe przeszkody (Blokady) dla poziomu
        const pos = [[100, 20, 0, 40, 40, 200], [-100, 20, 100, 40, 40, 300]];
        pos.forEach(p => {
            const block = new THREE.Mesh(
                new THREE.BoxGeometry(p[3], p[4], p[5]),
                new THREE.MeshPhongMaterial({ color: 0x34495e })
            );
            block.position.set(p[0], p[1], p[2]);
            this.scene.add(block);
            this.obstacles.push(block);
        });

        this.ball.position.set(-200, 10, 0);
        this.hole.position.set(200, 2, 0);
    },

    addControls: function() {
        window.addEventListener('mousedown', () => {
            if (this.ball.velocity.length() < 0.2) this.isCharging = true;
        });

        window.addEventListener('mouseup', (e) => {
            if (this.isCharging) {
                const force = this.power * 0.2;
                const dir = new THREE.Vector3(
                    (window.innerWidth/2 - e.clientX) * 0.05,
                    0,
                    (window.innerHeight/2 - e.clientY) * 0.05
                );
                this.ball.velocity.copy(dir.multiplyScalar(force));
                this.strokes++;
                document.getElementById('label-strokes').innerText = "STROKES: " + this.strokes;
                this.isCharging = false;
                this.power = 0;
                document.getElementById('power-fill').style.width = "0%";
            }
        });
    },

    animate: function() {
        requestAnimationFrame(() => this.animate());
        
        if (this.isCharging) {
            this.power = Math.min(this.power + 1.5, 100);
            document.getElementById('power-fill').style.width = this.power + "%";
        }

        // Fizyka
        this.ball.position.add(this.ball.velocity);
        this.ball.velocity.multiplyScalar(0.98); // Tarcie

        Physics.checkCollisions(this.ball, [], this.obstacles);

        if (Physics.isHoleIn(this.ball, this.hole)) {
            alert("HOLE IN ONE!");
            this.lvl++;
            this.loadLevel(this.lvl);
        }

        this.camera.lookAt(this.ball.position);
        this.renderer.render(this.scene, this.camera);
    },

    startSingle: function() {
        document.getElementById('menu-main').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        this.init();
    }
};

const UI = {
    showJoin: () => {
        document.getElementById('menu-main').classList.add('hidden');
        document.getElementById('menu-join').classList.remove('hidden');
    },
    showMain: () => {
        document.getElementById('menu-join').classList.add('hidden');
        document.getElementById('menu-main').classList.remove('hidden');
    }
};
