import { fileLog } from "./parse.js";

function renderCommitsInDialog(commits, fileName) {
    $('#dialog').dialog('option', 'title', 'Log for ' + fileName);

    let root = $("#dialogCommitsList");
    root.empty();

  // c is object with: hash, author, authorEmail, date, title, files
  // c.files is array of objects with: changeA, changeR, change, name
  for (let c of commits) {
    let changeNo = 0;
    for(let f of c.files) {
        if(fileName == f.name) {
            changeNo = f.change;
            break;
        }
    }

    c.changes = changeNo;
  }

  if ($.fn.dataTable.isDataTable("#dialogTable")) {
    $("#dialogTable").DataTable().destroy();
  }

  $('#dialogTable').DataTable({
    bAutoWidth: false,
    order: [[0, 'desc']],
    "pageLength": 10,
    data: commits,
    columns: [
      { data: "date", 
        "width": "15%",
        render: function (data, type) {
          return ($.datepicker.formatDate('dd M yy', new Date(data)));
        } }, 
      { data: "author" }, 
      { data: "changes" }, 
      { data: "title" }]
  });


  $('#dialog').dialog('open');
}

export { renderCommitsInDialog };