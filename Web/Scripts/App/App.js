/*global angular:false */
(function(window, angular, undefined) {
	'use strict';

	var resources = {
		sessions: 'https://spreadsheets.google.com/feeds/list/1-T0NAIjAVqTS15l_fwAr9p6lWL4LbduplvFXfp6BIxg/od6/public/full?alt=json&sq=day%3D:day%20and%20begin%3C:begin&orderby=column:timeorder',
		leisure: 'https://spreadsheets.google.com/feeds/list/1-T0NAIjAVqTS15l_fwAr9p6lWL4LbduplvFXfp6BIxg/o6kf8lr/public/full?alt=json&sq=day%3D:day&orderby=column:timeorder',
		speakers: 'https://spreadsheets.google.com/feeds/list/1-T0NAIjAVqTS15l_fwAr9p6lWL4LbduplvFXfp6BIxg/oow7509/public/full?alt=json'
	};
	var app = angular.module('t3dd15.signage', [
		'ngResource',
		'ngAnimate'
	]);
	app.controller('AppController', AppController);
	app.controller('SponsorController', SponsorController);
	app.controller('EventListController', EventListController);
	app.factory('EventFactory', EventFactory);
	app.factory('LeisureFactory', LeisureFactory);
	app.factory('SpeakerFactory', SpeakerFactory);

	EventFactory.$inject = ['$resource'];
	function EventFactory($resource) {
		return $resource(resources.sessions, {day: '@day', begin: '@begin', 'max-col': '@maxCol'});
	}

	LeisureFactory.$inject = ['$resource'];
	function LeisureFactory($resource) {
		return $resource(resources.leisure, {day: '@day', begin: '@begin', 'max-col': '@maxCol'});
	}

	SpeakerFactory.$inject = ['$resource'];
	function SpeakerFactory($resource) {
		return $resource(resources.speakers);
	}

	function AppController() {
		this.title = 'T3DD15 Signage';
	}

	SponsorController.$inject = ['$interval'];
	function SponsorController($interval) {
		var self = this;
		self.sponsors = [{
			type: 'Premium Sponsors',
			logo: 'jweiland-net-logo.svg'
		}, {
			type: 'Premium Sponsors',
			logo: 'aoe-logo.svg'
		}, {
			type: 'Premium Sponsors',
			logo: 'punkt-de-logo.svg'
		}, {
			type: 'Premium Sponsors',
			logo: 'hiscox-logo.svg'
		}, {
			type: 'T-Shirt Sponsor',
			logo: 'sitegeist-logo.svg'
		}, {
			type: 'Coding Night Sponsors',
			logo: 'jweiland-net-logo.svg'
		}, {
			type: 'Social Event Sponsors',
			logo: 'dkd-logo.svg'
		}, {
			type: 'Social Event Sponsors',
			logo: 'teamneusta-logo.svg'
		}, {
			type: 'Value Sponsors',
			logo: 'lufed-it-logo.svg'
		}, {
			type: 'Value Sponsors',
			logo: 'hetzner-logo.svg'
		}, {
			type: 'Supporters',
			logo: 'rheinschafe-logo.svg'
		}, {
			type: 'Internet Sponsors',
			logo: 'teamix-logo.svg'
		}, {
			type: 'Internet Sponsors',
			logo: 'netlogix-logo.svg'
		}, {
			type: 'Internet Sponsors',
			logo: 'aerohive-logo.svg'
		}];
		self.sponsor = 12;

		$interval(function() {
			self.sponsor = Math.floor(Math.random() * (14 - 1)) + 1;
		}, 5000)
	}

	EventListController.$inject = ['$interval', 'EventFactory', 'LeisureFactory', 'SpeakerFactory'];
	function EventListController($interval, EventFactory, LeisureFactory, SpeakerFactory) {
		var self = this, weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], d = new Date();
		self.speakers = [];
		self.events = [];
		self.day = weekdays[d.getDay()];
		self.begin = ((d.getHours() + (d.getMinutes() / 60)) / 24);
		self.limit = 6;

		self.getSpeakerAvatarForName = function(name) {
			var speaker = self.speakers.filter(function(speaker) {
				return speaker.id == name;
			})[0];
			return angular.isObject(speaker) ? speaker.profile : '';
		};

		function getEvents() {
			d = new Date();
			self.begin = ((d.getHours() + (d.getMinutes() / 60)) / 24);
			EventFactory.get({day: self.day, begin: self.begin, maxCol: self.limit}, function(result) {
				var newEvents = transformFeedResult(result);
				if (newEvents.length && self.begin < 0.77) {
					self.events = newEvents;
				} else {
					getLeisure()
				}
			});
		}

		function getLeisure() {
			LeisureFactory.get({day: self.day}, function(result) {
				var newEvents = transformFeedResult(result);
				if (newEvents.length) {
					self.events = newEvents;
				}
			});
		}

		function getSpeakers() {
			SpeakerFactory.get({}, function(result) {
				self.speakers = transformFeedResult(result);
			});
		}

		function transformFeedResult(result) {
			var newResult = [];
			angular.forEach(result.feed.entry, function(eventEntry) {
				var event = {};
				angular.forEach(Object.keys(eventEntry), function(propertyName) {
					if (propertyName.indexOf('gsx') >= 0) {
						event[propertyName.substr(4)] = eventEntry[propertyName].$t;
					} else if (angular.isArray(eventEntry[propertyName])) {
						event[propertyName] = eventEntry[propertyName];
					} else {
						event[propertyName] = eventEntry[propertyName].$t;
					}
				});
				// Some Events have the same uuid, so make it real unique
				event.id = event.id + (event.begin ? event.begin : '');
				newResult.push(event);
			});
			return newResult;

		}

		getEvents();
		getSpeakers();
		$interval(getEvents, 60000);
	}

}(window, angular));
