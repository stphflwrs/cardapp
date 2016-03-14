'use strict';

/**
 * @ngdoc function
 * @name cardapp.controller:GamesCtrl
 * @description
 * # GamesCtrl
 * Controller of the cardapp
 */
angular.module('cardapp')
	.controller('GamesCtrl', function ($scope, $state, GamesService, UsersService) {
		// Allows view to be hidden while loading
		$scope.display = true;

		// Scope variables
		// ---
		$scope.games = [];

		// Scope methods
		// ---
		$scope.join = function (gameID) {
			GamesService.joinGame(gameID).then(
				function successCallback(data) {
					$state.go('play', {game_id: gameID});
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		// Private methods
		// ---
		var init = function () {
			GamesService.retrieveGames().then(
				function successCallback(data) {
					$scope.games = data;

					if ($scope.loggedIn) {
						
					}

					// UsersService.currentUser().then(
					// 	function successCallback(data) {

					// 	},
					// 	function errorCallback(data) {

					// 	});
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		// Run it!
		init();
	});