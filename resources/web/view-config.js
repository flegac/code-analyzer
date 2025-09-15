const GENERAL_GRAPH_CONFIG = {
    dataset: {
        datasetPath: 'data/dependencies.json',
        configPath: 'data/config.json',
        moduleInfosPath: 'data/modules.json',
        dataset: null,
    },
    physics: {
        isActive: true,
        dimension: 3,
        groupHierarchyDepth: 3,
        repulsionStrength: 25,
        groupDistance: 100,
    },

    nodes: {
        groupHierarchyDepth: 2,
        size: 'imported',
        color: 'group',
        fontSize: 64,
        scaleFactor: .2
    },

    links: {
        dependencies: {
            color: '#f00',
            distance: 2,
            strength: 1.,
            width: 1.5,
            particles: 1,
        },
        hierarchy: {
            color: '#ffff00',
            distance: 2,
            strength: 100.,
            width: 10,
            particles: 0,
        },
    }

};