var currentSection = 1
var maxSections = 2
var numQuestion = 1
var currQuestion

function gotoNextSection() {
    if (currentSection < maxSections){
        $('#modalsection-' + currentSection).addClass('inactive')
        $('#modalsection-' + (currentSection + 1)).removeClass('inactive')
        currentSection += 1       
        $('#newEventCreateModal').find('.card-header .title').html('Create Event (' + $('#modalsection-' + (currentSection)).data('section-title') + ')')
    }

    updateButtons()

    /*if (currentSection == 3) {
        $("#newEventCreateModal").find(".modal-toolbar").removeClass("hidden")
    } else {
        $("#newEventCreateModal").find(".modal-toolbar").addClass("hidden")
    }*/
}

function gotoLastSection() {
    if (currentSection > 1) {
        $('#modalsection-' + currentSection).addClass('inactive')
        $('#modalsection-' + (currentSection - 1)).removeClass('inactive')
        currentSection -= 1
        $('#newEventCreateModal').find('.card-header .title').html('Create Event (' + $('#modalsection-' + (currentSection)).data('section-title') + ')')
    }    

    updateButtons()

    /*if (currentSection == 3) {
        $("#newEventCreateModal").find(".modal-toolbar").removeClass("hidden")
    } else {
        $("#newEventCreateModal").find(".modal-toolbar").addClass("hidden")
    }*/

    
}

function updateButtons() {
    if (currentSection == 1) {
        $('#newEventCreateModal').find('.back-btn').addClass('hidden')
    } else {
        $('#newEventCreateModal').find('.back-btn').removeClass('hidden')
    }
    
    if (currentSection == maxSections) {
        $('#newEventCreateModal').find('.next-btn').html("Create")
    } else {
        $('#newEventCreateModal').find('.next-btn').html("Next")
    }
}

