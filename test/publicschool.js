const dataPromise = d3.csv("./Public_Schools.csv", parseData)

const geojsonFeature = d3.json("./bostonNeighborhood.geoJSON")

Promise.all([dataPromise,geojsonFeature])
	.then(([data, geoJSON]) => {

	console.log(geoJSON.features)
		drawMap(d3.select(".module").node(), data, geoJSON)

	})

function drawMap(rootDOM,data, geoJSON){

	const W = 1000;
	const H = 1000;
	const m = {t:32,r:32,b:32,l:32};



	const projection = d3.geoMercator()
		.center([42.349220, -71.061432])
		.translate([W/2, H/2])
		.scale(50000);

	const path = d3.geoPath()
  		.projection(projection)

	const plot = d3.select(rootDOM)
					.append("svg")
					.attr("width", W)
					.attr("height", H)
					.append("g");

	 plot.selectAll("path")
	    .data(geoJSON.features)
	  	.enter().append("path")
	    .attr("d", path)
	    .attr("fill", "#ccc")
	    .attr("stroke","#fff")

	plot.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("class","circle")
		.attr("r",4)
		.attr("cx", function(d){  return projection(d.latLng)[0]})
		.attr("cy", function(d){  return projection(d.latLng)[1]})
		.style("fill-opacity",0.8)


}


function parseData(d){

	return {
		latLng: [d.Y ,d.X],
		name : d.SCH_NAME,
		city:d.CITY,
		type :d.SCH_TYPE,
		address:d.ADDRESS
	}
}


// 	var mymap = L.map('mapid').setView([42.349220, -71.061432], 13);

// 	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
// 		maxZoom: 18,
// 		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
// 			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
// 			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
// 		id: 'mapbox.streets'
// 	}).addTo(mymap);

// 	var geojsonMarkerOptions = {
//     radius: 8,
//     fillColor: "#ff7800",
//     color: "#000",
//     weight: 1,
//     opacity: 1,
//     fillOpacity: 0.8
// };



// 	L.geoJSON(geojsonFeature).addTo(map);



// L.geoJSON(someGeojsonFeature, {
//     pointToLayer: function (feature, latlng) {
//         return L.circleMarker(latlng, geojsonMarkerOptions);
//     }
// }).addTo(map);


