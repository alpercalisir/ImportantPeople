var x, y, xAxis, yAxis, zoom, svg, csvdata, tip;
var xMax, xMin, yMax, yMin;
var color, legend, objects;
var brush, idleTimeout, idleDelay = 350;

function drawAxes(options){

    x = d3.scaleLinear()
        .range([0, options.width]).nice();

    y = d3.scaleLinear()
        .range([options.height, 0]).nice();

    xAxis = d3.axisBottom()
        .scale(x)
        .tickSize(-options.height);

    yAxis = d3.axisLeft()
        .scale(y)
        .tickSize(-options.width);

    brush = d3.brush()
              .extent([[0, 0], [options.width, options.height]])
              .on("end", brushended);
    
    function zoomed() {

        var t = objects.transition().duration(800);
        svg.select(".axis.x").transition(t).call(xAxis);
        svg.select(".axis.y").transition(t).call(yAxis);
        objects.selectAll(".dot").transition(t)
        .attr("cx", function (d) { return x(d.x); })
        .attr("cy", function (d) { return y(d.y); });
    }

     function brushended() {
        var s = d3.event.selection;
        if (!s) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
            x.domain([xMin, xMax]).nice();
            y.domain([yMin, yMax]).nice();
            //x.domain(d3.extent(filtered, function (d) { return d.x; })).nice();
            //y.domain(d3.extent(filtered, function (d) { return d.y; })).nice();
        } else {
            x.domain([s[0][0], s[1][0]].map(x.invert, x));
            y.domain([s[1][1], s[0][1]].map(y.invert, y));
            objects.select(".brush").call(brush.move, null);
        }
        zoomed();
    }

   function idled() {
        idleTimeout = null;
    }
}


function drawBoard(options){

    svg = d3.select("#scatter")
        .append("svg")
        .attr("width", options.outerWidth)
        .attr("height", options.outerHeight)
        .append("g")
        .attr("transform", 
              "translate(" + 
                (options.margin.left + options.margin.axis) +
                 "," + options.margin.top + ")"
        )
        //.call(zoom)
        //.call(responsivefy);

    var clip = svg.append("defs").append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                .attr("width", options.width)
                .attr("height", options.height)
                .attr("x", 0) 
                .attr("y", 0); 

    //svg.append("rect")
    //    .attr("width", options.width)
    //    .attr("height", options.height);

    svg.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0," + options.height + ")")
        .call(xAxis)
        .append("text")
        .classed("label", true)
        .attr("x", options.width)
        .attr("y", options.margin.bottom - 30)
        .style("text-anchor", "end");

    svg.append("text")             
      .classed("x label", true)
      .attr("transform",
            "translate(" + (options.width/2) + " ," + 
                           (options.height + options.margin.top) + ")")
      .style("text-anchor", "middle")
      .text("Dimension 1");

    svg.append("g")
        .classed("y axis", true)
        .call(yAxis)
        .append("text")
        .classed("label", true)
        .attr("transform", "rotate(-90)")
        .attr("y", -options.margin.left)
        .attr("dy", "1.5em")
        .style("text-anchor", "end");

    svg.append("text")             
      .classed("y label", true)
      .attr("transform", "rotate(-90)")
      .attr("y", -(options.margin.left + options.margin.axis/2))
      .attr("x", -(options.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Dimension 2");

    objects = svg.append("svg")
        .classed("objects", true)
        .attr("width", options.width)
        .attr("height", options.height)
        .attr("clip-path", "url(#clip)");

    objects.append("g")
        .classed("brush", true)
        .call(brush);

    objects.append("svg:line")
        .classed("axisLine hAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", options.width)
        .attr("y2", 0)
        .attr("transform", "translate(0," + options.height + ")");

    objects.append("svg:line")
        .classed("axisLine vAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", options.height);

    tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) {
          return "<div class='pt-1 pb-1'>" + d.name + " (Relevance: " + d.hpi.toFixed(2) + ")"
                 + "<br>Occupation: " + d.occupation
                 + "<br>Birth: " + d.birth + "<br>   "
                 + "Click to show closest points</div>"
      });

    svg.call(tip);
}

