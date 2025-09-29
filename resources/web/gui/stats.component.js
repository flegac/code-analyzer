import { BaseComponent } from "./core/base.component.js";
import {G} from "../display/graph.service.js";

const STYLE = `
.graph-stats {
  position: absolute;
  top: 1em;
  right: 1em;
  width: 4cm;
}
`;

const TEMPLATE = `
<div name="graph-stats" class="graph-stats panel-style">
  <strong>Graph Stats</strong><br>
  <span>Nodes: <span name="nodes-count">0</span></span><br>
  <span>Links: <span name="links-count">0</span></span>
</div>
`;

export class StatsComponent extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE,
            style: STYLE,
        });
        this.interval = null;
        this.start();
    }

    updateGui() {
        this.container.querySelector('[name="nodes-count"]').textContent = G.state.nodes.length;
        this.container.querySelector('[name="links-count"]').textContent = G.state.links.length;
    }

    start() {
        if (this.interval) return; // évite les doublons

        this.interval = setInterval(() => {
            this.updateGui();
        }, 1000); // mise à jour toutes les secondes
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
    }
}

