var currentlyAvailable = new Map();
var requestsPending = false;
var pendingQueries = '';
var showApprovedAccounts = true;
var currentID = '';
var currentData;

/**
 *
 * @param {string} query
 * Get all accounts with user name or name containing query and add them to User list table.
 */
async function GetUserQuery(query) {
  var data = await Promise.resolve(
    $.post('/user/list', {
      query: query,
      approved: showApprovedAccounts,
    })
  );

  tbody = $('#user-list-body-1');
  tbody.empty();

  data.forEach((e) => {
    entry =
      '<tr id="' +
      e._id +
      '"><td><p class="title">' +
      e.FirstName +
      ' ' +
      e.LastName +
      '</p></td>' +
      '<td><p class="title">' +
      e.Username +
      '</p></td>' +
      '<td><p class="title">' +
      e.Email +
      '</p></td>';

    if (showApprovedAccounts) {
      entry +=
        '<td class="text-right"><button type="button" rel="tooltip" title="" class="btn btn-link  btn-edit-user" data-original-title="Edit Task">' +
        '<i class="fas fa-user-edit"></i></button>';
    } else {
      entry +=
        '<td class="text-right"><button type="button" rel="tooltip" title="" class="btn btn-link  btn-accept-user" data-original-title="Accept Task">' +
        '<i class="far fa-check-circle"></i></button>';
    }

    entry +=
      '<button type="button" rel="tooltip" title="" class="btn btn-link btn-delete-user" data-original-title="Delete Task">' +
      '<i class="fas fa-trash-alt"></i></button></td></tr>';

    tbody.append(entry);

    if (showApprovedAccounts) {
      $('#' + e._id + ' .btn-edit-user').on('click', EditUser);
    } else {
      $('#' + e._id + ' .btn-accept-user').on('click', AcceptUser);
    }

    $('#' + e._id + ' .btn-delete-user').on('click', DeleteUser);
  });
}

/**
 * Run the search query from the pending query
 */
async function RunSearchUpdate() {
  if (requestsPending) {
    requestsPending = false;
    await GetUserQuery(pendingQueries);
  }
}

/**
 * Add a pending search
 */
function MakeSearchQuery() {
  query = $('#searsch_user_1').val();
  pendingQueries = query;
  requestsPending = true;
}

/**
 * Initialize page with empty query
 */
function initialize() {
  requestsPending = true;
  pendingQueries = '';
}

/**
 * Get List of pending accounts
 */
function ViewPendingAccounts() {
  showApprovedAccounts = false;
  MakeSearchQuery();
}

/**
 * Get List of active accounts
 */
function ViewActiveAccounts() {
  showApprovedAccounts = true;
  MakeSearchQuery();
}

/**
 * Add Edit user button functionality
 * Fill data into Modal
 * Add on Click listener to button
 */
