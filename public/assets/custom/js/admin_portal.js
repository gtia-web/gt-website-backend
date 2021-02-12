var currentlyAvailable = new Map()
var requestsPending = false;
var pendingQueries = "";
var showPendingAccounts = false;

async function GetUserQuery(query) {
    var data = await Promise.resolve($.post('/user/list', {
        query: query,
        pending: showPendingAccounts
    })) 
    
    tbody = $('#user-list-body-1')
    tbody.empty()

    data.forEach(e => {
        entry = '<tr><td><p class="title">' + e.FirstName + ' ' + e.LastName + '</p></td>' +
            '<td><p class="title">' + e.Username + '</p></td>' +
            '<td><p class="title">' + e.Email + '</p></td>' +
            '<td class="text-right"><button type="button" rel="tooltip" title="" class="btn btn-link" data-original-title="Edit Task">' +
            '<i class="tim-icons icon-pencil"></i></button></td></tr>';
        tbody.append(entry);
    });
}

async function RunSearchUpdate() {
    if (requestsPending) {
        requestsPending = false;
        await GetUserQuery(pendingQueries)
    }

    setTimeout( RunSearchUpdate, 500 );
}

function MakeSearchQuery() {
    query = $('#searsch_user_1').val()
    pendingQueries = query
    requestsPending = true
}

function initialize() {
    requestsPending = true
    pendingQueries = ""

    RunSearchUpdate();
}

function ViewPendingAccounts() {
    showPendingAccounts = true
    MakeSearchQuery();
}

function ViewActiveAccounts() {
    showPendingAccounts = false;
    MakeSearchQuery();
    
    
}

initialize();


// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}