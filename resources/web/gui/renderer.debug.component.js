import { BaseComponent } from "/gui/core/base.component.js";

import Stats from "stats";

const STYLE = `
.graph-debug {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  width: 300px;
  height: auto;
  max-height: calc(100% - 2cm);

  transform: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2px);
  z-index: 1000;
  padding: 0.5rem;
  box-shadow: var(--sl-shadow-large);
  border-radius: var(--sl-border-radius-medium);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;
}
`;

const TEMPLATE = `
  <div name="graph-debug" class="graph-debug" style="display: flex; flex-direction: column; gap: 0.1em; padding: 0.1em;">
    <div name="fps"></div>
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
            template: TEMPLATE,
            style: STYLE,
        });
        this.state = {
            drawCalls: 0,
            textures: 0,
            geometries: 0,
            triangles: 0,
        };

        this.fps = this.addComponent('fps', new FpsComponent());


        this.spans = {
            drawCalls: this.container.querySelector('#drawCalls'),
            geometries: this.container.querySelector('#geometries'),
            textures: this.container.querySelector('#textures'),
            triangles: this.container.querySelector('#triangles'),
        };
    }

    start(renderer) {
        const state = this.state;
        const spans = this.spans;

        function update() {
            state.geometries = renderer.info.memory.geometries;
            state.textures = renderer.info.memory.textures;
            state.drawCalls = renderer.info.render.calls;
            state.triangles = renderer.info.render.triangles;
            for (const key in state) {
                if (spans[key]) {
                    spans[key].textContent = String(state[key]);
                }
            }
            requestAnimationFrame(() => update());
        }
        update()
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