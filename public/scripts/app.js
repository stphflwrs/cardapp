'use strict';

/**
 * @ngdoc overview
 * @name yapp
 * @description
 * # yapp
 *
 * Main module of the application.
 */
angular
    .module('cardapp', [
        'ui.router',
        'ngAnimate',
        'oc.lazyLoad',
        'ui.bootstrap',
        'ngCookies'
    ])
    .config(function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {

        $ocLazyLoadProvider.config({
            debug:false,
            events:true
        });

        $urlRouterProvider.when('/management', '/management/cards');
        $urlRouterProvider.otherwise('/home/');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/login.js',
                            'scripts/services/users.js'
                            ]
                        });
                    }
                }
            })
            .state('dashboard', {
              abstract: true,
              url: '/home',
              templateUrl: 'views/dashboard.html',
              controller: 'DashboardCtrl',
              resolve: {
                loadMyFiles: function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'cardapp',
                        files: [
                        'scripts/controllers/dashboard.js',
                        'scripts/services/users.js'
                        ]
                    })
                }
              }
            })
            .state('home', {
              url: '/',
              parent: 'dashboard',
              templateUrl: 'views/dashboard/overview.html',
            })
            .state('games', {
                url: '/games',
                parent: 'dashboard',
                templateUrl: 'views/dashboard/games/index.html',
                controller: 'GamesCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/dashboard/games/index.js',
                            'scripts/services/games.js'
                            ]
                        });
                    }
                }
            })
            .state('games-create', {
                url: '/games/create',
                parent: 'dashboard',
                templateUrl: 'views/dashboard/games/create.html',
                controller: 'GamesCreateCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/dashboard/games/create.js',
                            'scripts/services/games.js',
                            'scripts/services/deck_types.js'
                            ]
                        });
                    }
                }
            })
            .state('cards', {
                url: '/cards',
                parent: 'dashboard',
                templateUrl: 'views/dashboard/manage/cards/index.html',
                controller: 'CardsCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/dashboard/manage/cards/index.js',
                            'scripts/services/cards.js'
                            ]
                        });
                    }
                }
            })
            .state('cards-create', {
                url: '/cards/new',
                parent: 'dashboard',
                templateUrl: 'views/dashboard/manage/cards/create.html',
                controller: 'CardsCreateCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/dashboard/manage/cards/create.js',
                            'scripts/services/cards.js'
                            ]
                        });
                    }
                }
            })
            .state('cards-update', {
                url: '/cards/edit/:card_id',
                parent: 'dashboard',
                templateUrl: 'views/dashboard/manage/cards/update.html',
                controller: 'CardsUpdateCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/dashboard/manage/cards/update.js',
                            'scripts/services/cards.js'
                            ]
                        });
                    }
                }
            })
            .state('deck_types', {
                url: '/decktypes',
                parent: 'dashboard',
                templateUrl: 'views/dashboard/manage/deck_types/index.html',
                controller: 'DeckTypesCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/dashboard/manage/deck_types/index.js',
                            'scripts/services/deck_types.js'
                            ]
                        });
                    }
                }
            })
            .state('deck_types-create', {
                url: '/deck_types/new',
                parent: 'dashboard',
                templateUrl: 'views/dashboard/manage/deck_types/create.html',
                controller: 'DeckTypesCreateCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/dashboard/manage/deck_types/create.js',
                            'scripts/services/deck_types.js'
                            ]
                        });
                    }
                }
            })
            .state('deck_types-update', {
                url: '/decktypes/edit/:deck_type_id',
                parent: 'dashboard',
                templateUrl: 'views/dashboard/manage/deck_types/update.html',
                controller: 'DeckTypesUpdateCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/dashboard/manage/deck_types/update.js',
                            'scripts/services/deck_types.js',
                            'scripts/services/cards.js'
                            ]
                        });
                    }
                }
            })

            .state('play', {
                url: '/play/:game_id',
                templateUrl: 'views/play/index.html',
                controller: 'PlayCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/play/index.js',
                            'scripts/services/games.js'
                            ]
                        })
                    }
                }
            });

  });
