class RenderDebug {
    constructor(rendererProvider) {
        this.rendererProvider = rendererProvider
        this.params = {
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
        this.params.geometries = renderer.info.memory.geometries;
        this.params.textures = renderer.info.memory.textures;
        this.params.drawCalls = renderer.info.render.calls;
        this.params.triangles = renderer.info.render.triangles;
        this.params.points = renderer.info.render.points;
        this.params.lines = renderer.info.render.lines;
        requestAnimationFrame(() => this.start());
    }

    loadGui(gui) {
        gui.close()
        gui.add(this.params, 'drawCalls').name('Draw Calls').listen().disable();
        gui.add(this.params, 'geometries').name('Geometries').listen().disable();
        gui.add(this.params, 'textures').name('Textures').listen().disable();
        gui.add(this.params, 'triangles').listen().disable();
        gui.add(this.params, 'points').listen().disable();
        gui.add(this.params, 'lines').listen().disable();
    }
}