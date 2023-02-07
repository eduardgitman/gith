import { parseText, showFileTable, showAuthorsTable, showFolderTree } from "./modules/parse.js";

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

  linkMenuEvents();
}

function linkMenuEvents() {
  $('.j-menuAuthors').click(function(){
    resetMenuActiveState();
    $(this).addClass('active');
    $('.j-menuFiles').find('.nav-link').attr('href', '#');
    showAuthorsTable();
  })

  $('.j-menuFiles').click(function(event){
    resetMenuActiveState();
    $(this).addClass('active');
    showFileTable();
  })

  $('.j-menuFolders').click(function(event){
    resetMenuActiveState();
    $(this).addClass('active');
    showFolderTree();
  })  
}

function resetMenuActiveState() {
  $('.navbar-nav').find('.nav-item').each(function() {
    $( this ).removeClass( "active" );
  })
}

export { loadLog };
