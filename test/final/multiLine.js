const dataPromise = d3.csv("./new.csv", parseData);
const incomePromise = d3.csv("./income.csv", parseIncomeData)
const districtPromise = d3.csv("district.csv",parseDistrict).then(district => {
	const district_tem = district.map(a =>{
		return [a.code,a.name]
	});
	
	const districtMap = new Map(district_tem);

	return districtMap

});

Promise.all([dataPromise,incomePromise,districtPromise])
	.then(([housing,income,districtMap]) => {
		//console.log(housing);

		const parseDate = d3.timeParse("%m/%d/%y")

		const formatTime = d3.timeFormat("%Y");
    
		const income_tem = d3.nest()
			.key(d => d.name)
			.entries(income);

		const income_tem2 = income_tem.map(a =>{
			return [a.key,a.values]
		})
		const incomeMap = new Map(income_tem2)
		//console.log(incomeMap);
		//console.log(districtMap)
		const housing_ave = d3.nest()
			.key(d => d.district)
			.key(d => formatTime(parseDate(d.time)))
			.rollup(values => d3.mean(values, d => d.price))
			.entries(housing)
		console.log(housing_ave)

		
		/*用map合并数据*/
		let housingAugmented = housing_ave.map(d => {
			const name = districtMap.get(d.key);
		
			d.name = name;

			let income = incomeMap.get(name);
			//console.log(income)

			if(income){
				var i;
				for (i = 0; i < d.values.length; i++) { 
 					 d.values[i].income = income.filter(a => a.year === d.values[i].key);
				}
				
			//	d.income = income
			}

			d.values = d.values.filter( a=> a.key === '2012' ||a.key === "2013" ||a.key === "2014" ||a.key === "2015" ||a.key === "2016" ||a.key === "2017" );

			let res;

			for (let i = 0; i < d.values.length; i++) {
				d.values[i].income = d.values[i].income[0].income
			}

			d.values =d.values.sort(function(x, y){
   				return d3.descending(x.key, y.key);
			})

			return d;

		});

	

		console.log(housingAugmented)
	



		//const data = transform(year, housingAugmented);
		
		//const year = [[8,"haidian"],[2,"xicheng"],[1,"dongcheng"],[4,"changping"]];
		

		render(housingAugmented);
		
		// const menu = d3.select(".nav")
		// 				.append("select");

		// menu.selectAll("option")
		// 	.data(year)
		// 	.enter()
		// 	.append("option")
		// 	.attr("value", d => d[0])
		// 	.html(d=> d[1]);

		// menu.on("change", function(){

		// 	const year = this.value;

		// 	const data = transform(year,housing);
			
		// 	render(data)

		 // })

	})
	
function drawLinechart(rootDOM, data){

		const W = rootDOM.clientWidth;
		const H = rootDOM.clientHeight;
		const margin = {t:32, r:32, b:64, l:64};
		const innerWidth = W - margin.l - margin.r;
		const innerHeight = H - margin.t - margin.b;
		const parseTime = d3.timeParse("%Y");

		const scaleX = d3.scaleLinear().domain(d3.extent(data, function(d) { return d.key; })).range([0, innerWidth]);
		const scaleY = d3.scaleLinear().domain([0,20]).range([innerHeight, 0]);

		//take array of xy values, and produce a shape attribute for <path> element
		const lineGenerator = d3.line()
			.x(d => scaleX(d.key))
			.y(d => scaleY(d.value*31.6/d.income/2.45)); //function
		const areaGenerator = d3.area()
			.x(d => scaleX(d.key))
			.y0(innerHeight)
			.y1(d => scaleY(d.value*31.6/d.income/2.45));

		const axisX = d3.axisBottom()
			.scale(scaleX)
			//.tickFormat(function(value){ return "'"+String(value).slice(-2)})
			.ticks(6)
		const axisY = d3.axisLeft()
			.scale(scaleY)
			//.tickSize(-innerWidth)
			.ticks(3)

		//Build DOM structure
		const svg = d3.select(rootDOM)
			.classed('line-chart',true)
			.style('position','relative') //necessary to position <h3> correctly
			.selectAll('svg')
			.data([1])
		const svgEnter = svg.enter()
			.append('svg');
		svg.merge(svgEnter)
			.attr('width', W)
			.attr('height', H);

		const title = d3.select(rootDOM)
			.selectAll('h3')
			.data([1]);
		const titleEnter = title.enter()
			.append('h3')
			.style('position','absolute')
			.style('left',`${margin.l}px`)
			.style('top',`0px`)
		// title.merge(titleEnter)
		// 	.html(key);

		//Append rest of DOM structure in the enter selection
		const plotEnter = svgEnter.append('g')
			.attr('class','plot')
			.attr('transform', `translate(${margin.l}, ${margin.t})`);
		plotEnter.append('path')
			.attr('class','line')
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
		const tooltipEnter = plotEnter.append('g')
			.attr('class','tool-tip')
			.style('opacity',0)
		tooltipEnter.append('circle').attr('r',3)
		tooltipEnter.append('text').attr('text-anchor','middle')
			.attr('dy', -10)
		plotEnter.append('rect')
			.attr('class','mouse-target')
			.attr('width', innerWidth)
			.attr('height', innerHeight)
			.style('opacity', 0.01)

		//Update the update + enter selections
		const plot = svg.merge(svgEnter).select('.plot');

		plot.select('.line')
			.datum(data)
			.transition()
			.attr('d', data => lineGenerator(data))
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

		//Event handling
		plot
			.select('.mouse-target')
			.on('mouseenter', function(d){
				plot.select('.tool-tip')
					.style('opacity',1)
			})
			.on('mousemove', function(d){
				const mouse = d3.mouse(this);
				const mouseX = mouse[0];
				const year = scaleX.invert(mouseX);
				console.log(year)
				const idx = d3.bisect(data, year);
				const datum = data[idx];
				console.log(idx)
				plot.select('.tool-tip')
					.attr('transform', `translate(${scaleX(datum.key)}, ${scaleY(datum.value*31.6/datum.income/2.45)})`)
					.select('text')
					.text(datum.value);

				yearChangeCallback(datum.key);

			})
			.on('mouseleave', function(d){
				plot.select('.tool-tip')
					.style('opacity',0)
			});

	}



function transform(district, data){
	const filterData = data.filter(d => d.key === district );

	return filterData;

}

function render(data){

	const charts = d3.select('.module')
		.selectAll('.chart')
		.data(data, d => d.key);
	const chartsEnter = charts.enter()
		.append('div')
		.attr('class','chart')
	charts.exit().remove();

	charts.merge(chartsEnter)
		.each(function(d){
			drawLinechart(
				this,
				d.values
			);
		});
}


function parseData(d){


	return {
		lngLat: [+d.Lng,+d.Lat],
		price: d.price,
		district: d.district.padStart(2,"0"),
		time:d.tradeTime
	}
}

function parseIncomeData(d){
	return {
		name: d.Name, 
		year: d.Year,
		income: d.Income
		
	}
}

function parseDistrict(d){
  return {
     name: d["Name"],
     code: d["Division code[1]"].slice(-2),
     area: d["Area (km_)"],
     population: d["Population (2017_"]
  }
}
