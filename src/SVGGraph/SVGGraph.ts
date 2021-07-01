import {Edge, Node, Triple, TripleType} from "../util";
import {HierarchyPointNode, Selection} from "d3";
import {SVGNode} from "../SVGNode/SVGNode";
import {SVGEdge} from "../SVGEdge/SVGEdge";
const d3 = require("d3");
import "./SVGGraph.scss";

export class SVGGraph {
    static readonly config = {
        node_size: [180, 180],
        zoomScaleExtent: [0.6, 8]
    }

    private static instance: SVGGraph;

    svg: Selection<SVGSVGElement, any, any, any>;
    g: Selection<SVGGElement, any, any, any>;

    static getInstance() {
        if (!SVGGraph.instance)
            SVGGraph.instance = new SVGGraph();

        return SVGGraph.instance;
    }

    buildGraph(data, container: JQuery) {
        this.initSVG(container);

        const triples = Triple.fromArray(data);
        const [tempRoot, edges] = Triple.toGraph(triples);

        const tree = data => {
            const root = d3.hierarchy(data);
            return d3.tree().nodeSize(SVGGraph.config.node_size)(root);
        }

        const root = tree(tempRoot);
        const descendants = root.descendants();

        descendants.forEach(node => {
            const group = this.g.append("g");
            new SVGNode(group, node as HierarchyPointNode<Node>);
        });

        edges.forEach(edge => {
            const group = this.g.append("g");
            new SVGEdge(group, edge);
        });

        SVGEdge.drawAllPaths();
    }

    private initSVG(container: JQuery) {
        if (this.svg)
            this.svg.remove();

        this.svg = d3.create("svg")
            .attr("class", "graph");

        container.append(this.svg.node());

        this.svg.append("defs")
            .attr("id", "defs");

        SVGEdge.init();
        SVGNode.init();

        const g = this.g = this.svg.append("g")
            .attr("class", "graph-group")
            .append("g");

        this.svg.call(d3.zoom()
            .scaleExtent(SVGGraph.config.zoomScaleExtent)
            .on("zoom",
                ({transform}) => {
                    $(".tooltip").remove();
                    g.attr("transform", transform);
                }
                ));

        this.svg.on("click", () => {
            if (SVGNode.activeNode !== null)
                SVGNode.activeNode.deactivate();
        })
    }
}