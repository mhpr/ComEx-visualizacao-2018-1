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
    var vData = {"name" : "", "info" : "test", "children" : [
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
    ]};
      
    var vLayout = d3.treemap().size([300, 200]).paddingOuter(0);

    // Layout + Data
    var vRoot = d3.hierarchy(vData).sum(function (d) { return d.size; });
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

var createMap = (data)=>{

}

get_data('data="algo"&outra="coisa"',createTreemap)

