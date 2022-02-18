<?php
// namespace Arcadier;
require 'admin_token.php';

class API
{
    
    private $adminToken = '';
    private $userToken = '';
    private $baseUrl    = '';
    private $marketplace = '';
    private $protocol = '';
    
    public function __construct()
    {
        $this->adminToken = getAdminToken();
        $this->marketplace = $_COOKIE["marketplace"];
        $this->baseUrl = $_COOKIE["marketplace"];
    }

    public function test(){
        return "Wacc";
    }

    public function callAPI($method, $access_token, $url, $data = false){
        $curl = curl_init();
        switch ($method) {
            case "POST":
                curl_setopt($curl, CURLOPT_POST, 1);
                if ($data) {
                    $jsonDataEncoded = json_encode($data);
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $jsonDataEncoded);
                }
                break;
            case "PUT":
                curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'PUT');
                if ($data) {
                    $jsonDataEncoded = json_encode($data);
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $jsonDataEncoded);
                }
                break;
            case "DELETE":
                curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'DELETE');
                break;
            default:
                if ($data) {
                    $url = sprintf("%s?%s", $url, http_build_query($data));
                }
        }
        $headers = ['Content-Type: application/json'];
        if ($access_token != null && $access_token != '') {
            array_push($headers, sprintf('Authorization: Bearer %s', $access_token));
        }
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        $result = curl_exec($curl);
        curl_close($curl);
        return json_decode($result, true);
    }

    public function getPackageID() {
        $requestUri = "$_SERVER[REQUEST_URI]";
        preg_match('/([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})/', $requestUri, $matches, 0);
        return $matches[0];
    }

    public function getAdminId(){
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        return $this->adminToken['UserId'];
    }

    public function AdminToken(){
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        return $this->adminToken['access_token'];
    }

    public function getMarketplaceBaseUrl() {
        $marketplace = $_COOKIE["marketplace"];
        $protocol = $_COOKIE["protocol"];
    
        $baseUrl = $protocol . '://' . $marketplace;
        return $baseUrl;
    }
    ///////////////////////////////////////////////////// BEGIN USER APIs /////////////////////////////////////////////////////

    public function getUserInfo($id, $include = null)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url = $this->baseUrl . '/api/v2/users/' . $id;
        if ($include != null) {
            $url .= "?includes=" . $include;
        }
        $userInfo = $this->callAPI("GET", $this->adminToken['access_token'], $url, null);
        return $userInfo;
    }

    public function getAllUsers($keywordsParam = null, $pageSize = null, $pageNumber = null)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url = $this->baseUrl . '/api/v2/admins/' .  $this->adminToken['UserId'] . '/users/?keywords=';
        // if ($keywordsParam != null) {
        //     $url .=  '?keywords='.$keywordsParam;
        // }
        if ($pageSize != null) {
            $url .=  '&pageSize='.$pageSize;
        }
        if ($keywordsParam != null) {
            $url .=  '&pageNumber='.$pageNumber;
        }
        $usersInfo = $this->callAPI("GET", $this->adminToken['access_token'], $url, null);
        return $usersInfo;
    }

    public function getAllMerchants($keywordsParam = null, $pageSize = null, $pageNumber = null)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url = $this->baseUrl . '/api/v2/admins/' .  $this->adminToken['UserId'] . '/users/?role=merchant';
        if ($keywordsParam != null) {
            $url .=  '&keywords='.$keywordsParam;
        }
        if ($pageSize != null) {
            $url .=  '&pageSize='.$pageSize;
        }
        if ($keywordsParam != null) {
            $url .=  '&pageNumber='.$pageNumber;
        }
        $usersInfo = $this->callAPI("GET", $this->adminToken['access_token'], $url, null);
        return $usersInfo;
    }

    public function getAllBuyers($keywordsParam = null, $pageSize = null, $pageNumber = null)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url = $this->baseUrl . '/api/v2/admins/' .  $this->adminToken['UserId'] . '/users/?role=buyer';
        if ($keywordsParam != null) {
            $url .=  '&keywords='.$keywordsParam;
        }
        if ($pageSize != null) {
            $url .=  '&pageSize='.$pageSize;
        }
        if ($keywordsParam != null) {
            $url .=  '&pageNumber='.$pageNumber;
        }
        $usersInfo = $this->callAPI("GET", $this->adminToken['access_token'], $url, null);
        return $usersInfo;
    }

    public function updateUserInfo($id, $data)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url      = $this->baseUrl . '/api/v2/users/' . $id;
        $userInfo = $this->callAPI("PUT", $this->adminToken['access_token'], $url, $data);
        return $userInfo;
    }

    public function getCustomTable($packageId, $tableName)
    {
        $url         = $this->baseUrl . '/api/v2/plugins/' . $packageId . '/custom-tables/' . $tableName;
        $customTable = $this->callAPI("GET", null, $url, null);
        return $customTable;
    }

    public function createRowEntry($packageId, $tableName, $data)
    {
        $url = 'https://' . $this->baseUrl . '/api/v2/plugins/' . $packageId . '/custom-tables/' . $tableName . '/rows';
        $response = $this->callAPI("POST", null, $url, $data);
        return $response;
    }

    public function editRowEntry($packageId, $tableName, $rowId, $data)
    {
        $url = 'https://' . $this->baseUrl . '/api/v2/plugins/' . $packageId . '/custom-tables/' . $tableName . '/rows/' . $rowId;
        $response = $this->callAPI("PUT", null, $url, $data);
        return $response;
    }

    public function deleteRowEntry($packageId, $tableName, $rowId)
    {
        $url         = $this->baseUrl . '/api/v2/plugins/' . $packageId . '/custom-tables/' . $tableName . '/rows/' . $rowId;
        $response = $this->callAPI("DELETE", null, $url, null);
        return $response;
    }

    public function searchTable($packageId, $tableName, $data)
    {
        $url         = $this->baseUrl . '/api/v2/plugins/' . $packageId . '/custom-tables/' . $tableName;
        $rowEntries = $this->callAPI("POST", null, $url, $data);
        return $rowEntries;
    }
    ///////////////////////////////////////////////////// END CUSTOM TABLE APIs /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////// BEGIN EVENT TRIGGER APIs /////////////////////////////////////////////////////


    public function getEventTriggers()
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url           = $this->baseUrl . '/api/v2/event-triggers/';
        $eventTriggers = $this->callAPI("GET", $this->adminToken['access_token'], $url, null);
        return $eventTriggers;
    }

    public function addEventTrigger($data)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url  = $this->baseUrl . '/api/v2/event-triggers/';
        
        $eventResult = $this->callAPI("POST", $this->adminToken['access_token'], $url, $data);
        return $eventResult;
    }

    //untested
    public function updateEventTrigger($eventTriggerId, $data)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url  = $this->baseUrl . '/api/v2/event-triggers/' . $eventTriggerId;
        $eventResult = $this->callAPI("PUT", $this->adminToken['access_token'], $url, $data);
        return $eventResult;
    }

    public function removeEventTrigger($eventId)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url         = $this->baseUrl . '/api/v2/event-triggers/' . $eventId;
        $eventResult = $this->callAPI("DELETE", $this->adminToken['access_token'], $url, null);
        return $eventResult;
    }
    ///////////////////////////////////////////////////// END EVENT TRIGGER APIs /////////////////////////////////////////////////////

    ///////////////////////////////////////////////////// BEGIN MARKETPLACE APIs /////////////////////////////////////////////////////

    public function getMarketplaceInfo()
    {
        // $auth = new AUTH();
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url           = $this->baseUrl . '/api/v2/marketplaces/';
        $info = $this->callAPI("GET", $this->adminToken['access_token'], $url, null);
        return $info;
    }

    public function updateMarketplaceInfo($data)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url           = $this->baseUrl . '/api/v2/marketplaces/';
        $info = $this->callAPI("POST", $this->adminToken['access_token'], $url, $data);
        return $info;
    }
    //untested
    public function customiseURL($data)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url           = $this->baseUrl . '/api/v2/rewrite-rules/';
        $response = $this->callAPI("POST", $this->adminToken['access_token'], $url, $data);
        return $response;
    }
    ///////////////////////////////////////////////////// END MARKETPLACE APIs /////////////////////////////////////////////////////

    ///////////////////////////////////////////////////// BEGIN EMAIL APIs /////////////////////////////////////////////////////

    public function createCustomField($data)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url  = $this->baseUrl . '/api/v2/admins/' . $this->adminToken['UserId'] . '/custom-field-definitions/';
        $createdCustomField = $this->callAPI("POST", $this->adminToken['access_token'], $url, $data);
        return $createdCustomField;
    }

    public function getCustomFields()
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url  = $this->baseUrl . '/api/v2/admins/' . $this->adminToken['UserId'] . '/custom-field-definitions/';
        $customFields = $this->callAPI("GET", $this->adminToken['access_token'], $url, null);
        return $customFields;
    }

    public function deleteCustomField($code)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url  = $this->baseUrl . '/api/v2/admins/' . $this->adminToken['UserId'] . '/custom-field-definitions/' . $code;
        $deletedCustomField = $this->callAPI("DELETE", $this->adminToken['access_token'], $url, null);
        return $deletedCustomField;
    }

    public function updateCustomField($code, $data)
    {
        if ($this->adminToken == null) {
            $this->adminToken = getAdminToken();
        }
        $url  = $this->baseUrl . '/api/v2/admins/' . $this->adminToken['UserId'] . '/custom-field-definitions/' . $code;
        $updatedCustomField = $this->callAPI("PUT", $this->adminToken['access_token'], $url, $data);
        return $updatedCustomField;
    }

    public function getPluginCustomFields($packageId)
    {
        $url  = $this->baseUrl . '/api/v2/packages/' . $packageId . '/custom-field-definitions/';
        $customFields = $this->callAPI("GET", null, $url, null);
        return $customFields;
    }

    ///////////////////////////////////////////////////// END CUSTOM FIELD APIs /////////////////////////////////////////////////////
}
?>