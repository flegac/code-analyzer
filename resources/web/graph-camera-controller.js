class GraphCameraController {
    constructor(graph) {
        this.graph = graph
        this.keysPressed = {};
        this.rotationSpeed = 3.5 * Math.PI / 180;
    }

    start() {
        const controls = this.graph.controls();

        this.graph.onNodeClick((node, event) => {
            const cameraPos = this.graph.cameraPosition(); // {x, y, z}
            const lookAt = controls.target;
            const dx = node.x - lookAt.x;
            const dy = node.y - lookAt.y;
            const dz = node.z - lookAt.z;
            const newPos = {
                x: cameraPos.x + dx, y: cameraPos.y + dy, z: cameraPos.z + dz
            };
            this.graph.cameraPosition(newPos, node, 250); // transition vers le nœud
        });


        document.addEventListener('keydown', e => {
            this.keysPressed[e.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', e => {
            this.keysPressed[e.key.toLowerCase()] = false;
        });

        this.animateCamera();
    }

    animateCamera() {
        const camera = this.graph.camera();
        const controls = this.graph.controls();

        const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
        const radius = offset.length();

        let theta = Math.atan2(offset.x, offset.z); // horizontal angle
        let phi = Math.acos(offset.y / radius);     // vertical angle

        if (this.keysPressed['q'] || this.keysPressed['arrowleft']) theta -= this.rotationSpeed;
        if (this.keysPressed['d'] || this.keysPressed['arrowright']) theta += this.rotationSpeed;
        if (this.keysPressed['z'] || this.keysPressed['arrowup']) phi -= this.rotationSpeed;
        if (this.keysPressed['s'] || this.keysPressed['arrowdown']) phi += this.rotationSpeed;

        const epsilon = 0.1;
        const minPhi = epsilon;
        const maxPhi = Math.PI - epsilon;
        phi = Math.max(minPhi, Math.min(maxPhi, phi));

        const x = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.cos(theta);

        camera.position.set(
            controls.target.x + x,
            controls.target.y + y,
            controls.target.z + z
        );

        camera.lookAt(controls.target);
        controls.update();

        requestAnimationFrame(() => this.animateCamera());
    }
}