const dataPromise = d3.csv("./new.csv", parseData);

const districtPromise = d3.csv("./district.csv", parseDistrictData)

Promise.all([dataPromise,districtPromise])
	.then(([housing, district]) => {
		const parseDate = d3.timeParse("%Y-%m-%d")

		const formatTime = d3.timeFormat("%Y");
    
	
		const data = d3.nest()
					.key(d => formatTime(parseDate(d.tradeTime)))
					.entries(housing)

		const data_com = data.filter(d => d.key === "2012" || d.key === "2013" || d.key === "2014" || d.key === "2015" || d.key === "2016" || d.key === "2017")
		console.log(data_com)
		render(data_com);
		//add some text later
		
	})



function drawMap(rootDOM,data){

	const W = rootDOM.clientWidth;
	const H = rootDOM.clientHeight;
	const m = {t:32,r:32,b:32,l:32};

	const colorScale = d3.scaleLinear().range([
				 //red
		
		'#FFFFFF',
		"#AF4034"
	])
	.domain([10000,100000]);

	const lngLatBNG = [116.405609,39.896948];

	const projection = d3.geoMercator()
		.center(lngLatBNG)
		.translate([W/2, H/2])
		.scale(30000);

	// const path = d3.geoPath()
 //  		.projection(projection)

	const svg = d3.select(rootDOM)
					.classed("map", true)
					.selectAll("svg")
					.data([1])

	const svgEnter = svg.enter().append("svg");


	svg.merge(svgEnter)
					.attr("width", W)
					.attr("height", H);

	const parseDate = d3.timeParse("%Y-%m-%d")

	const formatTime = d3.timeFormat("%Y");
    
	const text = svg.merge(svgEnter)
						.select("text")
                        .data(data)
                        .enter()
                        .append("text");

//Add SVG Text Element Attributes
	var textLabels = text
           		 .attr("x",W/2)
                 .attr("y", H/2)
                 .text(d => formatTime(parseDate(d.tradeTime)))
                 .attr("font-family", "sans-serif")
                 .attr("font-size", "20px")
                 .attr("fill", "black");


	const nodes = svg.merge(svgEnter).selectAll(".node")
		.data(data);

	const nodesEnter = nodes
		.enter()
		.append("g")
		.attr("class","node");

	nodesEnter.append("circle");

	nodes.merge(nodesEnter)
		.select("circle")
		.attr("r",3)
		.attr('transform', d => {
			const xy = projection(d.lngLat);
			return `translate(${xy[0]}, ${xy[1]})`;
		})
		.style("fill-opacity",0.5)
		.style("fill", d => colorScale(d.price))
		// .style("fill", d => {
		// 	const district1 = data.filter(d=> d.district === 8);
		// 	return 
		// })
		// .on("mouseenter", function(d) {
		// 		    d3.select(this)
		// 		    .attr("r","6")
		// 		    .attr("fill","red")
				    

		// 		    d3.select("#tooltip")
		// 				.transition()
		// 				.style("opacity",1)
		// 				.style("stroke","black");
				    
		// 		    console.log(d.intro)
		// 		    d3.select("#name").text(d.name);
		// 		    d3.select("#district").text("District: " + d.city)
		// 		    d3.select("#type").text("Type: " + d.type);
		// 		    d3.select("#year").text("Year: " + d.year);
		// 		    d3.select("#summary").text(d.intro);
		// 		    d3.select("#story-link").attr("href", d.website).html("Click here to view the website.");
				    
		// 		})
		// .on("mouseleave", function(d) {
		// 	    d3.select(this)
		// 		      .attr("r", "3")
		// 		      .attr("fill", "grey")
		// 		      .attr("class", "points")
		// 		      .attr("opacity",0.75);
		// });

		nodes.exit().remove()



}


function transform(year, data){

	const parseDate = d3.timeParse("%Y-%m-%d")

	const formatTime = d3.timeFormat("%Y");
    
	const filterData = data.filter(d => formatTime(parseDate(d.tradeTime)) === year );

	return filterData;

}

function render(data){


	const charts = d3.select('.module')
		.selectAll(".chart")
		.data(data, d => d.key)

	const chartsEnter = charts.enter()
		.append("div")
		.attr("class","chart")

	charts.exit().remove();

	charts.merge(chartsEnter)
		.each(function(d){
			drawMap(
				this,
				d.values);
		});


}


function parseData(d){

	return {
		lngLat: [+d.Lng,+d.Lat],
		price: d.price,
		district: d.district.padStart(2,"0"),
		tradeTime: d.tradeTime
	}
}

function parseDistrictData(d){
	return {
		 name: d["Name"],
		 code: d["Division code[1]"].slice(-2),
		 area: d["Area (km_)"],
		 population: d["Population (2017_"]
	}
}