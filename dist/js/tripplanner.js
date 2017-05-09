var $           = require('jquery');
var ui          = require('jquery-ui-browserify');
var d3          = require('d3');
var ko          = require('knockout');


$(function() {

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
						url: "http://travel.done.report/api/users/register",
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
						url: "http://travel.done.report/api/users/login",
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
				url: "http://travel.done.report/api/users/logout",
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
				url: "http://travel.done.report/api/users/current",
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
				url: "http://travel.done.report/api/trip/",
				success: function(data) {
					console.log("Getting trip data.");
					console.log(data);
					self.trip = new tripVM(data[0]);
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

		self.id = ko.observable(data.id);
		self.title = ko.observable(data.title);
		self.duration = ko.observable();
		self.stops = ko.observableArray();

		render("http://travel.done.report/api/trip/" + self.id() + "/stops/", stopVM, self.stops);


	};


	var stopVM = function(data) {
		var self = this;

		self.id           = ko.observable(data.id);
		self.name         = ko.observable(data.name);
		self.location     = ko.observable(data.location);
		self.days         = ko.observableArray();

		self.days = ko.observableArray();

		//render("http://travel.done.report/api/stop/" + self.id() + "/", dayVM, self.days);


	};

	var dayVM = function(data) {
		var self = this;

		self.id        = ko.observable(data.id);
		self.title     = ko.observable(data.title);
		self.number    = ko.observable(data.number);
		self.date      = ko.observable(data.date);
		self.complete  = ko.observable(data.completed);

		self.plans     = ko.observableArray();

		render("http://travel.done.report/api/trip/stop/" + self.number() + "/", planVM, self.plans);


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
	

	ko.applyBindings( new interfaceVM() );
	

});

var render = function(url, viewModel, property) {

	$.ajax({
		dataType: "json",
		data: "",
		url: url,
		success: function(data) {
			console.log("Render started.");
			console.log(data);

			if (Array.isArray(data)) {
				data.data.forEach(function(item){
					property.push(new viewModel(item) );
				});
			} else {

			}

		},
		error: function(data) {

		}
	});

};