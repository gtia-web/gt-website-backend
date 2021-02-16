var currentlyAvailable = new Map()
var requestsPending = false;
var pendingQueries = "";
var showPendingAccounts = false;
var currentID = ''

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
            '<td><p class="title">' + e.Email + '</p></td>'

        if (showPendingAccounts) {
            entry += '<td class="text-right"><button type="button" rel="tooltip" title="" class="btn btn-link  btn-accept-user" data-original-title="Accept Task">' +
                '<i class="far fa-check-circle"></i></button>'
        } else {
            entry += '<td class="text-right"><button type="button" rel="tooltip" title="" class="btn btn-link  btn-edit-user" data-original-title="Edit Task">' +
                '<i class="fas fa-user-edit"></i></button>'
        }
            
        entry += '<button type="button" rel="tooltip" title="" class="btn btn-link btn-delete-user" data-original-title="Delete Task">' +
            '<i class="fas fa-trash-alt"></i></button></td></tr>';

        tbody.append(entry);

        if (showPendingAccounts) {
            $('#' + e._id + ' .btn-accept-user').on('click', AcceptUser)
        } else {
            $('#' + e._id + ' .btn-edit-user').on('click', EditUser)
        }

        $('#' + e._id + ' .btn-delete-user').on('click', DeleteUser)
        
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


async function EditUser() {
    currentID = $(this).closest('tr').attr('id')
    var data = await Promise.resolve($.post('/user/data', {
        id: currentID
    })) 

    modal = $("#editUserModal");
    modal.find('input[name ="email"]').val(data.Email)
    modal.find('input[name ="username"]').val(data.Username)
    modal.find('input[name ="firstname"]').val(data.FirstName)
    modal.find('input[name ="middlename"]').val(data.MiddleName)
    modal.find('input[name ="lastname"]').val(data.LastName)

    modal.find('select[name ="committee"]').find("option").attr("selected", false);

    switch(data.Committee) {
        case 'Internal':
            modal.find('select[name ="committee"]').find('option[name ="Internal"]').attr('selected','selected');
            break;
        case 'External':
            modal.find('select[name ="committee"]').find('option[name ="External"]').attr('selected','selected');
            break;
        case 'Outreach':
            modal.find('select[name ="committee"]').find('option[name ="Outreach"]').attr('selected','selected');
            break;
        case 'Finance':
            modal.find('select[name ="committee"]').find('option[name ="Finance"]').attr('selected','selected');
            break;
        case 'Marketing':
            modal.find('select[name ="committee"]').find('option[name ="Marketing"]').attr('selected','selected');
            break;
        case 'Executive':
            modal.find('select[name ="committee"]').find('option[name ="Executive"]').attr('selected','selected');
            break;
    }

    modal.find('input[name ="subcommittee"]').val(data.Subcommittee) 
    modal.find('input[name ="workpoints"]').val(data.Points.WorkPoints)
    modal.find('input[name ="socialpoints"]').val(data.Points.SocialPoints)

    modal.find('input[name ="isactive"]').prop( "checked",  data.MembershipStatus == 'active');
    modal.find('input[name ="isadmin"]').prop( "checked", data.SpecialPermissions.includes('admin') );
    modal.find('input[name ="isvp"]').prop( "checked", data.VPStatus.isVP );
    modal.find('input[name ="ispresident"]').prop( "checked", false ); //Add to model
      

    modal.addClass("view");

    modal.find('.card-footer .confirm-edit-btn').off('click')
    modal.find('.card-footer .confirm-edit-btn').on('click', async function(){
        modal = $("#editUserModal");
        data = {
            committee: modal.find('select[name ="committee"]').val(),
            subcommittee: modal.find('input[name ="subcommittee"]').val(),
            workpoints: modal.find('input[name ="workpoints"]').val(),
            socialpoints: modal.find('input[name ="socialpoints"]').val(),
            isactive: modal.find('input[name ="isactive"]').is(":checked"),
            isadmin: modal.find('input[name ="isadmin"]').is(":checked"),
            isvp: modal.find('input[name ="isvp"]').is(":checked"),
            ispresident: modal.find('input[name ="ispresident"]').is(":checked"),
            id: currentID
        }
        
        await Promise.resolve($.post('/user/update', {
            data: data
        })) 

        MakeSearchQuery();
        $("#editUserModal").removeClass("view");
    })
}

async function AcceptUser() {
    currentID = $(this).closest('tr').attr('id')
    var data = await Promise.resolve($.post('/user/data', {
        id: currentID
    })) 

    modal = $("#initializeUserModal");
    modal.find('input[name ="email"]').val(data.Email)
    modal.find('input[name ="username"]').val(data.Username)
    modal.find('input[name ="firstname"]').val(data.FirstName)
    modal.find('input[name ="middlename"]').val(data.MiddleName)
    modal.find('input[name ="lastname"]').val(data.LastName)

    modal.find('input[name ="workpoints"]').val(data.Points.WorkPoints)
    modal.find('input[name ="socialpoints"]').val(data.Points.SocialPoints)

    modal.find('input[name ="isactive"]').prop( "checked",  data.MembershipStatus == 'active');
    modal.find('input[name ="isadmin"]').prop( "checked", data.SpecialPermissions.includes('admin') );
    modal.find('input[name ="isvp"]').prop( "checked", data.VPStatus.isVP );
    modal.find('input[name ="ispresident"]').prop( "checked", false ); //Add to model

    modal.addClass("view");

    modal.find('.card-footer .accept-profile-btn').on('click', async function(){
        modal = $("#initializeUserModal");
        data = {
            committee: modal.find('select[name ="committee"]').val(),
            subcommittee: modal.find('input[name ="subcommittee"]').val(),
            isactive: modal.find('input[name ="isactive"]').is(":checked"),
            isadmin: modal.find('input[name ="isadmin"]').is(":checked"),
            isvp: modal.find('input[name ="isvp"]').is(":checked"),
            ispresident: modal.find('input[name ="ispresident"]').is(":checked"),
            id: currentID
        }
        
        await Promise.resolve($.post('/user/activate', {
            data: data
        }))
        
        $("#initializeUserModal").removeClass("view");
        MakeSearchQuery();     

    })
}

async function DeleteUser() {
    currentID = $(this).closest('tr').attr('id')
    var data = await Promise.resolve($.post('/user/data', {
        id: currentID
    })) 

    $('#deleteUserFullname').html(data.FirstName + ' ' + data.LastName);

    modal = $("#confirmDeleteModal");
    modal.addClass("view");

    modal.find('.card-footer .confirm-delete-btn').off('click')
    modal.find('.card-footer .confirm-delete-btn').on('click', async function(){
        
        await Promise.resolve($.post('/user/deleteByID', {
            id: currentID
        })) 

        MakeSearchQuery();
        $("#confirmDeleteModal").removeClass("view");
    })
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if ($(event.target).attr('id') == "editUserModal") {
        $("#editUserModal").removeClass("view");  
    } else if ($(event.target).attr('id') == "initializeUserModal") {
        $("#initializeUserModal").removeClass("view");
    } else if ($(event.target).attr('id') == "confirmDeleteModal") {
        $('#confirmDeleteModal').removeClass("view");
    }
}