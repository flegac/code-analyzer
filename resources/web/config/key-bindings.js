import { CameraService } from "/lib/camera.service.js"


export function keyBindings(app) {
    const cam = CameraService.singleton;
    return {
        // rotate camera X
        'z': () => cam.rotateX(-cam.state.rotationSpeed),
        's': () => cam.rotateX(cam.state.rotationSpeed),

        // rotate camera Y
        'q': () => cam.rotateY(-cam.state.rotationSpeed),
        'd': () => cam.rotateY(cam.state.rotationSpeed),

        // rotate camera Z
        'a': () => cam.rotateZ(cam.state.rotationSpeed),
        'e': () => cam.rotateZ(-cam.state.rotationSpeed),

        // others
        'w': () => cam.alignFrontToAxis('x'),
        'x': () => cam.alignFrontToAxis('y'),
        'c': () => cam.alignFrontToAxis('z'),

        ' ': () => cam.zoomToFit(),

    }
}
