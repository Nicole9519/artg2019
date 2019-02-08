const crimePromise = d3.csv("./crimeData.csv",parseData);
//const jsonPromise = d3.json("./bostonNeighborhood.geojson");

Promise.all([crimePromise])
	.then(([crime])  => {
		//console.log(crime);

		const data = transform("2015", crime);
		
		const chart = d3.select(".module").node()
	
		drawMap(chart, data);

		const year = [[1,2015],[2,2016],[3,2017],[4,2018]] 
	
		//console.log(year);
		const menu = d3.select(".nav")
						.append("select");

		menu.selectAll("option")
			.data(year)
			.enter()
			.append("option")
			.attr("value", d => d[1])
			.html(d=> d[1]);

		menu.on("change", function(){

			const year = this.value;

			const data = transform(year,crime);
			
			const chart = d3.select(".module").node()
			
			drawMap(chart,data);


		 })

	
	})


function drawMap(rootDOM,data){

	const W = 960;
	const H = 960;
	//const W = rootDOM.clientWidth;
	//const H = rootDOM.clientHeight;

	const projection = d3.geoMercator()
		.center([42.349220, -71.061432])
		.translate([W/2, H/2])
		.scale(80000);

	const scaleColor = d3.scaleOrdinal().range([
		'#f26633', //red
		'blue',
		'#00a651', //green
		'yellow'
	])
	.domain(["2015","2016","2017","2018"])
	//const scaleSize = d3.scaleSqrt().domain([0,1000000]).range([5,50]);

	const plot = d3.select(rootDOM)
		.append('svg')
		.attr('width', W)
		.attr('height', H)//set width to svg'
		.append('g'); // plot is refering to g 
//>???
	const nodes = plot.selectAll('.node') // selection = 0 
		.data(data, d => d.num); // 234  mismatch
	
	const nodesEnter = nodes.enter().append('g') //append g *234
		.attr('class', 'node');

	nodesEnter.append('circle');

	nodes.merge(nodesEnter)
		.filter(d => d.latLng)
		
	nodes.merge(nodesEnter)
		.select('circle')
		.attr('r', 5)
		.attr('cx', function(d){ return projection(d.latLng)[0] })
		.attr('cy', function(d){ return projection(d.latLng)[1] })
		.style('fill-opacity', .03)
		.style('stroke', d => scaleColor(d.year))
		.style('stroke-width', '1px')
		.style('stroke-opacity', .2);

	
	nodes.merge(nodesEnter)
		.exit().remove()
}


function transform(year, data){
	const filterData = data.filter(d => d.year === year );

	return filterData;

}

// function render(data){
// 	const chart = d3.select(".module")
// 						.selectAll(".chart")
// 						.data(data);

// 	const chartEnter = chart.enter().append("div").attr("class","chart");
// 	chart.exit().remove()

// 	chart.merge(chartEnter)
// 		.attr("d", function(d){ drawMap(this,data) })

// 	//drawMap(d3.select('.module').node(), data);
// }

function parseData(d){
	return {
		latLng : [d.lat, d.long],
		day : d.day_of_week,
		year: d.year,
		kind: d.offense_code_group,
		num: d.incident_number
	}

}