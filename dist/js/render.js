var d3          = require('d3');

module.exports = function (calendar) {

	var month = function(name, days) {
		var self = this;
		self.name = name;
		self.days = days;
	};

	var months = [];

	months.push(new month("January", 31));
	months.push(new month("February", 28));
	months.push(new month("March", 31));
	months.push(new month("April", 30));
	months.push(new month("May", 31));
	months.push(new month("June", 30));
	months.push(new month("July", 31));
	months.push(new month("August", 31));
	months.push(new month("September", 30));
	months.push(new month("October", 31));
	months.push(new month("November", 30));
	months.push(new month("December", 31));

	var week = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday"
	];


	var days = 365;
	var angle = 2*Math.PI / days;

	var center = {
		x: 500,
		y: 500
	};

	var radius = 320;

	var lineData = [];
	var lineData2 = [];

	var normal = d3.scaleLinear()
		.domain([0, days * 11.5])
		.range([0, 12*Math.PI]);

	var normal2 = d3.scaleLinear()
		.domain([0, days])
		.range([0, 24*2*Math.PI]);

	var normalText = d3.scaleLinear()
		.domain([0, days])
		.range([0, 360]);

	var j = 0;

	var fullmoon = [

	];

	months.forEach(function(month, k, arr) {

		normal = d3.scaleLinear()
			.domain([0, month.days])
			.range([0, Math.PI]);


		for (i = 0; i < month.days; i++) {

			var x = Math.round(10*(center.x + (radius  - 40 * (Math.cos(normal(i))*Math.cos(normal(i)) )) * Math.sin(angle * j)) ) / 10;
			var y = Math.round(10*(center.y - (radius  - 40 * (Math.cos(normal(i))*Math.cos(normal(i)) )) * Math.cos(angle * j)) ) / 10;

			lineData.push({
				x: x,
				y: y
			});

			j++;

		}
	});

	j = 0;

	var lineFunction = d3.line()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; });
	//.curve(d3.curveCatmullRom.alpha(0.15));


	months.forEach(function(month, k, arr) {

		normal = d3.scaleLinear()
			.domain([0, month.days])
			.range([0, Math.PI]);

		calendar.append("circle")
			.attr("cx", Math.round(10*(center.x + (radius - 40 * (Math.cos(normal(0)) )) * Math.sin(angle * j))) / 10)
			.attr("cy", Math.round(10*(center.y - (radius - 40 * (Math.cos(normal(0)) )) * Math.cos(angle * j))) / 10)
			.attr("r", 1)
		;

		for (i = 0; i < month.days; i++) {

			var simplify3 = (Math.cos(normal(i))*Math.cos(normal(i)));

			x = Math.round(10*(center.x + (radius - 40 * simplify3) * Math.sin(angle * j))) / 10;
			y = Math.round(10*(center.y - (radius - 40 * simplify3) * Math.cos(angle * j))) / 10;

			//  Days

			var day = calendar.append("g")
				.classed("mj-calendar__day", true);

			day.append("circle")
				.attr("r", 1.5)
				.attr("data-month", k)
				.attr("data-day", i)
				.attr("data-bind", "click: updateDate(" + j + ")")
				.classed("mj-calendar__circle", true)
				.classed("_" + i, true)
				.classed("_weekend", function(){

					return ((j % 7 == 0) || (j % 7 == 6)) ? true : false;
					return ((j % 7 == 0) || (j % 7 == 6)) ? true : false;
				})
				.attr("cx", x  )
				.attr("cy", y  )
			;


			if (j < days/2) {
				x = Math.round(10*(center.x + (radius - 40 * (Math.cos(normal(i)) * Math.cos(normal(i)) ) - 5) * Math.sin(angle * j + 0.002))) / 10;
				y = Math.round(10*(center.y - (radius - 40 * (Math.cos(normal(i)) * Math.cos(normal(i)) ) - 5) * Math.cos(angle * j + 0.002))) / 10;
			} else {
				x = Math.round(10*(center.x + (radius - 40 * (Math.cos(normal(i)) * Math.cos(normal(i)) ) - 5) * Math.sin(angle * j - 0.002))) / 10;
				y = Math.round(10*(center.y - (radius - 40 * (Math.cos(normal(i)) * Math.cos(normal(i)) ) - 5) * Math.cos(angle * j - 0.002))) / 10;
			}

			//  Days text

			var textBox = day.append("svg")
					.attr("x", x  )
					.attr("y", y  )
					.attr("viewbox", "0 0 100 100")
					.attr("width", "100")
					.attr("height", "100")

					.classed("mj-calendar__dateWrap", true)
				;

			var date = new Date(2017, k, i);

			var simplify1 = j*9.86;

			textBox.append("text")
				.text(
				i+1 + ' ' + week[date.getDay()]
			)
				.attr("text-anchor",
				function() {
					if (j < days/2) {
						return 'end';
					} else {
						return 'start';
					}
				}
			)
				.classed("mj-calendar__date", true)
				.classed("mj-calendar__date__weekend", (date.getDay() > 4))
				.attr('transform',
				function() {
					if (j < days/2) {
						return 'rotate(' + Math.round( simplify1 + 2700 ) / 10 + ', 0, 0)';
					} else {
						return 'rotate(' + Math.round( simplify1 + 900 ) / 10 + ', 0, 0)';
					}
				}

			);

			j++;

		}
	});

	for (i = 0; i < 12; i++) {

		var month = calendar.append("g")
			.classed("mj-calendar__month", true);

		var simplify2 = angle * 30.4 * (i+0.5);

		var x = center.x + radius * (Math.sin(simplify2)) * 0.74;
		var y = center.y - radius * (Math.cos(simplify2)) * 0.74;

		month.append("text")
			.attr('x', x)
			.attr('y', y)
			.attr('transform', 'rotate(' + ( (i+0.5) * (30) ) + ', ' + x + ', ' + y + ')')
			.attr("text-anchor", "middle")
			.text(months[i].name);

	}




};
