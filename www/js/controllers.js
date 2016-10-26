angular.module('starter.controllers', ['rzModule'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $location, $window, $state, $rootScope, $ionicSlideBoxDelegate, shoppingCart, $ionicSideMenuDelegate) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $rootScope.line = [];

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });


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
                                    "company-name": "",
                                    "street": "",
                                    "city": "",
                                    "county": "",
                                    "postcode": ""
                                 },
                                 "delivery": {
                                    "title": "",
                                    "first-name": "",
                                    "last-name": "",
                                    "email": "",
                                    "phone": "",
                                    "mobile": "",
                                    "company-name": "",
                                    "street": "",
                                    "city": "",
                                    "county": "",
                                    "postcode": ""
                                 },
                                 "marketing-consent": "",
                                 "trade-customer": ""
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
                                 "lines": {
                                    "line": []
                                 },
                                 "promos": {
                                    "code": "",
                                    "amount": ""
                                 }
                              }
                           },
                           "stripeToken" : ""
                        };

  $scope.addToCart = function(product) {
    shoppingCart.addToCart(product);
    $ionicSideMenuDelegate.toggleRight(true);
    $scope.$digest;
  }

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.currentCategory = {};

  $scope.setCategory = function (object) {

    if (object.children) {

      var jsonString = JSON.stringify(object);
      var base64 = btoa(jsonString);
      $state.go('app.finder', { 'name': object.name, 'categories': base64 });

    } else {

      $state.go('app.category', { 'url': object.url, 'name': object.name });

    }

  };

  $scope.recentProducts = [];

  function notInRecentYet(obj, list) {
      var i;
      for (i = 0; i < list.length; i++) {
          if (list[i].name === obj.name) {
              console.log("already in recent prods");
              return false;
          }
      }
      return true;
  }

  $scope.setProduct = function (object) {

    // Check if request came from cart or category
    if (!object.images) {

      $scope.currentProduct.images = [object.img]

    }

    $scope.currentProduct = object;

    // Add to recentProducts if not already there
    if (notInRecentYet(object, $scope.recentProducts)) {
      
      $scope.recentProducts.unshift(object);
      $scope.recentProducts = $scope.recentProducts.slice(0,5);
      $ionicSlideBoxDelegate.update()
    
    }

    // Go to product page and close menu
    $state.go('app.product');
    $ionicSideMenuDelegate.toggleRight(false);

  };


  $scope.isEnabled = function() {
    if ($state.current.name == "app.home" || $state.current.name == "app.browse" || $state.current.name == "app.track") {
      return true
    } else {
      return false
    }
  }

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

})

.controller('HomeCtrl', function($scope, $http, $rootScope, $window) {
 
  $scope.home = {search:"", results:{}};

  $http.get('http://markselectrical.co.uk/categories?api=').success(function(data) {
      $scope.categories = data.categories;
  });

  $scope.promoClick = function(type, url){
    if(type == "page"){
      var URL = "http://markselectrical.co.uk/" + url;
      window.open(URL, "_blank", "location=no");
    }
    if (type == "category") {
      window.alert("category")
    };
  };

  $http.get('http://markselectrical.co.uk/?api=').success(function(data) {
      $rootScope.promotions = data.promotions;
  });

  $scope.searchFunc = function(){
    $http.get('http://markselectrical.co.uk/search?api=&keyword=' + $scope.home.search).success(function(data) {
        $scope.home.results = data.items;
        $scope.loading = false;
    });
    $scope.loading = true;
  };

})

.controller('TrackCtrl', function($scope, $http, $rootScope) {

  $scope.order = {};

  $scope.go = function(){
    $http.get('http://services.markselectrical.co.uk/services/remote/getorder?orderno=' + $scope.order.no).success(function(data) {
       $scope.orderDetails = data;
    });
  }

})

.controller('ContactCtrl', function($scope, $ionicHistory, $compile) {

      var map;
      (function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 52.6518702, lng: -1.1788397},
          zoom: 12
        });

        //Marker + infowindow + angularjs compiled ng-click
        var contentString1 = "<div><b>Our Showroom</b><br>LE3 5QG</div>";
        var compiled1 = $compile(contentString1)($scope);

        var infowindow1 = new google.maps.InfoWindow({
          content: compiled1[0]
        });

        var contentString2 = "<div><b>Head Office<br>Click&Collect</b><br>LE3 1TU</div>";
        var compiled2 = $compile(contentString2)($scope);

        var infowindow2 = new google.maps.InfoWindow({
          content: compiled2[0]
        });

        var showroom = new google.maps.Marker({
          position: {lat: 52.6343498, lng: -1.1504682},
          map: map,
          title: 'Uluru (Ayers Rock)'
        });

        google.maps.event.addListener(showroom, 'click', function() {
          infowindow1.open(map,showroom);
        });

        var office = new google.maps.Marker({
          position: {lat: 52.6327138, lng: -1.210706},
          map: map,
          title: 'Uluru (Ayers Rock)'
        });

        google.maps.event.addListener(office, 'click', function() {
          infowindow2.open(map,office);
        });

        infowindow1.open(map,showroom);
        infowindow2.open(map,office);

      }())

})

