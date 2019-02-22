import * as d3

function Linechart(data, rootDOM){

	const W = rootDOM.clientWidth;
	const H = rootDOM.clientHeight;
	const m = {t:32,l:32,b:32,r:32};
	const w = W - m.l - m.r;
	const h = H - m.t - m.b;

	const scaleX = d3.scaleLinear()
					.domain([1985,2020])
					.range([0, w])

	const scaleY = d3.scaleLinear()
					.domain([0, max])
					.range([h,0])

	const axisX = d3.axisBottom()
					.scale(scaleX);

	const axisY = d3.axisLeft()
					.scale(scaleY);

	const lineGenerator = d3.line()
							.x(d => scaleX(d.key))
							.y(d => scaleY(d.value));

	const areaGenerator = d3.area()
							.x(d => scaleX(d.key))
							.y0(h)
							.y1(d => scaleY(d.value));

	const svg = d3.select(rootDOM)
				.selectAll("svg")
				.attr("class","svg")
				.data([1])

	const svgEnter = svg.enter()
						.append("svg")

	svg.merge(svgEnter)
		.attr("width",w)
		.attr("height",h)

	const plotEnter = svgEnter.append("g")
							.attr("class","plot")
							.attr("transform",`translate(${m.l},${m.t})`);

	plotEnter.append("path")
			.attr("class","line")
			.style('fill','none')
			.style('stroke','#333')
			.style('stroke-width','2px')
	plotEnter.append('path')
			.attr('class','area')
			.style('fill-opacity',0.03)
	plotEnter.append('g')
			.attr('class','axis axis-x')
			.attr('transform',`translate(0, ${innerHeight})`)
	plotEnter.append('g')
			.attr('class','axis axis-y')

	const plot = svg.merge(svgEnter).select(".plot")

	plot.select(".line")
		.datum(data)
		.transition()
		.attr("d", d => lineGenerator(d))
	plot.select('.area')
		.datum(data)
		.transition()
		.attr('d', data => areaGenerator(data))
	plot.select('.axis-x')
		.transition()
		.call(axisX)
	plot.select('.axis-y')
		.transition()
		.call(axisY);

	const tooltipEnter = plotEnter.append("g")
								.attr("class","tool-tip")
								.style("opacity",0)

	tooltipEnter.append("circle")
				.attr("r",3)
	tooltipEnter.append("text")
				.attr("text-anchor","middle")
				.attr("dy", -10)

	plotEnter.append("rect")
			.attr("width",w)
			.attr("height",h)
			.attr("class","mouse-target")
			.attr("fill-opacity",0)

	plot.select("tool-tip")
		.on("mouseenter", function(d){
			plot.select(".tool-tip")
				.style("opacity",1)
		})
		.on("mousemove", function(d){

		})
		.on('mouseleave', function(d){
				plot.select('.tool-tip')
					.style('opacity',0)
		});



			


}