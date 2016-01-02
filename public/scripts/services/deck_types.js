'use strict';
angular.module('cardapp')
	.service('DeckTypesService', function($http, $q) {
		var baseURL = "/api/deck_types/";
		var _headers = {
			'X-Requested-With': 'XMLHttpRequest',
			'ContentType': 'x-www-form-urlencoded'
		};

		this.retrieveDeckTypes = function() {
			var deferred = $q.defer();

			var url = baseURL;
			$http.get(url).then(
				function successCallback(response) {
					deferred.resolve(response.data);
				},
				function errorCallback(response) {
					deferred.reject(response.data);
				});

			return deferred.promise;
		};

		this.createDeckType = function(deckType) {
			var deferred = $q.defer();

			var url = baseURL + "create/";
			$http.post(url, deckType, {
				headers: _headers
			}).then(
				function successCallback(response) {
					deferred.resolve(response.data);
				},
				function errorCallback(response) {
					deferred.reject(response.data);
				});

			return deferred.promise;
		};

		this.retrieveDeckType = function(deckTypeID) {
			var deferred = $q.defer();

			var url = baseURL + "retrieve/" + deckTypeID;
			$http.get(url).then(
				function successCallback(response) {
					deferred.resolve(response.data);
				},
				function errorCallback(response) {
					deferred.reject(response.data);
				});

			return deferred.promise;
		};

		this.updateDeckType = function(deckType) {
			var deferred = $q.defer();

			var deckTypeID = deckType._id;
			var url = baseURL + "update/" + deckTypeID;
			$http.put(url, deckType, {
				headers: _headers
			}).then(
				function successCallback(response) {
					deferred.resolve(response.data);
				},
				function errorCallback(response) {
					deferred.reject(response.data);
				});

			return deferred.promise;
		};

		this.deleteDeckType = function(deckTypeID) {
			var deferred = $q.defer();

			var url = baseURL + "delete/" + deckTypeID;
			$http.delete(url).then(
				function successCallback(response) {
					deferred.resolve(response.data);
				},
				function errorCallback(response) {
					deferred.reject(response.data);
				});

			return deferred.promise;
		};
	});