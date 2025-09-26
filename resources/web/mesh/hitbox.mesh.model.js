export class Hitbox {
    static _material = null;

    static material() {
        if (Billboard._material === null) {
            Billboard._material = new THREE.MeshBasicMaterial({
                visible: false
            });
        }
        return Billboard._material;
    }

    constructor(size) {
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            Hitbox.material()
        );
        this.resize(size);
    }

    resize(size) {
        this.mesh.scale.set(size, size);
    }

}
