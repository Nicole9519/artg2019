const redSquare = d3.select(".main")
	.append("div")
	.attr("class","square")
	.style("background","red")
	.datum({key:4});  //one to one selection


redSquare
	.on("click",function(d){
		//Event listener 
		console.log("Red square is clicked");
		console.log(this); // this -- context of the function  --owner of the function
		console.log(d);


	})
// it;s going to 

const dispatch = d3.dispatch("change:color","update:position")


for (let i = 0; i < 10; i++) {

	const randomcolor = `rgb(${255 * Math.random()},${255 * Math.random()},${255 * Math.random()})`;

	const square = d3.select(".main")
		.append("div")
		.attr("class","square")
		.style("background", randomcolor)
		.on("click",() => { dispatch.call("change:color", null ,randomcolor)});  //first:name, second:,  third: information
								//broadcaste process


	dispatch.on("change:color."+i, function(color){
		square.style("background",color);
	})
}


// d3.selectAll(".square")
// 	.on("click", function(d){

// 		d3.
// 	})







/*
const redSquare = d3.select(".main")
	.append("div")
	.attr("class","square")
	.style("background","red")
	.datum({key:4});  //one to one selection


redSquare
	.on("click",function(d){
		//Event listener 
		console.log("Red square is clicked");
		console.log(this); // this -- context of the function  --owner of the function
		console.log(d);


	})

const blueSquare = d3.select(".main")
	.append("div")
	.attr("class","square")
	.style("background","blue")
	.on("click",function(d){ // arrow, value of "this" is different  - select window

		console.log("Blue square is clicked")
		console.log(this)
	});


const yellowSquare = redSquare
	.append("div","square")
	.attr("class","square")
	.style("background","yellow")
	.on("click", function(d){
		d3.event.stopPropagation(); //stop the event from propagation
		console.log("yellow square is clicked")
		console.log(this) 
		console.log(d3.event);
	});

*/