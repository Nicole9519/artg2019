const crimePromise = d3.csv("./crimeData.csv",parseData);
//const jsonPromise = d3.json("./bostonNeighborhood.geojson");

var mymap = L.map('mapid').setView([42.349220, -71.061432], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiaGFueWFuZ2RvbmciLCJhIjoiY2phMTdyNTFzM2I2eDJ2cG9kdnNvODk5cyJ9.uPuJ52uDwmZhmxTMVoZhXg'
}).addTo(mymap);

Promise.all([crimePromise])
	.then(([crime])  => {
		
		const data = transform("2015", crime);
		
		const year = [[1,2015],[2,2016],[3,2017],[4,2018]] 

		render(data);
		
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
			
			render(data)

		 })

	
	})


function drawMap(rootDOM,data){

	const W = 960;
	const H = 960;
	//const W = rootDOM.clientWidth;
	//const H = rootDOM.clientHeight;

	const projection = d3.geoMercator()
		.center([ -71.061432,42.349220])
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

	const svg = d3.select(rootDOM)
		.classed("map",true)
		.selectAll("svg")
		.data([1]);
		
	const svgEnter = svg.enter().append("svg");
					
	svg.merge(svgEnter)
		.attr('width', W)
		.attr('height', H)//set width to svg'

	const nodes = svg.merge(svgEnter).selectAll('.node') // selection = 0 
		.data(data, d => d.num); // 234  mismatch
	
	const nodesEnter = nodes.enter().append('g') //append g *234
		.attr('class', 'node');
	// nodesEnter is refering to g 
	nodesEnter.append('circle');

	nodes.merge(nodesEnter)
		.filter(d => d.lngLat)
		
	nodes.merge(nodesEnter)
		.select('circle')
		.attr('r', 4)
		.attr('cx', function(d){ return projection(d.lngLat)[0] })
		.attr('cy', function(d){ return projection(d.lngLat)[1] })
		.style('fill-opacity', .03)
		.style('stroke', d => scaleColor(d.year))
		.style('stroke-width', '1px')
		.style('stroke-opacity', .1);

	
	nodes
		.exit().remove();
}


function transform(year, data){
	const filterData = data.filter(d => d.year === year );

	return filterData;

}

function render(data){

d3.select(".module")
	.each(function(d){
		drawMap(this, data)
	})
	//drawMap(d3.select('.module').node(), data);
}

function parseData(d){
	return {
		lngLat : [d.long, d.lat],
		day : d.day_of_week,
		year: d.year,
		kind: d.offense_code_group,
		num: d.incident_number
	}

}