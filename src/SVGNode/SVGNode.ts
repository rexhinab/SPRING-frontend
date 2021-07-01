import {HierarchyPointNode, Selection} from "d3";
import {linkCoordinates, Node, NodeType, penmanCache, PredicateTooltipData, WikiTooltipData} from "../util";
import {SVGEdge} from "../SVGEdge/SVGEdge";
import "./SVGNode.scss";
import {Tooltip} from "../Tooltip/Tooltip";
import {ViewManager} from "../ViewManager/ViewManager";

const d3 = require("d3");

export class SVGNode {
    static readonly config = {
        minNodeDistance: 20,
        nodeHeight: 27,
        nodeMinWidth: 10,
        nodePadding: 24,
        nodeIDPaddingLeft: 10,
        nodeIDPaddingRight: 6.67,
        labelPaddingLeft: 3.41,
        nodeRectRX: 13.5,
        nodeRectRY: 13.5,
        nodeStyle: new Map<NodeType, string>([
            [NodeType.DEFAULT, "node node-default"],
            [NodeType.PREDICATE, "node node-predicate"],
            [NodeType.WIKI, "node node-wiki"],
        ]),
    }

    static nodeMap = new Map<string | number, SVGNode>();
    static tooltipToEdit = new Map<NodeType, Map<string, Tooltip>>();
    static activeNode: SVGNode = null;
    group: Selection<SVGGElement, any, any, any>;
    node: HierarchyPointNode<Node>;
    links: SVGEdge[] = [];
    incomingLinks = new linkCoordinates();
    outgoingLinks = new linkCoordinates();
    tooltip: Tooltip;

    constructor(group: Selection<SVGGElement, any, any, any>, node: HierarchyPointNode<Node>) {
        const height = SVGNode.config.nodeHeight;
        const minWidth = SVGNode.config.nodeMinWidth;
        const pad = SVGNode.config.nodePadding;
        const idPadLeft = SVGNode.config.nodeIDPaddingLeft;
        const idPadRight = SVGNode.config.nodeIDPaddingRight;
        const labelPadLeft = SVGNode.config.labelPaddingLeft;

        this.node = node;
        this.group = group
            .on("mouseenter", () => this.mouseEnter())
            .on("mouseleave", () => this.mouseLeave())
            .on("click", (evt) => this.onClick(evt));
        SVGNode.nodeMap.set(node.data.id, this);

        group.attr("class", SVGNode.config.nodeStyle.get(this.node.data.type))
            .attr("transform", `translate(${node.x}, ${node.y})`)

        const rect = group.append("rect");
        let width: number;

        if (typeof(node.data.id) === "string") { // Node has an ID
            const idGroup = group.append("g");
            const idRect = idGroup.append("rect");
            const idText = idGroup.append("text")
                .text(node.data.id)
                .attr("class", "node-id-text");
            const bbox = idText.node().getBBox();
            width = bbox.width + idPadLeft + idPadRight;

            const label = idGroup.append("text")
                .text(node.data.label)
            width += label.node().getBBox().width;

            const nodeWidth = Math.max(minWidth, width + pad + labelPadLeft);
            const rectX = -nodeWidth/2;
            const rectY = -height/2;

            SVGNode._positionRect(rect, nodeWidth, height);

            idRect.attr("class", "node-id-bg")
                .attr("clip-path", "url(#rounded-left)")
                .attr("width", bbox.width + idPadLeft + idPadRight)
                .attr("height", height);

            idGroup.attr("transform", `translate(${rectX}, ${rectY})`);
            idText.attr("x", idPadLeft)
                .attr("y", height/2);
            label.attr("x", bbox.width + idPadLeft + idPadRight + labelPadLeft)
                .attr("y", height/2);
        } else { // Node doesn't have an ID
            const label = group.append("text")
                .text(node.data.label)
                .attr("class", "centered");

            width = label.node().getBBox().width;

            const nodeWidth = Math.max(minWidth, width + 2*pad);
            SVGNode._positionRect(rect, nodeWidth, height);
        }

        if (this.node.data.type !== NodeType.DEFAULT) {
            let tempLabel = this.node.data.label;
            if (this.node.data.type === NodeType.WIKI && tempLabel === '-')
                this.tooltip = this.tooltip = new Tooltip($("<div>"),
                    "No wiki link found",
                    "",
                    this.node.data.type,
                    this.group);
            else {
                if (this.node.data.type === NodeType.WIKI)
                    tempLabel = tempLabel.substring(1, tempLabel.length-1);
                this.tooltip = new Tooltip($("<div>"),
                    tempLabel,
                    "",
                    this.node.data.type,
                    this.group);
                SVGNode.tooltipToEdit.get(this.node.data.type).set(tempLabel, this.tooltip);
            }
        }
    }

