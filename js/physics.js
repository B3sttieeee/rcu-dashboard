const Physics = {
    checkCollisions: function(ball, obstacles) {
        const ballBB = new THREE.Sphere(ball.position, 12);

        obstacles.forEach(obs => {
            const obsBB = new THREE.Box3().setFromObject(obs);
            
            if (obsBB.intersectsSphere(ballBB)) {
                // Obliczanie normalnej odbicia
                const closestPoint = obsBB.clampPoint(ball.position, new THREE.Vector3());
                const normal = ball.position.clone().sub(closestPoint).normalize();
                
                // Odbicie wektora prędkości
                ball.velocity.reflect(normal).multiplyScalar(0.7); 
                
                // Wypychanie piłki (żeby się nie zbugowała w ścianie)
                ball.position.add(normal.multiplyScalar(2));
            }
        });
    }
};
