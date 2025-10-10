import { Metadata } from "../project/metadata.model.js";
import { G } from "./graph.service.js";
import { V } from "../visuals/visual.service.js";
export class LinkService extends Metadata {
    updateWidth() {
        //TODO
        const scaling = V.mesh.scaling;
        G.state.links.forEach(link => {
            link.write('radius', radius * scaling);
        });
    }
    updateColor() {
        //TODO
        G.state.links.forEach(link => {
            link.write('color', color);
        });
    }
}
LinkService.singleton = new LinkService();
