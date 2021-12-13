sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/ed/mii/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	//alert("UI5 is ready!")

	return UIComponent.extend("com.ed.mii.Component", {

		metadata: {
			manifest: "json",
			properties: {
				"currentRouteName": {} // default type == "string"
			}
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().attachBeforeRouteMatched(this.onBeforeRouteMatched, this);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		},

		onBeforeRouteMatched: function(event) { // beforeRouteMatched available since 1.46.1
			this.setCurrentRouteName(event.getParameter("name"));
		},

		getCurrentRoute: function() {
			return this.getRouter().getRoute(this.getCurrentRouteName());
		}
	});
});