import { G } from "./display/graph.service.js"

const DEG_TO_RAD = Math.PI / 180;

export class CameraService {
    static singleton = new CameraService();
    constructor() {
        this.rotationSpeed = 3.5 * DEG_TO_RAD, // 3.5° par frame
            this.target = new THREE.Vector3(0, 0, 0); // point central
        console.log('initialize', this);
    }

    camera() {
        return this.getGraph().camera()
    }

    controls() {
        return this.getGraph().controls()
    }

    getGraph() {
        return G.getGraph();
    }

    takeControl(graph) {
        console.log('camera.takeControl', graph, this.getGraph());

        if (this.getGraph() === null) return;
        graph.cam = this;
        this.getGraph().onNodeClick(node => {
            this.focusOn(node);
            G.select(node);
        });
        return this;
    }

    zoomToFit(durationMs = 25) {
        this.getGraph().zoomToFit(durationMs);
        this.focusOn({ x: 0, y: 0, z: 0 });
    }

    focusOn(target) {
        const controls = this.controls();
        const camera = this.camera();

        // Nouvelle cible : le nœud cliqué
        this.target.set(target.x, target.y, target.z);

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
        if (!this.getGraph()) return;
        const camera = this.camera();
        const up = camera.up.clone().normalize();
        const front = new THREE.Vector3().subVectors(this.target, camera.position).normalize();
        const right = new THREE.Vector3().crossVectors(front, up).normalize();
        this.rotateCameraAroundAxis(right, speed);
    }

    rotateY(speed) {
        if (!this.getGraph()) return;
        const camera = this.camera();
        const up = camera.up.clone().normalize();
        this.rotateCameraAroundAxis(up, speed);
    }

    rotateZ(speed) {
        if (!this.getGraph()) return;
        const camera = this.camera();
        const front = new THREE.Vector3().subVectors(this.target, camera.position).normalize();
        this.rotateCameraAroundAxis(front, speed);
    }

    rotateCameraAroundAxis(axis, angle) {
        const camera = this.camera();
        const offset = new THREE.Vector3().subVectors(camera.position, this.target);
        const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        offset.applyQuaternion(quaternion);
        camera.position.copy(this.target.clone().add(offset));

        camera.up.applyQuaternion(quaternion);
    }

    alignFrontToAxis(axis, delay = 250) {
        setTimeout(() => {
            const camera = this.camera();
            const controls = this.controls();

            let direction, up;
            switch (axis) {
                case 'x':
                    direction = new THREE.Vector3(1, 0, 0);
                    up = new THREE.Vector3(0, 1, 0);
                    break;
                case 'y':
                    direction = new THREE.Vector3(0, 1, 0);
                    up = new THREE.Vector3(0, 0, 1); // évite le conflit avec front
                    break;
                case 'z':
                    direction = new THREE.Vector3(0, 0, 1);
                    up = new THREE.Vector3(0, 1, 0);
                    break;
                default:
                    return;
            }

            const distance = camera.position.distanceTo(this.target);
            const newPosition = this.target.clone().sub(direction.clone().normalize().multiplyScalar(distance));

            camera.position.copy(newPosition);
            camera.up.copy(up);
            camera.lookAt(this.target);

            controls.target.copy(this.target);
            controls.update();
        }, delay);
    }


}
export const CC = CameraService.singleton;
