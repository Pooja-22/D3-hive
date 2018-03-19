$(document).ready(function () {

    var data = [];

    $.get('/data').then(function (res) {
        $('#loader').show();
        data = JSON.parse(res[0]);
        calculateEntities(data);
    });

    $("#filter").on('click', function () {
        $('#loader').show();
        var filteredData = [];
        var fromDate = Date.parse($('#from-date').val());
        var toDate = Date.parse($('#to-date').val());
        if (fromDate && toDate) {
            data.filter(function (item, index) {
                var date = item["sales_data_leisure_view.transaction_date"].substring(0, 10);
                date = Date.parse(date);
                if (date >= fromDate && date <= toDate) {
                    filteredData.push(item);
                };
            });
            calculateEntities(filteredData);
        }
    });
})