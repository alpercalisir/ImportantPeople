function drawLegend(svg, color, options) {

    var ticks = [];
    let splits = 5;
    for (i=0; i < splits; i++){
      let test = Math.floor(color.domain()[0] + (i/splits)*(color.domain()[1] - color.domain()[0]))
      ticks.push({
        value: test,
        color: color(test)
      })
    }

    ticks.push({
      value: color.domain()[1],
      color: color(color.domain()[1])
    })

    var extent = d3.extent(ticks, d => d.value);
    var y = d3.scaleLinear()
        .range([options.height, 0]).nice()
        .domain(extent);

    var legAxis = d3.axisRight(y)
        .tickSize(-20)
        .tickValues(ticks.map(d => d.value));

    var g = svg.append("g")
        .attr("x", -options.height)
        .attr("y", options.width + options.legend.padding);

    svg.append("text")             
      .classed("legend label", true)
      .attr("x", options.width + options.margin.right - options.legend.padding)
      .attr("y", -0.75*options.margin.top)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("HPI");

    var defs = svg.append("defs");
    var linearGradient = defs.append("linearGradient").attr("id", "myGradient");

    linearGradient.selectAll("stop")
        .data(ticks)
      .enter().append("stop")
        .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
        .attr("stop-color", d => d.color)
        .attr("gradientTransform", "rotate(-90)");

    g.append("rect")
        .attr("width", options.height)
        .attr("height", options.legend.width)
        .attr("x", -options.height)
        .attr("y", options.width + options.legend.padding)
        .attr("dy", "1.5em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end")
        .style("fill", "url(#myGradient)");

    let translateX = options.width + options.legend.width + options.legend.padding;
    g.append("g")
        .call(legAxis)
        .attr("height", options.height)
        .attr("transform", "translate(" + translateX + "," + 0 + ")")
      .select(".domain").remove();
}
