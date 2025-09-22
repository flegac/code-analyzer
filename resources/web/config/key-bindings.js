import { CameraService } from "/display/camera.service.js"


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
        'w': () => cam.alignUpToAxis('x'),
        'x': () => cam.alignUpToAxis('y'),
        'c': () => cam.alignUpToAxis('z'),

        ' ': () => cam.zoomToFit(),

    }
}
