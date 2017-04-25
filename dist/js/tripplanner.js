var $           = require('jquery');
var ui          = require('jquery-ui-browserify');
var d3          = require('d3');
var ko          = require('knockout');


$(function() {


	var tripVM = function(data) {

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

		self.refresh = function() {

			$.ajax({
				dataType: "json",
				data: "",
				url: "./api/users/current",
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
						url: "./api/users/register",
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
									self.renderNotes();
								},
								error: function(data) {
								}

							});
						},
						error: function(data) {
						}

					});

				} else {

					//console.log("Logging in");

					$.ajax({
						type: "POST",
						url: "./api/users/login",
						data: data,
						dataType: "JSON",
						success: function(data) {
							self.loggedIn(true);
							self.renderNotes();
						},
						error: function(data) {
						}

					});
				}
			} else {

			}

		};
		self.logOut = function() {
			$.ajax({
				type: "GET",
				url: "./api/users/logout",
				dataType: "JSON",
				success: function(data) {
					self.loggedIn(false);
				},
				error: function(data) {

				}

			});
		};
		// !-----------------------------------------------------------
		// !-----------------------------------------------------------

		self.refresh();
	};

	ko.bindingHandlers.popup = {
		init: function(element, valueAccessor) {
			$(".js-close").on("click", function(){
				$(element).addClass("js-hidden");
			});
		}
	};
	

	ko.applyBindings( new tripVM() );
	

});