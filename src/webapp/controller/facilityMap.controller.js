sap.ui.define(
    [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "../scripts/CFLibrary",
    "sap/ui/Device",
    ],
    function (Controller, Fragment, JSONModel,CFLibrary, Device) {
    "use strict";
    return Controller.extend("com.ed.mii.controller.facilityMap", {
        onInit: function () {
            let oModel = new JSONModel("./model/FacilityData.json");
			this.getView().setModel(oModel);

			// set the device model
			let oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.getView().setModel(oDeviceModel, "device");

			this.byId("vbi").setVisualFrame({
				"minLon": 3,
				"maxLon": 19,
				"minLat": 46,
				"maxLat": 56,
				"minLOD": 4
			});
        },
        });
    }
);
