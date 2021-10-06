import "./viewManager.scss";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import { TabItem, Tabs } from "../Tabs/Tabs";
import { InputType, TextInput } from "../TextInput/TextInput";
import { Button, ButtonType } from "../Button/Button";
import { Resizer } from "../Resizer/Resizer";
import { SVGGraph } from "../SVGGraph/SVGGraph";
import { Alert, AlertType } from "../Alert/Alert";
import {
  penmanCache,
  PredicateTooltipData,
  SingleLink,
  WikiTooltipData,
} from "../util";
import { SVGNode } from "../SVGNode/SVGNode";
import SubmitEvent = JQuery.SubmitEvent;

enum RequestType {
  SENTENCE = "sentence",
  PENMAN = "penman",
}

enum RequestEndpoint {
  SENTENCE_TO_PENMAN = "sentence-to-penman/",
  SENTENCE_UPDATE_PENMAN = "sentence-update-penman/",
  SENTENCE_EDIT_PENMAN = "sentence-edit-penman/",
  PENMAN_TO_SENTENCE = "penman-to-sentence/",
  PENMAN_EDIT_SENTENCE = "penman-edit-sentence/",
}

export class ViewManager {
  private static instance: ViewManager = null;
  private static readonly LOGO = "./media/SPRING-logo.svg";
  private static readonly DEFAULT_TEXT_VALUE =
    "After seeing that YouTube video I wonder, what does the fox say?";
  private static readonly DEFAULT_PENMAN_VALUE =
    "(z0 / wonder-01\n" +
    "    :ARG0 (z1 / i)\n" +
    "    :ARG1 (z2 / say-01\n" +
    "              :ARG0 (z3 / fox)\n" +
    "              :ARG1 (z4 / amr-unknown))\n" +
    "    :time (z5 / after\n" +
    "              :op1 (z6 / see-01\n" +
    "                       :ARG0 z1\n" +
    "                       :ARG1 (z7 / video\n" +
    "                                 :medium (z8 / publication\n" +
    '                                             :wiki "YouTube"\n' +
    "                                             :name (z9 / name\n" +
    '                                                       :op1 "YouTube"))\n' +
    "                                 :mod (z10 / that)))))";
  static readonly API_URL = "http://nlp.uniroma1.it/spring/";
  private static currentRequest = null;

  private constructor() {
    const body = $("body");
    new Header($("header"));
    new Footer($("footer"));
    if (body.data("title") === "main") {
      // index.html
      ViewManager.HomepageView();
    } else if (body.data("title") === "about") {
      // about.html
      $("main").addClass("justify-center");
    } else if (body.data("title") === "api-doc") {
      // api-documentation.html
      $("main").addClass("justify-center");
      // $("pre").each((i, obj) => {
      //     $(obj).text($(obj).text().replace("SPRING_URL", window.location.host));
      // });
    }
  }

  static getInstance() {
    if (ViewManager.instance === null) ViewManager.instance = new ViewManager();
    return ViewManager.instance;
  }

  private static RemoveMainContent() {
    $("header, main").removeClass("homepage");
    $("main").empty();
  }

