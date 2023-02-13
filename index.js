import { parseText } from "./modules/parse.js";
import { showFileTable, showAuthorsTable, showFolderTree, showCalendar } from "./modules/render.js";

const menuToPanel = [
  {menu: '.j-menuFiles', panel: '.j-filesPanel'},
  {menu: '.j-menuAuthors', panel: '.j-authorsPanel'},
  {menu: '.j-menuFolders', panel: '.j-treePanel'},
  {menu: '.j-menuCalendar', panel: '.j-calendarPanel'},  
  {menu: '.j-menuHelp', panel: '.j-helpPanel'},
  {menu: '.j-menuHome', panel: '.j-firstPageInfo'}
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
    $('.j-menuFiles').click();
  };
  fileReader.onerror = function () {
    alert(fileReader.error);
  }; 
}

function linkMenuEvents() {  

  
  $('.j-menuHome').click(function(event){    
    setMenuActive($(this));
  })

  $('.j-menuFiles').click(function(event){    
    if(showFileTable())
      setMenuActive($(this));
  })

  $('.j-menuAuthors').click(function(){    
    if(showAuthorsTable())
      setMenuActive($(this));
  })

  $('.j-menuFolders').click(function(event){    
    if(showFolderTree())
      setMenuActive($(this));
  })  

  $('.j-menuCalendar').click(function(event){    
    if(showCalendar())
      setMenuActive($(this));
  })   

  $('.j-menuHelp').click(function(event){   
    setMenuActive($(this));
    $('.j-processPanel').show();
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

export { initApplication, linkMenuEvents };
