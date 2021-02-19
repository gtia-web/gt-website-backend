function resizeTable() {
    var tbody = $("#workPointsTableBody td");
    $("#workPointsTableHead th").each(function(i,v) {
        $(v).width(tbody.eq(i).width());
    });
}

function loop() {
    resizeTable()
    setTimeout( loop, 500 );
}

loop()
