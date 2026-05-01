import * as THREE from 'three';

/**
 * BUILD SYSTEM - Logika stawiania ścian i ramp
 */
export class BuildSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        this.gridSize = 40; // Rozmiar modułu budowli
        this.builds = [];   // Lista postawionych obiektów
        
        // Materiał "ducha" (podgląd przed postawieniem)
        this.previewMaterial = new THREE.MeshStandardMaterial({
            color: 0x00f2ff,
            transparent: true,
            opacity: 0.4,
            emissive: 0x00f2ff,
            emissiveIntensity: 0.5
        });

        // Materiał gotowej budowli
        this.buildMaterial = new THREE.MeshStandardMaterial({
            color: 0x00f2ff,
            emissive: 0x00f2ff,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.8,
            metalness: 0.5,
            roughness: 0.1
        });

        this.raycaster = new THREE.Raycaster();
        this.previewMesh = null;
        this.currentMode = 'wall'; // 'wall' lub 'floor' lub 'ramp'

        this.initPreview();
        this.setupEvents();
    }

    initPreview() {
        // Tworzymy przezroczystą ścianę, która będzie latać przed nami
        const geometry = new THREE.BoxGeometry(this.gridSize, this.gridSize, 2);
        this.previewMesh = new THREE.Mesh(geometry, this.previewMaterial);
        this.scene.add(this.previewMesh);
    }

    setupEvents() {
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0 && document.pointerLockElement) {
                this.placeBuild();
            }
        });

        // Zmiana trybów klawiszami (Q - ściana, E - podłoga)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyQ') this.setMode('wall');
            if (e.code === 'KeyE') this.setMode('floor');
        });
    }

    setMode(mode) {
        this.currentMode = mode;
        if (mode === 'wall') {
            this.previewMesh.geometry = new THREE.BoxGeometry(this.gridSize, this.gridSize, 2);
        } else if (mode === 'floor') {
            this.previewMesh.geometry = new THREE.BoxGeometry(this.gridSize, 2, this.gridSize);
        }
    }

    update() {
        // 1. Strzelamy promieniem ze środka ekranu na 150 jednostek przed siebie
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        const targetPos = new THREE.Vector3();
        this.raycaster.ray.at(100, targetPos); // Punkt 100 jednostek przed graczem

        // 2. Grid Snapping - zaokrąglamy pozycję do siatki
        this.previewMesh.position.x = Math.round(targetPos.x / this.gridSize) * this.gridSize;
        this.previewMesh.position.z = Math.round(targetPos.z / this.gridSize) * this.gridSize;
        
        if (this.currentMode === 'wall') {
            this.previewMesh.position.y = Math.round(targetPos.y / this.gridSize) * this.gridSize + this.gridSize / 2;
        } else {
            this.previewMesh.position.y = Math.round(targetPos.y / this.gridSize) * this.gridSize;
        }
    }

    placeBuild() {
        const build = new THREE.Mesh(this.previewMesh.geometry.clone(), this.buildMaterial.clone());
        build.position.copy(this.previewMesh.position);
        build.rotation.copy(this.previewMesh.rotation);
        
        this.scene.add(build);
        this.builds.push(build);

        // Efekt "wskoczenia" (prosta animacja skali)
        build.scale.set(0.1, 0.1, 0.1);
        const animateScale = () => {
            if (build.scale.x < 1) {
                build.scale.addScalar(0.15);
                requestAnimationFrame(animateScale);
            }
        };
        animateScale();
    }
}
