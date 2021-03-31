var transitioning;
var treemap, grandparent, treesvg, treex, treey;

function treeMap(options){

    // sets x and y scale to determine size of visible boxes
    treex = d3.scaleLinear()
        .domain([0, options.width])
        .range([0, options.width]);
    treey = d3.scaleLinear()
        .domain([0, options.height])
        .range([0, options.height]);

    treemap = d3.treemap()
            .size([options.width, options.height])
            .paddingInner(0)
            .round(false);

    treesvg = d3.select('#treemap').append("svg")
        .attr("width", options.outerWidth)
        .attr("height", options.outerHeight)
        .append("g")
            .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
            .style("shape-rendering", "crispEdges")

    grandparent = treesvg.append("g")
            .attr("class", "grandparent");
        grandparent.append("rect")
            .attr("y", -options.titlebar)
            .attr("width", options.width)
            .attr("height", options.titlebar);

        grandparent.append("text")
            .attr("x", 6)
            .attr("y", 6 - options.titlebar)
            .attr("dy", ".75em");

    var root = d3.hierarchy(buildData(filtered));
    treemap(root
        .sum(function (d) {
            return d[options.value];
        })
        .sort(function (a, b) {
            return b.height - a.height || b[options.value] - a[options.value]
        })
    );
    display(root, options);
}

function display(d, options) {
    // write text into grandparent
    // and activate click's handler
    grandparent
        .datum(d.parent)
        .on("click", transition)
        .select("text")
        .text(name(d));

    var g1 = treesvg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d.children)
        .enter()
        .append("g");

    // add class and click handler to all g's with children
    g.filter(function (d) {
        return d.children;
    })
        .classed("children", true)
        .on("click", transition);

    g.selectAll(".child")
        .data(function (d) {
            return d.children || [d];
        })
        .enter().append("rect")
        .attr("class", "child")
        .call(rect);

    // add title to parents
    g.append("rect")
        .attr("class", "parent")
        .call(rect)
        .append("title")
        .text(function (d){
            return d.data.name;
        });

    /* Adding a foreign object instead of a text object, allows for text wrapping */
    g.append("foreignObject")
        .call(rect)
        .attr("class", "foreignobj")
        .append("xhtml:div")
        .attr("dy", ".75em")
        .html(function (d) {
            if(d.data.country && d.data.birth){
                return '' +
                '<p class="title"> ' + d.data.name + '</p>' +
                '<p> Popularity: ' + parseFloat(d.data[options.value]).toFixed(2) + '</p>'+
                '<p>' + d.data.birth + '</p>';
            }
            else{
                return '' +
                '<p class="title"> ' + d.data.name + '</p>';
            }
        })
        .attr("class", "textdiv"); //textdiv class allows us to style the text easily with CSS

    function transition(d) {
        if (transitioning || !d) return;
        transitioning = true;
        var g2 = display(d, options_treemap),
            t1 = g1.transition().duration(650),
            t2 = g2.transition().duration(650);

        // Update the domain only after entering new elements.
        treex.domain([d.x0, d.x1]);
        treey.domain([d.y0, d.y1]);
        // Enable anti-aliasing during the transition.
        treesvg.style("shape-rendering", null);
        // Draw child nodes on top of parent nodes.
        treesvg.selectAll(".depth").sort(function (a, b) {
            return a.depth - b.depth;
        });
        // Fade-in entering text.
        g2.selectAll("text").style("fill-opacity", 0);
        g2.selectAll("foreignObject div").style("display", "none");
        /*added*/
        // Transition to the new view.
        t1.selectAll("text").call(text).style("fill-opacity", 0);
        t2.selectAll("text").call(text).style("fill-opacity", 1);
        t1.selectAll("rect").call(rect);
        t2.selectAll("rect").call(rect);
        /* Foreign object */
        t1.selectAll(".textdiv").style("display", "none");
        /* added */
        t1.selectAll(".foreignobj").call(foreign);
        /* added */
        t2.selectAll(".textdiv").style("display", "block");
        /* added */
        t2.selectAll(".foreignobj").call(foreign);
        /* added */
        // Remove the old node when the transition is finished.
        t1.on("end.remove", function(){
            this.remove();
            transitioning = false;
        });
    }
    return g;
}
function text(text) {
    text.attr("x", function (d) {
        return treex(d.x) + 6;
    })
        .attr("y", function (d) {
            return treey(d.y) + 6;
        });
}
function rect(rect) {
    rect
        .attr("x", function (d) {
            return treex(d.x0);
        })
        .attr("y", function (d) {
            return treey(d.y0);
        })
        .attr("width", function (d) {
            return treex(d.x1) - treex(d.x0);
        })
        .attr("height", function (d) {
            return treey(d.y1) - treey(d.y0);
        });
}
function foreign(foreign) { /* added */
    foreign
        .attr("x", function (d) {
            return treex(d.x0);
        })
        .attr("y", function (d) {
            return treey(d.y0);
        })
        .attr("width", function (d) {
            return treex(d.x1) - treex(d.x0);
        })
        .attr("height", function (d) {
            return treey(d.y1) - treey(d.y0);
        });
}
function name(d) {
    return breadcrumbs(d) +
        (d.parent
        ? " -  Click to Here to Zoom Out"
        : " - Choose Domain");
}

function breadcrumbs(d) {
    var res = "";
    var sep = " > ";
    d.ancestors().reverse().forEach(function(i){
        res += i.data.name + sep;
    });
    return res
        .split(sep)
        .filter(function(i){
            return i!== "";
        })
        .join(sep);
}

function buildData(data){

    var results = {name: "Most popular", children: []}
    let domains = [...new Set(data.map(d => d.domain))].sort();

    domains.forEach(function (domain){
       let entry = {name: domain, children: []}
       let ddata = data.filter(d => d.domain === domain);
       let occupations = [...new Set(ddata.map(d => d.occupation))].sort();
       occupations.forEach(function (occupation) {
          var odata = ddata.filter(d => d.occupation === occupation);
          odata = odata.sort((a, b) => (a.HPI < b.HPI) ? 1 : -1);
          let oentry = {
             name: occupation,
             children: odata.slice(0,5)
          }
          entry.children.push(oentry)
       });
       results.children.push(entry)
    });

    return results
}


function updateTree(options){

    if (filtered){
        treesvg.selectAll(".depth").remove()
        var root = d3.hierarchy(buildData(filtered));
        treemap(root
            .sum(function (d) {
                return d[options.value];
            })
            .sort(function (a, b) {
                return b.height - a.height || b[options.value] - a[options.value]
            })
        );

        display(root, options);
    }
}
