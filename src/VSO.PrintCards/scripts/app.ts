//---------------------------------------------------------------------
// <copyright file="app.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>app.ts contains all the functional code for the print cards extension. This includes everything from fetching all working information to the layout of the cards and printing.</summary>
//---------------------------------------------------------------------

/// <reference path='ref/VSS.d.ts' />
/// <reference path="ref/jquery.d.ts" />
/// <reference path="ref/qrcode.d.ts" />

import VSS_Service = require("VSS/Service");
import TFS_Core_Contracts = require("TFS/Core/Contracts");
import WorkContracts = require("TFS/Work/Contracts");
import WorkItemTrackingContracts = require("TFS/WorkItemTracking/Contracts");
import WorkClient = require("TFS/Work/RestClient");
import TFS_Wit_WebApi = require("TFS/WorkItemTracking/RestClient");

module canvasCard {
    var lineHeight = 20;
    var titleLineHeight = 20;
    var padding = 2;

    function wrapText(context, text, x, y, maxWidth): number {
        var linePosition = y;
        var words = text.split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, linePosition);
                line = words[n] + ' ';
                linePosition += titleLineHeight;
            }
            else {
                line = testLine;
            }
        }
        context.fillText(line, x, linePosition);
        return linePosition;
    }

    function trim(source: string): string {
        var limit = 100;
        if (source.length < limit) {
            return source;
        }

        return source.substring(0, limit) + "...";
    }

    function drawLine(context, startX, startY, endX, endY) {
        context.beginPath();
      		context.moveTo(startX, startY);
      		context.lineTo(endX, endY);
      		context.stroke();
    }

    function trimText(text: string, horizontalSpace: number, context: CanvasRenderingContext2D): string {
        var addElipse = false;
        var modifiedText = text;
        var metrics = context.measureText(text);
        while (metrics.width > horizontalSpace) {
            modifiedText = modifiedText.substring(0, modifiedText.length - 1).trim();
            metrics = context.measureText(modifiedText + "...");

            if (!addElipse) {
                horizontalSpace -= context.measureText("...").width;
                addElipse = true;
            }
        }

        if (addElipse) {
            modifiedText += "...";
        }

        return modifiedText;
    }

    interface drawCardsResult {
        cards: Array<HTMLDivElement>,
        maxHeight: number
    }

    export function drawCards(testData: Array<any>, initialMaxHeight: number, largestId: number, renderExtras: boolean): drawCardsResult {
        var minCardHeight = 150;
        var initialCardWidth = 300;
        ///* this is just to deal with inconsistent printer margins that each browser uses */
        if (navigator.userAgent.indexOf("Firefox/") > -1) { initialCardWidth = 325; }
        //if (navigator.userAgent.indexOf("Trident/") > -1) { cardWidth = 300; }
        //if (navigator.userAgent.indexOf("Chrome/") > -1) { cardWidth = 325; }
        //if (navigator.userAgent.indexOf("Edge/") > -1) { cardWidth = 300; } /* edge must be last since it also tries to trick us into thinking it is chrome */

        var cards = new Array<HTMLDivElement>();
        var maxHeight = initialMaxHeight;
        testData.forEach(item => {
            var cardWidth = initialCardWidth;
            var cardSpace = cardWidth;
            var cardIndent = 30;
            var adjustedWidthForQRCode = false;
            var cardElement = <HTMLDivElement>document.createElement("div");
            cardElement.classList.add("card");
            var canvas = document.createElement("canvas");
            canvas.width = cardSpace;
            canvas.height = initialMaxHeight;
            var context = canvas.getContext("2d");
            context.font = "bold 14px Segoe UI";
            var offset = context.measureText(largestId.toString()).width + 5;
            context.fillText(item.id, cardIndent + padding, 20 + padding);
            var title = trim(item.title);
            var nexty = wrapText(context, title, cardIndent + padding + offset, 20 + padding, cardSpace - (cardIndent + (padding * 2) + offset));

            context.font = "14px Segoe UI";
            nexty += lineHeight + 15;
            var assignedToStart = cardIndent + padding;
            var assignedTo = trimText(item.assignedTo, cardSpace - assignedToStart, context);
            context.fillText(assignedTo, cardIndent + padding, nexty);

            var qrCodeSize = 80;
            var qrCodeLeft = cardSpace - qrCodeSize - 5;
            var qrCodeTop = maxHeight - qrCodeSize - 5;
            qrCodeCanvas.generate(item.cardUrl, qrCodeTop, qrCodeLeft, qrCodeSize - 5, canvas);

            context.font = "12px Segoe UI Light";
            var keyWidth = 0;
            item.fields.forEach(element => {
                var metrics = context.measureText(element.title);
                if (metrics.width > keyWidth) {
                    keyWidth = metrics.width;
                }
            });

            keyWidth += 10;

            item.fields.forEach(element => {
                nexty += lineHeight;
                if (!adjustedWidthForQRCode && nexty >= qrCodeTop) {
                    cardSpace -= qrCodeSize - 5;
                    adjustedWidthForQRCode = true;
                }

                context.font = "12px Segoe UI Light";
                context.fillText(element.title, cardIndent + padding, nexty);

                context.font = "12px Segoe UI";
                var valueStart = cardIndent + padding + keyWidth;
                var valueSpace = cardSpace - valueStart - 4;
                var fieldValue = trimText(element.value, valueSpace, context);              
                context.fillText(fieldValue, valueStart, nexty);
            });

            nexty += lineHeight;
            var nextx = cardIndent + padding;
            var tagHorizontalSpace = 4;
            item.tags.forEach(element => {
                var metrics = context.measureText(element);
                if (!adjustedWidthForQRCode && nexty >= qrCodeTop - 4) {
                    cardSpace -= qrCodeSize - 5;
                    adjustedWidthForQRCode = true;
                }

                var tagPositionEnd = metrics.width + nextx + 5;
                if (tagPositionEnd > cardSpace) {
                    nexty += lineHeight + 4;
                    nextx = cardIndent + padding;
                }

                context.beginPath();
                context.rect(nextx, nexty - 14, metrics.width + (tagHorizontalSpace * 2), lineHeight - 2);
                context.fillStyle = '#bfbfbf';
                context.fill();

                context.fillStyle = '#000000';
                context.fillText(element, nextx + 3, nexty);
                nextx += metrics.width + (tagHorizontalSpace * 2) + 4;
            });

            if (nexty > maxHeight) {
                maxHeight = nexty;
            }

            cardElement.appendChild(canvas);

            if (renderExtras) {
                drawLine(context, 0, 0, 0, maxHeight);
                drawLine(context, 0, 0, cardWidth, 0);
                drawLine(context, cardWidth, maxHeight, cardWidth, 0);
                drawLine(context, cardWidth, maxHeight, 0, maxHeight);
                drawLine(context, cardIndent - 5, 0, cardIndent - 5, maxHeight);
                context.save();
                context.font = "12px Segoe UI";
                context.translate(0, maxHeight);
                context.rotate(-0.5 * Math.PI);
                var metrics = context.measureText(item.type);
                context.fillText(item.type, (maxHeight / 2 - metrics.width / 2), 17);
                context.restore();
            }

            cards.push(cardElement);
        });

        if (maxHeight < minCardHeight) {
            maxHeight = minCardHeight;
        }

        return {
            cards: cards,
            maxHeight: maxHeight + 10
        };
    }
}

