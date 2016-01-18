//---------------------------------------------------------------------
// <copyright file="main.js">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>main.js is used to intiate the dialog for the print cards extension.</summary>
//---------------------------------------------------------------------


var openPrintCardsMenuProvider = (function () {
    "use strict";
    return {
        openPrintCardsInDialog: function (properties, title) {
            VSS.getService("ms.vss-web.dialog-service").then(function (dialogSvc) {
                var extInfo = VSS.getExtensionContext();

                var widthPercentage = 70;
                var heightPercentage = 60;

                var newWidth = parseInt((window.screen.width / 100 * widthPercentage).toString());
                var newHeight = parseInt((window.screen.height / 100 * heightPercentage).toString());

                var dialogOptions = {
                    title: title || "Print Cards",
                    width: newWidth,
                    height: newHeight,
                    buttons: null

                };
       
                var contributionConfig = { 
                    properties: properties
                };

                dialogSvc.openDialog(extInfo.publisherId + "." + extInfo.extensionId + "." + "indexPage", dialogOptions, contributionConfig);
            });
        },
        execute: function (actionContext) {
            this.openPrintCardsInDialog(actionContext);
        }
    };
}());

VSS.register("openPrintCards", function (context) {
    return openPrintCardsMenuProvider;
});