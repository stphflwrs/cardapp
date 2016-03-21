'use strict';

/**
 * @ngdoc function
 * @name cardapp.controller:PlayCtrl
 * @description
 * # PlayCtrl
 * Controller of the cardapp
 */
angular.module('cardapp')
	.controller('PlayCtrl', function ($scope, $stateParams, $q, UsersService, GamesService) {
		// Allows view to be hidden while loading
		$scope.display = false;

		// Scope variables
		// ---
		$scope.loggedIn = false;
		$scope.inGame = false;
		$scope.gameStarted = false;
		$scope.user = {};

		$scope.gameTitle = undefined;
		$scope.deckTitle = undefined;
		$scope.players = [];

		$scope.player = [];
		$scope.opponents = [];

		$scope.swapperIndex = -1;

		$scope.canSubmit = false;

		// Private variables
		// ---
		var socket = undefined;

		// Scope methods
		// ---
		// Adds currently logged in user to game (if not full)
		$scope.joinGame = function () {
			GamesService.joinGame($stateParams.game_id).then(
				function successCallback(data) {
					update();
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		// Adds AI to game if logged in user is in game
		$scope.addAIPlayer = function () {
			GamesService.addAIPlayer($stateParams.game_id).then(
				function successCallback(data) {
					update();
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		// Begins game if user who initiated is in the game
		$scope.startGame = function () {
			GamesService.startGame($stateParams.game_id).then(
				function successCallback(data) {
					update();
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		// Sets the selected card of a user in game
		$scope.selectCard = function (cardIndex) {
			if (!$scope.player.selected_card) {
				if ($scope.swapperIndex == -1) {
					if ($scope.player.hand[cardIndex].selected) {
						// Undo selection
						$scope.player.hand[cardIndex].selected = false;

						$scope.canSubmit = false;
					}
					else {
						// Unselect all cards
						$scope.player.hand.forEach(function (card) {
							card.selected = false;
						});

						// Pre-select card
						$scope.player.hand[cardIndex].selected = true;

						$scope.canSubmit = true;
					}
				}
				else {
					var selectedCards = [];
					$scope.player.hand.forEach(function (card, index) {
						if (card.selected) {
							selectedCards.push(index);
						}
					});

					// Properly select cards
					if (selectedCards.length < 2) {					
						$scope.player.hand[cardIndex].selected = !$scope.player.hand[cardIndex].selected;
					}
					else if (selectedCards.length == 2) {
						$scope.player.hand[cardIndex].selected = false;
					}

					selectedCards = [];
					$scope.player.hand.forEach(function (card, index) {
						if (card.selected) {
							selectedCards.push(index);
						}
					});

					if (selectedCards.length == 2) {
						$scope.canSubmit = true;
					}
					else {
						$scope.canSubmit = false;
					}
				}

			}
		};

		// Allows a chopsticks card to be played back into a hand
		$scope.playCard = function (cardIndex) {
			var playedCard = $scope.player.played_cards[cardIndex];
			var cardValue = playedCard.value;
			var cardType = cardValue.split(":")[1];
			if (cardType == "swapper" && $scope.player.hand.length > 1) {
				$scope.player.hand.forEach(function (card) {
					card.selected = false;
				});

				if (!playedCard.selected) {
					// Unselect all cards
					$scope.player.played_cards.forEach(function (card) {
						card.selected = false;
					});

					// Pre-select card
					$scope.player.played_cards[cardIndex].selected = true;

					$scope.swapperIndex = cardIndex;
				}
				else {
					delete playedCard.selected;

					$scope.swapperIndex = -1;
				}
			}
		};

		$scope.submitCards = function () {
			var selectedCards = [];
			$scope.player.hand.forEach(function (card, index) {
				if (card.selected) {
					selectedCards.push(index);
				}
			});

			if (selectedCards.length == 1) {
				GamesService.setCard($stateParams.game_id, selectedCards[0]).then(
					function successCallback(data) {
						$scope.player.selected_card = $scope.player.hand[cardIndex];
						$scope.player.hand.splice(selectedCards[0], 1);

						$scope.canSubmit = false;
					},
					function errorCallback(data) {
						console.log(data);
					});
			}
			else if (selectedCards.length == 2 && $scope.swapperIndex > -1) {
				console.log("asdf");
				GamesService.setCard($stateParams.game_id, selectedCards[0], $scope.swapperIndex, selectedCards[1]).then(
					function successCallback(data) {
						$scope.player.selected_card = $scope.player.hand[selectedCards[0]];
						$scope.player.hand.splice(cardIndex, 1);

						$scope.canSubmit = false;
					},
					function errorCallback(data) {
						console.log(data);
					});
			}
		};

		// Private methods
		// ---
		// Refresh all game data
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

		// Run it!
		init();

		// Socket.IO events
		// ---
		socket.on('user join', function () {
			update();
		});

		socket.on('advance turn', function () {
			update();
		});
	});