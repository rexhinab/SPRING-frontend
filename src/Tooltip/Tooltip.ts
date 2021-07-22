import "./tooltip.scss";
import {NodeType} from "../util";
import {Selection} from "d3";

export class Tooltip {
    private static tooltipMargin = 4;
    private readonly element: JQuery;
    private readonly img: JQuery = null;
    private readonly title: JQuery;
    private readonly description: JQuery;
    private readonly group: Selection<SVGGElement, any, any, any>;
    private url: string = null;

    constructor(element: JQuery,
                title: string,
                description: string,
                type: NodeType,
                group:  Selection<SVGGElement, any, any, any>) {
        this.group = group;
        this.element = element
            .addClass("tooltip");

        const tag = $("<p class='tag' />").appendTo(element);
        switch (type) {
            case NodeType.WIKI:
                tag.text("WIKI")
                    .addClass("tag-wiki");
                this.img = $("<div class='image'/>").hide().appendTo(element);
                break;

            case NodeType.PREDICATE:
                tag.text("PREDICATE")
                    .addClass("tag-predicate");
                break;

            case NodeType.DEFAULT:
                break;
        }

        const titleDescriptionContainer = $("<div class='title-description-container' />").appendTo(element);
        this.title = $("<strong class='title' />")
            .text(title)
            .appendTo(titleDescriptionContainer);
        this.description = $("<p class='description' />")
            .text("")
            .appendTo(titleDescriptionContainer);
    }

    changeImage(imageName: string) {
        if (this.img !== null) {
            $.get({
                url: "https://en.wikipedia.org/w/api.php",
                data: {
                    action: "query",
                    titles: imageName,
                    prop: "pageimages",
                    format: "json",
                    pilimit: 1,
                    pithumbsize: 150,
                    piprop: "thumbnail",
                    origin: "*"
                },
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: data => {
                    const pages = data["query"]["pages"];
                    if (!("-1" in pages)) {
                        const thumbnail = Object.entries(pages)[0][1]["thumbnail"];
                        if (thumbnail !== undefined) {
                            this.img.css("background-image", `url(${thumbnail["source"]})`);
                            const imgWidth = 56; // check css
                            const realWidth = thumbnail["width"];
                            const realHeight = thumbnail["height"];
                            this.img.css("max-height", `${imgWidth / realWidth * realHeight}px`)
                            this.img.show();
                            return;
                        }
                    }
                    this.img.hide();
                }
            });
        }
    }

    removeImage() {
        this.img.hide();
    }

    removeDescription() {
        this.description.remove();
    }

    changeTitle(title: string) {
        this.title.text(title);
    }

    changeDescription(description: string) {
        this.description.text(description);
    }

    fadeIn() {
        if (!this.element.parent().is("body")) { // element wasn't added to the DOM
            this.element.appendTo($("body"));
            const groupBCR = this.group.node().getBoundingClientRect();
            let x = groupBCR.x - this.element.outerWidth() - Tooltip.tooltipMargin;
            // console.log(groupBCR.width, this.group.node().getBBox().width)
            // console.log(this.element.outerHeight())
            if (x < 0)
                x = groupBCR.x + groupBCR.width + Tooltip.tooltipMargin;
            this.element.css({
                left: `${x}px`,
                top: `${groupBCR.y + groupBCR.height/2 - this.element.outerHeight()/2}px`
            });
            this.element.css({
                opacity: 0,
                display: "flex"
            }).animate({opacity: 1});

            let events = {
                mouseenter: () => {
                    $(this.element).stop(true, false).fadeTo(200, 1);
                },
                mouseleave: () => {
                    this.element.delay(200).fadeOut(400, () => this.element.remove());
                },
                click: () => {
                    if (this.url !== null)
                        window.open(this.url, '_blank');
                }
            };

            this.element.on(events);
        } else {
            $(this.element).stop(true, false).fadeTo(200, 1);
        }
    }

    fadeOut() {
        this.element.delay(200).animate({opacity: 0}, {
            done: () => this.element.remove()
    });
    }

    addLink(url: string) {
        this.element.addClass("clickable");
        this.url = url;
    }
}