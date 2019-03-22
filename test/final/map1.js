const dataPromise = d3.csv("./2011.csv", parseData);
const districtPromise = d3.csv("./district.csv", parseDistrictData)

Promise.all([dataPromise,districtPromise])
	.then(([housing, district]) => {

		const housing_tem = d3.nest()
					.key(d => d.district)
					.entries(housing);

					//console.log(housing_tem)

		const data = transform("08", housing);
		console.log(district)
		console.log(housing)
		render(data);
		//add some text later
		const menu = d3.select(".nav")
						.append("select");

		menu.selectAll("option")
			.data(district)
			.enter()
			.append("option")
			.attr("value", d => d.code)
			.html(d=> d.name);

		menu.on("change", function(){

			const year = this.value;

			const data = transform(year,housing);
			
			render(data)

		 })

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
		.translate([W/4, H/4])
		.scale(40000);

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


function transform(district, data){
	const filterData = data.filter(d => d.district === district );

	return filterData;

}

function render(data){

	d3.select('.module')
		.each(function(){
			drawMap(
				this,
				data
			);
		});
}


function parseData(d){

	return {
		lngLat: [+d.Lng,+d.Lat],
		price: d.price,
		district: d.district.padStart(2,"0")
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