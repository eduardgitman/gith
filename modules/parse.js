import { renderCommitsInDialog } from "./uiupdate.js";

var g_commits;
var g_arr;

function parseText(text) {
  console.log("Start Parsing Log Entries");

  // split the text in commits
  // https://medium.com/@shemar.gordon32/how-to-split-and-keep-the-delimiter-s-d433fb697c65
  let regex = /(?=commit [A-Za-z0-9]{40}[\n])|(?<=commit [A-Za-z0-9]{40}[\n])/i;

  let commits = joinCommitWithBody(text.split(regex));

  g_commits = commits;

  let cArr = parseCommits(commits);
  g_arr = cArr;

  informUser(cArr);
}

function informUser(cArr) {
  showDatepicker(cArr);

  let fileChange = buildFileChangeAmount(cArr);
  // todo - add more statistics on files
  // commits nr / most frequent comitters / most changes in a day
  let cols = [];
  for (let f of fileChange.fca) {
    cols.push({ name: f[0], change: f[1], cmts: fileChange.fcc.get(f[0]) });
  }

  if ($.fn.dataTable.isDataTable("#table_id")) {
    $("#table_id").DataTable().destroy();
  }

  $("#table_id").DataTable({
    bAutoWidth: false,
    order: [[0, 'desc']],
    "pageLength": 50,
    data: cols,
    columns: [
      { data: "change" }, 
      { data: "cmts" }, 
      { data: "name", 
        render: function (data, type) {
          let img = $('<img>').addClass('j-commitView').attr('src', '/img/commit-git.png');
          let txt = $('<span>').text(data);
          return $('<div>').append(img).append(txt).html();
        }
      }]
  });

  $('.j-commitView').click(function(){
   fileLog($($(this).siblings()[0]).text());
  })
  $(".j-inputForm").hide();
  $(".j-processPanel").show();
}

function buildFileChangeAmount(cArr) {
  const fileMap = new Map();
  const fileCC = new Map();
  for (let c of cArr) {
    for (let f of c.files) {
      // count commits
      if (fileCC.has(f.name)) {
        let old = fileCC.get(f.name);
        fileCC.set(f.name, old + 1);
      } else {
        fileCC.set(f.name, 1);
      }

      // count changes
      if (fileMap.has(f.name)) {
        let old = fileMap.get(f.name);
        fileMap.set(f.name, old + f.change);
      } else {
        fileMap.set(f.name, f.change);
      }
    }
  }

  // Convert the map into an array
  var array = [...fileMap];

  // Set up a sorting function that sort in ascending value order
  var sortFunction = (a, b) => b[1] - a[1];
  return { fca: array.sort(sortFunction), fcc: fileCC };
}

function fileLog(fileName) {
  console.log("extract file log and show on dialog");
  let cl = [];
  for (let c of g_arr) {
    for (let f of c.files) {
      if (f.name == fileName) {
        cl.push(c);
        continue;
      }
    }
  }

  cl.sort(function (a, b) {
    return b.date - a.date;
  });
  renderCommitsInDialog(cl, fileName);
  
}

function showDatepicker(cArr) {
  // set the oldest date
  let oldestDate = getOldestDateFromCommits(cArr);
  $("#firstEdit").datepicker({
    changeMonth: true,
    changeYear: true,
    minDate: oldestDate,
    maxDate: new Date(),
    dateFormat: "d M, y",
    onSelect: function (dateText) {
      informUser(parseCommits(g_commits, new Date(dateText)));
    },
  });
  $("#firstEdit").datepicker("setDate", oldestDate);
}

function getOldestDateFromCommits(commits) {
  let lc = commits.sort(function (a, b) {
    return a.date - b.date;
  });

  return new Date(lc[0].date);
}

function parseCommits(commits, date) {
  console.log("Parse individual commits");

  let cList = [];
  for (let c of commits) {
    let lines = c.split("\n");
    let title = figureTitle(lines);
    if (lines[1].startsWith("Merge:")) {
      continue;
    }

    let cDate = Date.parse(lines[2].substring(8));

    // filter by date
    if (date != undefined && cDate < date.getTime()) {
      continue;
    }

    cList.push({
      hash: lines[0].substring(7),
      author: lines[1].substring(8).split(" <")[0],
      authorEmail: lines[1].substring(8).split(" <")[1].slice(0, -1),
      date: cDate,
      title: title,
      files: extractFileChanges(lines, title),
    });
  }

  return cList;
}

function extractFileChanges(lines, title) {
  let revLines = lines.reverse();

  let files = [];
  for (let l of revLines) {
    if (l == "") continue;

    if (title.includes(l)) {
      break;
    }

    let lc = l.split("\t"); // line chunks
    files.push({
      changeA: parseInt(lc[0]),
      changeR: parseInt(lc[1]),
      change: parseInt(lc[0]) + parseInt(lc[1]),
      name: lc[2],
    });
  }
  return files;
}

function figureTitle(lines) {
  let title = [];
  for (let l of lines) {
    if (l.startsWith(" ")) {
      title.push(l);
    }
  }
  return title.join();
}

function joinCommitWithBody(commits) {
  let holeCommits = [];
  for (let i = 0; i < commits.length; i += 2) {
    holeCommits.push(commits[i] + commits[i + 1]);
  }
  return holeCommits;
}

export { parseText, fileLog };
