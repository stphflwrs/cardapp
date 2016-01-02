angular.module('cardapp')
	.service('CardsService', function($http, $q) {
		var baseURL = "/api/cards/";
		var _headers = {
			'X-Requested-With': 'XMLHttpRequest',
			'ContentType': 'x-www-form-urlencoded'
		}

		this.retrieveCards = function() {
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

		this.createCard = function(card) {
			var deferred = $q.defer();

			var url = baseURL + "create/";
			$http.post(url, card, {
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

		this.retrieveCard = function(cardID) {
			var deferred = $q.defer();

			var url = baseURL + "retrieve/" + cardID;
			$http.get(url).then(
				function successCallback(response) {
					deferred.resolve(response.data);
				},
				function errorCallback(response) {
					deferred.reject(response.data);
				});

			return deferred.promise;
		};

		this.updateCard = function(card) {
			var deferred = $q.defer();

			var cardID = card._id;
			var url = baseURL + "update/" + cardID;
			$http.put(url, card, {
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

		this.deleteCard = function(cardID) {
			var deferred = $q.defer();

			var url = baseURL + "delete/" + cardID;
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