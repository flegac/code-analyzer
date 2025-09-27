import {KeyboardService} from "/lib/keyboard.service.js";
import {LayoutService} from "/lib/layout.service.js"
import {CameraService} from "/lib/camera.service.js"

import {keyBindings} from "/config/key-bindings.js"
import {GraphService} from "/display/graph.service.js"
import {DatasetService} from "/dataset/dataset.service.js";

export async function main() {
    const layout = LayoutService.singleton;
    const G = GraphService.singleton;
    await layout.start();


    KeyboardService.singleton
        .onStart(() => {
        })
        .onStop(() => {
            const cam = CameraService.singleton;
            if (!G.getGraph()) return;
            const camera = cam.camera();
            const controls = cam.controls();
            camera.lookAt(cam.target);
            controls.update();
        })
        .registerMap(keyBindings(G))
        .start();

    $(async () => {
        const dataset = await DatasetService.singleton.loadDefault();
        await layout.changeDataset(dataset);
    })
}
