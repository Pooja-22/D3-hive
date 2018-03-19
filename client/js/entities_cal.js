/**
 * Gross Revenue
 */
var completeData = [];
function calculateEntities (data) {
    $('#loader').hide();
    completeData = data;
    var gross_revenue = 0, avg_gross_revenue = 0, net_revenue = 0, length = 0;
    data.map(function (item) {
        var txn_amount = item["sales_data_leisure_view.txn_amount"] || 0;
        var net_amount = (item["sales_data_leisure_view.txn_amount"] || 0) - (item["sales_data_leisure_view.vendor_amount"] || 0);
        gross_revenue = gross_revenue + txn_amount;
        net_revenue = net_revenue + net_amount;
        length++;
    });
    avg_gross_revenue = gross_revenue && gross_revenue / length;
    $("#transactions_data").text(length.toLocaleString('en-IN'));
    $("#net_revenue_data").text(net_revenue.toLocaleString('en-IN'));
    $("#gross_revenue_data").text(gross_revenue.toLocaleString('en-IN'));
    $("#avg_gross_revenue_data").text(avg_gross_revenue.toLocaleString('en-IN'));
    $("svg").remove();
    if (!data.length) return;
    calculateGraphData(data)
};

/**
 * Calculate graph data
 */
function calculateGraphData (data) {
    var service_type = {}, channel_type = {}, city_type = {};
    var graphData = {
        gross_revenue: [],
        net_revenue: [],
        transactions: [],
        average_gross_revenue: [],
    }

    function addData(item, type, obj) {
        var txn_amount = item["sales_data_leisure_view.txn_amount"] || 0;
        var net_revenue = (item["sales_data_leisure_view.txn_amount"] || 0) - (item["sales_data_leisure_view.vendor_amount"] || 0);
        if (item[type] in obj) {
            obj[item[type]].transactions++
            obj[item[type]].gross_revenue = obj[item[type]].gross_revenue + txn_amount;
            obj[item[type]].net_revenue = obj[item[type]].net_revenue + net_revenue;
        } else if(item[type] !== undefined) {
            obj[item[type]] = {};
            obj[item[type]].transactions = 1;
            obj[item[type]].gross_revenue = txn_amount;
            obj[item[type]].net_revenue = net_revenue;
        }
    }

    data.map(function (item) {
        addData(item, 'sales_data_leisure_view.channel', channel_type);
        addData(item, 'sales_data_leisure_view.service', service_type);
        addData(item, 'sales_data_leisure_view.city', city_type);
    });


    for (key in channel_type) {
        channel_type[key].average_gross_revenue =  parseInt(channel_type[key].gross_revenue / channel_type[key].transactions)
    }
    for (key in service_type) {
        service_type[key].average_gross_revenue =  parseInt(service_type[key].gross_revenue / service_type[key].transactions)
    }

    /**
     * Gross Revenue data calculation and graph drawing
     * @type {Array}
     */
    graphData.gross_revenue = formatGraphData(service_type, channel_type, city_type, "gross_revenue");
    drawGrossRevenueGraph(graphData.gross_revenue);

    /**
     * Transaction data calculation and graph drawing
     * @type {Array}
     */
    graphData.transactions = formatGraphData(service_type, channel_type, city_type, "transactions");
    drawTransactionGraph(graphData.transactions);

    /**
     * Net Revenue data calculation and graph drawing
     * @type {Array}
     */
    graphData.net_revenue = formatGraphData(service_type, channel_type, city_type, "net_revenue");
    graphData.average_gross_revenue = formatGraphData(service_type, channel_type, city_type, "average_gross_revenue");
    drawAverageNetRevenueGraph(graphData.net_revenue, graphData.average_gross_revenue, 'service');
    drawAverageNetRevenueGraph(graphData.net_revenue, graphData.average_gross_revenue, 'channel');

};

/**
 * Calculate gross revenue data at service, channel and city level
 * @param service_type
 * @param channel_type
 * @param city_type
 * @returns {Array}
 */

function formatGraphData(service_type, channel_type, city_type, type) {

    var updatedServiceObj = {
        type: 'service',
    };
    var updatedChannelObj = {
        type: 'channel',
    };
    var updatedCityObj = {
        type: 'City',
    };

    for (key in service_type) {
        updatedServiceObj[key] = service_type[key][type]
    }

    for (key in channel_type) {
        updatedChannelObj[key] = channel_type[key][type]
    }

    for (key in city_type) {
        updatedCityObj[key] = city_type[key][type]
    }

    if (type === "gross_revenue") return [updatedServiceObj, updatedChannelObj, updatedCityObj];
    return [updatedServiceObj, updatedChannelObj]

}

/**
 * Gross Revenue graph at service, channel and city level
 * @param data 
 */
function drawGrossRevenueGraph (data) {
    if (!data.length) return;

    var keys = [];
    data.map(function (item) {
        for (key in item) {
            if (key !== 'type') keys.push(key);
        }
    })

    var svg = d3.select("#gross_revenue").append("svg").attr("width", 450).attr("height", 500),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .padding(0.05);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    x0.domain(data.map(function(d) { return d.type; }));
        x1.domain(keys).rangeRound([1, x0.bandwidth()]);
        y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

        g.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", function(d) { return "translate(" + x0(d.type) + ",0)"; })
            .selectAll("rect")
            .data(function(d) {
                var updatedData = [];
                for (key in d) {
                    if (key !== 'type') updatedData.push({ key: key, value: d[key]});
                }
                return updatedData;
            })
            .enter().append("rect")
            .attr("x", function(d) { return x1(d.key);  })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", x1.bandwidth())
            .attr("height", function(d) { return height - y(d.value); })
            .attr("fill", function (d) {
                return z(d.key);
            });

        d3.selectAll('rect')
            .on("mouseover", function() { tooltip.style("display", null); })
            .on("mouseout", function() { tooltip.style("display", "none"); })
            .on("mousemove", function(d) {
                var xPosition = d3.event.offsetX + 10;
                var yPosition = d3.event.offsetY + 10;
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                tooltip.select("text").text(d.key);
            })
            .on("click", function (d) {
                calculateDateWiseGrossRevenue(d.key);
                d3.event.stopPropagation();
            })

        g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0));

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 20)
            .attr("y", y(y.ticks().pop()) - 15)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Gross Reveune");

        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width - 4)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });

        var tooltip = svg.append("g")
            .attr("class", "tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "transparent")
            .style("opacity", 0.5);

        tooltip.append("text")
            .attr("x", 30)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");
}

