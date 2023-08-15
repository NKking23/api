function getTime(){
    var timestamp = new Date().getTime();
    return timestamp;
}

// Business verification calculation
function calcSign(clientId, accessToken, timestamp, nonce, signStr, secret){
    var str = clientId + accessToken + timestamp + nonce + signStr;
    var hash = CryptoJS.HmacSHA256(str, secret);
    var hashInBase64 = hash.toString(CryptoJS.enc.Base64);
    var signUp = hashInBase64.toUpperCase();
    return signUp;
}

// Generate signature string
function stringToSign(query, mode, method, secret, headers, urlPath){
    var sha256 = "";
    var url = "";
    var headersStr = "";

    var arr = [];
    var map = {};
    var bodyStr = "";

    if (query) {
        // Convert query to array and map
        toJsonObj(query, arr, map);
    }

    if (mode && mode === "raw" && headers.hasOwnProperty("Content-Type") && headers["Content-Type"] === "application/json") {
        // You'll need to provide the raw request body text here
        bodyStr = JSON.stringify({}); // Replace with your raw request body
    }

    sha256 = CryptoJS.SHA256(bodyStr).toString(CryptoJS.enc.Hex);

    arr = arr.sort();
    arr.forEach(function(item){
        url += item + "=" + map[item] + "&";
    });

    if (url.length > 0) {
        url = url.substring(0, url.length - 1);
        url = "/" + urlPath.join("/") + "?" + url;
    } else {
        url = "/" + urlPath.join("/");
    }

    if (headers.hasOwnProperty("Signature-Headers") && headers["Signature-Headers"]) {
        var signHeaderStr = headers["Signature-Headers"];
        const signHeaderKeys = signHeaderStr.split(":");
        signHeaderKeys.forEach(function(item){
            var val = "";
            if (headers.hasOwnProperty(item) && headers[item]) {
                val = headers[item];
            }
            headersStr += item + ":" + val + "\n";
        });
    }

    url = replacePostmanUrl(url);

    map["signUrl"] = method + "\n" + sha256 + "\n" + headersStr + "\n" + url;
    map["url"] = url;
    return map;
}

function replacePostmanUrl(str){
    while (str.indexOf("{{") !== -1 && str.indexOf("}}") !== -1) {
        const key = str.substring(str.indexOf("{{") + 2, str.indexOf("}}"));
        var value = ""; // Replace this with the actual value from your environment
        if (!value) value = "";
        str = str.replace("{{" + key + "}}", value);
    }

    while (str.indexOf(":") !== -1) {
        const tempStr = str.substring(str.indexOf(":") + 1, str.length);
        var key = "";
        if (tempStr.indexOf("/") !== -1) {
            key = tempStr.substring(0, tempStr.indexOf("/"));
        } else if (tempStr.indexOf("?") !== -1) {
            key = tempStr.substring(0, tempStr.indexOf("?"));
        } else {
            key = tempStr.substring(0, tempStr.length);
        }
        var value = ""; // Replace this with the actual value from your request
        if (!value) value = "";
        str = str.replace(":" + key, value);
    }
    return str;
}

function toJsonObj(params, arr, map){
    for (var key in params) {
        if (!params[key].disabled) {
            arr.push(params[key].key);
            map[params[key].key] = params[key].value;
        }
    }
}

var timestamp = getTime();
var clientId = "yhpwg8vvvd3jweqhewhx"; // Replace with your client ID
var secret = "62d7b191bb3e4a3abfee72abf8e50b56"; // Replace with your secret
var accessToken = ""; // Replace with your access token if available
var httpMethod = "GET"; // Replace with your HTTP method
var query = {}; // Replace with your query parameters
var mode = ""; // Replace with your request body mode
var headers = {}; // Replace with your request headers
var urlPath = [""]; // Replace with your URL path segments

var signMap = stringToSign(query, mode, httpMethod, secret, headers, urlPath);
var urlStr = signMap["url"];
var signStr = signMap["signUrl"];
var nonce = headers.hasOwnProperty("nonce") ? headers["nonce"] : "";

var sign = calcSign(clientId, accessToken, timestamp, nonce, signStr, secret);

console.log("Signature:", sign);
