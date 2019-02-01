
const dataPromise = d3.csv('scatterplotData.csv',parseMetadata);

const main =  document.getElementsByClassName("main");

dataPromise
  .then(data => {
    console.log(data)


    linechart(data, main)

  })



function linechart(data, rootDOM){
//console.log(data)
  const margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


  const color = d3.scaleOrdinal(d3.schemeCategory10);
 
 
  const svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
 
  const plot = svg.append("g")
    .attr("class", "plot")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


  const scaleX = d3.scaleLinear()
                .domain(d3.extent(data, function(d) { return d.sepalWidth; }))
                .range([0, width])
                .nice();// to round number 
  const scaleY = d3.scaleLinear()
                .domain(d3.extent(data, function(d) { return d.sepalLength; }))
                .range([height, 0])
                .nice();

  const xAxis = d3.axisBottom().ticks(8).scale(scaleX);

  const yAxis = d3.axisLeft().scale(scaleY);



  plot.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Sepal Width (cm)");

  plot.append("g")
      .attr("class", "y axis")
      .call(yAxis)
       .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Sepal Length (cm)")

  plot.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d) { return scaleX(d.sepalWidth); })
      .attr("cy", function(d) { return scaleY(d.sepalLength); })
      .style("fill", function(d) { return color(d.species); });

  var legend = svg.selectAll(".legend")
      .data(color.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
};

function parseMetadata(d){
  return {
    sepalLength:  +d.sepalLength,
    sepalWidth : +d.sepalWidth,
    species: d.species
  }
}
 
