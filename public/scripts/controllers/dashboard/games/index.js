angular.module('cardapp')
	.controller('GamesCtrl', function ($scope, $state, GamesService, UsersService) {
		$scope.display = true;

		$scope.games = [];

		$scope.join = function (gameID) {
			GamesService.joinGame(gameID).then(
				function successCallback(data) {
					$state.go('play', {game_id: gameID});
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

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