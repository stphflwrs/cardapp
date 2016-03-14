'use strict';

/**
 * @ngdoc function
 * @name cardapp.controller:DeckTypesCtrl
 * @description
 * # DeckTypesCtrl
 * Controller of the cardapp
 */
angular.module('cardapp')
	.controller('DeckTypesCtrl', function ($scope, DeckTypesService) {
		// Allows view to be hidden while loading
		$scope.display = false;

		// Scope variables
		// ---
		$scope.deckTypes = [];

		// Scope methods
		// ---
		$scope.deleteDeckType = function (deckTypeNumber) {
			// * DOES NOT ASK FOR CONFIRMATION *

			var deckTypeID = $scope.deckTypes[deckTypeNumber]._id;
			DeckTypesService.deleteDeckType(deckTypeID).then(
				function successCallback(data) {
					$scope.deckTypes.splice(deckTypeNumber, 1);
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		// Private methods
		// ---
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