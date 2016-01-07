angular.module('cardapp')
	.controller('GamesController', function ($scope, GamesService) {
		$scope.display = true;

		$scope.games = [];

		var init = function () {
			GamesService.retrieveGames().then(
				function successCallback(data) {
					$scope.games = data;
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		init();
	});