function get_nearest(d){
    filtered = before_filtered_scatterplot
    if (filtered) {
        let globalDistance = $("#distanceRange").val();

        let distances = filtered.map(function (g){
            return {
                id: g.en_curid,
                value: Math.sqrt(Math.pow(d.x - g.x, 2) + Math.pow(d.y - g.y, 2))
            }
        });
        //distances.filter(g => g.en_curid !== d.en_curid)

        distances = distances.filter(g => g.value < globalDistance)
        

        //distances = distances.sort((a, b) => (a.value > b.value) ? 1 : -1);
        let ids = distances.map(g => parseInt(g.id));
        filtered = filtered.filter(
            function (g) {
                  return ids.includes(parseInt(g.en_curid))
            }
        );
    }
}

//It's null if i've not filtered by nearest points yet.
// Otherwise, it contains filtered variable before filter by closest point.
var before_filtered_scatterplot = null
var last_point_clicked_this = null
var last_point_clicked_d = null


function filter_by_nearest(d){
    if (before_filtered_scatterplot === null) {
        $("#scatterFilters").height(
            $("#filtersRow").height()
        )
        $("#scatterFilters").show();
        before_filtered_scatterplot = filtered;
    }

    $(last_point_clicked_this).attr("class", "dot")

    last_point_clicked_this = this
    last_point_clicked_d = d


    d3.select(this).attr("class", "red_dot")
    showResearch(d.name)

    get_nearest(d)
    updatePlots()
}

function changeDistance(){

    get_nearest(last_point_clicked_d)
    updatePlots()
}

function exitScatterFilters(){
    filtered = before_filtered_scatterplot
    $(last_point_clicked_this).removeClass("red_dot")

    before_filtered_scatterplot = null
    last_point_clicked_this = null
    last_point_clicked_d = null

    $("#scatterFilters").hide();
    hideResearch()

    updatePlots()
}

function drawCanvas(data, options){

    xMax = d3.max(data, function(d) {
        return d[options.plot.xCat];
    }) * 1.05,

    xMin = d3.min(data, function(d) {
        return d[options.plot.xCat];
    }),

    xMin = xMin >= 0 ? -0.05 : xMin,

    yMax = d3.max(data, function(d) {
        return d[options.plot.yCat];
    }) * 1.05,

    yMin = d3.min(data, function(d) {
        return d[options.plot.yCat];
    }),

    yMin = yMin >= 0 ? -0.05 : yMin;

    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    color = d3.scaleSequential()
        .interpolator(d3.interpolateViridis);
}

function drawScatter(data, options){

    objects.selectAll(".dot")
        .data(data)
        .enter().append("circle")
            .classed(".dot", true)
            .attr("class", "dot")
            .attr("r", 4.5)
            .attr("cx", function(d) { return x(d[options.plot.xCat]); })
            .attr("cy", function(d) { return y(d[options.plot.yCat]); })
            .attr("stroke", "black")
            .attr("stroke-width", 0.3)
            .style("fill", function(d) {return color(d[options.plot.colorCat]);})
            .style("opacity", 1)
            .on("mouseover", tip.show)
            .on("click", filter_by_nearest)
            .on("mouseout", tip.hide);
    svg.call(tip);
};

var cfg;
function scatterPlot(options){
        let hpi = [];
        cfg = options;
        hpi = data.map(d => d.hpi);

        drawAxes(options);
        drawBoard(options);
        drawCanvas(data, options);
        color.domain(
            [
                Math.floor(
                    Math.min.apply(null, hpi)
                ),
                Math.ceil(
                    Math.max.apply(null, hpi)
                )
            ]
        );
        drawScatter(data, options);
        drawLegend(svg, color, options);
}

function updateScatter() {
    if (filtered){
        let ids = data.map(d => parseInt(d.en_curid));
        if(filtered !== undefined)
            ids = filtered.map(d => parseInt(d.en_curid));

        d3.selectAll(".dot")
        .transition()
        .duration(100)
        .style("display", "none")
        .filter(function(d) {
            return (ids.includes(parseInt(d.en_curid)));
        })
        .style("display", "block")
    }
};