  private static HomepageView() {
    ViewManager.RemoveMainContent();
    $("header").addClass("homepage");
    const main = $("main")
      .addClass("homepage")
      .append(
        $("<img>")
          .attr("id", "logo")
          .attr("src", ViewManager.LOGO)
          .on("click", () => location.reload())
          .css("cursor", "pointer")
      );
    const mainForm = $("<form/>").attr("id", "mainForm").appendTo(main);
    const inputDiv = $("<div/>").appendTo(mainForm);
    const tabSentence = new TabItem("Text");
    const tabPenman = new TabItem("PENMAN");
    let requestType = RequestType.SENTENCE;
    let requestEndPoint = RequestEndpoint.SENTENCE_TO_PENMAN;
    new Tabs($("<div/>").attr("id", "tab-container").appendTo(inputDiv))
      .addTab(tabSentence)
      .addTab(tabPenman);
    const textAndButtonDiv = $("<div/>")
      .addClass("main-text-btn-container")
      .appendTo(inputDiv);
    const textAndError = $("<div class='input-error-container' />").appendTo(
      textAndButtonDiv
    );
    const textInput = new TextInput(
      $("<div/>").appendTo(textAndError),
      InputType.SENTENCE,
      "query"
    );
    textInput.value(ViewManager.DEFAULT_TEXT_VALUE);
    let oldTextValue: string = ViewManager.DEFAULT_TEXT_VALUE;
    let oldPenmanValue: string = ViewManager.DEFAULT_PENMAN_VALUE;
    tabSentence.onClick(() => {
      requestType = RequestType.SENTENCE;
      requestEndPoint = RequestEndpoint.SENTENCE_TO_PENMAN;
      oldPenmanValue = textInput.value() as string;
      textInput.changeType(oldTextValue);
    });
    tabPenman.onClick(() => {
      requestType = RequestType.PENMAN;
      requestEndPoint = RequestEndpoint.PENMAN_TO_SENTENCE;
      oldTextValue = textInput.value() as string;
      textInput.changeType(oldPenmanValue);
    });
    new Button(
      $("<button>")
        .attr("type", "submit")
        .attr("id", "send")
        .appendTo(textAndButtonDiv),
      ButtonType.PRIMARY,
      "SEND"
    );

    mainForm.on("submit", (evt) => {
      evt.preventDefault();
      if (textInput.value() === "alert") {
        this.errorHandler({ readyState: 0 }, textAndError);
        return;
      }

      // const testData = JSON.parse('{"sentence":"After seeing that YouTube video I wonder, what does the fox say?", "triples": [["z0", ":instance", "wonder-01"], ["z0", ":ARG0", "z1"], ["z1", ":instance", "i"], ["z0", ":ARG1", "z2"], ["z2", ":instance", "say-01"], ["z2", ":ARG0", "z3"], ["z3", ":instance", "fox"], ["z2", ":ARG1", "z4"], ["z4", ":instance", "amr-unknown"], ["z0", ":time", "z5"], ["z5", ":instance", "after"], ["z5", ":op1", "z6"], ["z6", ":instance", "see-01"], ["z6", ":ARG0", "z1"], ["z6", ":ARG1", "z7"], ["z7", ":instance", "video"], ["z7", ":medium", "z8"], ["z8", ":instance", "publication"], ["z8", ":wiki", "\\"YouTube\\""], ["z8", ":name", "z9"], ["z9", ":instance", "name"], ["z9", ":op1", "\\"YouTube\\""], ["z7", ":mod", "z10"], ["z10", ":instance", "that"]], "penman": "(z0 / wonder-01\\n    :ARG0 (z1 / i)\\n    :ARG1 (z2 / say-01\\n              :ARG0 (z3 / fox)\\n              :ARG1 (z4 / amr-unknown))\\n    :time (z5 / after\\n              :op1 (z6 / see-01\\n                       :ARG0 z1\\n                       :ARG1 (z7 / video\\n                                 :medium (z8 / publication\\n                                             :wiki \\"YouTube\\"\\n                                             :name (z9 / name\\n                                                       :op1 \\"YouTube\\"))\\n                                 :mod (z10 / that)))))", "penman_id": 60, "sentence_id": 60, "predicates": {"wonder-01": {"desc": "think about, ponder", "examples": ["At the same time, the sheer size of the loss, coupled with a slowing of orders, made some securities analysts wonder just howstrong that turnaround will be at the computer maker anddefense-electronics concern.", "Not everyone is reacting so calmly, however, and many wonder about the long-term implications of what is widely viewed as thecause of Friday\'s slide, reluctance by banks to provide financingfor a buy-out of UAL Corp., parent of United Airlines."], "bn": ["bn:00087656v", "bn:00092265v"], "args": [["ARG0: thinker", "ARG1: thought"]]}, "say-01": {"desc": "say", "examples": ["A Lorillard spokeswoman said \\"This is an old story.\\"", "[Kent cigarettes were sold]-1, the company said *trace*-1", "[What matters is what advertisers will pay]-1, said *trace*-1 Newsweek\'s chairman", "S-[\\"What you have to understand,\\" said John [*?*], \\"is that Philly literally stinks.\\"]", "John said to Mary: \\"you\'re an idiot.\\"", "\\"Well that\'s odd,\\" said John of the disappearance of his nose.", "John-1 is said *trace*-1 to be an idiot."], "bn": ["bn:00087644v", "bn:00093293v", "bn:00093290v", "bn:00082527v", "bn:00093287v", "bn:00082800v"], "args": [["ARG0: Sayer", "ARG1: Utterance", "ARG2: Hearer", "ARG3: Attributive"]]}, "see-01": {"desc": "view", "examples": ["John saw the President.", "John saw that the President collapsed.", "John saw the President as a fool."], "bn": ["bn:00087701v", "bn:00088205v", "bn:00093437v", "bn:00084662v", "bn:00085683v", "bn:00093431v", "bn:00092443v", "bn:00082813v", "bn:00085647v", "bn:00093430v", "bn:00093433v", "bn:00093432v", "bn:00087787v"], "args": [["ARG0: viewer", "ARG1: thing viewed", "ARG2: attribute of arg1, further description"]]}}, "wikis": {"YouTube": ["YouTube is an American online video-sharing platform headquartered in San Bruno, California.", "bn:02873520n"]}}\n');
      // switch (requestType) {
      //     case RequestType.SENTENCE:
      //         ViewManager.SentenceToAMR(testData)
      //         break;
      //
      //     case RequestType.PENMAN:
      //         ViewManager.AMRToSentence(testData)
      //         break;
      // }

      ViewManager.requestHandler(
        evt,
        requestType,
        requestEndPoint,
        textInput,
        textAndError,
        (data) => {
          switch (requestType) {
            case RequestType.SENTENCE:
              ViewManager.SentenceToAMR(data);
              break;

            case RequestType.PENMAN:
              ViewManager.AMRToSentence(data);
              break;
          }
        }
      );
    });
  }

