const migrationDataPromise = d3.csv('../data/un-migration/Table 1-Table 1.csv', parseMigrationData)
	.then(data => data.reduce((acc,v) => acc.concat(v), []));
const countryCodePromise = d3.csv('../data/un-migration/ANNEX-Table 1.csv', parseCountryCode)
	.then(data => new Map(data));
const metadataPromise = d3.csv('../data/country-metadata.csv', parseMetadata);


//Import all data via parallel promises
Promise.all([
		migrationDataPromise,
		countryCodePromise,
		metadataPromise
	]).then(([migration, countryCode, metadata]) => {

		//DATA MANIPULATION

		//Convert metadata to a metadata map
		const metadata_tmp = metadata.map(d => {
				return [d.iso_num, d]
			});
		const metadataMap = new Map(metadata_tmp);

		//Let's pick a year, say 2000, and filter the migration data
		const migration_2000 = migration.filter(d => d.year === 2000);
		console.log(migration_2000);

		//YOUR CODE HERE
		//Nest/group migration_2000 by origin_country
		//Then sum up the total value, using either nest.rollup or array.map
		let migration_origin_by_country = d3.nest()
			.key(d => d.origin_name)
			.entries(migration_2000)
			.map(function(d){ return {
				key: d.key,
				total:  d3.sum(d.values, a => a.value)
			}}) 
			

		console.log(migration_origin_by_country)

		//YOUR CODE HERE
		//Then, join the transformed migration data to the lngLat values in the metadata
		migration_origin_by_country = migration_origin_by_country.map(function(d){

			const origin_code = countryCode.get(d.key);

			d.origin_code = origin_code;

			const meta = metadataMap.get(origin_code)
			
			if(meta){
			d.lngLat = meta.lngLat;
			d.subregion = meta.subregion;
			d.name_display = meta.name_display;
			}
			
			return d
		})

		//REPRESENT
		drawCartogram(d3.select('.cartogram').node(), migration_origin_by_country);
						//take the div "cartogram" 
	})//Returns the total number of elements in this selection.

//YOUR CODE HERE
//Complete the drawCartogram function
//Some of the functions related to geographic representation have already been implemented, so feel free to use them
function drawCartogram(rootDom, data){

	//measure the width and height of the rootDom element
	const w = rootDom.clientWidth;
	const h = rootDom.clientHeight;

	//projection function: takes [lng, lat] pair and returns [x, y] coordinates
	const projection = d3.geoMercator()
		.translate([w/2, h/2])
		.scale(180);

	//Scaling function for the size of the cartogram symbols
	//Assuming the symbols are circles, we use a square root scale
	const scaleSize = d3.scaleSqrt().domain([0,1000000]).range([5,50]);


	//Complete the rest of the code here
	//Build the DOM structure using enter / exit / update

	// const svg = d3.select(rootDom)
	// 				.append("svg")
	// 				.attr("width", w)
	// 				.attr("height", h);

	// const plot = svg.append("g")
	// 				.attr("class","plot")
	// 				//.attr("transform",	`translate(${margin.l},${margin.l})`)

	const plot = d3.select(rootDom)
		.append('svg')
		.attr('width', w)
		.attr('height', h)//set width to svg'
		.append('g'); // plot is refering to g 
//>???
	const nodes = plot.selectAll('.node') // selection = 0 
		.data(data, d => d.key); // 234  mismatch
	
	const nodesEnter = nodes.enter().append('g') //append g *234
		.attr('class', 'node');

	nodesEnter.append('circle');
	nodesEnter.append('text').attr('text-anchor', 'middle');

	nodes.merge(nodesEnter)
		.filter(d => d.lngLat)
		.attr('transform', d => {
			const xy = projection(d.lngLat);
			return `translate(${xy[0]}, ${xy[1]})`;
		})
	nodes.merge(nodesEnter)
		.select('circle')
		.attr('r', d => scaleSize(d.total))
		.style('fill-opacity', .03)
		.style('stroke', '#000')
		.style('stroke-width', '1px')
		.style('stroke-opacity', .2)
	nodes.merge(nodesEnter)
		.select('text')
		//.attr("y", d => -scaleSize(d.total))
		.filter(d => d.total > 1000000)
		.text(d => d.name_display)
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')
	// plot.selectAll(".node")
	// 	.append("circle")
	// 	.enter()
	// 	.datum(data)
	// 	.attr("class","node")
	// 	.filter(d => d.lngLat)
	// 	.attr('transform', d => {
	// 		const xy = projection(d.lngLat);
	// 		return `translate(${xy[0]}, ${xy[1]})`;
	// 	})
	// 	.attr("r", function(d){ return scaleSize(d.value)})
	// 	.attr(projection())
	// 	.attr("fill-opacity",0.03);

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
		d.Code
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