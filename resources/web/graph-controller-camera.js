class GraphControllerCamera {
    constructor(graph) {
        this.graph = graph;
        this.keysPressed = {};
        this.rotationSpeed = 3.5 * Math.PI / 180; // ~3.5° par frame
        this.target = new THREE.Vector3(0, 0, 0); // point central
        $(document).on('keydown', e => {
            this.keysPressed[e.key.toLowerCase()] = true;
        });
        $(document).on('keyup', e => {
            this.keysPressed[e.key.toLowerCase()] = false;
        });
        this.animateCamera();
    }

    handleClicks() {
        this.graph.graph.onNodeClick(node => {
            const camera = this.graph.graph.camera();
            const controls = this.graph.graph.controls();

            // Nouvelle cible : le nœud cliqué
            this.target.set(node.x, node.y, node.z);

            // Recalcule le vecteur directionnel
            const front = new THREE.Vector3().subVectors(this.target, camera.position).normalize();

            // Recalcule le vecteur up pour éviter les inversions
            const right = new THREE.Vector3().crossVectors(front, camera.up).normalize();
            const up = new THREE.Vector3().crossVectors(right, front).normalize();

            // Applique l'orientation
            camera.up.copy(up);
            camera.lookAt(this.target);

            // Synchronise OrbitControls
            controls.target.copy(this.target);
            controls.update();
        });
    }

    animateCamera() {
        if( !this.graph.graph) return;
        const camera = this.graph.graph.camera();

        // Vecteurs de base
        const front = new THREE.Vector3().subVectors(this.target, camera.position).normalize();
        const up = camera.up.clone().normalize();
        const right = new THREE.Vector3().crossVectors(front, up).normalize();

        // Rotation autour de up (Y) → gauche/droite
        if (this.keysPressed['q'] || this.keysPressed['arrowleft']) {
            this.rotateCameraAroundAxis(camera, up, -this.rotationSpeed);
        }
        if (this.keysPressed['d'] || this.keysPressed['arrowright']) {
            this.rotateCameraAroundAxis(camera, up, this.rotationSpeed);
        }

        // Rotation autour de right (X) → haut/bas
        if (this.keysPressed['z'] || this.keysPressed['arrowup']) {
            this.rotateCameraAroundAxis(camera, right, -this.rotationSpeed);
        }
        if (this.keysPressed['s'] || this.keysPressed['arrowdown']) {
            this.rotateCameraAroundAxis(camera, right, this.rotationSpeed);
        }

        // Rotation autour de front (Z)
        if (this.keysPressed['a']) {
            this.rotateCameraAroundAxis(camera, front, -this.rotationSpeed);
        }
        if (this.keysPressed['e']) {
            this.rotateCameraAroundAxis(camera, front, this.rotationSpeed);
        }

        camera.lookAt(this.target);
        this.graph.graph.controls().update();

        requestAnimationFrame(() => this.animateCamera());
    }

    rotateCameraAroundAxis(camera, axis, angle) {
        const offset = new THREE.Vector3().subVectors(camera.position, this.target);
        const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        offset.applyQuaternion(quaternion);
        camera.position.copy(this.target.clone().add(offset));

        camera.up.applyQuaternion(quaternion);
    }
}
