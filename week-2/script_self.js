const migrationPromise = d3.csv("../data/un-migration/Table 1-Table 1.csv", parseMigrationData)
	.then(data => data.reduce((acc,v) => acc.concat(v), []));
const countryCodePromise = d3.csv("../data/un-migration/ANNEX-Table 1.csv", parseCountryCode)
	.then(data => new Map(data));;
const metadataPromise = d3.csv("../data/country-metadata.csv", parseMetadata);

Promise.all([migrationPromise,countryCodePromise,metadataPromise])
	.then(([migration, countryCode, metadata]) =>{

	const metadata_tmp = metadata.map( a => { return [a.iso_num, a] }) ;

	const metadataMap = new Map(metadata_tmp);

	//console.log(metadataMap);
	//console.log(migration);
	//console.log(countryCode);
	
	const migrationAugmented = migration.map( d => {
		
		const origin_code = countryCode.get(d.origin_name);
		const dest_code = countryCode.get(d.dest_name);

		d.origin_code = origin_code;
		d.dest_code = dest_code

		const origin_meta = metadataMap.get(origin_code);
		const dest_meta = metadataMap.get(dest_code);

		if(origin_meta){
			d.origin_subregion = origin_meta.subregion;
		}
		if(dest_meta){
			d.dest_subregion = dest_meta.subregion;
		}

		return d;


		})

		//console.log(migrationAugmented);

		const migrationBySubByYear = d3.nest()
			.key(d => d.dest_subregion)
			.key(d => d.year)
			.rollup(values => d3.sum(values, function(a){ return a.value}))
			.entries(migrationAugmented);

		//console.log(migrationBySubByYear);

		d3.select(".main")
		.selectAll("chart")
		.data(migrationBySubByYear)
		.enter()
		.append("div")
		.attr("class","chart")
		.each(function(d){ 
			// console.group();
			// console.log(this);//only valid in function refer to div
			// console.log(d);
			// console.groupEnd();

			linechart(d.values,this)
			}); //?怎么简写

	});


function linechart(data, rootDOM){
	data.pop()

	const W = rootDOM.clientWidth;
	const H = rootDOM.clientHeight;
	const margin = {l:32, t:32, r:32, b:32 };
	const innerWidth = W - margin.l - margin.r;
	const innerHeight = H -margin.t - margin.b;


	const xScale = d3.scaleLinear().domain([1985,2020]).range([0, innerWidth]);
	const yScale = d3.scaleLinear()//domain(d3.extent(d => d.value))
					.domain([0,20000000])
					.range([innerHeight,0])

	const xAxis = d3.axisBottom().scale(xScale);
	const yAxis = d3.axisLeft().scale(yScale)
					.tickSize(-innerWidth)
					.ticks(5,"s");

	const lineGenerator = d3.line()
							.x(d => xScale(+d.key))
							.y(d => yScale(d.value));

	const areaGenerator = d3.area()
							.x(d => xScale(+d.key))
							.y0(innerHeight)
							.y1(d => yScale(d.value));

	
	const svg = d3.select(rootDOM)
				.append("svg")
				.attr("width", W)
				.attr("height", H);

	const plot = svg.append("g")
					.attr("class","plot")
					.attr("transform", `translate(${margin.l}, ${margin.t})`)
					//.attr("transform", `translate()`)

	plot.append("path")
		.attr("class","line")
		.datum(data)
		.attr("d", data => lineGenerator(data))
		.style("fill","none")
		.style("stroke", "#333")
		.style("stroke-width","2px");


	plot.append("path")
		.attr("class","area")
		.datum(data)
		.attr("d", data => areaGenerator(data))
		.style("fill-opacity",0.03);

	plot.append("g")
	.attr("class","axis axis-x")
	.attr("transform", `translate(0, ${innerHeight})`)
	.call(xAxis)

	plot.append("g")
	.attr("class","axis axis-y")
	.call(yAxis)

}





//Utility functions for parsing metadata, migration data, and country code
function parseMetadata(d){
	return {
		iso_a3: d.ISO_A3,
		iso_num: d.ISO_num,
		developed_or_developing: d.developed_or_developing,
		region: d.region,
		subregion: d.subregion,
		name_formal: d.name_formal,
		name_display: d.name_display,
		lngLat: [+d.lng, +d.lat]
	}
}

function parseCountryCode(d){
	return [
		d['Region, subregion, country or area'],
		d.Code.padStart(3, '0')
	]
}

function parseMigrationData(d){
	if(+d.Code >= 900) return;

	const migrationFlows = [];
	const dest_name = d['Major area, region, country or area of destination'];
	const year = +d.Year
	
	delete d.Year;
	delete d['Sort order'];
	delete d['Major area, region, country or area of destination'];
	delete d.Notes;
	delete d.Code;
	delete d['Type of data (a)'];
	delete d.Total;

	for(let key in d){
		const origin_name = key;
		const value = d[key];

		if(value !== '..'){
			migrationFlows.push({
				origin_name,
				dest_name,
				year,
				value: +value.replace(/,/g, '')
			})
		}
	}

	return migrationFlows;
}
