import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Importujemy Twoje moduły - upewnij się, że pliki są w tym samym folderze!
import { Player } from './Player.js';
import { BuildSystem } from './BuildSystem.js';

class GameEngine {
    constructor() {
        this.nodes = {
            app: document.getElementById('app'),
            overlay: document.getElementById('overlay'),
            hp: document.getElementById('hp-fill'),
            modeText: document.getElementById('current-mode')
        };

        this.clock = new THREE.Clock();
        this.isStarted = false;
        
        this.init();
        this.addLights();
        this.addPostProcessing();
        
        // Inicjalizacja systemów
        this.player = new Player(this.camera, this.scene);
        this.buildSystem = new BuildSystem(this.scene, this.camera);
        
        this.createArena();
        this.setupStartLogic();
        
        window.addEventListener('resize', () => this.onResize());
        
        // Odpalamy pętlę renderowania OD RAZU (nawet przed kliknięciem), 
        // żeby nie było czarnego ekranu.
        this.render();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020205);
        this.scene.fog = new THREE.FogExp2(0x020205, 0.0015);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.camera.position.set(0, 1.7, 10); // Startowa pozycja kamery

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.shadowMap.enabled = true;
        
        this.nodes.app.appendChild(this.renderer.domElement);
    }

    addPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, 0.4, 0.85
        );
        this.composer.addPass(bloomPass);
    }

    addLights() {
        this.scene.add(new THREE.AmbientLight(0x4040ff, 0.5));
        const sun = new THREE.DirectionalLight(0xffffff, 1.0);
        sun.position.set(100, 500, 100);
        sun.castShadow = true;
        this.scene.add(sun);
    }

    createArena() {
        // Neonowa podłoga
        const grid = new THREE.GridHelper(2000, 100, 0x00f2ff, 0x0a0a20);
        this.scene.add(grid);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(2000, 2000),
            new THREE.MeshStandardMaterial({ color: 0x05050a })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    setupStartLogic() {
        // Kliknięcie w dowolne miejsce overlay'a startuje grę
        this.nodes.overlay.addEventListener('click', () => {
            this.nodes.app.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === this.nodes.app) {
                this.isStarted = true;
                this.nodes.overlay.style.display = 'none'; // Chowa menu
            } else {
                this.isStarted = false;
                this.nodes.overlay.style.display = 'flex'; // Pokazuje menu
            }
        });
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        requestAnimationFrame(() => this.render());

        const delta = this.clock.getDelta();
        
        // Gracza i budowanie aktualizujemy tylko gdy myszka jest zablokowana (gra trwa)
        if (this.isStarted) {
            this.player.update(delta);
            this.buildSystem.update();
        }

        this.composer.render();
    }
}

// Start silnika
new GameEngine();