.controller('MenuCtrl', function($scope, $http, $state, $rootScope, shoppingCart, $ionicModal, $ionicPopup) {

  $scope.customer = {};

  $scope.moreInfo = function(heading, price) {
   var alertPopup = $ionicPopup.alert({
     title: heading,
     template: "All appliances come with a warranty, but they can run out after as little as a year. By extending your warranty you can protect yourself against excessive call-out, parts and labour charges.<h2 class='popup-title text-center'><b>£" + price + "</b></h2>"
   });
  };

  $ionicModal.fromTemplateUrl('templates/checkout.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.checkoutModal = modal;
  });

  $scope.step = 1;

  $scope.delivery = {};

  $scope.delivery.sameAsBilling = true;
  
  var regEx = /^(([gG][iI][rR] {0,}0[aA]{2})|((([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y]?[0-9][0-9]?)|(([a-pr-uwyzA-PR-UWYZ][0-9][a-hjkstuwA-HJKSTUW])|([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y][0-9][abehmnprv-yABEHMNPRV-Y]))) {0,}[0-9][abd-hjlnp-uw-zABD-HJLNP-UW-Z]{2}))$/;

  $scope.checkPostcode = function() {

    if (regEx.test($rootScope.checkout.checkout.customer.billing.postcode)) {

      $scope.spinner = true;

      $http.get('https://api.getaddress.io/v2/uk/' + $rootScope.checkout.checkout.customer.billing.postcode + "?api-key=vk0rTuIyEkuaG2D4PJ6W_w5849").success(function(data) {
         
         $scope.addresses = data.Addresses;
         $scope.checkout.checkout.customer.billing.address = data.Addresses[0];

         $scope.spinner = false;
         console.log(data)
      });

    }
    
  }

  Stripe.setPublishableKey('pk_test_cobElgNGhqi3XBUFvIW1LtgN');

  $scope.submit = function() {
    var form = document.getElementById('payment-form');
    Stripe.card.createToken(form, stripeResponseHandler);
    return false
  }

  $scope.mask = function() {
    var str2 = document.getElementById('cardNumber').value;
    var str = str2.replace(/\s+/g, '');
    var arr = str.split('');
    var mask = "";
    var count = 0;

      for (var i = 0; i < arr.length; i++) {

        console.log(mask);
        if (count == 4) {
          mask += " " + arr[i];
          count = 0;
        } else {
          mask += arr[i];
        }          count ++

      }
      document.getElementById('cardNumber').value = mask;      

  }

  function stripeResponseHandler(status, response) {
  // Grab the form:
  var form = document.getElementById('payment-form');

  if (response.error) { // Problem!

    // Show the errors on the form:
    document.getElementById('payment-errors').text(response.error.message);
    
    // Re-enable submission

  } else { // Token was created!

    // Get the token ID:
    var token = response.id;

    // Insert the token ID into the form so it gets submitted to the server:
    window.alert(token);

    // Submit the form:
    document.getElementById('payment-form').submit;
  }
};

  $scope.twoManDel = function() {
    if ($scope.customer.twoManDel) {
      var obj = {};
      obj.type = "service";
      obj.qty = 1;
      obj.total = 29.99;
      obj.item = {};
      obj.item.sku = "TWOMANDEL";
      obj.item.price = 29.99;
      $rootScope.line.push(obj);
    } else {
      for (var i = $rootScope.line.length - 1; i >= 0; i--) {
        if ($rootScope.line[i].item.sku == "TWOMANDEL") {
          $rootScope.line.splice(i, 1);
        }
      }
    }
  }

  $scope.customer.address = 1;

  // Triggered in the login modal to close it
  $scope.closeCheckoutModal = function() {
    $scope.checkoutModal.hide();
  };

  $scope.checkOut = function(){
    shoppingCart.checkoutCart();
    console.log($rootScope.checkout);
    $scope.checkoutModal.show();
  };

  $scope.changeQuantity = function(direction, sku) {
    if (direction == "up") {
      for (var i = $rootScope.line.length - 1; i >= 0; i--) {
          if ($rootScope.line[i].item.sku == sku) {
            $rootScope.line[i].qty ++;
            return true;
          }
      }
    }
    if (direction == "down") {
      for (var i = $rootScope.line.length - 1; i >= 0; i--) {
          if ($rootScope.line[i].item.sku == sku && $rootScope.line[i].qty > 1) {
            $rootScope.line[i].qty --;
            return true;
          }
      }
    }
  }

  $scope.cartTotal = function() {
    var total = 0;
    for (var i = $rootScope.line.length - 1; i >= 0; i--) {
        total += $rootScope.line[i].item.price * $rootScope.line[i].qty;
        if ($rootScope.line[i].type == 'item' && $rootScope.line[i].addons.warranty.length) {
          if ($rootScope.line[i].addons.warranty[0].on)
          total += $rootScope.line[i].addons.warranty[0].price
        }
    }
    if (true) {}
    return total;
  }

  $scope.removeItem = function (productId) {
    shoppingCart.removeFromCart(productId);
  }

	$scope.showCategories = false;
	$scope.show = [];

	$scope.toggle2 = function (id) {
		$scope.show[id] = !$scope.show[id]
	}

	$scope.toggle = function () {
		$scope.showCategories = !$scope.showCategories;
	}

})

