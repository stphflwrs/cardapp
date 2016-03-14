'use strict';

/**
 * @ngdoc function
 * @name cardapp.controller:CardsUpdateCtrl
 * @description
 * # CardsUpdateCtrl
 * Controller of the cardapp
 */
angular.module('cardapp')
	.controller('CardsUpdateCtrl', function ($scope, $state, $stateParams, CardsService) {
		// Allows view to be hidden while loading
		$scope.display = false;

		// Scope variables
		// ---
		$scope.master = {};
		$scope.card = {};

		// Scope methods
		// ---
		$scope.saveCard = function () {
			CardsService.updateCard($scope.card).then(
				function successCallback(data) {
					$state.go('cards');
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		$scope.revert = function () {
			$scope.card = angular.copy($scope.master);
		}

		// Private methods
		// ---
		var init = function (cardID) {
			CardsService.retrieveCard(cardID).then(
				function successCallback(data) {
					$scope.master = angular.copy(data);
					$scope.card = data;
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		// Run it!
		init($stateParams.card_id);
	});