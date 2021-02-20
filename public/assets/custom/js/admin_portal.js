var currentlyAvailable = new Map()
var requestsPending = false;
var pendingQueries = "";
var showPendingAccounts = false;
var currentID = ''

/**
 * 
 * @param {string} query 
 * Get all accounts with user name or name containing query and add them to User list table.
 */
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
}

/**
 * Get List of pending accounts
 */
function ViewPendingAccounts() {
    showPendingAccounts = true
    MakeSearchQuery();
}

/**
 * Get List of active accounts
 */
function ViewActiveAccounts() {
    showPendingAccounts = false;
    MakeSearchQuery();
}

/**
 * Add Edit user button functionality
 * Fill data into Modal
 * Add on Click listener to button
 */
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
    modal.find('select[name ="committee"]').find('option[name ="' + data.Committee + '"]').attr('selected','selected');

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

/**
 * Add Accept user button functionality
 * Fill data into Modal
 * Add on Click listener to button
 */
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

    //console.log(modal.find(".chosen-select").chosen().val())

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

/**
 * Add Delete user button functionality
 * Add on Click listener to button
 */
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
$(window).on('click', function(event) {
    if ($(event.target).attr('id') == "editUserModal") {
        $("#editUserModal").removeClass("view");  
    } else if ($(event.target).attr('id') == "initializeUserModal") {
        $("#initializeUserModal").removeClass("view");
    } else if ($(event.target).attr('id') == "confirmDeleteModal") {
        $('#confirmDeleteModal').removeClass("view");
    }
})

/**
 * Resize table so that header column are always same size as body columns
 */
function resizeTable() {
    var tbody = $("#userManagementTableBody td");
    $("#userManagementTableHead th").each(function(i,v) {
        $(v).width(tbody.eq(i).width());
    });
}

/**
 * Perform run seach update and table resize loop
 */
async function loop() {
    await RunSearchUpdate();
    resizeTable();
    setTimeout( loop, 500 );

}

/** Run Query and resize loop */
initialize();
loop();