angular.module('cardapp')
	.controller('PlayCtrl', function ($scope, $stateParams, GamesService) {

		$scope.gameTitle = undefined;
		$scope.deckTitle = undefined;
		$scope.players = [];

		$scope.player = [];
		$scope.opponents = [];

		$scope.selectCard = function (cardIndex) {
			GamesService.setCard($stateParams.game_id, cardIndex).then(
				function successCallback(data) {
					console.log(data)
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		var init = function () {
			GamesService.retrieveGame($stateParams.game_id).then(
				function successCallback(data) {
					console.log(data);
					$scope.gameTitle = data.title;
					$scope.deckTitle = data.deck_title;
					$scope.players = data.players;

					GamesService.retrieveOpponents($stateParams.game_id).then(
						function successCallback(data) {
							$scope.opponents = data;

							GamesService.retrieveSelf($stateParams.game_id).then(
								function successCallback(data) {
									$scope.player = data;
								},
								function errorCallback(data) {
									console.log(data);
								});
						},
						function errorCallback(data) {
							console.log(data);
						});
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		init();
	});