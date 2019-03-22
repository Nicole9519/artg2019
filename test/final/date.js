const dataPromise = d3.csv("./2017.csv", parseData);
const districtPromise = d3.csv("./district.csv", parseDistrictData);


Promise.all([dataPromise,districtPromise])
  .then(([housing,district]) => {

    const data = transform("08", housing);
    console.log(housing)
    render(data);
    
    const menu = d3.select(".nav")
            .append("select");

    menu.selectAll("option")
      .data(district)
      .enter()
      .append("option")
      .attr("value", d => d.code)
      .html(d=> d.name);

    menu.on("change", function(){

      const code = this.value;

      const data = transform(code,housing);
      
      render(data)

     })
  })


function drawHis(rootdom,data){
    const margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
  const svg = d3.select(rootdom)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  const parseDate = d3.timeParse("%m/%d/%Y")

  const formatTime = d3.timeFormat("%m");
  
  // X axis: scale and draw:
  const x = d3.scaleTime()
              .domain([new Date(2017, 0, 1), new Date(2018, 0, 1)])
              .rangeRound([0, width]);

  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // set the parameters for the histogram
  const histogram = d3.histogram()
      .value(d => parseDate(d.tradeTime))   // I need to give the vector of value
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(d3.timeMonth));// then the numbers of bins

  // And apply this function to data to get the bins
  const bins = histogram(data);

  // Y axis: scale and draw:
  const y = d3.scaleLinear()
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
    tradeTime : d.tradeTime
  }
}


function transform(district, data){
  const filterData = data.filter(d => d.district === district );

  return filterData;

}

function render(data){

  d3.select('.module')
    .each(function(){
      drawHis(
        this,
        data
      );
    });
}


function parseDistrictData(d){
  return {
     name: d["Name"],
     code: d["Division code[1]"].slice(-2),
     area: d["Area (km_)"],
     population: d["Population (2017_"]
  }
}

