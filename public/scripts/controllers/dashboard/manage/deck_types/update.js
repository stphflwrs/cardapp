'use strict';

/**
 * @ngdoc function
 * @name cardapp.controller:DeckTypesUpdateCtrl
 * @description
 * # DeckTypesUpdateCtrl
 * Controller of the cardapp
 */
angular.module('cardapp')
	.controller('DeckTypesUpdateCtrl', function ($scope, $state, $stateParams, $q, DeckTypesService, CardsService) {
		// Allow view to be hidden while loading
		$scope.display = false;

		// Scope variables
		// ---
		$scope.master = {};
		$scope.deckType = {};
		$scope.cards = [];
		$scope.selectedCard = {};

		// Scope methods
		// ---
		// Adds selected card to the current deck
		$scope.addCard = function (cardNumber) {
			var card = $scope.cards[cardNumber];
			var amount = 1;
			var data = {card, amount};

			$scope.deckType.cards = $scope.deckType.cards.concat(data);
		};

		$scope.saveDeckType = function () {
			DeckTypesService.updateDeckType($scope.deckType).then(
				function successCallback(data) {
					$state.go('deck_types');
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		$scope.revert = function () {
			$scope.deckType = angular.copy($scope.master);
		}

		// Private methods
		// ---
		var init = function (deckTypeID) {
			DeckTypesService.retrieveDeckType(deckTypeID).then(
				function successCallback(data) {
					$scope.master = angular.copy(data);
					$scope.deckType = data;
				},
				function errorCallback(data) {
					console.log(data);
				});

			$q.all([
				DeckTypesService.retrieveDeckType(deckTypeID),
				CardsService.retrieveCards()
			]).then(
				function successCallback(data) {
					$scope.master = angular.copy(data[0]);
					$scope.deckType = data[0];
					$scope.cards = data[1];
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		// Run it!
		init($stateParams.deck_type_id);
	});