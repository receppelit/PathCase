this.$impressionList = [];
this.$checkList = [];
this.$order=0;
this.$gamesProductLength = 10;
(function(w) {

    // create new object
    var core = function() {
    };

    // constructor
    core.constructor = core;

    // add functions in prototype
    core.prototype = {
            init: async function() {
               window.dataLayer = window.dataLayer || [];

               $core.productImpression();
               
               $core.gameProduct($gamesProductLength);

               var $scrollLimit = 250;
               var $scrollPosition = 0;

               $(window).on('scroll', function() {
                    $scrollPosition = $(this).scrollTop();
                    if ($scrollPosition >= $scrollLimit)
                    {   
                        $scrollLimit += 400;
                        $core.gameProduct($gamesProductLength + 10);
                    }
                });
                $core.events();

            },

            events: function() {
                $('body').on('click','[data-js=add-fav]',function(){
                      var $this = $(this);
                      var $id = $($this).parents('.game-card').attr('data-id');
                      var $favouriteProductCount =Number($('.favourite-icon-area .count').text());
                      var $products = [];
                      if(!$($this).hasClass('js-active')){
                        if(localStorage.getItem('favourites')){
                            $products = JSON.parse(localStorage.getItem('favourites'));
                        }
                        $products.push({'productId' : $id });
                        localStorage.setItem('favourites', JSON.stringify($products));
                        $favouriteProductCount++
                        $('.favourite-icon-area .count').text($favouriteProductCount);
                        $($this).addClass('js-active');
                      }else{
                        var $storageProducts = JSON.parse(localStorage.getItem('favourites'));
                        var $products = $storageProducts.filter($product => $product.productId !== $id );
                        localStorage.setItem('favourites', JSON.stringify($products));
                        $core.getFavouriteProductsLS();
                        $($this).removeClass('js-active');
                      }
                      
                });

                $('body').on('click','[data-js=add-basket]',function(){
                    var $this = $(this);
                    var $id = $($this).parents('.game-card').attr('data-id');
                    var $basketProductCount = Number($('.basket-icon-area .count').text());
                    var $products = [];
                    if(localStorage.getItem('products')){
                        $products = JSON.parse(localStorage.getItem('products'));
                    }
                    $products.push({'productId' : $id });
                    localStorage.setItem('products', JSON.stringify($products));
                    $basketProductCount++
                    $('.basket-icon-area .count').text($basketProductCount)
              });
            },
            gameProduct : function($gamesProductLength) {
                var $url = 'https://www.cheapshark.com/api/1.0/games?title=batman&limit='+($gamesProductLength == undefined ? 10 : $gamesProductLength)+'&exact=0';
                $.getJSON( $url, function( data ) {
                    var $gameID = [];
                    var $html = "";
                    $(data).each(function(key, value) {   
                        $gameID.push(value.gameID)
                    })
                    $($gameID).each(function(key, value) {   
                        $.getJSON( "https://www.cheapshark.com/api/1.0/games?id=" + value, function( datas ) {
                          var $maxSavingsDealId=  $core.getMax(datas.deals,datas.deals.savings)
                            $.getJSON( "https://www.cheapshark.com/api/1.0/deals?id=" + $maxSavingsDealId.dealID, function( $gameInfo ) {
                                $html  += '<div class="game-card bg-white" data-id="' + $gameInfo.gameInfo.gameID +'">';
                                $html  += '<div class="game-img">';
                                $html  += '  <img data-src="'+ $gameInfo.gameInfo.thumb +'" alt="' + $gameInfo.gameInfo.name + '" class="w-full lazy">';
                                $html  += '<div class="fav-icon">';
                                $html  += '    <a href="javascript:void(1)" class="add-fav mr-4" data-js="add-fav">';
                                $html  += '      <span class="fav-icon-empty"></span>';
                                $html  += '       <span class="fav-icon-filled"></span>';
                                $html  += '  </a>';
                                $html  += ' </div>';
                                $html  += '</div>';
                                $html  += '<div class="card-body m-4">';
                                $html  += '  <p class="game-title mt-4">' + $gameInfo.gameInfo.name + '</p>';
                                $html  += '  <div class="game-price-area mt-4 flex justify-between">';
                                $html  += '    <div class="price-wrap">';
                                $html  += '      <span class="game-new-price mr-4">' + $gameInfo.gameInfo.salePrice;
                                $html  += '      </span>';
                                $html  += '      <span class="game-old-price">'+$gameInfo.gameInfo.retailPrice;
                                $html  += '      </span>';
                                $html  += '    </div>';            
                                $html  += '    <a href="javascript:void(1)" class="add-basket"  data-js="add-basket">Add Basket</a>';
                                $html  += '  </div>';   
                                $html  += ' </div>';
                                $html += '</div>';
                                $('[data-js="game-list"]').html($html)
                                $order++;
                            })
                            .done(function($gameInfo) {
                                $core.getFavouriteProductsLS();
                                $core.getBasketProductsLS();
                                $core.imgLazyLoad();
                                $core.loopImpression($gameInfo.gameInfo.gameID,$gameInfo.gameInfo.name,$gameInfo.gameInfo.salePrice,$order);
                                
                              });;
                            
                        })
                        
                    })
                })
                .done(function(){
                    //  $gamesProductLength = $gamesProductLength + 10;
                });
            },
            getFavouriteProductsLS: function(){
                var $addedProductFavourite = 0;
                var $storageProducts;
                if(localStorage.getItem('favourites')){
                    $addedProductFavourite = JSON.parse(localStorage.favourites).length
                    $('.favourite-icon-area .count').text($addedProductFavourite)
                    $storageProducts = JSON.parse(localStorage.getItem('favourites'));
                    $($storageProducts).each(function(key, value){
                        var $id = value.productId;
                      $(".game-card[data-id='"+$id+"']").find('[data-js=add-fav]').addClass('js-active');
                    });
                }
            },
            getBasketProductsLS: function(){
                var $addedProductFavourite = 0;
                if(localStorage.getItem('products')){
                    $addedProductFavourite = JSON.parse(localStorage.products).length
                    $('.basket-icon-area .count').text($addedProductFavourite)
                }
            },
            getMax : function(arr, prop){
                    var $max;
                    for (var $i=0 ; $i<arr.length ; $i++) {
                        if ($max == null || parseInt(arr[$i][prop]) > parseInt($max[prop]))
                        $max = arr[$i];
                    }
                    return $max;
            },
            imgLazyLoad : function(){
                $('.lazy').lazy();
            },
            productImpression:function(){
                var $obj = {
                    'event': 'eec.productImpression',
                    'ecommerce': {
                        'currencyCode': 'TRY',
                        'impressions': $impressionList
                    }
                };

                window.dataLayer.push($obj);
            },
            pushImpression: function (id, name, price, position){
                var $data = {
                    'id': id,
                    'name': name,
                    'price': price,
                    'position': position
                };
                $impressionList.push($data);
            },
            loopImpression : function (gameID,gameName,gamePrice,position) { 
                if(!$checkList.includes(gameID)){
                    $core.pushImpression(gameID,gameName, gamePrice, position) 
                    $checkList.push(gameID)
                }
                                            
            }
        }
        // run init function
    var $core = new core();
    $core.init();
}());