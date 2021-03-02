var days_of_week = {
    0: ['Sunday', 'Sun'], 1: ['Monday', 'Mon'], 2: ['Tuesday', 'Tue'], 
    3: ['Wednesday', 'Wed'], 4: ['Thursday', 'Thur'], 5: ['Friday', 'Fri'], 6: ['Saturday', 'Sat']
}

var months = {
    0: 'January', 1: 'February', 2: 'March', 3: 'April', 4: 'May', 5: 'June', 6: 'July', 7: 'August',
    8: 'September', 9: 'October', 10: 'November', 11: 'December'
}

var current_month_year = [-1, -1]

function initializeDays(month, year) {
    current_month_year = [month, year]
    $(".day-container").html("");

    var d = new Date(year, month, 1);
    first_day = d.getDay()
    days_in_month = month == 11 ? 31 : new Date(year, month + 1, 0).getDate();
    days_shown = (first_day + days_in_month + 1) + (70 - first_day - days_in_month - 1) % 7;
    
    for (i=0; i < days_shown; i++) {
        dayClasses = 'calendar-day '
        if (i >= first_day + days_in_month || i < first_day) {
            dayClasses += "inactive"
        }

        dayNumberClasses = "day-number "
        if ((new Date(year, month, i - first_day + 1)).toDateString() == (new Date(Date.now())).toDateString()){
            dayNumberClasses += "current"
        }


        date = new Date(year, month, i - first_day + 1)
        dateText = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0')

        let str = ""            
        str += "<div class='" + dayClasses + "' id='" + dateText + "'>"
        str += "<div class='calendar-day-number'><div class='" + dayNumberClasses + "'>" + date.getDate() +"</div></div>"        
        str += "<div class='calendar-day-content'></div>"
        
        if (i < first_day + days_in_month && i >= first_day) {
            str += "<div class='add-event-icon' onclick='selectDate(this)'><i class='fas fa-plus'></i></div>"
        }
        str += "</div>"

        $('.day-container').append(str)

    }   

    $('.day-container').find('.calendar-day').each((i, e) => {
        if (i % 7 == 6) $(e).addClass('left-border');
    })

    $('#calender-header-month').html(months[month])
    $('#calender-header-year').html(year)
}

function selectDate(e) {

    date = $(e).closest('.calendar-day').attr('id')
    modal = $('#newEventCreateModal')
    modal.addClass('view')
    
    modal.find("input[name='date']").val(date)
    
}

function createEventButton() {
    modal = $('#newEventCreateModal')
}

function intializeHeader() {
    for (i=0; i < 7; i++) {
        $('.weekday-header-container').append("<div class='weekday-header'>" + days_of_week[i][1] + "</div>")
    }

    $('#next-month-button').on('click', () => {
        if (current_month_year[0] < 11) initializeDays(current_month_year[0] + 1, current_month_year[1]) 
        else initializeDays(0, current_month_year[1] + 1) 

        now = new Date(Date.now())
        if (current_month_year[0] == now.getMonth() && current_month_year[1] == now.getFullYear()) {
            $('#today-button').addClass('active')
        } else {
            $('#today-button').removeClass('active')
        }
    })

    $('#previous-month-button').on('click', () => {
        if (current_month_year[0] > 0) initializeDays(current_month_year[0] - 1, current_month_year[1]) 
        else initializeDays(11, current_month_year[1] - 1) 

        now = new Date(Date.now())
        if (current_month_year[0] == now.getMonth() && current_month_year[1] == now.getFullYear()) {
            $('#today-button').addClass('active')
        } else {
            $('#today-button').removeClass('active')
        }
    })

    $('#today-button').on('click', () => {
        now = new Date(Date.now())
        initializeDays(now.getMonth(), now.getFullYear()) 
        $('#today-button').addClass('active')
    })
}

function initialize() {
    intializeHeader()
    now = new Date(Date.now())
    initializeDays(now.getMonth(), now.getFullYear()) 

    if (current_month_year[0] == now.getMonth() && current_month_year[1] == now.getFullYear()) {
        $('#today-button').addClass('active')
    } else {
        $('#today-button').removeClass('active')
    }
}


$(window).on('click', function(event) {
    if ($(event.target).attr('id') == "newEventCreateModal") {
        $("#newEventCreateModal").removeClass("view");  
        $("#newEventCreateModal").addClass('raise')
    }
})


initialize()
