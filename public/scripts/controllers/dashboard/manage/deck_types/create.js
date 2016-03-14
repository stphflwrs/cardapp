'use strict';

/**
 * @ngdoc function
 * @name cardapp.controller:DeckTypesCreateCtrl
 * @description
 * # DeckTypesCreateCtrl
 * Controller of the cardapp
 */
angular.module('cardapp')
	.controller('DeckTypesCreateCtrl', function ($scope, $state, $stateParams, DeckTypesService) {
		// Allows view to be hidden while loading
		$scope.display = false;

		// Scope variables
		// ---
		$scope.deckType = {};

		// Scope methods
		// ---
		$scope.saveDeckType = function () {
			DeckTypesService.createDeckType($scope.deckType).then(
				function successCallback(data) {
					$state.go('deck_types');
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		$scope.revert = function () {
			$scope.deckType = {};
		}

		// Private methods
		// ---
		var init = function (deckTypeID) {
			DeckTypesService.retrieveDeckType(deckTypeID).then(
				function successCallback(data) {
					$scope.deckType = data;
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		// Run it!
		init($stateParams.deck_type_id);
	});