import { parseText, showFileTable, showAuthorsTable, showFolderTree } from "./modules/parse.js";

const menuToPanel = [
  {menu: '.j-menuFiles', panel: '.j-filesPanel'},
  {menu: '.j-menuAuthors', panel: '.j-authorsPanel'},
  {menu: '.j-menuFolders', panel: '.j-treePanel'},
  {menu: '.j-menuHelp', panel: '.j-helpPanel'}
]

function initApplication() {
  let input = document.querySelector("input");
  const file = input.files[0];
  console.log("Loading GIT log file: " + file.name);

  let fileReader = new FileReader();
  fileReader.readAsText(file);
  fileReader.onload = function () {
    console.log("File loaded in memory");
    parseText(fileReader.result);

    $('.j-firstPageInfo').hide();
    $('.j-processPanel').show();

    linkMenuEvents();
    $('.j-menuFiles').click();
  };
  fileReader.onerror = function () {
    alert(fileReader.error);
  }; 
}

function linkMenuEvents() {  

  $('.j-menuFiles').click(function(event){    
    showFileTable();
    setMenuActive($(this));
  })

  $('.j-menuAuthors').click(function(){    
    showAuthorsTable();
    setMenuActive($(this));
  })

  $('.j-menuFolders').click(function(event){    
    showFolderTree();
    setMenuActive($(this));
  })  

  $('.j-menuHelp').click(function(event){   
    setMenuActive($(this));
  })  
}

function setMenuActive(elm) {
  $('.navbar-nav').find('.nav-item').each(function() {
    $( this ).removeClass( "active" );
  })
  elm.addClass('active');

  menuToPanel.forEach((obj, index) => {
    $(obj.panel).hide();
    if(elm.attr('class').indexOf(obj.menu.substring(1)) > 0 ) {
      $(obj.panel).show();
    }
  })
}

export { initApplication };
