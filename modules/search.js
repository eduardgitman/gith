import { getAuthors } from './parse.js';

var callbackFn;

function buildSearch(root, callback) {
    // if we have already a search for the current panel, let it be
    if(root.find('.searchWrapper').length > 0 ){
        return;
    }   
    // remove all other search boxes from the page
    $('.searchWrapper').each(function(i, elm){
        let $elm = $(elm);
        if($elm.parent().attr('id') !== root.attr('id')) {
            $elm.remove();
        }
    })
    // have a global callback function
    callbackFn = callback;
    // build the wrapper and control buttons ( add search clear )
    let div = $('<div class=\'searchWrapper\'>');
    let addCondition = $('<button type=\'button\' class=\'j-addRow btn btn-primary fr roundIconBtn mr10\' title=\'Add search condition\'>')
            .html('<i class="bi bi-plus-lg"></i>');
    let search = $('<button type=\'button\' class=\'mr10 btn btn-success roundIconBtn\' title=\'Search\'>').html('<i class="bi bi-search"></i>');
    let clear = $('<a href=\'#\' class=\'j-clearSearch\' title=\'Remove all search conditions\'>').text('Clear');

    // add the first search row
    div.append(buildSearchRow(true));

    // add the action row
    div.append($('<div class=\'searchActionDiv\'>').append(search).append(clear).append(addCondition));
    root.append(div);

    // add more search rows, but not more than 4
    addCondition.click(function(e){
        div.find('.j-rowSearch').last().after(buildSearchRow(false));
        if(div.find('.j-rowSearch').length > 3 ) {
            $(this).hide();
        }
        // but remove action on all search rows if there are more than 2
        manageRemoveActions(div);
    });

    search.click(function(e){        
        callbackFn(getSearchObj());
    });

    clear.click(function(e){
        // remove extra conditions
        div.find('.j-removeRow').each(function(i, r){
            $(r).click();
        });
        // reset first row, select comparator and fields
        div.find('.j-fieldSelect').val('title');
        addCmpOption(div.find('.j-cmpSelect'), 'text');
        div.find('.j-cmpSelect').val('include');
        div.find('input[type=\'date\']').remove();
        div.find('.typeahead__container').remove();
        // unfortunately we need to recreate the elements for text input, and link events
        
        if(div.find('.j-textInput').length == 0) {
            let caseImg = getCaseImg();
            caseImg.click(function(e){
                caseImgSwitch($(this))
            })
            div.find('.divSearchInput').append(getTextInput()).append(caseImg);
        } else {
            div.find('.j-textInput').val('');
        }
        // perform a search with no filters
        callbackFn();
    })
}

// builds all the UI elements for a search row
function buildSearchRow(first) {
    let row = $('<div class=\'j-rowSearch mt10\'>')
    let selField = $('<select class=\'j-fieldSelect w160 mr10\'>');
    let selComparator = $('<select class=\'j-cmpSelect w160 mr10\'>');
    let divInput = $('<div class=\'divSearchInput\'>')
    let textInput = getTextInput();
    let caseImg = getCaseImg()
    let date2Input = $('<input type=\'text\' class=\'j-dateTwo mb5 w45pc\'>');
    
    let removeCondition = getRemoveBtn();

    addFieldOptions(selField);
    addCmpOption(selComparator, 'text');
    
    row.append(selField).append(selComparator).append( divInput.append(textInput).append(caseImg) );
    if(!first) { // if it's first row, do not add a remove btn, we always want to show at least one search row
        row.append(removeCondition);
    }

    // add listeners to manage the type of inputs to show, switch between text and date 
    selField.change(function(e){
        $(this).parent().find('.divSearchInput').find('.typeahead__container').remove();
        $(this).parent().find('.j-dateOne').remove();
        $(this).parent().find('.j-dateTwo').remove();    
        $(this).parent().find('.j-textInput').remove();
        $(this).parent().find('.j-caseImg').remove();

        if($(this).val() == 'date') {
            addCmpOption(selComparator, 'date');
            let di = getDateInput();
            di.datepicker({"dateFormat": 'd M, y'});
            $(this).parent().find('.divSearchInput').append(di);            
        } else {
            addCmpOption(selComparator, 'text');
            let newTextInput = getTextInput();
                       
            // if we select authors, add autocomplete
            if($(this).val().indexOf('author') >= 0) {  
                newTextInput = getTypeAhead();  
                setUpTypeAhead(newTextInput.find('.js-typeahead-input'), getAuthors());  
                $(this).parent().find('.divSearchInput').append(newTextInput);          
            } else {
                $(this).parent().find('.divSearchInput').append(newTextInput);    
                $(this).parent().find('.divSearchInput').append(caseImg);
                caseImg.click(function(e){
                    caseImgSwitch($(caseImg))
                })
            }          
        }
    });

    // show/hide end date field 
    selComparator.change(function(e){
        if($(this).val() == 'dateBetween') {
            date2Input.datepicker({"dateFormat": 'd M, y'});
            $(this).parent().find('.j-dateOne').after(date2Input);
        } else {
            $(this).parent().find('.j-dateTwo').remove();
        }
    });

    caseImg.click(function(e){
        caseImgSwitch($(this))
    })

    removeCondition.click(function(e){
        removeSearchAction($(this));
    })

    return row;
}

