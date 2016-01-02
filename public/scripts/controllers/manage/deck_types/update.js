angular.module('cardapp')
	.controller('DeckTypesUpdateCtrl', function($scope, $state, $stateParams, $q, DeckTypesService, CardsService) {
		$scope.display = false;

		$scope.master = {};
		$scope.deckType = {};

		$scope.cards = [];
		$scope.selectedCard = {};

		$scope.addCard = function(cardNumber) {
			var card = $scope.cards[cardNumber];
			var amount = 1;
			var data = {card, amount};

			$scope.deckType.cards = $scope.deckType.cards.concat(data);
		};

		$scope.saveDeckType = function() {
			DeckTypesService.updateDeckType($scope.deckType).then(
				function successCallback(data) {
					$state.go('deck_types');
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		$scope.revert = function() {
			$scope.deckType = angular.copy($scope.master);
		}

		var init = function(deckTypeID) {
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
					// console.log($scope.cards);
					console.log($scope.deckType.cards);
				},
				function errorCallback(data) {

				});
		};

		init($stateParams.deck_type_id);
	});