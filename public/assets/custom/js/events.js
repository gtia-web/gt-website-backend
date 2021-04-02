var currentSection = 1
var maxSections = 2

function gotoSection(num) {
    if (num <= maxSections && num >= 1){
        for (i = 1; i <=  maxSections; i++) {
            $('#modalsection-' + i).addClass('inactive')
        }        
        
        $('#modalsection-' + num).removeClass('inactive')
        currentSection = num       
        $('#newEventCreateModal').find('.card-header .title').html('Create Event (' + $('#modalsection-' + num).data('section-title') + ')')
    }
    updateButtons()  
}

function gotoNextSection() {
    gotoSection(currentSection + 1)  
}

function gotoLastSection() {
    gotoSection(currentSection - 1) 
}

async function createNewEvent() {
    
    modal = $('#newEventCreateModal')

    //Validation
    invalid = false
    invalidPages = null

    eventname = modal.find('input[name ="event-name"]').val()
    modal.find('input[name ="event-name"]').removeClass('input-error-highlight')
    if(eventname == '') {
        invalid = true
        modal.find('input[name ="event-name"]').addClass('input-error-highlight')
        if (invalidPages == null) invalidPages = 1;
    }

    eventlocation = modal.find('input[name="eventlocation"]').val()
    modal.find('input[name ="eventlocation"]').removeClass('input-error-highlight')
    if(eventlocation == '') {
        invalid = true
        modal.find('input[name ="eventlocation"]').addClass('input-error-highlight')
        if (invalidPages == null) invalidPages = 1;
    }

    description = modal.find('textarea[name ="description"]').val()  
    modal.find('textarea[name ="description"]').removeClass('input-error-highlight')
    if(description == '') {
        invalid = true
        modal.find('textarea[name ="description"]').addClass('input-error-highlight')
        if (invalidPages == null) invalidPages = 1;
    }

    eventtype = modal.find('select[name ="event-type"]').val()
    modal.find('select[name ="event-type"]').removeClass('input-error-highlight')
    if(eventtype == '' || eventtype == null) {
        invalid = true
        modal.find('select[name ="event-type"]').addClass('input-error-highlight')
        if (invalidPages == null) invalidPages = 1;
    }

    date = modal.find('input[name ="date"]').val().split('-')
    modal.find('input[name ="date"]').removeClass('input-error-highlight')
    if(modal.find('input[name ="date"]').val() == '') {
        invalid = true
        modal.find('input[name ="date"]').addClass('input-error-highlight')
        if (invalidPages == null) invalidPages = 1;
    }

    starttime = modal.find('input[name ="starttime"]').val().split(':')
    modal.find('input[name ="starttime"]').removeClass('input-error-highlight')
    if(modal.find('input[name ="starttime"]').val() == '') {
        invalid = true
        modal.find('input[name ="starttime"]').addClass('input-error-highlight')
        if (invalidPages == null) invalidPages = 1;
    }

    endtime = modal.find('input[name ="endtime"]').val().split(':')
    modal.find('input[name ="endtime"]').removeClass('input-error-highlight')
    if(modal.find('input[name ="endtime"]').val() == '') {
        invalid = true
        modal.find('input[name ="endtime"]').addClass('input-error-highlight')
        if (invalidPages == null) invalidPages = 1;
    }
   
    notif_description = modal.find('textarea[name ="notification-note"]').val()
    notif_time_line = modal.find("select.chosen-select[name='notification-timeline']").chosen().val()
    var index = notif_time_line.indexOf("");
    if (index > -1) {
        notif_time_line.splice(index, 1);
    }

    if (!invalid){

        startDate = new Date(parseInt(date[0]), parseInt(date[1])-1, parseInt(date[2]), parseInt(starttime[0]), parseInt(starttime[1]), 0);
        endDate = new Date(parseInt(date[0]), parseInt(date[1])-1, parseInt(date[2]), parseInt(endtime[0]), parseInt(endtime[1]), 0);

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

        initialize() 

        $("#newEventCreateModal").removeClass("view");  
        $("#newEventCreateModal").addClass('raise') 

         
    
    } else {
        gotoSection(invalidPages)
    }
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

    events.sort((a, b) => {
        return (new Date(b.StartTime)).getTime() - (new Date(a.StartTime)).getTime()
    })

    tbody = $('#event-list')
    tbody.empty()
    for (i = 0; i < events.length; i++) {
        let startDate = new Date(events[i].StartTime)
        new_entry = '<tr><td><div class="events-box">' +
            '<p class="title">' + events[i].EventName + '</p>' +
            '<p class="text-muted">' + (startDate.getMonth() + 1) + '/' + startDate.getDate() +'/' + (startDate.getFullYear()-2000) + ', ' + 
            formatAMPM(startDate) + ', ' + events[i].Location + '</p>' +
            '</div></td><td class="td-actions text-right">' +
            '<button type="button" rel="tooltip" title="" class="btn btn-link" data-original-title="Edit Task">' +
            '<i class="fas fa-edit"></i></button></td></tr>'

        tbody.append(new_entry)       
    }

    initializeDays(current_month_year[0], current_month_year[1]) 
}

async function initialize() {
    gotoSection(1)
    modal = $('#newEventCreateModal')

    updateButtons()
    modal.find('.back-btn').off('click')
    modal.find('.back-btn').on('click', gotoLastSection)    
    updateEventList()  

    eventname = modal.find('input[name ="event-name"]').val("")
    modal.find('input[name ="event-name"]').removeClass('input-error-highlight')

    eventlocation = modal.find('input[name="eventlocation"]').val("")
    modal.find('input[name="eventlocation"]').removeClass('input-error-highlight')

    description = modal.find('textarea[name ="description"]').val("")
    modal.find('textarea[name ="description"]').removeClass('input-error-highlight')

    eventtype = modal.find('select[name ="event-type"]').val("")
    modal.find('select[name ="event-type"]').removeClass('input-error-highlight')

    date = modal.find('input[name ="date"]').val("")
    modal.find('input[name ="date"]').removeClass('input-error-highlight')

    starttime = modal.find('input[name ="starttime"]').val("")
    modal.find('input[name ="starttime"]').removeClass('input-error-highlight')

    endtime = modal.find('input[name ="endtime"]').val("")   
    modal.find('input[name ="endtime"]').removeClass('input-error-highlight')

    notif_description = modal.find('textarea[name ="notification-note"]').val("")
    modal.find('textarea[name ="notification-note"]').removeClass('input-error-highlight')

    notif_time_line = modal.find("select.chosen-select[name='notification-timeline']").val("").trigger('chosen:updated');
    modal.find("select.chosen-select[name='notification-timeline']").removeClass('input-error-highlight')
}

function openCreateEventSheetModal(){
    initialize()
    $('#newEventCreateModal').addClass('view')
    
}


$(window).on('click', function(event) {
    if ($(event.target).attr('id') == "newEventCreateModal") {
        $("#newEventCreateModal").removeClass("view");  
        $("#newEventCreateModal").addClass('raise')
    }
})

initialize()


