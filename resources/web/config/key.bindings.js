import { CC } from "../camera.service.js"


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

    }
}
