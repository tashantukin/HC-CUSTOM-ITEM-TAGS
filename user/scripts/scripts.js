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
  var selectedCategories = [];
  
  function waitForElement(elementPath, callBack) {
    window.setTimeout(function () {
      if ($(elementPath).length) {
        callBack(elementPath, $(elementPath));
      } else {
        waitForElement(elementPath, callBack);
      }
    }, 500);
  }

   const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
    });

  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
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
                                <h5>as low as Php ${formatter.format(item['Price'])} / month</h5>
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

 //custom search
  var customSearchFilter = (function ()
  {
    var instance;
    function init()
    {
      async function searchTaggedItems(customGroupName,customGroupCode)
      {
        var apiUrl = `/api/v2/items`;
        console.log(apiUrl);
        var val = customGroupName == 'Brands' ? selectedCategories.toString() : "0"
        var operator = customGroupName == 'Brands' ? "in" : "gte"
        var data = { 'CustomFieldQueries': [{ 'Code': customGroupCode, 'Operator': operator, "Value": val  }] }
        console.log({ data });
        $.ajax({
        url: apiUrl,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (result) {
          if (result) {
            var allItems = result;
            $('.item-list-panel .row').empty();

            var totalItems = result.TotalRecords
            var paginationcount = Math.ceil(result.TotalRecords / result.PageSize)
            console.log({ totalItems })
            console.log({ paginationcount })
            
             var i = 1;
            var pagination_list = "";
             $(`.pagination .list`).remove();
            while (i <= paginationcount) {
              if (i == 1) {

                pagination_list += `<li class="active list" id="first-page" indx= ${i}><a href="javascript:void(0);">${i}</a></li>`; 
                $(`.pagination li`).last().before(pagination_list);
              } else {
                pagination_list += `<li indx= ${i} class="list"><a href="javascript:void(0);">${i}</a></li>`
                $(`.pagination li`).last().before(pagination_list);
              }
              i++;
            }

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
              
               let itemDetails = `<div class="col-sm-6">
                            <div class="item-search-box">
                                 ${discountBanner}<img src="${item['Media'][0]['MediaUrl']}" class="img-responsive">
                                 <div class="search-description">
                                  <h3>${item['Name']}</h3>
                                  <h5>as low as Php ${formatter.format(item['Price'])} / month</h5>
                                  <a class="btn-buy" href="${itemNameSlug}">Buy Now <i class="fa fa-chevron-right" aria-hidden="true"></i></a>
                                 </div>
                            </div>
                        </div>`
               
             // customGroupName == 'Discounted' ?  $('.discounted .container .row').append(itemDetails) : $('.trending .container .row').append(itemDetails) ;
              
              $('.item-list-panel .row').append(itemDetails);
                    
            })

        
          }
        },
       });
      }

      async function filterItems(params)
      {
        
        var apiUrl = `/api/v2/items?sort=${params}&Keywords=${$('#KeyWords').val()}`;
        console.log(apiUrl);
        $.ajax({
        url: apiUrl,
        method: "GET",
        contentType: "application/json",
       // data: JSON.stringify(data),
        success: function (result) {
          if (result) {
            var allItems = result;
            $('.item-list-panel .row').empty();


             var totalItems = result.TotalRecords
            var paginationcount = Math.ceil(result.TotalRecords / result.PageSize)
            console.log({ totalItems })
            console.log({ paginationcount })
            
             var i = 1;
            var pagination_list = "";
             $(`.pagination .list`).remove();
            while (i <= paginationcount) {
              if (i == 1) {

                pagination_list += `<li class="active list" id="first-page" indx= ${i}><a href="javascript:void(0);">${i}</a></li>`; 
                $(`.pagination li`).last().before(pagination_list);
              } else {
                pagination_list += `<li indx= ${i} class="list"><a href="javascript:void(0);">${i}</a></li>`
                $(`.pagination li`).last().before(pagination_list);
              }
              i++;
            }


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
              
               let itemDetails = `<div class="col-sm-6">
                            <div class="item-search-box">
                                 ${discountBanner}<img src="${item['Media'][0]['MediaUrl']}" class="img-responsive">
                                 <div class="search-description">
                                  <h3>${item['Name']}</h3>
                                  <h5>as low as Php ${formatter.format(item['Price'])} / month</h5>
                                  <a class="btn-buy" href="${itemNameSlug}">Buy Now <i class="fa fa-chevron-right" aria-hidden="true"></i></a>
                                 </div>
                            </div>
                        </div>`
              
              $('.item-list-panel .row').append(itemDetails);
                    
            })
          }
        },
       });

      }

      async function filterItemsByKeyword(keyword)
      {
        var apiUrl = `/api/v2/items?keywords=${keyword}`;
        console.log(apiUrl);
        $.ajax({
        url: apiUrl,
        method: "GET",
        contentType: "application/json",
       // data: JSON.stringify(data),
        success: function (result) {
          if (result) {
            var allItems = result;
            $('.item-list-panel .row').empty();
           var totalItems = result.TotalRecords
            var paginationcount = Math.ceil(result.TotalRecords / result.PageSize)
            console.log({ totalItems })
            console.log({ paginationcount })
            
             var i = 1;
            var pagination_list = "";
             $(`.pagination .list`).remove();
            while (i <= paginationcount) {
              if (i == 1) {

                pagination_list += `<li class="active list" id="first-page" indx= ${i}><a href="javascript:void(0);">${i}</a></li>`; 
                $(`.pagination li`).last().before(pagination_list);
              } else {
                pagination_list += `<li indx= ${i} class="list"><a href="javascript:void(0);">${i}</a></li>`
                $(`.pagination li`).last().before(pagination_list);
              }
              i++;
            }


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
              
               let itemDetails = `<div class="col-sm-6">
                            <div class="item-search-box">
                                 ${discountBanner}<img src="${item['Media'][0]['MediaUrl']}" class="img-responsive">
                                 <div class="search-description">
                                  <h3>${item['Name']}</h3>
                                  <h5>as low as Php ${formatter.format(item['Price'])} / month</h5>
                                  <a class="btn-buy" href="${itemNameSlug}">Buy Now <i class="fa fa-chevron-right" aria-hidden="true"></i></a>
                                 </div>
                            </div>
                        </div>`
              
              $('.item-list-panel .row').append(itemDetails);
              $('#KeyWords').val(keyword) 
                    
            })
          }
        },
       });

      }

      async function searchByCategory(categoryGuid)
      {
        var apiUrl = `/api/v2/items`;
        console.log(apiUrl);
        var data = { 'Categories': [ categoryGuid ] }
        console.log({ data });
        $.ajax({
        url: apiUrl,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (result) {
          if (result) {
            var allItems = result;
            $('.item-list-panel .row').empty();

            var totalItems = result.TotalRecords
            var paginationcount = Math.ceil(result.TotalRecords / result.PageSize)
            console.log({ totalItems })
            console.log({ paginationcount })
            
             var i = 1;
            var pagination_list = "";
             $(`.pagination .list`).remove();
            while (i <= paginationcount) {
              if (i == 1) {

                pagination_list += `<li class="active list" id="first-page" indx= ${i}><a href="javascript:void(0);">${i}</a></li>`; 
                $(`.pagination li`).last().before(pagination_list);
              } else {
                pagination_list += `<li indx= ${i} class="list"><a href="javascript:void(0);">${i}</a></li>`
                $(`.pagination li`).last().before(pagination_list);
              }
              i++;
            }

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
              
               let itemDetails = `<div class="col-sm-6">
                            <div class="item-search-box">
                                 ${discountBanner}<img src="${item['Media'][0]['MediaUrl']}" class="img-responsive">
                                 <div class="search-description">
                                  <h3>${item['Name']}</h3>
                                  <h5>as low as Php ${formatter.format(item['Price'])} / month</h5>
                                  <a class="btn-buy" href="${itemNameSlug}">Buy Now <i class="fa fa-chevron-right" aria-hidden="true"></i></a>
                                 </div>
                            </div>
                        </div>`
               
             // customGroupName == 'Discounted' ?  $('.discounted .container .row').append(itemDetails) : $('.trending .container .row').append(itemDetails) ;
              
              $('.item-list-panel .row').append(itemDetails);
                    
            })

        
          }
        },
       });
      }
 
      async function filterItemsByRange(min, max)
      {
        var apiUrl = `/api/v2/items`;
        console.log(apiUrl);
        var data = { 'Keywords': $('#KeyWords').val(),'minPrice': min, 'maxPrice' : max}
        console.log({ data });
        $.ajax({
        url: apiUrl,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (result) {
          if (result) {
            var allItems = result;
            $('.item-list-panel .row').empty();

            var totalItems = result.TotalRecords
            var paginationcount = Math.ceil(result.TotalRecords / result.PageSize)
            console.log({ totalItems })
            console.log({ paginationcount })
            
             var i = 1;
            var pagination_list = "";
             $(`.pagination .list`).remove();
            while (i <= paginationcount) {
              if (i == 1) {

                pagination_list += `<li class="active list" id="first-page" indx= ${i}><a href="javascript:void(0);">${i}</a></li>`; 
                $(`.pagination li`).last().before(pagination_list);
              } else {
                pagination_list += `<li indx= ${i} class="list"><a href="javascript:void(0);">${i}</a></li>`
                $(`.pagination li`).last().before(pagination_list);
              }
              i++;
            }

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
              
               let itemDetails = `<div class="col-sm-6">
                            <div class="item-search-box">
                                 ${discountBanner}<img src="${item['Media'][0]['MediaUrl']}" class="img-responsive">
                                 <div class="search-description">
                                  <h3>${item['Name']}</h3>
                                  <h5>as low as Php ${formatter.format(item['Price'])} / month</h5>
                                  <a class="btn-buy" href="${itemNameSlug}">Buy Now <i class="fa fa-chevron-right" aria-hidden="true"></i></a>
                                 </div>
                            </div>
                        </div>`
               
             // customGroupName == 'Discounted' ?  $('.discounted .container .row').append(itemDetails) : $('.trending .container .row').append(itemDetails) ;
              
              $('.item-list-panel .row').append(itemDetails);
                    
            })

        
          }
        },
       });
      }



      return {
        searchTaggedItems: searchTaggedItems,
        filterItems: filterItems,
        filterItemsByKeyword: filterItemsByKeyword,
        searchByCategory: searchByCategory,
        filterItemsByRange : filterItemsByRange
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


 var itemCustomFields  = (function ()
  {
    var instance;
    function init()
    {
      async function getCustomFields(itemGuid)
      {
       
        var apiUrl = `/api/v2/items/${itemGuid}`;
        $.ajax({
        url: apiUrl,
        method: "GET",
        contentType: "application/json",
       // data: JSON.stringify(data),
        success: function (result) {
          if (result) {
           
            $.each(result.CustomFields, function (index, cf)
            {
              var customValue = `<div class="details-container" onclick="showDescFull(this)">
								<div class="details-title">${cf.Name}</div>
								<div class="details-content">${cf.Values[0]}</div>
								<i class="icon icon-down-black"></i>
							</div>`
              switch (cf.Name) {
                case ('WEIGHT'):
                  
                  cf.Values[0] != null ? $('.product-descriptions').parent('div').append(customValue) : ''
                  break;
                

                 case ('Brands'):
                  
                  cf.Values[0] != null ? $('.product-descriptions').parent('div').append(customValue) : ''
                  break;
              }
            })

        
          }
        },
       });
      }
      

     
      return {
        getCustomFields: getCustomFields,
        
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
                    <a href="user/search?customFieldCode=271768-DiscountedDeals-43vWEuRwpw&customFieldName=discounted" class="item-view-more">View More</a>
                </div>
                <div class="row">
                    
                  
                </div>
            </div>

        </div>
        
        <div class="item-discounted-deal trending">
            <div class="container">
                <div class="item-discounted-title">
                    <h2>Trending in Marketplace</h2>
                    <a href="user/search?customFieldCode=1-Trendinginmarketplace-M4GEfJ6lwt&customFieldName=trending" class="item-view-more">View More</a>
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

  if (document.body.className.includes('page-search')) {

    //hide or empty the default item details
    $('.category-menu ').hide();
    $('.search-top-area').hide();
    $('.category-middle-menu').parent('div').hide()
    $('.search-filter-section').hide()
    $('.item-sorting-option').parent('div').hide();
    $('#items-list').hide()
    waitForElement('#items-list-init', function ()
    {
      $('#items-list-init').hide();
      $('#items-list').hide()
    })
    
    let newSearchFilterPanel = `<div class="row"><div class="col-sm-4 filter-panel">
                            <div class="item-search-filter">

                                <div class="panel-group" role="tablist" aria-multiselectable="true">
                                    <div class="panel panel-default">
                                        <div class="panel-heading" role="tab" id="MIheadingOne">
                                            <h4 class="panel-title">
                                                <a role="button" data-toggle="collapse" href="#monthlyInstallment" aria-expanded="true" aria-controls="monthlyInstallment">
                                                    <span>Monthly Installment</span>
                                                    <i class="fa fa-chevron-up"></i>
                                                </a>
                                            </h4>
                                        </div>
                                        <div id="monthlyInstallment" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="MIheadingOne">
                                            <div class="panel-body">
                                              
                                               <div class="radio-checkbox-custom">
                                                    <div class="radio">
                                                        <label><input type="radio" name="monthly_installment" value="Php 500 - 2,000"><span class="indicator"></span>Php 500 - 2,000</label>
                                                    </div>
                                                </div>


                                                <div class="radio-checkbox-custom">
                                                    <div class="radio">
                                                        <label><input type="radio" name="monthly_installment" value="Php 2,001 - 4,000"><span class="indicator"></span>Php 2,001 - 4,000</label>
                                                    </div>
                                                </div>



                                                <div class="radio-checkbox-custom">
                                                    <div class="radio">
                                                        <label><input type="radio" name="monthly_installment" value="Php 4,001 - 6,000"><span class="indicator"></span>Php 4,001 - 6,000</label>
                                                    </div>
                                                </div>


                                                 <div class="radio-checkbox-custom">
                                                    <div class="radio">
                                                        <label><input type="radio" name="monthly_installment" value="Php 6,001 - 8,000"><span class="indicator"></span>Php 6,001 - 8,000</label>
                                                    </div>
                                                </div>


                                                <div class="radio-checkbox-custom">
                                                    <div class="radio">
                                                        <label><input type="radio" name="monthly_installment" value="Php 8,001 - 10,000"><span class="indicator"></span>Php 8,001 - 10,000</label>
                                                    </div>
                                                </div>
                                                <div class="radio-checkbox-custom">
                                                    <div class="radio">
                                                        <label><input type="radio" name="monthly_installment" value="Php 10,001 - 20,000"><span class="indicator"></span>Php 10,001 - 20,000</label>
                                                    </div>
                                                </div>
                                                <div class="radio-checkbox-custom">
                                                    <div class="radio">
                                                        <label><input type="radio" name="monthly_installment" value="Php 30,001 - 40,000"><span class="indicator"></span>Php 30,001 - 40,000</label>
                                                    </div>
                                                </div>
                                                <div class="radio-checkbox-custom">
                                                    <div class="radio">
                                                        <label><input type="radio" name="monthly_installment" value="Php 40,001 and up"><span class="indicator"></span>Php 40,001 and up</label>
                                                    </div>
                                                </div>
                                               
                                            </div>
                                        </div>
                                    </div>
                                    <div class="panel panel-default">
                                        <div class="panel-heading" role="tab" id="SBheadingTwo">
                                            <h4 class="panel-title">
                                                <a role="button" data-toggle="collapse" href="#sortBy" aria-expanded="true" aria-controls="sortBy">
                                                    <span>Sort By</span>
                                                    <i class="fa fa-chevron-up"></i>
                                                </a>
                                            </h4>
                                        </div>
                                        <div id="sortBy" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="SBheadingTwo">
                                            <div class="panel-body">
                                               
                                                <div class="radio-checkbox-custom">
                                                    <div class="radio">
                                                        <label><input type="radio" name="sort_by" value="Latest Deals First"><span class="indicator"></span>Latest Deals First</label>
                                                    </div>
                                                </div>
                                                <div class="radio-checkbox-custom">
                                                    <div class="radio">
                                                        <label><input type="radio" name="sort_by" value="Older Deals First"><span class="indicator"></span>Older Deals First</label>
                                                    </div>
                                                </div>
                                                <div class="radio-checkbox-custom">
                                                    <div class="radio">
                                                        <label><input type="radio" name="sort_by" value="Price: High to Low"><span class="indicator"></span>Price: High to Low</label>
                                                    </div>
                                                </div>
                                                <div class="radio-checkbox-custom">
                                                    <div class="radio">
                                                        <label><input type="radio" name="sort_by" value="Price: Low to High"><span class="indicator"></span>Price: Low to High</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="panel panel-default">
                                        <div class="panel-heading" role="tab" id="BheadingTwo">
                                            <h4 class="panel-title">
                                                <a role="button" data-toggle="collapse" href="#brands" aria-expanded="true" aria-controls="brands">
                                                    <span>Brands</span>
                                                    <i class="fa fa-chevron-up"></i>
                                                </a>
                                            </h4>
                                        </div>
                                        <div id="brands" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="BheadingTwo">
                                            <div class="panel-body">

                                              <div class="radio-checkbox-custom">
                                                    <div class="checkbox">
                                                        <label>
                                                          <input type="checkbox" value="Acer" ><span class="indicator"></span> Acer
                                                        </label>
                                                      </div>
                                                </div>

                                                 <div class="radio-checkbox-custom">
                                                    <div class="checkbox">
                                                        <label>
                                                          <input type="checkbox" value="Lenovo" ><span class="indicator"></span> Lenovo
                                                        </label>
                                                      </div>
                                                </div>

                                                 <div class="radio-checkbox-custom">
                                                    <div class="checkbox">
                                                        <label>
                                                          <input type="checkbox" value="Asus" ><span class="indicator"></span> Asus
                                                        </label>
                                                      </div>
                                                </div>

                                                <div class="radio-checkbox-custom">
                                                    <div class="checkbox">
                                                        <label>
                                                          <input type="checkbox" value="Samsung"><span class="indicator"></span> Samsung
                                                        </label>
                                                      </div>
                                                </div>
                                                <div class="radio-checkbox-custom">
                                                    <div class="checkbox">
                                                        <label>
                                                          <input type="checkbox"  value="Apple"><span class="indicator"></span> Apple
                                                        </label>
                                                      </div>
                                                </div>
                                                <div class="radio-checkbox-custom">
                                                    <div class="checkbox">
                                                        <label>
                                                          <input type="checkbox"  value="Oppo"><span class="indicator"></span> Oppo
                                                        </label>
                                                      </div>
                                                </div>
                                                <div class="radio-checkbox-custom">
                                                    <div class="checkbox">
                                                        <label>
                                                          <input type="checkbox" value="LG"><span class="indicator"></span> LG
                                                        </label>
                                                      </div>
                                                </div>
                                                <div class="radio-checkbox-custom">
                                                    <div class="checkbox">
                                                        <label>
                                                          <input type="checkbox" value="RealMe" ><span class="indicator"></span> RealMe
                                                        </label>
                                                      </div>
                                                </div>
                                                <div class="radio-checkbox-custom">
                                                    <div class="checkbox">
                                                        <label>
                                                          <input type="checkbox" value="Whirpool"><span class="indicator"></span> Whirpool
                                                        </label>
                                                      </div>
                                                </div>
                                                <div class="filter-view-more">
                                                    <button>More brands<i class="fa fa-chevron-down"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div></div>`
  
    $('.listing-merchant-footer').before(newSearchFilterPanel);

    var itemListPanel = `<div class="col-sm-8 item-list-panel">
                            <div class="sort-flex">
                                <div class="sort-item-box best-sellers">
                                    <span class="icon"><svg width="23" height="21" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.20312 7.98438H1.73438V19.7031H7.20312M7.20312 7.98438C9.54688 7.98438 11.8906 1.73438 14.2344 1.73438V7.98438H21.2656C21.2656 7.98438 20.4844 19.7031 15.7969 19.7031H7.20312V7.98438Z" stroke="#4A5056" stroke-width="2.34375" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
                                    <span>Top Sellers</span>
                                </div>
                                <div class="sort-item-box trending">
                                    <span class="icon"><svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5354 1.74269C10.8688 0.863521 12.1302 0.863521 12.4646 1.74269L14.6209 7.7156C14.6961 7.91017 14.8285 8.07736 15.0008 8.19508C15.173 8.3128 15.3768 8.37553 15.5854 8.37498H20.8844C21.8636 8.37498 22.2906 9.59373 21.5209 10.1906L17.75 13.5833C17.5811 13.7132 17.4577 13.8932 17.3974 14.0975C17.3371 14.3019 17.3432 14.5201 17.4146 14.7208L18.7917 20.5573C19.1271 21.4948 18.0417 22.3 17.2209 21.7229L12.099 18.4729C11.9236 18.3496 11.7144 18.2835 11.5 18.2835C11.2856 18.2835 11.0765 18.3496 10.9011 18.4729L5.77919 21.7229C4.95939 22.3 3.87294 21.4937 4.20835 20.5573L5.58544 14.7208C5.65687 14.5201 5.66289 14.3019 5.60263 14.0975C5.54237 13.8932 5.41893 13.7132 5.25002 13.5833L1.47919 10.1906C0.708352 9.59373 1.13752 8.37498 2.1146 8.37498H7.41356C7.6222 8.37567 7.82613 8.313 7.99837 8.19526C8.17061 8.07752 8.30304 7.91026 8.37814 7.7156L10.5344 1.74269H10.5354Z" stroke="#4A5056" stroke-width="2.08333" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
                                    <span>Trending</span>
                                </div>
                                <div class="sort-item-box discounted">
                                    <span class="icon"><svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.33342 7.45836C5.05449 7.45836 5.75938 7.24453 6.35893 6.84392C6.95849 6.44331 7.42578 5.87391 7.70173 5.20772C7.97767 4.54153 8.04987 3.80848 7.9092 3.10126C7.76852 2.39403 7.42129 1.74441 6.91141 1.23453C6.40153 0.724651 5.7519 0.377419 5.04468 0.236744C4.33746 0.0960687 3.6044 0.168268 2.93822 0.444213C2.27203 0.720157 1.70263 1.18745 1.30202 1.78701C0.901407 2.38656 0.687582 3.09145 0.687582 3.81252C0.687582 4.77946 1.0717 5.70679 1.75542 6.39052C2.43915 7.07424 3.36648 7.45836 4.33342 7.45836ZM4.33342 2.25002C4.64245 2.25002 4.94454 2.34166 5.20149 2.51335C5.45845 2.68504 5.65872 2.92907 5.77698 3.21458C5.89524 3.50009 5.92618 3.81426 5.86589 4.11735C5.8056 4.42045 5.65679 4.69886 5.43827 4.91738C5.21975 5.1359 4.94134 5.28471 4.63824 5.345C4.33515 5.40529 4.02098 5.37435 3.73547 5.25608C3.44996 5.13782 3.20593 4.93755 3.03424 4.6806C2.86255 4.42365 2.77092 4.12156 2.77092 3.81252C2.77092 3.39812 2.93554 3.00069 3.22856 2.70767C3.52159 2.41464 3.91901 2.25002 4.33342 2.25002ZM12.6667 10.5834C11.9457 10.5834 11.2408 10.7972 10.6412 11.1978C10.0417 11.5984 9.57438 12.1678 9.29844 12.834C9.02249 13.5002 8.95029 14.2332 9.09097 14.9405C9.23164 15.6477 9.57888 16.2973 10.0888 16.8072C10.5986 17.3171 11.2483 17.6643 11.9555 17.805C12.6627 17.9456 13.3958 17.8734 14.0619 17.5975C14.7281 17.3216 15.2975 16.8543 15.6981 16.2547C16.0988 15.6552 16.3126 14.9503 16.3126 14.2292C16.3126 13.2623 15.9285 12.3349 15.2447 11.6512C14.561 10.9675 13.6337 10.5834 12.6667 10.5834ZM12.6667 15.7917C12.3577 15.7917 12.0556 15.7 11.7987 15.5284C11.5417 15.3567 11.3414 15.1126 11.2232 14.8271C11.1049 14.5416 11.074 14.2275 11.1343 13.9244C11.1946 13.6213 11.3434 13.3429 11.5619 13.1243C11.7804 12.9058 12.0588 12.757 12.3619 12.6967C12.665 12.6364 12.9792 12.6674 13.2647 12.7856C13.5502 12.9039 13.7942 13.1042 13.9659 13.3611C14.1376 13.6181 14.2292 13.9202 14.2292 14.2292C14.2292 14.6436 14.0646 15.041 13.7716 15.334C13.4786 15.6271 13.0811 15.7917 12.6667 15.7917ZM16.5626 0.437524C16.4765 0.351225 16.3742 0.282758 16.2616 0.236044C16.149 0.189329 16.0282 0.165283 15.9063 0.165283C15.7844 0.165283 15.6637 0.189329 15.5511 0.236044C15.4385 0.282758 15.3362 0.351225 15.2501 0.437524L0.437583 15.25C0.265704 15.4254 0.16861 15.6607 0.166749 15.9063C0.16647 16.0898 0.220692 16.2694 0.322542 16.4221C0.424392 16.5748 0.569286 16.6938 0.738862 16.7641C0.908438 16.8344 1.09506 16.8528 1.27508 16.8169C1.45511 16.781 1.62042 16.6925 1.75008 16.5625L16.5626 1.75002C16.6489 1.66391 16.7173 1.56162 16.7641 1.44901C16.8108 1.3364 16.8348 1.21569 16.8348 1.09377C16.8348 0.97186 16.8108 0.851143 16.7641 0.738535C16.7173 0.625926 16.6489 0.523637 16.5626 0.437524Z" fill="#4A5056"></path></svg></span>
                                    <span>Discounted</span>
                                </div>
                            </div>
                            <div class="row">
                                
                            </div>
                            
                            <div class="item-pagination text-right">
                                <nav aria-label="Page navigation">
                                    <ul class="pagination">
                                      <li>
                                        <a href="#" aria-label="Previous">
                                          <span aria-hidden="true"><i class="fa fa-chevron-left" aria-hidden="true"></i></span>
                                        </a>
                                      </li>
                                     
                                     
                                      <li>
                                        <a href="#" aria-label="Next">
                                          <span aria-hidden="true"><i class="fa fa-chevron-right" aria-hidden="true"></i></span>
                                        </a>
                                      </li>
                                    </ul>
                                </nav>
                            </div>

                  </div>`
    
    $('.filter-panel').after(itemListPanel);

    var cfId = getParameterByName('customFieldCode');
    var cfName = getParameterByName('customFieldName');
    console.log({ cfId })
    if (cfId) {
      var customFilter = customSearchFilter.getInstance();
      switch (cfName) {
        case ('Top Sellers'):
          customFilter.searchTaggedItems('Top Sellers', cfId);
          $('.best-sellers').addClass('active');
          break;
        case ('trending'):
          customFilter.searchTaggedItems('Trending', '1-Trendinginmarketplace-M4GEfJ6lwt');
          $('.trending').addClass('active');
          break;
        case ('discounted'):
          customFilter.searchTaggedItems('Discounted', '271768-DiscountedDeals-43vWEuRwpw');
          $('.discounted').addClass('active');
      }
  
   
    }

    //custom key word redirection
    var keyName = getParameterByName('keyword');

    if (keyName) {
     $('#KeyWords').val(keyName) 
        var customFilter = customSearchFilter.getInstance();
        customFilter.filterItemsByKeyword(keyName)
    }
    
    var categoryId = getParameterByName('categoryid');  
      if (categoryId) {
        //$('#KeyWords').val(keyName) 
            var customFilter = customSearchFilter.getInstance();
            customFilter.searchByCategory(categoryId)
        }
    

    jQuery(".sort-item-box").click(function ()
    {
      $('.sort-item-box').removeClass('active');
      $(this).addClass('active');
    });
  
    jQuery(".discounted").click(function ()
    {
      var customFilter = customSearchFilter.getInstance();
      customFilter.searchTaggedItems('Discounted', '271768-DiscountedDeals-43vWEuRwpw');
    })

    jQuery(".trending").click(function ()
    {
      var customFilter = customSearchFilter.getInstance();
      customFilter.searchTaggedItems('Trending', '1-Trendinginmarketplace-M4GEfJ6lwt');
    })

     jQuery(".best-sellers").click(function ()
    {
      var customFilter = customSearchFilter.getInstance();
      customFilter.searchTaggedItems('Popular', '1-TopSellers-5cd5Ffue1f');
    })

    jQuery(".radio-checkbox-custom").click(function ()
    {
      var inputtext = $(this).find('input').val();
      console.log({ inputtext })
    
      switch (inputtext) {
        case ("Latest Deals First"):
          var itemFilter = customSearchFilter.getInstance();
          itemFilter.filterItems('-created');
          break;
        case ("Older Deals First"):
          var itemFilter = customSearchFilter.getInstance();
          itemFilter.filterItems('created');
          break;
      
        case ("Price: High to Low"):
          var itemFilter = customSearchFilter.getInstance();
          itemFilter.filterItems('-price');
          break;
      
        case ("Price: Low to High"):
          var itemFilter = customSearchFilter.getInstance();
          itemFilter.filterItems('price');
          break;

      }
 
    })


    //filter monthly

    jQuery("#monthlyInstallment .radio-checkbox-custom").click(function ()
    { 
      var price = $(this).find('input').val();
      
      switch (price) {

        case ("Php 500 - 2,000"):
          var itemFilter = customSearchFilter.getInstance();
          itemFilter.filterItemsByRange('500','2000');
          break;
        case ("Php 2,001 - 4,000"):
          var itemFilter = customSearchFilter.getInstance();
          itemFilter.filterItemsByRange('2001','4000');
          break;
        
        case ("Php 4,001 - 6,000"):
          var itemFilter = customSearchFilter.getInstance();
          itemFilter.filterItemsByRange('4001','6000');
          break;
        
        case ("Php 6,001 - 8,000"):
          var itemFilter = customSearchFilter.getInstance();
          itemFilter.filterItemsByRange('6001','8000');
          break;


        case ("Php 8,001 - 10,000"):
          var itemFilter = customSearchFilter.getInstance();
          itemFilter.filterItemsByRange('8000','10000');
          break;
        case ("Php 10,001 - 20,000"):
          var itemFilter = customSearchFilter.getInstance();
          itemFilter.filterItemsByRange('10001','20000');
          break;
      
        case ("Php 30,001 - 40,000"):
          var itemFilter = customSearchFilter.getInstance();
          itemFilter.filterItemsByRange('30001','40000');
          break;
      
        case ("Php 40,001 and up"):
          var itemFilter = customSearchFilter.getInstance();
          itemFilter.filterItemsByRange('40000','100000000');
          break;

      }
 
    })

    
     //filter by brands
    
    $('#brands').find('input[type=checkbox]').change(function ()
    {
      
      selectedCategories = []
      $('#brands').find('input[type=checkbox]').each(function ()
      {
       
        this.checked ? selectedCategories.push($(this).val()) : "";
        console.log({ selectedCategories })
        
       
      });

       var customFilter = customSearchFilter.getInstance();
        customFilter.searchTaggedItems('Brands', '1-Brands-qPQLmo3Bcg');
     });
    

   $(document).on('keypress', function (e)
    {
      if (e.which == 13) {
        if ($('#KeyWords').val()) {
          var customFilter = customSearchFilter.getInstance();
          customFilter.filterItemsByKeyword($('#KeyWords').val())
        }
      }
    });
  
  }

  if (document.body.className.includes('item-detail-page')) {
    waitForElement('.product-specifications', function ()
    {
    
      $('.details-container').remove();
      var customFieldData = itemCustomFields.getInstance();
      customFieldData.getCustomFields($('#itemGuid').val())
    })
  
  }
  //search  bar
  $('#KeyWords').prependTo('.settings-keyword');
  $('.btn-find').appendTo('.settings-keyword');

 $(document).on('keypress', function (e)
    {
      if (e.which == 13) {
        if ($('#KeyWords').val()) {
          window.location.href = `/user/search/searchbykeywords?keyword=${$('#KeyWords').val()}`
          
        }
      }
    });

})();
