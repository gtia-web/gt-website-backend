function closeUserSelectScreen() {
    $('#main-page').removeClass("disabled-element")
    $('.user-select-screen').each((i, e) => $(e).addClass("user-box-hide"))
}

var selectedItemIds = new Map() 
var currentlyAvailable = new Map()
var RequestsPending = new Map()
var pendingQueries = new Map()

function makeItemSelected(elem) {
    var e = $(elem)
    var userSelect = e.closest('.user-select-screen')
    selectedItemIds.get(userSelect.attr('id')).push(e.attr('id'))
    var targ = e.detach();
    targ.attr("onclick", "makeUnselected(this)")
    userSelect.find('.selected-member-list').append(targ);
}

function makeUnselected(elem) {
    var e = $(elem)
    var id = e.attr('id')
    var userSelect = e.closest('.user-select-screen')
    var targ = e.detach();
    targ.attr("onclick", "makeItemSelected(this)")

    const index = selectedItemIds.get(userSelect.attr('id')).indexOf(id);
    selectedItemIds.get(userSelect.attr('id')).splice(index, 1); 

    if (currentlyAvailable.get(userSelect.attr('id')).includes(id)){
        userSelect.find('.available-member-list').append(targ);
    }
    
}

function selectallsearch(elem) {
    $(elem).closest('.user-select-screen').find('.available-member-list').find('li').each((i, e) => {
        makeItemSelected(e)
    })
}

function removeallsearch(elem) {
    $(elem).closest('.user-select-screen').find('.selected-member-list').find('li').each((i, e) => {
        makeUnselected(e)
    })
}

async function GetUserQuery(query, id) {
    var data = await Promise.resolve($.post('/signups/user/list', {
        query: query
    }))    

    currentlyAvailable.set(id, [])
    availListElem = $('#' + id).find('.available-member-list')
    availListElem.empty();
    data.forEach(e => {
        if (!selectedItemIds.get(id).includes(e._id)) {
            availListElem.append( '<li onclick="makeItemSelected(this)" style="cursor: pointer;" id="' + e._id + '">' + e.FirstName + ' ' 
                + e.LastName + ' (' + e.Username + ') </li>' );
        } 
        currentlyAvailable.get(id).push(e._id)
    });
}

async function runSearchUpdate() {
    for (let key of RequestsPending.keys()) {
        if (RequestsPending.get(key)) {
            RequestsPending.set(key, false);
            await GetUserQuery(pendingQueries.get(key), key)
        }
    }

    setTimeout( runSearchUpdate, 500 );
}

function MakeSearchQuery(elem) {
    e = $(elem).closest('.user-select-screen')
    pendingQueries.set(e.attr('id'), e.find('.user-search-input').val())
    RequestsPending.set(e.attr('id'), true)
}

function MakeSearchQueryById(id) {
    e = $('#'+id)
    pendingQueries.set(e.attr('id'), e.find('.user-search-input').val())
    RequestsPending.set(e.attr('id'), true)
}


function initialize() {
    $('.user-select-screen').each((i, e) => {
        id = $(e).attr('id')
        selectedItemIds.set(id, [])
        currentlyAvailable.set(id, [])
        RequestsPending.set(id, false)
        pendingQueries.set(id, '')
    })
    runSearchUpdate();
}

initialize();
