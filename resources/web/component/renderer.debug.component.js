import {BaseComponent} from "/component/base.component.js";
import {LayoutService} from "/service/layout.service.js"

const TEMPLATE = `
  <div style="display: flex; flex-direction: column; gap: 0.1em; padding: 0.1em;">
    <span><strong>Draw Calls:</strong> <span id="drawCalls">0</span></span>
    <span><strong>Geometries:</strong> <span id="geometries">0</span></span>
    <span><strong>Textures:</strong> <span id="textures">0</span></span>
    <span><strong>Triangles:</strong> <span id="triangles">0</span></span>
  </div>
`;

export class RendererDebugComponent extends BaseComponent {
    constructor() {
        super({
            id: 'render-debug',
            template: TEMPLATE
        });
        this.state = {
            drawCalls: 0,
            textures: 0,
            geometries: 0,
            triangles: 0,
        };
        this.spans = {
            drawCalls: this.container.querySelector('#drawCalls'),
            geometries: this.container.querySelector('#geometries'),
            textures: this.container.querySelector('#textures'),
            triangles: this.container.querySelector('#triangles'),
        };
    }

    start() {
        const renderer = LayoutService.singleton.graph.graph.renderer();
        this.state.geometries = renderer.info.memory.geometries;
        this.state.textures = renderer.info.memory.textures;
        this.state.drawCalls = renderer.info.render.calls;
        this.state.triangles = renderer.info.render.triangles;

        for (const key in this.state) {
            if (this.spans[key]) {
                this.spans[key].textContent = String(this.state[key]);
            }
        }

        requestAnimationFrame(() => this.start());
    }
}
