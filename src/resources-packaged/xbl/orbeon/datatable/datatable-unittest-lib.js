/**
 * Copyright (C) 2009 Orbeon, Inc.
 *
 * This program is free software; you can redistribute it and/or modify it under the terms of the
 * GNU Lesser General Public License as published by the Free Software Foundation; either version
 * 2.1 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * The full text of the license is available at http://www.gnu.org/copyleft/lesser.html
 */

ORBEON.widgets.datatable.unittests_lib = {


    accordionAccessMethod: "api",

    isOpenAccordionCase: function(targetId) {
        var dd = YAHOO.util.Dom.get('my-accordion$d-' + targetId);
        return YAHOO.util.Dom.hasClass(dd, 'a-m-d-expand');
    },

    toggleAccordionCase: function (targetId) {
        var dt = YAHOO.util.Dom.get('my-accordion$t-' + targetId);
        YAHOO.util.UserAction.click(dt, {clientX: 1});
    },

    openAccordionCase: function (testCase, targetId, callback) {
        if (this.accordionAccessMethod == 'css') {

            var dt = YAHOO.util.Dom.get('my-accordion$t-' + targetId);
            var dd = YAHOO.util.Dom.get('my-accordion$d-' + targetId);
            YAHOO.util.Dom.addClass(dt, 'a-m-d-expand');
            YAHOO.util.Dom.addClass(dd, 'a-m-d-expand');

        } else if (this.accordionAccessMethod == 'api') {

            var dl = YAHOO.util.Dom.get('my-accordion$dl');
            var dt = YAHOO.util.Dom.get('my-accordion$t-' + targetId);
            var dd = YAHOO.util.Dom.get('my-accordion$d-' + targetId);
            AccordionMenu.expandCase(dl, dt, dd);

        } else /* click */ {

            if (!this.isOpenAccordionCase(targetId)) {
                this.toggleAccordionCase(targetId);
            }
        }

        this.wait(function () {
            // Check if the action has been done and call back
            if (this.isOpenAccordionCase(targetId)) {
                if (callback) {
                    callback.call();
                }
            } else {
                var thiss = this;
                testCase.wait(function() {
                    thiss.openAccordionCase(testCase, targetId, callback);
                }, 10);
            }
        }, 100);
    },

    closeAccordionCase: function (testCase, targetId, callback) {
        if (this.accordionAccessMethod == 'css') {

            var dt = YAHOO.util.Dom.get('my-accordion$t-' + targetId);
            var dd = YAHOO.util.Dom.get('my-accordion$d-' + targetId);
            YAHOO.util.Dom.removeClass(dt, 'a-m-d-expand');
            YAHOO.util.Dom.removeClass(dd, 'a-m-d-expand');

        } else if (this.accordionAccessMethod == 'api') {

            var dl = YAHOO.util.Dom.get('my-accordion$dl');
            var dt = YAHOO.util.Dom.get('my-accordion$t-' + targetId);
            var dd = YAHOO.util.Dom.get('my-accordion$d-' + targetId);
            AccordionMenu.collapseCase(dl, dt, dd);

        } else /* click */ {
            if (this.isOpenAccordionCase(targetId)) {
                this.toggleAccordionCase(targetId);
            }
        }

        // Check if the action has been done and call back
        this.wait(function () {
            if (!this.isOpenAccordionCase(targetId)) {
                if (callback) {
                    callback.call();
                }
            } else {
                var thiss = this;
                testCase.wait(function() {
                    thiss.closeAccordionCase(testCase, targetId, callback);
                }, 10);
            }
        }, 50);
    },

    checkCellWidth: function(cell) {
        var resizerliner = ORBEON.widgets.datatable.utils.getFirstChildByTagAndClassName(cell, 'div', 'yui-dt-resizerliner');
        var liner;
        if (resizerliner == null) {
            var liner = ORBEON.widgets.datatable.utils.getFirstChildByTagAndClassName(cell, 'div', 'yui-dt-liner');
        } else {
            var liner = ORBEON.widgets.datatable.utils.getFirstChildByTagAndClassName(resizerliner, 'div', 'yui-dt-liner');
        }
        var cssWidth = YAHOO.util.Dom.getStyle(liner, 'width');
        var actualWidth = (liner.clientWidth - 20) + "px";
        YAHOO.util.Assert.areEqual(cssWidth, actualWidth, 'CSS (' + cssWidth + ') and actual (' + liner.clientWidth + 'px) width should differ by exactly 20 px.');
    },

    checkRowWidth: function(row) {
        for (var icol = 0; icol < row.cells.length; icol++) {
            var cell = row.cells[icol];
            if (!YAHOO.util.Dom.hasClass(cell, 'xforms-repeat-begin-end')
                    && !YAHOO.util.Dom.hasClass(cell, 'xforms-repeat-delimiter')
                    && !YAHOO.util.Dom.hasClass(cell, 'xforms-repeat-template')) {
                this.checkCellWidth(cell);
            }
        }
    },

    checkTableAndContainerWidths: function(table) {
        var tableWidth = YAHOO.util.Dom.getStyle(table, 'width');
        var tableWidthValue = parseInt(tableWidth.substr(0, tableWidth.length - 2)) ;
        var headerContainerWidth = YAHOO.util.Dom.getStyle(table.parentNode, 'width');
        var mainContainerWidth = YAHOO.util.Dom.getStyle(table.parentNode.parentNode, 'width');
        if (headerContainerWidth == 'auto') {
            headerContainerWidth = tableWidth;
        }
        var mainContainerWidthValue = parseInt(mainContainerWidth.substr(0, mainContainerWidth.length - 2)) ;

        YAHOO.util.Assert.areEqual(tableWidthValue + 2, mainContainerWidthValue, 'Table (' + tableWidth + ') and main container (' + mainContainerWidth + ') widths should differ by 2 pixels.');
        YAHOO.util.Assert.areEqual(headerContainerWidth, tableWidth, 'Header (' + headerContainerWidth + ') and table (' + tableWidth + ') widths should be equal.');
    },

    resizeColumn: function(th, offset, step) {
        var resizerliner = ORBEON.widgets.datatable.utils.getFirstChildByTagAndClassName(th, 'div', 'yui-dt-resizerliner');
        var resizer = ORBEON.widgets.datatable.utils.getFirstChildByTagAndClassName(resizerliner, 'div', 'yui-dt-resizer');
        var region = YAHOO.util.Region.getRegion(resizer);
        YAHOO.util.UserAction.mousedown(resizer, {clientX: region.right, clientY: region.top});
        var x;
        if (step == undefined) {
            step = offset;
        } else if (step * offset < 0) {
            step = -step;
        }
        for (x = region.right; (offset < 0 && x >= region.right + offset) || (offset > 0 && x <= region.right + offset); x = x + step) {
            YAHOO.util.UserAction.mousemove(resizer, {clientX: x, clientY: region.top});
        }
        YAHOO.util.UserAction.mouseup(resizer, {clientX: x, clientY: region.top});
        return x - region.right;
    },

    checkHorizontalScrollbar: function (elt) {
        YAHOO.util.Assert.isTrue(elt.clientHeight + 15 < elt.offsetHeight, 'Element has no horizontal scroll bar (clientHeight: ' + elt.clientHeight + ', offsetHeight: ' + elt.offsetHeight + ')');
    },

    checkEmbeddedWidthAndHeight: function (elt, parentWidth, parentHeight) {
        var region = YAHOO.util.Region.getRegion(elt);
        var width;
        var height;
        if (region != null && region.right != null && region.left != null) {
            width = region.right - region.left;
            height = region.bottom - region.top;
        } else {
            width = parentWidth;
            height = parentHeight;
        }

        if (parentWidth != undefined) {
            YAHOO.util.Assert.isTrue(parentWidth >= width, 'Node ' + elt.nodeName + '.' + elt.className + ', width (' + width + ") is larger than its parent's " + elt.parentNode.nodeName + '.' + elt.parentNode.className + " width (" + parentWidth + ')');
        }
        if (parentHeight != undefined) {
            YAHOO.util.Assert.isTrue(parentHeight >= height, 'Node ' + elt.nodeName + '.' + elt.className + ', height (' + height + ") is larger than its parent's " + elt.parentNode.nodeName + '.' + elt.parentNode.className + " height (" + parentHeight + ')');
        }
        var children = elt.childNodes;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.nodeType == 1) {
                this.checkEmbeddedWidthAndHeight(child, width, height);
            }
        }
    },

    getNumberVisibleCells: function (cells) {
        var result = 0;
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            if (!YAHOO.util.Dom.hasClass(cell, 'xforms-repeat-begin-end')
                    && !YAHOO.util.Dom.hasClass(cell, 'xforms-repeat-delimiter')
                    && !YAHOO.util.Dom.hasClass(cell, 'xforms-repeat-template')) {
                result = result + 1;
            }
        }
        return result;
    },

    getBodyTable: function(table, isSplit) {
        if (isSplit) {
            var container = table.parentNode.parentNode;
            return container.getElementsByTagName('table')[1];
        } else {
            return table;
        }

    },

    checkTableStructure: function(table, nbcols, isSplit) {
        YAHOO.util.Assert.isObject(table.tHead, 'The table header is missing');
        YAHOO.util.Assert.areEqual(1, table.tHead.rows.length, 'There should be exactly one header row (not ' + table.tHead.rows.length + ')');
        var nbcolsActual = this.getNumberVisibleCells(table.tHead.rows[0].cells);
        YAHOO.util.Assert.areEqual(nbcols, nbcolsActual, nbcolsActual + ' header columns found instead of ' + nbcols);
        var bodyTable = this.getBodyTable(table, isSplit);
        YAHOO.util.Assert.areEqual(1, bodyTable.tBodies.length, 'There should be exactly one body (not ' + bodyTable.tBodies.length + ')');
        nbcolsActual = this.getNumberVisibleCells(bodyTable.tBodies[0].rows[2].cells);
        YAHOO.util.Assert.areEqual(nbcols, nbcolsActual, nbcolsActual + ' columns found on the first body row instead of ' + nbcols);
    },

    checkNumberRows: function(table, nbRows, isSplit) {
        var bodyTable = this.getBodyTable(table, isSplit);
        var rows = bodyTable.tBodies[0].rows;
        var nbRowsActual = 0;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (this.isSignificant(row)) {
                nbRowsActual += 1;
            }
        }
        YAHOO.util.Assert.areEqual(nbRows, nbRowsActual, nbRowsActual + ' rows found on the instead of ' + nbRows);
    },

    checkColumnValues: function(table, colId, isSplit, values) {
        var bodyTable = this.getBodyTable(table, isSplit);
        var rows = bodyTable.tBodies[0].rows;
        var iActual = 0;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (this.isSignificant(row)) {
                var cell = this.getSignificantElementByIndex(row.cells, colId);
                var value;
                if (cell.innerText != undefined) {
                    value = cell.innerText;
                } else {
                    value = cell.textContent;
                }
                value = value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                YAHOO.util.Assert.areEqual(values[iActual], value, value + ' found in row ' + iActual + ' instead of ' + values[iActual]);
                iActual += 1;
            }
        }
        YAHOO.util.Assert.areEqual(values.length, iActual, iActual + ' rows found on the instead of ' + values.length);
    },


    checkColDebugValue: function(div, attribute, value) {
        var ul = div.getElementsByTagName('ul')[0];
        var lis = ul.getElementsByTagName('li');
        for (var i = 0; i < lis.length; i++) {
            var li = lis[i];
            var label = li.getElementsByTagName('label')[0];
            if (label != undefined) {
                var labelValue = label.innerHTML.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                if (labelValue == attribute + ':') {
                    var span = li.getElementsByTagName('span')[0];
                    YAHOO.util.Assert.areEqual(value, span.innerHTML, 'Attribute ' + attribute + ' has value ' + span.innerHTML + ' instead of ' + value);
                    return;
                }
            }
        }
        if (value != undefined) {
            YAHOO.util.Assert.fail('Attribute ' + attribute + ' not found');
        }
    },

    checkColTypeValue: function(div, type) {
        var p = div.getElementsByTagName('p')[0];
        var span = p.getElementsByTagName('span')[0];
        YAHOO.util.Assert.areEqual(type, span.innerHTML, 'Type ' + span.innerHTML + ' instead of ' + type);
    },

    isSignificant: function(element) {
        return !YAHOO.util.Dom.hasClass(element, 'xforms-repeat-begin-end')
                && !YAHOO.util.Dom.hasClass(element, 'xforms-repeat-delimiter')
                && !YAHOO.util.Dom.hasClass(element, 'xforms-repeat-template');
    },

    checkCellClassesInARow: function(row, classPrefix) {
        var iActual = 0;
        for (var i = 0; i < row.cells.length; i++)
        {
            var cell = row.cells[i];
            if (this.isSignificant(cell)) {
                iActual += 1;
                var liner = ORBEON.widgets.datatable.utils.getFirstChildByTagAndClassName(cell, 'div', 'yui-dt-liner');
                var className = classPrefix + iActual;
                YAHOO.util.Assert.isTrue(YAHOO.util.Dom.hasClass(liner, className), 'Cell column ' + iActual + ' should have a class ' + className + '. Its current class attribute is: ' + liner.className);
            }
        }
    },

    checkCellClasses: function(table, isSplit) {
        if (YAHOO.env.ua.ie != 0) {
            return;
        }
        var classPrefix = 'dt-' + table.id.replace('\$', '-', 'g') + '-col-';
        this.checkCellClassesInARow(table.tHead.rows[0], classPrefix);
        var bodyTable = this.getBodyTable(table, isSplit);
        var rows = bodyTable.tBodies[0].rows;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (this.isSignificant(row)) {
                this.checkCellClassesInARow(row, classPrefix);
            }
        }
    },

    checkCellStyles: function(table, isSplit) {
        if (YAHOO.env.ua.ie == 0) {
            return;
        }
        var colWidths = [];
        var headerCells = table.tHead.rows[0].cells;
        for (var i = 0; i < headerCells.length; i++) {
            var cell = headerCells[i];
            if (this.isSignificant(cell)) {
                var liner = ORBEON.widgets.datatable.utils.getFirstChildByTagAndClassName(cell, 'div', 'yui-dt-liner');
                colWidths.push(liner.style.width);
                YAHOO.util.Assert.areNotEqual('', liner.style.width, 'Header cell for column ' + colWidths.length + ' should have a style width property in IE');
                YAHOO.util.Assert.areNotEqual('auto', liner.style.width, 'Header cell for column ' + colWidths.length + ' should have a style width property in IE');
            }
        }
        var bodyTable = this.getBodyTable(table, isSplit);
        var rows = bodyTable.tBodies[0].rows;
        var iActual = 0;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (this.isSignificant(row)) {
                iActual += 1;
                var jActual = 0;
                for (var j = 0; j < row.cells.length; j++) {
                    var cell = row.cells[j];
                    if (this.isSignificant(cell)) {
                        var liner = ORBEON.widgets.datatable.utils.getFirstChildByTagAndClassName(cell, 'div', 'yui-dt-liner');
                        YAHOO.util.Assert.areEqual(colWidths[jActual], liner.style.width, 'Body cell for row ' + iActual + ' and column ' + (jActual + 1) + ' should have a style width property equal to ' + colWidths[jActual]);
                        jActual += 1;
                    }
                }
            }
        }
    },

    checkIsSplit: function(table, isSplit) {
        YAHOO.util.Assert.areEqual(isSplit, table.tBodies.length == 0, "Header table's body doesn't match split status");
        var bodyTable = this.getBodyTable(table, isSplit);
        YAHOO.util.Assert.areEqual(isSplit, bodyTable.tHead == undefined, "Body table's header  doesn't match split status");
    },

    getSignificantElementByIndex: function(elements, index) {
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (this.isSignificant(element)) {
                if (index == 1) {
                    return element;
                }
                index -= 1;
            }
        }
        return null;
    },

    clickAndCheckSortOrder: function(table, columnIndex, expectedOrder, callback) {
        //TODO: support scrollable tables
        var className;
        if (expectedOrder == 'ascending') {
            className = 'yui-dt-asc';
        } else if (expectedOrder = 'descending') {
            className = 'yui-dt-desc';
        }
        var headerCell = this.getSignificantElementByIndex(table.tHead.rows[0].cells, columnIndex);
        var liner = ORBEON.widgets.datatable.utils.getFirstChildByTagAndClassName(headerCell, 'div', 'yui-dt-liner');
        YAHOO.util.UserAction.click(liner, {clientX: 1});
        this.wait(function() {
            YAHOO.util.Assert.isTrue(YAHOO.util.Dom.hasClass(headerCell, className), 'Column ' + columnIndex + ' header cell should now have a class ' + className);
            var firstRow = this.getSignificantElementByIndex(table.tBodies[0].rows, 1);
            var bodyCell = this.getSignificantElementByIndex(firstRow.cells, columnIndex);
            YAHOO.util.Assert.isTrue(YAHOO.util.Dom.hasClass(bodyCell, className), 'Column ' + columnIndex + ' body cellls should now have a class ' + className);
            //TODO: test that the table is actually sorted
            callback();
        }, 1000);
    },

    EOS: null
}
