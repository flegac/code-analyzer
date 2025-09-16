export class RenderDebug {
    constructor(rendererProvider) {
        this.rendererProvider = rendererProvider
        this.state = {
            drawCalls: 0,
            textures: 0,
            geometries: 0,
            triangles: 0,
            points: 0,
            lines: 0,
        };
    }

    start() {
        const renderer = this.rendererProvider();
        this.state.geometries = renderer.info.memory.geometries;
        this.state.textures = renderer.info.memory.textures;
        this.state.drawCalls = renderer.info.render.calls;
        this.state.triangles = renderer.info.render.triangles;
        this.state.points = renderer.info.render.points;
        this.state.lines = renderer.info.render.lines;
        requestAnimationFrame(() => this.start());
    }

    loadGui(gui) {
        gui.close()
        gui.add(this.state, 'drawCalls').name('Draw Calls').listen().disable();
        gui.add(this.state, 'geometries').name('Geometries').listen().disable();
        gui.add(this.state, 'textures').name('Textures').listen().disable();
        gui.add(this.state, 'triangles').listen().disable();
        gui.add(this.state, 'points').listen().disable();
        gui.add(this.state, 'lines').listen().disable();
    }
}