import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Importujemy Twoje moduły
import { Player } from './Player.js';
import { BuildSystem } from './BuildSystem.js';

class GameEngine {
    constructor() {
        this.nodes = {
            app: document.getElementById('app'),
            overlay: document.getElementById('overlay'),
            slotQ: document.getElementById('slot-q'),
            slotE: document.getElementById('slot-e')
        };

        this.clock = new THREE.Clock();
        
        this.init();
        this.addLights();
        this.addPostProcessing();
        
        // Inicjalizacja Twoich systemów
        this.player = new Player(this.camera, this.scene);
        this.buildSystem = new BuildSystem(this.scene, this.camera);
        
        this.createArena();
        this.setupMenuLogic();
        
        window.addEventListener('resize', () => this.onResize());
        this.render();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020205);
        this.scene.fog = new THREE.FogExp2(0x020205, 0.0015);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.camera.position.set(0, 1.7, 5);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.shadowMap.enabled = true;
        
        this.nodes.app.appendChild(this.renderer.domElement);
    }

    addPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        // Efekt BLOOM (Świecenie neonów)
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, // Siła świecenia
            0.4, // Promień
            0.85 // Próg (im niższy, tym więcej świeci)
        );
        this.composer.addPass(bloomPass);
    }

    addLights() {
        this.scene.add(new THREE.AmbientLight(0x4040ff, 0.4));
        const sun = new THREE.DirectionalLight(0xffffff, 1.2);
        sun.position.set(100, 500, 100);
        sun.castShadow = true;
        this.scene.add(sun);
    }

    createArena() {
        // Podłoga (Grid)
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

    setupMenuLogic() {
        // Schowaj menu po zablokowaniu myszki
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement) {
                this.nodes.overlay.style.display = 'none';
            } else {
                this.nodes.overlay.style.display = 'flex';
            }
        });

        // Wizualna zmiana aktywnych slotów
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyQ') {
                this.nodes.slotQ.classList.add('active');
                this.nodes.slotE.classList.remove('active');
            }
            if (e.code === 'KeyE') {
                this.nodes.slotE.classList.add('active');
                this.nodes.slotQ.classList.remove('active');
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
        
        // Aktualizacja modułów
        this.player.update(delta);
        this.buildSystem.update();

        // Renderowanie z efektami (Bloom)
        this.composer.render();
    }
}

// Odpalenie gry
new GameEngine();
