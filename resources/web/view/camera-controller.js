export class CameraController {
    constructor() {
        this.graph = null;
        this.rotationSpeed = 3.5 * Math.PI / 180; // ~3.5° par frame
        this.target = new THREE.Vector3(0, 0, 0); // point central
        this.alignUpToAxis = throttle(this.alignUpToAxis.bind(this), 200)
    }

    takeControl(graph) {
        this.graph = graph;
        graph.cam = this;
        graph.graph.onNodeClick(node => {
            this.focusOn(node);
            graph.selected = node;
        });
        return this;
    }

    focusOn(node) {
        const controls = this._controls();
        const camera = this._camera();

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
    }


    rotateX(speed) {
        if (!this.graph.graph) return;
        const camera = this._camera();
        const up = camera.up.clone().normalize();
        const front = new THREE.Vector3().subVectors(this.target, camera.position).normalize();
        const right = new THREE.Vector3().crossVectors(front, up).normalize();
        this.rotateCameraAroundAxis(right, speed);
    }

    rotateY(speed) {
        if (!this.graph.graph) return;
        const camera = this._camera();
        const up = camera.up.clone().normalize();
        this.rotateCameraAroundAxis(up, speed);
    }

    rotateZ(speed) {
        if (!this.graph.graph) return;
        const camera = this._camera();
        const front = new THREE.Vector3().subVectors(this.target, camera.position).normalize();
        this.rotateCameraAroundAxis(front, speed);
    }

    rotateCameraAroundAxis(axis, angle) {
        const camera = this._camera();
        const offset = new THREE.Vector3().subVectors(camera.position, this.target);
        const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        offset.applyQuaternion(quaternion);
        camera.position.copy(this.target.clone().add(offset));

        camera.up.applyQuaternion(quaternion);
    }

    alignUpToAxis(axis, delay = 250) {
        setTimeout(() => {
            const camera = this._camera();
            const controls = this._controls();

            let targetUp;
            switch (axis) {
                case 'x': targetUp = new THREE.Vector3(1, 0, 0); break;
                case 'y': targetUp = new THREE.Vector3(0, 1, 0); break;
                case 'z': targetUp = new THREE.Vector3(0, 0, 1); break;
                default: return;
            }

            const currentUp = camera.up.clone().normalize();
            const dot = currentUp.dot(targetUp);

            if (dot > 0.99) {
                targetUp.negate();
            }

            camera.up.copy(targetUp);
            camera.lookAt(this.target);
            controls.target.copy(this.target);
            controls.update();
        }, delay);
    }

    _camera() {
        return this.graph.graph.camera()
    }

    _controls() {
        return this.graph.graph.controls()
    }

}

function throttle(fn, delay) {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        }
    };
}
