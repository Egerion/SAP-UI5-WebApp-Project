sap.ui.define(
    [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "../scripts/CFLibrary",
    ],
    function (Controller, Fragment, JSONModel,CFLibrary) {
    "use strict";
    return Controller.extend("com.ed.mii.controller.main", {
        onInit: function () {
            this.setDate();
        },
        setDate: function(){
            let day =  new Date().getDate();
            this.byId("numericContainerId").setValue(Number(day));
        },
        onPressOpenMappage: function(oEvent){
            sap.ui.core.UIComponent.getRouterFor(this).navTo("facilityMap");
        },
        onPressOpenActiveWorkerpage: function(oEvent){
        },
        onPressConsumableMaterialpage: function(oEvent){
            sap.ui.core.UIComponent.getRouterFor(this).navTo("consumableMaterial");
        },
        onPressOEEDashboardpage: function(oEvent){
            sap.ui.core.UIComponent.getRouterFor(this).navTo("oeeDashboard");
        },
        onPressFaceLoginPage: function(oEvent){
            sap.ui.core.UIComponent.getRouterFor(this).navTo("faceLogin");
        },
        });
    }
);
