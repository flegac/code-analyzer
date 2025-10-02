import {Metadata} from "../project/metadata.model.js";
import {G} from "./graph.service.js";
import {V} from "./visual.service.js";

export class LinkService extends Metadata {
    static singleton = new LinkService();

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