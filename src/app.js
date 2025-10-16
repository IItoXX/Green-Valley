document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameMap');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    // Assets du perso
    const images = [];
    for (let i = 1; i <= 6; i++) {
        const img = new Image();
        img.src = `assets/imobile/${i}.png`;
        images.push(img);
    }

    // Taille de la map
    const mapWidth = 3000;
    const mapHeight = 3000;

    // Position du perso (au centre de la map)
    let x = mapWidth / 2;
    let y = mapHeight / 2;

    // Taille du perso
    const targetWidth = 64;

    // Animation
    let currentFrame = 0;
    setInterval(() => {
        currentFrame = (currentFrame + 1) % images.length;
    }, 200);

    // Déplacement
    let dx = 0, dy = 0;
    const speed = 3;

    // Joystick
    const joystick = document.getElementById('joystick');
    const stick = document.getElementById('stick');
    let dragging = false;
    let origin = { x: 60, y: 60 };
    joystick.style.display = 'none';

    function showJoystick(xPos, yPos) {
        joystick.style.display = 'block';
        joystick.style.left = (xPos - 60) + 'px';
        joystick.style.top = (yPos - 60) + 'px';
        origin = { x: 60, y: 60 };
        stick.style.left = '40px';
        stick.style.top = '40px';
    }
    function hideJoystick() {
        joystick.style.display = 'none';
        dx = 0;
        dy = 0;
    }

    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        showJoystick(touch.clientX, touch.clientY);
        stick.style.left = (touch.clientX - parseInt(joystick.style.left) - 20) + 'px';
        stick.style.top = (touch.clientY - parseInt(joystick.style.top) - 20) + 'px';
        dragging = true;
        e.preventDefault();
    });
    canvas.addEventListener('mousedown', (e) => {
        showJoystick(e.clientX, e.clientY);
        stick.style.left = (e.clientX - parseInt(joystick.style.left) - 20) + 'px';
        stick.style.top = (e.clientY - parseInt(joystick.style.top) - 20) + 'px';
        dragging = true;
    });

    stick.addEventListener('touchstart', () => { dragging = true; });
    stick.addEventListener('mousedown', () => { dragging = true; });

    document.addEventListener('touchend', () => { dragging = false; hideJoystick(); });
    document.addEventListener('mouseup', () => { dragging = false; hideJoystick(); });

    function handleMove(clientX, clientY) {
        if (!dragging) return;
        const rect = joystick.getBoundingClientRect();
        let xStick = clientX - rect.left;
        let yStick = clientY - rect.top;
        const dist = Math.sqrt((xStick - origin.x) ** 2 + (yStick - origin.y) ** 2);
        if (dist > 50) {
            const angle = Math.atan2(yStick - origin.y, xStick - origin.x);
            xStick = origin.x + Math.cos(angle) * 50;
            yStick = origin.y + Math.sin(angle) * 50;
        }
        stick.style.left = (xStick - 20) + 'px';
        stick.style.top = (yStick - 20) + 'px';
        dx = (xStick - origin.x) / 50;
        dy = (yStick - origin.y) / 50;
    }

    document.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        handleMove(e.clientX, e.clientY);
    });

    // --- AJOUT DE FORMES SUR LA MAP ---
    const points = [];
    for (let i = 0; i < 100; i++) {
        points.push({
            x: Math.random() * mapWidth,
            y: Math.random() * mapHeight,
            color: `hsl(${Math.random()*360},80%,60%)`
        });
    }


    function isColliding(px, py, pr, ox, oy, or) {
        // Collision entre deux cercles
        const dist = Math.hypot(px - ox, py - oy);
        return dist < pr + or;
    }
    
    // Ajout d'une variable pour la direction
    let facingLeft = false;

    // Boucle de dessin
    function draw() {
        // Calcul du déplacement proposé
        let nextX = x + dx * speed;
        let nextY = y + dy * speed;

        // Empêche le perso de sortir de la map
        const img = images[currentFrame];
        const ratio = img.height / img.width;
        const width = targetWidth;
        const height = targetWidth * ratio;
        nextX = Math.max(width / 2, Math.min(mapWidth - width / 2, nextX));
        nextY = Math.max(height / 2, Math.min(mapHeight - height / 2, nextY));

        // Rayon du perso (moitié de la largeur du sprite)
        const playerRadius = targetWidth / 2; // 32 si targetWidth = 64

        // Rayon des points (doit être identique à celui du dessin)
        const pointRadius = 40;

        // Vérifie collision avec les points pour le déplacement complet
        let blocked = false;
        points.forEach(pt => {
            if (isColliding(nextX, nextY, playerRadius, pt.x, pt.y, pointRadius)) {
                blocked = true;
            }
        });

        if (!blocked) {
            x = nextX;
            y = nextY;
        } else {
            // Test déplacement uniquement sur X
            let blockedX = false;
            points.forEach(pt => {
                if (isColliding(nextX, y, playerRadius, pt.x, pt.y, pointRadius)) {
                    blockedX = true;
                }
            });
            // Test déplacement uniquement sur Y
            let blockedY = false;
            points.forEach(pt => {
                if (isColliding(x, nextY, playerRadius, pt.x, pt.y, pointRadius)) {
                    blockedY = true;
                }
            });

            if (!blockedX) x = nextX;
            if (!blockedY) y = nextY;
            // Si les deux axes sont bloqués, le perso ne bouge pas
        }

        // Détermine la direction du personnage
        if (dx < -0.1) facingLeft = true;
        else if (dx > 0.1) facingLeft = false;

        // Calcul caméra (centrée sur le perso)
        let camX = x - canvas.width / 2;
        let camY = y - canvas.height / 2;
        camX = Math.max(0, Math.min(mapWidth - canvas.width, camX));
        camY = Math.max(0, Math.min(mapHeight - canvas.height, camY));

        // Dessine la map (fond noir)
        ctx.fillStyle = "#222";
        ctx.fillRect(-camX, -camY, mapWidth, mapHeight);

        // Dessine les points sur la map
        points.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x - camX, pt.y - camY, 40, 0, 2 * Math.PI);
            ctx.fillStyle = pt.color;
            ctx.fill();
        });

        // Dessine le perso au centre de l'écran avec rotation si à gauche
        ctx.save();
        if (facingLeft) {
            ctx.translate(x - camX + width / 2, y - camY);
            ctx.scale(-1, 1);
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
        } else {
            ctx.translate(x - camX, y - camY);
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
        }
        ctx.restore();

        requestAnimationFrame(draw);
    }

    // Lance le dessin quand toutes les images sont chargées
    let loaded = 0;
    images.forEach(img => {
        img.onload = () => {
            loaded++;
            if (loaded === images.length) draw();
        };
    });
});