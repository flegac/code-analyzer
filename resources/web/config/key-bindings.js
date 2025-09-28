import { CameraService } from "../camera.service.js"


export function keyBindings(app) {
    const cam = CameraService.singleton;
    return {
        // rotate camera X
        'z': () => cam.rotateX(-cam.rotationSpeed),
        's': () => cam.rotateX(cam.rotationSpeed),

        // rotate camera Y
        'q': () => cam.rotateY(-cam.rotationSpeed),
        'd': () => cam.rotateY(cam.rotationSpeed),

        // rotate camera Z
        'a': () => cam.rotateZ(cam.rotationSpeed),
        'e': () => cam.rotateZ(-cam.rotationSpeed),

        // others
        'w': () => cam.alignFrontToAxis('x'),
        'x': () => cam.alignFrontToAxis('y'),
        'c': () => cam.alignFrontToAxis('z'),

        ' ': () => cam.zoomToFit(),

    }
}
