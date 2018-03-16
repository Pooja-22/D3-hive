$(document).ready(function () {

    var data = [];

    if (localStorage && localStorage.data) {
        data = JSON.parse(localStorage.data);
        calculateEntities(data);
    } else {
        $.get('/data').then(function (res) {
            data = JSON.parse(res[0]);
            localStorage.setItem("data", JSON.stringify(data));
            calculateEntities(data);
        });
    }

    $("#filter").on('click', function () {
        var fromDate = Date.parse($('#from-date').val(), 'y-m-d');
        var toDate = Date.parse($('#to-date').val(), 'y-m-d');
        if (fromDate && toDate) {
            var filteredData = data.filter(function (item) {
                var date = Date.parse(item["sales_data_leisure_view.transaction_date"], "y-m-d")
                if ((date > fromDate || date === fromDate) && ((date === toDate && date < toDate))) return item;
            });
            calculateEntities(filteredData);
        }
    });
})