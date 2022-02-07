sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
    function (Controller, JSONModel) {
      "use strict";
      var sliceIndex = 0;
      var newSplitoData = [];
      return Controller.extend("com.ed.mii.controller.dashboardSample1", {
        onInit: function () {
          this.getGridData();
        },
  
        onClick: function (oEvent) {
        
          var selectedLineItem =  oEvent.oSource.mProperties.highlightText;
          this.getLineInfo(selectedLineItem);
        },
  
        getLineInfo: function(selectedItem){
          var params = {
            'Param.1':selectedItem
          }
          this.ajaxRequestXacute(
              "MES/ME_TEST/egeak/gridList/getLineInfoXacute",
              params,
              this.getLineInfoModel
            );
        },
        getLineInfoModel:function(oData){
          var oModel = new sap.ui.model.json.JSONModel(oData);
          this.getView().setModel(oModel, "lineInfoModel");
          this.openLineInfoFragment();
        },
        
        openLineInfoFragment: function () {
          // this.onCloseShow();
          if (!this.chartModelLineInfo) {
            this.chartModelLineInfo = sap.ui.xmlfragment(
              this.getView().getId(),
              "com.ed.mii.view.lineInfo",
              this
            );
            this.getView().addDependent(this.chartModelLineInfo);
          }
          this.chartModelLineInfo.open();
        },
  
        openDetailsFragment: function () {
          // this.onCloseShow();
          if (!this.infoDialog) {
            this.infoDialog = sap.ui.xmlfragment(
              this.getView().getId(),
              "com.ed.mii.view.infoPage",
              this
            );
            this.getView().addDependent(this.infoDialog);
          }
          this.infoDialog.open();
        },
  
        mainLoop: async function (oData) {
          let type = true;
          while (true) {
              this.getTopScraps();
              this.getTopReason();
              this.getTopNodesInHold();
            let modelLegth = oData.Rowsets.Rowset[0].Row.length;
  
            for (let i = 0; i < modelLegth; i += 4) {
              newSplitoData = [oData.Rowsets.Rowset[0].Row.slice(i, i + 4)];
              let oModel = new sap.ui.model.json.JSONModel(newSplitoData);
              this.getView().setModel(oModel, "gridListItemsModel");
            if (type) {
             
              type = false;
            } else {
             
              type = true;
            }
            await new Promise(function (resolve) {
              setTimeout(resolve, 10000);
            });
          }
      }
        },
  //stack
        getTopScraps: function(){
          this.ajaxRequestXacute(
              "MES/ME_TEST/egeak/gridList/getTopMatnrCauseOfScrapXacute",
              null,
              this.getTopScrapModel
            );
        },
        getTopScrapModel:function(oData){
          var oModel = new sap.ui.model.json.JSONModel(oData);
          this.getView().setModel(oModel, "topScrapModel");
        },
  //pie
        getTopReason: function(){
          this.ajaxRequestXacute(
              "MES/ME_TEST/egeak/gridList/getTopReasonCodesXacute",
              null,
              this.getTopReasonModel
            );
        },
        getTopReasonModel:function(oData){
          var oModel = new sap.ui.model.json.JSONModel(oData);
          this.getView().setModel(oModel, "topReasonModel");
        },
  //alt grid list
        getGridData: function(){
          this.ajaxRequestXacute(
              "MES/ME_TEST/egeak/gridList/getQuantityXacute",
              null,
              this.mainLoop
            );
        },
  
  //column chart
        getTopNodesInHold: function(){
          this.ajaxRequestXacute(
              "MES/ME_TEST/egeak/gridList/getTopNodesInHoldStatusXacute",
              null,
              this.getNodesInHoldModel
            );
        },
        getNodesInHoldModel:function(oData){
          var oModel = new sap.ui.model.json.JSONModel(oData);
          this.getView().setModel(oModel, "topNodeInHold");
        },
  
  
  
  
        onOpenDialogChartOne: function () {
          if (!this.chartModelTableDialog) {
            this.chartModelTableDialog = sap.ui.xmlfragment(
              this.getView().getId(),
              "com.ed.mii.view.chartTable",
              this
            );
            this.getView().addDependent(this.chartModelTableDialog);
          }
          this.chartModelTableDialog.open();
      },
  
      onOpenDialogChartTwo: function () {
        if (!this.chartModelTableDialogTwo) {
          this.chartModelTableDialogTwo = sap.ui.xmlfragment(
            this.getView().getId(),
            "com.ed.mii.view.chartTableTwo",
            this
          );
          this.getView().addDependent(this.chartModelTableDialogTwo);
        }
        this.chartModelTableDialogTwo.open();
    },
  
    onOpenDialogChartThree: function () {
      if (!this.chartModelTableDialogThree) {
        this.chartModelTableDialogThree = sap.ui.xmlfragment(
          this.getView().getId(),
          "com.ed.mii.view.chartTableThree",
          this
        );
        this.getView().addDependent(this.chartModelTableDialogThree);
      }
      this.chartModelTableDialogThree.open();
  },
  
      onCloseDialog: function (oEvent) {
  
          if(oEvent) {
              // Kapat tuşu event, eventin sourcesini kapatma butonu olarak aldım, kapatma butonunun parenti diyalog
              oEvent.oSource.getParent().close();
          }
  
      },
      
  
        ajaxRequestXacute: function (transactionPath, params, targetFunc) {
          var varParams = "";
          if (params) {
            Object.keys(params).forEach(function (oItem) {
              if (varParams == "") varParams = oItem + "=" + params[oItem];
              else varParams += "&" + oItem + "=" + params[oItem];
            });
          }
          $.ajax({
            type: "POST",
            url:
              "/XMII/Illuminator?QueryTemplate=" +
              transactionPath +
              "&" +
              varParams +
              "&Content-Type=text/json",
            dataType: "json",
            success: function (result) {
              targetFunc.bind(this)(result);
            }.bind(this),
          });
        },
  onPress: function(oEvent){
      var choosenChart = oEvent.oSource.sId.split("--")[(oEvent.oSource.sId.split("--").length-1)];
    if(choosenChart == "chartOne"){
      this.onOpenDialogChartOne();
    }else if(choosenChart == "chartTwo"){
      this.onOpenDialogChartTwo();
      //this.getView().setModel(this.getView().getModel("topScrapModel"), "modelName");
    }else{
      this.onOpenDialogChartThree();
    }
  }
      });
    }
  );
  