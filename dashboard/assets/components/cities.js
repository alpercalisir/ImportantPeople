var bp, svg, g;
var others_percentage;
function citiesPlot(options) {

    if(filtered === undefined)
        return

    d3.select("#cities")
        .selectAll("*")
        .remove();

    svg = d3.select("#cities")
            .append("svg")
            .attr("width", options.outerWidth)
            .attr("height", options.outerHeight);
            //.call(responsivefy);

    g = svg.append("g")
        .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

    var citiesCounter = {}
    var dataCity = [];
    var differentCountry = new Set(null);
    var uniqueCountry = null; //If set has only one element, this will be that

    //Load data from csv and apply filter.
    //Create dictionary such {birthcity: {#entries, country}}
    filtered.forEach(function (d) {
        let bcity = d.birthcity !== "Other" ? d.birthcity : "Unknown"
        if (bcity in citiesCounter)
            citiesCounter[bcity]["entries"] += 1
        else {
            citiesCounter[bcity] = {}
            citiesCounter[bcity]["entries"] = 1
            citiesCounter[bcity]["country"] = d.country
        }

        if (!differentCountry.has(d.country)){
            differentCountry.add(d.country)
            uniqueCountry = d.country
        }
    })

    //Create data like cities.csv from citiesCounter
    $.each(citiesCounter, function( city, dictCity ) {
        dataCity.unshift([dictCity.country, city, dictCity.entries])
    });

    if(dataCity.length > options.maxCitiesPlotted) {
        dataCity.sort(compare)
        var sum = dataCity.slice(options.maxCitiesPlotted).map(x => x[2]).reduce((a, b) => a + b, 0); //Compute sum of "Others" element
        others_percentage = sum/dataCity.map(x => x[2]).reduce((a, b) => a + b, 0);

        dataCity = dataCity.slice(0, options.maxCitiesPlotted);

        //If i've only a country (cause filtering) we don't use "Others" keyword for country, but country name
        /*if(differentCountry.size === 1)
            dataCity.unshift([uniqueCountry, "Others", sum])
        else
            dataCity.unshift(["Others", "Others", sum])
        */

        $("#others_cities_left").text("Others " + d3.format("0.0%")(others_percentage))
        $("#others_cities_right").width((others_percentage*300/4) + "%")
        $("#others_cities_right_indicator_2").html(d3.format("0.0%")((1-others_percentage)) + " of total.")

        $("#others_cities").show();

        dataCity.sort(compare)
    }
    else{
        $("#others_cities_left").text("Others 0%")
        $("#others_cities_right").width("77%")
        $("#others_cities_right_indicator_2").html("100% of total.")

        others_percentage = 0

        $("#others_cities").show();
    }

    bp = viz.bP(dataCity)
            .data(dataCity)
            .min(12)
            .pad(1)
            .height(options.height)
            .width(options.width)
            .barSize(35);
                
    g.call(bp);

    g.selectAll(".mainBars")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)

    g.selectAll(".mainBars").append("text").attr("class","label")
    .attr("x", d => (d.part=="primary"? -20: 40))
    .attr("y", d => +6)
    .text(d=>d.key)
    .attr("text-anchor",d=>(d.part=="primary"? "end": "start"));


    g.selectAll(".mainBars").append("text").attr("class","perc")
    .attr("x", d => (d.part=="primary"? 15: 0))
    .attr("y", d => +6)
    .text(function(d){return d3.format("0.0%")(d.percent*(1-others_percentage))})
    .attr("text-anchor",d=>(d.part=="primary"? "end": "start"));

}

function mouseover(d){
	bp.mouseover(d);
	g.selectAll(".mainBars")
	.select(".perc")
	.text(function(d){ 
        if (d.percent<0.001){
            g.select(".mainBars")
	        .select(".perc")
            .style('display','none')
        }
        else{
            return d3.format("0.0%")(d.percent*(1-others_percentage))
        }


    })
    .style('fill', 'black')
}
function mouseout(d){
	bp.mouseout(d);
	g.selectAll(".mainBars")
		.select(".perc")
        .style('display','block')
	.text(function(d){ return d3.format("0.0%")(d.percent*(1-others_percentage))})
    .style('fill', 'black')
}

function compare( a, b ) {
    if ( a[2] < b[2] ){
        return 1;
    }
    if ( a[2] > b[2] ){
        return -1;
    }
    return 0;
}
