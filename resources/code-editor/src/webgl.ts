import ForceGraph3D from '3d-force-graph';

export function initWebGL() {
    const container = document.getElementById('webgl-view');
    if (!container) return;

    const Graph = new ForceGraph3D(container);

    Graph
        .graphData({
            nodes: [
                {id: 'A'},
                {id: 'B'},
                {id: 'C'},
                {id: 'D'}
            ],
            links: [
                {source: 'A', target: 'B'},
                {source: 'A', target: 'C'},
                {source: 'B', target: 'D'}
            ]
        })
        .nodeLabel('id')
        .nodeAutoColorBy('id')
        .backgroundColor('#111');

    window.addEventListener('resize', () => {
        Graph.width(container.offsetWidth);
        Graph.height(container.offsetHeight);
    });

}
