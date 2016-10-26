// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'angularMoment']).run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            // cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
}).factory('shoppingCart', ['$rootScope', function($rootScope) {
    return {
        addToCart: function(product) {
            var obj = {};
            obj.type = "item";
            obj.qty = 1;
            obj.total = "";
            obj.item = {
                "sku": product.url.split('_')[0],
                "stock": product.stock,
                "price": product.price,
                "img": product.images[0],
                "name": product.name,
                "url": product.url
            };
            obj.addons = {
                "warranty": product.warrranties,
                "service": product.services
            };
            $rootScope.line.push(obj);
            return true;
        },
        removeFromCart: function(sku) {
            for (var i = $rootScope.line.length - 1; i >= 0; i--) {
                if ($rootScope.line[i].item.sku == sku) {
                    $rootScope.line.splice(i, 1);
                }
            }
        },
        checkoutCart: function() {}
    }
}
]).directive('stars', function() {
    return {
        restrict: 'E',
        scope: {
            rating: '=',
            type: '='
        },
        link: function(scope, elem, attr) {
            scope.$watch('rating', function() {
                var fullStars = Math.round(scope.rating);
                var emptyStars = 5 - fullStars;
                var fullIcon = '<i class="icon ion-ios-star"></i>';
                var emptyIcon = '<i class="icon ion-ios-star grey"></i>';
                var templateString = fullIcon.repeat(fullStars) + emptyIcon.repeat(emptyStars);
                elem.html(templateString);
            });
        }
    };
}).directive('stopEvent', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            element.bind('click', function(e) {
                e.stopPropagation();
            });
        }
    };
}).config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    }).state('app.track', {
        url: '/track',
        views: {
            'menuContent': {
                templateUrl: 'templates/search.html',
                controller: 'TrackCtrl'
            }
        }
    }).state('app.search', {
        url: '/search',
        views: {
            'menuContent': {
                templateUrl: 'templates/search.html'
            }
        }
    }).state('app.browse', {
        url: '/browse',
        views: {
            'menuContent': {
                templateUrl: 'templates/browse.html',
                controller: 'ContactCtrl'
            }
        }
    }).state('app.home', {
        url: '/home',
        views: {
            'menuContent': {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }
        }
    }).state('app.category', {
        url: '/category/:url/:name',
        views: {
            'menuContent': {
                templateUrl: 'templates/category.html',
                controller: 'CategoryCtrl'
            }
        }
    }).state('app.finder', {
        url: '/finder/:name/:categories',
        views: {
            'menuContent': {
                templateUrl: 'templates/finder.html',
                controller: 'FinderCtrl'
            }
        }
    }).state('app.product', {
        url: '/product/:product',
        views: {
            'menuContent': {
                templateUrl: 'templates/product.html',
                controller: 'ProductCtrl'
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
});
