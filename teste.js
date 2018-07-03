function get_data(params,sucess){
    url = 'http://localhost:8000/api/getSomething?' + params
    const myRequest = new Request(url, {method: 'GET'});
    fetch(myRequest)
    .then(response => {
        return response.json();
    })
    .then(response =>{
        sucess(response)  
    })
    .catch(error => {
        console.log(error);
    });

};
var createTreemap = (data)=>{
    console.log(data)
    var g = d3.select('svg').attr('width', 300).attr('height', 200).select('g');
    /*var vData = {"name" : "", "info" : "test", "children" : [
        {"name" : "", "children" : [ 
                {"size" : 40,
                "name" : "algo" 
                }, 
                {"size" : 30 ,
                 "name":"outro"
                }
            ] }, 
        {"name" : "", "children" : [ 
                {"size" : 10,
                "name" : "algo2"
                 }, 
                {"size" : 20,
                "name" : "algo3"
                }
        ] }
    ]};*/
      
    var vLayout = d3.treemap().size([300, 200]).paddingOuter(0);

    // Layout + Data
    var vRoot = d3.hierarchy(data).sum(function (d) {console.log(d.valorTotal); return d.valorTotal; });
    var vNodes = vRoot.descendants();
    vLayout(vRoot);
    //var vSlices = g.selectAll('rect').data(vNodes).enter().append('rect');
    var vSlices = g.selectAll('g').data(vNodes).enter().append('g');
    var colors = ['white','#fbb4ae','#decbe4','#fbb4ae','#fbb4ae','#decbe4','#decbe4','#e5d8bd']
    // Draw on screen
    vSlices.append('rect')
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .attr('fill', (d,i) => {return colors[i] })
        .attr('stroke',"white")
        .attr('class',"treeCell");
    vSlices.append('text')
    .attr('x', function (d) { return d.x0 + 10; })
    .attr('y', function (d) { return d.y0 + 15; })
    .attr('width', function (d) { return d.x1 - d.x0; })
    .text((d)=>{return d.data.name})
    .attr("class","span");
    
}

function tree(){
    d3.json('cingapuraTree.txt', function(data){
        createTreemap(data);
    })
}

function createStreamGraph(csvpath, color){
    if (color == "blue") {
        colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
      }
      else if (color == "pink") {
        colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
      }
      else if (color == "orange") {
        //colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
        var colorrange = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494',"#F1EEF6"];
      }
      strokecolor = colorrange[0];
      
      var format = d3.timeFormat("%m/%d/%y");
      
      var margin = {top: 20, right: 40, bottom: 30, left: 30};
      var width = (window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth) - margin.left - margin.right;
      var height = 400 - margin.top - margin.bottom;
      
      var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tip")
      .style("position", "absolute")
      .style("z-index", "20")
      .style("visibility", "hidden");
      
      var x = d3.scaleLinear()
          .range([0, width]);
      
      var y = d3.scaleLinear()
          .range([height-10, 0]);
      
      var z = d3.scaleOrdinal()
          .range(colorrange);
      
      var xAxis = d3.axisBottom(x);
      
      var yAxis = d3.axisLeft(y);
      
      var yAxisr = d3.axisRight(y);
      

/*
    var nest = d3.nest()
          .key(function(d) { return d._id.pais; });*/

      var area = d3.area()
          .x(function(d) {  return x(d.data.mes); })
          .y0(function(d) { return y(d[0]); })
          .y1(function(d) { return y(d[1]); })
          .curve(d3.curveBasis);
      
          /*var area = d3.area()
          .x(function(d) { console.log(d); return x(d.data.mes); })
          .y0(function(d) { return y(d[0]); })
          .y1(function(d) { return y(d[1]); })
          .curve(d3.curveCardinalOpen);*/
      
      var svg = d3.select(".chart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      var graph = d3.json('cingapura.txt', function(data) {
        
        var stack = d3.stack()
        .keys(data.paises)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetSilhouette);

        var layers = stack(data.data);
        console.log(data);
        x.domain([1, 12]);
        y.domain(d3.extent(layers, function(layer) { return d3.max(layer, function(d){ return d[0] + d[1];}); }));

        //console.log(d3.extent(layers, function(layer) { return layer.data.mes;}))
        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", area)
            .style("fill", function(d, i) { return z(i); })
            .style("stroke", '#404040');
      
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
      
      
        svg.selectAll(".layer")
          .attr("opacity", 1)
          .on("mouseover", function(d, i) {
            svg.selectAll(".layer").transition()
            .duration(250)
            .attr("opacity", function(d, j) {
              return j != i ? 0.6 : 1;
          })})
      
          .on("mousemove", function(d, i) {
              
            mousex = d3.mouse(this);
            mousex = mousex[0];
            var invertedx = x.invert(mousex);
            invertedx = Math.round(invertedx);
            console.log(d);
            var selected = (d.data);
            var color = d3.select(this).style('fill');
            /*for (var k = 0; k < selected.length; k++) {
              datearray[k] = selected[k].date
              datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
            }
      
            mousedate = datearray.indexOf(invertedx);
            pro = d.values[mousedate].value;*/
            key = d.key;
            d3.select(this)
            .classed("hover", true)
            .attr("stroke", strokecolor)
            .attr("stroke-width", "0.5px"), 
            tooltip.html( "<div class='month'>" + invertedx + "</div><div class='pais'><div style='background:" + color + "' class='swatch'>&nbsp;</div>" + key + "</div><div class='value'>" + 'R$ ' + d[invertedx-1].data[key]*1000000 + "</div>" ).style("visibility", "visible");
            
          })
          .on("mouseout", function(d, i) {
           svg.selectAll(".layer")
            .transition()
            .duration(250)
            .attr("opacity", "1");
            d3.select(this)
            .classed("hover", false)
            .attr("stroke-width", "1px"), tooltip.html( "<p>" + d.key + "<br>" + "</p>" ).style("visibility", "hidden");
        })
          
        var vertical = d3.select(".chart")
              .append("div")
              .attr("class", "remove")
              .style("position", "absolute")
              .style("z-index", "19")
              .style("width", "1px")
              .style("height", "380px")
              .style("top", "10px")
              .style("bottom", "30px")
              .style("left", "0px")
              .style("background", "#fff");
      
        d3.select(".chart")
            .on("mousemove", function(){  
               mousex = d3.mouse(this);
               mousex = mousex[0] + 5;
               vertical.style("left", mousex + "px" )})
            .on("mouseover", function(){  
               mousex = d3.mouse(this);
               mousex = mousex[0] + 5;
               vertical.style("left", mousex + "px")});
      });
}


//createStreamGraph("teste.json", 'orange');
tree();
//get_data('data="algo"&outra="coisa"',createTreemap)
