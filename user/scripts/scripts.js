(function () {
  /* globals $ */
  var scriptSrc = document.currentScript.src;
  var re = /([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})/i;
  var packageId = re.exec(scriptSrc.toLowerCase())[1];
  var packagePath = scriptSrc.replace("/scripts/scripts.js", "").trim();
  var customFieldPrefix = packageId.replace(/-/g, "");
  const HOST = window.location.host;
  var hostname = window.location.hostname;
  var urls = window.location.href.toLowerCase();
  var userId = $("#userGuid").val();

  
  function waitForElement(elementPath, callBack) {
    window.setTimeout(function () {
      if ($(elementPath).length) {
        callBack(elementPath, $(elementPath));
      } else {
        waitForElement(elementPath, callBack);
      }
    }, 500);
  }

  function getMarketplaceCustomFields(callback) {
    var apiUrl = "/api/v2/marketplaces";
    $.ajax({
      url: apiUrl,
      method: "GET",
      contentType: "application/json",
      success: function (result) {
        if (result) {
          callback(result.CustomFields);
        }
      },
    });
  }

  function string_to_slug(str) {
    if (str == null) return ''
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to = "aaaaeeeeiiiioooouuuunc------";
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes
    return str;
}

  
  var customItems = (function ()
  {
    var instance;
    function init()
    {
      async function getTaggedItems(customGroupName,customGroupCode)
      {
        var apiUrl = `/api/v2/items`;
        console.log(apiUrl);
        var data = { 'CustomFieldQueries': [{ 'Code': customGroupCode, 'Operator': "gte", "Value": "0" }] }
        console.log({ data });
        $.ajax({
        url: apiUrl,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (result) {
          if (result) {
            var allItems = result;
          
            $.each(result.Records, function (index, item)
            {
              var discountValue = '';
              var itemNameSlug = string_to_slug(item['Name']);
              itemNameSlug = '/user/item/detail/' + itemNameSlug + '/' + item['ID'];
                $.each(item.CustomFields, function (index, cf)
                {
                  
                  if (cf.Code == '1-ItemDiscount-NbXS5gF2ye') {
                    discountValue = cf.Values[0];
                    
                    
                  }
                });
              let discountBanner = discountValue != "" ? `<span class="badge badge-danger">-${discountValue}% OFF</span>` : ''
              
               let itemDetails = `<div class="col-sm-3">
                            <div class="item-deal-box">
                                
                                 ${discountBanner}<img src="${item['Media'][0]['MediaUrl']}" class="img-responsive">
                                <h3>${item['Name']}</h3>
                                <h5>as low as Php ${item['Price']} / month</h5>
                                <a class="btn-buy" href="${itemNameSlug}">Buy Now <i class="fa fa-chevron-right" aria-hidden="true"></i></a>
                            </div>
                        </div>`
               
              customGroupName == 'Discounted' ?  $('.discounted .container .row').append(itemDetails) : $('.trending .container .row').append(itemDetails) ;
                    
            })

        
          }
        },
       });
      }

    
      return {
        getTaggedItems: getTaggedItems,
       
      }
    }
      return {
        getInstance: function ()
        {
          if (!instance) {
          
              instance = init()
          
          }
          
          return instance
        }
      }

  })()


  $(document).ready(function () {
    getMarketplaceCustomFields(function (result) {
      $.each(result, function (index, cf) {
       
      });
    });


    //homepage
    if (document.body.className.includes('page-home')) {

      //append default divs for trending and discounted
      $('.section-shop').remove();
        let customBanner =  `<div class="item-discounted-deal discounted">
            <div class="container">
                <div class="item-discounted-title">
                    <h2>Discounted Deals</h2>
                    <a href="#" class="item-view-more">View More</a>
                </div>
                <div class="row">
                    
                  
                </div>
            </div>

        </div>
        
        <div class="item-discounted-deal trending">
            <div class="container">
                <div class="item-discounted-title">
                    <h2>Trending in Marketplace</h2>
                    <a href="#" class="item-view-more">View More</a>
                </div>
                <div class="row">
                    
                  
                </div>
            </div>

        </div>
        
        `
      $('.section-category').parent('div').after(customBanner);
      var tagItems = customItems.getInstance();
      tagItems.getTaggedItems('Discounted','271768-DiscountedDeals-43vWEuRwpw');
      tagItems.getTaggedItems('Trending','1-Trendinginmarketplace-M4GEfJ6lwt');
      
    }
  
  });





})();