function setUpTypeAhead($elm, authors) {
    $elm.typeahead({
        order: "asc",
        multiselect: {
            limit: 3 
        },
        source: {
            data: authors
        }
    });   
}

function getDateInput() {
    //https://jqueryui.com/datepicker/#date-range
    return $('<input type=\'text\' class=\'j-dateOne mb5 mr18 w45pc\'>');
}

function getTextInput() {
    return $('<input type=\'text\' class=\'j-textInput mb5 form-control searchInputText w160pc\'>');
}

function getRemoveBtn() {
    return $('<button type=\'button\' class=\'j-removeRow btn btn-danger roundIconBtn\' title=\'Remove search condition\'>')
    .html('<i class="bi bi-trash"></i> ');
}

function getCaseImg() {
    return $('<img src=\'img/caseInsen.png\' class=\'j-caseImg ml3\' data-c=\'ci\' title=\'Case insensitive\'>');
}

function getTypeAhead() {
   return $('<div class=\'typeahead__container w160pc dispInBlock\' >')
                .append($('<div class=\'typeahead__field\' >')
                    .append($('<span class=\'typeahead__query\' style=\'height: 25px\'>')
                                .append('<input class=\'js-typeahead-input\' name=\'q\' type=\'search\' autofocus autocomplete=\'off\' >') ) );

}

// change the case sensitiveness Sensitive / Insensitive of a text Search
function caseImgSwitch($img) {
    if($img.attr('data-c') == 'ci') {
        $img.attr('data-c', 'cs');
        $img.attr('src', 'img/caseSen.png');
        $img.attr('title', 'Case sensitive');
    } else {
        $img.attr('data-c', 'ci');
        $img.attr('src', 'img/caseInsen.png');
        $img.attr('title', 'Case insensitive');
    }
}

// remove on click:remove the search row, and toggles other buttons
function removeSearchAction(elm) {
    elm.parent().remove();
    // if there are less than 4 search rows, enable the add btn
    if($('.searchWrapper').find('.j-rowSearch').length < 4 ) {
        $('.j-addRow').show();
    }
    // if it is the last search row, do not allow it to be deleted
    if($('.searchWrapper').find('.j-rowSearch').length == 1 ) {
        $('.searchWrapper').find('.j-removeRow').remove();
    }
}

// add comparator based on type of field
function addCmpOption(select, type) {
    select.find('option').remove();
    if(type == 'text') {
        select.append($('<option>', {
            value: 'include',
            text: 'Contains'
        }).attr("selected",true));
        select.append($('<option>', {
            value: 'exclude',
            text: 'Not contains'
        }));
        // select.append($('<option>', {
        //     value: 'regex',
        //     text: 'Regular expression'
        // }));         
    }
    if(type == 'date') {
        select.append($('<option>', {
            value: 'dateAfter',
            text: 'After'
        })); 
        select.append($('<option>', {
            value: 'dateBefore',
            text: 'Before'
        }));         
        select.append($('<option>', {
            value: 'dateBetween',
            text: 'Between'
        })); 
    }    
}

// while adding search rows, make sure all of them can be removed
function manageRemoveActions (searchWrapper) {
    let $sw = $(searchWrapper);
    let count = $sw.find('.j-rowSearch').length;
    if(count > 1) {
       $sw.find('.j-rowSearch').each(function(i, r){
            if($(this).find('.j-removeRow').length == 0) {
                let removeCondition = getRemoveBtn();
                $(this).append(removeCondition);
                removeCondition.click(function(e){
                    removeSearchAction($(this));                    
                })
            }
       })
    }
}

function addFieldOptions(selField) {
    selField.append($('<option>', {
        value: 'title',
        text: 'Commit title'
    }).attr("selected",true));
    selField.append($('<option>', {
        value: 'author',
        text: 'Author'
    }));
    selField.append($('<option>', {
        value: 'file',
        text: 'File name'
    }));
    selField.append($('<option>', {
        value: 'date',
        text: 'Commit date'
    }));
}

function getSearchObj() {
    let s = [];
    $('.searchWrapper').find('.j-rowSearch').each(function(index, rowTxt){
        let $row = $(rowTxt);
        let f = $row.find('.j-fieldSelect option:selected').val();
        let c = $row.find('.j-cmpSelect option:selected').val();
        let cs = $row.find('.j-caseImg').attr('data-c');
        let v;
        let d2;
        if(f == 'date') {
            v = $row.find('.j-dateOne').val();
            if(c == 'dateBetween') {
                d2 = $row.find('.j-dateTwo').val();
            }
        } else {
            if(f == 'author') {
                v = [];
                $('.typeahead__label-container').find('.typeahead__label')
                .each(function(i, e){ 
                    v.push($(e).text().slice(0, -1));
                })
            } else {
                v = $row.find('.j-textInput').val();
            }
        }
        s.push({
            field: f,
            cmp: c,
            case: cs,
            value: v,
            d2: d2
        })
        // console.log(f + ' ' + c + ' ' + v + ' ' + d2 );
    })
    return s;
}

export {buildSearch, getSearchObj}