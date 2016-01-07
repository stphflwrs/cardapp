angular.module('cardapp')
	.controller('GamesController', function ($scope, GamesService, UsersService) {
		$scope.display = true;

		$scope.games = [];

		var init = function () {
			GamesService.retrieveGames().then(
				function successCallback(data) {
					$scope.games = data;

					if ($scope.loggedIn) {
						
					}

					// UsersService.currentUser().then(
					// 	function successCallback(data) {

					// 	},
					// 	function errorCallback(data) {

					// 	});
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		init();
	});