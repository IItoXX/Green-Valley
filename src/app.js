document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameMap');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    // Récupération des assets du perso immobile
    const images = [];
    for (let i = 1; i <= 6; i++) {
        const img = new Image();
        img.src = `assets/imobile/${i}.png`;
        images.push(img);
    }

    // Position du perso (centre de l'écran)
    let x = canvas.width / 2;
    let y = canvas.height / 2;

    // Taille cible (largeur max)
    const targetWidth = 64;

    // Animation : changement de frame toutes les 200ms
    let currentFrame = 0;
    setInterval(() => {
        currentFrame = (currentFrame + 1) % images.length;
    }, 200);

    // Variables pour le déplacement
    let dx = 0, dy = 0;
    const speed = 3;

    // Joystick logic
    const joystick = document.getElementById('joystick');
    const stick = document.getElementById('stick');
    let dragging = false;
    const origin = { x: 60, y: 60 };

    stick.addEventListener('touchstart', (e) => {
        dragging = true;
    });

    document.addEventListener('touchend', () => {
        dragging = false;
        dx = 0;
        dy = 0;
        stick.style.left = '40px';
        stick.style.top = '40px';
    });

    joystick.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        const touch = e.touches[0];
        const rect = joystick.getBoundingClientRect();
        let xStick = touch.clientX - rect.left;
        let yStick = touch.clientY - rect.top;
        // Limite le stick au cercle
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
        e.preventDefault();
    }, { passive: false });

    // Boucle de dessin
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Déplacement du personnage
        x += dx * speed;
        y += dy * speed;

        // Empêche le perso de sortir de l'écran
        const img = images[currentFrame];
        const ratio = img.height / img.width;
        const width = targetWidth;
        const height = targetWidth * ratio;
        x = Math.max(width / 2, Math.min(canvas.width - width / 2, x));
        y = Math.max(height / 2, Math.min(canvas.height - height / 2, y));

        ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
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