import * as d3 from "d3";
import "./style.css";

//don't forget to export if you want to import
import  {
	migrationDataPromise,
	countryCodePromise,
	metadataPromise
} from "./data.js";

import lineChart from "./viewModule/linechart.js"


Promise.all([
		migrationDataPromise,
		countryCodePromise,
		metadataPromise
	])
	.then(([migration, countryCode, metadataMap]) => {
		
		const migrationAugmented = migration.map(d => {

			const origin_code = countryCode.get(d.origin_name);
			const dest_code = countryCode.get(d.dest_name); //promise? 

			d.origin_code = origin_code;
			d.dest_code = dest_code;

			//Take the 3-digit code, get metadata record
			const origin_metadata = metadataMap.get(origin_code);
			const dest_metadata = metadataMap.get(dest_code);

			if(origin_metadata){
				d.origin_subregion = origin_metadata.subregion;
			}
			if(dest_metadata){
				d.dest_subregion = dest_metadata.subregion;
			}

			return d;
		});


		const data = transform("840", migrationAugmented);// why migration as a argument?

		//render the charts
		render(data);

		//console.log(countryCode);
	//Build UI for <select> menu
		//console.log(countryCode)
		const countryList = Array.from(countryCode.entries()) //?
		console.log(countryList);
		const menu = d3.select(".nav")
						.append("select"); // select menu

			menu.selectAll("option")//0
					.data(countryList) //270
					.enter()
					.append("option")
					.attr("value",d => d[1])
					.html(d => d[0]);


		//Build behavior for <select>menu
		menu.on("change", function(){
				
				//console.log(this.value)
				//console.log(this.selectedIndex)// ?
				
				const code = this.value;
				const idx = this.selectedIndex;
				const display = this.options[idx].innerHTML;

				const data = transform(code, migrationAugmented);
				render(data);
				// console.log(display);
		})

	})

function transform(code, migration){
		
		//Migration from the US (840) to any other place in the world
		//filter the larger migration dataset to only the subset coming from the US
		//reuse: make it a funciton
		const filterData = migration.filter(d => d.origin_code === code); //array of 1145 individual flows

		//group by subregion
		const subregionsData = d3.nest()
			.key(d => d.dest_subregion)
			.key(d => d.year)
			.rollup(values => d3.sum(values, d => d.value))
			.entries(filterData);

		return subregionsData;

}




function render(data){
	
	const charts = d3.select(".chart-container")
		.selectAll(".chart")
		.data(data)

	const chartsEnter = charts.enter()
		.append("div")
		.attr("class","chart")

	charts.exit().remove();

	charts.merge(chartsEnter)
		.each(function(d){
			// console.group()
			// console.log(this);
			// console.log(d);
			// console.groupEnd();

			lineChart(
				d.values, //array of 7
				this
			);
		})


}










/*import './style.css';

import {testFunction, var1 as var2 } from "./testmodule.js" // ./same folder
//renaming can't affect var1 in testmodual.js

import * as d3 from "d3";
//* means everything

//simultaneously refresh
console.log("index.js") 



const var1 = 10;


*/