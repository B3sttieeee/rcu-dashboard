const Physics = {
    bounce: function(ball, objects) {
        objects.forEach(obj => {
            const ballBB = new THREE.Sphere(ball.position, 12);
            const objBB = new THREE.Box3().setFromObject(obj);

            if (objBB.intersectsSphere(ballBB)) {
                // Odbicie kierunku
                const closestPoint = objBB.clampPoint(ball.position, new THREE.Vector3());
                const normal = ball.position.clone().sub(closestPoint).normalize();
                ball.velocity.reflect(normal).multiplyScalar(0.8);
            }
        });
    }
};
