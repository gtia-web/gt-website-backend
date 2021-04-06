optionHTML = "<div class='row answer-option-container bottom'>" +
    "<div class='col-1 answer-radio'><input type='radio' class='option-input' disabled></div>" +
    "<div class='col-11'><input type='text' placeholder='Option 1' class='answer-option'></div></div>"


textFieldHTML = "<div class='col-1'><div class='number'> <div class='vertical-center'>" +
    "<span>1.</span> </div> </div> </div><div class='col-11 text-field'><div class='row'>" +
    "<input type='text' placeholder='Question'class='question'></div><div class='row'>" +
    "<input type='text' placeholder='Enter your answer' class='answer' disabled> </div> </div>"

multipleChoiceHTML = "<div class='col-1'><div class='number'><div class='vertical-center'><span>1.</span></div>" +
    "</div></div><div class='col-11 text-field'><div class='row'><input type='text' placeholder='Question'" +
    "class='question'> </div> <div class='row '><div class='col-11 table-full-width table-responsive options-containter'>" +
    "<div class='row answer-option-container bottom'> <div class='col-1 answer-radio'> <input type='radio'" + 
    "class='option-input' disabled></div><div class='col-11'><input type='text' " +
    "placeholder='Option 1' class='answer-option'></div></div></div>"

questionContainerHTML = "<div class='question-container'><div class='question-header'><div class='setting-switch>'" +
    "<label class='switch'> <input type='checkbox'><span class='slider round'></span></label><div class='switch-label'>Required</div>" +
    "</div><div class='setting-switch choose-multiple' style='padding-left: 30px;'><label class='switch'>" +
    "<input type='checkbox'><span class='slider round'></span></label><div class='switch-label'>Choose Multiple</div>" +
    "</div><div class='type-select'><select class='form-control name='event-type'><option value='text'>Text </option>" +
    "<option value='multiple-choice'>Multiple Choice </option><option value='time-slot'>Time Slot</option></select></div>" +
    "</div><div class='row'>" + '[Content Here]' +  "</div><div class='separator'></div></div>"
    

$(".answer-option-container.bottom input.answer-option").on('focus', AddOption)
$(".answer-option-container.bottom input.answer-option").on('focusout', UnfocusOption)
$(".options-containter").each((i, e) => UpdateOptionProperties(e))

function AddOption(e){
    par = $(e.target).closest(".answer-option-container")
    par.after(optionHTML)

    par.next().find("input.answer-option").on('focus', AddOption)
    par.next().find("input.answer-option").on('focusout', UnfocusOption)

    par.removeClass('bottom')
    $(e.target).off('focus')
    $(".options-containter").each((i, e) => UpdateOptionProperties(e))
}

function UnfocusOption(e) {
    if($(e.target).val() == '') {
        $(e.target).closest(".answer-option-container").remove()
        $(".options-containter").each((i, e) => UpdateOptionProperties(e))
    }    
}

function UpdateOptionProperties(e) {
    options = $(e).find(".answer-option-container")
    options.each((i, opt) => {
        $(opt).removeClass('first')
        $(opt).find("input.answer-option").attr("placeholder", "Option " + (i+1));
        $(opt).data('option-number', (i+1))
    })

    if (options.length == 1) {
        options.addClass('first')
    }
}

$('.setting-switch.choose-multiple input').on('change', (e) => {
    $(e.target).closest(".question-container").find(".options-containter input.option-input").each((i, el) => {
        if ($(el).closest(".question-container").find('.setting-switch.choose-multiple input').is(':checked')) {
            $(el).attr('type', 'checkbox')
        } else {
            $(el).attr('type', 'radio')
        }
        
    })
})