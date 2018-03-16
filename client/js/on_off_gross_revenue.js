 function drawGrossRevenueGraph(data) {
     
     var data = [
         { mode: 'Online', count: 200 },
         { mode: 'Offline', count: 10 },
     ];

     var totalCount = 0;

     data.forEach(function (item) {
         totalCount = totalCount + item.count;
     })

     var width = 540,
         height = 540,
         radius = 200;

     var color = d3.scaleOrdinal(d3.schemeCategory20b);

     var arc = d3.arc()
         .outerRadius(radius - 10)
         .innerRadius(100);

     var pie = d3.pie()
         .sort(null)
         .value(function(d) {
             return d.count;
         });

     var svg = d3.select('body').append("svg")
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
             return color(d.data.mode);
         });

     g.append("text")
         .attr("transform", function(d) {
             var _d = arc.centroid(d);
             _d[0] *= 1.5;	//multiply by a constant factor
             _d[1] *= 1.5;	//multiply by a constant factor
             return "translate(" + _d + ")";
         })
         .attr("dy", ".50em")
         .style("text-anchor", "middle")
         .text(function(d) {
             return d.data.mode;
         });

     g.append("text")
         .attr("text-anchor", "middle")
         .attr('font-size', '2em')
         .text(totalCount);

 }