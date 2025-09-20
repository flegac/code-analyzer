import {keyBindings} from "/config/key-bindings.js"
import {GraphService} from "/service/graph.service.js"
import {LayoutService} from "/service/layout.service.js"
import {KeyboardService} from "/service/keyboard.service.js";
import {CameraService} from "/service/camera.service.js"
import {DatasetService} from "/service/dataset.service.js";

export async function main() {
    const layout = LayoutService.singleton;
    await layout.start();

    const app = GraphService.singleton;

    KeyboardService.singleton
        .onStart(() => {
        })
        .onStop(() => {
            const cam = CameraService.singleton;
            if (!layout.graph.graph) return;
            const camera = cam._camera();
            const controls = cam._controls();
            camera.lookAt(cam.target);
            controls.update();
        })
        .registerMap(keyBindings(app));

    $(async () => {
        const dataset = await DatasetService.singleton.loadDefault();
        await DatasetService.singleton.changeDataset(dataset);
    })
}
