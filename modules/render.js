import {
  buildFileChangeAmount,
  buildAuthorsAmount,
  buildTreeView,
  buildCalendarView,
  countCommitsForPath,
  computeTreeNodePath,
  authorLog,
  fileLog,
} from "./parse.js";

import { cleanAndCloseUiContext, showCommit } from "./uiupdate.js";

function showFileTable() {
  let fileChange = buildFileChangeAmount();
  let cols = [];
  for (let f of fileChange.fca) {
    cols.push({ name: f[0], change: f[1], cmts: fileChange.fcc.get(f[0]) });
  }

  cleanAndCloseUiContext([
    { type: "table", hook: "#tableFiles" },
    { type: "table", hook: "#tableAuthors" },
    { type: "tree", hook: "#tree" },
  ]);

  $("#tableFiles").DataTable({
    bAutoWidth: false,
    order: [[0, "desc"]],
    pageLength: 10,
    data: cols,
    columns: [
      { data: "change" },
      { data: "cmts" },
      {
        data: "name",
        render: function (data, type) {
          let img = $("<img>")
            .addClass("j-commitView")
            .attr("style", "height: 15px")
            .attr("src", "https://img.icons8.com/ios/32/null/file--v1.png");
          let txt = $("<span>").text(data);
          return $("<div>").append(img).append(txt).html();
        },
      },
    ],
    fnDrawCallback: function (oSettings) {
      $(".j-commitView").click(function () {
        fileLog($($(this).siblings()[0]).text());
      });
    },
  });
  $("#tableFiles").show();
}

function showAuthorsTable() {
  let authorChange = buildAuthorsAmount();
  let cols = [];
  for (let a of authorChange.aca) {
    cols.push({ name: a[0], change: a[1], cmts: authorChange.acc.get(a[0]) });
  }

  cleanAndCloseUiContext([
    { type: "table", hook: "#tableFiles" },
    { type: "table", hook: "#tableAuthors" },
    { type: "tree", hook: "#tree" },
  ]);

  $("#tableAuthors").DataTable({
    bAutoWidth: false,
    order: [[0, "desc"]],
    pageLength: 10,
    data: cols,
    columns: [
      { data: "change" },
      { data: "cmts" },
      {
        data: "name",
        render: function (data, type) {
          let img = $("<img>")
            .addClass("j-commitViewForAuthor mr10")
            .attr("style", "height: 15px")
            .attr(
              "src",
              "https://img.icons8.com/material-outlined/32/null/document-writer.png"
            );
          let txt = $("<span>").text(data);
          return $("<div>").append(img).append(txt).html();
        },
      },
    ],
    fnDrawCallback: function (oSettings) {
      $(".j-commitViewForAuthor").click(function () {
        authorLog($($(this).siblings()[0]).text());
      });
    },
  });

  $("#tableAuthors").show();
}

function showFolderTree() {
  cleanAndCloseUiContext([
    { type: "table", hook: "#tableFiles" },
    { type: "table", hook: "#tableAuthors" },
    { type: "tree", hook: "#tree" },
  ]);

  $("#tree").fancytree({
    extensions: ["filter"],
    filter: {
      // override default settings
      counter: false, // No counter badges
      mode: "hide", // "dimm": Grayoutfunction showFileTable(cArr) { unmatched nodes, "hide": remove unmatched nodes
    },
    source: buildTreeView(),
    enhanceTitle: function (event, data) {
      let span = $("<span>")
        .attr("style", "display: inline-block; width: 30px")
        .text(data.node.data.change);
      let title = $("<span>").text(data.node.title);

      data.$title.html("").append(span).append(title);
    },
    click: function (event, data) {
      let path = computeTreeNodePath(data.node).substring("/root/".length);
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

  $("#treeSearchInput").keyup(function (e) {
    if (e.key === "Enter" || e.keyCode === 13) {
      $.ui.fancytree
        .getTree("#tree")
        .filterNodes($(this).val(), { autoExpand: true, leavesOnly: true });
    }
  });
}

function showCalendar() {
  var $cal = $('#calendar');
  $cal.zabuto_calendar({
    today_markup: '<span style="color: white" class="badge bg-primary">[day]</span>',
    classname: 'table table-bordered lightgrey-weekends',
    events: buildCalendarView()
  });

  $cal.on('zabuto:calendar:goto', function (e) {
    setTimeout(function() { 
      $('.j-calendarHash').click(function(e){
        let hash = $(this).attr('data-hash');
        showCommit(hash);
      })
     }, 500);    
  });
  
  $('.j-calendarHash').click(function(e){
    let hash = $(this).attr('data-hash');
    showCommit(hash);
  })  
}

export { showFileTable, showAuthorsTable, showFolderTree, showCalendar };
