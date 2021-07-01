import "./textInput.scss"

export enum InputType {
    SENTENCE= "sentence", PENMAN = "penman"
}

export class TextInput {
    private readonly element: JQuery;
    private id: string;
    private static placeholder = new Map([
        [InputType.SENTENCE, "Type a sentence"],
        [InputType.PENMAN, "Type a PENMAN AMR Graph Serialization"]
    ]);
    private cType: InputType;
    private input: JQuery;
    private height = new Map([
        [InputType.SENTENCE, "40px"],
        [InputType.PENMAN, "300px"]
    ]);
    private static JQUERY_SELECTOR = new Map([
        [InputType.SENTENCE, "<input type='text'/>"],
        [InputType.PENMAN, "<textarea/>"]
    ]);

    constructor(element: JQuery, type: InputType, id: string, textAreaHeight = "300px") {
        this.height.set(InputType.PENMAN, textAreaHeight);
        this.element = element
            .addClass(type)
            .outerHeight(this.height.get(type));
        this.id = id;
        this.cType = type;
        this.input = $(TextInput.JQUERY_SELECTOR.get(type))
            .attr("id", id)
            .attr("placeholder", TextInput.placeholder.get(type))
            .appendTo(element);
    }

    changeType(value: string = null) {
        const oldType = this.cType;
        this.cType = this.cType === InputType.SENTENCE ? InputType.PENMAN : InputType.SENTENCE;

        const newInput = $(TextInput.JQUERY_SELECTOR.get(this.cType))
            .attr("id", this.id)
            .attr("placeholder", TextInput.placeholder.get(this.cType))
            .css("display", "none")
            .val(value === null ? this.input.val() : value);

        this.input.fadeOut(100, () => {
            this.input.remove();
            this.input = newInput.appendTo(this.element);
            newInput.fadeIn(100);
        });

        this.element
            .removeClass(oldType)
            .addClass(this.cType)
            .addClass("transition")
            .animate(
                {height: this.height.get(this.cType)},
                {
                    duration: 300,
                    complete: () => {
                        this.element.removeClass("transition")
                    }
                })
    }

    value(value: string = null) {
        if (value === null)
            return this.input.val();
        this.input.val(value);
    }
}