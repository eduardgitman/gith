import {
  renderCommitsInDialog,
  renderAuthorCommitsInDialog,
} from "./uiupdate.js";

var g_commits;
var g_arr;

const colors = [
  "#e6194B",
  "#3cb44b",  
  "#4363d8",
  "#f58231",
  "#911eb4",  
  "#f032e6",
  "#469990",  
  "#9A6324",  
  "#800000",  
  "#808000",  
  "#000075",
  "#a9a9a9",
  "#ffe119",
  "#42d4f4",
  "#bfef45",
  "#aaffc3",
  "#fabed4",
  "#dcbeff",
  "#fffac8",
  "#ffd8b1"
];

function parseText(text) {
  console.log("Start Parsing Log Entries");

  // split the text in commits
  // https://medium.com/@shemar.gordon32/how-to-split-and-keep-the-delimiter-s-d433fb697c65
  let regex = /(?=commit [A-Za-z0-9]{40}[\n])|(?<=commit [A-Za-z0-9]{40}[\n])/i;

  g_commits = joinCommitWithBody(text.split(regex));
  g_arr = parseCommits(g_commits);
}

function buildTreeView() {
  let cArr = g_arr;
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

function buildAuthorsAmount(text) {
  let cArr = g_arr;
  const aMap = new Map();
  const aCC = new Map();
  // c is an object with: hash, author, authorEmail, date, title, files
  // files is an array with: changeA, changeR, change, name
  for (let c of cArr) {
    if( text != undefined && c.title.indexOf(text) < 0) {
      continue;
    }
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

function buildCalendarView() {
  const map = new Map();
  const authorMap = new Map();

  // c is an object with: hash, author, authorEmail, date, title, files
  // files is an array with: changeA, changeR, change, name
  let colorIndex = 0;
  for (let c of g_arr) {
    let dateTime = new Date(c.date);
    let m = dateTime.getMonth() + 1;
    let mm = m < 10 ? "0" + m : m;
    let d = dateTime.getDate();
    let dd = d < 10 ? "0" + d : d;
    let date = dateTime.getFullYear() + "-" + mm + "-" + dd;

    if (map.has(date)) {
      let old = map.get(date);
      old.push(c);
      map.set(date, old);
    } else {
      let a = new Array();
      a.push(c);
      map.set(date, a);
    }

    if (!authorMap.has(c.author)) {
      authorMap.set(c.author, colors[(colorIndex++)%20]);
    }
  }

  let events = [];
  for (const [key, value] of map) {
    let markup = '<div class=\'calendarDay\'>[day]</div>';
    
    for(let c of value) {
      let shortTitle = c.title.substring(0,26);
      markup = markup + 
        '<div class=\'eventLine\' style=\'background-color:' + authorMap.get(c.author) + '\' title=\'' + (c.title + ' by ' + c.author ) + 
        '\'><a href=\'#\' style=\'color:white\' data-hash=\''+c.hash+'\' class=\'j-calendarHash\'>' + shortTitle + '</a></div>';
    }

    events.push(
      {
        'date': key,
        'markup': markup
      }
    )    
  }

  return {events: events, authors: authorMap };
}

function buildFileChangeAmount(text) {
  let cArr = g_arr;
  const fileMap = new Map();
  const fileCC = new Map();
  for (let c of cArr) {
    if( text != undefined && c.title.indexOf(text) < 0) {
        continue;
    }
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
    let ac = parseInt(lc[0]);
    let cr = parseInt(lc[1]);

    files.push({
      changeA: isNaN(ac) ? 0 : ac,
      changeR: isNaN(cr) ? 0 : cr,
      change: (isNaN(ac) ? 0 : ac) + (isNaN(cr) ? 0 : cr),
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

export {
  parseText,
  fileLog,
  authorLog,
  buildFileChangeAmount,
  buildAuthorsAmount,
  buildTreeView,
  buildCalendarView,
  countCommitsForPath,
  computeTreeNodePath,
  getCommit,
};
