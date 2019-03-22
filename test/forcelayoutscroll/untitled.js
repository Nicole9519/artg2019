const dataPromise = d3.csv("./heroes_information.csv");

Promise.all([dataPromise])
  .then(([data]) => {
    console.log(data);


   const nodesdata =  data.forEach(d =>{
    d.x = Math.random()*960;
    d.y = Math.random()*960;
  })
console.log(nodesdata);
   draw(d3.select(".module").node(),data)

    })


  function draw(rootdom,data){


    const margin = {top:32, right:32,left:32,bottom:32};
    const width = 960 - margin.left - margin.right;
    const height = 960 - margin.top - margin.bottom;

var svg = d3.select(rootdom).append("svg")
                                     .attr("width", width)
                                     .attr("height", height);
 
var div = d3.select(".module").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);


 //Draw the Ellipse
 var nodes = svg.selectAll("circle").data(data)


 var nodesEnter = nodes.enter().append("g").attr("class","circle")
 
 nodesEnter.append("circle").attr("fill","green").attr("r", 7);

 const nodesCombined = nodes.merge(nodesEnter);

nodesCombined.attr("transform", d => `translate(${d.x},${d.y})` )
              .on("mouseover", function(d) {    
            div.transition()    
                .duration(200)    
                .style("opacity", 1);    
            div .html(d.name + ' by "' + d.Publisher +'"'  )  
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
            })          
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });



                   
    const force_X = d3.forceX().x(d => {
      if(d.Alignment ==="bad"){
        return width/4
      }else{
        return width*3/4;
      }
      });// similar to our own module
    const force_Y = d3.forceY().y(d => height/2);
    const force_collide = d3.forceCollide(7);

    const simulation = d3.forceSimulation()
      .force("x",force_X)
      .force("y",force_Y)
      .force("collide", force_collide);

    simulation.nodes(data)
      .on("tick", () => {
        //called repeatly 
        //console.log(dataByYear[1])
      nodesCombined
        .attr("transform", d => `translate(${d.x},${d.y})` )

                        
      })
      .restart();

  }
  