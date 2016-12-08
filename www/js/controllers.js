var app = angular.module('starter.controllers', ['rzModule']);

app.controller('AppCtrl', function(cartService, $http, productService, $scope, $state, $ionicSideMenuDelegate) {

  $scope.productService = productService;

  $scope.cartService = cartService;

  $http.get('http://markselectrical.co.uk/?api=').success(function(data) {
      $scope.promotions = data.promotions;
  });

  $http.get('http://markselectrical.co.uk/categories?api=').success(function(data) {
      $scope.categories = data.categories;
  });

  $scope.addToCart = function(product) {
    shoppingCart.addToCart(product);
    $ionicSideMenuDelegate.toggleRight(true);
    $scope.$digest;
  }

  $scope.currentCategory = {};

  $scope.isEnabled = function() {
    if ($state.current.name == "app.home" || $state.current.name == "app.browse" || $state.current.name == "app.track") {
      return true
    } else {
      return false
    };
  };

});

app.controller('HomeCtrl', function($scope, $http, $rootScope, productService, $ionicScrollDelegate) {
 
  $scope.home = {search:"", results:{}};

  $scope.options = {
    pagination: false,
    autoplay: true,
    loop: true,
    autoplay: 3000
  }

  $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
    // data.slider is the instance of Swiper
    $scope.slider = data.slider;
  });

  $scope.promoClick = function(promotion){
    if(promotion.type == "page"){
      var URL = "http://markselectrical.co.uk/" + promotion.url;
      window.open(URL, "_blank", "location=no");
    }
    if (promotion.type == "category") {
      productService.goToCategory(promotion)
    };
  };

  $scope.searchFunc = function(){
    $scope.noResults = false;
    console.log('search func');
    $ionicScrollDelegate.scrollTop();
    if($scope.home.search.length >1){
      console.log('start srch');
      $scope.loading = true;
      $http.get('http://markselectrical.co.uk/search?api=&keyword=' + $scope.home.search).success(function(data) {
          $scope.loading = false;    
          if(!data.items){
            $scope.home.results = {};
            $scope.noResults = true;
          } else{
            $scope.home.results = data.items;
          }
      });
    }

  };
  
});

app.controller('TrackCtrl', function($scope, $http, $rootScope) {

  $scope.order = {};

  $scope.go = function(){
    $http.get('http://services.markselectrical.co.uk/services/remote/getorder?orderno=' + $scope.order.no).success(function(data) {
       $scope.orderDetails = data;
    });
  }

});

app.controller('ContactCtrl', function($scope, $ionicHistory, $compile) {

      $scope.tab = 1;

      var showroom =  new google.maps.LatLng(52.634303,-1.149791);
      var headOffice =  new google.maps.LatLng(52.632751, -1.210550);

      $scope.$watch('tab', function(newVal, oldVal) {

      if(newVal == 2){

            var mapOptions = {
              center: showroom,
              zoom: 15,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              disableDefaultUI: true
            };

            var map = new google.maps.Map(document.getElementById("map1"), mapOptions);

            google.maps.event.trigger(map, 'resize');
            map.setCenter(showroom);

            var marker = new google.maps.Marker({
              position: showroom,
              map: map,
              title: 'Marks Electrical'
            });

            var infowindow = new google.maps.InfoWindow({
              content: "<h3>Our Showroom</h3><p>111-115 King Richards Road, <br>Leicester<br>LE3 5QG (we're on the A47)</p><img src='./img/shop-front.png' style='width: 100%;'/>"
            });

            marker.addListener('click', function() {
              infowindow.open(map, marker);
            });

            google.maps.event.addListenerOnce(map, 'idle', function() {
              google.maps.event.trigger(map, 'resize');
              map.setCenter(showroom)
            });
      }

      if(newVal == 3){

            var mapOptions = {
              center: headOffice,
              zoom: 15,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              disableDefaultUI: true
            };

            var map = new google.maps.Map(document.getElementById("map2"), mapOptions);

            google.maps.event.trigger(map, 'resize');
            map.setCenter(headOffice);

            var marker = new google.maps.Marker({
              position: headOffice,
              map: map,
              title: 'Marks Electrical'
            });

            var infowindow = new google.maps.InfoWindow({
              content: "<h3>Click & Collect from our Head Office</h3><p>Mark's Electrical LTD, <br>Elland Road, <br>Leicester<br>LE3 1TU</p>"
            });

            marker.addListener('click', function() {
              infowindow.open(map, marker);
            });

            google.maps.event.addListenerOnce(map, 'idle', function() {
              google.maps.event.trigger(map, 'resize');
              map.setCenter(headOffice)
            });
      }

      $scope.directions = function(address){
        var url='';
        if(ionic.Platform==='iOS'||ionic.Platform==='iPhone'||navigator.userAgent.match(/(iPhone|iPod|iPad)/)){
          url="http://maps.apple.com/maps?q="+encodeURIComponent(address);
        }else if(navigator.userAgent.match(/(Android|BlackBerry|IEMobile)/)){
          url="geo:?q="+encodeURIComponent(address);
        }else{
          //this will be used for browsers if we ever want to convert to a website
          url="http://maps.google.com?q="+encodeURIComponent(address);
        }
        window.open(url, "_system", 'location=no');
      }

    });
  
});

