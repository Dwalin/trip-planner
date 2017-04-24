var d3          = require('d3');

module.exports = function (calendar, counters) {

	console.log(counters);

	d3.selectAll(".mj-calendar__counters").remove();

	var placement = calendar.append("g")
		.classed("mj-calendar__counters", true);

	var days = 365;
	var angle = 2*Math.PI / days;

	var center = {
		x: 500,
		y: 500
	};

	var radius = 250;

	var lineData = [];

	var normal = d3.scaleLinear()
		.domain([0, days * 11.5])
		.range([0, 12*Math.PI]);

	var normal2 = d3.scaleLinear()
		.domain([0, days])
		.range([0, 24*2*Math.PI]);

	var normalText = d3.scaleLinear()
		.domain([0, days])
		.range([0, 360]);

	normal = d3.scaleLinear()
		.domain([0, 365 / 2])
		.range([0, Math.PI]);


	var counterRadius = radius;

	for (var key in counters) {

		counterRadius = counterRadius - 20;

		var counterGroup = placement.append("g")
			.classed("cal-counter__box", true)
			.classed("_" + key, true);

		lineData = [];

		var maxVal = 0;
		var minVal = 10000;

		counters[key].forEach(function(item, index) {
			if (item.value < minVal) {minVal = item.value}
			if (item.value > maxVal) {maxVal = item.value}
		});

		counterDifference = d3.scaleLinear()
			.domain([minVal, maxVal])
			.range([0, 20]);

		counterDifference2 = d3.scaleLinear()
			.domain([minVal, maxVal])
			.range([0, 1]);

		counters[key].forEach(function(item, index){

			var day = item.day;
			var x = Math.round( 10 * (center.x + ((counterRadius + (counterDifference(item.value))) * Math.sin(normal(day) )) )) / 10;
			var y = Math.round( 10 * (center.y - ((counterRadius + (counterDifference(item.value))) * Math.cos(normal(day) )) )) / 10;

			counterGroup.append("circle")
				.attr("cx", x)
				.attr("cy", y)
				.attr("data-value", item.value)
				.attr("r", 1 + parseFloat(counterDifference2(item.value)) )
				.classed("mj-counter__marker", true);


			lineData.push({
				x: x,
				y: y
			});

		});

		var lineFunction = d3.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.curve(d3.curveCatmullRom.alpha(0.15));

		counterGroup.append("path")
			.attr("d", lineFunction(lineData))
			.attr("fill", "transparent")
			.classed("mj-counter__graph", true);

	}

	//for (var i = 0; i < days; i++) {
	//
	//	var x = Math.round( 10 * (center.x + (radius * Math.sin(normal(i) )) )) / 10;
	//	var y = Math.round( 10 * (center.y + (radius * Math.cos(normal(i) )) )) / 10;
	//
	//
	//}
	//





};
