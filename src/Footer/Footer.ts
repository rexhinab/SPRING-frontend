import "./footer.scss";

export class Footer {
  private element: JQuery;

  constructor(element: JQuery) {
    this.element = element.addClass("footer");
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
      ["./media/elexis_logo-vertical-with-text.png", "https://elex.is/"],
      [
        "./media/rgb_elg__logo--colour.svg",
        "https://www.european-language-grid.eu/",
      ],
    ];
    logos.forEach(([logo, link]) => {
      element.append(
        $("<a/>")
          .attr("target", "_blank")
          .attr("href", link)
          .append($("<img/>").attr("src", logo))
      );
    });
  }

  private static licenseContainer(element: JQuery) {
    const logo = "./media/EU-erc.svg";
    const MOUSSE_LINK = "http://mousse-project.org/";
    const MOUSSE_GRANT = "726487";
    const ELEXIS_LINK = "https://elex.is/";
    const ELEXIS_PROJECT = "731015";
    const ELG_LINK = "https://www.european-language-grid.eu/";
    const ELG_PROJECT = "825627";
    const LIC_LINK = "https://creativecommons.org/licenses/by-nc-sa/4.0/";
    const LIC_NAME = "CC BY-NC-SA 4.0 License";

    element.addClass("license");

    $("<img/>").attr("src", logo).appendTo(element);

    const licenseText = $("<div/>").attr("id", "license");
    const sponsor = $("<p/>")
      .append("SPRING is funded by the ERC Consolidator Grant ")
      .append(
        $("<a/>")
          .attr("href", MOUSSE_LINK)
          .attr("target", "_blank")
          .text("MOUSSE")
      )
      .append(` No. ${MOUSSE_GRANT}, the `)
      .append(
        $("<a/>")
          .attr("href", ELEXIS_LINK)
          .attr("target", "_blank")
          .text("ELEXIS")
      )
      .append(` project No. ${ELEXIS_PROJECT} and `)
      .append(
        $("<a/>")
          .attr("href", ELG_LINK)
          .attr("target", "_blank")
          .text("European Language Grid")
      )
      .append(
        `  project No. ${ELG_PROJECT} (Universal Semantic Annotator, USeA)`
      )
      .append(
        " under the European Union's Horizon 2020 research and innovation programme."
      );
    const license = $("<p/>")
      .append("SPRING is licensed under the ")
      .append(
        $("<a/>").attr("href", LIC_LINK).attr("target", "_blank").text(LIC_NAME)
      )
      .append(".");
    licenseText.append(sponsor).append(license).appendTo(element);
  }
}
