import * as d3 from "d3";
import "./style.css";

import {
	migrationDataPromise,
	countryCodePromise,
	metadataPromise
} from "./data.js"

import lineChart from "./viewModule/linechart.js";

Promise.all([ migrationDataPromise, countryCodePromise, metadataPromise]) 
	.then(([migration, countryCodeMap, metadataMap]) => {

		const migrationAugmented = migration.map( d => {

			const origin_code = countryCodeMap.get(d.origin_name);
			const dest_code = countryCodeMap.get(d.dest_code);

			d.origin_code = origin_code;
			d.dest_code = dest_code;

			const dest_meta = metadataMap.get(dest_code);

			if(dest_meta){
				d.dest_subregion = dest_meta.subregion;

			}
			
		return d;
		})


		const data = transformData("840", migrationAugmented);

		render(data);

	})


function transformData(code,migration){

	const filterData = migration.filter(d => d.origin_code === code);

	const subregionData = d3.nest()
		.key(d => d.year)
		.key(d => d.dest_subregion)
		.entries(filterData)
		.rollup(values => d3.sum(values, d => d.value )) ;

		return subregionData;
}

function render(){
	const charts = d3.selectAll(".chart")
					.append(".chart")
					.data(data);

	const chartsEnter = charts.enter()
						.append("div")
						.attr("class","chart")

	charts.exit().remove();

	charts.merge(chartsEnter)
		.each(function(d){

			lineChart(d.values, this);
		})

}