async function EditUser() {
  currentID = $(this).closest('tr').attr('id');
  var data = await Promise.resolve(
    $.post('/user/data', {
      id: currentID,
    })
  );
  currentData = data;

  console.log(data);

  modal = $('#editUserModal');
  modal.find('input[name ="email"]').val(data.Email);
  modal.find('input[name ="username"]').val(data.Username);
  modal.find('input[name ="firstname"]').val(data.FirstName);
  modal.find('input[name ="lastname"]').val(data.LastName);

  modal
    .find('select[name ="committee"]')
    .find('option')
    .attr('selected', false);
  modal.find('select[name ="committee"]').val(data.Committee);

  modal.find('input[name ="subcommittee"]').val(data.Subcommittee);
  modal.find('input[name ="workpoints"]').val(data.Points.WorkPoints);
  modal.find('input[name ="socialpoints"]').val(data.Points.SocialPoints);

  modal
    .find('select[name ="specialpositions"]')
    .find('option')
    .attr('selected', false);
  if (data.VPStatus.isPresident) {
    modal.find('select[name ="specialpositions"]').val('pres');
  } else if (data.VPStatus.isVP) {
    modal.find('select[name ="specialpositions"]').val('vp');
  } else {
    modal.find('select[name ="specialpositions"]').val('none');
  }

  modal
    .find('select[name ="membershipstatus"]')
    .find('option')
    .attr('selected', false);
  modal.find('select[name ="membershipstatus"]').val(data.MembershipStatus);

  modal
    .find('.chosen-select')
    .val(data.SpecialPermissions)
    .trigger('chosen:updated');

  modal.addClass('view');

  modal.find('.card-footer .confirm-edit-btn').off('click');
  modal.find('.card-footer .confirm-edit-btn').on('click', async function () {
    modal = $('#editUserModal');

    invalid = false;

    specialStatus = modal.find('select[name ="specialpositions"]').val();
    modal
      .find('select[name ="specialpositions"]')
      .removeClass('input-error-highlight');
    if (specialStatus == '') {
      invalid = true;
      modal
        .find('select[name ="specialpositions"]')
        .addClass('input-error-highlight');
    }

    workpoints = modal.find('input[name ="workpoints"]').val();
    modal
      .find('input[name ="workpoints"]')
      .removeClass('input-error-highlight');
    if (workpoints == '' || isNaN(workpoints)) {
      invalid = true;
      modal.find('input[name ="workpoints"]').addClass('input-error-highlight');
      workpoints = parseInt(workpoints);
    }

    socialpoints = modal.find('input[name ="socialpoints"]').val();
    modal
      .find('input[name ="socialpoints"]')
      .removeClass('input-error-highlight');
    if (socialpoints == '' || isNaN(socialpoints)) {
      invalid = true;
      modal
        .find('input[name ="socialpoints"]')
        .addClass('input-error-highlight');
      socialpoints = parseInt(socialpoints);
    }

    specialpermissions = modal.find('.chosen-select').chosen().val();
    var index = specialpermissions.indexOf('');
    if (index > -1) {
      specialpermissions.splice(index, 1);
    }

    committee = modal.find('select[name ="committee"]').val();
    modal
      .find('select[name ="committee"]')
      .removeClass('input-error-highlight');
    if (committee == '') {
      invalid = true;
      modal.find('select[name ="committee"]').addClass('input-error-highlight');
    }

    membershipstatus = modal.find('select[name ="membershipstatus"]').val();
    modal
      .find('select[name ="membershipstatus"]')
      .removeClass('input-error-highlight');
    if (membershipstatus == '') {
      invalid = true;
      modal
        .find('select[name ="membershipstatus"]')
        .addClass('input-error-highlight');
    }

    if (!invalid) {
      data = {
        committee: committee,
        subcommittee: modal.find('input[name ="subcommittee"]').val(),
        specialpermissions: specialpermissions,
        workpoints: workpoints,
        socialpoints: socialpoints,
        isvp: specialStatus == 'vp',
        ispresident: specialStatus == 'pres',
        id: currentID,
        membershipstatus: membershipstatus,
      };
      console.log(data);

      await Promise.resolve(
        $.post('/user/update', {
          data: data,
        })
      );
      MakeSearchQuery();
      $('#editUserModal').removeClass('view');
    }
  });
}

/**
 * Add Accept user button functionality
 * Fill data into Modal
 * Add on Click listener to button
 */
