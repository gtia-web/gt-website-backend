
function expandBox(elem) {
    hiddenArea = $(elem).closest('.unique-sheet-view-holder').find('.sheet-view-hidden-area')
    hiddenArea.toggleClass('contracting-box-collapsed')
    hiddenArea.toggleClass('make-sticky')
    $(elem).toggleClass('fa-caret-down')
    $(elem).toggleClass('fa-caret-up')
}

function selectTimeSlot(elem) {
    if (elem.classList.contains("time-slot-slot-used")) {} 
    else if (elem.classList.contains("time-slot-slot-available")) {
        elem.classList.toggle("time-slot-slot-available")
        elem.classList.toggle("time-slot-slot-selected")
    } else if (elem.classList.contains("time-slot-slot-selected")) {
        elem.classList.toggle("time-slot-slot-available")
        elem.classList.toggle("time-slot-slot-selected")

    }
}