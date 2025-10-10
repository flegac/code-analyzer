import { KeyboardService } from "./core/keyboard.service.js";
import { LL } from "./core/layout.service.js";
import { CC } from "./core/camera.service.js";
import { keyBindings } from "./config/key.bindings.js";
import { G } from "./visuals/graph.service.js";
import { P } from "./project/project.service.js";
export async function main() {
    await LL.start();
    KeyboardService.singleton
        .onStart(() => {
    })
        .onStop(() => {
        if (!G.getGraph())
            return;
        const camera = CC.camera();
        const controls = CC.controls();
        camera.lookAt(CC.target);
        controls.update();
    })
        .registerMap(keyBindings(G))
        .start();
    $(async () => {
        const project = await P.loadDefault();
        LL.changeProject(project);
    });
}