app.controller('MenuCtrl', function($scope, $ionicSideMenuDelegate, $http, $state, $rootScope, $ionicModal, $ionicPopup, cartService, $ionicScrollDelegate) {

  $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
    // data.slider is the instance of Swiper
    $scope.slider = data.slider;
  });

  $scope.getCollectionDates = function(){
    var items = [];

    for(var i = 0; i < $rootScope.cart.length; i++){
      var item = {
        "sku": $rootScope.cart[i].sku,
        "qty": $rootScope.cart[i].quantity
      }
      items.push(item);
    };

    var request = {
                    "collection":true,
                    "items":items
                  }
    
    $http.get("http://services.markselectrical.co.uk/services/remote/deliverydate/json/" + JSON.stringify(request)).success(function(data) {
    
      for (var i = 0; i < data.dates.length; i++) {
          data.dates[i].type = 'C';
      };

      $scope.collectionDates = data.dates;

    });
  };

    $scope.customer = {
      sameAddresses: true,
      deliveryAddress: {},
      billingAddress: {},
      step: 1
    };

    $scope.delivery = {};

    $scope.basket = {};

    $scope.postcode = "";

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

    $scope.setAddress = function(type){
      if(type == "delivery"){
        $rootScope.checkout.checkout.customer.delivery.street = $scope.customer.deliveryAddress.StreetAddress;
        $rootScope.checkout.checkout.customer.delivery.city = $scope.customer.deliveryAddress.Place;
      }
      if(type == "billing"){
        $rootScope.checkout.checkout.customer.billing.street = $scope.customer.billingAddress.StreetAddress;
        $rootScope.checkout.checkout.customer.billing.city = $scope.customer.billingAddress.Place;      
      }
    };

    $scope.changeStep = function(n){
      if($scope.customer.step > n){
        $scope.customer.step = n;
      }
    };

    $scope.setStep = function(n){
      $scope.customer.step = n;
    }

    $scope.totalWithWarranties = function(){
      var total = cartService.total();
      for(var i = 0; i < $rootScope.cart.length; i++){
        for(var x = 0; x < $rootScope.cart[i].warrranties.length; x++){
          if($rootScope.cart[i].warrranties[x].on){
            total += $rootScope.cart[i].warrranties[x].price
          }
        }
      }
      return total
    };

    $scope.getAddress = function(postcode, delivery){
      
        $http.get("http://services.postcodeanywhere.co.uk/PostcodeAnywhere/Interactive/Find/v1.10/json3.ws?&Key=MC18-GB14-ME51-ZB24&SearchTerm=" + postcode ).success(function(data) {

          if(delivery){
            $scope.deliveryAddresses = data.Items;
          }
          if(!delivery){
            $scope.billingAddresses = data.Items;
          }

        });

    };
    
    var regEx = /^(([gG][iI][rR] {0,}0[aA]{2})|((([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y]?[0-9][0-9]?)|(([a-pr-uwyzA-PR-UWYZ][0-9][a-hjkstuwA-HJKSTUW])|([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y][0-9][abehmnprv-yABEHMNPRV-Y]))) {0,}[0-9][abd-hjlnp-uw-zABD-HJLNP-UW-Z]{2}))$/;

    $scope.checkPostcode = function() {
      if (regEx.test($rootScope.checkout.checkout.customer.delivery.postcode)) {
        $scope.spinner = true;
        var obj = {};
        obj.postcode = $rootScope.checkout.checkout.customer.delivery.postcode;
        obj.twoman = false;
        obj.items = {};

        for (var i = $rootScope.cart.length - 1; i >= 0; i--) {
            if ($rootScope.cart[i].type == 'item') {
                obj.items['item' + i] = {sku: $rootScope.cart[i].sku, qty: $rootScope.cart[i].quantity}
            }
        }


        $http.get('http://services.markselectrical.co.uk/services/remote/deliverydate/json/' + JSON.stringify(obj) ).success(function(data) {
          for (var i = 0; i < data.dates.length; i++) {
              data.dates[i].type = 'D';
          };
          $scope.dates = data.dates;
          $scope.spinner = false;
          $scope.getAddress($rootScope.checkout.checkout.customer.delivery.postcode, true);
        });

      }
    };

    $scope.checkBillingPostcode = function() {
      if (regEx.test($rootScope.checkout.checkout.customer.billing.postcode)) {
        $scope.spinner = true;

        $scope.getAddress($rootScope.checkout.checkout.customer.billing.postcode, false);

      }
    };

    Stripe.setPublishableKey('pk_live_TF3m57b02soVQxNhbnRY4MqZ');

    $scope.submit = function() {
      $scope.orderProcessing = true;
      var form = document.getElementById('payment-form');
      Stripe.card.createToken(form, $scope.stripeResponseHandler);
      return false
    };

    $scope.stripeResponseHandler = function(status, response) {

      if (response.error) {

        $scope.orderProcessing = false;
        $scope.$apply();
        document.getElementById('errors').textContent = response.error.message;

      } else {

        document.getElementById('errors').textContent = "";
        var token = response.id;
        $rootScope.checkout.stripeToken = token;

        $scope.createOrder();

      }

    };

    $scope.done = function(){
      $scope.disabled = false;
      $scope.orderProcessing = false;
      $scope.orderSuccess = false;
      $scope.orderFailure = false;
      $scope.orderComplete = false;
      $scope.billingAddress = undefined;
      $scope.deliveryAddresses = undefined;
      $scope.collectionDates = undefined;
      $scope.dates = undefined;
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
      $rootScope.cart = [];
      $scope.customer.step = 1;
      $scope.checkoutModal.hide();
    };

    $scope.cartHasAddons = function(){
      for(var i = 0; i < $rootScope.cart.length; i++){
        if($rootScope.cart[i].warrranties.length){
          return true
        }
      }
      return false
    };

    $scope.createOrder = function(){

      $scope.orderProcessing = true;
  
      var lines = [];
      for(var i = 0; i < $rootScope.cart.length; i++){
        
        var addons = [];

        for(var x = 0; x < $rootScope.cart[i].warrranties.length; x++){
          if($rootScope.cart[i].warrranties[x].on){
            var addon = {
              "type": "WARRANTY",
              "sku": $rootScope.cart[i].warrranties[x].sku,
              "qty": 1
            }
            addons.push(addon)
          }
        };

        var obj = {
          "sku": $rootScope.cart[i].sku,
          "quantity": $rootScope.cart[i].quantity,
          "addons": addons
        }

        lines.push(obj);

      };

      if($scope.customer.sameAddresses && $rootScope.checkout.checkout.delivery.type !='C'){
        $rootScope.checkout.checkout.customer.billing = $rootScope.checkout.checkout.customer.delivery;
      };

      $rootScope.checkout.checkout.delivery.notes="";

      $rootScope.checkout.checkout.basket.lines = lines;
      $rootScope.checkout.checkout.basket.summary.total = $scope.totalWithWarranties();

          $http({
            method  : 'POST',
            url     : 'http://markselectrical.co.uk/checkout/stripe',
            data    : 'basket=' + encodeURIComponent(JSON.stringify($rootScope.checkout)),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
          })
            .success(function(data) {
              $scope.orderProcessing = false;
              $scope.orderComplete = true;
              $ionicScrollDelegate.scrollTop();
              if (data.success) {
                $scope.orderSuccess = true;
                $scope.orderNumber = data.orderRef;
              } else {
                $scope.orderFailure = true;
                console.log(data);
              }
              $state.go('app.home');
              $ionicSideMenuDelegate.toggleRight(false);
            });
    }

});

