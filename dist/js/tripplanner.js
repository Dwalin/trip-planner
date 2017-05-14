var $           = require('jquery');
var ui          = require('jquery-ui-browserify');
var d3          = require('d3');
var ko          = require('knockout');
var L           = require('leaflet');
var geosearch   = require('leaflet-geosearch');
var direction   = require('leaflet-routing-machine');

//use strict;
//import { OpenStreetMapProvider } from 'leaflet-geosearch';

$(function() {

	const provider = new geosearch.OpenStreetMapProvider();
	const searchControl = new geosearch.GeoSearchControl({
		provider: provider
	});

	var timer = (new Date()).getTime();

	function log(text) {
		console.log( -(timer - (new Date()).getTime()), text);
		return false;
	}


	var interfaceVM = function(data) {
		log("Started");

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

					$.ajax({
						type: "POST",
						url: "https://travel.done.report/api/users/register",
						data: data,
						dataType: "JSON",
						success: function(data) {

							$.ajax({
								type: "POST",
								url: "/api/users/login",
								data: login,
								dataType: "JSON",
								success: function(data) {
									self.loggedIn(true);
								},
								error: function(data) {
								}

							});
						},
						error: function(data) {
						}

					});

				} else {

					$.ajax({
						type: "POST",
						url: "https://travel.done.report/api/users/login",
						data: data,
						dataType: "JSON",
						success: function(data) {
							self.loggedIn(true);
							self.refresh();
							log("Successfull login");
							log(data);

						},
						error: function(data) {
							log("Unsuccessfull login");
							log(data);
						}

					});
				}
			} else {

			}

		};
		self.logOut = function() {
			$.ajax({
				type: "GET",
				url: "https://travel.done.report/api/users/logout",
				dataType: "JSON",
				success: function(data) {
					self.loggedIn(false);
				},
				error: function(data) {

				}

			});
		};

		self.refresh = function() {
			log("Refresh");

			$.ajax({
				dataType: "json",
				data: "",
				url: "https://travel.done.report/api/users/current",
				success: function(data) {
					log("Logged in.");
					self.loggedIn(true);
					self.getTrips();
				},
				error: function(data) {
					log("Not logged in.");
					log(data);
					self.loggedIn(false);
				}
			});

		};

		// !-----------------------------------------------------------
		// !-----------------------------------------------------------


		// !-----------------------------------------------------------
		// Trip part

		self.trip = ko.observable();

		self.getTrips = function(){
			log("Getting trips");

			$.ajax({
				dataType: "json",
				data: "",
				url: "https://travel.done.report/api/trip/",
				success: function(data) {
					log("Getting trip data.");
					self.trip( new tripVM(data.data[0]) );
				},
				error: function(data) {
					log("Could not get trip data.");
					log(data);
				}
			});
		};

		// !-----------------------------------------------------------
		// !-----------------------------------------------------------

		self.refresh();


	};


	var tripVM = function(data) {
		var self = this;

		log(data);

		self.id       = data.id;
		self.title    = ko.observable(data.title);
		self.duration = ko.observable();
		self.stops    = ko.observableArray();

		self.addNewStop = function() {
			$.ajax({
				dataType: "json",
				type: "PUT",
				data: {
					trip_id: self.id
				},
				url: "https://travel.done.report/api/stop/",
				success: function(data) {
					log("Created new stop");
					log(data);
					self.stops.push(new stopVM(data.data));
				},
				error: function(data) {
					log("Could not create a new stop");
					log(data);
				}
			});
		};
		self.updateName = function() {

			$.ajax({
				dataType: "json",
				type: "PUT",
				data: {
					id: self.id,
					title: self.title
				},
				url: "https://travel.done.report/api/trip/",
				success: function(data) {
					log("Updated trip Title.");
					log(data);
				},
				error: function(data) {
					log("Could not update trip Title");
					log(data);
				}
			});
		};
		self.deleteStop = function(item) {

			console.log("Deleting a stop");
			console.log(item);

			$.ajax({
				dataType: "json",
				type: "DELETE",
				url: "https://travel.done.report/api/stop/" + item.id(),
				success: function(data) {
					log("Deleted a stop.");
					self.stops.remove(item);

				},
				error: function(data) {
					log("Could not delete a stop.");
					log(data);
				}
			});
		};

		render("https://travel.done.report/api/trip/" + self.id + "/stops/", stopVM, self.stops, "Stops");


	};


	var stopVM = function(data) {
		var self = this;

		log("Adding a stop.");
		log(data);

		self.id           = ko.observable(data.id);
		self.name         = ko.observable(data.name);
		self.location     = ko.observable(data.location);
		self.days         = ko.observableArray();

		self.distance     = ko.observable(0);
		self.time         = ko.observable(0);


		self.days = ko.observableArray();

		self.update = function() {

			$.ajax({
				dataType: "json",
				type: "PUT",
				data: {
					id: self.id,
					name: self.name,
					location: self.location
				},
				url: "https://travel.done.report/api/stop/",
				success: function(data) {
					//log("Updated a stop.");
					//log(data);
				},
				error: function(data) {
					log("Could not update a stop");
					log(data);
				}
			});
		};

		//render("https://travel.done.report/api/stop/" + self.id() + "/", dayVM, self.days);


	};

	var dayVM = function(data) {
		var self = this;

		self.id        = ko.observable(data.id);
		self.title     = ko.observable(data.title);
		self.number    = ko.observable(data.number);
		self.date      = ko.observable(data.date);
		self.complete  = ko.observable(data.completed);

		self.plans     = ko.observableArray();

		render("https://travel.done.report/api/trip/stop/" + self.number() + "/", planVM, self.plans);


	};

	var planVM = function(data) {
		var self = this;

		self.name = ko.observable(data.name);
		self.complete = ko.observable(data.complete);

		self.completeTimestamp = ko.observable();

	};


	ko.bindingHandlers.popup = {
		init: function(element, valueAccessor) {
			$(".js-close").on("click", function(){
				$(element).addClass("js-hidden");
			});
		}
	};

	ko.bindingHandlers.geocomplete = {
		init: function(element, valueAccessor, allBindings) {


			var autocomplete = new google.maps.places.Autocomplete(
				element, {types: ['(cities)']});


			autocomplete.addListener('place_changed', function(){
				var place = autocomplete.getPlace();

				$(element).val(place.formatted_address);
				$(element).change();
				valueAccessor(place.formatted_address);

				//console.log("———————————————————");
				//console.log("The place has changed!");
				//console.log(place.formatted_address);
				//console.log(valueAccessor);
				//console.log($(element).val());
				//console.log("———————————————————");
			});
			

		}
	};

	ko.bindingHandlers.direction = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

			var from = bindingContext.$parent.stops()[bindingContext.$index()-1].location();
			var to   = bindingContext.$data.location();

			var map = L.map(element);
			L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib2tyeXpoYW5pdnNreWkiLCJhIjoiY2oyb2xhcHA0MDAyOTJxcGZrdHQ4ZG0xZyJ9.7h-IQAfbm-AxbXAhEo5grw', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
				maxZoom: 12,
				id: 'trip-planner',
				accessToken: 'pk.eyJ1Ijoib2tyeXpoYW5pdnNreWkiLCJhIjoiY2oyb2xhcHA0MDAyOTJxcGZrdHQ4ZG0xZyJ9.7h-IQAfbm-AxbXAhEo5grw'
			}).addTo(map);

			var route = L.Routing.control({
				waypoints: [],
				router: L.Routing.mapbox('pk.eyJ1Ijoib2tyeXpoYW5pdnNreWkiLCJhIjoiY2oyb2xhcHA0MDAyOTJxcGZrdHQ4ZG0xZyJ9.7h-IQAfbm-AxbXAhEo5grw')
			});

			route.on('routesfound', function(e) {
				var routes = e.routes;

				bindingContext.$data.distance( routes[0].summary.totalDistance / 1000);
				bindingContext.$data.time( routes[0].summary.totalTime / 60 / 60 );


			});


			//bindingContext.$data.location.subscribe(function(location){
			//	if (to != null) {
			//
			//		var coordFrom = {};
			//		var coordTo   = {};
			//
			//		provider
			//			.search({query: bindingContext.$parent.stops()[bindingContext.$index()-1].location()})
			//			.then(function(resultFrom){
			//
			//				provider
			//					.search({query: bindingContext.$data.location()})
			//					.then(function(resultTo){
			//
			//						coordFrom = [resultFrom[0].y, resultFrom[0].x];
			//						coordTo   = [resultTo[0].y,   resultTo[0].x];
			//
			//						map.fitBounds([coordFrom, coordTo]);
			//
			//
			//
			//						route.on('routesfound', function(e) {
			//							var routes = e.routes;
			//							bindingContext.$data.distance( routes[0].summary.totalDistance / 1000);
			//							bindingContext.$data.time( routes[0].summary.totalTime / 60 / 60 );
			//						});
			//
			//						route.addTo(map);
			//
			//					});
			//			});
			//
			//	}
			//});
			//
			//bindingContext.$parent.stops()[bindingContext.$index()-1].location.subscribe(function(){
			//	if (to != null) {
			//
			//		var coordFrom = {};
			//		var coordTo   = {};
			//
			//		provider
			//			.search({query: from})
			//			.then(function(resultFrom){
			//
			//				provider
			//					.search({query: to})
			//					.then(function(resultTo){
			//
			//						coordFrom = [resultFrom[0].y, resultFrom[0].x];
			//						coordTo   = [resultTo[0].y,   resultTo[0].x];
			//
			//						map.fitBounds([coordFrom, coordTo]);
			//
			//						L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib2tyeXpoYW5pdnNreWkiLCJhIjoiY2oyb2xhcHA0MDAyOTJxcGZrdHQ4ZG0xZyJ9.7h-IQAfbm-AxbXAhEo5grw', {
			//							attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
			//							maxZoom: 12,
			//							id: 'trip-planner',
			//							accessToken: 'pk.eyJ1Ijoib2tyeXpoYW5pdnNreWkiLCJhIjoiY2oyb2xhcHA0MDAyOTJxcGZrdHQ4ZG0xZyJ9.7h-IQAfbm-AxbXAhEo5grw'
			//						}).addTo(map);
			//
			//						var route = L.Routing.control({
			//							waypoints: [
			//								coordFrom,
			//								coordTo
			//							],
			//							router: L.Routing.mapbox('pk.eyJ1Ijoib2tyeXpoYW5pdnNreWkiLCJhIjoiY2oyb2xhcHA0MDAyOTJxcGZrdHQ4ZG0xZyJ9.7h-IQAfbm-AxbXAhEo5grw')
			//						});
			//
			//						route.on('routesfound', function(e) {
			//							var routes = e.routes;
			//
			//							bindingContext.$data.distance( routes[0].summary.totalDistance / 1000);
			//							bindingContext.$data.time( routes[0].summary.totalTime / 60 / 60 );
			//
			//
			//						});
			//
			//						route.addTo(map);
			//
			//					});
			//			});
			//
			//	}
			//});

			if (to != null) {

				var coordFrom = {};
				var coordTo   = {};

				provider
					.search({query: from})
					.then(function(resultFrom){
						provider
							.search({query: to})
							.then(function(resultTo){

								coordFrom = [resultFrom[0].y, resultFrom[0].x];
								coordTo   = [resultTo[0].y,   resultTo[0].x];

								map.fitBounds([coordFrom, coordTo]);

								route.setWaypoints([
									coordFrom,
									coordTo
								]);

								route.addTo(map);

							});
					});

			}



		}
	};
	

	ko.applyBindings( new interfaceVM() );
	

});

var render = function(url, viewModel, property, comment) {

	console.log(comment + " render started.");

	$.ajax({
		dataType: "json",
		data: "",
		url: url,
		success: function(data) {
			console.log(comment + " render finished successfully.");

			if (Array.isArray(data.data)) {
				data.data.forEach(function(item) {
					property.push( new viewModel(item) );
				});

				console.log(property());
			} else {
				console.log(comment + ": something went wrong.");
			}

		},
		error: function(data) {
			console.log(comment + " were not found.");
			return false;
		}
	});

};