export class Hitbox {
    static material = new THREE.MeshBasicMaterial({
        visible: false
    });
    constructor(size) {
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            Hitbox.material
        );
        this.resize(size);
    }

    resize(size) {
        this.mesh.scale.set(size, size);
    }

}
