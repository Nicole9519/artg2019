const dataPromise = d3.csv("./Public_Schools.csv", parseData)

Promise.all([dataPromise])
	.then(([data]) => {

	console.log(data)
		drawMap(d3.select(".module").node(), data)

	})

function drawMap(rootDOM,data){

	const W = rootDOM.clientWidth;
	const H = rootDOM.clientHeight;
	const m = {t:32,r:32,b:32,l:32};

	const colorScale = d3.scaleOrdinal().range([
				 //red
		
		'#00a651',
		'#EE7785', //green
		'#C89EC4',
		"#C5C6B6",
		"#AACD6E",
		"#AF4034"
	])
	.domain([,"ES","HS","K-12","K-8","Others","Special"])

	const lngLatBOS = [-71.057083,42.361145];
	const projection = d3.geoMercator()
		.center(lngLatBOS)
		.translate([W/2, H/6])
		.scale(120000);

	const plot = d3.select(rootDOM)
					.append("svg")
					.attr("class","plot")
					.attr("width", W)
					.attr("height", H);


	const nodes = plot.selectAll(".node")
		.data(data)
		.enter()
		.append("circle")
		.attr("class","node")
		.attr("r",20)
		.attr('transform', d => {
			const xy = projection(d.lngLat);
			return `translate(${xy[0]}, ${xy[1]})`;
		})
		.style("fill-opacity",0.8)
		.style("fill", d => colorScale(d.type))
		

	const scaleSize = d3.scaleSqrt().domain([1,4]).range([1,4]);
	const force_X = d3.forceX().x(d => W/2);// similar to our own module
	const force_Y = d3.forceY().y(d => H/2);
	const force_collide = d3.forceCollide(d => scaleSize(d.tlt) +50);

	const simulation = d3.forceSimulation()
		.force("x",force_X)
		.force("y",force_Y)
		.force("collide", force_collide);

	simulation.nodes(data)
		.on("tick", () => {
			//called repeatly 
			//console.log(dataByYear[1])
			nodes
				.attr("transform",  d => {
			const xy = projection(d.lngLat);
			return `translate(${xy[0]}, ${xy[1]})`;
		});
		})
		.restart();


}


function parseData(d){

	return {
		lngLat: [+d.X,+d.Y],
		name : d.SCH_NAME,
		city:d.CITY,
		type :d.SCH_TYPE,
		address:d.ADDRESS,
		website:d.website,
		intro:d.intro,
		year:d.year,
		tlt:+d.TLT
	}
}
