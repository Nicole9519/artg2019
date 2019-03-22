const dataPromise = d3.csv("./heroes_information.csv", parseData);

Promise.all([dataPromise,districtPromise])
  .then(([housing, district]) => {

   

    })


  function draw(rootdom,data){

    const margin = {top:32, right:32,left:32,bottom:32};
    const width = 960 - margin.left - margin.right;
    const height = 960 - margin.top - margin.bottom;

    const svg = d3.select(rootdom)
      .append("svg")
      .attr("width",width)
      .attr("height",height)
      .append("g")
      .attr("transform",`translate(${margin.left},${margin.top})`)

    const circle = svg.enter()
            .data(data)
            .append("circle")
            .attr("class","circle")
            .attr("r",20)
            .attr("cx",width/2)
            .attr("cy",height/2);

  }