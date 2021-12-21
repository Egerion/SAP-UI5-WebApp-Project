sap.ui.define(
    [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "../scripts/CFLibrary",
    ],
    function (Controller, Fragment, JSONModel,CFLibrary) {
    "use strict";
    return Controller.extend("com.ed.mii.dashboards.oeeDashboard", {
        onInit: function () {
            //this.waitAndInform();
            this.loadDummyModel();
        },
        loadDummyModel: function(){
            let oModel = new JSONModel("./model/FacilityData.json");
			this.getView().setModel(oModel, "dummyModel");
        },
        waitAndInform: async function () {
            while(true){
                
                await new Promise(function(resolve){setTimeout(resolve, 2000)});
                alert('You have waited 2 seconds');
            }
        },
       
        });
    }
);