.controller('CategoryCtrl', function($scope, $stateParams, $ionicPopup, $http) {

  var category = $stateParams.url;

  console.log($stateParams);

  var pageNumber = 1;

  $scope.products = [];

  $scope.more = true;

  var maxPrice = 0;

  var minPrice = Infinity;

  $scope.list = {};

  $scope.list.order = 'popular-order-asc';

  $scope.orderChange = function(){
    $scope.more = true;
    pageNumber = 1;
    $scope.products = [];
    $scope.loadMore()    
  };

  $http.get('http://markselectrical.co.uk/' + category + '?api').success(function (data) {
    
    $scope.numberOfItems = data.meta.totalNumItems;

    $scope.minRangeSlider = {
        minValue: Math.floor(data.meta.pricemin),
        maxValue: Math.ceil(data.meta.pricemax),
        options: {
            floor: Math.floor(data.meta.pricemin),
            ceil: Math.ceil(data.meta.pricemax),
            step: 1,
            translate: function(price) {
              return '£' + price;
            }
        }
    };

    $scope.loadMore = function() {

      var url = 'http://markselectrical.co.uk/' + category + '-' + 'page-' + pageNumber + '-sort-' + $scope.list.order + '-' + 'show-12A' + '?api';

      if ($scope.products.length < $scope.numberOfItems) {
          
          // Load the data from Marks Electrical api. 
          $http.get(url).success(function (data) {
            angular.forEach(data.items, function (value, key) {

              $http.get("http://api.bazaarvoice.com/data/statistics.json?apiversion=5.4&passkey=caGNjXYwRCUrhX5c9VuHRgl7vgc4GPmGZYWqgxvKUxtPA&filter=productid:" + value.url.split('_')[0] +"&stats=Reviews,NativeReviews").success(function (data) {
                if (data.TotalResults) {
                
                value.rating = data.Results[0].ProductStatistics.ReviewStatistics.AverageOverallRating;
                value.numberOfReviews = data.Results[0].ProductStatistics.ReviewStatistics.TotalReviewCount;

                };

              })

              $scope.products.push(value);

            });

          })
          
          .error (function (data, status, headers) {
            
            // Disable infinite scroll since we've got an error.
            $scope.more = false;        
              
              // Otherwise show general alert.
              $ionicPopup.alert({
                title: 'Sorry, there has been an error',
                template: 'Please try again later.'
              });

          })
          
          .finally(function () {
            
            pageNumber++;
            $scope.init = true;
            $scope.$broadcast('scroll.infiniteScrollComplete');

          });

      } else {

        $scope.more = false;
        
      }

    };

  });

  $scope.location = function() {
    return $stateParams;
  }

})

.controller('FinderCtrl', function($scope, $rootScope, $stateParams, $http) {

  $scope.category = JSON.parse(atob($stateParams.categories));
  console.log($scope.category)
})

.controller('ProductCtrl', function($scope, $stateParams, $http, shoppingCart, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $rootScope) {
  
  $scope.checkCart = function(sku) {
    for (var i = 0; i < $rootScope.line.length ; i++) {
        if ($rootScope.line[i].item.sku == sku) {
          return true;
        }
    }
  };

  $scope.tab = 1;

  function getProductData(){

    $http.get('http://markselectrical.co.uk/' + $scope.currentProduct.url + '?api').success(function(data) {

      $scope.product = data[0];
      $scope.productData = data[0].images.slice(1,6);
      $scope.summary = data[0].summary;
      $scope.description = data[0].description;
      $ionicSlideBoxDelegate.update();
      $scope.productId = data[0].url.split('_')[0];

      $http.get('http://api.bazaarvoice.com/data/reviews.json?apiversion=5.4&passkey=caGNjXYwRCUrhX5c9VuHRgl7vgc4GPmGZYWqgxvKUxtPA&Filter=ProductId:' + $scope.productId + '&Sort=SubmissionTime:desc&Include=Products&Stats=Reviews&Limit=10').success(function(data) {
        
        $scope.reviewData = data.Results;

        if (!$scope.currentProduct.numberOfReviews) {
          console.log("added # of reviews + rating");
          $scope.currentProduct.numberOfReviews = data.TotalResults;
          $scope.currentProduct.rating = data.Includes.Products[$scope.productId].ReviewStatistics.AverageOverallRating;
        }

      });

    });

  };

  $scope.$watch('currentProduct', function() {
      getProductData()
  });

});
