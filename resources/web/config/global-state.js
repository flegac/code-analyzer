export const GLOBAL_STATE = {
    dataset: {
        datasetPath: 'data/dependencies.json',
        configPath: 'data/config.json',
        moduleInfosPath: 'data/modules.json',
        depthCollapseLimit: 3,
        dataset: null,
    },

    physics: {
        isActive: true,
        friction: .1,
        dimension: 3,
        collapsingDepth: 1,
        repulsionFactor: .5,
        link: {
            distance: 100,
            dependencyStrengthFactor: .15,//distanceRatio
            strength: 5,
        }
    },

    display: {

        nodes: {
            baseRadius: 12.,
            colorGroupDepthRange: 2,
            size: 'imported',
            color: 'group',
            hitbox: false,
            text: {
                hiddenDepthRange: 3,
                scaling: 1.,
                padding: 2,
                fontSize: 64,
                fontFamily: 'Arial',
                textColor: 'white',
                textOffsetY: 10,
                textFormatter: (parts) => {
                    if (!Array.isArray(parts) || parts.length === 0) return '';
                    if (parts.length === 1) return parts[0];
                    if (parts.length === 2) return parts.join('.');

                    return parts.slice(-1);
                    // const res = parts.slice(-2).join('.');
                    // return `_.${res}`;
                }

            }
        },

        links: {
            dependencies: {
                color: '#f00',
                particles: 1,
                width: 1.,
            },
            hierarchy: {
                color: '#ffff00',
                particles: 0,
                width: 10.,
            },
        }
    },
};
