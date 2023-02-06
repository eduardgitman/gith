import { parseText } from "./modules/parse.js";
import { renderListRow } from "./modules/uiupdate.js";

function loadLog() {
  let input = document.querySelector("input");
  const file = input.files[0];
  console.log("Loading GIT log file: " + file.name);

  let fileReader = new FileReader();
  fileReader.readAsText(file);
  fileReader.onload = function () {
    console.log("File loaded in memory");
    parseText(fileReader.result);
  };
  fileReader.onerror = function () {
    alert(fileReader.error);
  };
}

function linkEvents() {
  $(".j-filterBtn").on("click", function (evt) {
    filterByText($(".j-filterText").val());
  });

  $(".j-filterClear").on("click", function (evt) {
    $(".j-filterText").val("");
    filterByText("");
  });

  $(".j-sortBySelect").on("change", function (evt) {
    sortBy();
  });

  $(".j-backToIntro").on("click", function (evt) {
    backToIntro();
  });

  $(".j-getStartedLink").on("click", function (evt) {
    showUploadForm();
  });
}

function sortBy() {
  let data = [];
  let ol = $("#mostUsedFiles");
  ol.find(".fileRowDiv").each(function () {
    data.push({
      change: $(this).find(".fileAmountDiv").text(),
      commit: $(this).find(".fileCommitDiv").text(),
      file: $(this).find(".fileNameDiv").text(),
    });
  });

  let opt = $(".j-sortBySelect").find(":selected").val();

  if ("commits" == opt) {
    data.sort(function (a, b) {
      return b.commit - a.commit;
    });
  }
  if ("change" == opt) {
    data.sort(function (a, b) {
      return b.change - a.change;
    });
  }

  ol.empty();
  for (let f of data) {
    renderListRow(ol, f.file, f.change, f.commit);
  }
}

function showUploadForm() {
  $(".j-baseInstructions").hide();
  $(".j-getStartedLink").hide();
  $(".j-inputForm").show();
}

function backToIntro() {
  $(".j-baseInstructions").show();
  $(".j-getStartedLink").show();
  $(".j-inputForm").hide();
}

function filterByText(text) {
  let neg = text.startsWith("!");
  if (neg) {
    text = text.substring(1);
  }
  text = text.toLowerCase();

  $("#mostUsedFiles")
    .find(".fileRowDiv")
    .each(function (indexInArray, valueOfElement) {
      let row = $(valueOfElement);
      row.show();
      if (neg) {
        if (row.find(".fileNameDiv").text().toLowerCase().includes(text)) {
          row.hide();
        }
      } else {
        if (!row.find(".fileNameDiv").text().toLowerCase().includes(text)) {
          row.hide();
        }
      }
    });
}

export { loadLog, linkEvents };
