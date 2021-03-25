function filter_data() {
    if (data){
        activeFilters = Object.entries(findActiveFilters());
        filtered = data.filter(function(d) {
            var value = true;
            if (activeFilters.length) {
                activeFilters.forEach(filter => {
                      let [x, y] = filter
                      value *= d[x].includes(y)
                });
            }
            value *= filters.hpi_min < d.hpi
            value *= d.hpi < filters.hpi_max

            return value;
        });
    }
}

function populateDropdown(filename) {
    d3.json(filename, function(error, data) {
        for (var key1 in data) {
            if (key1 !== "domainCountries" && key1 !== "occupationCountries") {

                let selector = document.getElementById(key1)

                var all = document.createElement("option");
                all.value = "";
                all.textContent = "All"
                all.selected = true;
                selector.appendChild(all);

                for (var d in data[key1]) {
                    let key2 = data[key1][d]
                    var el = document.createElement("option");

                    if (key2.domain)
                        el.value = key2.domain + "." + key2.type + "." + key2.value;
                    else
                        el.value = key2.type + "." + key2.value;

                    if (key2.order == 1) {
                        el.textContent = key2.value;
                    } else {
                        el.textContent = "\xA0\xA0\xA0" + key2.value;
                    }
                    selector.appendChild(el);
                }
            }
        }

        GlobalDomain = []
        for (i in data.domain){
            GlobalDomain.push(data.domain[i].value)
        }

        GlobalOccupation = []
        for (i in data.occupation){
            GlobalOccupation.push(data.occupation[i].value)
        }

        GlobalDomainCountries = data.domainCountries
        GlobalOccupationCountries = data.occupationCountries

    });
}


function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    // to register more listeners for same event type, 
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for mult. svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        //var targetWidth = parseInt(container.style("width"));
        var targetWidth = svg.node().getBoundingClientRect().width;

        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}

function sortObject(o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

function summarize(data, key){
    var counts = [];
    data.forEach(function(d){
        var name = d[key];
        if (!(counts.includes(name))) {
            counts.push(name)
        }
    })
    return counts.sort()
}

