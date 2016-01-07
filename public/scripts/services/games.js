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
	});