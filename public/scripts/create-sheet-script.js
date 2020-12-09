const textFieldHTML = "<div class='basic-text-field'>" +
    "<input type='text' placeholder='Question' class='question'>" +
    "<input type='text' placeholder='Enter your answer' class='answer' disabled > </div>"

const optionsFieldHTML = "<div class='options-field'>" +
    "<input type='text' placeholder='Question' class='question'>" +
    "<div class='options'>" + 
        "<div class='option'>" +
            "<div class='option-radio'><input type='radio' class='radio-checkbox-preview' disabled> </div>" +
            "<div class='option-text-box'><input type='text' placeholder='Options 1' class='options-text'></div>" + 
        "</div>" +
        '<div class="bottom-options"></div></div></div>' +
    "<div style='clear: both;' class='field-margin'></div>" +
    "<div class='option-extra-bar'>" +
    "<div class='option-extra-bar-button' onclick='AddOptionClick(this)'>" +
        "<div class='option-extra-bar-icon'>" + 
            "<span class='fas fa-plus'></span></div>" +
        "<div class='option-extra-bar-text'>Add option</div>" +
        "<div style='clear: both;'></div></div></div>";

    
const timeSlotFieldHTML = "<div class='time-slots-field'>" +
    "<input type='text' placeholder='Short Description' class='question'>" +
    '<div style="margin-left: 60px;" class="time-slot-date-time-box">' +
        '<div class="time-slot-text">Date</div>' +
        '<input type="date" class="time-slot-input-date"></div>' +
    '<div class="time-slot-date-time-box">' +
        '<div class="time-slot-text">Start Time</div>' +
        '<input type="time" class="time-slot-input-start-time"></div>' +
    '<div class="time-slot-date-time-box">' +
        '<div class="time-slot-text">End Time</div>' +
        '<input type="time" class="time-slot-input-end-time"></div>' +
    '<div style="clear: both;"></div>' +
    '<div style="margin-left: 32px;" class="time-slot-date-time-box">' +
    '<div class="time-slot-text">Job Type</div>' +
    '<input type="text" placeholder="Job" class="time-slots-field-job"></div>' +                     
    '<div class="time-slot-date-time-box">' +
    '<div class="time-slot-text">Length of Slots</div>' +
    '<input type="number" min="5" step="5" value="30" style="height: 36px;" class="time-slot-input-slot-length"></div></div>';



var fieldCounterMap = new Map();
var currFieldCount = 0;
var requestData = {};
var UserSearchResult = new Map();

