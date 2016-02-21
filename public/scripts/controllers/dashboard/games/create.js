angular.module('cardapp')
	.controller('GamesCreateCtrl', function ($scope, $state, GamesService, DeckTypesService) {

		$scope.deckTypes = [];

		$scope.gameTitle = undefined;
		$scope.selectedDeckType = {};

		$scope.errors = {};

		$scope.setDeckType = function (deckType) {
			DeckTypesService.retrieveDeckType(deckType._id).then(
				function successCallback(data) {
					$scope.selectedDeckType = data;
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		$scope.saveGame = function () {
			if (!validate()) {
				return;
			}

			var submission = {
				title: $scope.gameTitle,
				deck_title: $scope.selectedDeckType.label
			};

			GamesService.createGame(submission, $scope.selectedDeckType._id).then(
				function successCallback(data) {
					$state.go('games');
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		var validate = function () {
			$scope.errors = {
				errors: false
			};

			if (!$scope.gameTitle) {
				$scope.errors.gameTitle = "A room name is required.";
				$scope.errors.errors = true;
			}

			if (!$scope.selectedDeckType._id) {
				$scope.errors.deckType = "Please select a deck.";
				$scope.errors.errors = true;
			}

			if (!$scope.errors.errors) {
				return true;
			}
			else {
				return false;
			}
		};

		var init = function () {
			DeckTypesService.retrieveDeckTypes().then(
				function successCallback(data) {
					$scope.deckTypes = data;
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		init();
	});