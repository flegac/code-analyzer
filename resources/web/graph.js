class Graph {
    constructor() {
        this.container = createDiv('graph');
        this.graph = ForceGraph3D()(this.container);
        this.nodes = [];
        this.links = [];
        this.nodesMap = {};
    }


    uniqueGroups() {
        return new Set(Array.from(this.nodes, node => node.group));
    }

    renderGraph(hierarchy, dependencies) {
        this.resetGraph();
        const nodes = new Set();
        for (let relation of [hierarchy, dependencies]) {
            relation.links.forEach(_ => this.links.push(_))
            relation.nodes.forEach(_ => nodes.add(_))
        }

        for (const id of nodes) {
            const usedBy = dependencies.usedBy[id]?.length || 0;
            const dependOn = dependencies.dependOn[id]?.length || 0;
            const radius = dependencies.usedBy[id]?.length || 0;
            const node = {
                id,
                group: id,
                radius: radius,
                usedBy: usedBy,
                dependOn: dependOn,
                // x,y,z are induced by forces
            };
            this.nodesMap[id] = node;
            this.nodes.push(node);
        }

        this.graph.graphData({nodes: this.nodes, links: this.links});
    }

    resetGraph() {
        if (this.graph && typeof this.graph._destructor === 'function') {
            this.graph._destructor();
        }
        this.graph = ForceGraph3D()(this.container,);
        this.graph.nodeLabel(node => {
            let infos = '';
            if (node.infos) {
                infos = JSON.stringify(node.infos, null, 2);
            }
            return `${node.id}<br>\n${infos}`;
        });

        this.graph.nodeThreeObjectExtend(true);
        this.graph.nodeThreeObject(node => {
            const partsCount = node.id.split('.').length;
            const shouldShowText = partsCount <= 2;

            if (!shouldShowText) return;

            // const group = new THREE.Group();
            // group.add(createTextSprite(node.id));
            // return group;
            return createTextSprite(node.id);
        });

        const resizeObserver = new ResizeObserver(() => {
            this.graph.width(this.container.clientWidth);
            this.graph.height(this.container.clientHeight);
        });
        resizeObserver.observe(this.container);

        new GraphCameraController(this.graph).start();

        this.nodes = [];
        this.links = [];
        this.nodesMap = {};
    }
}


const FONT_SIZE = 128;
const SCALE_FACTOR = .1;
const TEXT_OFFSET_Y = 10;
const FONT_FAMILY = 'Arial';
const TEXT_COLOR = 'white';

function createTextSprite(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    context.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    const textWidth = context.measureText(text).width;
    const textHeight = FONT_SIZE + 12;

    canvas.width = textWidth;
    canvas.height = textHeight;

    context.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    context.fillStyle = TEXT_COLOR;
    context.fillText(text, 0, FONT_SIZE);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({map: texture, transparent: true});
    const sprite = new THREE.Sprite(material);

    sprite.scale.set(textWidth * SCALE_FACTOR, textHeight * SCALE_FACTOR, 1);
    sprite.position.set(0, TEXT_OFFSET_Y, 0);

    return sprite;
}
