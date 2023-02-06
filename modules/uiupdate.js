import { fileLog } from "./parse.js";

function renderListRow(root, file, changes, commits) {
  let row = $("<div>").addClass("fileRowDiv");

  let link = $("<img>").attr("src", "../img/commit-git.png");
  link.attr("title", "Show commits for this file");
  link.click(function (evt) {
    fileLog($(this).parent().parent().find(".fileNameDiv").text());
    $("#dialog").dialog("open");
  });

  let change = $("<div>").addClass("fileAmountDiv").text(changes);
  let name = $("<div>").addClass("fileNameDiv").text(file);
  name.prepend(link);
  let cNo = $("<div>").addClass("fileCommitDiv").text(commits);

  change.attr("title", "Total changes to file");
  cNo.attr("title", "Total number of commits");

  row.append(change).append(cNo).append(name);
  root.append(row);
}

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

    let row = $("<tr>").addClass("fileRowDiv");
    let date = $("<td>").addClass("fileDateDiv tdDate").text(new Date(c.date).toDateString());
    let author = $("<td>").addClass("fileAuthorDiv").text(c.author);
    let title = $("<td>").addClass("fileTitleDiv").text(c.title);    
    let changes = $("<td>").addClass("fileChangeDiv borderChanges").text(changeNo);

    row.append(date).append(author).append(changes).append(title);
    root.append(row);
  }
}

export { renderListRow, renderCommitsInDialog };
