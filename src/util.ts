export enum TripleType {
    INSTANCE, CONSTANT, EDGE
}

export enum NodeType {
    DEFAULT, PREDICATE, WIKI
}

export enum EdgeType {
    DEFAULT, WIKI
}

export enum Direction {
    LEFT, RIGHT, UP, DOWN
}

export class linkCoordinates {
    left: [number, number][] = [];
    right: [number, number][] = [];
    top: [number, number][] = [];
    bottom: [number, number][] = [];
}

export class Triple {
    readonly source: string;
    readonly role: string;
    readonly target: string;

    constructor(triple: [string, string, string]) {
        this.source = triple[0];
        this.role = triple[1];
        this.target = triple[2];
    }

    static fromArray(triples: [string, string, string][]) {
        return triples.map(triple => new Triple(triple));
    }

    static typeOf(triple: Triple, sources: Set<string>) {
        if (triple.role == ':instance')
            return TripleType.INSTANCE;
        if (!sources.has(triple.target))
            return TripleType.CONSTANT;
        return TripleType.EDGE;
    }

    static toGraph(triples: Triple[]): [Node, Edge[]] {
        const predicateMatch = /^[-a-zA-Z]+-\d+$/
        const sources = new Set(triples.map(triple => triple.source));

        let nodesMap = new Map<string | number, Node>();
        let edgesTemp: [number, Triple][] = [];
        let edges: Edge[] = [];

        let root: Node = null;
        for (const triple of triples) {
            switch (Triple.typeOf(triple, sources)) {
                case TripleType.INSTANCE:
                    const node = new Node(
                        triple.source,
                        triple.target,
                        triple.target.match(predicateMatch) !== null ? NodeType.PREDICATE : NodeType.DEFAULT
                    );
                    nodesMap.set(node.id, node);
                    if (root === null)
                        root = node;
                    break;
                case TripleType.CONSTANT:
                    const id = nodesMap.size;
                    nodesMap.set(id,
                        new Node(
                            id,
                            triple.target,
                            triple.role === ":wiki" ? NodeType.WIKI : NodeType.DEFAULT
                    ));
                    edgesTemp.push([id, triple]);
                    break;
                case TripleType.EDGE:
                    edgesTemp.push([null, triple]);
                    break;
            }
        }

        for (const [id, edgeT] of edgesTemp) {
            const source = nodesMap.get(edgeT.source);
            const target = nodesMap.get(id === null ? edgeT.target : id);
            edges.push(new Edge(source, target, edgeT.role))
            if (target.parent === null) {
                target.parent = source;
                source.children.push(target)
            }
        }

        return [root, edges];
    }
}

export class Node {
    readonly id: string | number;
    readonly label: string;
    readonly type: NodeType;
    parent: Node;
    children: Node[];
    readonly x: number;
    readonly y: number;

    constructor(id: any, label: string, type: NodeType) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.parent = null;
        this.children = [];
    }
}

export class Edge {
    readonly source: Node;
    readonly target: Node;
    readonly label: string;
    readonly type: EdgeType;

    constructor(source: Node, target: Node, label: string) {
        this.source = source;
        this.target = target;
        this.label = label;
        this.type = label === ":wiki" ? EdgeType.WIKI : EdgeType.DEFAULT;
    }
}

export class SingleLink<T> {
    prev: SingleLink<T> = null;
    next: SingleLink<T> = null;
    readonly value: T;

    constructor(value: T) {
        this.value = value;
    }

    append(value: T) {
        if (this.next) {
            this.next.prev = null;
            this.next.next = null;
        }
        const newLink = new SingleLink(value);
        this.next = newLink;
        newLink.prev = this;
        return newLink;
    }
}

export type WikiTooltipData = [string, string];

export interface PredicateTooltipData {
    desc: string,
    examples: string[],
    bn: string[],
    args: string[][]
}

export interface penmanCache {
    penman: string,
    triples: [string, string, string][],
    wikiTooltipData: Map<string, WikiTooltipData>,
    predicateTooltipData: Map<string, PredicateTooltipData>
}