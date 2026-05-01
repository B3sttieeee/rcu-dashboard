import * as THREE from 'three';

export class WeaponSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        
        // Prosty model broni (Placeholder - świecący prostopadłościan)
        this.gun = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 1),
            new THREE.MeshStandardMaterial({ color: 0x555555, emissive: 0x00f2ff })
        );
        this.camera.add(this.gun);
        this.gun.position.set(0.5, -0.4, -1); // Pozycja "w ręku"
        
        this.setupEvents();
    }

    setupEvents() {
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !window.isBuildMode) { // Strzał tylko gdy nie budujemy
                this.shoot();
            }
        });
    }

    shoot() {
        // Promień strzału ze środka celownika
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        // Efekt "Muzzle Flash" (błysk)
        this.gun.material.emissiveIntensity = 10;
        setTimeout(() => this.gun.material.emissiveIntensity = 2, 50);

        if (intersects.length > 0) {
            const hit = intersects[0];
            // Jeśli trafimy w budowlę - usuwamy ją (niszczenie)
            if (hit.object.isBuild) {
                this.scene.remove(hit.object);
            }
        }
    }
}
