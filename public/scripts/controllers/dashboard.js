'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('cardapp')
    .controller('DashboardCtrl', function($scope, $cookies, $state, UsersService) {
    	$scope.loggedIn = false;
    	$scope.user = {};
    	
    	$scope.logout = function() {
    		UsersService.logout().then(
    			function successCallback(data) {
    				$state.reload('dashboard');
    			},
    			function errorCallback(data) {
    				console.log("Error logging out.");
    			});
    	};

        var init = function () {
        	UsersService.currentUser().then(
        		function successCallback(data) {
        			$scope.loggedIn = true;
        			$scope.user = data;
        		},
        		function errorCallback(data) {
                    
        		});
        };

        init();

        $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            var clearance = 0;
            if ($scope.loggedIn)
                clearance = $scope.user.clearance;
            
            if (toState.clearance > clearance) {
                $state.go('login');
            }
        });
    });
