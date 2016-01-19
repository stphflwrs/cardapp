angular.module('cardapp')
	.controller('DeckTypesCreateCtrl', function($scope, $state, $stateParams, DeckTypesService) {
		$scope.display = false;

		$scope.deckType = {};

		$scope.saveDeckType = function() {
			DeckTypesService.createDeckType($scope.deckType).then(
				function successCallback(data) {
					$state.go('deck_types');
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		$scope.revert = function() {
			$scope.deckType = {};
		}

		var init = function(deckTypeID) {
			DeckTypesService.retrieveDeckType(deckTypeID).then(
				function successCallback(data) {
					$scope.deckType = data;
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		init($stateParams.deck_type_id);
	});