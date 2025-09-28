import {KeyboardService} from "./keyboard.service.js";
import {LayoutService} from "./layout.service.js"
import {CameraService} from "./camera.service.js"

import {keyBindings} from "./config/key-bindings.js"
import {G} from "./display/graph.service.js"
import {P} from "./project/project.service.js"

export async function main() {
    const layout = LayoutService.singleton;
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
        const project = await P.loadDefault();
        await layout.changeProject(project);
    })
}