async function AcceptUser() {
  currentID = $(this).closest('tr').attr('id');
  var data = await Promise.resolve(
    $.post('/user/data', {
      id: currentID,
    })
  );

  currentData = data;

  modal = $('#initializeUserModal');
  modal.find('input[name ="email"]').val(data.Email);
  modal.find('input[name ="username"]').val(data.Username);
  modal.find('input[name ="firstname"]').val(data.FirstName);
  modal.find('input[name ="lastname"]').val(data.LastName);

  modal.find('input[name ="workpoints"]').val(data.Points.WorkPoints);
  modal.find('input[name ="socialpoints"]').val(data.Points.SocialPoints);

  modal.find('select[name ="specialpositions"]').val('none');
  modal.find('select[name ="membershipstatus"]').val('active');

  modal
    .find('input[name ="isactive"]')
    .prop('checked', data.MembershipStatus == 'active');
  modal
    .find('input[name ="isadmin"]')
    .prop('checked', data.SpecialPermissions.includes('admin'));
  modal.find('input[name ="isvp"]').prop('checked', data.VPStatus.isVP);
  modal.find('input[name ="ispresident"]').prop('checked', false); //Add to model

  modal.addClass('view');

  modal.find('.card-footer .accept-profile-btn').on('click', async function () {
    modal = $('#initializeUserModal');

    invalid = false;

    specialStatus = modal.find('select[name ="specialpositions"]').val();
    modal
      .find('select[name ="specialpositions"]')
      .removeClass('input-error-highlight');
    if (specialStatus == '') {
      invalid = true;
      modal
        .find('select[name ="specialpositions"]')
        .addClass('input-error-highlight');
    }

    specialpermissions = modal.find('.chosen-select').chosen().val();
    var index = specialpermissions.indexOf('');
    if (index > -1) {
      specialpermissions.splice(index, 1);
    }

    committee = modal.find('select[name ="committee"]').val();
    modal
      .find('select[name ="committee"]')
      .removeClass('input-error-highlight');
    if (committee == '') {
      invalid = true;
      modal.find('select[name ="committee"]').addClass('input-error-highlight');
    }

    membershipstatus = modal.find('select[name ="membershipstatus"]').val();
    modal
      .find('select[name ="membershipstatus"]')
      .removeClass('input-error-highlight');
    if (membershipstatus == '') {
      invalid = true;
      modal
        .find('select[name ="membershipstatus"]')
        .addClass('input-error-highlight');
    }

    data = {
      committee: committee,
      subcommittee: modal.find('input[name ="subcommittee"]').val(),
      specialpermissions: specialpermissions,
      isvp: specialStatus == 'vp',
      ispresident: specialStatus == 'pres',
      id: currentID,
      membershipstatus: membershipstatus,
    };

    console.log(data);

    await Promise.resolve(
      $.post('/user/activate', {
        data: data,
      })
    );

    $('#initializeUserModal').removeClass('view');
    MakeSearchQuery();
  });
}

/**
 * Add Delete user button functionality
 * Add on Click listener to button
 */
async function DeleteUser() {
  currentID = $(this).closest('tr').attr('id');
  var data = await Promise.resolve(
    $.post('/user/data', {
      id: currentID,
    })
  );

  $('#deleteUserFullname').html(data.FirstName + ' ' + data.LastName);

  modal = $('#confirmDeleteModal');
  modal.addClass('view');

  modal.find('.card-footer .confirm-delete-btn').off('click');
  modal.find('.card-footer .confirm-delete-btn').on('click', async function () {
    await Promise.resolve(
      $.post('/user/deleteByID', {
        id: currentID,
      })
    );

    MakeSearchQuery();
    $('#confirmDeleteModal').removeClass('view');
  });
}

// When the user clicks anywhere outside of the modal, close it
$(window).on('click', function (event) {
  if ($(event.target).attr('id') == 'editUserModal') {
    $('#editUserModal').removeClass('view');
  } else if ($(event.target).attr('id') == 'initializeUserModal') {
    $('#initializeUserModal').removeClass('view');
  } else if ($(event.target).attr('id') == 'confirmDeleteModal') {
    $('#confirmDeleteModal').removeClass('view');
  }
});

/**
 * Resize table so that header column are always same size as body columns
 */
function resizeTable() {
  var tbody = $('#userManagementTableBody td');
  $('#userManagementTableHead th').each(function (i, v) {
    $(v).width(tbody.eq(i).width());
  });
}

/**
 * Perform run seach update and table resize loop
 */
async function loop() {
  await RunSearchUpdate();
  resizeTable();
  setTimeout(loop, 500);
}

/** Run Query and resize loop */
initialize();
loop();
