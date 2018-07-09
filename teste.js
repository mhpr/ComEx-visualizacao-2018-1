function get_data(path ,params, sucess) {
    url = 'http://localhost:8000'+ path + params
    const myRequest = new Request(url, { method: 'GET' });
    fetch(myRequest)
        .then(response => {
            return response.json();
        })
        .then(response => {
            console.log(response)
            sucess(response)
        })
        .catch(error => {
            console.log(error);
            console.log("aquiiiiiiiii")
        });

};
Number.prototype.formatMoney = function(c, d, t){
    var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "," : d, 
    t = t == undefined ? "." : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

    var width = 960,
        height = 700,
        radius = (Math.min(width, height) / 2) - 10;

    var formatNumber = d3.format(",d");

    var x = d3.scaleLinear()
        .range([0, 2 * Math.PI]);

    var y = d3.scaleSqrt()
        .range([0, radius]);

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var partition = d3.partition();

    var arc = d3.arc()
        .startAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
        .endAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
        .innerRadius(function (d) { return Math.max(0, y(d.y0)); })
        .outerRadius(function (d) { return Math.max(0, y(d.y1)); });


    var svg = d3.select("body").select("#sunBurstDiv").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id","sunBurst")
        .attr("class","inactive")
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

var createSunburst = (data) => {
    console.log("sunBrust")
    svg.attr("class","active")
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    root = d3.hierarchy(data, (d) => d.children)
        .sum((d) => d.valorTotal);
    
    svg.selectAll("path").remove()
    svg.selectAll("path")
        .data(partition(root).descendants())
        .enter().append("path")
        .attr("d", arc)
        .style("stroke", "white")
        .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); })
        .on("click", click)
        .append("title")
        .text(function (d) {if(d.data.valorTotal != undefined) return d.data.name + "\n$ "  + (d.data.valorTotal).formatMoney(2) ;else return d.data.name; });
    
    toggleSunBurst()
}

function click(d) {
    
    svg.transition()
        .duration(750)
        .tween("scale", function () {
            var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                yd = d3.interpolate(y.domain(), [d.y0, 1]),
                yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
            return function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
        })
        .selectAll("path")
        .attrTween("d", function (d) { return function () { return arc(d); }; });
}

d3.select(self.frameElement).style("height", 700 + "px");


function createStreamGraph(DATA) {
    color = "orange"
    if (color == "blue") {
        colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
    }
    else if (color == "pink") {
        colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
    }
    else if (color == "orange") {
        //colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
        var colorrange = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', "#F1EEF6"];
    }
    strokecolor = colorrange[0];

    var format = d3.timeFormat("%m/%d/%y");

    var margin = { top: 20, right: 40, bottom: 30, left: 30 };
    var width = (window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth) - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
    
    d3.select("#streamGraphDiv").selectAll(".tip").remove()
    var tooltip = d3.select("#streamGraphDiv")
        .append("div")
        .attr("class", "tip")
        .style("z-index", "20")
        .style("visibility", "hidden");

    var x = d3.scaleLinear()
        .range([0, width]);

    var y = d3.scaleLinear()
        .range([height - 10, 0]);

    var z = d3.scaleOrdinal()
        .range(colorrange);

    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y);

    var yAxisr = d3.axisRight(y);


    /*
        var nest = d3.nest()
              .key(function(d) { return d._id.pais; });*/

    var area = d3.area()
        .x(function (d) { return x(d.data.mes); })
        .y0(function (d) { return y(d[0]); })
        .y1(function (d) { return y(d[1]); })
        .curve(d3.curveBasis);

    var svg = d3.select("#streamGraphDiv").select(".chart").append("svg")
        .attr("id","StreamView")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g");

        var stack = d3.stack()
            .keys(DATA.paises)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetDiverging);

        var layers = stack(DATA.data);
        
        console.log(layers)
        console.log(d3.extent(layers, function (layer) { return d3.min(layer, function (d) { return d[0]+d[1]; }); }));
        
        x.domain(d3.extent(DATA.data, function(d){return d.mes}));
        y.domain([0, d3.max(layers, function (layer) { return d3.max(layer, function (d) { return d[0] + d[1]; }); })]);

        //console.log(d3.extent(layers, function(layer) { return layer.data.mes;}))
        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", area)
            .style("fill", function (d, i) { return z(i); })
            .style("stroke", '#404040');

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);


        svg.selectAll(".layer")
            .attr("opacity", 1)
            .on("mouseover", function (d, i) {
                svg.selectAll(".layer").transition()
                    .duration(250)
                    .attr("opacity", function (d, j) {
                        return j != i ? 0.6 : 1;
                    })
            })
            
            .on("click", function(d, i) {
                mousex = d3.mouse(this);
                mousex = mousex[0]+5;
                var invertedx = x.invert(mousex);
                invertedx = Math.round(invertedx);
                key = d.key;
                if (d.key == "outros"){
                    param = '&tpr=10'
                }else{
                    param = '&pais=' + d.key
                }               
                
                document.getElementById("StreamView").remove()
                toggleStreamMap()
                toggleSunBurst()
                get_data("/api/getStreamMap?",param,createStreamGraph)
                get_data("/api/getTreeMap?",param,createSunburst)
                
            })
            .on("mousemove", function (d, i) {

                mousex = d3.mouse(this);
                mousex = mousex[0];
                var invertedx = x.invert(mousex);
                invertedx = Math.round(invertedx);
                console.log(d);
                var selected = (d.data);
                var color = d3.select(this).style('fill');
        
                key = d.key;
                d3.select(this)
                    .classed("hover", true)
                    .attr("stroke", strokecolor)
                    .attr("stroke-width", "0.5px"),
                    tooltip.html("<div class='month'>" + invertedx + "</div><div class='pais'><div style='background:" + color + "' class='swatch'>&nbsp;</div>" + key + "</div><div class='value'>" + 'US$ ' + (d[invertedx - 1].data[key] * 1000000).formatMoney(2) + "</div>").style("visibility", "visible");

            })
            .on("mouseout", function (d, i) {
                svg.selectAll(".layer")
                    .transition()
                    .duration(250)
                    .attr("opacity", "1");
                d3.select(this)
                    .classed("hover", false)
                    .attr("stroke-width", "1px"), tooltip.html("<p>" + d.key + "<br>" + "</p>").style("visibility", "hidden");
            })

        toggleStreamMap()

}

