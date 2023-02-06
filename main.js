import { parseText } from "./modules/parse.js";

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

export { loadLog };
