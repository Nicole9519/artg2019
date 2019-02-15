const appPromise = d3.json("./app.json", parseData)
const markerPromise = d3.json("./marker.json")

Promise.all(([appPromise,markerPromise]))
	.then(([app, marker]) => {
		
		const rootDOM = d3.select(".module").node();

		drawChart(rootDOM,app)
	

	})


function drawChart(rootDOM,data){

	const W = rootDOM.clientWidth;
	const H = rootDOM.clientHeight;
	const m = {t: 32, l:32, r:32, b:32};

	var parseTime = d3.timeParse("%Y-%m-%d");

	const extent = d3.extent(data, d => parseTime(d.date))

	const scaleX = d3.scaleTime()
					.domain(extent)
					.range([0, W - m.l - m.r])

	const scaleY = d3.scaleLinear()
					.domain([0,15000])
					.range([H - m.t -m.b, 0])

	const xAxis = d3.axisBottom().scale(scaleX);
	const yAxis = d3.axisLeft().scale(scaleY)
					.tickSize(-W)
					.ticks(5,"s");

	const lineGenerator = d3.line()
							.curve(d3.curveCardinal)
							.x(d => scaleX(parseTime(d.date)))
							.y(d => scaleY(d.pct50));

	const areaGenerator1 = d3.area()
							.curve(d3.curveCardinal)
							.x(d => scaleX(parseTime(d.date)) || 1)
							.y0(d=> scaleY(d.pct05))
							.y1(d => scaleY(d.pct25))

	const areaGenerator2 = d3.area()
							.curve(d3.curveCardinal)
							.x(d => scaleX(parseTime(d.date))|| 1)
							.y0(d=> scaleY(d.pct25))
							.y1(d => scaleY(d.pct75))

	const areaGenerator3 = d3.area()
							.curve(d3.curveCardinal)
							.x(d => scaleX(parseTime(d.date)) || 1)
							.y0(d=> scaleY(d.pct75))
							.y1(d => scaleY(d.pct95))


	const svg = d3.select(rootDOM)
				.append("svg")
				.attr("width", W)
				.attr("height", H)

	const plot = svg.append("g")
				.attr("class","plot")
				.attr("transform", `translate(${m.l}, ${m.t})`)


	plot.append("path")
		.attr("class","area1")
		.datum(data)
		.attr("d", d=> areaGenerator1(data))
		.style("fill","rgba(230, 230, 255, 0.8)")
		.style("stroke", "rgba(216, 216, 255, 0.8)")

	plot.append("path")
		.attr("class","area2")
		.datum(data)
		.attr("d", d => areaGenerator2(data))
		.style("fill","rgba(127, 127, 255, 0.8)")
		.style("stroke", " rgba(96, 96, 255, 0.8)")


	plot.append("path")
		.attr("class","area2")
		.datum(data)
		.attr("d", d => areaGenerator3(data))
		.style("fill","rgba(230, 230, 255, 0.8)")
		.style("stroke", "rgba(216, 216, 255, 0.8)")

	plot.append("path")
		.attr("class","line")
		.datum(data)
		.attr("d", d => lineGenerator(data))
		.style("fill","none")
		.style("stroke", "#333")
		.style("stroke-width", 3)

	plot.append("g")
		.attr("class","axis xAxis")
		.attr("transform", `translate(0,${H - m.t- m.b})`)
		.call(xAxis)

	plot.append("g")
		.attr("class","axis yAxis")
		.attr("transform",`translate(0,0)`)
		.call(yAxis)

}


function drawmarker(rootDOM, data){

	const svg = d3.select(rootDOM)
				.append("svg")
				.attr("width", W)
				.attr("height", H)

	const plot = svg.append("g")
				.attr("class","plot")
				.attr("transform", `translate(${m.l}, ${m.t})`)

	plot.append("circle")
		.datum(data)
		.attr("r", 30)
		.attr("x", d => parseTime(d.date))
		.attr("y", "30" )




}


function parseData(){
	return {
		date : parseTime(d.date),
		pct25: d.pct25,
		pct05: d.pct05,
		pct75: d.pct75,
		pct95: d.pct95

	}
}
