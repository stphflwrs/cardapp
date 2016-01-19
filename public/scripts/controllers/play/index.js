angular.module('cardapp')
	.controller('PlayCtrl', function ($scope, $stateParams, GamesService) {

		$scope.gameTitle = undefined;
		$scope.deckTitle = undefined;
		$scope.players = [];

		var init = function () {
			GamesService.retrieveGame($stateParams.game_id).then(
				function successCallback(data) {
					console.log(data);
					$scope.gameTitle = data.title;
					$scope.deckTitle = data.deck_title;
					$scope.players = data.players;
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		init();
	});