  private static requestHandler(
    evt: SubmitEvent,
    requestType: RequestType,
    requestEndPoint: RequestEndpoint,
    textInput: TextInput,
    errorContainer: JQuery,
    successCallback: (data) => any,
    additionalData: object = {}
  ) {
    evt.preventDefault();
    if (textInput.value() == "") return;
    if (
      requestType === RequestType.SENTENCE &&
      String(textInput.value()).split(/\s+/).length > 512
    ) {
      ViewManager.errorHandler(
        {
          readyState: 1,
          responseJSON: {
            message: "",
            text: "Maximum sentence length is 512 words.",
          },
        },
        errorContainer
      );
      return;
    }
    let requestBody = {
      [requestType as string]: textInput.value(),
    };
    requestBody = { ...requestBody, ...additionalData };
    // console.log(requestBody);
    ViewManager.currentRequest = $.post({
      url: this.API_URL + requestEndPoint,
      data: requestBody,
      beforeSend: () => {
        $("button").addClass("loading-cursor");
        $("body").addClass("loading-cursor");
        const checkErr = $("#alert");
        if (checkErr) checkErr.remove();
        if (ViewManager.currentRequest !== null)
          ViewManager.currentRequest.abort();
      },
      success: (data) => successCallback({ ...requestBody, ...data }),
      dataType: "json",
    })
      .fail((jqXHR) => ViewManager.errorHandler(jqXHR, errorContainer))
      .always(() => {
        $("button").removeClass("loading-cursor");
        $("body").removeClass("loading-cursor");
      });
  }

