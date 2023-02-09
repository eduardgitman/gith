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

    $("#tableFiles").show();
    $(".j-firstPageInfo").hide();  
    $(".j-inputForm").hide();
    $(".j-processPanel").show();
  };
  fileReader.onerror = function () {
    alert(fileReader.error);
  };

  resetMenuActiveState();
  $('.j-menuFiles').addClass('active');

  linkMenuEvents();
}

function linkMenuEvents() {
  
  $('.j-menuHome').click(function(){
    resetMenuActiveState();
  })

  $('.j-menuAuthors').click(function(){
    resetMenuActiveState();
    $(this).addClass('active');
    showAuthorsTable();

    $("#tableAuthors").show();
    $(".j-firstPageInfo").hide();  
    $(".j-inputForm").hide();
    $(".j-processPanel").show();
  })

  $('.j-menuFiles').click(function(event){
    resetMenuActiveState();
    $(this).addClass('active');
    showFileTable();

    $("#tableFiles").show();
    $(".j-firstPageInfo").hide();  
    $(".j-inputForm").hide();
    $(".j-processPanel").show();
  })

  $('.j-menuFolders').click(function(event){
    resetMenuActiveState();
    $(this).addClass('active');
    showFolderTree();

    $("#tableFiles").hide();
    $(".j-firstPageInfo").hide();  
    $(".j-inputForm").hide();
    $("#tree").show();
  })  
}

function resetMenuActiveState() {
  $('.navbar-nav').find('.nav-item').each(function() {
    $( this ).removeClass( "active" );
  })
}

export { loadLog };