    private onClick(evt) {
        evt.stopPropagation();
        if (SVGNode.activeNode !== null) {
            SVGNode.activeNode.deactivate();
        }
        this.activate();
    }

    mouseEnter() {
        this.group.classed("hover", true);
        this.links.forEach(link => link.mouseEnter());
        this.group.raise();

        if (this.tooltip)
            this.tooltip.fadeIn();
    }

    mouseLeave() {
        this.group.classed("hover", false);
        this.links.forEach(link => link.mouseLeave());

        if (this.tooltip)
            this.tooltip.fadeOut();
    }

    activate() {
        SVGNode.activeNode = this;
        this.links.forEach(link => link.activate());
        this.group.raise();
        this.group.classed("active", true);
    }

    deactivate() {
        this.links.forEach(link => link.deactivate());
        this.group.classed("active", false);
        SVGNode.activeNode = null;
    }

    private static _positionRect(rect: Selection<SVGRectElement, any, any, any>, width: number, height: number) {
        const rectX = -width/2;
        const rectY = -height/2;

        rect.attr("x", rectX)
            .attr("y", rectY)
            .attr("width", width)
            .attr("height", height)
            .attr("rx", SVGNode.config.nodeRectRX)
            .attr("ry", SVGNode.config.nodeRectRY);
    }

    static getTooltipInfo(cache: penmanCache) {
        if (cache.predicateTooltipData.size === 0 && cache.wikiTooltipData.size === 0) {
            const wikiMap = SVGNode.tooltipToEdit.get(NodeType.WIKI);
            const wikis = Array.from(wikiMap.keys());
            const predicateMap = SVGNode.tooltipToEdit.get(NodeType.PREDICATE)
            const predicates = Array.from(predicateMap.keys());

            // const testData = JSON.parse('{"sentence":"After seeing that YouTube video I wonder, what does the fox say?", "triples": [["z0", ":instance", "wonder-01"], ["z0", ":ARG0", "z1"], ["z1", ":instance", "i"], ["z0", ":ARG1", "z2"], ["z2", ":instance", "say-01"], ["z2", ":ARG0", "z3"], ["z3", ":instance", "fox"], ["z2", ":ARG1", "z4"], ["z4", ":instance", "amr-unknown"], ["z0", ":time", "z5"], ["z5", ":instance", "after"], ["z5", ":op1", "z6"], ["z6", ":instance", "see-01"], ["z6", ":ARG0", "z1"], ["z6", ":ARG1", "z7"], ["z7", ":instance", "video"], ["z7", ":medium", "z8"], ["z8", ":instance", "publication"], ["z8", ":wiki", "\\"YouTube\\""], ["z8", ":name", "z9"], ["z9", ":instance", "name"], ["z9", ":op1", "\\"YouTube\\""], ["z7", ":mod", "z10"], ["z10", ":instance", "that"]], "penman": "(z0 / wonder-01\\n    :ARG0 (z1 / i)\\n    :ARG1 (z2 / say-01\\n              :ARG0 (z3 / fox)\\n              :ARG1 (z4 / amr-unknown))\\n    :time (z5 / after\\n              :op1 (z6 / see-01\\n                       :ARG0 z1\\n                       :ARG1 (z7 / video\\n                                 :medium (z8 / publication\\n                                             :wiki \\"YouTube\\"\\n                                             :name (z9 / name\\n                                                       :op1 \\"YouTube\\"))\\n                                 :mod (z10 / that)))))", "penman_id": 60, "sentence_id": 60, "predicates": {"wonder-01": {"desc": "think about, ponder", "examples": ["At the same time, the sheer size of the loss, coupled with a slowing of orders, made some securities analysts wonder just howstrong that turnaround will be at the computer maker anddefense-electronics concern.", "Not everyone is reacting so calmly, however, and many wonder about the long-term implications of what is widely viewed as thecause of Friday\'s slide, reluctance by banks to provide financingfor a buy-out of UAL Corp., parent of United Airlines."], "bn": ["bn:00087656v", "bn:00092265v"], "args": [["ARG0: thinker", "ARG1: thought"]]}, "say-01": {"desc": "say", "examples": ["A Lorillard spokeswoman said \\"This is an old story.\\"", "[Kent cigarettes were sold]-1, the company said *trace*-1", "[What matters is what advertisers will pay]-1, said *trace*-1 Newsweek\'s chairman", "S-[\\"What you have to understand,\\" said John [*?*], \\"is that Philly literally stinks.\\"]", "John said to Mary: \\"you\'re an idiot.\\"", "\\"Well that\'s odd,\\" said John of the disappearance of his nose.", "John-1 is said *trace*-1 to be an idiot."], "bn": ["bn:00087644v", "bn:00093293v", "bn:00093290v", "bn:00082527v", "bn:00093287v", "bn:00082800v"], "args": [["ARG0: Sayer", "ARG1: Utterance", "ARG2: Hearer", "ARG3: Attributive"]]}, "see-01": {"desc": "view", "examples": ["John saw the President.", "John saw that the President collapsed.", "John saw the President as a fool."], "bn": ["bn:00087701v", "bn:00088205v", "bn:00093437v", "bn:00084662v", "bn:00085683v", "bn:00093431v", "bn:00092443v", "bn:00082813v", "bn:00085647v", "bn:00093430v", "bn:00093433v", "bn:00093432v", "bn:00087787v"], "args": [["ARG0: viewer", "ARG1: thing viewed", "ARG2: attribute of arg1, further description"]]}}, "wikis": {"YouTube": ["YouTube is an American online video-sharing platform headquartered in San Bruno, California.", "bn:02873520n"]}}\n');
            // cache.predicateTooltipData = new Map(Object.keys(testData.predicates).map(k => [k, testData.predicates[k]]));
            // cache.wikiTooltipData = new Map(Object.keys(testData.wikis).map(k => [k, testData.wikis[k]]));
            // SVGNode.editTooltips(cache);

            $.post({
                url: ViewManager.API_URL + 'tooltip-description/',
                data: {wikis: JSON.stringify(wikis), predicates: JSON.stringify(predicates)},
                success: data => {
                    cache.predicateTooltipData = new Map(Object.keys(data.predicates).map(k => [k, data.predicates[k]]));
                    cache.wikiTooltipData = new Map(Object.keys(data.wikis).map(k => [k, data.wikis[k]]));
                    SVGNode.editTooltips(cache);
                },
                dataType: "json"
            });
        } else {
            SVGNode.editTooltips(cache);
        }
    }

