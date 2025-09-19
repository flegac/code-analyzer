

class Physics {
    constructor() {
        this.isActive = true;
        this.friction = 0.1;
        this.dimension = 3;
        this.collapsingDepth = 1;
        this.repulsionFactor = 0.5;
        this.link = {
            distance: 100,
            dependencyStrengthFactor: 0.15,
            strength: 5,
        };
    }
}

class Nodes {
    constructor() {
        this.mesh = {
            baseRadius: 12.0,
            isVisible: true,
            colorGroupDepthRange: 2,
            size: 'imported',
            color: 'group',
        }
        this.text = {
            isVisible: true,
            hiddenDepthRange: 3,
            scaling: 1.0,
            padding: 2,
            fontSize: 64,
            fontFamily: 'Arial',
            textColor: 'white',
            textOffsetY: 10,
            textFormatter: (parts) => {
                if (!Array.isArray(parts) || parts.length === 0) return '';
                if (parts.length === 1) return parts[0];
                // if (parts.length === 2) return parts.join('.');
                return parts.slice(-1);
            }
        };
    }
}

class Links {
    constructor() {
        this.dependencies = {
            color: '#f00',
            particles: 1,
            width: 1.0,
        };
        this.hierarchy = {
            color: '#ffff00',
            particles: 0,
            width: 10.0,
        };
    }
}

export {Physics, Nodes, Links};