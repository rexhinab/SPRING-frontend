import "./header.scss"

export class Header {
    private element: JQuery;

    constructor(element: JQuery) {
        const HOMEPAGE = "./"
        const LOGO = "./media/SPRING-logo.svg";
        const LINKS = [
            ["API-DOC", "./api-documentation.html"],
            ["ABOUT", "./about.html"]
        ]
        this.element = element
            .addClass("header");

        element.append(
            $("<a class='logo-container' />")
                .attr("href", HOMEPAGE)
                .append(
                    $("<img/>")
                        .attr("src", LOGO)
                        .addClass("logo")
                )
        );

        const linkContainer = $("<div/>")
            .addClass("link-container")
            .appendTo(element);

        LINKS.forEach(
            ([TEXT, LINK]) => {
                $("<a/>")
                    .attr("href", LINK)
                    .text(TEXT)
                    .appendTo(linkContainer);
            }
        );
    }

}