  private static SentenceToAMR(data: {
    sentence: string;
    penman: string;
    triples: [string, string, string][];
    penman_id: number;
  }) {
    ViewManager.RemoveMainContent();
    // console.log(data);
    const penman_id = data.penman_id;
    const main = $("main");
    const inputContainer = $("<div class='input-container'/>").appendTo(main);
    const resizer = $("<div/>").appendTo(main);
    const graphContainer = $("<div class='graph-container'/>").appendTo(main);

    const sentenceForm = $("<form/>").appendTo(inputContainer);
    sentenceForm.append($("<p class='input-label'/>").text("Text"));
    const sentenceText = $("<div/>").appendTo(sentenceForm);
    const sentenceTextInput = new TextInput(
      sentenceText,
      InputType.SENTENCE,
      "sentence"
    );
    sentenceTextInput.value(data.sentence);
    const parseButton = $("<button type='submit'>").appendTo(sentenceText);
    new Button(parseButton, ButtonType.MINI, "PARSE");

    const penmanForm = $("<form class='penman-form' />").appendTo(
      inputContainer
    );
    penmanForm.append($("<p class='input-label'/>").text("PENMAN"));
    const penmanText = $("<div/>").appendTo(penmanForm);
    const penmanTextInput = new TextInput(
      penmanText,
      InputType.PENMAN,
      "penman",
      "80%"
    );
    penmanText.removeAttr("style").css("flex-grow", "1");
    penmanTextInput.value(data.penman);
    const buttonContainer = $("<div class='penman-buttons'/>").appendTo(
      penmanText
    );
    const prevNextContainer = $("<div/>").appendTo(buttonContainer);
    const updateModifyContainer = $("<div/>").appendTo(buttonContainer);
    const prev = $("<button type='button' />").appendTo(prevNextContainer);
    const next = $("<button type='button' />").appendTo(prevNextContainer);
    const update = $("<button type='button' class='penman-submit' />").appendTo(
      updateModifyContainer
    );
    const modify = $("<button type='button' class='penman-submit' />").appendTo(
      updateModifyContainer
    );
    const prevButton = new Button(prev, ButtonType.MINI_OUTLINE, "Prev", true);
    prevButton.addLeftChevron();
    const nextButton = new Button(next, ButtonType.MINI_OUTLINE, "Next", true);
    nextButton.addRightChevron();
    const updateButton = new Button(update, ButtonType.MINI, "VIEW GRAPH");
    const modifyButton = new Button(modify, ButtonType.MINI, "SUBMIT CHANGES");
    new Resizer(resizer);
    const graph = new SVGGraph();
    graph.buildGraph(data.triples, graphContainer);
    let currentPenman = new SingleLink<penmanCache>({
      penman: data.penman,
      triples: data.triples,
      wikiTooltipData: new Map<string, WikiTooltipData>(),
      predicateTooltipData: new Map<string, PredicateTooltipData>(),
    });
    SVGNode.getTooltipInfo(currentPenman.value);

    sentenceForm.on("submit", (evt) => {
      evt.preventDefault();
      ViewManager.requestHandler(
        evt,
        RequestType.SENTENCE,
        RequestEndpoint.SENTENCE_TO_PENMAN,
        sentenceTextInput,
        inputContainer,
        (sentenceToAMRData) => ViewManager.SentenceToAMR(sentenceToAMRData)
      );
    });

    updateButton.onClick((evt) => {
      evt.preventDefault();
      if (penmanTextInput.value() === currentPenman.value.penman) return;
      ViewManager.requestHandler(
        evt,
        RequestType.PENMAN,
        RequestEndpoint.SENTENCE_UPDATE_PENMAN,
        penmanTextInput,
        inputContainer,
        (sentenceToAMRData: {
          penman: string;
          triples: [string, string, string][];
        }) => {
          graph.buildGraph(sentenceToAMRData.triples, graphContainer);
          currentPenman = currentPenman.append({
            triples: sentenceToAMRData.triples,
            penman: sentenceToAMRData.penman,
            wikiTooltipData: new Map<string, WikiTooltipData>(),
            predicateTooltipData: new Map<string, PredicateTooltipData>(),
          });
          SVGNode.getTooltipInfo(currentPenman.value);
          prevButton.enable();
          nextButton.disable();
        },
        {
          penman_id: penman_id,
        }
      );
    });

    modifyButton.onClick((evt) => {
      evt.preventDefault();
      ViewManager.requestHandler(
        evt,
        RequestType.PENMAN,
        RequestEndpoint.SENTENCE_EDIT_PENMAN,
        penmanTextInput,
        inputContainer,
        (data: { penman: string; triples: [string, string, string][] }) => {
          const alert = $("<div id='alert' />").appendTo(inputContainer);
          new Alert(alert, AlertType.SUCCESS, data["message"], data["text"]);
        },
        {
          penman_id: penman_id,
        }
      );
    });

    const updateGraph = (cPenman: penmanCache) => {
      penmanTextInput.value(cPenman.penman);
      graph.buildGraph(cPenman.triples, graphContainer);
      SVGNode.getTooltipInfo(cPenman);
    };

    prevButton.onClick(() => {
      currentPenman = currentPenman.prev;
      if (currentPenman.prev === null) prevButton.disable();

      updateGraph(currentPenman.value);
      nextButton.enable();
    });

    nextButton.onClick(() => {
      currentPenman = currentPenman.next;
      if (currentPenman.next === null) nextButton.disable();

      updateGraph(currentPenman.value);
      prevButton.enable();
    });
  }

