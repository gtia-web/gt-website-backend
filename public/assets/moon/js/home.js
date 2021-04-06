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

async function UpdateUpcomingEvents() {
    let data = await Promise.resolve($.get('/events/myevents'))
    let events = data.events
    let now = new Date()
    let two_weeks = new Date()

    let table = $('#upcoming-event-table')
    table.empty()

    let count = 0

    two_weeks.setDate(two_weeks.getDate() + 14)
    for (let i=0; i<events.length; i++) {
        startDate = new Date(events[i].StartTime)
        if (startDate.getTime() <= two_weeks.getTime() && startDate.getTime() >= now.getTime()) {
            count += 1

            new_entry = '<tr><td><div class="events-box">' +
            '<p class="title">' +events[i].EventName + '</p>' +
            '<p class="text-muted">' + (startDate.getMonth() + 1) + '/' + startDate.getDate() +'/' + (startDate.getFullYear()-2000) + ', ' + 
            formatAMPM(startDate) + ', ' + events[i].Location + '</p>' +
            '</div></td><td class="td-actions text-right">' +
            '<button type="button" rel="tooltip" class="btn btn-link" data-original-title="Edit Task">' +
            '<i class=" fas fas fa-external-link-square-alt"></i></button></td></tr>'

            table.append(new_entry)
        }
        
    }

    if (count == 0) {
        new_entry = '<tr><td><div class="events-box no-events">' +
            '<p class="title"> No events in the next 2 weeks! </p> </div></td></tr>'
        table.append(new_entry)
    }


}

UpdateUpcomingEvents() 