module AlmRangers.VsoExtensions {
    interface cardInfo {
        id: string;
        title: string;
        assignedTo: string;
        type: string;
        fields: Array<any>;
        tags: Array<string>;
        cardUrl: string;
    }

    export class HelperFunctions {
        public static showWarning(message: string): void {
            alert(`[WARNING] ${message}`);
        }

        public static showError(message: string): void {
            alert(`[ERROR] ${message}`);
        }
    }

    export class AppTeamContext implements TFS_Core_Contracts.TeamContext {
        /**
        * The team project Id or name.  Ignored if ProjectId is set.
        */
        public project: string;
        /**
        * The Team Project ID.  Required if Project is not set.
        */
        public projectId: string;
        /**
        * The Team Id or name.  Ignored if TeamId is set.
        */
        public team: string;
        /**
        * The Team Id
        */
        public teamId: string;
    }

    export class AppWiql implements WorkItemTrackingContracts.Wiql {
        query: string;
    }

    export class PrintCards {
        printContainer: HTMLDivElement;
        messageContainer: HTMLDivElement;
        cardsContainer: HTMLDivElement;
        witClient: TFS_Wit_WebApi.WorkItemTrackingHttpClient;

        constructor(cardsContainer: HTMLDivElement, messageContainer: HTMLDivElement, printContainer: HTMLDivElement) {
            this.updateMessageContainer("Loading...");
            this.cardsContainer = cardsContainer;
            this.messageContainer = messageContainer;
            this.printContainer = printContainer;
            this.hidePrintBar();
            this.witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
        }

        public loadBoard(boardId: string): void {
            this.getBoardWorkItems(boardId);
        }

        private getFieldName(fieldRef: string, fields: Array<WorkItemTrackingContracts.WorkItemField>): string {
            for (var position in fields) {
                if (fields[position].referenceName === fieldRef) {
                    return fields[position].name;
                }
            }

            return fieldRef;
        }

