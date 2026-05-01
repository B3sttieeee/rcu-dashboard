const Game = {
    init: function() {
        this.scene = new THREE.Scene();
        // Dodajemy mgłę dla głębi
        this.scene.fog = new THREE.FogExp2(0x0a0a12, 0.0015);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 10000);
        this.camera.position.set(0, 600, 800);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true; // WŁĄCZAMY CIENIE
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Oświetlenie - Klucz do wyglądu
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(200, 800, 200);
        dirLight.castShadow = true; // Słońce rzuca cień
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        // Tworzymy pole (Z teksturą/kolorem premium)
        const greenGeo = new THREE.BoxGeometry(800, 20, 1200);
        const greenMat = new THREE.MeshStandardMaterial({ 
            color: 0x10c34d, 
            roughness: 0.8,
            metalness: 0.1 
        });
        const green = new THREE.Mesh(greenGeo, greenMat);
        green.receiveShadow = true;
        this.scene.add(green);

        // Piłka (Lśniąca)
        this.ball = new THREE.Mesh(
            new THREE.SphereGeometry(12, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.4 })
        );
        this.ball.castShadow = true;
        this.ball.position.y = 22;
        this.ball.velocity = new THREE.Vector3();
        this.scene.add(this.ball);

        // Przeszkody z "Neonem"
        this.createLevelObstacles();

        this.animate();
    },

    createLevelObstacles: function() {
        const wallMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a2e,
            emissive: 0x00ff88, // Neonowa poświata
            emissiveIntensity: 0.2
        });

        // Przykładowa blokada
        const block = new THREE.Mesh(new THREE.BoxGeometry(300, 60, 40), wallMat);
        block.position.set(0, 40, 0);
        block.castShadow = true;
        block.receiveShadow = true;
        this.scene.add(block);
        this.obstacles.push(block);
    },

    animate: function() {
        requestAnimationFrame(() => this.animate());
        
        // Płynna kamera śledząca (jak w grach AAA)
        const offset = new THREE.Vector3(0, 500, 600);
        const targetPos = this.ball.position.clone().add(offset);
        this.camera.position.lerp(targetPos, 0.05);
        this.camera.lookAt(this.ball.position);

        this.renderer.render(this.scene, this.camera);
    }
};
