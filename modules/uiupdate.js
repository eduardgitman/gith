

function renderCommitsInDialog(commits, fileName) {
  $("#dialog").dialog("option", "title", "Log for " + fileName);

  // c is object with: hash, author, authorEmail, date, title, files
  // c.files is array of objects with: changeA, changeR, change, name
  for (let c of commits) {
    let changeNo = 0;
    for (let f of c.files) {
      if (fileName == f.name) {
        changeNo = f.change;
        break;
      }
    }

    c.changes = changeNo;
  }

  switchUiContext([
    { type: 'table', hook: '#dialogAuthorTable'},
    { type: 'table', hook: '#dialogTable'}
  ])

  $("#dialogTable").DataTable({
    bAutoWidth: false,
    order: [[0, "desc"]],
    pageLength: 10,
    data: commits,
    columns: [
      {
        data: "date",
        type: "date",
        width: "15%",
        render: function (data, type) {
          return $.datepicker.formatDate("dd M yy", new Date(data));
        },
      },
      { data: "author" },
      { data: "changes" },
      { data: "title" },
    ],
  });
  $("#dialogTable").show();
  $("#dialog").dialog("open");
}

function renderAuthorCommitsInDialog(commits, author) {
  $("#dialog").dialog("option", "title", "Commits by " + author);

  // c is object with: hash, author, authorEmail, date, title, files
  // c.files is array of objects with: changeA, changeR, change, name
  for (let c of commits) {
    let changeNo = 0;
    if (author == c.author) {
      for (let f of c.files) {
        if (!isNaN(f.change)) changeNo += f.change;
      }
    }

    c.changes = changeNo;
  }

  switchUiContext([
    { type: 'table', hook: '#dialogAuthorTable'},
    { type: 'table', hook: '#dialogTable'}
  ])

  $("#dialogAuthorTable").DataTable({
    bAutoWidth: false,
    order: [[0, "desc"]],
    pageLength: 10,
    data: commits,
    columns: [
      {
        data: "date",
        type: "date",
        width: "15%",
        render: function (data, type) {
          return $.datepicker.formatDate("dd M yy", new Date(data));
        },
      },
      { data: "changes" },
      { data: "title" },
    ],
  });
  $("#dialogAuthorTable").show();
  $("#dialog").dialog("open");
}

function switchUiContext(elements) {
  for (let e of elements) {
    if (e.type == 'table') {
      if ($.fn.dataTable.isDataTable(e.hook)) {
        $(e.hook).DataTable().destroy();
      }
      $(e.hook).hide();
    }

    if(e.type == 'tree') {
      // figure out how to destroy
      $(e.hook).hide();
    }
  }
}

export { renderCommitsInDialog, renderAuthorCommitsInDialog, switchUiContext };
