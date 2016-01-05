angular.module('cardapp')
	.service('UsersService', function($http, $q) {
		var baseURL = "/api/users/";
		var _headers = {
			"X-Requested-With": "XMLHttpRequest",
			"ContentType": "x-www-form-urlencoded"
		}

		this.currentUser = function() {
			var deferred = $q.defer();

			var url = baseURL + "current/";
			$http.get(url).then(
				function successCallback(response) {
					deferred.resolve(response.data);
				},
				function errorCallback(response) {
					deferred.reject(response.data);
				});

			return deferred.promise;
		}

		this.login = function(username, password) {
			var deferred = $q.defer();

			var url = baseURL + "login/";
			var data = { 'username': username, 'password': password };
			$http.post(url, data, {
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

		this.logout = function() {
			var deferred = $q.defer();

			var url = baseURL + "logout/";
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