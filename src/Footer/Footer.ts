import "./footer.scss"

export class Footer {
    private element: JQuery;

    constructor(element: JQuery) {
        this.element = element
            .addClass("footer");
        const logos = $("<div/>").appendTo(element);
        Footer.logosContainer(logos);
        const license = $("<div/>").appendTo(element);
        Footer.licenseContainer(license);
    }

    private static logosContainer(element: JQuery) {
        element.addClass("logos");
        const logos = [
                ["./media/LOGO_Sapienza.svg", "http://nlp.uniroma1.it/"],
                ["./media/LOGO_Babelscape.svg", "https://babelscape.com/"],
                ["./media/elexis_logo_bw-2.png", "https://elex.is/"],
            ];
        logos.forEach(
            ([logo, link]) => {
                element.append(
                    $("<a/>")
                        .attr("target", "_blank")
                        .attr("href", link)
                        .append(
                            $("<img/>")
                                .attr("src", logo)
                        )
                );
            }
        )
    }

    private static licenseContainer(element: JQuery) {
        const logo = "./media/EU-erc.svg";
        const MOUSSE_LINK = "http://mousse-project.org/";
        const MOUSSE_GRANT = "726487";
        const ELEXIS_LINK = "https://elex.is/";
        const ELEXIS_PROJECT = "731015";
        const LIC_LINK = "https://creativecommons.org/licenses/by-nc-sa/4.0/";
        const LIC_NAME = "CC BY-NC-SA 4.0 License";

        element.addClass("license");

        $("<img/>")
            .attr("src", logo)
            .appendTo(element);

        const licenseText = $("<div/>")
            .attr("id", "license");
        const sponsor = $("<p/>")
            .append("This project is funded by the ")
            .append(
                $("<a/>")
                    .attr("href", MOUSSE_LINK)
                    .attr("target", "_blank")
                    .text("MOUSSE ERC")
            )
            .append(` Grant no.${MOUSSE_GRANT} and the `)
            .append(
                $("<a/>")
                    .attr("href", ELEXIS_LINK)
                    .attr("target", "_blank")
                    .text("ELEXIS")
            )
            .append(` project no. ${ELEXIS_PROJECT} under the European Union’s Horizon 2020`)
            .append(" research and innovation programme.");
        const license = $("<p/>")
            .append("SPRING is licensed under the ")
            .append(
                $("<a/>")
                    .attr("href", LIC_LINK)
                    .attr("target", "_blank")
                    .text(LIC_NAME)
            )
            .append(".");
        licenseText
            .append(sponsor)
            .append(license)
            .appendTo(element);
    }
}