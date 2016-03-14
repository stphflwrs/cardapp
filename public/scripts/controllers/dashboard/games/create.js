'use strict';

/**
 * @ngdoc function
 * @name cardapp.controller:GamesCreateCtrl
 * @description
 * # GamesCreateCtrl
 * Controller of the cardapp
 */
angular.module('cardapp')
	.controller('GamesCreateCtrl', function ($scope, $state, GamesService, DeckTypesService) {
		// Allows view to be hidden while loading
		$scope.display = false;

		// Scope variables
		// ---
		$scope.deckTypes = [];
		$scope.gameTitle = undefined;
		$scope.selectedDeckType = {};
		$scope.errors = {};


		// Scope methods
		// ---
		// Sets the deck for the game being created
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


		// Private methods
		// ---
		// Client side validation
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

		// Run it!
		init();
	});