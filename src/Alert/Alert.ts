import "./alert.scss";

export enum AlertType {
    INFO = "-info", ERROR = "-error", SUCCESS = "-success", WARNING = "-warning"
}

export class Alert
{
    private readonly element: JQuery;

    constructor(element: JQuery, type: AlertType, title: string, body: string)
    {
        this.element = element;

        const titleElement = $("<strong />").addClass("title").text(title);
        const bodyElement = $("<span />").addClass("alert-body").text(body);

        element
            .addClass("alert")
            .addClass("alert" + type)
            .append(titleElement)
            .append(bodyElement)
    }

    private dispose()
    {
        this.element.remove();
    }
}