'use strict';
angular.module('cardapp')
	.controller('DeckTypesCtrl', function($scope, DeckTypesService) {
		$scope.display = false;

		$scope.deckTypes = [];

		$scope.deleteDeckType = function(deckTypeNumber) {
			var deckTypeID = $scope.deckTypes[deckTypeNumber]._id;
			DeckTypesService.deleteDeckType(deckTypeID).then(
				function successCallback(data) {
					$scope.deckTypes.splice(deckTypeNumber, 1);
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		var init = function() {
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