<?php

include 'callAPI.php';
include 'admin_token.php';

$contentBodyJson = file_get_contents('php://input');
$content = json_decode($contentBodyJson, true);
$userId = $content['userId'];
$baseUrl = getMarketplaceBaseUrl();
$admin_token = getAdminToken();
$customFieldPrefix = getCustomFieldPrefix();
// Query to get marketplace id
$url = $baseUrl . '/api/v2/marketplaces/';
$marketplaceInfo = callAPI("GET", null, $url, false);

$url =  $baseUrl . '/api/v2/users/' . $userId .'/carts/';
$result = callAPI("GET", $admin_token['access_token'], $url, false);
error_log('carts' . json_encode($result));

// delete the cart items
foreach($result['Records'] as $cart) {
    $cartId =  $cart['ID'];
    $url =  $baseUrl . '/api/v2/users/' . $userId .'/carts/' . $cartId;
    $result = callAPI("DELETE", $admin_token['access_token'], $url);
    error_log('carts' . json_encode($result));
}

?>