        private getWorkItemField(workItem: WorkItemTrackingContracts.WorkItem, field: string): string {
            for (var propertyName in workItem.fields) {
                if (propertyName === field) {
                    return workItem.fields[propertyName];
                }
            }

            return "";
        }

        private isEmpty(str: string): boolean {
            return (!str || 0 === str.length);
        }

        private getBoardWorkItems(boardId: string) {
            var that = this;
            that.updateMessageContainer("Loading work items...");

            if (boardId == null || boardId === undefined || boardId.length === 0) {
                HelperFunctions.showWarning("parameter 'boardId' is missing!");
                return;
            }

            var client = VSS_Service.getClient(WorkClient.WorkHttpClient);
            var webContext = VSS.getWebContext();
            var teamContext = new AppTeamContext();
            teamContext.project = webContext.project.name;
            teamContext.team = webContext.team.name;
            teamContext.projectId = webContext.project.id;
            teamContext.teamId = webContext.team.id;
            that.updateMessageContainer("Loading board card settings...");
            client.getBoardCardSettings(teamContext, boardId).then((boardSettings) => {
                that.updateMessageContainer("Loading team settings...");
                client.getTeamSettings(teamContext).then((teamSettings) => {
                    that.updateMessageContainer("Loading backlog iteration details...");
                    client.getTeamIteration(teamContext, teamSettings.backlogIteration.id).then((backlogIterationDetails) => {
                        that.updateMessageContainer("Loading team field values...");
                        client.getTeamFieldValues(teamContext).then((teamFieldValues) => {
                            that.getWorkItemIDs(teamContext, boardSettings, backlogIterationDetails, teamFieldValues,
                                (workItemIDs: Array<number>) => {
                                    if (workItemIDs.length === 0) {
                                        alert("No work items found!");
                                        return;
                                    }

                                    that.updateMessageContainer("Loading work item data...");
                                    that.witClient.getFields().then((systemFields) => {
                                        var boardSettingFields = that.getCardFields("*", boardSettings);

                                        that.witClient.getWorkItems(workItemIDs, boardSettingFields).then((workItems) => {

                                            that.updateMessageContainer("");

                                            var cardData: Array<cardInfo> = [];
                                            var largestId = 0;
                                            for (var position in workItems) {
                                                var workItem = workItems[position];

                                                var tags = [];
                                                this.getWorkItemField(workItem, "System.Tags").split(";").forEach(tag => {
                                                    if (!that.isEmpty(tag)) {
                                                        tags.push(tag);
                                                    }
                                                });

                                                var fields = [];
                                                var workItemType = this.getWorkItemField(workItem, "System.WorkItemType");
                                                var extraFields = this.getCardFields(workItemType, boardSettings);
                                                for (var position in extraFields) {
                                                    var fieldRef = extraFields[position];
                                                    if (!this.isCoreField(fieldRef)) {
                                                        fields.push({
                                                            title: this.getFieldName(fieldRef, systemFields),
                                                            value: this.getWorkItemField(workItem, fieldRef)
                                                        });
                                                    }
                                                }

                                                var assigned = this.getWorkItemField(workItem, "System.AssignedTo");
                                                var id = this.getWorkItemField(workItem, "System.Id");
                                                var url = workItem.url.substring(0, workItem.url.indexOf("_apis")) + teamContext.project + "/_workitems/edit/" + id;

                                                cardData.push({
                                                    assignedTo: assigned.substring(0, assigned.indexOf("<")),
                                                    id: id,
                                                    title: this.getWorkItemField(workItem, "System.Title"),
                                                    type: workItemType,
                                                    fields: fields,
                                                    tags: tags,
                                                    cardUrl: url
                                                });

                                                if (+id > largestId) {
                                                    largestId = +id;
                                                }
                                            }

                                            var firstPassResult = canvasCard.drawCards(cardData, 0, largestId, false);                                            
                                            var secondPassResult = canvasCard.drawCards(cardData, firstPassResult.maxHeight, largestId, true);

                                            secondPassResult.cards.forEach(card => {
                                                this.cardsContainer.appendChild(card);
                                            });

                                            that.showPrintBar();
                                        });
                                    });
                                });
                        });
                    });
                });
            });
        }

        private isCoreField(fieldRef: string): boolean {
            return this.getCoreFields().indexOf(fieldRef) > -1;
        }

        private getCoreFields(): Array<string> {
            return ["System.Id", "System.Title", "System.AssignedTo", "System.Tags", "System.WorkItemType", "Microsoft.VSTS.Scheduling.Effort", "System.Description"];
        }

