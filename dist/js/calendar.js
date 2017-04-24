var $           = require('jquery');
var ui          = require('jquery-ui-browserify');
var d3          = require('d3');
var ko          = require('knockout');

var renderCalendar = require('./render.js');
var renderCounters = require('./renderCounters.js');
var renderNotes = require('./notes.js');

$(function() {


	// Knockout stuff //

	var calendarVM = function(data) {

		var self = this;

		self.loading        =   ko.observable(false);


		// !-----------------------------------------------------------
		// Login part
		self.loggedIn = ko.observable(true);
		self.currentUser = ko.observable("");
		self.currentUserId = ko.observable("");

		self.showLogin    = ko.observable(true);
		self.showRegister = ko.observable(false);

		self.loginForm = {
			login: ko.observable(""),
			password: ko.observable("")
		};

		self.noteForm = {
			note: ko.observable(""),
			day: ko.observable("")
		};

		self.counterForm = {
			name: ko.observable(""),
			value: ko.observable("")
		};

		self.counters = [];

		self.updateDate = function(num) {

		};

		self.addCounter = function() {

			self.noteForm.day($(".hasDatepicker").val());

			var dateNow = self.noteForm.day().split('.');

			var now = new Date(dateNow[2], dateNow[1]-1, dateNow[0]-1);
			var start = new Date(2017, 0, 0);
			var diff = now - start;
			var oneDay = 1000 * 60 * 60 * 24;
			var day = Math.ceil(diff / oneDay);

			var counterName = self.counterForm.name();
			var counter = {};

			counter[counterName] =  self.counterForm.value();

			var data = {
				value: self.counterForm.value(),
				name: self.counterForm.name(),
				day: day
			};


			$.ajax({
				type: "POST",
				url: "http://2017.fyi/api/calendar/counters/",
				data: data,
				dataType: "JSON",
				success: function(data) {

					$(".js-input").val('');
					goCounters();
				},
				error: function(data) {
					//console.log(data.responseText);
				}

			});
		};

		self.addNote = function() {

			self.noteForm.day($(".hasDatepicker").val());

			var dateNow = self.noteForm.day().split('.');

			var now = new Date(dateNow[2], dateNow[1]-1, dateNow[0]-1);
			var start = new Date(2017, 0, 0);
			var diff = now - start;
			var oneDay = 1000 * 60 * 60 * 24;
			//var day = Math.ceil(diff / oneDay);
			var day = Math.ceil(diff / oneDay);

			//console.log(now, start, day);

			var data = {
				note: self.noteForm.note,
				day: day
			};


			$.ajax({
				type: "POST",
				url: "http://2017.fyi/api/calendar/",
				data: data,
				dataType: "JSON",
				success: function(data) {

					$(".js-input").val('');

					//console.log(data);
					self.renderNotes();
				},
				error: function(data) {
					//console.log(data.responseText);
				}

			});
		};

		self.validation = ko.computed(function(){

			if (self.loginForm.login() != "") {
				//console.log("Validating");

				var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

				if (re.test(self.loginForm.login())) {
					//console.log("Validated");
					return("");
				} else {
					//console.log("Not validated");
					return("_error");
				}

			} else {
				//console.log("Not validating");
				return("");
			}



		});

		self.toggleState = function() {
			self.showLogin(!self.showLogin());
			self.showRegister(!self.showRegister());
		};
		self.validate = function(email) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		};
		self.refresh = function() {

			$.ajax({
				dataType: "json",
				data: "",
				url: "http://2017.fyi/api/users/current",
				success: function(data) {
					self.loggedIn(true);
					self.renderNotes();
				},
				error: function(data) {
					//console.log("Refresh: Not logged in.");
					self.loggedIn(false);
				}
			});

		};
		self.renderNotes = function() {

			$.ajax({
				dataType: "json",
				data: "",
				url: "http://2017.fyi/api/calendar/",
				success: function(data) {
					renderNotes(graph, data.notes);

					var counters = data.counters;

					if (counters) {
						counters.forEach(function(counter) {
							//console.log(counter);

							self.counters.push(counter);
						});
					}

					//console.log(self.counters);
				},
				error: function(data) {
					//console.log("data");
				}
			});


		};

		self.login = function() {

			var data = {
				email: self.loginForm.login(),
				password: self.loginForm.password()
			};

			var login = {
				email: self.loginForm.login(),
				password: self.loginForm.password()
			};

			if (self.validate(data.email)) {

				if (self.showRegister()) {

					//console.log("Registering");

					$.ajax({
						type: "POST",
						url: "http://2017.fyi/api/users/register",
						data: data,
						dataType: "JSON",
						success: function(data) {
							//console.log("Successfull Registration");

							$.ajax({
								type: "POST",
								url: "/api/users/login",
								data: login,
								dataType: "JSON",
								success: function(data) {
									//console.log("Logged in");
									self.loggedIn(true);
									self.renderNotes();
								},
								error: function(data) {
									//console.log("Not logged in", data);
								}

							});
						},
						error: function(data) {
							//console.log("Not So Successfull Registration");
							//console.log(data);
						}

					});

				} else {

					//console.log("Logging in");

					$.ajax({
						type: "POST",
						url: "http://2017.fyi/api/users/login",
						data: data,
						dataType: "JSON",
						success: function(data) {
							//console.log("Logged in");
							self.loggedIn(true);
							self.renderNotes();
						},
						error: function(data) {
							//console.log("Not logged in", data);
						}

					});
				}
			} else {

			}

		};
		self.logOut = function() {
			$.ajax({
				type: "GET",
				url: "http://2017.fyi/api/users/logout",
				dataType: "JSON",
				success: function(data) {
					//console.log("succes");
					self.loggedIn(false);
				},
				error: function(data) {
					//console.log("ERROR");
				}

			});
		};
		// !-----------------------------------------------------------
		// !-----------------------------------------------------------

		self.refresh();

		self.renderNotes();
	};

	ko.bindingHandlers.popup = {
		init: function(element, valueAccessor) {

			$(".js-close").on("click", function(){
				//console.log("Hiding popup.");
				$(element).addClass("js-hidden");
			});
		}
	};

	ko.bindingHandlers.counterAutocomplete = {
		init: function(element, valueAccessor, allBindings) {

			var counters = ["Weight", "KM", "Working hours", "Active time" ];

			$(element).autocomplete({
				source: counters,
				position: { my : "left top", at: "left bottom" }
			});

		}
	};

	ko.bindingHandlers.datepicker = {
		init: function(element, valueAccessor) {
			$(element).datepicker({
				dateFormat: "dd.mm.yy",
				minDate: new Date(2017, 1 - 1, 1),
				maxDate: new Date(2017, 365 - 1, 1)
			});

			$(document).on("click", ".mj-calendar__circle", function(){
				$(element).val( +$(this).attr("data-day") + 1 + "." + (+$(this).attr("data-month") + 1) + ".2017");
			});
		}
	};

	ko.bindingHandlers.note = {
		init: function(element, valueAccessor) {
			$(document).on("click", ".mj-calendar__circle", function(){

				//console.log("Note adding popup.");

				$(".js-popup__note").removeClass("js-hidden");
				$(element).val( $(this).parent().attr("data-note") );
			});
		}
	};

	ko.applyBindings( new calendarVM() );


	// ! Knockout stuff //

	var calendarWrapper = d3.select(".mj-calendar");
	var calendar = d3.select(".mj-calendar__svg");

	var graph = calendar.append("g");

	calendar.attr("height", "100%");
	calendar.attr("width", "100%");
	calendar.attr("viewBox", "0 0 1000 1000");
	calendar.attr("preserveAspectRatio", "xMidYMid meet");

	graph.append("text")
		.text("2017 Round Calendar")
		.attr("x", 500)
		.attr("y", 500)
		.attr("text-anchor", "middle");

	//graph.transition()
	//	.duration(1600)
	//	.attr("transform",
	//	"translate( -1500 -200 )"
	//	+ " scale(4)");

	calendarWrapper.call(d3.zoom().on("zoom", function () {

		//console.log(
		//	"transform",
		//	"translate(" + d3.event.transform.x + "px " + d3.event.transform.y + "px)"
		//	+
		//	" scale(" + d3.event.transform.k + ")"
		//);

		graph.style(
			"transform",
			"translate(" + d3.event.transform.x + "px, " + d3.event.transform.y + "px)"
			+
			" scale(" + d3.event.transform.k + ")"
		);

		//graph.transition()
		//	.duration(200)
		//	.attr("transform", "translate( -1500 -200 )" + " rotate(" + ( d3.event.transform.x/10) + " 2000 2000)" + " scale(4)");

	}));

	//var data = [
	//	{day: "200", note: "Testing calendar add date function"},
	//	{day: "210", note: "Testing calendar add date function"},
	//	{day: "211", note: "Testing calendar add date function"},
	//	{day: "10", note: "Testing calendar add date function"},
	//	{day: "260", note: "Testing calendar add date function"},
	//	{day: "10", note: "10 days after the New Year"},
	//	{day: "0", note: "New Year!"}
	//];

	renderCalendar(graph);

	var goCounters = function() {
		$.ajax({
			type: "GET",
			url: "http://2017.fyi/api/calendar/counters/",
			dataType: "JSON",
			success: function(data) {
				renderCounters(graph, data);
			},
			error: function(data) {
				//console.log(data.responseText);
			}

		});
	};

	goCounters();

});



