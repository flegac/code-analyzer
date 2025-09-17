import {keyBindings} from "/config/key-bindings.js"
import {AppLayout} from "/lib/app-layout.js"
import {App} from "/lib/app.js"
import {AppController} from "/lib/app-controller.js"
import {LAYOUT, loadLayout} from "/lib/layout.js"
import {MyGraph} from "/graph/my-graph.js"
import {EVENTS} from "/core/event-handler.js";
import Stats from "stats";

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

    loadLayout({
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
        'tree-view': async () => {
            layout.tree.rebuild(MyGraph.hierarchy(dependencies));
            return [
                layout.tree.container
            ];
        },
        'graph-view': () => [
            layout.graph.container
        ],
        'table-view': async () => [
            layout.table.container
        ],
    });


    $(() => app.loadGraph());
    $(() => {
        $(window).on('resize', () => LAYOUT.updateSize())
        const $leftPanel = $('.lm_stack').first();
        const $mainPanel = $('.lm_stack').eq(1);
        $leftPanel.attr("id", "left-panel");
        const width = 260;
        const widthString = `${width}px`;

        $mainPanel.css({
            flex: "1 1 auto",
            width: "auto",
            minWidth: "0"
        });
        $mainPanel.parent().css({
            display: "flex"
        });

        $leftPanel.css({
            width: widthString,
            minWidth: widthString,
            maxWidth: widthString
        });

        $leftPanel.find('.lm_content').css({
            'overflow-y': 'auto',
            'height': '100%'
        });

        LAYOUT.updateSize();
    });

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
