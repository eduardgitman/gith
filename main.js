import { parseText, showFileTable, showAuthorsTable } from "./modules/parse.js";

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

  linkEvents();
}

function linkEvents() {
  $('.j-menuAuthors').click(function(){
    $(this).addClass('active');
    $('.j-menuFiles').removeClass('active');
    $('.j-menuFiles').find('.nav-link').attr('href', '#');
    showAuthorsTable();
  })

  $('.j-menuFiles').click(function(event){
    event.preventDefault();
    event.stopPropagation();

    $(this).addClass('active');
    $('.j-menuAuthors').removeClass('active');

    showFileTable();
  })
}

export { loadLog };
