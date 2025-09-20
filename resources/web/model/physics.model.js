export class Physics {
    constructor() {
        this.isActive = true;
        this.friction = 0.1;
        this.dimension = 3;
        this.collapsingDepth = 1;
        this.repulsionFactor = 0.5;
        this.link = {
            relationStrengthFactor: 0.15,
            strength: 5,
        };
    }
}

