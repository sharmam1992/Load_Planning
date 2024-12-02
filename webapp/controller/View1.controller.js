sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/BusyDialog",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "com/dpz/loadplanning/utils/formatter",
],
    function (
        Controller,
        Fragment,
        JSONModel,
        MessageToast,
        BusyDialog,
        Filter,
        FilterOperator,
        MessageBox,
        formatter
    ) {
        "use strict";

        return Controller.extend("com.dpz.loadplanning.controller.View1", {
            onInit: function () {
                this.BusyDialog = new BusyDialog();
                let oLocalModel = new JSONModel();
                let oTruckModel = new JSONModel();
                this.getView().setModel(oLocalModel, "oLocalModel");
                this.getView().setModel(oTruckModel, "oTruckModel");
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter
                    .getRoute("RouteView1")
                    .attachPatternMatched(this._onRouteMatchListDisplay, this);

            },
            /**
            * Route match handler for the routes.
            */
            _onRouteMatchListDisplay: function (oEvent) {

                this._startFetchingDailyRouteDetails([]);
            },
            /**
            * Starts daily route operations.
            */
            _startFetchingDailyRouteDetails: async function (aFilters) {
                let oView = this.getView();
                oView.setBusy(true);
                 let sLoggedInUser = await this.getLoggedInUser().catch(function (oError) {
                     oView.setBusy(false);
                     MessageBox.error(`Fetching User ID from BTP work zone User API failed!`)
                 });
 
                 sLoggedInUser = sLoggedInUser.name;
                //let sLoggedInUser = 'sasi.reddy@dominos.com';

                let aListOfUserAssignment = await this.getUserAssignmentDetails(
                    sLoggedInUser
                ).catch(function (oError) {
                    oView.setBusy(false);
                    MessageBox.error(`Fetching User Assignment of SCCID failed!!`)
                });

                let aSCCID_List = aListOfUserAssignment.results.map(function (item) {
                    return item.PsId
                })
                this.aSCCID_List = aSCCID_List;
                // if no sccid is present
                if (aSCCID_List.length === 0) {
                    oView.setBusy(false);
                    MessageBox.error(`SCCID Does not exists!!`);
                    return;
                } else {
                    let aRouteDetails = [];
                    let aTruckDetails = [];
                    // To Fetch Truck Sizes
                    aTruckDetails = await this._fetchTrcukSizes()
                        .catch(function (oError) {
                            oView.setBusy(false);
                            MessageBox.error(`OData Service failed while fetching truck sizes from BTP Cloud!`)
                        });
                    aTruckDetails = aTruckDetails.results;
                    const oTruckModel = this.getView().getModel("oTruckModel");
                    oTruckModel.setData(aTruckDetails);
                    oTruckModel.refresh(true);
                    // To Fetch Routes
                    aFilters.push(new Filter("WarehouseNumber", FilterOperator.EQ, this.aSCCID_List[0]));
                    //aFilters.push(new Filter("WaveReleaseDate", FilterOperator.EQ, formatter.parseDateUTC(new Date())));
                    aRouteDetails = await this._fetchRoutes(
                        aFilters

                    ).catch(function (oError) {
                        oView.setBusy(false);
                        MessageBox.error(`OData Service failed while fetching Routes from BTP Cloud!`)
                    });
                    // aRouteDetails = aRouteDetails.results;
                    // const oLocalModel = this.getView().getModel("oLocalModel");
                    // oLocalModel.setData(aRouteDetails);
                    // oLocalModel.refresh(true);
                    // this.getView().setBusy(false);

                }

            },
            /**
            * Fetches Routes from BTP.
            */
            _fetchRoutes: function (aFilters) {
                let oDataModel = this.getOwnerComponent().getModel();
                var that = this;
                return new Promise(function (resolve, reject) {
                    oDataModel.read("/RouteSet", {
                        filters: aFilters,
                        success: function (response) {
                            resolve(response);
                            that._fetchDailyRoutes(aFilters);
                        },
                        error: function (oError) {
                            reject(oError);
                        },
                    });
                });

            },
            /**
            * Fetches DailyRoutes from BTP.
            */
            _fetchDailyRoutes: function (aFilters) {
                let adFilterSCC = [];
                adFilterSCC.push(new Filter("SCCID", FilterOperator.EQ, this.aSCCID_List[0]));
                // adFilterSCC.push(new Filter("WaveReleaseDate", FilterOperator.EQ, formatter.parseDateUTC(new Date())));
                let oDataModel = this.getOwnerComponent().getModel();
                var that = this;
                return new Promise(function (resolve, reject) {
                    oDataModel.read("/Dailyroute", {
                        filters: adFilterSCC,
                        success: function (response) {
                            resolve(response);
                            //aRouteDetails = aRouteDetails.results;
                            const oLocalModel = that.getView().getModel("oLocalModel");
                            oLocalModel.setData(response.results);
                            oLocalModel.refresh(true);
                            that.getView().setBusy(false);
                        },
                        error: function (oError) {
                            reject(oError);
                        },
                    });
                });

            },
            /**
            * Fetches Routes from BTP.
            */
            _fetchTrcukSizes: function () {
                let oDataModel = this.getOwnerComponent().getModel();
                return new Promise(function (resolve, reject) {
                    oDataModel.read("/TruckConfig", {
                        success: function (response) {
                            resolve(response);
                            const oLocalModel = that.getView().getModel("oLocalModel");
                            oLocalModel.refresh(true);
                        },
                        error: function (oError) {
                            reject(oError);
                        },
                    });
                });

            },
            /**
             * Fetches user assignment details.
            */
            getUserAssignmentDetails: function (sLoggedInUser) {
                let oCreditTrackerModel =
                    this.getOwnerComponent().getModel("CreditTracker");
                let oController = this;

                return new Promise(function (resolve, reject) {
                    oCreditTrackerModel.read("/UserAssignment?$orderby=modifiedBy asc", {
                        filters: [
                            oController.getUserAssignmentFilterCondition(sLoggedInUser),
                        ],
                        success: function (oRes) {
                            resolve(oRes);
                        },
                        error: function (oError) {
                            reject(oError);
                        },
                    });
                });
            },
            /**
             * Fetches SCCRegion details.
             */
            getSCCRegionDetails: function (psId) {
                let oCreditTrackerModel =
                    this.getOwnerComponent().getModel("CreditTracker");
                let oController = this;

                return new Promise(function (resolve, reject) {
                    oCreditTrackerModel.read("/SCCRegion", {
                        filters: [
                            oController.getSCCRegionFilterCondition(psId),
                        ],
                        success: function (oRes) {
                            resolve(oRes.results[0].ISSAP);
                        },
                        error: function (oError) {
                            reject(oError);
                        },
                    });
                });
            },

            //get Logged in User  from approuter global api
            getLoggedInUser: function () {
                // oController = this;
                const xsURL = this.getBaseURL() + "/user-api/currentUser";

                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: xsURL,
                        dataType: "json",
                        success: function (oData, textStatus) {

                            resolve(oData);
                        },
                        error: function (oError) {

                            reject(oError);
                        },
                    });
                });


            },
            /**
            * Creates a filter condition for user assignment.
            */

            getUserAssignmentFilterCondition: function (sLoggedInUser) {
                return new Filter({
                    filters: [
                        new Filter("User_UserId", FilterOperator.EQ, sLoggedInUser),
                        new Filter("AssignmentType", FilterOperator.EQ, "SCC"),
                    ],
                    and: true,
                });
            },
            /**
             * Creates a filter condition for SCCRegion.
             */

            getSCCRegionFilterCondition: function (psId) {
                return new Filter({
                    filters: [
                        new Filter("PsId", FilterOperator.EQ, psId),
                    ],
                    and: false,
                });
            },
            /**
            * Success handler for getLoggedInUser AJAX call.
            * @param  oController The controller instance.
            * @param  oData The response data from the AJAX call.
            * @param  textStatus The status of the response.
            */
            getLoggedInUserSuccess: function (oController, oData, textStatus) {
                const oUser = new JSONModel(oData);
                oController.getView().setModel(oUser, "userModel");
                console.log(oData);
            },
            /**
             * Error handler for getLoggedInUser AJAX call.
             */
            getLoggedInUserError: function () {
                MessageToast.show("Something Went Wrong");
            },
            /**
              * Retrieves the base URL for the application.
              */
            getBaseURL: function () {
                const appId =
                    this.getOwnerComponent().getManifestEntry("/sap.app/id");
                const appPath = appId.replaceAll(".", "/");
                const appModulePath = jQuery.sap.getModulePath(appPath);
                return appModulePath;
            },

            /**
              * Handles common AJAX call.
              * @param {sap.ui.core.mvc.Controller} oController The controller instance.
              * @param {string} sEndPoint The endpoint URL.
              * @param {string} sCallType The type of AJAX call (GET, POST, etc.).
              * @param {function} fSuccess The success callback function.
              * @param {function} fError The error callback function.
              */
            handleAjaxCall: function (
                oController,
                sEndPoint,
                sCallType,
                fSuccess,
                fError
            ) {
                let oReturn;
                oController.BusyDialog.open();
                //const that = this;
                $.ajax({
                    type: sCallType,
                    url: sEndPoint,
                    dataType: "json",
                    success: function (oData, textStatus) {
                        oController.BusyDialog.close();
                        oReturn = fSuccess(oController, oData);
                    },
                    error: function (oError) {
                        oController.BusyDialog.close();
                        MessageToast.show("Something Went Wrong");
                        oReturn = fError(oError);
                    },
                });
            },
            /**
             * Save Routes
             */
            saveRoutes: function () {
                let aRoutesData = "";
                const oLocalModel = this.getView().getModel("oLocalModel");
                aRoutesData = oLocalModel.getData();
                const oDataModel = this.getOwnerComponent().getModel();
                var fnSuccess = function (oData, response) {
                    // oBusyDialog.close();
                    //oView.setBusy(false);
                    // sap.m.MessageToast.show(oView.getModel("i18n").getResourceBundle().getText("questionnaireSuccess"));
                }.bind(this);

                var fnError = function (oError) {
                    // oBusyDialog.close();
                    // oView.setBusy(false);
                    // sap.m.MessageBox.error(oView.getModel("i18n").getResourceBundle().getText("questionnaireFailed") + oError.message);
                };
                if (aRoutesData !== "") {
                    oDataModel.update("/Dailyroute", aRoutesData, {
                        success: fnSuccess,
                        error: fnError
                    });
                }


            },
            validateNumber: function (oEvent) {
                var sNumber = "";
                var value = oEvent.getSource().getValue();
                var bNotnumber = isNaN(value);
                if (bNotnumber == false) sNumber = value;
                else oEvent.getSource().setValue(sNumber);
            },

            onChange: function (oEvent) {
                const oDataModel = this.getOwnerComponent().getModel();
                const that = this;
                const oBindingContext = oEvent.getSource().getBindingContext("oLocalModel").getObject();
                const ID = oBindingContext.ID;
                // Extract necessary fields from binding context
                const SCCID = oBindingContext.SCCID;
                const Route = oBindingContext.Route;

                // Convert WaveReleaseDate to Date object and format to YYYY-MM-DD
                const WaveReleaseDate = new Date(oBindingContext.WaveReleaseDate);
                const formattedWaveReleaseDate = WaveReleaseDate.toISOString().split("T")[0]; // Format to YYYY-MM-DD

                // Construct URI using the formatted date
                const uri = `/Dailyroute(ID=guid'${ID}',SCCID='${SCCID}',WaveReleaseDate=${formattedWaveReleaseDate},Route='${Route}')`;
                // Prepare payload with formatted date
                const oPayload = {
                    DispatchOrder: oBindingContext.DispatchOrder,
                    Door: oBindingContext.Door,
                    RouteDescription: oBindingContext.RouteDescription,
                    TruckSizeType: oBindingContext.TruckSizeType
                    //SCCID: SCCID, // Ensure SCCID is correctly passed
                    //WaveReleaseDate: formattedWaveReleaseDate, // Send as a string in YYYY-MM-DD format
                    //Route: Route
                };

                // Success handler
                const fnSuccess = function (oData, response) {
                    that.BusyDialog.close();
                    // Handle success (e.g., show message)
                }.bind(this);

                // Error handler
                const fnError = function (oError) {
                    that.BusyDialog.close();
                    // Handle error (e.g., show error message)
                };

                // Perform the update operation
                oDataModel.update(uri, oPayload, {
                    success: fnSuccess,
                    error: fnError
                });

            },
            onPressRow: function (oEvent) {
                let oRouteDetailsModel =
                    this.getOwnerComponent().getModel("routeDetailsModel");
                const that = this
                const oSelectedItem = oEvent.getSource(); // Get the selected item (row)
                const oContext = oSelectedItem.getBindingContext("oLocalModel"); // Get the binding context of the selected item
                this.oSelectedObject = oContext.getObject(); // Get the object bound to the selected item
                oRouteDetailsModel.setData(this.oSelectedObject);
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Details", {
                    ID:this.oSelectedObject.ID
                    //Route: this.oSelectedObject.Route,
                    //WaveReleaseDate: this.oSelectedObject.WaveReleaseDate,
                    //SCCID: this.oSelectedObject.SCCID
                });

            }

        });
    });
