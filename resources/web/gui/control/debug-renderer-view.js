import {MyComponent} from "/core/utils.js";

const TEMPLATE = `
<sl-details summary="🧪 Render Debug" open>
  <div style="display: flex; flex-direction: column; gap: 0.5em; padding: 1em;">
    <div><strong>Draw Calls:</strong> <span id="drawCalls">0</span></div>
    <div><strong>Geometries:</strong> <span id="geometries">0</span></div>
    <div><strong>Textures:</strong> <span id="textures">0</span></div>
    <div><strong>Triangles:</strong> <span id="triangles">0</span></div>
    <div><strong>Points:</strong> <span id="points">0</span></div>
    <div><strong>Lines:</strong> <span id="lines">0</span></div>
  </div>
</sl-details>
`;

export class DebugRendererView extends MyComponent {
    constructor(rendererProvider) {
        super('render-debug', TEMPLATE);
        this.rendererProvider = rendererProvider;
        this.state = {
            drawCalls: 0,
            textures: 0,
            geometries: 0,
            triangles: 0,
            points: 0,
            lines: 0,
        };
        this.spans = {
            drawCalls: this.container.querySelector('#drawCalls'),
            geometries: this.container.querySelector('#geometries'),
            textures: this.container.querySelector('#textures'),
            triangles: this.container.querySelector('#triangles'),
            points: this.container.querySelector('#points'),
            lines: this.container.querySelector('#lines'),
        };
        this._start();
    }

    _start() {
        const renderer = this.rendererProvider();
        this.state.geometries = renderer.info.memory.geometries;
        this.state.textures = renderer.info.memory.textures;
        this.state.drawCalls = renderer.info.render.calls;
        this.state.triangles = renderer.info.render.triangles;
        this.state.points = renderer.info.render.points;
        this.state.lines = renderer.info.render.lines;

        for (const key in this.state) {
            if (this.spans[key]) {
                this.spans[key].textContent = String(this.state[key]);
            }
        }

        requestAnimationFrame(() => this._start());
    }
}