function mountFilter(params){
    filter = ""
    filter = filter + "&lte=" + document.getElementsByName("monthlte")[0].value
    filter = filter + "&gte=" + document.getElementsByName("monthgte")[0].value
    var aggregationElem = document.getElementsByName("aggregation")
    var aggregation = ""
    for(var i = 0 ; i < aggregationElem.length; i++){
        if (aggregationElem[i].checked){
            aggregation = aggregationElem[i].value
        }
    }
    if (aggregation != "none"){
        filter = filter + "&" + aggregation + "=" + document.getElementsByName("valorTop")[0].value
    }else{
        var paisesElem = document.getElementsByName("pais")
        var paises = []
        for(var i = 0 ; i < paisesElem.length; i++){
            if (paisesElem[i].checked){
                paises.push(paisesElem[i].value)
            }
        }
        if (paises.length > 0){
            filter = filter + "&pais="
            for(var i = 0 ; i < paises.length ; i++){
                filter = filter + paises[i];
                if(i !== paises.length -1){
                    filter = filter + "||";
                }
            }
        }
    }
    
    toggleStreamMap()
    toggleSunBurst()
    document.getElementById("StreamView").remove()
    get_data("/api/getStreamMap?",filter,createStreamGraph)
    get_data("/api/getTreeMap?",filter,createSunburst)
}

function paisCheckBoxMount(DATA) {
    var drpcont = d3.select(".checkbox-content");
    drpcont.selectAll("input").remove()
    for(var i =  0; i < DATA.length; i++){
        drpcont.append("input")
        .attr("type", "checkbox")
        .attr("name", "pais")
        .attr("value", DATA[i]);
        drpcont.append("label")
        .text(DATA[i])
        drpcont.append("br");

    } 
}
function toggleCheckbox() {
    var x = document.getElementsByClassName("checkbox-content");
    var y = document.getElementsByClassName("drop1");
    if (x[0].style.display === "none") {
        x[0].style.display = "block";   
        y[0].innerHTML = "Hide"
    } else {
        x[0].style.display = "none";
        y[0].innerHTML = "Show"
    }
    
}

function toggleaggregation() {
    var x = document.getElementsByClassName("aggregation-content");
    var y = document.getElementsByClassName("drop2");
    if (x[0].style.display === "none") {
        x[0].style.display = "block";   
        y[0].innerHTML = "Hide"
    } else {
        x[0].style.display = "none";
        y[0].innerHTML = "Show"
    }
    
}

function toggleMonth() {
    var x = document.getElementsByClassName("month-content");
    var y = document.getElementsByClassName("drop3");
    if (x[0].style.display === "none") {
        x[0].style.display = "block";   
        y[0].innerHTML = "Hide"
    } else {
        x[0].style.display = "none";
        y[0].innerHTML = "Show"
    }
    
}

function toggleSunBurst() {
    console.log("aqui1");
    var x = document.getElementById("streamGraphDiv");
    console.log(x.style.display)
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
    
}

function toggleStreamMap() {
    console.log("aqui2");
    var x = document.getElementById("sunBurstDiv");
    console.log(x.style.display)
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
    
}

get_data("/api/getPaises",'',paisCheckBoxMount)
get_data("/api/getStreamMap?",'&tpa=10',createStreamGraph)
get_data("/api/getTreeMap?",'&tpa=10',createSunburst)

//get_data("/api/getStreamMap?",'&tpa=10',createStreamGraph)
//createStreamGraph("teste.json", 'orange');
//tree();
//get_data('data="algo"&outra="coisa"',createTreemap)


