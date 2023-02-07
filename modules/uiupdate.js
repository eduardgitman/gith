import { getCommit } from './parse.js'

function renderCommitsInDialog(commits, fileName) {
  $("#dialog").dialog("option", "title", "Log for " + fileName);

  switchUiContext([
    { type: "table", hook: "#dialogAuthorTable" },
    { type: "table", hook: "#dialogTable" },
  ]);

  $("#dialogTable").DataTable({
    bAutoWidth: false,
    order: [[0, "desc"]],
    pageLength: 10,
    data: commits,
    columns: [
      {
        data: "date",
        type: "date",
        width: "10%",
        render: function (data, type) {
          return $.datepicker.formatDate("dd M yy", new Date(data));
        },
      },
      {
        data: "hash",
        render: function(data, type) {
          let link = $('<a>').attr('href', '#').addClass('j-hashLink').text(data.substring(0,7));
          return $("<span>").append(link).html();
        }
      },
      {
        data: "author",
      },
      {
        data: "changes",
        render: function (data, type, row) {
          let file;
          for (let f of row.files) {
            if (fileName == f.name) {
              file = f;
              break;
            }
          }

          return renderChangesColumn(file.changeA, file.changeR);
        },
      },
      { data: "title" },
    ],
  });
  $("#dialogTable").show();
  $("#dialog").dialog("open");
  $('.j-hashLink').click(function(){
    showCommit($(this).text())
  })
}

// c is object with: hash, author, authorEmail, date, title, files
// c.files is array of objects with: changeA, changeR, change, name

function renderAuthorCommitsInDialog(commits, author) {
  $("#dialog").dialog("option", "title", "Commits by " + author);

  switchUiContext([
    { type: "table", hook: "#dialogAuthorTable" },
    { type: "table", hook: "#dialogTable" },
  ]);

  $("#dialogAuthorTable").DataTable({
    bAutoWidth: false,
    order: [[0, "desc"]],
    pageLength: 10,
    data: commits,
    columns: [
      {
        data: "date",
        type: "date",
        width: "10%",
        render: function (data, type) {
          return $.datepicker.formatDate("dd M yy", new Date(data));
        },
      },
      {
        data: "hash",
        render: function(data, type) {
          let link = $('<a>').attr('href', '#').addClass('j-hashLink').text(data.substring(0,7));          
          return $("<span>").append(link).html();
        }
      },
      {
        data: "changes",
        render: function (data, type, row) {
          let caNo = 0;
          let crNo = 0;
          for (let f of row.files) {
            if (!isNaN(f.changeA)) caNo += f.changeA;
            if (!isNaN(f.changeR)) crNo += f.changeR;
          }

          return renderChangesColumn(caNo, crNo);
        },
      },
      { data: "title" },
    ],
  });
  $("#dialogAuthorTable").show();
  $("#dialog").dialog("open");
  $('.j-hashLink').click(function(){
    showCommit($(this).text())
  })
}

function showCommit(hash) {
  let  c = getCommit(hash);
  $("#dialogCommit").dialog("option", "title", "Commit details " + c.hash);

  let author = $('<div>').text('Author: ' + c.author);
  let title = $('<div>').text('Title: ' + c.title);
  let date = $('<div>').text('Date: ' + $.datepicker.formatDate("dd M yy", new Date(c.date)));
  let files = $('<div>');
  for(let f of c.files) {

    let fileFiv = $('<div>').append(renderChangesColumn(f.changeA, f.changeR, true)).append($('<span>').text(f.name));

    files.append(fileFiv);
  }

  $(".j-commitBody").empty();
  $(".j-commitBody").append(author).append(date).append(title).append(files);

  $("#dialogCommit").dialog("open");  
}

function renderChangesColumn(caNo, crNo, isWide) {
  let ca = $("<span>").addClass("commitChangesAddedInDialog").text(caNo);
  let cr = $("<span>").addClass("commitChangesRemovedInDialog").text(crNo);
  if(isWide){
    cr.addClass('wideCommitChangesRemovedInDialog');
  }

  return $("<span>").append(ca).append(cr).html();
}

function switchUiContext(elements) {
  for (let e of elements) {
    if (e.type == "table") {
      if ($.fn.dataTable.isDataTable(e.hook)) {
        $(e.hook).DataTable().destroy();
      }
      $(e.hook).hide();
    }

    if (e.type == "tree") {
      // figure out how to destroy
      $(e.hook).hide();
    }
  }
}

export { renderCommitsInDialog, renderAuthorCommitsInDialog, switchUiContext };
