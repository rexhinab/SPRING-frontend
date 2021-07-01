import "./resizer.scss"

export class Resizer {
    private element: JQuery;
    private leftSide: JQuery;
    private rightSide: JQuery;
    private static minWidth = 20; // %
    private static maxWidth = 80; // %
    private mouseMove = (e) => this.mouseMoveHandler(e);
    private mouseUp = (e) => this.mouseUpHandler(e);

    constructor(element: JQuery) {
        this.element = element
            .addClass("resizer")
            .on("mousedown",
                (e) => this.mouseDownHandler(e));
    }

    private mouseDownHandler(e) {
        this.leftSide = this.element.prev();
        this.rightSide = this.element.next();

        document.addEventListener('mousemove', this.mouseMove);
        document.addEventListener('mouseup', this.mouseUp);
    }

    private mouseMoveHandler(e) {
        $("body").addClass("resizing");
        this.element.addClass("resizing");
        const prop = {
            "user-select": "none",
            "pointer-events": "none"
        };
        this.leftSide.css(prop);
        this.rightSide.css(prop);

        const newLeftWidth = e.pageX * 100 / this.element.parent().width();
        this.leftSide.css("width", `${Math.min(Math.max(Resizer.minWidth, newLeftWidth), Resizer.maxWidth)}%`);
    }

    private mouseUpHandler(e) {
        this.element.removeClass("resizing");
        $("body").removeClass("resizing");

        const prop = {
            "user-select": "",
            "pointer-events": ""
        };
        this.leftSide.css(prop);
        this.rightSide.css(prop);

        document.removeEventListener("mousemove", this.mouseMove);
        document.removeEventListener("mouseup", this.mouseUp);
    }
}