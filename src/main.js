import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * GŁÓWNY SILNIK GRY - ALPHA 1V1
 */
class GameEngine {
    constructor() {
        this.nodes = {
            app: document.getElementById('app'),
            hp: document.getElementById('hp-fill'),
            ammo: document.querySelector('.ammo')
        };

        this.init();
        this.addLights();
        this.addPostProcessing();
        this.createArena();
        
        // Obsługa zmiany rozmiaru okna
        window.addEventListener('resize', () => this.onResize());
        
        this.render();
    }

    init() {
        // SCENA
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020205);
        // Mgła nadaje głębi i ukrywa koniec mapy
        this.scene.fog = new THREE.FogExp2(0x020205, 0.0015);

        // KAMERA
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            5000
        );
        // Pozycja startowa (oczy gracza)
        this.camera.position.set(0, 1.7, 5);

        // RENDERER
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, // Wstępne wygładzanie
            powerPreference: "high-performance" 
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.nodes.app.appendChild(this.renderer.domElement);
    }

    addPostProcessing() {
        // EffectComposer pozwala nakładać filtry na obraz
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        // BLOOM - TO SPRAWIA, ŻE NEONY ŚWIECĄ
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // Siła (0.0 - 3.0)
            0.4,  // Promień rozmycia
            0.85  // Próg (im niższy, tym więcej rzeczy świeci)
        );
        this.composer.addPass(bloomPass);
    }

    addLights() {
        // Światło otoczenia (miękkie fioletowe)
        const ambient = new THREE.AmbientLight(0x4040ff, 0.4);
        this.scene.add(ambient);

        // Główne światło kierunkowe (Słońce/Księżyc)
        const sun = new THREE.DirectionalLight(0xffffff, 1.2);
        sun.position.set(100, 500, 100);
        sun.castShadow = true;
        
        // Optymalizacja cieni
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 1000;
        
        this.scene.add(sun);
    }

    createArena() {
        // Podłoga - Cyber Grid
        const gridHelper = new THREE.GridHelper(1000, 50, 0x00f2ff, 0x0a0a20);
        this.scene.add(gridHelper);

        const floorGeo = new THREE.PlaneGeometry(1000, 1000);
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: 0x05050a, 
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Przykładowe neonowe przeszkody (Blokady)
        const boxGeo = new THREE.BoxGeometry(20, 60, 20);
        const boxMat = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            emissive: 0x00f2ff, // Neonowy błękit
            emissiveIntensity: 2 
        });

        for(let i = 0; i < 15; i++) {
            const pillar = new THREE.Mesh(boxGeo, boxMat);
            pillar.position.set(
                Math.random() * 400 - 200, 
                30, 
                Math.random() * 400 - 200
            );
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.scene.add(pillar);
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        requestAnimationFrame(() => this.render());

        // Tu w przyszłości dodasz:
        // this.player.update();
        // this.multiplayer.sync();

        // Używamy composer.render zamiast renderer.render, aby widzieć Bloom
        this.composer.render();
    }
}

// Start silnika
const game = new GameEngine();
