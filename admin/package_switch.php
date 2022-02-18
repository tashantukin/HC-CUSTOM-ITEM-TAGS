<?php
include 'callAPI.php';
include 'admin_token.php';
$contentBodyJson = file_get_contents('php://input');
$content = json_decode($contentBodyJson, true);
$userId = $content['userId'];
$deleteStatus = $content['status'];
$baseUrl = getMarketplaceBaseUrl();
$admin_token = getAdminToken();
$customFieldPrefix = getCustomFieldPrefix();
// Query to get marketplace id
$url = $baseUrl . '/api/v2/marketplaces/';
$marketplaceInfo = callAPI("GET", null, $url, false);
$url = $baseUrl . '/api/developer-packages/custom-fields?packageId=' . getPackageID();
$packageCustomFields = callAPI("GET", null, $url, false);

$rrp_status = '';
foreach ($packageCustomFields as $cf) {
    if ($cf['Name'] == 'Delete Cart' && substr($cf['Code'], 0, strlen($customFieldPrefix)) == $customFieldPrefix) {
           $delete_status = $cf['Code'];
    }
}
$data = [
    'ID' => $marketplaceInfo['ID'],
    'CustomFields' => [
        [
            'Code' => $delete_status,
            'Values' => [$deleteStatus],
        ],
    ],
];
$id =  $marketplaceInfo['ID'];
$url = $baseUrl . '/api/v2/marketplaces/';
$result = callAPI("POST", $admin_token['access_token'], $url, $data);

?>

