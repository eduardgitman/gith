import {
  renderCommitsInDialog,
  renderAuthorCommitsInDialog,
  switchUiContext,
} from "./uiupdate.js";

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

  showFileTable(cArr);
}

function showFolderTree() {
  switchUiContext([
    { type: "table", hook: "#tableFiles" },
    { type: "table", hook: "#tableAuthors" },
    { type: "tree", hook: "#tree" },
  ]);

  $("#tree").fancytree({
    extensions: ["filter"],
    filter: {  // override default settings
      counter: false, // No counter badges
      mode: "hide"  // "dimm": Grayout unmatched nodes, "hide": remove unmatched nodes
    },
    source: buildTreeView(g_arr),
    enhanceTitle: function (event, data) {
      let span = $("<span>")
        .attr("style", "display: inline-block; width: 30px")
        .text(data.node.data.change);
      let title = $("<span>").text(data.node.title);

      data.$title.html("").append(span).append(title);
    },
    click : function(event, data) {
      let path = computeTreeNodePath(data.node).substring("/root/".length);
      if(!data.node.folder)
        fileLog(path);
    },
    beforeExpand: function (event, data) {
      for (let c of data.node.children) {
        // put the commits here
        let path = computeTreeNodePath(c).substring("/root/".length);
        c.data.change = countCommitsForPath(path);
        if (c.children != null && c.children.length > 0) c.folder = true;
      }
    },
  });
  $("#tree").show();

  $('#treeSearchInput').keyup(function (e) { 

    $.ui.fancytree.getTree("#tree").filterNodes($(this).val(), {autoExpand: true, leavesOnly: true});
  });
}

function showAuthorsTable() {
  let authorChange = buildAuthorsAmount(g_arr);
  let cols = [];
  for (let a of authorChange.aca) {
    cols.push({ name: a[0], change: a[1], cmts: authorChange.acc.get(a[0]) });
  }

  switchUiContext([
    { type: "table", hook: "#tableFiles" },
    { type: "table", hook: "#tableAuthors" },
    { type: "tree", hook: "#tree" },
  ]);

  $("#tableAuthors").DataTable({
    bAutoWidth: false,
    order: [[0, "desc"]],
    pageLength: 25,
    data: cols,
    columns: [
      { data: "change" },
      { data: "cmts" },
      {
        data: "name",
        render: function (data, type) {
          let img = $("<img>")
            .addClass("j-commitViewForAuthor mr10")
            .attr("src", "https://img.icons8.com/material-outlined/32/null/document-writer.png");
          let txt = $("<span>").text(data);
          return $("<div>").append(img).append(txt).html();
        },
      },
    ],
  });
  $("#tableAuthors").show();

  $(".j-commitViewForAuthor").click(function () {
    authorLog($($(this).siblings()[0]).text());
  });
  $(".j-inputForm").hide();
  $(".j-processPanel").show();
}

function showFileTable(cArr) {
  if (cArr == undefined) {
    cArr = g_arr;
    showFolderTree;
  }
  showDatepicker(cArr);

  let fileChange = buildFileChangeAmount(cArr);
  let cols = [];
  for (let f of fileChange.fca) {
    cols.push({ name: f[0], change: f[1], cmts: fileChange.fcc.get(f[0]) });
  }

  switchUiContext([
    { type: "table", hook: "#tableFiles" },
    { type: "table", hook: "#tableAuthors" },
    { type: "tree", hook: "#tree" },
  ]);

  $("#tableFiles").DataTable({
    bAutoWidth: false,
    order: [[0, "desc"]],
    pageLength: 50,
    data: cols,
    columns: [
      { data: "change" },
      { data: "cmts" },
      {
        data: "name",
        render: function (data, type) {
          let img = $("<img>")
            .addClass("j-commitView")
            .attr("src", "https://img.icons8.com/ios/32/null/file--v1.png");
          let txt = $("<span>").text(data);
          return $("<div>").append(img).append(txt).html();
        },
      },
    ],
  });
  $("#tableFiles").show();

  $(".j-commitView").click(function () {
    fileLog($($(this).siblings()[0]).text());
  });
  $(".j-inputForm").hide();
  $(".j-processPanel").show();
}

function buildTreeView(cArr) {
  // c is an object with: hash, author, authorEmail, date, title, files
  // files is an array with: changeA, changeR, change, name
  let paths = [];
  for (let c of cArr) {
    for (let f of c.files) {
      if (paths.indexOf(f.name) == -1) {
        paths.push(f.name);
      }
    }
  }

  let result = [];
  let level = { result };

  paths.forEach((path) => {
    path.split("/").reduce((r, title, i, a) => {
      if (!r[title]) {
        r[title] = { result: [] };
        r.result.push({ title, children: r[title].result });
      }

      return r[title];
    }, level);
  });

  // compute commits for the first level
  for (let r of result) {
    if (r.children.length > 0) {
      r.folder = true;
    }
  }

  for (let r of result) {
    r.change = countCommitsForPath(r.title);
  }

  return result;
}

function countCommitsForPath(path) {
  let result = 0;
  for (let c of g_arr) {
    for (let f of c.files) {
      if (f.name.startsWith(path)) {
        result++;
        break;
      }
    }
  }
  return result;
}

function computeTreeNodePath(node) {
  if (node == null) return "";

  let name = node.title;
  if (node.parent != "root") {
    return computeTreeNodePath(node.parent) + "/" + name;
  } else {
    return "";
  }
}

function buildAuthorsAmount(cArr) {
  const aMap = new Map();
  const aCC = new Map();
  // c is an object with: hash, author, authorEmail, date, title, files
  // files is an array with: changeA, changeR, change, name
  for (let c of cArr) {
    // count commits per author
    if (aCC.has(c.author)) {
      let old = aCC.get(c.author);
      aCC.set(c.author, old + 1);
    } else {
      aCC.set(c.author, 1);
    }

    for (let f of c.files) {
      // count changes
      if (!isNaN(f.change))
        if (aMap.has(c.author)) {
          let old = aMap.get(c.author);
          aMap.set(c.author, old + f.change);
        } else {
          aMap.set(c.author, f.change);
        }
    }
  }
  // author change amount and author change count
  return { aca: aMap, acc: aCC };
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

function authorLog(author) {
  console.log("extract author log and show on dialog");
  let al = [];
  for (let c of g_arr) {
    if (c.author == author) {
      al.push(c);
      continue;
    }
  }

  al.sort(function (a, b) {
    return b.date - a.date;
  });

  renderAuthorCommitsInDialog(al, author);
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
      showFileTable(parseCommits(g_commits, new Date(dateText)));
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

function getCommit(hash) {
  for (let c of g_arr) {
    if (c.hash.startsWith(hash)) {
      return c;
    }
  }
}

export { parseText, fileLog, showFileTable, showAuthorsTable, showFolderTree, getCommit};
