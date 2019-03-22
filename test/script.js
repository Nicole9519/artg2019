console.log("in class slider")

//create d3 axis "generator"
// const axisX = 
// 	d3.axisBottom()
// 	.tickValues()
// 	.scale()
// 	....

function RangeSlider(){
//factory: in case there's too many argument
//default value: per factory

	

	let color = "#ccc";
	let sliderValues = [];
	let H = 100;
	let W = 600;
	let margin = {l:20, r:20};
	const internalDispatch = d3.dispatch('change');


//assume we will use it multiple times
	function exports(container){
		//Build the DOM elements corresponding to the slider
		//append 
		const dragBehavior = d3.drag()
		.on('drag', function(){
			let currentX = d3.event.x;
			if(currentX <0){
				 currentX = 0
			}else if(currentX >w){
				currentX = w;
			}
			handle.attr("cx", currentX)

			const sliderValue = scaleX.invert(currentX)//translate to the scale
			internalDispatch.call('slide', null, sliderValue);


		})

		container.style("width",W);
		container.style("height",H);
		const w = W -margin.l - margin.r;

		let svg = container.selectAll('svg')
			.data([1])
		let svgEnter = svg.enter()
			.append('svg')
		//append all necessary DOM elements
		let sliderInner = svgEnter.append('g')
			.attr("attr","range-slider-inner")


		sliderInner.append("line").attr("class","track-outer");
		sliderInner.append("line").attr("class","track-inner");
		sliderInner.append("circle").attr("class","drag-handle");
		sliderInner.append("g").attr("class","ticks");

		svg = svgEnter.merge(svg)
			.attr('width', W)
			.attr('height', H);
		sliderInner = svg.select('.range-slider-inner')
			.attr('transform', `translate(${margin.l}, ${H/2})`);

		sliderInner.select('.track-outer')
			.attr('x1', w)
			.attr('stroke', '#666')
			.attr('stroke-width', '4px')
			.attr('stroke-linecap', 'round');
		sliderInner.select('.track-inner')
			.attr('x1', w)
			.attr('stroke', '#eee')
			.attr('stroke-width', '2px')
			.attr('stroke-linecap', 'round');
		const dragHandle = sliderInner.select('.drag-handle')
			.attr('r', 8)
			.attr('stroke', 'white')
			.attr('stroke-width', '3px')
			.attr('fill', '#666')
			.style('cursor', 'pointer')
			.call(drag);
		sliderInner.select('.axis')
			.attr('transform', `translate(0,4)`)
			.call(axisX)
			.select('.domain')
			.style('display', 'none');


	}
	//Getter/ Setter function
	exports.color = function(_){
		if(!_){
			return color;
		}
		color = _;
		return this // return the owner -exports
	}

	exports.values = function(_){
		if(!_){
			return sliderValues;
		}
		sliderValues =_;
	}

	exports.on = function(event,eventCallBackFunction){
		internalDispatch.on('slide',function(sliderValue){ //receiving
			console.log(sliderValue)
		})
		return this
	}
	return exports
}

//idolmatic
 const slider1 = RangeSlider(); //--> is a function 
 slider1.color("#333") // return slider1 
 	.values([1,2,3,4])
 	.on('slide', //"envent type"
 		value => console.log(value)) //callback funtion

slider1(d3.select(".slider-container"))//selction/DOM node