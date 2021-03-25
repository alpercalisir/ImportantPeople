var chart, vis;

function parallelMap(options){

    chart = d3.parsets()
              .dimensions(options.dimensions)
              .width(options.width)
              .height(options.height)
              .tension(0.7)
              .tooltip(tooltip_1)
              .categoryTooltip(tooltip_2);


    vis = d3.select("#parallel").append("svg")
        .attr("width", options.outerWidth)
        .attr("height", options.outerHeight)
        .attr("transform", 
              "translate(" + 
                options.margin.left +
                 "," + options.margin.top + ")"
        );

    vis.datum(data).call(chart);
}

tooltip_1 = function(d) {
  var count = d.count,
      path = [];
  while (d.parent) {
    if (d.name) path.unshift(d.name);
    d = d.parent;
  }
    return path.join(" → ") + "<br>Count: " + count + " (" + (100*count / d.count).toFixed(1) + "%)";
}

tooltip_2 = function(d) {
    return d.name + "<br>Count: " + d.count + " (" + (100*d.count / d.dimension.count).toFixed(1) + "%)";
}

function updateParallelMap(options){
    if (filtered){
        vis.selectAll('.category').remove()
        vis.selectAll('.ribbon').remove()
        vis.selectAll('.ribbon-mouse').remove()
        vis.selectAll('.dimension').remove()

        chart = d3.parsets()
                  .dimensions(options.dimensions)
                  .width(options.width)
                  .height(options.height)
                  .tension(0.7)
                  .tooltip(tooltip_1)
                  .categoryTooltip(tooltip_2);

        vis.datum(filtered).call(chart);
    }
}

