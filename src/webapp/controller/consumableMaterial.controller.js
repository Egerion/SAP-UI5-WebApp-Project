sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/resource/ResourceModel",
        "../scripts/regression",
        "../scripts/CFLibrary",
        "sap/ui/core/Fragment",
    ],
    function (Controller, JSONModel, ResourceModel, Scripts, CFLibrary, Fragment) {
        "use strict";
        return Controller.extend("com.ed.mii.controller.consumableMaterial", {
            ///@init.
            onInit: function () {
                // this.appComponent = this.getView().getViewData().appComponent;
                // this.appData = this.appComponent.getAppGlobalData();
                // this.interfaces = this.appComponent.getODataInterface();
                this.setMyModelOntoView(this.runXacuteQuery(), "materialModel");
            },
            ///@called, set model onto view.
            setMyModelOntoView: function(oModel, oName){
                let jsModel = new JSONModel(oModel);
                jsModel.setData(oModel);
                this.getView().setModel(jsModel, "materialModel");
            },
            ///@called, call xacute query from /scripts/regression.js
            runXacuteQuery: function(oParams){
                if(!oParams)
                    oParams = "Param.1=" + "NA";
                let result = CFxmlHttpReqXacute.bind(this)("DEMIRBAS_Test/SarfMalzeme/matterialTableXacute", oParams);
                return result;
            },
            ///@check, filter table for active orders only.
            onCheckFilterTable: function(){
                if(this.appData.selected.order.orderStatus == "ACT"){
                    let simulationState = this.byId("cBoxRunSimulation").getSelected();
                    let filterState = this.byId("checkBoxActiveOrders").getSelected();
                    this.CreateTable(simulationState, filterState, false)
                }
                else{
                    this.byId("checkBoxActiveOrders").setSelected(false);
                    sap.oee.ui.Utils.createMessage("Aktif Sipariş Bulunmamakta", sap.ui.core.MessageType.Success);
                }
            },
            ///@press, refresh table.
            onPressRefreshTable: function(){
                let simulationState = this.byId("cBoxRunSimulation").getSelected();
                let filterState = this.byId("checkBoxActiveOrders").getSelected();
                this.CreateTable(simulationState, filterState, false)
            },
            ///@check, run simulation.
            onSelectRunSimulation: function(oEvent){
                let simulationState = this.byId("cBoxRunSimulation").getSelected();
                let filterState = this.byId("checkBoxActiveOrders").getSelected();
                this.CreateTable(simulationState, filterState, false)
            },
            ///@called, create table with simulation estimations.
            CreateTable: function(isSimulationUsed, isParamExist, isCustumIterationExists){
                let params, model;
                if(isParamExist){
                    params = "Param.1=" + this.appData.selected.order.orderNo;
                    model = this.runXacuteQuery(params)
                }
                else{
                    model = this.runXacuteQuery()
                }
                if(isSimulationUsed){
                    this.getView().setBusy(true);
                    setTimeout(function(){
                            for(let i = 0; i < model.Rowsets.Rowset[0].Row.length; i++){
                                model.Rowsets.Rowset[0].Row[i].COUNT_SIMU = RegressionInit(model.Rowsets.Rowset[0].Row[i].MATNR, isCustumIterationExists);
                                //console.log(model.Rowsets.Rowset[0].Row[i].MATNR);
                            }
                            this.getView().setBusy(false);
                            this.setMyModelOntoView(model, "materialModel")
                            this.byId("cSimulationSuggestion").setVisible(true);
                        }.bind(this), 3000
                    );
                }
                else{
                    this.byId("cSimulationSuggestion").setVisible(false);
                }
                this.setMyModelOntoView(model, "materialModel")
            },
            ///@press, open fragment for advanced mode.
            onPressOpenAdvancedMode: function(){
                if (!this.simulationTab) {
                    this.simulationTab = sap.ui.xmlfragment(this.getView().getId(), "com.ed.mii.view.fragments.consumableMaterial", this);
                    this.getView().addDependent(this.simulationTab);
                }
                this.simulationTab.open();
            },
            ///@Called, close fragment and do necessary things.
            onCloseDialog: function (oEvent) {
                if (oEvent) {
                    oEvent.oSource.getParent().close();
                    let materialName = this.byId("cbMaterialNames").getValue();
                    let iBegin = this.byId("ipBeginStep").getValue();
                    let iEnd = this.byId("ipEndStep").getValue();
                    let iStep = this.byId("ipStep").getValue();
                    if(!Number(iBegin))
                        sap.m.MessageToast.show("başlangıç adımı eksik!");
                    else if(!Number(iEnd))
                        sap.m.MessageToast.show("bitiş adımı eksik!");
                    else if(!Number(iStep))
                        sap.m.MessageToast.show("adım eksik!");
                    else if(iBegin > iEnd || iStep > iEnd)
                        sap.m.MessageToast.show("adım ayarları hatalı!");
                    else{
                        let simulationState = this.byId("cBoxRunSimulation").setSelected(true);
                        let filterState = this.byId("checkBoxActiveOrders").getSelected();
                        OverrideCoeffs(iBegin, iEnd, iStep);
                        this.CreateTable(simulationState, filterState, true);
                    }
                    this.onCloseResetDialogSettings();
                }
            },
            ///@Press, cancel dialog and do nothing.
            onCancelDialog: function(oEvent){
                if (oEvent)
                    oEvent.oSource.getParent().close();
                this.onCloseResetDialogSettings();
            },
            ///@Called, reset taken parameters of fragment.
            onCloseResetDialogSettings: function(){
                this.byId("ipBeginStep").setValue("");
                this.byId("ipEndStep").setValue("");
                this.byId("ipStep").setValue("");
                this.byId("cbMaterialNames").setValue("");
                this.byId("permutationResult").setText("");
                this.byId("permutationResult").setVisible(false);
            },
            ///@Press, trigger permutation calculation.
            onChangeCalculatePermutation: function(){
                let iBegin = Number(this.byId("ipBeginStep").getValue());
                let iEnd = Number(this.byId("ipEndStep").getValue());
                let iStep = Number(this.byId("ipStep").getValue());
                //if(iBegin & iEnd & iStep){
                    this.byId("permutationResult").setVisible(true);
                    let permResult = Math.pow((Math.abs(iEnd - (iBegin))/ iStep),3);
                    this.byId("permutationResult").setText("Toplam iterasyon: " + permResult);
                //}
            },
        });
    }
);