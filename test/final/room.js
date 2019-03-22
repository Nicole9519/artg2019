
const dataPromise = d3.csv("./2017.csv", parseData);

Promise.all([dataPromise])
  .then(([housing]) => {

    // const data = transform("8", housing);
    
    // const year = [[8,"haidian"],[2,"xicheng"],[1,"dongcheng"],[4,"changping"]] 
    // console.log(data)

    // render(data);
    
    // const menu = d3.select(".nav")
    //         .append("select");

    // menu.selectAll("option")
    //   .data(year)
    //   .enter()
    //   .append("option")
    //   .attr("value", d => d[0])
    //   .html(d=> d[1]);

    // menu.on("change", function(){

    //   const year = this.value;

    //   const data = transform(year,housing);
      
    //   render(data)

    //  })
    console.log(housing)
  drawHis2(d3.select('.module').node(), housing) 
  })

function drawHis2(rootdom, data){
// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select(".module")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


  // X axis: scale and draw:
  var x = d3.scaleLinear()
      .domain([1, 10])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, width]);
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // set the parameters for the histogram
  var histogram = d3.histogram()
      .value(function(d) { return d.room; })   // I need to give the vector of value
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(10)); // then the numbers of bins

  // And apply this function to data to get the bins
  var bins = histogram(data);

  // Y axis: scale and draw:
  var y = d3.scaleLinear()
      .range([height, 0]);
      y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
  svg.append("g")
      .call(d3.axisLeft(y));
    

  // append the bar rectangles to the svg element
  svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .style("fill", "#69b3a2")



}

function parseData(d){

  return {
    lngLat: [+d.Lng,+d.Lat],
    price: d.price,
    district: d.district,
    tradeTime : d.tradeTime,
    square: d.square,
    room: d.livingRoom
  }

}