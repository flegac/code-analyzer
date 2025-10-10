export class KeyboardService {
    static singleton = new KeyboardService();
    handlers: Map<string,  () => void>;
    keysPressed: Set<string>;
    private _listening: any;

    constructor() {
        this.handlers = new Map();
        this.keysPressed = new Set();
        console.log('initialize', this);
    }

    onStart(callback: () => void) {
        return this.register('__before__', callback);
    }

    onStop(callback: () => void) {
        return this.register('__after__', callback);
    }

    register(key: string, callback:  () => void) {
        this.handlers.set(key.toLowerCase(), callback);
        return this;
    }

    registerMap(mapping: { [s: string]:  () => void; } | ArrayLike<unknown>) {
        Object.entries(mapping).forEach(([key, value]) => this.register(key, value))
        return this;
    }

    start() {
        if (this._listening) return;
        console.log('KeyboardService.start()')
        $(document).on('keydown', e => {
            this.keysPressed.add(e.key.toLowerCase());
        });
        $(document).on('keyup', e => {
            this.keysPressed.delete(e.key.toLowerCase());
        });
        this._listening = true;

        this._listen();
    }

    _listen() {
        const onStart = this.handlers.get('__before__');
        const onStop = this.handlers.get('__after__');
        if (onStart) {
            onStart();
        }
        this.handlers.forEach((callback, key) => {
            try {
                if (callback !== null && this.keysPressed.has(key.toLowerCase())) {
                    callback();
                }
            } catch (e) {
                console.error(`error in Events.listen() : ${e}`)
            }
        })

        if (onStop) {
            onStop();
        }
        requestAnimationFrame(() => this._listen());
    }
}
