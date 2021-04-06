async function initializeProfile() {
    var data = await Promise.resolve($.post('/user/data/self', {})) 

    console.log(data)

    modal = $("#editUser");
    modal.find('input[name ="email"]').val(data.Email)
    modal.find('input[name ="username"]').val(data.Username)
    modal.find('input[name ="firstname"]').val(data.FirstName)
    modal.find('input[name ="lastname"]').val(data.LastName)

    modal.find('select[name ="committee"]').find("option").attr("selected", false);
    modal.find('select[name ="committee"]').val(data.Committee);

    modal.find('input[name ="subcommittee"]').val(data.Subcommittee) 
    modal.find('input[name ="workpoints"]').val(data.Points.WorkPoints)
    modal.find('input[name ="socialpoints"]').val(data.Points.SocialPoints)

    modal.find('select[name ="specialpositions"]').find("option").attr("selected", false);
    if (data.VPStatus.isPresident) {
        modal.find('select[name ="specialpositions"]').val('pres')
    } else if (data.VPStatus.isVP) {
        modal.find('select[name ="specialpositions"]').val('vp')
    } else {
        modal.find('select[name ="specialpositions"]').val('none')
    }

    modal.find('select[name ="membershipstatus"]').find("option").attr("selected", false);
    modal.find('select[name ="membershipstatus"]').val(data.MembershipStatus)

    modal.find(".chosen-select").val(data.SpecialPermissions).trigger('chosen:updated')
}

function initializeProfileChange() {
    $('#avatar-change-img-upload').on('change', function () {
        let photo = $('#avatar-change-img-upload').val()
        console.log(photo)

        $('#img-change-form').submit()
    })
}

initializeProfileChange() 
initializeProfile()