/**
 * Average Gross Revenue & Net Revenue Graph at a level
 * @param data
 */
function drawAverageNetRevenueGraph(net_revenue, avg_gross_revenue, type) {

    var z = d3.scaleOrdinal()
        .range(["#d0743c", "#98abc5"]);

    var net_revenue_data = [], avg_gross_revenue_data = [], range= [];

    net_revenue.map(function (item) {
        for (key in item) {
            if (item.type === type && key !== "type") {
                net_revenue_data.push({
                    type: key,
                    value: item[key]
                })
                range.push(item[key]);
            }
        }
    })

    avg_gross_revenue.map(function (item) {
        for (key in item) {
            if (item.type === type && key !== "type") {
                avg_gross_revenue_data.push({
                    type: key,
                    value: item[key]
                })
                range.push(item[key]);
            }
        }
    })

    var dataTypes = ["Average Gross Revenue", "Net Revenue"]

    var svg = d3.select("#average_net_revenue").append('svg').attr("width", 450).attr("height", 500).attr("padding", 20),
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand().rangeRound([0, width]);
    var y = d3.scaleLinear().rangeRound([height, 0]);

    y.domain([0, d3.max(range, function (d) { return d3.max(range, function (item) { return item; }); })]).nice();
    x.domain(net_revenue_data.map(function (d) { return d.type; }));

    var line = d3.line()
        .x(function (d, i) { return x(d.type); })
        .y(function (d) { return y(d.value); })

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    g.append("g")
        .call(d3.axisLeft(y))
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Average Gross & Net Revenue");

    g.append("path")
        .datum(net_revenue_data)
        .attr("fill", "none")
        .attr("stroke", "#98abc5")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    g.append("path")
        .datum(avg_gross_revenue_data)
        .attr("fill", "none")
        .attr("stroke", "#d0743c")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(dataTypes.slice())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 4)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { console.log(d); return d; });
}

/**
 * Transactions Graph at service and channel level
 * @param data
 */
function drawTransactionGraph(data) {

    var serviceData = [], channelData = [];
    var serviceCount = 0, channelCount = 0;

    data.forEach(function (item) {
        for (key in item) {
            if (item.type === "service") {
                if (key !== 'type') {
                    serviceData.push({
                        key: key,
                        value: item[key],
                    })
                }
            }
            if (item.type === "channel") {
                if (key !== 'type') {
                    channelData.push({
                        key: key,
                        value: item[key],
                    })
                }
            }
        }
    })

    serviceData.map(function (item) {
        serviceCount = serviceCount + item.value;
    })

    channelData.map(function (item) {
        channelCount = channelCount + item.value;
    })

    createChart(serviceData, serviceCount, '#transactions');
    createChart(channelData, channelCount, '#transactions');
}

/**
 *
 * @param data
 * @param totalCount
 * @param element
 * @param id
 */
function createChart (data, totalCount, element) {
    var width = 600,
        height = 600,
        radius = 200;

    var color = d3.scaleOrdinal(d3.schemeCategory20b);

    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(100);

    var pie = d3.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    var svg = d3.select(element).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d,i) {
            return color(d.data.key);
        });

    g.append("text")
        .attr("transform", function(d, i) {
            var _d = arc.centroid(d);
            _d[0] *= 1.5 + i/10;	//multiply by a constant factor
            _d[1] *= 1.5 + i/10;//multiply by a constant factor
            return "translate(" + _d + ")";
        })
        .attr("dy", ".70em")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.data.key;
        });

    g.append("text")
        .attr("text-anchor", "middle")
        .attr('font-size', '1.5em')
        .text(totalCount);
}

/**
 * Calculate date wise data of gross revenue for particular service/channel/city
 */
function calculateDateWiseGrossRevenue (value) {
    var graphData = [], dates = [], totalCount = 0;
    completeData.map(function (item) {
        if(dates.indexOf(item["sales_data_leisure_view.transaction_date"]) === -1){
            dates.push(item["sales_data_leisure_view.transaction_date"]);
        }
    })
    dates.map(function (date) {
        var gross_revenue = 0;
        completeData.map(function (item) {
            var itemDate = item["sales_data_leisure_view.transaction_date"];
            var service = item["sales_data_leisure_view.service"];
            var channel = item["sales_data_leisure_view.channel"]
            if ((itemDate === date && service === value) || (itemDate === date && channel === value)) {
                gross_revenue = gross_revenue + item["sales_data_leisure_view.txn_amount"];
            }
        })
        if (gross_revenue) {
            graphData.push({
                key: date.substring(0, 10),
                value: gross_revenue,
            })
        }
    })

    $('#gross_revenue > svg').slice(1).remove();
    createChart(graphData, value, '#gross_revenue', "gross_revenue_single")
}

