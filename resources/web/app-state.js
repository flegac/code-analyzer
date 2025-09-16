const APP_STATE = {
    dataset: {
        datasetPath: 'data/dependencies.json',
        configPath: 'data/config.json',
        moduleInfosPath: 'data/modules.json',
        dataset: null,
    },

    physics: {
        isActive: true,
        friction: .1,
        dimension: 3,
        repulsionStrength: 30,
        groupAttractionRatio: .5,
        collapsingDepth: 1,
        dependencyWeightRatio: .15,
    },

    nodes: {
        baseRadius: 12,
        groupHierarchyDepth: 2,
        size: 'imported',
        color: 'group',
        fontSize: 64,
        scaleFactor: .2
    },

    links: {
        dependencies: {
            color: '#f00',
            distance: 25,
            strength: 25.,
            width: 1.5,
            particles: 1,
        },
        hierarchy: {
            color: '#ffff00',
            distance: 25,
            strength: 25.,
            width: 10,
            particles: 0,
        },
    }
};