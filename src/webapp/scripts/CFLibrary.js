/*
 * Author: Ege Demirbaş
 * Date: 10-12-2021
 * Purpose: Custom Library to store necessary methods through different projects when needed.
 */

///http request method
function CFxmlHttpReqXacute(oPath, oParam, targetFunc = undefined){
    let paramsData = "", isAsyc = true, result;
    Object.keys(oParam).forEach(function (oItem) {
        if (paramsData == "")
            paramsData = oItem + "=" + oParam[oItem];
        else
            paramsData = paramsData + "&" + oItem + "=" + oParam[oItem];
    });
    if(typeof targetFunc === "undefined")
        isAsyc = false;
    $.ajax({
        type: "POST",
        async: isAsyc,
        url:"/XMII/Illuminator?QueryTemplate=" +oPath +"&" +paramsData +"&Content-Type=text/json",
        dataType: "json",
        success: function (response) {
            if(typeof targetFunc !== "undefined"){
                targetFunc.bind(this)(response);
            }
            result = response;
        }.bind(this),
    });
    return result;
}

function xmlHttpReqXacute(xacutePath, params, sourceView) {
    if (sourceView) {
        sourceView.setBusyIndicatorDelay(0);
        sourceView.open();
    }
    var xmlHttp = new XMLHttpRequest(),
        url = "",
        response;
    url = "/XMII/Illuminator?QueryTemplate=" + xacutePath + "&" + params + "&Content-Type=text/json";
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) {
            response = JSON.parse(xmlHttp.responseText);
        }
    }
    xmlHttp.open("GET", url, false);
    xmlHttp.send();
    if (sourceView) {
        sourceView.close();
    } return response;
}