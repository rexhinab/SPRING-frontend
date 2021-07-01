import "./tabs.scss"

export class Tabs {
    private readonly container: JQuery;

    constructor(container: JQuery) {
        this.container = container.addClass("tab-container");
    }

    addTab(tab: TabItem) {
        this.container.append(tab.element);
        this.container.children(":first").addClass("active");
        return this;
    }
}

export class TabItem {
    readonly element: JQuery;
    private clickCallback = () => {};

    constructor(name: string) {
        this.element = $("<button type='button' />")
            .text(name)
            .addClass("tab-item")
            .on("click",evt => this.clickHandler(evt));
    }

    private clickHandler(evt) {
        evt.preventDefault();
        evt.stopPropagation()

        if (this.element.hasClass("active"))
            return;

        this.element.parent().children().toggleClass("active");
        this.clickCallback();
    }

    onClick(clickCallback: () => void) {
        this.clickCallback = clickCallback;
    }
}