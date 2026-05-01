import * as THREE from 'three';

/**
 * PLAYER MODULE - Obsługa ruchu, myszki i fizyki gracza
 */
export class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;

        // Parametry fizyczne
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveSpeed = 150.0;
        this.jumpForce = 15.0;
        this.canJump = false;
        
        // Stan klawiatury
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false
        };

        this.initPointerLock();
        this.addEventListeners();
    }

    initPointerLock() {
        const canvas = document.querySelector('canvas');

        // Kliknięcie w ekran aktywuje sterowanie myszką
        canvas.addEventListener('click', () => {
            canvas.requestPointerLock();
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === canvas) {
                // Rozglądanie się (Euler angles)
                this.camera.rotation.y -= e.movementX * 0.002;
                this.camera.rotation.x -= e.movementY * 0.002;
                
                // Blokada obrotu góra/dół (90 stopni), żeby nie wykręcić karku
                this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
            }
        });
        
        // Ważne: Three.js domyślnie obraca w kolejności XYZ, musimy to zmienić na YXZ
        this.camera.rotation.order = 'YXZ';
    }

    addEventListeners() {
        const onKeyDown = (e) => {
            switch (e.code) {
                case 'KeyW': this.keys.forward = true; break;
                case 'KeyS': this.keys.backward = true; break;
                case 'KeyA': this.keys.left = true; break;
                case 'KeyD': this.keys.right = true; break;
                case 'Space': this.keys.space = true; break;
            }
        };

        const onKeyUp = (e) => {
            switch (e.code) {
                case 'KeyW': this.keys.forward = false; break;
                case 'KeyS': this.keys.backward = false; break;
                case 'KeyA': this.keys.left = false; break;
                case 'KeyD': this.keys.right = false; break;
                case 'Space': this.keys.space = false; break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    }

    update(delta) {
        if (document.pointerLockElement === null) return;

        // 1. Tłumienie prędkości (tarcia powietrza)
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= 9.8 * 3.0 * delta; // Grawitacja (przyspieszenie ziemskie * 3 dla dynamiki)

        // 2. Obliczanie kierunku ruchu na podstawie obrotu kamery
        this.direction.z = Number(this.keys.forward) - Number(this.keys.backward);
        this.direction.x = Number(this.keys.right) - Number(this.keys.left);
        this.direction.normalize(); 

        if (this.keys.forward || this.keys.backward) this.velocity.z -= this.direction.z * this.moveSpeed * delta;
        if (this.keys.left || this.keys.right) this.velocity.x -= this.direction.x * this.moveSpeed * delta;

        // 3. Zastosowanie ruchu do kamery (First Person Perspective)
        // Poruszamy się wzdłuż osi lokalnych kamery
        this.camera.translateX(-this.velocity.x * delta);
        this.camera.translateZ(this.velocity.z * delta);
        this.camera.position.y += this.velocity.y * delta;

        // 4. Prosta kolizja z podłogą
        if (this.camera.position.y < 1.7) {
            this.velocity.y = 0;
            this.camera.position.y = 1.7;
            this.canJump = true;
        }

        // Skok
        if (this.keys.space && this.canJump) {
            this.velocity.y += this.jumpForce;
            this.canJump = false;
        }
    }
}
