/* =================================================================
                               Worldmap
   =================================================================
*/

var options_Worldmap,
    data_worldmap;

options_Worldmap = {
  path: './dashboard/files/map.json',
  tileServer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: 'Map data: <a href="http://openstreetmap.org">OSM</a>',
  map: L.map('leafletmap', {"minZoom":2}).setView([0, 0], 2)
}

options_Worldmap.map.on('click', function(e){
    $.ajax({ url:'http://api.geonames.org/countryCodeJSON?lat='+e.latlng.lat+'&lng='+e.latlng.lng+'&username=visualanalytics',
        dataType: "json",
        success: function(data){
            resetFilters()
            $("#country").val("country." + data.countryName);
            filters.country = data.countryName;
            filters.continent = "";
        }
    });
});

categoryField = 'domain', //This is the fieldname for marker category (used in the pie and legend)
iconField = 'domain', //This is the fieldame for marker icon
popupFields = ['name', 'birth', 'occupation','domain', 'hpi'], //Popup will display these fields
rmax = 30 //Maximum radius for cluster pies

d3.json(options_Worldmap.path, function(error, data) {
    if (!error) {
      data_worldmap = data;
      worldMap(options_Worldmap, data);
      renderLegend()
    } else {
        console.log('Could not load data...');
    }
});


/* =================================================================
                              Scatterplot                             
   =================================================================
*/

var scatter = {
    margin: {
        top: 30, right: 20,
        bottom: 30,
        left: 30,
        axis: 15
    },
    legend: {
        width: 20,
        padding: 5,
    },
    plot: {
        xCat: "x",
        yCat: "y",
        colorCat: "hpi",
        labels: {
            "name": "Name",
            "country": "Country",
            "year": "Year of birth"
        }
    },

};

scatter.outerWidth = $('#tab11').width()
scatter.outerHeight = $('#tab11').height()
scatter.width =  scatter.outerWidth - scatter.margin.left - scatter.margin.right;
scatter.width -= scatter.legend.width + 2*scatter.legend.padding + scatter.margin.axis;
scatter.height = scatter.outerHeight - scatter.margin.top - scatter.margin.bottom - scatter.margin.axis;

/* =================================================================
                                Cities                             
   =================================================================
*/

options_cities = {
    margin: {
        top: 40,
        bottom: 30,
        right: 230,
        left: 130
    },
    maxCitiesPlotted: 11,
}

options_cities.outerWidth = $('#tab11').width()
options_cities.outerHeight = $('#tab11').height()*0.90
options_cities.width =  options_cities.outerWidth - options_cities.margin.left - options_cities.margin.right;
options_cities.height = options_cities.outerHeight - options_cities.margin.bottom - options_cities.margin.top;

/* =================================================================
                            Parallel map                             
   =================================================================
*/

var options_parallelMap;
options_parallelMap = {
    dimensions: ["continent", "gender", "domain", "industry"],
    margin: {
        top: 30, right: 20,
        bottom: 30,
        left: 30
    },
}

options_parallelMap.outerWidth = $('#tab11').width()
options_parallelMap.outerHeight = $('#tab11').height()
options_parallelMap.width =  options_parallelMap.outerWidth - options_parallelMap.margin.left - options_parallelMap.margin.right;
options_parallelMap.height = options_parallelMap.outerHeight - options_parallelMap.margin.bottom - options_parallelMap.margin.top;

/* =================================================================
                                Tree map                             
   =================================================================
*/

var options_treemap;
options_treemap = {
    value: "hpi",
    titlebar: 25,
    margin: {
        top: 30, right: 3,
        bottom: 5,
        left: 3
    },
}

options_treemap.outerWidth = $('#tab11').width()
options_treemap.outerHeight = $('#tab11').height()
options_treemap.width =  options_treemap.outerWidth - options_treemap.margin.left - options_treemap.margin.right;
options_treemap.height = options_treemap.outerHeight - options_treemap.margin.bottom - options_treemap.margin.top;

var data, filtered;
d3.csv("./dashboard/files/dataset.csv", function(csv) {
    csv.forEach(function(d) {
        d.x = +d.x;
        d.y = +d.y;
        d.birth = d.birth;
        d.domain = d.domain;
        d.lat = +d.LAT;
        d.lon = +d.LON;
        d.name = d.name;
        d.gender = d.gender;
        d.country = d.country;
        d.continent = d.continent;
        d.occupation = d.occupation;
        d.birthyear = +d.birthyear;
        d.industry = d.industry;
        d.hpi = +d.HPI;
    });

  data = csv;
  filter_data()
  citiesPlot(options_cities);
  scatterPlot(scatter)
  parallelMap(options_parallelMap);
  treeMap(options_treemap);

});
