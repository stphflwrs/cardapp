'use strict';

angular.module('cardapp')
	.controller('PlayCtrl', function ($scope, $stateParams, $q, UsersService, GamesService) {
		$scope.loggedIn = false;
		$scope.inGame = false;
		$scope.gameStarted = false;
		$scope.user = {};

		$scope.gameTitle = undefined;
		$scope.deckTitle = undefined;
		$scope.players = [];

		$scope.player = [];
		$scope.opponents = [];

		var socket = undefined;

		$scope.joinGame = function () {
			GamesService.joinGame($stateParams.game_id).then(
				function successCallback(data) {
					update();
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		$scope.addAIPlayer = function () {
			GamesService.addAIPlayer($stateParams.game_id).then(
				function successCallback(data) {
					update();
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		$scope.startGame = function () {
			GamesService.startGame($stateParams.game_id).then(
				function successCallback(data) {
					update();
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		$scope.selectCard = function (cardIndex) {
			if (!$scope.player.selected_card) {
				GamesService.setCard($stateParams.game_id, cardIndex).then(
					function successCallback(data) {
						$scope.player.selected_card = $scope.player.hand[cardIndex];
						$scope.player.hand.splice(cardIndex, 1);
					},
					function errorCallback(data) {
						console.log(data);
					});
			}
		};

		var update = function () {
			var promises = [];
			promises.push(GamesService.retrieveOpponents($stateParams.game_id));
			if ($scope.inGame) {
				promises.push(GamesService.retrieveSelf($stateParams.game_id));
			}

			$q.all(promises).then(
				function successCallback(data) {
					$scope.opponents = data[0];
					if ($scope.inGame) {
						$scope.player = data[1];
					}
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		var init = function () {
			socket = io('/', {
				query: "gameID=" + $stateParams.game_id
			});

			UsersService.currentUser().then(
        		function successCallback(data) {
        			$scope.loggedIn = true;
        			$scope.user = data;
        			fetchGame();
        		},
        		function errorCallback(data) {
        			fetchGame();
        		});

			var fetchGame = function () {
				GamesService.retrieveGame($stateParams.game_id).then(
					function successCallback(data) {
						$scope.gameTitle = data.title;
						$scope.deckTitle = data.deck_title;
						if (data.current_round > 0) {
							$scope.gameStarted = true;
						}

						// Check if a player is in game
						data.players.forEach(function (player) {
							if (player.user._id == $scope.user._id) {
								$scope.inGame = true;
							}
						});

						if ($scope.inGame) {
							fetchPlayers(false);
						}
						else {
							fetchPlayers(true);
						}
					},
					function errorCallback(data) {
						console.log(data);
					});
			};

			var fetchPlayers = function (isSpectating) {
				if (isSpectating) {
					GamesService.retrievePlayers($stateParams.game_id).then(
						function successCallback(data) {
							$scope.opponents = data;
						},
						function errorCallback(data) {
							console.log(data);
						});
				}
				else {
					$q.all([
						GamesService.retrieveSelf($stateParams.game_id),
						GamesService.retrieveOpponents($stateParams.game_id)
					]).then(
						function successCallback(data) {
							$scope.player = data[0];
							$scope.opponents = data[1];
						},
						function errorCallback(data) {
							console.log(data);
						});
				}
			};
		};

		init();

		socket.on('user join', function () {
			update();
		});

		socket.on('advance turn', function () {
			update();
		});
	});