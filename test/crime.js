const crimePromise = d3.csv("./crimeData.csv",parseData);
//const jsonPromise = d3.json("./bostonNeighborhood.geojson");

Promise.all([crimePromise])
	.then(([crime])  => {
		console.log(crime);

		drawMap(d3.select('.module').node(), crime);
	})


function drawMap(rootDOM,data){

	const W = 640;
	const H = 960;
	//const W = rootDOM.clientWidth;
	//const H = rootDOM.clientHeight;

	const projection = d3.geoMercator()
		.center([42.363602, -71.056408])
		.translate([W/2, H/2])
		.scale(90000);

	//const scaleSize = d3.scaleSqrt().domain([0,1000000]).range([5,50]);

	const plot = d3.select(rootDOM)
		.append('svg')
		.attr('width', W)
		.attr('height', H)//set width to svg'
		.append('g'); // plot is refering to g 
//>???
	const nodes = plot.selectAll('.node') // selection = 0 
		.data(data, d => d.key); // 234  mismatch
	
	const nodesEnter = nodes.enter().append('g') //append g *234
		.attr('class', 'node');

	nodesEnter.append('circle');

	nodes.merge(nodesEnter)
		.filter(d => d.latLng)
		.attr('transform', d => {
			const xy = projection(d.latLng);
			return `translate(${xy[0]}, ${xy[1]})`;
		})
	nodes.merge(nodesEnter)
		.select('circle')
		.attr('r', 3)
		.style('fill-opacity', .03)
		.style('stroke', '#000')
		.style('stroke-width', '1px')
		.style('stroke-opacity', .2)
	
	
}

function parseData(d){
	return {
		latLng : [d.lat, d.long],
		day : d.day_of_week,
		year: d.year,
		kind: d.offense_code_group
	}

}