    static editTooltips(cache: penmanCache) {
        const wikiMap = SVGNode.tooltipToEdit.get(NodeType.WIKI);
        const wikis = Array.from(wikiMap.keys());
        const predicateMap = SVGNode.tooltipToEdit.get(NodeType.PREDICATE)
        const predicates = Array.from(predicateMap.keys());

        for (const wiki of wikis) {
            const tooltip = wikiMap.get(wiki);
            if (cache.wikiTooltipData.has(wiki)) {
                const [description, babelNetID] = cache.wikiTooltipData.get(wiki);
                tooltip.changeImage(wiki)
                tooltip.changeDescription(description);
                tooltip.changeTitle(wiki);
                tooltip.addLink(`https://babelnet.org/synset?id=${babelNetID}&lang=EN`);
            }
            else {
                tooltip.changeTitle('No wiki link found');
                tooltip.removeImage();
                tooltip.removeDescription()
            }
        }
        for (const predicate of predicates) {
            const tooltip = predicateMap.get(predicate);
            const tooltipData = cache.predicateTooltipData.get(predicate);
            let description: string;
            if (tooltipData === undefined) {
                description = 'No description found.';
                tooltip.removeDescription();
            }
            else {
                description = `${tooltipData.desc}\n\n${tooltipData.args[0].join('\n')}\n\nExamples:\n${tooltipData.examples[0]}`;
                const predicateName = predicate.substring(0, predicate.length-3);
                const url = `https://verbs.colorado.edu/propbank/framesets-english-aliases/${predicateName}.html`
                $.ajax({
                    type: "HEAD",
                    url: url,
                    dataType: 'jsonp',
                    jsonp: false,
                    success: data => {
                        tooltip.addLink(url);
                    },
                    error: jqXHR => {
                        if (jqXHR.status === 200) {
                            tooltip.addLink(url);
                        }
                    },
                })
            }
            tooltip.changeDescription(description);
        }
    }

    static init() {
        SVGNode.nodeMap = new Map<string | number, SVGNode>();
        SVGNode.tooltipToEdit = new Map<NodeType, Map<string, Tooltip>>();
        SVGNode.tooltipToEdit.set(NodeType.WIKI, new Map<string, Tooltip>());
        SVGNode.tooltipToEdit.set(NodeType.PREDICATE, new Map<string, Tooltip>());
        SVGNode.activeNode = null;

        const defs = d3.select("#defs");

        defs.append("clipPath")
            .attr("id", "rounded-left")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 500)
            .attr("height", 27)
            .attr("rx", 13.5)
            .attr("ry", 13.5);
    }
}