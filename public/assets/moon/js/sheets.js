var requestsPending = false;
var pendingQueries = "";

function openCreateNewSheetModal() {
    $("#newSheetCreateModal").addClass('view')
    intializeModal()
}

function intializeModal() {
    modal = $("#newSheetCreateModal")

    sheetTitle = modal.find('input[name ="sheet-title"]').val("")
    modal.find('input[name ="sheet-title"]').removeClass('input-error-highlight')

    tags = modal.find('input[name ="tags"]').val("")
    modal.find('input[name ="tags"]').removeClass('input-error-highlight')

    sheetSource = modal.find('input[name ="sheet-source"]').prop('checked', false);
    modal.find('input[name ="sheet-source"]').removeClass('input-error-highlight')

    url = modal.find('input[name ="sheetURL"]').val("")
    modal.find('input[name ="sheetURL"]').removeClass('input-error-highlight')
}

async function createNewSheet(){
    modal = $("#newSheetCreateModal")
    invalid = false

    sheetTitle = modal.find('input[name ="sheet-title"]').val()
    modal.find('input[name ="sheet-title"]').removeClass('input-error-highlight')
    if(sheetTitle == '') {
        invalid = true
        modal.find('input[name ="sheet-title"]').addClass('input-error-highlight')
    }

    tags = modal.find('input[name ="tags"]').val().split(' ')

    sheetSource = modal.find('input[name ="sheet-source"]:checked').val()
    modal.find('input[name ="sheet-source"]').removeClass('input-error-highlight')
    if(sheetSource == null) {
        invalid = true
        modal.find('input[name ="sheet-source"]').addClass('input-error-highlight')
    }

    url = modal.find('input[name ="sheetURL"]').val()
    modal.find('input[name ="sheetURL"]').removeClass('input-error-highlight')
    if(url == '' && sheetSource == 'url') {
        invalid = true
        modal.find('input[name ="sheetURL"]').addClass('input-error-highlight')
    }

    if (!invalid) {
        data = {
            sheetTitle:  sheetTitle,
            tags: tags,
            sheetSource: sheetSource,    
            url: url
        }

        await Promise.resolve($.post('/sheets/create', {
            data: data
        }))

        initialize()
        $("#newSheetCreateModal").removeClass("view");  
        $("#newSheetCreateModal").addClass('raise');
    }
}

async function loadSheet(e) {
    tr = $(e).closest('tr')
    url = tr.data('sheet-url')
    $('#google-sheets-iframe').attr('src', url);

    if (tr.data('viewed') == 'False') {
        data = await Promise.resolve($.post('/sheets/logview', {
            sheetID: tr.data('sheet-id'),
        })) 
        
        requestsPending = true
    }
}

async function GetUserQuery(query) {
    var data = await Promise.resolve($.post('/sheets/view', {
        query: query
    }))
    
    sheets = data.sheets
    sheets.sort((a, b) => {
        return (new Date(b.CreationDate)).getTime() - (new Date(a.CreationDate)).getTime()
    })
    
    tbody = $('#sheets-list')
    tbody.empty()
    sheets.forEach(e => {
        viewed = 'False'

        if (e.AccessibleBy.length == 1 && e.AccessibleBy[0].User == data.requester) {
            if (e.AccessibleBy[0].OpenedDate != null) {
                viewed = 'True'
            }
        }

        entry = '<tr data-sheet-url="' + e.SheetURL + '" data-viewed="' + viewed +'" data-sheet-id="' + e._id + '">'
            +'<td onclick="loadSheet(this)" class="sheet-select"><div class="events-box"><p class="title">' + e.Title + '</p>'
            + '</div></td><td class="td-actions text-right">'
        if (e.CreatedBy == data.requester) {
            entry += '<button type="button"'
            entry += 'class="btn btn-link btn-float-right" data-original-title="Edit Task"><i class="fas fa-trash-alt"></i>'
            entry += '</button><button type="button" class="btn btn-link btn-float-right"' 
            entry += 'data-original-title="Edit Task"><i class="fas fa-edit"></i></button>'
        }
        
        entry += '</td></tr>';
            

        tbody.append(entry);
        
    });
}

/**
 * Run the search query from the pending query
 */
async function RunSearchUpdate() {
    if (requestsPending) {
        requestsPending = false;
        await GetUserQuery(pendingQueries)
    }
}

/**
 * Add a pending search
 */
function MakeSearchQuery() {
    query = $('#searsch_user_1').val()
    pendingQueries = query
    requestsPending = true
}

/**
 * Initialize page with empty query
 */
 function initialize() {
    requestsPending = true
    pendingQueries = ""
    intializeModal()
}

async function loop() {
    await RunSearchUpdate();
    setTimeout( loop, 500 );
}




$('#newSheetCreateModal .next-btn').on('click', createNewSheet)

$(window).on('click', function(event) {
    if ($(event.target).attr('id') == "newSheetCreateModal") {
        $("#newSheetCreateModal").removeClass("view");  
        $("#newSheetCreateModal").addClass('raise')
    }
})

initialize()
loop() 