function CreateSheetButton(id) {
    var validation_issue = [];
    var valid = []
    var fields_data = []
    var sheetName = ""
    var sheetDescription = ""

    for (let key of fieldCounterMap.keys()) {
        field = $('#' + key)
        if (field.find('.basic-text-field').length !== 0) {
            //Validate
            if (field.find('.question').val() == "") {
                validation_issue.push(field.find('.question'));
            } else {
                valid.push(field.find('.question'));
            }

            //Add Data
            fields_data.push({
                type: 'text',
                question: field.find('.question').val(),
                field_number: fieldCounterMap.get(key),
                is_required: field.find('input.required-switch').is(":checked")
            })
        } else if (field.find('.options-field').length !== 0) {

            //Validate
            if (field.find('.question').val() == "") {
                validation_issue.push(field.find('.question'));
            } else {
                valid.push(field.find('.question'));
            }

            field.find('.option').each((i, e) => {
                if ($(e).find(".options-text").val() == "") {
                    validation_issue.push($(e).find(".options-text"));
                } else {
                    valid.push($(e).find(".options-text"));
                }
            })

            //Add Data
            options = []
            field.find('.option').each((i, e) => {
                options.push($(e).find(".options-text").val())
            })

            fields_data.push({
                type: 'options',
                question: field.find('.question').val(),
                field_number: fieldCounterMap.get(key),
                options: options,
                is_required: field.find('input.required-switch').is(":checked"),
                choose_multiple: field.find('input.multiple-switch').is(":checked")
            })
        } else if (field.find('.time-slots-field').length !== 0) {
            //Empty Validate

            if (field.find('.question').val() == "") {
                validation_issue.push(field.find('.question'));
            } else {
                valid.push(field.find('.question'));
            }

            if (field.find(".time-slot-input-date").val() == "") {
                validation_issue.push(field.find(".time-slot-input-date"))
            } else {
                valid.push(field.find(".time-slot-input-date"))
            }

            date_valid = true;
            if (field.find('.time-slots-field-job').val() == "") {
                validation_issue.push(field.find('.time-slots-field-job'));
                date_valid = false;
            } else {
                valid.push(field.find('.time-slots-field-job'));
            }

            time_valid = true;
            if (field.find(".time-slot-input-start-time").val() == "") {
                validation_issue.push(field.find(".time-slot-input-start-time"))
                time_valid = false;
            } else {
                valid.push(field.find(".time-slot-input-start-time"))
            }

            if (field.find(".time-slot-input-end-time").val() == "") {
                validation_issue.push(field.find(".time-slot-input-end-time"))
                time_valid = false;
            } else {
                valid.push(field.find(".time-slot-input-end-time"))
            }

            //Logical validation

            if (time_valid) {
                startDate = new Date(Date.parse("01/01/2011 " + field.find(".time-slot-input-start-time").val() + ":00"))
                endDate = new Date(Date.parse("01/01/2011 " + field.find(".time-slot-input-end-time").val() + ":00"))

                if (startDate > endDate) {
                    validation_issue.push(field.find(".time-slot-input-end-time"))
                    validation_issue.push(field.find(".time-slot-input-start-time"))
                } else {
                    valid.push(field.find(".time-slot-input-end-time"))
                    valid.push(field.find(".time-slot-input-start-time"))
                }

                if (endDate.getTime() - startDate.getTime() 
                    < field.find(".time-slot-input-slot-length").val() * 1000 * 60) {
                    validation_issue.push(field.find(".time-slot-input-end-time"))
                    validation_issue.push(field.find(".time-slot-input-start-time"))
                    validation_issue.push(field.find(".time-slot-input-slot-length"))
                } else {
                    valid.push(field.find(".time-slot-input-end-time"))
                    valid.push(field.find(".time-slot-input-start-time"))
                    valid.push(field.find(".time-slot-input-slot-length"))
                }
            }

            if (date_valid) {
                if (new Date(field.find(".time-slot-input-date").val()) < new Date()) {
                    validation_issue.push(field.find(".time-slot-input-date"))
                } else {
                    valid.push(field.find(".time-slot-input-date"))
                }
            }

            //Add Data
            startDate = (field.find(".time-slot-input-date").val() + 
                " " + field.find(".time-slot-input-start-time").val() + ":00").replace(/-/g, "/")
            endDate = (field.find(".time-slot-input-date").val() + 
                " " + field.find(".time-slot-input-end-time").val() + ":00").replace(/-/g, "/")

            fields_data.push({
                type: 'time-slot',
                description: field.find('.question').val(),
                field_number: fieldCounterMap.get(key),
                is_required: field.find('input.required-switch').is(":checked"),
                start_time: startDate,
                end_time: endDate,
                job_type: field.find('.time-slots-field-job').val(),
                slot_length: field.find(".time-slot-input-slot-length").val()

            })   

        } else {
            console.log('field type not found error')
            return false;
        }
    }

    var nBox = $('#name-box')
    var dBox = $('#description-box')

    var sendNoteOption = $("#send-notification-switch")
    var expirationDate = $("#expiration-date")
    var expirationDataData = expirationDate.val().replace(/-/g, "/")

    if (nBox.val() == "") {
        validation_issue.push(nBox)
    } else {
        valid.push(nBox);
        sheetName = nBox.val()
    }
    
    if (dBox.html() == "" || dBox.hasClass('placeholder-text')) {
        validation_issue.push(dBox)
    } else {
        valid.push(dBox);
        sheetDescription = dBox.html()
    }

    if (expirationDate.val() == "") {
        validation_issue.push(expirationDate)
    } else if (new Date(expirationDataData) < new Date()) {
        validation_issue.push(expirationDate)
    } else {
        valid.push(expirationDate)
    }




    for (let elem of valid) {
        elem.removeClass('input-error-highlight')
    }
    for (let elem of validation_issue) {
        elem.addClass('input-error-highlight')
    }

    requestData = {
        sheet_name: sheetName,
        sheet_description: sheetDescription,
        fields: fields_data,
        expiration_date: expirationDataData,
        send_notifications: sendNoteOption.is(":checked")
    }

    if (validation_issue.length == 0) {
        $('#' + id).removeClass("user-box-hide")
        $('#main-page').addClass("disabled-element")
        MakeSearchQueryById(id)
    } else {
        console.log('Data validation issue')
    }

    
}

function confirmUserSearchInput(self, nextId, resultName) {
    var res = []    
    $(self).closest('.user-select-screen').find('.selected-member-list li').each((i, e) => {
        res.push($(e).attr('id'))
    })
    UserSearchResult.set(resultName, res)

    $('#' + nextId).removeClass("user-box-hide")
    $(self).closest('.user-select-screen').addClass("user-box-hide")
    MakeSearchQueryById(nextId)
}

function userSearchBack(self, lastId) {
    $('#' + lastId).removeClass("user-box-hide")
    $(self).closest('.user-select-screen').addClass("user-box-hide")
}

function submitCreateSheet(self, resultName) {

    var res = []    
    $(self).closest('.user-select-screen').find('.selected-member-list li').each((i, e) => {
        res.push($(e).attr('id'))
    })
    UserSearchResult.set(resultName, res)

    for (let key of UserSearchResult.keys()) {
        requestData[key] = UserSearchResult.get(key)
    }
        
    $.post('/signups/create', requestData , function(res) {
        window.location.replace(res.redirect);
    }, "json");
}

