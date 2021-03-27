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
}

function gotoLastSection() {
    if (currentSection > 1) {
        $('#modalsection-' + currentSection).addClass('inactive')
        $('#modalsection-' + (currentSection - 1)).removeClass('inactive')
        currentSection -= 1
        $('#newEventCreateModal').find('.card-header .title').html('Create Event (' + $('#modalsection-' + (currentSection)).data('section-title') + ')')
    }    

    updateButtons()    
}

async function createNewEvent() {
    modal = $('#newEventCreateModal')
    eventname = modal.find('input[name ="event-name"]').val()
    eventlocation = modal.find('input[name="eventlocation"]').val()
    description = modal.find('textarea[name ="description"]').val()    
    eventtype = modal.find('select[name ="event-type"]').val()

    date = modal.find('input[name ="date"]').val().split('-')
    starttime = modal.find('input[name ="starttime"]').val().split(':')
    endtime = modal.find('input[name ="endtime"]').val().split(':')

    startDate = new Date(parseInt(date[0]), parseInt(date[1])-1, parseInt(date[2]), parseInt(starttime[0]), parseInt(starttime[1]), 0);
    endDate = new Date(parseInt(date[0]), parseInt(date[1])-1, parseInt(date[2]), parseInt(endtime[0]), parseInt(endtime[1]), 0);


    
    notif_description = modal.find('textarea[name ="description"]').val()
    notif_time_line = modal.find("select.chosen-select[name='notification-timeline']").chosen().val()
    var index = notif_time_line.indexOf("");
    if (index > -1) {
        notif_time_line.splice(index, 1);
    }


    data = {
        eventname:  eventname,
        eventlocation: eventlocation,
        description: description,    
        eventtype: eventtype,
        startDate: startDate,
        endDate: endDate,
        notif_description: notif_description,
        notif_time_line: notif_time_line

    }

    await Promise.resolve($.post('/events/create', {
        data: data
    })) 

    //console.log([eventname, eventlocation, description, startDate, endDate, eventtype])
    //console.log([notif_description, notif_time_line])

    $("#newEventCreateModal").removeClass("view");  
    $("#newEventCreateModal").addClass('raise')
    updateEventList()
    
    //modal.find('select[name ="pointstype"]').val(showPointType)
}

function updateButtons() {
    if (currentSection == 1) {
        $('#newEventCreateModal').find('.back-btn').addClass('hidden')
    } else {
        $('#newEventCreateModal').find('.back-btn').removeClass('hidden')
    }
    
    $('#newEventCreateModal').find('.next-btn').off('click')
    if (currentSection == maxSections) {        
        $('#newEventCreateModal').find('.next-btn').html("Create")
        $('#newEventCreateModal').find('.next-btn').on('click', createNewEvent)
        
    } else {
        $('#newEventCreateModal').find('.next-btn').html("Next")
        $('#newEventCreateModal').find('.next-btn').on('click', gotoNextSection)        
    }

    /*if (currentSection == 3) {
        $("#newEventCreateModal").find(".modal-toolbar").removeClass("hidden")
    } else {
        $("#newEventCreateModal").find(".modal-toolbar").addClass("hidden")
    }*/
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

async function updateEventList() {
    data = await Promise.resolve($.get('/events/myevents'))
    events = data.events
    console.log(data)
    console.log(events)

    tbody = $('#event-list')
    tbody.empty()
    for (i = 0; i < events.length; i++) {
        startDate = new Date(events[i].StartTime)
        new_entry = '<tr><td><div class="events-box">' +
            '<p class="title">' +events[i].EventName + '</p>' +
            '<p class="text-muted">' + (startDate.getMonth() + 1) + '/' + startDate.getDate() +'/' + (startDate.getFullYear()-2000) + ', ' + 
            formatAMPM(startDate) + ', ' + events[i].Location + '</p>' +
            '</div></td><td class="td-actions text-right">' +
            '<button type="button" rel="tooltip" title="" class="btn btn-link" data-original-title="Edit Task">' +
            '<i class="fas fa-edit"></i></button></td></tr>'

        tbody.append(new_entry)        
    }
}





async function initialize() {
    updateButtons()
    $('#newEventCreateModal').find('.back-btn').on('click', gotoLastSection)    
    updateEventList()   
}




$(window).on('click', function(event) {
    if ($(event.target).attr('id') == "newEventCreateModal") {
        $("#newEventCreateModal").removeClass("view");  
        $("#newEventCreateModal").addClass('raise')
    }
})

initialize()


