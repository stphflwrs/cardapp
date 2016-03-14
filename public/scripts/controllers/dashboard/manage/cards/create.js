'use strict';

/**
 * @ngdoc function
 * @name cardapp.controller:CardsCreateCtrl
 * @description
 * # CardsCreateCtrl
 * Controller of the cardapp
 */
angular.module('cardapp')
	.controller('CardsCreateCtrl', function ($scope, $state, CardsService) {
		// Allows view to be hidden while loading
		$scope.display = false;

		// Scope variables
		// ---

		$scope.card = {};

		// Scope methods
		// ---
		$scope.saveCard = function () {
			CardsService.createCard($scope.card).then(
				function successCallback(data) {
					$state.go('cards');
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		$scope.revert = function() {
			$scope.card = {};
		}

		// Private methods
		// ---
		var init = function() {

		};

		// Run it!
		init();
	});