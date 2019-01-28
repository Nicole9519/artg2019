const migrationDataPromise = d3.csv('../data/un-migration/Table 1-Table 1.csv', parseMigrationData)
	.then(data => data.reduce((acc,v) => acc.concat(v), []));
const countryCodePromise = d3.csv('../data/un-migration/ANNEX-Table 1.csv', parseCountryCode)
	.then(data => new Map(data));
const metadataPromise = d3.csv('../data/country-metadata.csv', parseMetadata);

Promise.all([
		migrationDataPromise,
		countryCodePromise,
		metadataPromise
	])
	.then(([migration, countryCode, metadata]) => {

		//Convert metadata to a map
		const metadata_tmp = metadata.map(a => {
			return [a.iso_num, a]
		});
		const metadataMap = new Map(metadata_tmp);

		const migrationAugmented = migration.map(d => {

			const origin_code = countryCode.get(d.origin_name);
			const dest_code = countryCode.get(d.dest_name);

			d.origin_code = origin_code;
			d.dest_code = dest_code;

			//Take the 3-digit code, get metadata record
			const origin_metadata = metadataMap.get(origin_code);
			const dest_metadata = metadataMap.get(dest_code);

			// if(!origin_metadata){
			// 	console.log(`lookup failed for ` + d.origin_name + ' ' + d.origin_code);
			// }
			// if(!dest_metadata){
			// 	console.log(`lookup failed for ${d.origin_name} ${d.origin_code}`)
			// }
			if(origin_metadata){
				d.origin_subregion = origin_metadata.subregion;
			}
			if(dest_metadata){
				d.dest_subregion = dest_metadata.subregion;
			}

			return d;
		});
		
		console.log(migrationAugmented);


//fromUs--840
		const usData = d3.nest()
		.key(d => d.year)
		//array of 1145
		.entries(migrationAugmented.filter(d => d.origin_code == "840"))
		.map(function(a){
				return {
			year: +a.key, //can just transform 2 code
			total : d3.sum(a.values, d => d.value),//the arrary of 200 individual migration flows
			max:d3.max(a.values, d => d.value),
			min:d3.min(a.values, d => d.value)
			}
		})


/*
		const migrationBySubregion = d3.nest()
		.key(d => d.origin_subregion)
		.rollup(values => d3.sum(values, d => d.value))
		.entries(migrationAugmented)

		console.log(migrationBySubregion);

*/

/*
	lineChart(
		data, // this is the US migration data
		d3.select(".module").node()//<div> element with class "module"
		//read API: d3.selection
		)
*/
//Group by subregion, and then year
	const subregionsData = d3.nest()
	.key(d => d.dest_subregion)
	.key(d => d.year)
	.rollup(values => d3.sum(values, d => d.value))//values: second values
	.entries(migrationAugmented);

	d3.select(".main")
		.selectAll("chart")//0
		.data(subregionsData)//18
		.enter()
		.append("div")
		.attr("class","chart")
		//check api &call() check more example selection.each()
		.each(function(d){ 
			// console.group();
			// console.log(this);//only valid in function refer to div
			// console.log(d);
			// console.groupEnd();

			lineChart(d.values,this)
			});



	})

//drawing line chart based on serial x-y data
//function "signature": what arguments are expected, how many, and what they should look like
function lineChart(data,rootDOM){
	//root DOM: where it started
	console.log("lineChart");
	console.log(data);
	console.log(rootDOM);

	data.pop()

	const W =rootDOM.clientWidth;
	const H  = rootDOM.clientHeight;
	const margin = {t:32, r:32, b:128, l:64};
	const innerWidth = W - margin.l - margin.r;
	const innerHeight = H - margin.t - margin.b;

	const scaleX = d3.scaleLinear()
					.domain([1985,2020])
					.range([0,innerWidth]);
  
	const scaleY = d3.scaleLinear()
					.domain([0,20000000])
					.range([innerHeight,0])


	//take array of xy values, and produce a shape attribute for <path> element
	const lineGenerator = d3.line()
		.x(d => scaleX(+d.key))
		.y(d => scaleY(d.value));// this is a function

	const areaGenerator = d3.area()
	.x(d => scaleX(+d.key))
	.y0(innerHeight)
	.y1(d => scaleY(d.value))

	const axisX = d3.axisBottom()
		.scale(scaleX)
		//.tickFormat(function(value){ return "'" + string(value).slice(-2)});

	const axisY = d3.axisLeft()
	.scale(scaleY)
	.tickSize(-innerWidth)
	.ticks(5);

		//console.log(lineGenerator(data));
	const svg = d3.select(rootDOM)
	.append("svg")
	.attr("width", W)
	.attr("height", H);

	const plot = svg.append("g")
	.attr("class","plot")
	.attr("transform", `translate(${margin.l}, ${margin.t})`)//from edge to transform from top and left
								//string template 
	plot.append("path")
	.attr("class","line")
	.datum(data)
	//visual attribute shape i.e. geometry "d"
	//d is a description attr
	.attr("d",data => lineGenerator(data))
	//if lineGenerator(undefined), return length not read
	.style("fill","none")
	.style("stroke", "#333")
	.style("stroke-width","2px")

	plot.append("path")
	.attr("class","area")
	.datum(data)
	.attr("d",data =>areaGenerator(data))
	.style("fill-opacity",0.03)

//why append g??
	plot.append("g")
	.attr("class","axis axis-x")
	.attr("transform", `translate(0, ${innerHeight})`)
	.call(axisX)

	plot.append("g")
	.attr("class","axis axis-y")
	.call(axisY)
	
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

