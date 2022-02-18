(function() {
var scriptSrc = document.currentScript.src;
var packagePath = scriptSrc.replace('/scripts/package.js', '').trim();
var re = /([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})/i;
var packageId = re.exec(scriptSrc.toLowerCase())[1];
document.addEventListener('DOMContentLoaded', function () {
const HOST = window.location.host;
var customFieldPrefix = packageId.replace(/-/g, "");
var userId = $('#userGuid').val();
var accessToken = 'Bearer ' + getCookie('webapitoken');
var rrpStatusExist = false;
var rrpStatusFieldId = 0;
var code = "";

//switch

  
  function getMarketplaceCustomFields(callback){
    var apiUrl = '/api/v2/marketplaces'
    $.ajax({
        url: apiUrl,
        method: 'GET',
        contentType: 'application/json',
        success: function(result) {
            if (result) {
                callback(result.CustomFields);
            }
        }
    });
  }


  $(document).ready(function ()
  {
  
    jQuery('.login-list-item .tog').click(function () {
      jQuery(this).closest('.login-list-item').toggleClass("open");
  });

  //toggle per item
  jQuery('.tog1').click(function () {
    jQuery(this).closest('.accord_item').toggleClass("open");
});


  getMarketplaceCustomFields(function(result) {
      $.each(result, function(index, cf) {
         //code here
          
      })
  });

});

function getCookie (name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
 

});
})();
