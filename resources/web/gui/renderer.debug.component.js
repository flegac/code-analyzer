import {BaseComponent} from "./core/base.component.js";

import Stats from "stats";

const STYLE = `
.graph-debug {
  position: absolute;
  top: 3cm;
  right: 1em;
  width: 4cm;
  height: auto;
  max-height: calc(100% - 2cm);
}
`;

const TEMPLATE = `
  <div name="graph-debug" class="graph-debug panel-style">
    <div name="fps"></div>
    <span><strong>Draw Calls:</strong> <span>{{drawCalls}}</span></span>
    <span><strong>Geometries:</strong> <span>{{geometries}}</span></span>
    <span><strong>Textures:</strong> <span>{{textures}}</span></span>
    <span><strong>Triangles:</strong> <span>{{triangles}}</span></span>
  </div>
`;

export class RendererDebugComponent extends BaseComponent {
    constructor() {
        super({
            id: 'render-debug',
            template: TEMPLATE,
            style: STYLE,
            state: {
                drawCalls: 0,
                textures: 0,
                geometries: 0,
                triangles: 0,
            }
        });
        this.fps = this.addComponent('fps', new FpsComponent());
    }

    start(renderer) {
        const loop = () => {
            this.state.geometries = renderer.info.memory.geometries;
            this.state.textures = renderer.info.memory.textures;
            this.state.drawCalls = renderer.info.render.calls;
            this.state.triangles = renderer.info.render.triangles;
            requestAnimationFrame(() => loop());
        };
        loop()
    }
}

export class FpsComponent {
    constructor() {
        const stats = new Stats();
        stats.showPanel(0); // 0 = FPS, 1 = MS, 2 = MB
        this.container = stats.dom;

        // Supprimer le style par défaut qui le positionne en haut à gauche
        Object.assign(this.container.style, {
            position: 'relative',
            top: 'unset',
            left: 'unset',
            margin: '0',
            zIndex: 'auto'
        });

        function animate() {
            stats.begin();
            stats.end();
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }
}