import {DefaultLinkObject, Link, linkHorizontal, linkVertical, Selection} from "d3";
import {Direction, Edge, EdgeType} from "../util";
import {SVGNode} from "../SVGNode/SVGNode";
import "./SVGEdge.scss";
const d3 = require("d3");

export class SVGEdge {
    static readonly config = {
        arrowDistance: 6,
        labelPadding: 4,
        labelBGrx: 4,
        labelBGry: 4,
        pathSourcePadding: 1,
        pathTargetPaddingX: 5,
        pathTargetPaddingY: 5,
        edgeStyle: new Map<EdgeType, string>([
            [EdgeType.DEFAULT, "edge edge-default"],
            [EdgeType.WIKI, "edge edge-wiki"],
        ]),
    }

    static pathList: SVGEdge[] = [];
    group: Selection<SVGGElement, any, any, any>;
    edge: Edge;
    linker: () => Link<any, DefaultLinkObject, [number, number]>;

    constructor(group: Selection<SVGGElement, any, any, any>, edge: Edge) {
        this.edge = edge;
        this.group = group
            .on("mouseenter", () => this.mouseEnter())
            .on("mouseleave", () => this.mouseLeave());

        group.attr("class", SVGEdge.config.edgeStyle.get(this.edge.type));

        const edgeCoords = getCorrectEdges(edge);
        this.linker = edgeCoords.linker;

        const path = group.append("path")
            .datum(edgeCoords)
            .attr("marker-end", "url(#arrow)");

        SVGEdge.pathList.push(this);
        const source = SVGNode.nodeMap.get(edge.source.id);
        const target = SVGNode.nodeMap.get(edge.target.id);
        source.links.push(this);
        target.links.push(this);
        // console.log(edgeCoords);
        switch (edgeCoords.direction) {
            case Direction.LEFT:
                source.outgoingLinks.left.push(edgeCoords.source)
                target.incomingLinks.right.push(edgeCoords.target)
                break;
            case Direction.UP:
                source.outgoingLinks.top.push(edgeCoords.source)
                target.incomingLinks.bottom.push(edgeCoords.target)
                break;
            case Direction.RIGHT:
                source.outgoingLinks.right.push(edgeCoords.source)
                target.incomingLinks.left.push(edgeCoords.target)
                break;
            case Direction.DOWN:
                source.outgoingLinks.bottom.push(edgeCoords.source)
                target.incomingLinks.top.push(edgeCoords.target)
                break;
        }
    }

    mouseEnter() {
        this.group.classed("hover", true);
        this.group.raise();
    }

    mouseLeave() {
        this.group.classed("hover", false);
        if (!this.group.classed("active"))
            this.group.lower();
    }

    activate() {
        this.group.classed("active", true);
        this.group.raise();
    }

    deactivate() {
        this.group.classed("active", false);
        this.group.lower();
    }

    static fixIncomingPaths(coordinates: [number, number][], axis: string) {
        const i = axis === "x" ? 0 : 1;
        const arrowDistance = SVGEdge.config.arrowDistance;
        let displacement = -((coordinates.length-1) * arrowDistance + coordinates.length)/2;
        for (const c of coordinates) {
            c[i] += displacement;
            displacement += arrowDistance;
        }
    }

    static fixOutgoingPaths(incomingPaths: [number, number][],
                            outgoingPaths: [number, number][],
                            axis: string) {
        const i = axis === "x" ? 0 : 1;
        const padding = SVGEdge.config.arrowDistance;
        if (outgoingPaths.length === 0)
            this.fixIncomingPaths(incomingPaths, axis)
        else {
            const half = Math.ceil(incomingPaths.length / 2);
            const firstHalf = incomingPaths.splice(0, half);
            const secondHalf = incomingPaths.splice(-half);
            let distance = ((firstHalf.length - 1) * padding + firstHalf.length);
            firstHalf.forEach(coord => coord[i] -= (distance/2 + padding -1));
            distance = ((secondHalf.length - 1) * padding + secondHalf.length);
            secondHalf.forEach(coord => coord[i] += (distance/2 + padding));
            this.fixIncomingPaths(firstHalf, axis);
            this.fixIncomingPaths(secondHalf, axis);
        }
    }

