import { EVENTS } from "events";

export class CameraController {
    constructor(graph) {
        this.graph = graph;
        this.rotationSpeed = 3.5 * Math.PI / 180; // ~3.5° par frame
        this.target = new THREE.Vector3(0, 0, 0); // point central
        this._registerCommands();
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

    _registerCommands() {
        EVENTS
            .onStart(() => {
            })
            .onStop(() => {
                if (!this.graph.graph) return;
                const camera = this._camera();
                const controls = this._controls();
                camera.lookAt(this.target);
                controls.update();
            })
            .register('q', () => this.rotateY(-this.rotationSpeed))
            .register('arrowleft', () => this.rotateY(-this.rotationSpeed))
            .register('d', () => this.rotateY(this.rotationSpeed))
            .register('arrowright', () => this.rotateY(this.rotationSpeed))

            .register('z', () => this.rotateX(-this.rotationSpeed))
            .register('arrowup', () => this.rotateX(-this.rotationSpeed))
            .register('s', () => this.rotateX(this.rotationSpeed))
            .register('arrowdown', () => this.rotateX(this.rotationSpeed))

            .register('a', () => this.rotateZ(this.rotationSpeed))
            .register('e', () => this.rotateZ(-this.rotationSpeed))
            ;
    }

    _camera() {
        return this.graph.graph.camera()
    }

    _controls() {
        return this.graph.graph.controls()
    }

}
