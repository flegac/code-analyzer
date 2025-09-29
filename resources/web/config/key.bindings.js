import { CC } from "../camera.service.js"
import {LL} from "../layout.service.js"

export function keyBindings(app) {
    return {
        // rotate camera X
        'z': () => CC.rotateX(-CC.rotationSpeed),
        's': () => CC.rotateX(CC.rotationSpeed),

        // rotate camera Y
        'q': () => CC.rotateY(-CC.rotationSpeed),
        'd': () => CC.rotateY(CC.rotationSpeed),

        // rotate camera Z
        'a': () => CC.rotateZ(CC.rotationSpeed),
        'e': () => CC.rotateZ(-CC.rotationSpeed),

        // others
        'w': () => CC.alignFrontToAxis('x'),
        'x': () => CC.alignFrontToAxis('y'),
        'c': () => CC.alignFrontToAxis('z'),

        ' ': () => CC.zoomToFit(),

        '&': _.debounce(() => LL.showTable(), 100),
        'é': _.debounce(() => LL.showFilter(), 100),
        '"': _.debounce(() => LL.showSettings(), 100),
        '\'': _.debounce(() => LL.showConfig(), 100),

    }
}