    static fixAllPaths() {
        for (const SVGnode of SVGNode.nodeMap.values()) {
            // LEFT only incoming
            if (SVGnode.incomingLinks.left.length > 1) {
                this.fixIncomingPaths(SVGnode.incomingLinks.left, "y");
            }
            // RIGHT only incoming
            if (SVGnode.incomingLinks.right.length > 1) {
                this.fixIncomingPaths(SVGnode.incomingLinks.right, "y");
            }

            // TOP outgoing/incoming
            if (SVGnode.incomingLinks.top.length >= 1) {
                this.fixOutgoingPaths(SVGnode.incomingLinks.top, SVGnode.outgoingLinks.top, "x");
            }

            // BOTTOM outgoing/incoming
            if (SVGnode.incomingLinks.bottom.length >= 1) {
                this.fixOutgoingPaths(SVGnode.incomingLinks.bottom, SVGnode.outgoingLinks.bottom, "x");
            }
        }
    }

    static drawAllPaths() {
        this.fixAllPaths();
        this.pathList.forEach(
            SVGpath => {
                const path = SVGpath.group.selection()
                    .selectChild<SVGPathElement>("path")
                    .attr("d", SVGpath.linker());

                let bbox = path.node().getBBox();
                const xCenter = bbox.x + bbox.width/2;
                const yCenter = bbox.y + bbox.height/2;

                const rect = SVGpath.group.append("rect")
                    .attr("rx", SVGEdge.config.labelBGrx)
                    .attr("ry", SVGEdge.config.labelBGry);

                const text = SVGpath.group.append("text")
                    .text(SVGpath.edge.label);

                bbox = text.node().getBBox();

                text.attr("x", xCenter)
                    .attr("y", yCenter)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central");

                const padding = SVGEdge.config.labelPadding;
                const rectW = bbox.width + 2 * padding;
                const rectH = bbox.height + 2 * padding;

                rect.attr("width", rectW)
                    .attr("height", rectH)
                    .attr("x", xCenter - rectW/2)
                    .attr("y", yCenter - rectH/2);
                SVGpath.group.lower();
            }
        );
    }

    static init() {
        SVGEdge.pathList = [];

        const defs = d3.select("#defs");

        defs.append("marker")    // add the arrow
            .attr("id", "arrow")
            .attr("refX", 0.05)
            .attr("refY", 3)
            .attr("markerWidth", 3)
            .attr("markerHeight", 6)
            .attr("markerUnits","userSpaceOnUse")
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,0 V4 L2,2 Z")
            .attr("transform", "scale(1.5)");
    }
}

function getDirection(source, target) {
    if (source.y == target.y)
        return source.x < target.x ? Direction.RIGHT : Direction.LEFT;
    return source.y < target.y ? Direction.DOWN : Direction.UP;
}

function getCorrectEdges(edge: Edge) : {
    source: [number, number],
    target: [number, number],
    direction: Direction,
    linker: () => Link<any, DefaultLinkObject, [number, number]>
}
{
    // console.log(edge);

    const source = SVGNode.nodeMap.get(edge.source.id);
    const target = SVGNode.nodeMap.get(edge.target.id);

    let sourceX = source.node.x;
    let sourceY = source.node.y;
    let targetX = target.node.x;
    let targetY = target.node.y;

    const sourceBBox = source.group.node().getBBox();
    const wSource = sourceBBox.width;
    const hSource = sourceBBox.height;

    const targetBBox = target.group.node().getBBox();
    const wTarget = targetBBox.width;
    const hTarget = targetBBox.height;

    const direction = getDirection(source.node, target.node);
    let linker;

    const sourcePadding = SVGEdge.config.pathSourcePadding,
        targetPaddingX = SVGEdge.config.pathTargetPaddingX,
        targetPaddingY = SVGEdge.config.pathTargetPaddingY;

    switch (direction) {
        case Direction.DOWN:
            sourceY += hSource/2 + sourcePadding;
            targetY -= hTarget/2 + targetPaddingY;
            linker = linkVertical;
            break;
        case Direction.UP:
            sourceY -= hSource/2 + sourcePadding;
            targetY += hTarget/2 + targetPaddingY;
            linker = linkVertical;
            break;
        case Direction.RIGHT:
            sourceX += wSource/2 + sourcePadding;
            targetX -= wTarget/2 + targetPaddingX;
            linker = linkHorizontal;
            break;
        case Direction.LEFT:
            sourceX -= wSource/2 + sourcePadding;
            targetX += wTarget/2 + targetPaddingX;
            linker = linkHorizontal;
            break;
    }

    return {
        source: [sourceX, sourceY],
        target: [targetX, targetY],
        direction: direction,
        linker: linker
    }
}