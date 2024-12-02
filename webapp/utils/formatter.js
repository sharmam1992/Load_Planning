sap.ui.define(["sap/m/MessageToast"], function (MessageToast) {
  "use strict";
  return {
    formatThumbnailUrl: function (mediaType) {
      var iconUrl;
      switch (mediaType) {
        case "image/png":
          iconUrl = "sap-icon://card";
          break;
        case "text/plain":
          iconUrl = "sap-icon://document-text";
          break;
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          iconUrl = "sap-icon://excel-attachment";
          break;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          iconUrl = "sap-icon://doc-attachment";
          break;
        case "application/pdf":
          iconUrl = "sap-icon://pdf-attachment";
          break;
        default:
          iconUrl = "sap-icon://attachment";
      }
      return iconUrl;
    },

    formatThumbnailUrl: function (mediaType) {
      var iconUrl;
      switch (mediaType) {
        case "image/png":
          iconUrl = "sap-icon://card";
          break;
        case "text/plain":
          iconUrl = "sap-icon://document-text";
          break;
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          iconUrl = "sap-icon://excel-attachment";
          break;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          iconUrl = "sap-icon://doc-attachment";
          break;
        case "application/pdf":
          iconUrl = "sap-icon://pdf-attachment";
          break;
        default:
          iconUrl = "sap-icon://attachment";
      }
      return iconUrl;
    },

    formatDate: function (sDate) {
      if (sDate) {
        return sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MM-dd-yyyy" }).format(new Date(sDate));
      }
    },

    formatDateBulkPO: function (sDate) {
      if (sDate) {
        return sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" }).format(new Date(sDate));
      }
    },

    formatPONumber: function(btpPO, s4PO){
      if (btpPO){
        return btpPO;
      } else {
        return s4PO;
      }
     
    },

    formatSupplierName: function(btpSupplier, s4Supplier){
      if (btpSupplier){
        return btpSupplier;
      } else {
        return s4Supplier;
      }
    },

    formatSccID: function(btpSccID, s4SccID){
      if (btpSccID){
        return btpSccID;
      } else {
        return s4SccID;
      }
    },


    formatFileSize: function (iSize) {
      if (iSize) {
        const sizeInKB = iSize / 1024;
        const iFileSize = sizeInKB > 1024 ? (sizeInKB / 1024).toFixed(1) : sizeInKB.toFixed(1);
        const sUnit = sizeInKB > 1024 ? " MB" : " KB";
        return iFileSize + sUnit;
      }
    },
    formatRBGIndex: function (iVal) {
      switch (iVal) {
        case "Frozen":
          return 0;
          break;
        case "Refrigerated":
          return 1;
          break;
        case "Dry":
          return 2;
          break;
        case "Bulk":
          return 3;
          break;
        case "Celsius":
          return 0;
          break;
        case "Fahrenheit":
          return 1;
          break;
        case "Yes":
          return 0;
          break;
        case "No":
          return 1;
          break;
        case "N/A":
          return 2;
          break;
        default:
          return -1;
      }
    },

    formatDate: function (sDate) {
      if (sDate) {
        return sap.ui.core.format.DateFormat.getDateInstance({
          pattern: "MM-dd-yyyy",
        }).format(new Date(sDate));
      }
    },

    formatFileSize: function (iSize) {
      if (iSize) {
        const sizeInKB = iSize / 1024;
        const iFileSize =
          sizeInKB > 1024 ? (sizeInKB / 1024).toFixed(1) : sizeInKB.toFixed(1);
        const sUnit = sizeInKB > 1024 ? " MB" : " KB";
        return iFileSize + sUnit;
      }
    },
    formatDateObjectToString: function (date) {
      // Get day, month, and year from the date object
      let day = date.getDate();
      let month = date.getMonth() + 1; // Months are zero-based in JavaScript
      let year = date.getFullYear();

      // Add leading zeros to day and month if necessary
      if (day < 10) {
        day = "0" + day;
      }
      if (month < 10) {
        month = "0" + month;
      }

      // Return the formatted date string
      return year + "" + month + "" + day;
    },
    parseDateString: function (dateString) {
      // Extract year, month, and day from the date string
      let year = parseInt(dateString.substring(0, 4), 10);
      let month = parseInt(dateString.substring(4, 6), 10) - 1; // Months are zero-based in JavaScript
      let day = parseInt(dateString.substring(6, 8), 10);

      // Create and return the Date object using UTC
      return new Date(Date.UTC(year, month, day));
    },

    parseDateUTC: function (dateString) {
      return new Date(Date.UTC(dateString.getFullYear(),dateString.getMonth(),dateString.getDate()));
  },

    getDateRangeForSupplier: function () {
      const currentDate = new Date();

      // Calculate the date 30 days in the future
      const futureDate = new Date(currentDate);
      futureDate.setDate(currentDate.getDate() + 30);

      // Calculate the date 30 days in the past
      const pastDate = new Date(currentDate);
      pastDate.setDate(currentDate.getDate() - 30);

      // Format dates as YYYY-MM-DD
      function formatDate(date) {
        // Extract year, month, and day from the date string
        let year = parseInt(date.toISOString().substring(0, 4), 10);
        let month = parseInt(date.toISOString().substring(5, 7), 10) - 1; // Months are zero-based in JavaScript
        let day = parseInt(date.toISOString().substring(8, 10), 10);

        return new Date(Date.UTC(year, month, day));
      }

      return {
        startDate: formatDate(pastDate),
        endDate: formatDate(futureDate),
      };
    },
  };
});
