angular.module('cardapp')
	.service('GamesService', function ($http, $q) {
		var baseURL = "/api/games/";
		var _headers = {
			'X-Requested-With': 'XMLHttpRequest',
			'ContentType': 'x-www-form-urlencoded'
		};
		
		this.retrieveGames = function () {
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

		this.createGame = function (game, deckTypeID) {
			var deferred = $q.defer();

			var url = baseURL + "create/";
			$http.post(url, game, 
			{
				headers: _headers
			}).then(
				function successCallback(response) {
					var url = baseURL + "init_deck/" + response.data._id;
					var data = {
						deck_type_id: deckTypeID
					};
					$http.post(url, data,
					{
						headers: _headers
					}).then(
						function successCallback(response) {
							deferred.resolve(response.data);
						},
						function errorCallback(response) {
							deferred.reject(response.data);
						})
				},
				function errorCallback(response) {
					deferred.reject(response.data);
				});

			return deferred.promise;
		};

		this.retrieveGame = function (gameID) {
			var deferred = $q.defer();

			var url = baseURL + "retrieve/" + gameID;
			$http.get(url).then(
				function successCallback(response) {
					deferred.resolve(response.data);
				},
				function errorCallback(response) {
					deferred.reject(response.data);
				});

			return deferred.promise;
		};
	});