app.controller('CategoryCtrl', function($scope, $stateParams, $ionicPopup, $http, $ionicScrollDelegate) {

  $scope.title = $stateParams.name;

  var category = $stateParams.url;

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
    $scope.$on('$ionicView.enter', function(e) {
      if($scope.init){
          $scope.$broadcast('rzSliderForceRender');
      }
    });

    $scope.minRangeSlider = {
        minValue: Math.floor(data.meta.pricemin),
        maxValue: Math.ceil(data.meta.pricemax),
        options: {
            floor: Math.floor(data.meta.pricemin),
            ceil: Math.ceil(data.meta.pricemax),
            step: 1,
            translate: function(price) {
              return '£' + price;
            },
          onEnd: function(id) {
              $ionicScrollDelegate.scrollTo(0,1);
              $ionicScrollDelegate.scrollTop(false)
          }
        }
    };

    $scope.loadMore = function() {

      var url = 'http://markselectrical.co.uk/' + category + '-' + 'page-' + pageNumber + '-sort-' + $scope.list.order + '-' + 'show-12A' + '?api';

      if ($scope.products.length < $scope.numberOfItems) {
          
          // Load the data from Marks Electrical api. 
          $http.get(url).success(function (data) {
            angular.forEach(data.items, function (value, key) {

              $http.get("http://api.bazaarvoice.com/data/statistics.json?apiversion=5.4&passkey=caGNjXYwRCUrhX5c9VuHRgl7vgc4GPmGZYWqgxvKUxtPA&filter=productid:" + value.sku +"&stats=Reviews,NativeReviews").success(function (data) {
                if (data.TotalResults) {
                
                value.averageRating = data.Results[0].ProductStatistics.ReviewStatistics.AverageOverallRating;
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
            setTimeout(function(){
              if(!document.getElementById('list').children.length){
                $scope.loadMore()
              };
            }, 10)
          });

      } else {

        $scope.more = false;
        
      }

    };

    $scope.loadMore();

  });

});

app.controller('FinderCtrl', function($scope, $rootScope, $stateParams, $http) {
  $scope.category = $stateParams.categories;

});

app.controller('ProductCtrl', function($scope, $state, productService, $stateParams, $http, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $rootScope) {

      $scope.product = $stateParams.product;
      $scope.tab = 1;

    $scope.options = {
      pagination: false
    }

    $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
      // data.slider is the instance of Swiper
      $scope.slider = data.slider;
    });

      productService.get($scope.product.sku, true).then(function(product){

        for (var attrname in product) { $scope.product[attrname] = product[attrname]; }

        $scope.$apply();
      }, function(){
      });

});
