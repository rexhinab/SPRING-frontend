import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import "@fortawesome/fontawesome-free/js/regular";
import "@fortawesome/fontawesome-free/js/brands";
import "./button.scss"


export enum ButtonType {
    PRIMARY= "-primary", MINI = "-mini", MINI_OUTLINE = "-mini-outline"
}

export class Button {
    private readonly element: JQuery;
    private disabled = false;
    private clickCallback = (evt) => {};

    constructor(element: JQuery, type: ButtonType, label: string, disabled = false) {
        this.element = element;

        if (disabled)
            this.disable();

        element.addClass("button")
            .addClass("button" + type)
            .text(label)
            .on("click", evt => this.clickHandler(evt));
    }

    private clickHandler(evt) {
        evt.stopPropagation()

        if (this.disabled)
            return;

        this.clickCallback(evt);
    }

    disable() {
        this.disabled = true;
        this.element.attr("disabled", "true");
        this.element.addClass("disabled");
    }

    enable() {
        this.disabled = false;
        this.element.removeAttr("disabled");
        this.element.removeClass("disabled");
    }

    addLeftChevron() {
        this.element.prepend("<i class=\"fas fa-chevron-left\"></i> ")
    }

    addRightChevron() {
        this.element.append(" <i class=\"fas fa-chevron-right\"></i>")
    }

    onClick(clickCallback: (evt) => void) {
        this.clickCallback = clickCallback;
    }

    private dispose()
    {
        this.element.remove();
    }
}