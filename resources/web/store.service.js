const { reactive } = PetiteVue;

export class StoreService {
    static singleton = new StoreService();
    constructor() {
        this.storages = {};
    }

    store(name, state = null) {
        if (state !== null) {
            if (name in this.storages) {
                throw Error(`store already registerd: ${name}`);
            }
            this.storages[name] = reactive(state);
        }
        return this.storages[name];
    }

}
export const SS = StoreService.singleton;
