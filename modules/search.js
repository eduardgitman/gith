
var callbackFn;

function buildSearch(root, callback) {
    if(root.find('.searchWrapper').length > 0 ){
        return;
    }   
    $('.searchWrapper').each(function(i, elm){
        let $elm = $(elm);
        if($elm.parent().attr('id') !== root.attr('id')) {
            $elm.remove();
        }
    })
    callbackFn = callback;
    let div = $('<div class=\'searchWrapper\'>');
    let addCondition = $('<button type=\'button\' class=\'j-addRow w5em\'>').text('Add');
    let search = $('<button type=\'button\' class=\'mr10\'>').text('Search');
    let clear = $('<a href=\'#\' class=\'j-clearSearch\'>').text('Clear');
    div.append(buildSearchRow(true));

    div.find('.divSearchInput').first().after(addCondition);

    // div.append($('<div>').append(addCondition));
    div.append($('<div>').append(search).append(clear));
    root.append(div);

    addCondition.click(function(e){
        div.find('.j-rowSearch').last().after(buildSearchRow(false));
        if(div.find('.j-rowSearch').length > 3 ) {
            $(this).hide();
        }
    });

    search.click(function(e){
        // getSearchObj();
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
        if(div.find('.j-textInput').length == 0) {
            div.find('.divSearchInput').append($('<input type=\'text\' class=\'j-textInput mb5 w160pc\'>'));
        } else {
            div.find('.j-textInput').val('');
        }
        callbackFn();
    })
}

function buildSearchRow(first) {
    let row = $('<div class=\'j-rowSearch\'>')
    let selField = $('<select class=\'j-fieldSelect w160 mr10\'>');
    let selComparator = $('<select class=\'j-cmpSelect w160 mr10\'>');
    let divInput = $('<div class=\'divSearchInput\'>')
    let textInput = $('<input type=\'text\' class=\'j-textInput mb5 w160pc\'>');
    let dateInput = $('<input type=\'date\' class=\'j-dateOne mb5 mr18\'>');
    let date2Input = $('<input type=\'date\' class=\'j-dateTwo mb5\'>');
    
    let removeCondition = $('<button type=\'button\' class=\'j-removeRow w5em\'>').text('Remove');
    addFieldOptions(selField);
    addCmpOption(selComparator, 'text');
    
    row.append(selField).append(selComparator).append( divInput.append(textInput) );
    if(!first) {
        row.append(removeCondition);
    }

    selField.change(function(e){
        if($(this).val() == 'date') {
            addCmpOption(selComparator, 'date');
            $(this).parent().find('.j-textInput').after(dateInput);
            $(this).parent().find('.j-textInput').remove();
        } else {
            if(selComparator.find(":selected").val().indexOf('date')>=0) {
                addCmpOption(selComparator, 'text');
                $(this).parent().find('.j-dateOne').after(textInput);
                $(this).parent().find('.j-dateOne').remove();
            }
        }
    });

    selComparator.change(function(e){
        if($(this).val() == 'dateBetween') {
            $(this).parent().find('.j-dateOne').after(date2Input);
        } else {
            $(this).parent().find('.j-dateTwo').remove();
        }
    });

    removeCondition.click(function(e){
        $(this).parent().remove();
        if($('.searchWrapper').find('j-rowSearch').length < 4 ) {
            $('.j-addRow').show();
        }
    })

    return row;
}

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
        let v;
        let d2;
        if(f == 'date') {
            v = $row.find('.j-dateOne').val();
            if(c == 'dateBetween') {
                d2 = $row.find('.j-dateTwo').val();
            }
        } else {
            v = $row.find('.j-textInput').val();
        }
        s.push({
            field: f,
            cmp: c,
            value: v,
            d2: d2
        })
        // console.log(f + ' ' + c + ' ' + v + ' ' + d2 );
    })
    return s;
}

export {buildSearch, getSearchObj}