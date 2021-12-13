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
        onPressOpenMappage: function(){
            debugger;
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("facilityMap");
        },
        onPressOpenActiveWorkerpage: function(){

        },
        });
    }
);
