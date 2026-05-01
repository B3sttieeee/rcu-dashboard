const Game = {
    init: function() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x00d2ff); // Jasny błękit nieba

        // Kamera izometryczna (Orthographic) dla stylu Putt Party
        const aspect = window.innerWidth / window.innerHeight;
        const d = 400;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 2000);
        this.camera.position.set(500, 500, 500); // Widok z ukosa
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Światło (Mocne, dające wyraźne cienie jak w Putt Party)
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(100, 500, 100);
        light.castShadow = true;
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        this.createLevel();
        this.createBall();
        this.addControls();
        this.animate();
    },

    createLevel: function() {
        // Blokowe podłoże (Fioletowe jak na screenie 2)
        const blockMat = new THREE.MeshStandardMaterial({ color: 0x6c47ff });
        
        // Budujemy trasę z segmentów (Boxów)
        this.course = new THREE.Group();
        const segments = [
            { pos: [0, 0, 0], size: [200, 40, 600] },
            { pos: [200, 0, 200], size: [400, 40, 200] }
        ];

        segments.forEach(s => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(...s.size), blockMat);
            mesh.position.set(...s.pos);
            mesh.receiveShadow = true;
            this.course.add(mesh);
        });
        this.scene.add(this.course);

        // Wysokie ściany (Bandy)
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x5a36e0 });
        const wall = new THREE.Mesh(new THREE.BoxGeometry(10, 80, 600), wallMat);
        wall.position.set(-100, 20, 0);
        wall.castShadow = true;
        this.scene.add(wall);
    },

    createBall: function() {
        this.ball = new THREE.Mesh(
            new THREE.SphereGeometry(12, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0x00f2ff, roughness: 0.1 })
        );
        this.ball.position.set(0, 40, 250);
        this.ball.velocity = new THREE.Vector3();
        this.ball.castShadow = true;
        this.scene.add(this.ball);
    },

    animate: function() {
        requestAnimationFrame(() => this.animate());

        // Fizyka (uproszczona)
        this.ball.position.add(this.ball.velocity);
        this.ball.velocity.multiplyScalar(0.98); // Tarcie

        // Kamera śledząca płynnie
        const camTarget = this.ball.position.clone().add(new THREE.Vector3(400, 400, 400));
        this.camera.position.lerp(camTarget, 0.1);

        this.renderer.render(this.scene, this.camera);
    },

    start: function() {
        document.getElementById('menu-main').classList.add('hidden');
        document.getElementById('hud-top').classList.remove('hidden');
        this.init();
    },

    addControls: function() {
        let isCharging = false;
        window.addEventListener('mousedown', () => { if(this.ball.velocity.length() < 0.1) isCharging = true; });
        window.addEventListener('mouseup', (e) => {
            if(isCharging) {
                // Kierunek uderzenia (wektor od piłki do myszki)
                this.ball.velocity.set( (window.innerWidth/2 - e.clientX)*0.05, 0, (window.innerHeight/2 - e.clientY)*0.05 );
                isCharging = false;
            }
        });
    }
};