function getFieldHTML(fieldTypeHTML, fieldnumber, useMultiple = false) {
    multipleSwitch = "";
    if (useMultiple) {
        multipleSwitch = '<div class="switch-container">' +
            '<div class="sheet-field-button-bar-required">' +
                '<label class="switch">' +
                    '<input type="checkbox" class="multiple-switch" onchange="ToggleChooseMultiple(this)">' +
                    '<span class="slider round"></span></label>' + 
            '</div>' +
            '<div class="sheet-field-button-bar-multiple-text"> Choose Multiple </div>'+
            '<div style="clear: both;"></div>' +
        '</div>';
    }
    var res = '<div class="sheet-field-container" id="' + 'field-container-' + fieldnumber + '">' +
        '<div class="sheet-field-button-bar">' +
            '<div class="switch-container">' +
                '<div class="sheet-field-button-bar-required">' +
                    '<label class="switch">' +
                        '<input type="checkbox" class="required-switch">' +
                        '<span class="slider round"></span></label>' + 
                '</div>' +
                '<div class="sheet-field-button-bar-required-text"> Required </div>'+
                '<div style="clear: both;"></div>'+
            '</div>' + multipleSwitch +
            '<div class="sheet-field-button-bar-button">'+
                '<a onclick="DeleteFieldClick(this)" class="fas fa-trash-alt" style="cursor: pointer;"></a></div>  '+
            '<div class="sheet-field-button-bar-button">'+
                '<a class="fas fa-arrow-up" onclick="moveUpClick(this)" style="cursor: pointer;"></a></div> '+
            '<div class="sheet-field-button-bar-button">'+
                '<a class="fas fa-arrow-down" onclick="moveDownClick(this)" style="cursor: pointer;"></a></div>'+
            '<div style="clear: both;"></div></div>'+
        '<div class="field-holder">'+
            '<div class="question-number">' + fieldnumber + '. </div>' +  fieldTypeHTML +
            '<div style="clear: both;"></div></div></div>';

    return res;
}

function AddFieldClick(fieldType) {
    var newField = ""
    currFieldCount += 1;
    switch(fieldType) {
        case "text":
            newField = getFieldHTML(textFieldHTML, currFieldCount) 
            break;
        case "option":
            newField = getFieldHTML(optionsFieldHTML, currFieldCount, true) 
            break;
        case "time-slot":
            newField = getFieldHTML(timeSlotFieldHTML, currFieldCount) 
            break;
        default:
            break;
    }
    
    $( newField ).insertBefore( $( "#sheet-fields-container-bottom" ) );
    fieldCounterMap.set('field-container-' + currFieldCount, currFieldCount);
}

function DeleteFieldClick(elem) {
    var fieldId = $(elem).closest(".sheet-field-container").attr('id');
    index = fieldCounterMap.get(fieldId);

    for (let [key, value] of fieldCounterMap) {
        if (value > index) {
            replaceQuestionNumber(key, value-1);
        }
    }

    fieldCounterMap.delete('field-container-' + currFieldCount);
    $('#' + fieldId).remove();
    currFieldCount -= 1;  
}

function moveUpClick(elem) {
    var fieldId = $(elem).closest(".sheet-field-container").attr('id');
    var upFieldId = $('#' + fieldId).prev().attr('id');
    var cIndex = fieldCounterMap.get(fieldId);
    var uIndex = fieldCounterMap.get(upFieldId);
    if ($('#' + upFieldId).hasClass("sheet-field-container")) {
        var field = $('#' + fieldId).detach();
        field.insertBefore($('#' + upFieldId));
        replaceQuestionNumber(fieldId, 0)
        replaceQuestionNumber(upFieldId, cIndex)
        replaceQuestionNumber('field-container-0', uIndex)

    }
}

function moveDownClick(elem) {
    var nextField = $(elem).closest(".sheet-field-container").next();
    if (nextField.hasClass("sheet-field-container")) {
        moveUpClick(nextField);
    }
}

function replaceQuestionNumber(id, num) {
    $('#' + id).find('.question-number').html(num + '.');
    $('#' + id).attr('id', 'field-container-' + num);
}

function AddOptionClick(elem) {
    multiple = $(elem).closest('.sheet-field-container').find('.multiple-switch').is(':checked')

    var optionHTML = '<div class="option">' +
        '<div class="option-radio"><input type="' + (multiple ? 'checkbox' : 'radio') + '" class="radio-checkbox-preview" disabled> </div>' +
        '<input type="text" placeholder="Options 1" class="options-text"></div>';

    var optionsHolder = $(elem).closest(".field-holder");
    $( optionHTML ).insertBefore( optionsHolder.find(".bottom-options") );
}

function ToggleChooseMultiple(elem) {
    var checked = $(elem).is(':checked')
    optField = $(elem).closest('.sheet-field-container').find('.options-field .option .radio-checkbox-preview').each((i, e) => {
        if (checked) $(e).attr('type','checkbox')
        else $(e).attr('type','radio')
    })
}

