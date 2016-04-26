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
			var data = angular.copy(game);
			data.deck_type_id = deckTypeID;
			$http.post(url, data, 
			{
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

		this.retrieveSelf = function (gameID) {
			var deferred = $q.defer();

			var url = baseURL + "get_self/" + gameID;
			$http.get(url).then(
				function successCallback(response) {
					deferred.resolve(response.data);
				},
				function errorCallback(response) {
					deferred.reject(response.data);
				});

			return deferred.promise;
		};

		this.retrieveOpponents = function (gameID) {
			var deferred = $q.defer();

			var url = baseURL + "get_opponents/" + gameID;
			$http.get(url).then(
				function successCallback(response) {
					deferred.resolve(response.data);
				},
				function errorCallback(response) {
					deferred.reject(response.data);
				});

			return deferred.promise;
		};

		this.retrievePlayers = function (gameID) {
			var deferred = $q.defer();

			var url = baseURL + "get_players/" + gameID;
			$http.get(url).then(
				function successCallback(response) {
					deferred.resolve(response.data);
				},
				function errorCallback(response) {
					deferred.reject(response.data);
				});

			return deferred.promise;
		};

		this.joinGame = function (gameID) {
			var deferred = $q.defer();

			var url = baseURL + "join/" + gameID;
			$http.post(url, {},
			{
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

		this.addAIPlayer = function (gameID, playerModel) {
			var deferred = $q.defer();

			var url = baseURL + "addai/" + gameID;
			var data = {
				playerModel: playerModel
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
				});

			return deferred.promise;
		};

		this.startGame = function (gameID) {
			var deferred = $q.defer();

			var url = baseURL + "start/" + gameID;
			$http.post(url, {},
			{
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

		this.distributeCards = function (gameID) {
			var deferred = $q.defer();

			var url = baseURL + "distribute_cards/" + gameID;
			$http.post(url, {},
			{
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

		this.setCard = function (gameID, cardIndex, swapperIndex, otherCardIndex) {
			var deferred = $q.defer();

			var url = baseURL + "set_card/" + gameID;
			var data = {
				card_index: cardIndex,
				swapper_index: swapperIndex,
				other_card_index: otherCardIndex
			};

			console.log(data);

			$http.post(url, data,
			{
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
	});