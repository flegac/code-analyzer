import Stats from "stats";

export class FpsComponent {
    constructor() {
        const stats = new Stats();
        stats.showPanel(0); // 0 = FPS, 1 = MS, 2 = MB
        this.container = stats.dom;

        // Supprimer le style par défaut qui le positionne en haut à gauche
        Object.assign(this.container.style, {
            position: 'relative',
            top: 'unset',
            left: 'unset',
            margin: '0',
            zIndex: 'auto'
        });

        function animate() {
            stats.begin();
            stats.end();
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }
}