  private static AMRToSentence(data: {
    sentence: string;
    penman: string;
    triples: [string, string, string][];
    sentence_id: number;
  }) {
    ViewManager.RemoveMainContent();
    const sentence_id = data.sentence_id;
    const main = $("main");
    const inputContainer = $("<div class='input-container'/>").appendTo(main);
    const resizer = $("<div/>").appendTo(main);
    const graphContainer = $("<div class='graph-container'/>").appendTo(main);

    const penmanForm = $("<form class='penman-form' />").appendTo(
      inputContainer
    );
    penmanForm.append($("<p class='input-label'/>").text("PENMAN"));
    const penmanText = $("<div/>").appendTo(penmanForm);
    const penmanTextInput = new TextInput(
      penmanText,
      InputType.PENMAN,
      "penman",
      "80%"
    );
    penmanText.removeAttr("style").css("flex-grow", "1");
    penmanTextInput.value(data.penman);
    const buttonContainer = $("<div class='penman-buttons'/>").appendTo(
      penmanText
    );
    const generate = $(
      "<button type='submit' class='penman-submit generate-btn' />"
    ).appendTo(buttonContainer);
    new Button(generate, ButtonType.MINI, "GENERATE");

    const sentenceForm = $("<form/>").appendTo(inputContainer);
    sentenceForm.append($("<p class='input-label'/>").text("Text"));
    const sentenceText = $("<div/>").appendTo(sentenceForm);
    const sentenceTextInput = new TextInput(
      sentenceText,
      InputType.SENTENCE,
      "sentence"
    );
    sentenceTextInput.value(data.sentence);
    const modifyButton = $("<button type='submit'>").appendTo(sentenceText);
    new Button(modifyButton, ButtonType.MINI, "SUBMIT CHANGES");

    new Resizer(resizer);
    const graph = new SVGGraph();
    graph.buildGraph(data.triples, graphContainer);
    let currentPenman = new SingleLink<penmanCache>({
      penman: data.penman,
      triples: data.triples,
      wikiTooltipData: new Map<string, WikiTooltipData>(),
      predicateTooltipData: new Map<string, PredicateTooltipData>(),
    });
    SVGNode.getTooltipInfo(currentPenman.value);

    sentenceForm.on("submit", (evt) => {
      evt.preventDefault();
      ViewManager.requestHandler(
        evt,
        RequestType.SENTENCE,
        RequestEndpoint.PENMAN_EDIT_SENTENCE,
        sentenceTextInput,
        inputContainer,
        (data) => {
          const alert = $("<div id='alert' />").appendTo(inputContainer);
          new Alert(alert, AlertType.SUCCESS, data["message"], data["text"]);
        },
        {
          sentence_id: sentence_id,
        }
      );
    });

    penmanForm.on("submit", (evt) => {
      evt.preventDefault();
      if (penmanTextInput.value() === currentPenman.value.penman) return;
      ViewManager.requestHandler(
        evt,
        RequestType.PENMAN,
        RequestEndpoint.PENMAN_TO_SENTENCE,
        penmanTextInput,
        inputContainer,
        (AMRToSentenceData) => ViewManager.AMRToSentence(AMRToSentenceData)
      );
    });
  }

  private static errorHandler(jqXHR, container) {
    // console.log(jqXHR);
    if (jqXHR.statusText === "abort") return;
    const checkErr = $("#alert");
    if (checkErr) checkErr.remove();
    const errAlert = $("<div id='alert' />").appendTo(container);
    if (jqXHR.readyState === 0)
      new Alert(
        errAlert,
        AlertType.ERROR,
        "Error",
        "Could not reach the server."
      );
    else
      switch (jqXHR.status) {
        case 429:
          new Alert(
            errAlert,
            AlertType.ERROR,
            "Error: Too many requests",
            "Try again later."
          );
          break;

        default:
          const response = jqXHR.responseJSON;
          new Alert(
            errAlert,
            AlertType.ERROR,
            "Error: " + response.message,
            response.text
          );
          break;
      }
  }
}
