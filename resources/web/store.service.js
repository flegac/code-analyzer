
const { reactive } = PetiteVue;

export class StoreService {
    static singleton = new StoreService();
    constructor() {
        this.storages = {};
    }

  update(name, state) {
  const target = this.store(name);
  deepMerge(target, state);
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

function deepMerge(target, source) {
  for (const key in source) {
    const value = source[key];

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {}; // ou reactive({}) si tu veux forcer la réactivité
      }
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
}
