import {Billboard} from "/mesh/billboard.mesh.model.js";
import {TextSprite} from "/mesh/text.sprite.model.js";
import {StyleService} from "/display/style.service.js";

export class NodeMeshModel {

    constructor(node, state, position) {
        this.mesh = this.build(node, position);
    }

    resizeBillboard(size) {
        const meshes = this.meshes;
        if (meshes.billboard?.mesh) {
            meshes.billboard.resize(size);
        }

    }

    resizeText(size) {
        const meshes = this.meshes;
        if (meshes.text?.mesh) {
            meshes.text.resize(size);
        }

    }

    build(node, position) {
        const S = StyleService.singleton;

        const group = new THREE.Group();


        //mesh
        const billboard = S.visibleMesh(node) ? new Billboard(node, position) : null;

        //text
        const isModule = node.read('category') === 'Module';
        const textSize = isModule ? 20 / Math.pow(2, node.id.split('.').length) : 1.;

        const textMesh = S.visibleText(node)
            ? new TextSprite(node, textSize)
            : null;

        const meshes = {
            group: this,
            billboard: billboard,
            text: textMesh === null ? null : textMesh,
        };
        node.write('_meshes', meshes);
        this.meshes = meshes;

        Object.entries(meshes).forEach(([key, value]) => {
            if (value && value !== group && value.mesh) group.add(value.mesh);
        });

        return group;
    }
}