        private getCardFields(workItemType: string, boardSettings: any): Array<string> {
            var result = this.getCoreFields();
            for (var propertyName in boardSettings.cards) {
                if (workItemType === "*" || workItemType === propertyName) {
                    for (var position in boardSettings.cards[propertyName]) {
                        for (var fieldName in boardSettings.cards[propertyName][position]) {
                            if (fieldName === "fieldIdentifier") {
                                if (result.indexOf(boardSettings.cards[propertyName][position][fieldName]) === -1) {
                                    result.push(boardSettings.cards[propertyName][position].fieldIdentifier);
                                }
                            }
                        }
                    }
                }
            }
            return result;
        }

        private showEmptyFieldsFor(workItemType: string, boardSettings: any): boolean {
            for (var propertyName in boardSettings.cards) {
                if (workItemType === propertyName) {
                    for (var position in boardSettings.cards[propertyName]) {
                        for (var fieldName in boardSettings.cards[propertyName][position]) {
                            if (fieldName === "showEmptyFields") {
                                if (boardSettings.cards[propertyName][position][fieldName] === "true") {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }

            return false;
        }

        private getWorkItemIDs(teamContext: AppTeamContext,
            boardSettings: any,
            backlogIterationDetails: WorkContracts.TeamSettingsIteration,
            teamFieldValues: WorkContracts.TeamFieldValues,
            done: (workItemTypes: Array<number>) => void): void {
            var that = this;
            that.updateMessageContainer("Querying work items...");
            var query = "SELECT Id FROM WorkItems WHERE";

            //work item types
            var workItemTypes = that.getBoardWorkItemTypes(boardSettings);
            var workItemTypesAsString = "\"" + that.replaceAll(",", "\",\"", workItemTypes.join(",")) + "\"";
            query = query + " [Work Item Type] In (" + workItemTypesAsString + ")";

            //backlog iteration
            query = query + " AND [Iteration Path] UNDER \"" + backlogIterationDetails.path + "\"";

            //areas
            var teamFieldQuery = "";
            for (var position in teamFieldValues.values) {
                if (position > 0) {
                    teamFieldQuery = teamFieldQuery + " OR";
                }
                teamFieldQuery = teamFieldQuery + " [" + teamFieldValues.field.referenceName + "]";
                if (teamFieldValues.values[position].includeChildren) {
                    teamFieldQuery = teamFieldQuery + " UNDER";
                } else {
                    teamFieldQuery = teamFieldQuery + " =";
                }
                teamFieldQuery = teamFieldQuery + " \"" + teamFieldValues.values[position].value + "\"";
            }
            if (teamFieldQuery.length > 0) {
                query = query + " AND (" + teamFieldQuery + " )";
            }

            //ignore done work
            query = query + " AND [State] <> \"Done\"";

            var wiql = new AppWiql();
            wiql.query = query;
            that.witClient.queryByWiql(wiql, teamContext.project).then((workItemQueryResult: WorkItemTrackingContracts.WorkItemQueryResult) => {
                var result = new Array<number>();
                for (var position in workItemQueryResult.workItems) {
                    result.push(workItemQueryResult.workItems[position].id);
                }
                done(result);
            });
        }

        private getBoardWorkItemTypes(boardSettings: any): Array<string> {
            var result = new Array<string>();
            for (var propertyName in boardSettings.cards) {
                result.push(propertyName);
            }
            return result;
        }

        private updateMessageContainer(msg: string) {
            $(this.messageContainer).html(msg);
            if (msg.length > 0) {
                $(this.messageContainer).show();
            } else {
                $(this.messageContainer).hide();
            }
        }

        private replaceAll(find: string, replace: string, str: string) {
            return str.replace(new RegExp(this.escapeRegExp(find), "g"), replace);
        }

        private escapeRegExp(string: string) {
            return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }

        private showPrintBar(): void {
            $(this.printContainer).show();
        }

        private hidePrintBar(): void {
            $(this.printContainer).hide();
        }

        public appPrint(that: AlmRangers.VsoExtensions.PrintCards): void {
            window.focus();
            if (navigator.userAgent.indexOf("Trident/") > -1) {
                /* this disables the shrink to fit thing in IE 11 */
                document.execCommand('print', false, null);
            } else {
                window.print();
            }
        }
    }
}

var boardId = VSS.getConfiguration().properties["id"];
var cardsContainer = <HTMLDivElement>document.getElementById("cards-container");
var messageContainer = <HTMLDivElement>document.getElementById("message-container");
var printContainer = <HTMLDivElement>document.getElementById("print-container");
var printButton = <HTMLButtonElement>document.getElementById("print-button");
var printCards = new AlmRangers.VsoExtensions.PrintCards(cardsContainer, messageContainer, printContainer);
printCards.loadBoard(boardId);
printButton.onclick = function () {
    printCards.appPrint(printCards);
};