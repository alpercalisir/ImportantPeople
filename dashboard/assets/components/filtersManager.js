/* =================================================================
                                 Filters                             
   =================================================================
*/

var GlobalMinHPI = 9,
    GlobalMaxHPI = 32;

var hpi_min = GlobalMinHPI,
    hpi_max = GlobalMaxHPI;

var filters = {
    continent: "",
    country: "",
    domain: "",
    occupation: "",
    hpi_min: GlobalMinHPI,
    hpi_max: GlobalMaxHPI
}

populateDropdown("./dashboard/files/fields.json");


// https://slawomir-zaziablo.github.io/range-slider/
var mySlider = new rSlider({
    target: '#slider',
    values: {min: GlobalMinHPI, max: GlobalMaxHPI},
    step: 1,
    scale: false,
    labels: false,
    range: true, // range slider
    onChange: function(values){
        if(data !== undefined) {
            filters.hpi_min = parseInt(values.split(',')[0])
            filters.hpi_max = parseInt(values.split(',')[1])
            filter_data()
            updatePlots()
        }
    }
});

$("#sliderScaleSpanLeft").html(GlobalMinHPI);
$("#sliderScaleSpanRight").html(GlobalMaxHPI);


function resetFilters(){

    $('#domain option').eq(0).prop('selected', true);
    $('#occupation option').eq(0).prop('selected', true);
    $('#country option').eq(0).prop('selected', true);
    mySlider.setValues(GlobalMinHPI, GlobalMaxHPI);

    filters = {
        continent: "",
        country: "",
        domain: "",
        occupation: "",
        hpi_min: GlobalMinHPI,
        hpi_max: GlobalMaxHPI
    }

    filter_data()
    updatePlots()

}


$("#domain").change(
    function(){
        $("#occupation option").show()
        $("#country option").show()

        if ($("#domain").val() == "") {
            filters.domain = ""
        } else {
            filters.domain = $("#domain").val().split(".")[1]
        }
        $("#occupation option").each(function() {
            if (this.value.split(".")[0].indexOf(filters.domain) < 0 && this.value !== "")
                $(this).hide();
        });

        if(GlobalDomainCountries[filters.domain] != null) {
            $("#country option").each(function () {
                country = this.value.split(".")[1]

                if (GlobalDomainCountries[filters.domain].indexOf(country) < 0 && this.value !== "")
                    $(this).hide();
            });
        }
        else{
            $("#occupation option").show()
        }
    }
)

$("#country").change(
    function () {
        let selected = $("#country").val()
        filters.continent = ""
        filters.country = ""
        if (selected != ""){
            [key, value] = selected.split(".")
            if (key == "continent") {
                filters.continent = value;
            } else {
                filters.country = value;
            }
        }
    }
)

$("#occupation").change(
    function() {
        $("#domain option").show()
        $("#country option").show()

        if($("#occupation").val() == "") {
            filters.occupation = ""
            //$('#domain option').eq(0).prop('selected', true);
            //$('#country option').eq(0).prop('selected', true);
        }
        else {
            $("#domain").val("domain." + $("#occupation").val().split(".")[0])
            filters.domain = $("#domain").val().split(".")[1]

            filters.occupation = $("#occupation").val().split(".")[2]
            $("#country option").each(function() {
                country = this.value.split(".")[1]
                if (GlobalOccupationCountries[filters.occupation].indexOf(country) < 0 && this.value !== "")
                    $(this).hide();
            });
        }
    }
)

$(".filter").change(
    function(){
        filter_data()
        updatePlots()
    }
)

function findActiveFilters() {
  let active_filters = {};
  Object.entries(filters)
      .filter(([, value]) => typeof value == "string")
      .filter(([, value]) => value !== "")
      .forEach(([key, value]) => (active_filters[key] = value));
  return active_filters 
}

function updatePlots(){

    updateWorldMap(options_Worldmap)
    citiesPlot(options_cities);
    updateScatter()
    updateParallelMap(options_parallelMap);
    updateTree(options_treemap);

}

