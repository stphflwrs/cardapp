'use strict';

/**
 * @ngdoc function
 * @name cardapp.controller:CardsCtrl
 * @description
 * # CardsCtrl
 * Controller of the cardapp
 */
angular.module('cardapp')
	.controller('CardsCtrl', function ($scope, CardsService) {
		// Allows view to be hidden while loading
		$scope.display = false;

		// Scope variables
		// ---
		$scope.cards = [];

		// Scope methods
		// ---
		$scope.deleteCard = function (cardNumber) {
			// * DOES NOT ASK FOR CONFIRMATION *

			var cardID = $scope.cards[cardNumber]._id;
			CardsService.deleteCard(cardID).then(
				function successCallback(data) {
					$scope.cards.splice(cardNumber, 1);
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		// Private methods
		// ---
		var init = function () {
			CardsService.retrieveCards().then(
				function successCallback(data) {
					$scope.cards = data;
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		// Run it!
		init();
	});