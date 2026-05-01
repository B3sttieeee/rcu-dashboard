const Physics = {
    checkCollisions: function(ball, walls, obstacles) {
        // 1. Odbicia od ścian bocznych (Bandy)
        const margin = 10; // Promień piłki
        
        // Granice mapy (przykładowe 600x400)
        if (Math.abs(ball.position.x) > 290) {
            ball.velocity.x *= -0.7; // Tłumienie przy odbiciu
            ball.position.x = Math.sign(ball.position.x) * 289;
        }
        if (Math.abs(ball.position.z) > 390) {
            ball.velocity.z *= -0.7;
            ball.position.z = Math.sign(ball.position.z) * 389;
        }

        // 2. Kolizje z przeszkodami (Boxy/Blokady)
        obstacles.forEach(obj => {
            const bBall = new THREE.Sphere(ball.position, 10);
            const bObstacle = new THREE.Box3().setFromObject(obj);

            if (bObstacle.intersectsSphere(bBall)) {
                // Prosta logika odbicia
                if (Math.abs(ball.position.x - obj.position.x) > Math.abs(ball.position.z - obj.position.z)) {
                    ball.velocity.x *= -0.8;
                } else {
                    ball.velocity.z *= -0.8;
                }
                // Przesunięcie piłki poza przeszkodę, by się nie zacięła
                ball.position.add(ball.velocity);
            }
        });
    },

    isHoleIn: function(ball, hole) {
        const dist = ball.position.distanceTo(hole.position);
        return dist < 25 && ball.velocity.length() < 3;
    }
};
