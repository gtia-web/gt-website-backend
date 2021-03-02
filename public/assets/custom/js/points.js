var requestsPending = false;
var pendingQueries = "";
var showPointType = "work";
var currentID = ''

async function GetReceipts(query) {
    var data = await Promise.resolve($.post('/points/receipts/recipient', {
        query: query,
        type: showPointType
    })) 

    data.sort((a, b) => (new Date(a.SubmissionDate) < new Date(b.SubmissionDate)) ? 1 : -1)
    
    tbody = $('#points-list-body-1')
    tbody.empty()

    data.forEach(e => {
        date = new Date(e.SubmissionDate)       

        entry = '<tr><td class="table-width-bound">' +  (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + '</td>'
        entry += '<td class="table-width-bound">' + e.Type + '</td>'
        entry += '<td class="table-width-bound">' + e.RequestDetails.Description + '</td>'
        entry += '<td class="table-width-bound">' + (e.PointsChange > 0? "+" : "") + e.PointsChange + '</td>'
        entry += '<td class="table-width-bound">' + e.Status +'</td>'
        entry += '<td class="text-right table-width-bound"> <i class="fas fa-external-link-alt"></i></td></tr>'

        tbody.append(entry);
        
    });
}

async function RunSearchUpdate() {
    if (requestsPending) {
        requestsPending = false;
        await GetReceipts(pendingQueries)
    }
}

/**
 * Add a pending search
 */
function MakeSearchQuery() {
    query = $('#search_receipt_1').val()
    pendingQueries = query
    requestsPending = true
}

/**
 * Initialize page with empty query
 */
function initialize() {
    requestsPending = true
    pendingQueries = ""
}

/**
 * Get List of work points
 */
function ViewWorkPoints() {
    showPointType = 'work'
    MakeSearchQuery();
}

/**
 * Get List of social points
 */
function ViewSocialPoints() {
    showPointType = 'social';
    MakeSearchQuery();
}

function resizeTable() {
    var tbody = $("#workPointsTableBody td");
    $("#workPointsTableHead th").each(function(i,v) {
        $(v).width(tbody.eq(i).width());
    });
}

async function newPointRequest(){
    modal = $("#newPointsModal")

    var data = await Promise.resolve($.post('/points/approver/list', {}))
    approverSelect = modal.find('select[name ="approver"].chosen-select')
    
    approverSelect.empty()
    approverSelect.append('<option value=""></option>')

    data.forEach(e => {
        displayname = e.FirstName + ' ' + e.LastName
        if (e.VPStatus.isVP) displayname += ' (' + e.Committee + ' VP)'
        else if (e.VPStatus.isPresident) displayname += ' (President)'

        option = '<option value="' + e._id + '">' + displayname + '</option>'
        
        approverSelect.append(option)        
    });

    approverSelect.trigger("chosen:updated");
    modal.find('select[name ="pointstype"]').val(showPointType)
    modal.find('textarea[name ="description"]').val('')
    modal.find('input[name ="date"]').val('')
    modal.find('input[name ="points"]').val('')
    
    modal.addClass("view");
}

async function createNewPointsRequest() {
    modal = $("#newPointsModal")

    //Validation
    invalid = false
    
    descrip = modal.find('textarea[name ="description"]').val()
    modal.find('textarea[name ="description"]').removeClass('input-error-highlight')
    if(descrip == '') {
        invalid = true
        modal.find('textarea[name ="description"]').addClass('input-error-highlight')
    }

    
    date = modal.find('input[name ="date"]').val()
    modal.find('input[name ="date"]').removeClass('input-error-highlight')
    if (date == '') {
        invalid = true
        modal.find('input[name ="date"]').addClass('input-error-highlight')
    }


    approver = modal.find("select[name ='approver'].chosen-select").chosen().val()
    modal.find("select[name ='approver'].chosen-select").next().removeClass('error-highlight')
    if (approver == '') {
        invalid = true
        modal.find("select[name ='approver'].chosen-select").next().addClass('error-highlight')
    }

    
    pointType = modal.find('select[name ="pointstype"]').val()
    modal.find('select[name ="pointstype"]').removeClass('input-error-highlight')
    if (pointType == '') {
        invalid = true
        modal.find('select[name ="pointstype"]').addClass('input-error-highlight')
    }
    

    points = modal.find('input[name ="points"]').val()
    modal.find('input[name ="points"]').removeClass('input-error-highlight')
    if (points == '' || isNaN(points)) {
        invalid = true
        modal.find('input[name ="points"]').addClass('input-error-highlight')
        points = parseInt(points)
    }
    
    
    if (!invalid){
        data = {
            description: descrip,
            date: date,
            points: points,
            approver: approver,
            pointType: pointType
        }

        await Promise.resolve($.post('/points/request', {
           data: data
        })) 

        MakeSearchQuery();
        modal.removeClass("view");
    }

    
}

async function loop() {
    await RunSearchUpdate();
    resizeTable()
    setTimeout( loop, 500 );
}

$(window).on('click', function(event) {
    if ($(event.target).attr('id') == "newPointsModal") {
        $("#newPointsModal").removeClass("view");  
    }
})


initialize()
loop()
