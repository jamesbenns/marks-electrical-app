// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'starter.controllers', 'angularMoment']);

app.run(function($ionicPlatform) {
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
});

app.factory('cartService', ['$rootScope', 'productService', '$ionicSideMenuDelegate', function($rootScope, productService, $ionicSideMenuDelegate) {

    $rootScope.cart = [];

    $rootScope.checkout = {
        "checkout": {
        "customer": {
            "id": "",
            "billing": {
            "title": "",
            "firstName": "",
            "lastName": "",
            "email": "",
            "phone": "",
            "mobile": "",
            "companyName": "",
            "street": "",
            "city": "",
            "county": "",
            "postcode": ""
            },
            "delivery": {
            "title": "",
            "firstName": "",
            "lastName": "",
            "email": "",
            "phone": "",
            "mobile": "",
            "companyName": "",
            "street": "",
            "city": "",
            "county": "",
            "postcode": ""
            },
            "marketing-consent": true,
            "trade-customer": false
        },
        "delivery": {
            "type": "",
            "date": "",
            "run": "",
            "notes": ""
        },
        "basket": {
            "summary": {
            "num": "",
            "total": ""
            },
            "lines": [],
            "promos": {
            "code": "",
            "amount": ""
            }
        }
        },
        "stripeToken": ""
    };

    return {
        addToCartBySku: function(sku) {
            productService.get(sku, false).then(function(product){
                product.quantity = 1;
                $rootScope.cart.push(product);
                $ionicSideMenuDelegate.toggleRight(true);
            });
        },
        addToCartByObject: function(product) {
            product.quantity = 1;
            $rootScope.cart.push(product);
            $ionicSideMenuDelegate.toggleRight(true);
        },
        removeFromCart: function(sku){
              for (var i = 0; i < $rootScope.cart.length; i++) {
                if ($rootScope.cart[i].sku == sku) {
                    $rootScope.cart.splice(i, 1);
                    break
                }
            }          
        },
        total: function(){
            var total = 0;
            for (var i = $rootScope.cart.length - 1; i >= 0; i--) {
                total += $rootScope.cart[i].price * $rootScope.cart[i].quantity;
            }
            return total;
        },
        isProductInCart: function(sku){
            for (var i = 0; i < $rootScope.cart.length ; i++) {
                if ($rootScope.cart[i].sku == sku) {
                return true;
                }
            }
        },
        quantityUp: function(sku){
              for (var i = 0; i < $rootScope.cart.length; i++) {
                if ($rootScope.cart[i].sku == sku) {
                    $rootScope.cart[i].quantity++
                    break
                }
            }   
        },
        quantityDown: function(sku){
              for (var i = 0; i < $rootScope.cart.length; i++) {
                if ($rootScope.cart[i].sku == sku) {
                    if($rootScope.cart[i].quantity >1){
                        $rootScope.cart[i].quantity--
                    }
                    break
                }
            }   
        }
    }
}
]);

app.factory('productService', ['$http', '$rootScope', '$state', '$ionicSideMenuDelegate', function($http, $rootScope, $state, $ionicSideMenuDelegate) {

    $rootScope.recentProducts = [];

    function inRecentProducts(product){
      for (var i = 0; i < $rootScope.recentProducts.length; i++) {
          if ($rootScope.recentProducts[i].name === product.name) {
              return true;
          }
      }
      return false;
    };

    return {
        categories: function(){
            $http.get('http://markselectrical.co.uk/categories?api=').success(function(data) {
                $scope.categories = data.categories;
            });
        },
        goToCategory: function(object){
            if (object.type){
                $state.go('app.category', { 'url': object.url.split('-')[0], 'name': object.offer}); 
            }            
            if (object.children) {

                $state.go('app.finder', { 'name': object.code, 'categories': object });

            }
            if(object.code && !object.children) {

                $state.go('app.category', { 'url': object.url, 'name': object.name });

            }
        },
        goToProduct: function(product){
            if (!inRecentProducts(product)) {
            
                $rootScope.recentProducts.unshift(product);
                $rootScope.recentProducts = $rootScope.recentProducts.slice(0,5);
            
            };

            // Go to product page and close menu
            $state.go('app.product', {'name': product.name,'product': product});
            $ionicSideMenuDelegate.toggleRight(false);

        },
        get: function(sku, addReviews) {

            var product;
            var productData;
            var reviewData;
            var count = 0;

           return new Promise(function(resolve, reject) {

               var productData;
               var reviewData;

                $http.get('http://markselectrical.co.uk/' + sku + '?api').success(function(data) {
                    if(!addReviews){
                        resolve(data[0])
                    }
                    productData = data[0];
                    count++;
                    if(count === 2){
                        productData["reviewData"] = reviewData;
                        resolve(productData)
                    }
                });
                if(addReviews){

                    $http.get('http://api.bazaarvoice.com/data/reviews.json?apiversion=5.4&passkey=caGNjXYwRCUrhX5c9VuHRgl7vgc4GPmGZYWqgxvKUxtPA&Filter=ProductId:' + sku + '&Sort=SubmissionTime:desc&Include=Products&Stats=Reviews&Limit=10').success(function(data) {
                        if(data.TotalResults){
                            reviewData = data.Results;
                        };
                        count++
                        if(count === 2){
                            productData["reviewData"] = reviewData;
                            resolve(productData)
                        }
                    });

                }

            })
        },

    }

}
]);

app.directive('stars', function() {
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
});

app.directive('stopEvent', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            element.bind('click', function(e) {
                e.stopPropagation();
            });
        }
    };
});

app.config(function($stateProvider, $urlRouterProvider) {
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
        params: {name: null, url: null},
        views: {
            'menuContent': {
                templateUrl: 'templates/category.html',
                controller: 'CategoryCtrl'
            }
        }
    }).state('app.finder', {
        params: {name: null, categories: {}},
        views: {
            'menuContent': {
                templateUrl: 'templates/finder.html',
                controller: 'FinderCtrl'
            }
        }
    }).state('app.product', {
        params: {name: null, product: {}},
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
