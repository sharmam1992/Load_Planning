sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "com/dpz/loadplanning/utils/formatter",
        "sap/m/HBox",
        "sap/m/Text"
    ],
    function (Controller, formatter, HBox, Text) {
        "use strict";

        return Controller.extend("com.dpz.loadplanning.controller.Details", {
            onInit: function () {

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("Details").attachPatternMatched(this._onObjectMatchedForDetails, this);
                //console.log("ReachedHere");
                this._buildLoadMap();
                
            },
            _onObjectMatchedForDetails: function (oEvent) {
                //var Route = oEvent.getParameter("arguments").Route;
                //var WaveReleaseDate = oEvent.getParameter("arguments").WaveReleaseDate;
                //var SCCID = oEvent.getParameter("arguments").SCCID;
                var ID = oEvent.getParameter("arguments").ID;
                let oRouteDetailsModel = this.getOwnerComponent().getModel("routeDetailsModel");
                this.oSelectedObject = oRouteDetailsModel.getData();
                this.getView().byId("RouteDateId").setText(formatter.formatDate(this.oSelectedObject.WaveReleaseDate));
                this.getView().byId("RouteId").setText(this.oSelectedObject.Route);
                this.getView().byId("RouteName").setText(this.oSelectedObject.RouteDescription);
                
            },
            _buildLoadMap: function () {
                let oRouteDetailsModel = this.getOwnerComponent().getModel("routeDetailsModel");
                this.oSelectedObject = oRouteDetailsModel.getData();
                let firstVBox = this.getView().byId("idFirstVBox");
                let truckSize = this.oSelectedObject.TruckSizeType;
                let noOfRows="";
                switch (truckSize) {
                    case "26":
                        noOfRows = 10;
                        break;
                    case "36":
                        noOfRows = 16;
                        break;
                    case "48":
                        noOfRows = 21;
                        break;
                    case "53":
                        noOfRows = 24;
                        break;
                    default:
                    // code block
                }
               // noOfRows = 10;
                for (var i = 0; i < noOfRows; i++) {
                    var rowHBox = new HBox({
                        justifyContent: "Center",
                        alignItems: "Center"
                    });
                    // Add content to the HBox dynamically
                    var rowno = i + 1;
                    var oText = new Text({
                        text: rowno.toString(),
                        textAlign: "Center"
                    });
                    oText.addStyleClass("txtPadding");
                    oText.addStyleClass("sapUiSmallMargin");
                    rowHBox.addItem(oText);
                    var noOfColumns = 5;
                    for (var j = 0; j < noOfColumns; j++) {
                        var columnHBox = new HBox({});
                        columnHBox.addStyleClass("borderHBox");
                        columnHBox.addStyleClass("sapUiTinyMargin");
                        rowHBox.addItem(columnHBox);

                    }
                    firstVBox.addItem(rowHBox);


                }

            }


        });
    }
);
