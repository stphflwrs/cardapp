angular.module('cardapp')
	.controller('PlayCtrl', function ($scope, $stateParams, $q, UsersService, GamesService) {
		$scope.loggedIn = false;
		$scope.user = {};

		$scope.gameTitle = undefined;
		$scope.deckTitle = undefined;
		$scope.players = [];

		$scope.player = [];
		$scope.opponents = [];

		var socket = undefined;

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
						$scope.players = data.players;
						if ($scope.loggedIn) {
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

		socket.on('userjoin', function (msg) {
			console.log(msg);
		});

		socket.on('advance turn', function () {
			update();
		});
	});