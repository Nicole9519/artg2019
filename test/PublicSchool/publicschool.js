const dataPromise = d3.csv("./Public_Schools.csv", parseData)

const geojsonFeature = d3.json("./bostonNeighborhood.geoJSON")

Promise.all([dataPromise,geojsonFeature])
	.then(([data, geoJSON]) => {

	console.log(data)
		drawMap(d3.select(".module").node(), data, geoJSON)

	})

function drawMap(rootDOM,data, geoJSON){

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

	const path = d3.geoPath()
  		.projection(projection)

	const plot = d3.select(rootDOM)
					.append("svg")
					.attr("class","plot")
					.attr("width", W)
					.attr("height", H);
					

	 plot.selectAll("path")
	    .data(geoJSON.features)
	  	.enter()
	  	.append("path")
	    .attr("d", path)
	    .attr("fill", "#ccc")
	    .attr("stroke","#fff")

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
		.on("mouseenter", function(d) {
				    d3.select(this)
				    .attr("r","6")
				    .attr("fill","red")
				    

				    d3.select("#tooltip")
						.transition()
						.style("opacity",1)
						.style("stroke","black");
				    
				    console.log(d.intro)
				    d3.select("#name").text(d.name);
				    d3.select("#district").text("District: " + d.city)
				    d3.select("#type").text("Type: " + d.type);
				    d3.select("#year").text("Year: " + d.year);
				    d3.select("#summary").text(d.intro);
				    d3.select("#story-link").attr("href", d.website).html("Click here to view the website.");
				    
				})
		.on("mouseleave", function(d) {
			    d3.select(this)
				      .attr("r", "3")
				      .attr("fill", "grey")
				      .attr("class", "points")
				      .attr("opacity",0.75);
		});

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
		year:d.year
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


