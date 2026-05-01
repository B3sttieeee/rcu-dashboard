let scene, camera, renderer, particles, stars;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 400;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('universe-container').appendChild(renderer.domElement);

    // 1. CZARNA DZIURA (Sfera cienia)
    const bhGeometry = new THREE.SphereGeometry(60, 32, 32);
    const bhMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHole = new THREE.Mesh(bhGeometry, bhMaterial);
    scene.add(blackHole);

    // 2. DYSK AKRECYJNY (5000 punktów świetlnych)
    const diskGeometry = new THREE.BufferGeometry();
    const diskPos = [];
    const diskColors = [];
    const color = new THREE.Color();

    for (let i = 0; i < 8000; i++) {
        const r = Math.random() * 200 + 70;
        const theta = Math.random() * Math.PI * 2;
        
        // Matematyczne zagięcie dysku (efekt Interstellar)
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        const y = (Math.random() - 0.5) * 10 + (Math.sin(r * 0.05) * 20);

        diskPos.push(x, y, z);

        // Kolory: od jasnego pomarańczu do fioletu
        const mix = Math.random();
        color.setHSL(mix * 0.1 + 0.05, 1.0, 0.5); // Złoty/Pomarańcz
        if (mix > 0.7) color.setHSL(0.8, 0.8, 0.5); // Fioletowy akcent
        
        diskColors.push(color.r, color.g, color.b);
    }

    diskGeometry.setAttribute('position', new THREE.Float32BufferAttribute(diskPos, 3));
    diskGeometry.setAttribute('color', new THREE.Float32BufferAttribute(diskColors, 3));

    const diskMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(diskGeometry, diskMaterial);
    particles.rotation.x = 1.2; // Przechylenie dysku
    scene.add(particles);

    // 3. GWIAZDY W TLE
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for(let i=0; i<3000; i++) {
        starPos.push((Math.random()-0.5)*2000, (Math.random()-0.5)*2000, (Math.random()-0.5)*2000);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
    stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // Obrót dysku
    particles.rotation.z += 0.005;
    
    // Delikatne kołysanie kamery dla efektu "pływania" w kosmosie
    camera.position.x += (Math.sin(Date.now() * 0.001) * 0.5);
    camera.position.y += (Math.cos(Date.now() * 0.001) * 0.5);
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
