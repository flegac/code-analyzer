import {keyBindings} from "/config/key-bindings.js"
import {AppLayout} from "/lib/app-layout.js"
import {App} from "/lib/app.js"
import {AppController} from "/lib/app-controller.js"
import {MyLayout} from "/config/layout.js"
import {EVENTS} from "/core/event-handler.js";
import Stats from "stats";
import {MyGraph} from "/graph/my-graph.js";


export async function main() {
    const layout = new AppLayout();
    const app = new App(layout);
    const controller = new AppController(app);
    const cam = layout.cam;
    EVENTS
        .onStart(() => {
        })
        .onStop(() => {
            if (!layout.graph.graph) return;
            const camera = cam._camera();
            const controls = cam._controls();
            camera.lookAt(cam.target);
            controls.update();
        })
        .registerMap(keyBindings(app));


    const dependencies = await app.dataset.dependencies();
    const moduleInfos = await app.dataset.moduleInfos();

    await layout.table.rebuild(moduleInfos);


    new MyLayout().loadComponents({
        'left-panel': () => [],
        'dataset': () => [
            controller.dataset.container,
            controller.container,
        ],
        'physics': () => [
            controller.physics.container,
        ],
        'display': () => [
            controller.display.container,
        ],

        'graph-view': () => [
            layout.graph.container
        ],
        'tree-view': async () => {
            layout.tree.rebuild(MyGraph.hierarchy(dependencies));
            return [
                layout.tree.container
            ];
        },
        'table-view': async () => [
            layout.table.container
        ],
    });
    $(() => app.loadGraph());
    startFpsPanel();
}

function startFpsPanel() {
    const stats = new Stats();
    stats.dom.classList.add('stats-panel');
    stats.showPanel(0); // 0 = FPS, 1 = MS, 2 = MB
    document.body.appendChild(stats.dom);

    function animate() {
        stats.begin();
        stats.end();
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}
