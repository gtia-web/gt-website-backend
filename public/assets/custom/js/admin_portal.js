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
        entry = '<tr id="' + e._id + '"><td><p class="title">' + e.FirstName + ' ' + e.LastName + '</p></td>' +
            '<td><p class="title">' + e.Username + '</p></td>' +
            '<td><p class="title">' + e.Email + '</p></td>' +
            '<td class="text-right"><button type="button" rel="tooltip" title="" class="btn btn-link  btn-edit-user" data-original-title="Edit Task">' +
            '<i class="fas fa-user-edit"></i></button>' +
            '<button type="button" rel="tooltip" title="" class="btn btn-link btn-delete-user" data-original-title="Delete Task">' +
            '<i class="fas fa-trash-alt"></i></button></td></tr>';
        tbody.append(entry);

        $('#' + e._id + ' .btn-edit-user').click(EditUser)
        
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
var modal = $("#editUserModal");

async function EditUser() {
    id = $(this).closest('tr').attr('id')
    var data = await Promise.resolve($.post('/user/data', {
        id: id
    })) 

    console.log(data)
    modal = $("#editUserModal");
    modal.find('input[name ="email"]').val(data.Email)
    modal.find('input[name ="username"]').val(data.Username)
    modal.find('input[name ="firstname"]').val(data.FirstName)
    modal.find('input[name ="middlename"]').val(data.MiddleName)
    modal.find('input[name ="lastname"]').val(data.LastName)

    modal.find('input[name ="committee"]').val("") //Add Subcommittee to model
    modal.find('input[name ="subcommittee"]').val("") //Add Subcommittee to model
    modal.find('input[name ="workpoints"]').val(data.Points.WorkPoints)
    modal.find('input[name ="socialpoints"]').val(data.Points.SocialPoints)

    modal.find('input[name ="isactive"]').prop( "checked",  data.MembershipStatus == 'active');
    modal.find('input[name ="isadmin"]').prop( "checked", data.SpecialPermissions.includes('admin') );
    modal.find('input[name ="isvp"]').prop( "checked", data.VPStatus.isVP );
    modal.find('input[name ="ispresident"]').prop( "checked", false ); //Add to model

    $(modal).addClass("view");
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if ($(event.target).attr('id') == "editUserModal") {
        $("#editUserModal").removeClass("view");
    }
}