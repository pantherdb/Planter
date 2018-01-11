//Split into multiple files
$(document).ready(function () {
       var tav =  new TreeViewer();
       window.treeViewer = tav;
       tav.displayLegend();
       tav.startProgressBar();
       tav.loadInfoFromServer();
       //tav.loadInfoFromServerPretend();
       
       // Prevent context menu from popping up
    $('#treeviewer').on("contextmenu", function (event) {
        event.stopImmediatePropagation();
        return false; // <-- here you avoid the default context menu
    });

});


function mouseDown(event) {

    var nodeId = event.currentTarget.id;
    var treeInfo = window.treeViewer.treeInfo;
    var which = event.which;
    if (1 === which) {
        // Left click
        console.log("left click");
        treeInfo.collapseExpand(nodeId);              
    }
    else if (3 === which) {
        // Right click
        event.preventDefault();
        console.log("right click");
        treeInfo.reroot(nodeId);
    }
    //window.treeViewer.displayTreeNoResize();
    window.treeViewer.handleSyncWithGridRowSize();
    var a = "Node clicked";
};

function TreeInitStatus() {
    this.sentRequest =  false;
    this.receivedResponse =  false;
    this.success =  false;
    this.response;
    this.responseInJSON;



    var x2js = new X2JS();

    TreeInitStatus.prototype.setResponseString = function (response) {
            this.response = response;
            if ("" === this.response) {
                this.responseInJSON = {};
                return;
            }
            var jsonObj = x2js.xml_str2json(response);
            //alert(jsonObj);
            if (null !== jsonObj) {
                this.responseInJSON = jsonObj;
            }
    };
};
    
function TreeInitData() {
        this.treeData = new TreeInitStatus();
        this.msa = new TreeInitStatus();
        this.familyName = new TreeInitStatus();
};

function TreeViewer() {
    this.initData;
    
    this.stopExecution = false;
    this.bookId;
    this.msaInfo;
    this.treeInfo;
    
    this.gridCols = ['tree', 'gene_id', 'gene_name', 'organism', 'definition', 'subfamily_name'];
    this.gridLabels = ['Tree', 'Gene Id', 'Gene Name', 'Organism', 'Definition', 'Subfamily Name'];
    this.msaCol = 'msa';
    
    this.calculatedRowHeights = false;
    this.rowStartHeight = [];       // list of RowTopHeight objects with top and height
    this.redoRowHeights = true;
    
    this.columnModel;
    this.vScrollposition;            // Keep track of vertical scroll position
    this.hScrollPosition;
    this.selectedRow;
    this.selectedColPos;            // pixel position
       

    

   TreeViewer.prototype.displayLegend = function() {
       var tmpTree = new Tree();
       var subfamilyInternalNode = '<svg width="15" height="15">' +  tmpTree.getGraphicSubfamilyInternalNode(5, 3, 12) + '</svg>';
       var subfamilyCollapsedRerooted = '<svg width="15" height="15">' +  tmpTree.getGraphicCollapsedRerootedSubfamily(5, 3, 12) + '</svg>';
       var expandedDuplication = '<svg width="15" height="15">' +  tmpTree.getGraphicExpandedDuplication(10, 3, 12) + '</svg>';
       var expandedHorizontalTransfer = '<svg width="15" height="15">' +  tmpTree.getGraphicExpandedHozuzontalTransfer(10, 3, 12) + '</svg>';
       var expandedNonDupHorizontalTransfer = '<svg width="15" height="15">' +  tmpTree.getGraphicExpandedNonDupHorTrans(10, 3, 12) + '</svg>';
       var collapsedNonSubfamily = '<svg width="15" height="15">' +  tmpTree.getGraphicCollapsedNonSubfamily(5, 3, 12) + '</svg>';
       var rerootedHorizontalTransfer = '<svg width="15" height="15">' +  tmpTree.getGraphicRerootedHorizontalTransfer(5, 3, 12) + '</svg>';
       var rerootedDuplication = '<svg width="15" height="15">' +  tmpTree.getGraphicRerootedDuplication(5, 3, 12) + '</svg>';       
       var rerootedNonDupHorizontalTransfer = '<svg width="15" height="15">' +  tmpTree.getGraphicRerootedNonDupHorizontalTransfer(5, 3, 12) + '</svg>';         
       var rerootedCollapsedNonSubfamily = '<svg width="15" height="15">' +  tmpTree.getGraphicRerootedCollapsedNonSubfamily(5, 3, 12) + '</svg>';
       
       
       
        $("#legend").jqGrid({
            caption: "Legend",
            hiddengrid: true,
            height: 100,
            rownum: 2,
            colModel: [
                { name: "symbol1", label:"", width: "20" },
                { name: "definition1", label: "", width: "375" },
                
            ],
            cmTemplate: 
                    { sortable: false },
//            colModel: [
//                { name: "symbol1", label:"", width: "20" },
//                { name: "definition1", label: "Definition", width: "375" },
//                { name: "symbol2", label:"", width: "20" },
//                { name: "definition2", label: "Definition", width: "375" }                
//            ],            
            data: [
                { id: 10, symbol1: subfamilyInternalNode, definition1: "Expanded Subfamily node"  },
                { id: 20, symbol1: subfamilyCollapsedRerooted, definition1: "Collapsed Subfamily node"},
                { id: 30, symbol1: expandedDuplication, definition1: "Expanded duplication"},
                { id: 40, symbol1: expandedHorizontalTransfer, definition1: "Expanded horizontal transfer"},
                { id: 50, symbol1: expandedNonDupHorizontalTransfer, definition1: "Expanded speciation node"},
                { id: 60, symbol1: rerootedNonDupHorizontalTransfer, definition1: "Rerooted speciation node"  },
                { id: 70, symbol1: rerootedDuplication, definition1: "Rerooted expanded duplication"  },
                { id: 80, symbol1: rerootedHorizontalTransfer, definition1: "Rerooted expanded horizontal transfer"},
                { id: 90, symbol1: rerootedCollapsedNonSubfamily, definition1: "Rerooted collapsed non Subfamily node"  },
                { id: 100, symbol1: collapsedNonSubfamily, definition1: "Collapsed non Subfamily node"},                
           ]
//            data: [
//                { id: 10, symbol1: subfamilyInternalNode, definition1: "Expanded Subfamily node", symbol2: collapsedNonSubfamily, definition2: "Collapsed non Subfamily node"  },
//                { id: 20, symbol1: subfamilyCollapsedRerooted, definition1: "Collapsed Subfamily node", symbol2: rerootedNonDupHorizontalTransfer, definition2: "Rerooted non duplication and non horozontal transfer"  },
//                { id: 30, symbol1: expandedDuplication, definition1: "Expanded duplication", symbol2: rerootedDuplication, definition2: "Rerooted expanded duplication"  },
//                { id: 40, symbol1: expandedHorizontalTransfer, definition1: "Expanded horizontal transfer", symbol2: rerootedHorizontalTransfer, definition2: "Rerooted expanded horizontal transfer"   },
//                { id: 50, symbol1: expandedNonDupHorizontalTransfer, definition1: "Expanded non-duplication and non-horizontal transfer", symbol2: rerootedCollapsedNonSubfamily, definition2: "Rerooted collapsed non Subfamily node"  },
//            ]            
        });
        // Does not work to hide just the column header
//        var $legend = $("#legend");
////         $(".ui-jqgrid-titlebar-close",legend[0].grid.cDiv).click();
//       // $('#gview_legend .ui-jqgrid-hdiv').hide();
//        $legend.closest("div.ui-jqgrid-view")
//            .children("div.ui-jqgrid-hdiv")
//            .hide();
        // Hide column header
        $('#gview_legend').find('div[role="columnheader"]').parent().hide();
   };
   
   TreeViewer.prototype.startProgressBar = function() {
        var $progressbar = $("<div id='progressbar' height='50%;width: 100%; style='color:#0000FF'/>");
        var treeContainer = $('#treeviewer');
        $progressbar.insertAfter(treeContainer);
        var $progressLabel = ("<div id= 'progressLabelId' class=\"progress-label\">Loading data from server...</div>");
        $progressbar.append($progressLabel);
        $progressbar.progressbar({
            value: false,
            change: function() {
                progressbar = document.getElementById('progressbar');
                progressLabel = document.getElementById('progressLabelId');                
                $(progressLabel).text( $(progressbar).progressbar( "value" ) + "%" );
            },
            complete: function() {
                progressLabel = document.getElementById('progressLabelId');                
                $(progressLabel).text("Complete!");
                progressbar = document.getElementById('progressbar');
                //$(progressbar).hide();
            }
        });
   };


   
   TreeViewer.prototype.loadInfoFromServer = function() {
       this.initData = new TreeInitData();
       this.bookId = this.getParameterByName("book");
	var bookResults = $.get( "/searchTree?type=tree_info&book=" + this.bookId, function(data) {
            if (null !== data && undefined !== data && 0 !== data.length) {
                window.treeViewer.initData.treeData.setResponseString(new XMLSerializer().serializeToString(data.documentElement));
            }
            else {
                window.treeViewer.initData.treeData.setResponseString("");
            }
            var value = $("#progressbar").progressbar("option", "value") + 50;
            $("#progressbar").progressbar("option", "value", value);
            window.treeViewer.setupTreeInfo();
            if (window.treeViewer.stopExecution !== true) { 
                window.treeViewer.initData.treeData.success = true;
            }
            else {
                window.treeViewer.initData.treeData.success = false;
            }
            
        })
        .done(function() {
        })
        .fail(function() {
            window.treeViewer.initData.treeData.success = false;
        })
        .always(function() {
            window.treeViewer.initData.treeData.receivedResponse = true; 
            window.treeViewer.checkProgress(window.treeViewer.initData);
        });
	 window.treeViewer.initData.treeData.sentRequest = true;
        
	var msaResults = $.get( "/searchTree?type=msa_info&book=" + this.bookId, function(data) {
            if (null !== data && undefined !== data && 0 !== data.length) {
                window.treeViewer.initData.msa.setResponseString(new XMLSerializer().serializeToString(data.documentElement));
            }
            else {
                window.treeViewer.initData.msa.setResponseString("");
            }
            var value = $("#progressbar").progressbar("option", "value") + 35;
            $("#progressbar").progressbar("option", "value", value);

            window.treeViewer.setupMsaInfo();
            window.treeViewer.initData.msa.success = true;
//              window.treeViewer.initData.msa.success = false;
            })
            .done(function() {
            })
            .fail(function() {
                window.treeViewer.initData.msa.success = false;
            })
            .always(function() {
                    window.treeViewer.initData.msa.receivedResponse = true;
                    window.treeViewer.checkProgress(window.treeViewer.initData);
            });
	 window.treeViewer.initData.msa.sentRequest = true;
        
        var familyNameResults = $.get( "/searchTree?type=family_name&book=" + this.bookId, function(data) {

//            if (null !== data && undefined !== data && 0 !== data.length) {
//                 window.treeViewer.initData.familyName.setResponseString(new XMLSerializer().serializeToString(data.documentElement));
//            }
//            else {
//                 window.treeViewer.initData.familyName.setResponseString("Invalid family id specified");
//            }
//            var value = $("#progressbar").progressbar("option", "value") + 15;
//            $("#progressbar").progressbar("option", "value", value);
//            
//                        
//            var display;
//            var valid = true;
//            var famName = window.treeViewer.initData.familyName.responseInJSON.search.family_name;
//            if ("Invalid family id specified" === famName) {
//                display = "Family:  (" + window.treeViewer.bookId + ") - Invalid family id specified";
//                valid = false;
//            }
//            else {
//                display = "Family:  " + famName + " (" + window.treeViewer.bookId + ")";
//            }
//            var titleContainer = $('#titleContainer');
//            titleContainer.append(display);
//            if (false === valid) {
//                stopExecution = true;
//            }
             window.treeViewer.initData.familyName.success = true;
        })
        .done(function() {
        })
        .fail(function() {

        })
        .always(function() {
                    window.treeViewer.initData.familyName.receivedResponse = true;
                    window.treeViewer.checkProgress(window.treeViewer.initData);
        });
	 window.treeViewer.initData.familyName.sentRequest = true; 
        
        
        
    };
    
   TreeViewer.prototype.checkProgress = function(initData) {
       var progressLabel = document.getElementById('progressLabelId');
        if (true === window.treeViewer.stopExecution) {
            $(progressLabel).text("Unable to retrieve - Please check book id");
            return;
        }
	if (true === initData.treeData.receivedResponse &&
            true === initData.msa.receivedResponse  &&
            true === initData.familyName.receivedResponse) {	
		// Hide progressbar
		//hideProgressBar();
	}
        else {
            return;
        }
	if (true === initData.treeData.success &&
            true === initData.msa.success  &&
            true === initData.familyName.success) {
		
            // parse and display the tree
            //alert("got all the data");
            if (true === this.parseDataAndDisplay()) {
                this.hideProgressBar();
                
                // Create tree scale slider
                $( "#tree_slider" ).slider({
                    min: 1,
                    max: 500,
                    value : 100,
                    
                    stop: function(event, ui) {
                        var value = ui.value;
                        window.treeViewer.treeInfo.setScale(value);
                        window.treeViewer.displayTreeNoResize();
                    }
                });
                $( "#tree_slider" ).width = 200;
		return;
            }
/*		$(location).attr('href', '/error.jsp');*/
            $(progressLabel).text("Unable to retrieve - Please check book id");
            //updateErrorMessage();
            return;
	}
	// Display error message
        $(progressLabel).text("Unable to retrieve - Please check book id");
/*	$(location).attr('href', '/error.jsp?errorMsg=problems');*/
//	alert("going to go to error page with error message");
	
    };
    
   TreeViewer.prototype.hideProgressBar = function() {
        var progressBar = document.getElementById('progressbar');
        $(progressBar).hide();
    };

// Does not work    
//   TreeViewer.prototype.pleaseWait = function() {
//        $("#progressbar").progressbar("option", "value", "Please wait for operation to complete");
//        $("#progressbar").show();
//    };    
    
   TreeViewer.prototype.parseDataAndDisplay = function() {
        this.setupMsaTreeInfo();
        // Define the grid
		var treeInfo = this.treeInfo; // to use in rowattr without this
		//var formattedData = this.getTreeRowData(treeInfo.getNodes());
        $('#treeviewer').jqGrid({
            datatype: 'local',
			//data: formattedData,
            //colNames : gridHeader,
            colModel: columnModel,
            cmTemplate: 
                    { sortable: false , /* autoResizable: true , width: 200 */},
			autoResizing: { compact: true /*, maxColWidth: 600 */ },
		//	autoresizeOnLoad: true,
			iconSet: "fontAwesome",
                        // This causes the MSA column to have node color
//			rowattr: function (rd, cur, id) {
//				var style = "color:" + treeInfo.getNode(id).getColor();
//				var color = treeInfo.getNode(id).getColor();
//				var bgColor = treeInfo.getNode(id).getBgColor();
//				if (bgColor !== undefined) {
//					style += "; background-color:" + bgColor;
//				}
//				return {style: style};
//			},
            //rowNum: treeInfo.getNumNodes(),
            gridview: true,
            hoverrows: false,
            autoencode: true,
            ignoreCase: true,
            viewrecords: true,
            //height: '100%', width: null, shrinkToFit: false,
            height: 400,
			width: 1000, //$("#toolbar").width()-40, //$(window).width()-60,
			shrinkToFit: false,                    
            caption: 'Tree Attribute Viewer',
            resizeStop: function(newWidth, index) {
                var column = columnModel[index];
                // Not a frozen column resize - ignore since system handles this case
                if (false == column.frozen) {
                    window.treeViewer.displayTreeNoResize();        // Column size changes, need to reload else image will not be aligned properly with grid
                    return;
                }
                var frozenWidth = 0;
                var redraw = false;
                for (var j = 0; j < columnModel.length; j++) {
                    var column = columnModel[j];
                    var isFrozen = column.frozen;
                    if (true == isFrozen) {
                        if (j == index) {
                            frozenWidth = frozenWidth + newWidth;
                            if (column.label === 'Tree') {
                                redraw = true;
                            }
                        }
                        else {
                            frozenWidth = frozenWidth + column.width;
                        }
                    }
                }
                // Ensure grid is as large sum of frozen columns and ~50 pixels (for scroll + 'little extra')
                var currentWidth = $("#treeviewer").width();
                var containerwidth = $("#gbox_treeviewer").width();
                // If frozen width is 
                if (containerwidth + 50 < frozenWidth) {
                  // $("#gbox_treeviewer").width(frozenWidth + 50);
                  //$("#treeviewer").setGridWidth(frozenWidth + 50);
                   $("#treeviewer").jqGrid('setGridWidth', frozenWidth + 50);
                }
                console.log("resize of frozen column " + index + " to " + frozenWidth +  " pixels");
                // If width of image column changes, we want to set the size of svg correctly.  Maybe another way instead of calling reloadGrid?
                window.treeViewer.displayTreeNoResize();        // Column size changes, need to reload else image will not be aligned properly with grid
//                if (true == redraw) {
//                    window.treeViewer.displayTreeNoResize();
//                    $("#treeviewer").trigger("reloadGrid");
//                    // To get the coloring of the grid correctly, need to set colors again.
//                    var rows = window.treeViewer.treeInfo.getNodes();
//                    var formattedData = window.treeViewer.getTreeRowData(rows);
//                    window.treeViewer.setColors(formattedData);
//                }
            },
            beforeSelectRow: function () {
                return false;
            },
            gridComplete: function() {
//                                                $("#treeviewer").trigger("jqGridResetFrozenHeights");
//                                                console.log("grid complete");
                //$("#treeviewer").setSelection().focus();

            }, 
            
            
            onCellSelect: (function(rowid, iCol, cellcontent, e) {
                
                // Handle click until there is a solution for html link in cells
                var aNode = window.treeViewer.treeInfo.getNode(rowid);
                var leafNodeInfo = aNode.getLeafNodeInfo();
                if (leafNodeInfo !== undefined && iCol == 1) {
                    // Handle click for first column - open gene detail page
//                    var geneId = leafNodeInfo.getGeneId();
                    var geneId = leafNodeInfo.getNodeName();
                    if (null != geneId && undefined != geneId) {
                        var url      =  window.location.href;     // Returns full URL
                        var index = url.indexOf(window.location.pathname);
                        url = url.substring(0, index) + "/genes/gene.jsp?acc=" + leafNodeInfo.getNodeName();             
                        window.open(url, "panthermain");
                    }
                }
                }
            ),            

            
            loadComplete: function () {
                // Scroll to last scroll position, if possible
                if (null !== window.treeViewer.vScrollposition && undefined !== window.treeViewer.vScrollposition ) {
                    $("#treeviewer").closest(".ui-jqgrid-bdiv").scrollTop(window.treeViewer.vScrollposition);
                }
                if (null !== window.treeViewer.hScrollposition && undefined !== window.treeViewer.hScrollposition ) {
                    $("#treeviewer").closest(".ui-jqgrid-bdiv").scrollLeft(window.treeViewer.hScrollposition);
                }
                if (undefined != window.treeViewer.selectedColPos && null !== window.treeViewer.selectedColPos) {
                    $("#treeviewer").closest(".ui-jqgrid-bdiv").scrollLeft(window.treeViewer.selectedColPos);
                    window.treeViewer.selectedColPos = undefined;
                }
                if (undefined != window.treeViewer.selectedRow && null !== window.treeViewer.selectedRow) {
                    // Setting into focus does not work
//                    $("#treeviewer").setSelection(window.treeViewer.selectedRow);
                    // Setting row into focus is not working
                    //$(window.treeViewer.selectedRow).focus();
                    //$("#"+$('#treeviewer').jqGrid('getGridParam','selrow')).focus();
//                    $("#"+$('#treeviewer').getRowData(window.treeViewer.selectedRow)).focus();

                    // Try scrolling into view
                    var nodeList = window.treeViewer.treeInfo.getNodes();
                    if (null !== nodeList && undefined !== nodeList) {
                        for (var i = 0; i < nodeList.length; i++) {
                            var node = nodeList[i];
                            if (window.treeViewer.selectedRow === node.getAnnotationNodeId()) {
                                var arow = $("#treeviewer")[0].rows[i];
                                
                                var height = $("#gview_treeviewer").height();
                                var maxScroll = $(arow).outerHeight(true) * (nodeList.length);
                                var middle = Math.floor(maxScroll / 2);
                                var curTop = $(arow).outerHeight(true) * (i);     // include  margin and padding                                
                                
                                // No scrolling necessary
                                if (maxScroll < height || (curTop < height)) {
                                    window.treeViewer.selectedRow = undefined;
                                    return;                                    
                                }
                                // Scrolling to bottom
                                if (curTop + height > maxScroll) {
                                    $("#treeviewer").closest(".ui-jqgrid-bdiv").scrollTop(curTop);
                                    window.treeViewer.selectedRow = undefined;
                                    return;
                                }
                                // Scroll to middle
                                $("#treeviewer").closest(".ui-jqgrid-bdiv").scrollTop(curTop - (Math.floor(height / 2)));
                                window.treeViewer.selectedRow = undefined;
                            }
                        }
                    }
                }
                window.treeViewer.selectedRow = undefined;                        
                        // Attempt to fix image-grid alignment issue - Does not work 
                        //var $treeSvg = $("#treeSVG");
                        //$treeSvg.closest("td").css("padding","0");
                        //$treeSvg.css({"margin-top": "3px", "margin-bottom": "-8px"});

                            //console.log("Load complete");
                            //window.treeViewer.handleSyncWithGridRowSize();
			}
        }).jqGrid('gridResize', {
            
           stop: function (grid, ev, ui) {
//                console.log("Container width " + $("#gbox_treeviewer").width());
                var newWidth = $("#gbox_treeviewer").width();
                var frozenWidth = 0;
                var columnModel = $("#treeviewer").jqGrid('getGridParam', 'colModel'); // column model        
                for (var j = 0; j < columnModel.length; j++) {
                    var column = columnModel[j];              
                    var hidden = column.hidden;
                    if (true == hidden) {
                        continue;
                    }
                    if (true == column.frozen) {
                        frozenWidth = frozenWidth + column.width;
                    }
                }
                if (frozenWidth + 50 > newWidth) {
//                    console.log(newWidth + " New width is too small, setting to " + (frozenWidth + 50));
                    $("#treeviewer").jqGrid('setGridWidth', frozenWidth + 50);
                }
                       
               window.treeViewer.displayTreeNoResize();
           }
                     
            /*minWidth: 450 */});
        
	window.treeViewer.loadDataFromTree();
        window.treeViewer.defaultProcessing();
        window.treeViewer.displayTreeNoResize();        
        
        // Handle selections
        var selectedSf = this.getParameterByName("sf");
        var selectedSeq = this.getParameterByName("seq");
        var selectedSeqForAminoAcid = null;
        if (selectedSf !== "") {
            var sfList = selectedSf.split(",");
            var selectedNodeList = this.treeInfo.expandSfSelectSf(sfList);
            // Try and scroll to last selected node
            if (undefined !== selectedNodeList && null !== selectedNodeList && 0 < selectedNodeList.length) {
                var numItems = selectedNodeList.length;
                // find last terminus node
                for (var i = numItems - 1; i > 0; i--) {
                    if (true == selectedNodeList[i].isTerminus()) {
                        this.selectedRow = selectedNodeList[i].getAnnotationNodeId();
                        break;
                    }
                }
                window.treeViewer.displayTreeNoResize();
            }
        }
        else if (selectedSeq !== "") {
            var seqList = selectedSeq.split(",");
            // Sequences are in long gene name format
            var selectedNodeList = this.treeInfo.expandSfSelectSeq(seqList);
            var ehistory = this.getParameterByName("eHist");
            if (ehistory !== "" && undefined !== selectedNodeList && null !== selectedNodeList && 0 < selectedNodeList.length) {
                this.treeInfo.toggleView();                
                this.treeInfo.moveToTop(selectedNodeList[0]);
                window.treeViewer.hideGridInfo(true);
                
                window.treeViewer.hideMSAInfo(false);
                w2ui.toolbar.click('detailed');
                window.treeViewer.treeInfo.toggleView();
                window.treeViewer.handleSyncWithGridRowSize();                
                
                w2ui.toolbar.click('msa');
                w2ui.toolbar.click('history');                
                window.treeViewer.switchMsaView('history');
            }


            if (undefined !== selectedNodeList && null !== selectedNodeList && 0 < selectedNodeList.length) {
                window.treeViewer.selectedRow = selectedNodeList[0].getAnnotationNodeId();               
            }
            window.treeViewer.displayTreeNoResize();
            selectedSeqForAminoAcid = selectedNodeList[0].getAnnotationNodeId();   
        }
        if (this.msaInfo !== undefined && this.msaInfo !== null) {
            var selectSEQStartPos = this.getParameterByName("seqStartPos");
            var selectSEQEndPos = this.getParameterByName("seqEndPos");
            if ("" === selectSEQEndPos && "" !== selectSEQStartPos) {
                selectSEQEndPos = selectSEQStartPos;
            }
            // Highlight msa columns for a given range based on amino acid sequence start and end position 
            if (null !== selectedSeqForAminoAcid && undefined !== selectedSeqForAminoAcid && true == $.isNumeric(selectSEQStartPos) && true == $.isNumeric(selectSEQEndPos)) {
                var aminoAcidStartPos = this.msaInfo.getAminoAcidAlignPos(selectedSeqForAminoAcid, selectSEQStartPos); 
                var aminoAcidEndPos = this.msaInfo.getAminoAcidAlignPos(selectedSeqForAminoAcid, selectSEQEndPos);                
                this.selectSEQPosRange(aminoAcidStartPos, aminoAcidEndPos);                            
            }
            var msaView = this.getParameterByName("gridMSA");
            var selectMSAPos = this.getParameterByName("msaPos");            
            if (selectMSAPos !== "" || selectSEQStartPos != "" ||  selectSEQEndPos != "" ||true === msaView ) {
                if (selectMSAPos !== "") {
                    this.selectMSAPos(selectMSAPos);
                }
                window.treeViewer.hideGridInfo(true);
                window.treeViewer.hideMSAInfo(false);

                w2ui.toolbar.click('msa');
                w2ui.toolbar.click('fullSeq');

                window.treeViewer.switchMsaView('fullSeq');
                //w2ui.toolbar.hide('fullSeq');
                
                
                this.setupMSAPos();
                
                window.treeViewer.displayTreeNoResize();
            }
        }
        return true;
        
    };
    
    // Does not work for firefix either
//    TreeViewer.prototype.setupMSAPos = function() {
//        var msaPos = this.msaInfo.getScrollPos();
//        if (msaPos < 0) {
//            return;
//        }
//        var columnModel = $("#treeviewer").jqGrid('getGridParam', 'colModel'); // column model 
//        var width = 0;
//
//        for (var j = 0; j < columnModel.length; j++) {
//                var column = columnModel[j];
//                
//                var hidden = column.hidden;
//                if (true == hidden) {
//                    continue;
//                }
//                if (true == column.frozen) {
//                    continue;
//                }
//                if (this.msaCol !== column.name) {
//                    width = width + column.width;
//                }
//                else {
//                    
//                    width = width +  msaPos;
//                    break;
//                }
//        }
//        if (width > 0) {
//            window.treeViewer.selectedColPos = width;
////            console.log("Setting scroll position to " + width);
//        }        
//    };
    
    TreeViewer.prototype.setupMSAPos = function() {
        var range = this.msaInfo.getMinSelectedIndexRange();
        if (range < 0) {
            return;
        }
        
//        $("#treeviewer").closest(".ui-jqgrid-bdiv").scrollLeft(999999999999);
//        var maxScrollLeft = $("#treeviewer").closest(".ui-jqgrid-bdiv").scrollLeft();
//        console.log("max scroll position is " + maxScrollLeft);
//        
//        
//        // Firefox calculation of pixels per character is not correct.  Try and determine what it should be
        var columnModel = $("#treeviewer").jqGrid('getGridParam', 'colModel'); // column model        
//        var maxScrollPos = 0;
//        for (var j = 0; j < columnModel.length; j++) {
//                var column = columnModel[j];
//                
//                var hidden = column.hidden;
//                if (true == hidden) {
//                    continue;
//                }
//                if (true == column.frozen) {
//                    continue;
//                }
//                
//                maxScrollPos = maxScrollPos + column.width;
//        }
//        console.log("calculated max scroll position is " + maxScrollPos);
//        console.log("sequence length is " + this.msaInfo.getSeqLength());
//        var pixelPerChar = maxScrollPos / this.msaInfo.getSeqLength();
        var width = 0;

        for (var j = 0; j < columnModel.length; j++) {
                var column = columnModel[j];
                
                var hidden = column.hidden;
                if (true == hidden) {
                    continue;
                }
                if (true == column.frozen) {
                    continue;
                }
                if (this.msaCol !== column.name) {
                    width = width + column.width;
                }
                else {
                    
                    width = width +  (range * this.msaInfo.getCharacterWidth());
                    break;
//                    width = width +  (range * pixelPerChar);
//                    break;                    
                    

                }
        }
        if (width > 0) {
            window.treeViewer.selectedColPos = width;
//            console.log("Setting scroll position to " + width);
        }
    }
    
    TreeViewer.prototype.setupNodePositionInfo = function() {
//        console.log("setup node position called");

        var rows = $("#treeviewer tr ");
        console.log("There are " + (rows.length - 1) + " nodes");
        // If the tree is small, it is okay to setup the msa information
//        if (rows.length < 1500) {
//            window.treeViewer.setupMsaInfo();
//        }
        var currentTop;
        
        for (var i = 1; i < rows.length; i++) {         // Skip the first tr it is not part of the table
            //var arow = rows.get(i);
            var arow = $("#treeviewer")[0].rows[i];
//            var rowRect = arow.getBoundingClientRect();
            if (i === 1) {
                currentTop = 0;
            }
            var outerHeight = $(arow).outerHeight(true);        // include  margin and padding         
//            var td = $(arow).children().eq(1);          // Get the second td
//            var pos = td.offset();
//            var posi = td.position();
//            pos.bottom = pos.top + td.height();
//
//            var coordinates = td[0].getBoundingClientRect();
//            var height = td.height;
//            var coordHeight = coordinates.height;
//            var offset = td.offset();
            var position = new RowTopHeight();
            position.setY(currentTop);
            position.setHeight(outerHeight);
            currentTop = currentTop + (outerHeight);
            this.rowStartHeight.push(position);
        }
        this.calculatedRowHeights = true;
        this.treeInfo.setNodePositions(this.rowStartHeight);

    };    
    
    TreeViewer.prototype.setupNodePositionInfoOrig = function() {
        console.log("setup node position called");

        var rows = $("#treeviewer tr ");
        console.log("There are " + rows.length + " rows");
        var currentTop;
        for (var i = 1; i < rows.length; i++) {         // Skip the first tr it is not part of the table
            var arow = rows.get(i);
            if (i === 1) {
                currentTop = 0;
            }
            var td = $(arow).children().eq(1);          // Get the second td
            var pos = td.offset();
            var posi = td.position();
            pos.bottom = pos.top + td.height();

            var coordinates = td[0].getBoundingClientRect();
            var height = td.height;
            var coordHeight = coordinates.height;
            var offset = td.offset();
            var position = new RowTopHeight();
            position.setY(posi.top);
            position.setHeight(coordinates.height);
            currentTop = currentTop + coordinates.height;
            this.rowStartHeight.push(position);
        }
        this.calculatedRowHeights = true;
        this.treeInfo.setNodePositions(this.rowStartHeight);
        
        
        
//        var rows = $("#treeviewer tr ");
//        
//        // Skip first row
//        for (var i = 1; i < rows.length; i++) {
//            var arow = rows.get(i);
//            var td = $(arow).children().eq(0);          // Get the second td
//            var offset = td.offset();
//            var position = new RowTopHeight();
//            position.setY(Math.floor(offset.top));
//            position.setHeight(td.height());
//            rowStartHeight.push(position);
//        }
    };
    
    TreeViewer.prototype.loadDataFromTree = function() {
        // Load all nodes in tree and store positions
        var rows = this.treeInfo.getAllNodes();
        var formattedData = this.getTreeRowData(rows);
        var obj = {};
        obj.datatype="local";
        obj.rowNum = formattedData.length;
        obj.data = formattedData;
        //var grid = $("#treeViewer").jqGrid(obj);
        $('#treeviewer').jqGrid('clearGridData');
        $('#treeviewer').jqGrid('setGridParam', obj);
        $("#treeviewer").trigger("reloadGrid");
        
        var rows = $("#treeviewer tr ");
//        console.log("After reload grid - There are " + rows.length + " rows");
        this.setupNodePositionInfo();        
//        var currentTop;
        
//        for (var i = 1; i < rows.length; i++) {         // Skip the first tr it is not part of the table
//            //var arow = rows.get(i);
//            var arow = $("#treeviewer")[0].rows[i];
////            var rowRect = arow.getBoundingClientRect();
//            if (i === 1) {
//                currentTop = 0;
//            }
//            var outerHeight = $(arow).outerHeight(true);        // include  margin and padding         
////            var td = $(arow).children().eq(1);          // Get the second td
////            var pos = td.offset();
////            var posi = td.position();
////            pos.bottom = pos.top + td.height();
////
////            var coordinates = td[0].getBoundingClientRect();
////            var height = td.height;
////            var coordHeight = coordinates.height;
////            var offset = td.offset();
//            var position = new RowTopHeight();
//            position.setY(currentTop);
//            position.setHeight(outerHeight);
////            console.log("Top is " + currentTop + " height is " + outerHeight)
//            currentTop = currentTop + (outerHeight);
//            
//        }
        
        
        
        
        
//        $('#treeviewer').jqGrid('setFrozenColumns');
//        
//                var rows = $("#treeviewer tr ");
//        console.log("After frozen columns - There are " + rows.length + " rows");
//        var currentTop;
//        
//        for (var i = 1; i < rows.length; i++) {         // Skip the first tr it is not part of the table
//            //var arow = rows.get(i);
//            var arow = $("#treeviewer")[0].rows[i];
////            var rowRect = arow.getBoundingClientRect();
//            if (i === 1) {
//                currentTop = 0;
//            }
//            var outerHeight = $(arow).outerHeight(true);        // include  margin and padding         
////            var td = $(arow).children().eq(1);          // Get the second td
////            var pos = td.offset();
////            var posi = td.position();
////            pos.bottom = pos.top + td.height();
////
////            var coordinates = td[0].getBoundingClientRect();
////            var height = td.height;
////            var coordHeight = coordinates.height;
////            var offset = td.offset();
//            var position = new RowTopHeight();
//            position.setY(currentTop);
//            position.setHeight(outerHeight);
////            console.log("Top is " + currentTop + " height is " + outerHeight)
//            currentTop = currentTop + (outerHeight);
//            
//        }
//        $("#treeviewer").trigger("jqGridResetFrozenHeights");
//        
//        var rows = $("#treeviewer tr ");
//        console.log("After reest frozen heights - There are " + rows.length + " rows");
//        var currentTop;
//        
//        for (var i = 1; i < rows.length; i++) {         // Skip the first tr it is not part of the table
//            //var arow = rows.get(i);
//            var arow = $("#treeviewer")[0].rows[i];
////            var rowRect = arow.getBoundingClientRect();
//            if (i === 1) {
//                currentTop = 0;
//            }
//            var outerHeight = $(arow).outerHeight(true);        // include  margin and padding         
////            var td = $(arow).children().eq(1);          // Get the second td
////            var pos = td.offset();
////            var posi = td.position();
////            pos.bottom = pos.top + td.height();
////
////            var coordinates = td[0].getBoundingClientRect();
////            var height = td.height;
////            var coordHeight = coordinates.height;
////            var offset = td.offset();
//            var position = new RowTopHeight();
//            position.setY(currentTop);
//            position.setHeight(outerHeight);
////            console.log("Top is " + currentTop + " height is " + outerHeight)
//            currentTop = currentTop + (outerHeight);
//            
//        }
        
        // Setup node position information
//        this.setupNodePositionInfo();
        
        
//        for (var i = 0; i < formattedData.length; i++) {
//            console.log("Inserting " + annotationId);
//            $("#treeviewer").jqGrid('addRowData', "myId_" + i, formattedData[i], "last");            
//        }
//        this.setupNodePositionInfo();
//        // Default settings for tree
//        console.log("Default processing start " + Date());
//        this.treeInfo.collapseLowestLevelSubfamily();
//        this.treeInfo.ladderTop();
//        this.treeInfo.colorBySubfamily();
//        console.log("Default processing finish " + Date());
//        var msaHeader = this.msaInfo.getTitle();
//        $("#treeviewer").jqGrid ('setLabel', this.msaCol, msaHeader, {'text-align':'left'}, {'title':'msa'});
//        
//        // hide MSA column
//        if (null !== this.msaInfo) {
//            $("#treeviewer").jqGrid('hideCol',"msa");
//        }
	//	$("#treeviewer").jqGrid("setGridWidth", $("#toolbar").width());

        //this.displayTree();
    };
    
    TreeViewer.prototype.defaultProcessing = function() {

        // Default settings for tree
//        console.log("Default processing start " + Date());
        this.treeInfo.collapseLowestLevelSubfamily();
        this.treeInfo.ladderTop();
        this.treeInfo.colorBySubfamily();
//        console.log("Default processing finish " + Date());
        if (undefined != this.msaInfo) {
            var msaHeader = this.msaInfo.getTitle();
            $("#treeviewer").jqGrid ('setLabel', this.msaCol, msaHeader, {'text-align':'left', 'font-family': 'monospace'}, {'title':'msa'});

            // hide MSA column
            if (null !== this.msaInfo) {
                $("#treeviewer").jqGrid('hideCol',"msa");
            }
        }
    };

    
    
    TreeViewer.prototype.displayTreeNoResize = function() {       
//        console.log("Started display tree " + Date());
        // works
       //window.treeViewer.pleaseWait();
        //$(".loading").css("display", "show");         // Does not work
        var rows = this.treeInfo.getNodes();
        var formattedData = this.getTreeRowData(rows);
//        console.log("got data to display tree " + Date());
        var p = $('#treeviewer').jqGrid('getGridParam');
        p.datatype="local";
        p.rowNum = formattedData.length;
        p.data = formattedData;
        //var grid = $("#treeViewer").jqGrid(obj);
        //$('#treeviewer').jqGrid('setGridParam', p);
//        console.log("set data " + Date());
        this.vScrollposition = $("#treeviewer").closest(".ui-jqgrid-bdiv").scrollTop();
        this.hScrollposition = $("#treeviewer").closest(".ui-jqgrid-bdiv").scrollLeft();
        $("#treeviewer").trigger("reloadGrid");   
        //$("#treeviewer").trigger("reloadGrid",[{current:true}]);        // current:true preserves the scroll position? - DOES NOT WORK!
//        console.log("Finished reload tree " + Date());    
        
        
        this.setColors(formattedData);
        
         // Does not work
        // If we do not set frozen columns, the colors of the protein id column are rendered in black and background color is also incorrect
//        console.log("Finished display tree no resize now set frozen columns" + Date());
        $('#treeviewer').jqGrid('setFrozenColumns');      
        
        //this.jqGridAfterGridComplete();
//        console.log("Set frozen columns " + Date());

        
        
    };
    
    
    TreeViewer.prototype.getTreeRowData = function(rows) {
        var returnList = [];
        for (var i = 0; i < rows.length; i++) {
            var aNode = rows[i];
            var subfamilyInfo = aNode.getSubfamilyInfo();
            var subfamilyName = aNode.getPropagatedSfName();
            if (undefined !== subfamilyInfo) {
                subfamilyName = subfamilyInfo.getSubfamilyName();
            }
            if (undefined === subfamilyName) {
                subfamilyName = "";
            }
            var annotationId = aNode.getAnnotationNodeId();
            //console.log("Annotation node id " + annotationId);
            //var proteinId = annotationId;
            //var nodeName = "";
            var definition = "";
            var geneId = "";
            var geneSymbol = "";
            var organism = "";
            var leafNodeInfo = aNode.getLeafNodeInfo();
            if (leafNodeInfo !== undefined) {
                nodeName = leafNodeInfo.getNodeName();
                if (nodeName == undefined) {
                    nodeName = "";
                }
                //proteinId = leafNodeInfo.getNodeName();
                definition = leafNodeInfo.getDefinition();
                //geneId = leafNodeInfo.getGeneId();
                geneId = leafNodeInfo.getNodeName();
//                var geneIdParts = geneId.split(":");
//                if (null != geneIdParts && undefined != geneIdParts && geneIdParts.length > 1) {
//                    geneId = geneIdParts[1];
//                }
                // Special handling for MGI
                if (null !== geneId && undefined !== geneId && geneId.indexOf("MGI=") >= 0) {
                    geneId = geneId.replace("MGI=", "");
                }
                if (undefined == geneId) {
                    geneId = "";
                }
//                if (null !== geneId && undefined !== geneId) {
//                                        var url      =  window.location.href;     // Returns full URL
//                    var index = url.indexOf(window.location.pathname);
//                    url = url.substring(0, index) + "/genes/gene.jsp?acc=" + leafNodeInfo.getNodeName();
////                    window.open(url, "panthermain");
//                    
//                    var link = "<a href='" + url + "'>" + geneId + "</a>";
//                    console.log("link is " + link);
//                    geneId = link;
//                }
                
                geneSymbol = leafNodeInfo.getGeneSymbol();
                organism = leafNodeInfo.getOrganism();
            }
            var mf = aNode.getMf();
            var bp = aNode.getBp();
            var cc = aNode.getCc();
            var pc = aNode.getPc();
            if (undefined === mf) {
                mf = "";
            }
            if (undefined === bp) {
                bp = "";
            }
            if (undefined === cc) {
                cc = "";
            }
            if (undefined === pc) {
                pc = "";
            }
            
//            var seq = msaInfo.getSeq(annotationId);
//            if (seq === undefined || seq === null) {
//                seq = "";
//            }
            
            var info = {id: annotationId, tree: "treeImage", gene_id: geneId, gene_name: geneSymbol, organism: organism, definition: definition, subfamily_name: subfamilyName};
            if (i === 0) {
                info.attr = {tree: {rowspan: rows.length}, msa: {display: "none"}};
            }
            else {
                info.attr = {tree: {display: "none"}, msa: {display: "none"}};
            }
            
//            console.log("Inserting " + annotationId);
//            $("#treeviewer").jqGrid('addRowData', "myId_" + annotationId, info, "last");
            
            returnList.push(info);

        }
        return returnList;
    };
    
    TreeViewer.prototype.getTreeRowDataForMSAView = function(rows) {
        var returnList = [];
        for (var i = 0; i < rows.length; i++) {
            var aNode = rows[i];
            var subfamilyName = "";
            var annotationId = aNode.getAnnotationNodeId();
            //console.log("Annotation node id " + annotationId);
            var proteinId = annotationId;
            var definition = "";
            var geneId = "";
            var geneSymbol = "";
            var organism = "";

            var mf = "";
            var bp = "";
            var cc = "";
            var pc = "";
           
            var info = {id: annotationId, tree: "treeImage", gene_id: geneId, gene_name: geneSymbol, organism: organism, definition: definition};
            if (i === 0) {
                info.attr = {tree: {rowspan: rows.length}, msa: {display: "none"}};
            }
            else {
                info.attr = {tree: {display: "none"}, msa: {display: "none"}};
            }

            
            returnList.push(info);

        }
        return returnList;
    };    
    
    TreeViewer.prototype.getRowHeights = function() {

var rows = $("#treeviewer tr ");
                                console.log("Just getting row heights there are " + rows.length + " rows");
                                var currentTop;

                                for (var i = 1; i < rows.length; i++) {         // Skip the first tr it is not part of the table
                                    //var arow = rows.get(i);
                                    var arow = $("#treeviewer")[0].rows[i];
                                    var rowRect = arow.getBoundingClientRect();

                        //            var rowRect = arow.getBoundingClientRect();
                                    if (i === 1) {
                                        currentTop = 0;
                                    }
                                    var outerHeight = $(arow).outerHeight(true);       // include  margin and padding 
                                    if (rowRect.bottom - rowRect.top != outerHeight) {
                                        console.log("Got different value here");
                                    }
                                    console.log("Height for row " + i + " is " + outerHeight +  " top is " + currentTop);

                                }        
        
        
        
        
        
    };
    
    // Previously in loadComplete
    TreeViewer.prototype.jqGridAfterGridComplete = function() {
                            if (false == window.treeViewer.calculatedRowHeights) {
                                var rows = $("#treeviewer tr ");
                                // Grid has just been created - we have not added any data yet.  Only the header has been added
                                if (rows.length == 1) {
                                    return;
                                }
                                // The first time through  - we are just trying to determine all the row heights.
                                // Code below will remove rows from grid and add them as they are supposed to appear for the tree.
                                window.treeViewer.defaultProcessing();
                                return;
                            }
//				var $treeSvg = $("#treeSVG");
//				$treeSvg.closest("td").css("padding","0");
//				$treeSvg.css("margin-bottom", "-10px");
                            // Row height information changes whenever the number of rows in the grid is updated.  Recalculate node positions again   
                            if (true == window.treeViewer.redoRowHeights) {
                                var rows = $("#treeviewer tr ");
                                console.log("After load complete there are " + rows.length + " rows");
                                var currentTop;

                                for (var i = 1; i < rows.length; i++) {         // Skip the first tr it is not part of the table
                                    //var arow = rows.get(i);
                                    var arow = $("#treeviewer")[0].rows[i];
                                    var rowRect = arow.getBoundingClientRect();

                        //            var rowRect = arow.getBoundingClientRect();
                                    if (i === 1) {
                                        currentTop = 0;
                                    }
                                    var outerHeight = $(arow).outerHeight(true);       // include  margin and padding 
                                    if (rowRect.bottom - rowRect.top != outerHeight) {
                                        console.log("Got different value here");
                                    }
                                    console.log("Height for row " + i + " is " + outerHeight +  " top is " + currentTop);
                                    var positionInfo = window.treeViewer.rowStartHeight[i -1];
                                    positionInfo.setY(currentTop);
                                    positionInfo.setHeight(outerHeight);
                                    currentTop = currentTop + outerHeight;
                                }
                                window.treeViewer.treeInfo.setNodePositions(window.treeViewer.rowStartHeight);
                                window.treeViewer.redoRowHeights = false;
                                this.treeInfo.resetGraphObject(); 
                            }
    };
    
    
    // Need to call this whenever grid is reloaded else colors of the grid columns will be incorrect
    TreeViewer.prototype.setColors = function(formattedData) {
               // Set the colors
		// !!! usage of setCell in the loop can be too slow!!!
		// it's better to rewrite the bolow loop and replace it to the usage
		// of rowattr instead - But this also sets color for the MSA
		
        for (var i = 0; i < formattedData.length; i++) {
            var aRow = formattedData[i];
            var id = aRow.id;
			var color = this.treeInfo.getNode(id).getColor();
			var bgColor = this.treeInfo.getNode(id).getBgColor();
            for (var j = 0; j < columnModel.length; j++) {
                var column = columnModel[j];
                
                var name = column.name;
                if (name !== 'msa' && name !== 'tree' && name !== 'gene_id' ) {
                    if (undefined === bgColor) {
                        $('#treeviewer').jqGrid('setCell',id,name,"",{color:color});
                    }
                    else {
                        $('#treeviewer').jqGrid('setCell',id,name,"",{color:color, 'background-color':bgColor});
                    }
                }
                else if (name === 'gene_id') {
                    if (undefined === bgColor) {
                        $('#treeviewer').jqGrid('setCell',id,name,"",{color:'#325F99'});
                    }
                    else {
                        $('#treeviewer').jqGrid('setCell',id,name,"",{'background-color':bgColor});
                    }
                    
                }
            }                        
//            for (var j = 0; j < columnModel.length; j++) {
//                var column = columnModel[j];
//                
//                var name = column.name;
//                if (name !== 'msa' && name !== 'tree' && name !== 'gene_id' ) {
//                    if (undefined === bgColor) {
//                        $('#treeviewer').jqGrid('setCell',id,name,"",{color:color});
//                    }
//                    else {
//                        $('#treeviewer').jqGrid('setCell',id,name,"",{color:color, 'background-color':bgColor});
//                    }
//                }
//                else if (name === 'gene_id') {
//                    if (undefined === bgColor) {
//                        $('#treeviewer').jqGrid('setCell',id,name,"",{});
//                    }
//                    else {
//                        $('#treeviewer').jqGrid('setCell',id,name,"",{'background-color':bgColor});
//                    }
//                    
//                }
//            }
        }

    }

    

    

    TreeViewer.prototype.updateSize = function(){
        console.log("Update size start " + Date());

        //getting all lines in two tables by they id
        var lines = $("tr", this),
            flines = $("tr", "#"+$(this).attr("id")+"_frozen" );

        //setting in all frozen lines height equel to grid
        flines.each(function(i, item){

            //i%2 check because of border collapse
            $(item).height( $(lines[i]).innerHeight() - (i%2?1:0) );
        });
        console.log("Update size end " + Date());
    };
    
    TreeViewer.prototype.setupMsaTreeInfo = function() {
        columnModel = [
                 {name: this.gridCols[0], label: this.gridLabels[0], width: 600, autoResizable: false, frozen: true, cellattr: this.arrtSetting, title:false, formatter:this.svgFormatter},
//                 {name: this.gridCols[1], label: this.gridLabels[1], width: 200, autoResizing: { /*maxColWidth: 500 */}, frozen: true, classes: "textInDiv", formatter: this.gene_idFormatter},
                 {name: this.gridCols[1], label: this.gridLabels[1], width: 200, autoResizing: { /*maxColWidth: 500 */}, frozen: true},
                 {name: this.gridCols[2], label: this.gridLabels[2]},
                 {name: this.gridCols[3], label: this.gridLabels[3]},
                 {name: this.gridCols[4], label: this.gridLabels[4]},
                 {name: this.gridCols[5], label: this.gridLabels[5]}                 
        ];
        var disableMsa = true;
        if (undefined  !== this.msaInfo) {
            disableMsa = false;
            // Temporarily use toolbar container to determine width of a character in msa

//            toolBarContainer.addClass("msa_test");
//            toolBarContainer.html("W");
//            var width = toolBarContainer[0].offsetWidth;
//            msaInfo.setCharacterWidth(width);
//            treeInfo.setCharacterWidtn(width);
//
//            toolBarContainer.removeClass("msa_test");
//            toolBarContainer.empty();
            
            
            
            var c = document.getElementById("msa_check");
            var ctx = c.getContext("2d");
            ctx.font = "normal 14px monospace";
            ctx.letterSpacing='0px';
            var txt = "W";
            var width = ctx.measureText(txt).width;
            c.parentNode.removeChild(c);
            this.msaInfo.setCharacterWidth(width);
            this.treeInfo.setCharacterWidth(width);
        
            var msaHeader = this.msaInfo.getFullSeqHeader();
            var colWidth = this.msaInfo.getWidth();
            //gridHeader.push(msaHeader);
               columnModel.push({name: this.msaCol, label: msaHeader, width: colWidth, aligh: 'left', title:false, formatter:this.msaFormatter});
        }
        
        
        

        var toolBarContainer = $('#toolbar');
        toolBarContainer.addClass("padding: 4px; border: 1px solid silver; border-radius: 3px");
        $('#toolbar').w2toolbar({
            name: 'toolbar',
            items: [
                { type: 'menu',   id: 'tree', group: 'msaGrid', caption: 'Tree', items: 
                    [
                    { id: 'collapse_lowest_level_subfamily', text: 'Collapse Lowest Level Subfamily'}, 
                    { id: 'expand_all_subfamily_nodes', text: 'Expand All Subfamily Nodes'}, 
                    { id: 'reset_root_to_main', text: 'Reset Root to Main'},
                    { id: 'expand_all_nodes', text: 'Expand All Nodes'},
                    { id: 'ladder_top', text: 'Ladder Top'}, 
                    { id: 'ladder_bottom', text: 'Ladder Bottom'}, 
                    { id: 'ladder_original', text: 'Ladder Original'}
//                    ,
//                    { id: 'toggle_view', text: 'Toggle Phylogenetic/Detailed'}
                    ]},
                { type: 'html' , id: 'scale_label',
                     html: 'Scale:  '},
                { type: 'break', id: 'break_1' },                 
                { type: 'html', html: ' <div id="tree_slider" ></div>'},
                { type: 'break', id: 'break0' },
                { type: 'radio',   id: 'phylo', group: 'phyloDetailed', caption: 'Phylogenetic', checked: true},
                { type: 'break', id: 'break5' },
                { type: 'radio',   id: 'detailed', group: 'phyloDetailed', caption: 'Detailed', checked: false},                
                { type: 'break', id: 'break6' },                
                { type: 'radio',   id: 'msa', group: 'msaGrid', caption: 'MSA', hidden: disableMsa },
                { type: 'break', id: 'break1' },
                { type: 'radio',   id: 'grid', group: 'msaGrid', caption: 'Grid', checked: true },
                { type: 'break', id: 'break2' },
//                { type: 'html',  id: 'search', hidden: true,
//                    html: '<div style="padding: 3px 10px;">'+
//                      ' Search:'+
//                      '    <input size="30" style="padding: 3px; border-radius: 2px; border: 1px solid silver"/>'+
//                      '</div>' 
//                },
                { type: 'radio',   id: 'fullSeq', group: 'fullMatch', caption: 'Entire Alignment', checked: true, hidden: true },
                { type: 'break',   id: 'break3', hidden: true },
                { type: 'radio',   id: 'matchState', group: 'fullMatch', caption: 'Trimmed Alignment', hidden: true },
                { type: 'break',   id: 'break4', hidden: true },
                { type: 'radio',   id: 'history', group: 'fullMatch', caption: 'Evolutionary History', hidden: true }
            ]
        });
    
        w2ui.toolbar.on('*', function (event) {
            if (event.type !== 'click') {
                return;
            }
            //console.log('EVENT: '+ event.type + ' TARGET: '+ event.target, event);
            if (event.target === 'tree:collapse_lowest_level_subfamily' && event.type === 'click') {
                    window.treeViewer.treeInfo.collapseLowestLevelSubfamily();
                    //window.treeViewer.displayTreeNoResize();
                    window.treeViewer.handleSyncWithGridRowSize();
                    return;
            }
            if (event.target === 'tree:expand_all_subfamily_nodes' && event.type === 'click') {
                    window.treeViewer.treeInfo.expandAllSubfamilyNodes();
                    //window.treeViewer.displayTreeNoResize();
                    window.treeViewer.handleSyncWithGridRowSize();
                    return;
            }
            if (event.target === 'tree:reset_root_to_main' && event.type === 'click') {
                    window.treeViewer.treeInfo.resetRootToMain();
                    //window.treeViewer.displayTreeNoResize();
                    window.treeViewer.handleSyncWithGridRowSize();
                    return;
            }
            if (event.target === 'tree:expand_all_nodes' && event.type === 'click') {
                    window.treeViewer.treeInfo.expandAllNodes();
                    //window.treeViewer.displayTreeNoResize();
                    window.treeViewer.handleSyncWithGridRowSize();
                    return;
            }
            if (event.target === 'tree:ladder_top' && event.type === 'click') {
                    //window.treeViewer.beginGridRequest("treeviewer");
                    window.treeViewer.treeInfo.ladderTop();
                    //window.treeViewer.displayTreeNoResize();
                    //window.treeViewer.endGridRequest("treeviewer");
                    window.treeViewer.handleSyncWithGridRowSize();
                    return;
            }
            if (event.target === 'tree:ladder_bottom' && event.type === 'click') {
                    window.treeViewer.treeInfo.ladderBottom();
                    //window.treeViewer.displayTreeNoResize();
                    window.treeViewer.handleSyncWithGridRowSize();
                    return;
            }
            if (event.target === 'tree:ladder_original' && event.type === 'click') {
                    window.treeViewer.treeInfo.ladderOriginal();
                    //window.treeViewer.displayTreeNoResize();
                    window.treeViewer.handleSyncWithGridRowSize();
                    return;
            }
//            if (event.target === 'tree:toggle_view' && event.type === 'click') {
////                    alert ("Functionality disabled");
////                    return;
//                    window.treeViewer.treeInfo.toggleView();
//                    //window.treeViewer.displayTreeNoResize();
//                    window.treeViewer.handleSyncWithGridRowSize();
//                    return;
//            }
            if (((event.target === 'phylo' ) || (event.target === 'detailed')) && event.type === 'click') {
                    window.treeViewer.treeInfo.toggleView();
                    //window.treeViewer.displayTreeNoResize();
                    window.treeViewer.handleSyncWithGridRowSize();
                    return;                
            }            
            if (event.target === 'msa' && event.type === 'click') {
                //w2ui.toolbar.hide('search');
                w2ui.toolbar.show('fullSeq');
                w2ui.toolbar.show('matchState');
                w2ui.toolbar.show('break3');
                w2ui.toolbar.show('history');
                w2ui.toolbar.show('break4');
                window.treeViewer.hideGridInfo(true);
                window.treeViewer.hideMSAInfo(false);
                
                // Without resize, application displays tree column twice (sometimes)
                $grid = $('#treeviewer');
		//		$("#treeviewer").jqGrid("setGridWidth", $("#toolbar").width());
                
//                var currentView = msaInfo.getCurrentView();
//                if (currentView === msaInfo.view_full) {
//                    w2ui.toolbar.check('fullSeq');
//                    w2ui.toolbar.refresh('toolbar');
//                }
//                else {
//                    w2ui.toolbar.check('matchState');
//                    w2ui.toolbar.refresh('toolbar');
//                }
            }
            if (event.target === 'grid'&& event.type === 'click') {
                //w2ui.toolbar.show('search');
                w2ui.toolbar.hide('fullSeq');
                w2ui.toolbar.hide('matchState');
                w2ui.toolbar.hide('break3');
                w2ui.toolbar.hide('history');
                w2ui.toolbar.hide('break4');                
                window.treeViewer.hideGridInfo(false);
                window.treeViewer.hideMSAInfo(true);
                
                // Without resize, application displays tree column twice (sometimes)
                $grid = $('#treeviewer');
            }
            if (event.target === 'fullSeq'&& event.type === 'click') {
                window.treeViewer.switchMsaView('fullSeq');
            }
            if (event.target === 'matchState'&& event.type === 'click') {
                window.treeViewer.switchMsaView('matchState');
            }
            if (event.target === 'history'&& event.type === 'click') {
//                alert("Functionality disabled");
//                return;
                window.treeViewer.switchMsaView('history');
            }
        });
    };
    
    TreeViewer.prototype.switchMsaView = function(state) {
        if (this.msaInfo === undefined) {
            return;
        }
        if (state === 'fullSeq') {
            this.msaInfo.setViewDefault();
        }
        else if (state === 'matchState') {
            this.msaInfo.setViewMatchState();
        }
        else if (state === 'history') {
            this.msaInfo.setViewHistory();
        }
        var msaHeader = this.msaInfo.getTitle();
        $("#treeviewer").jqGrid ('setLabel', this.msaCol, msaHeader, {'text-align':'left', 'font-family': 'monospace'}, {'title':'msa'});
        var width = this.msaInfo.getWidth();
//        var currentSettings = $('#treeviewer').jqGrid('getColProp', this.msaCol);
//        currentSettings.width = width;
          var currentWidth = $("#treeviewer").jqGrid('getGridParam', 'width'); // get current width
//          console.log("width of grid before resize is " + currentWidth + " msa column width is " + width);

        

        //$('#treeviewer').jqGrid('setColProp', this.msaCol, {width:width});
//        $grid = $('#treeviewer');
//        resizeColumnHeader.call($grid[0]);
//                hideMSAInfo(true);
//                hideMSAInfo(false);
//        var totalWidth = 0;
//        var a = $("#treeviewer").jqGrid('getGridParam','colModel');
//        for (var i = 0; i < a.length; i++) {
//            if (true === a[i].hidden) {
//        	continue;
//            }
//            totalWidth += a[i].width;
//        }
//        $("#treeviewer").jqGrid('setGridWidth', totalWidth);
//            $grid = $('#treeviewer');
//            resizeColumnHeader.call($grid[0]);
//            fixPositionsOfFrozenDivs.call($grid[0]);
//            fixGboxHeight.call($grid[0]);
        
        var ids = $("#treeviewer").jqGrid('getDataIDs');
//        console.log("Starting to change msa text "  + Date());
        for (var i = 0; i < ids.length; i++) 
        {
            var rowId = ids[i];
            var rowData = $('#treeviewer').jqGrid ('getRowData', rowId);
            var node = this.treeInfo.getNode(rowId);
            var parent = node.getParent();
            var parentId = undefined;
            if (parent !== undefined) {
                parentId = parent.getAnnotationNodeId();
            }
            var displayString = this.msaInfo.getSeqDisplay(rowId, parentId);
            //console.log("msa color info " + displayString);
            $('#treeviewer').jqGrid('setCell', rowId, this.msaCol, displayString);
        }
        $("#treeviewer").jqGrid("setColWidth", this.msaCol, width, false);
//        console.log("new width of grid after resize is " + $("#treeviewer").jqGrid('getGridParam', 'width'));
        $("#treeviewer").jqGrid('setGridWidth', currentWidth);
//        console.log("finished changing msa text "  + Date());
        window.treeViewer.displayTreeNoResize();

    };
    
    TreeViewer.prototype.hideGridInfo = function(hide) {
        var param = 'hideCol';
        if (hide === false) {
            param = 'showCol';
        }
        var currentWidth = $("#treeviewer").jqGrid('getGridParam', 'width'); // get current width
        for (var i = 0; i < this.gridCols.length; i++) {
            $("#treeviewer").jqGrid(param, this.gridCols[i]);
        }
		//$("#treeviewer").jqGrid("setGridWidth", $("#toolbar").width());
         $("#treeviewer").jqGrid('setGridWidth', currentWidth);        
    };
       
    TreeViewer.prototype.hideMSAInfo = function(hide) {
        var param = 'hideCol';
        if (hide === false) {
            param = 'showCol';
        }
        var currentWidth = $("#treeviewer").jqGrid('getGridParam', 'width'); // get current width
        $("#treeviewer").jqGrid(param, this.msaCol);
		//$("#treeviewer").jqGrid("setGridWidth", $("#toolbar").width());
         $("#treeviewer").jqGrid('setGridWidth', currentWidth);        
    };
    

    
    TreeViewer.prototype.setupTreeInfo = function() {
        var root = this.initData.treeData.responseInJSON.tree_info.annotation_node;
        if (undefined === root) {
            window.treeViewer.stopExecution = true;
            return;
        }
        this.treeInfo = new Tree();
        this.treeInfo.parse(root);

    };
       
    TreeViewer.prototype.setupMsaInfo = function() {
         if (undefined === this.initData.msa.responseInJSON.msa_info) {
             return;
         }
        var seqList = this.initData.msa.responseInJSON.msa_info.msa;
        if (seqList === undefined) {
            return;
        }
        var seqInfoList = this.initData.msa.responseInJSON.msa_info.msa.sequence_list;
        if (seqInfoList === undefined || 0 === seqInfoList.length) {
            return;
        }
        
        this.msaInfo = new MSA();
//        var weightList = this.initData.msa.responseInJSON.search.weight_list;
//        var weightInfoList = null;
//        if (null !== weightList && undefined !== weightList) {
//            weightInfoList = weightList.weight_info;
//        }
        this.msaInfo.parse(seqInfoList, null);
    };
    
    TreeViewer.prototype.arrtSetting = function (rowId, tv, rawObject, cm, rdata) {

        var name = cm.name;
        var attribute = rawObject.attr[name];
        var attr = rawObject.attr[cm.name];
        var result;
            if (attr.rowspan) {
                result = ' rowspan=' + '"' + attr.rowspan + '"';
            }

            if (attr.display) {
                result = ' style="display:' + attr.display + '"';
            } 
            //result = result + ' title=" this is the tooltip for '  + rowId + '"';                            
            //console.log("attr setting = " + result + " for row id " + rowId + " " + Date());
            return result;
    };
    
    TreeViewer.prototype.msaFormatter = function (cellvalue, options, rowObject) {
        if (undefined !== cellvalue) {
            return cellvalue;
        }
       
        var id = options.rowId;

        var node = window.treeViewer.treeInfo.getNode(id);
        var parent = node.getParent();
        var parentId = undefined;
        if (parent !== undefined) {
            parentId = parent.getAnnotationNodeId();
        }

        var seqDisplay = window.treeViewer.msaInfo.getSeqDisplay(id, parentId);
        return seqDisplay;

    };
    
    TreeViewer.prototype.gene_idFormatter = function(cellvalue, options, rowObject) {
        var id = options.rowId;
        var aNode = window.treeViewer.treeInfo.getNode(id);
        var leafNodeInfo = aNode.getLeafNodeInfo();
        if (null === leafNodeInfo || undefined === leafNodeInfo) {
            return "";
        }
        var geneId = leafNodeInfo.getNodeName();
//        var geneId = leafNodeInfo.getGeneId();
//                var geneIdParts = geneId.split(":");
//                if (null != geneIdParts && undefined != geneIdParts && geneIdParts.length > 1) {
//                    geneId = geneIdParts[1];
//                }
                // Special handling for MGI
        if (null !== geneId && undefined !== geneId && geneId.indexOf("MGI=") >= 0) {
            geneId = geneId.replace("MGI=", "");
        }


        if (geneId !== undefined && null !== geneId) {
            var url = window.location.href; // Returns full URL
            var index = url.indexOf(window.location.pathname);
            url = url.substring(0, index) + "/genes/gene.jsp?acc=" + leafNodeInfo.getNodeName();
            var link = "<a href='" + url + "'  target='panthermain'>" + geneId + "</a>";
            return link;
            //return '<div>' + jQuery.jgrid.stripHtml(link) + '</div>';
        }
        else {
            return "";
        }
    };
    
    TreeViewer.prototype.svgFormatter = function( cellvalue, options, rowObject ) {
        var treeElem = document.getElementById("treeSVG");
        if (undefined !== treeElem && null !== treeElem) {
            treeElem.parentNode.removeChild(treeElem);
        }
       
        //console.log("svg formatter called for " + options.rowId + " " + Date());
        if (false === window.treeViewer.calculatedRowHeights) {
            return "";
        }
        var name = options.colModel.name;
        var attr = rowObject.attr[name];

        if (undefined !== attr && attr.display === "none") {
            return "";
        } 

        var svgInfo = window.treeViewer.treeInfo.getTreeSVG(options.colModel.width);
        
        var gBox = $("#gbox_treeviewer");
        var gBoxHeight = gBox.outerHeight(true);
        var header = $("div.ui-widget-header.ui-corner-top.ui-jqgrid-titlebar.ui-jqgrid-caption");//$("div[class='ui-widget-header ui-corner-top ui-jqgrid-titlebar ui-jqgrid-caption']");
        var headerHeight = header.outerHeight(true);  
        var titleBar = $(".ui-jqgrid-labels");
        var titleBarHeight = titleBar.outerHeight(true);
        var totalHeight = gBoxHeight - headerHeight - titleBarHeight;
        
        // Setting correct tree height causes grid to re-size itself to be with bigger height for all rows.  Get around by making tree height 'a little small'
        var treeHeight = window.treeViewer.treeInfo.getTreeHeight() - 5;//  THIS IS A TOTAL 'FUDGE' - If tree height is smaller than height of the grid rows - jqgrid tries to compensate by increasing grid height rows.  This causes problems with tree and grid alignment
        var returnStr = null;
        // This works well for chrome - But, image gets cutoff in Firefox
        if (totalHeight > treeHeight) {
            returnStr =  '<svg id="treeSVG" width="100%" height="' + treeHeight  + "\"> " + svgInfo + '</svg>';              // Need to use calculated height, else jqgrid makes height of each row very large        
        }
        else {
            returnStr =  '<svg id="treeSVG" width="100%" height="100%"'   + "\> " + svgInfo + '</svg>';  // Dont use calculated height?
        }
        
//        // Original handling
//        treeHeight = treeHeight + 5;
        returnStr =  '<svg id="treeSVG" width="100%" height="' + treeHeight  + "\"> " + svgInfo + '</svg>';

        //var returnStr =  '<svg id="treeSVG" width="100%" height="' + (window.treeViewer.treeInfo.getTreeHeight()) + "\"> " + svgInfo + '</svg>'; 
        
        //var returnStr =  '<svg id="treeSVG" width="100%" height="' + (window.treeViewer.treeInfo.getTreeHeight()) + "\"   preserveAspectRatio=\"xMaxYMax\"   viewBox=\"0,0," + options.colModel.width  + "," + (window.treeViewer.treeInfo.getTreeHeight()) + "\"> " + svgInfo + '</svg>'; 
        
        //var returnStr =  '<svg id="treeSVG" width="100%" height="' + (window.treeViewer.treeInfo.getTreeHeight()) + "\" viewBox=\"0,0," + options.colModel.width  + "," + (window.treeViewer.treeInfo.getTreeHeight()) + "\"> " + svgInfo + '</svg>'; 
        //
        //
        //console.log("getting tree image");
        //returnStr = "";
        return returnStr;
    };
    
    TreeViewer.prototype.handleSyncWithGridRowSize = function() {
        this.displayTreeNoResize();        
    }
    
    TreeViewer.prototype.handleSyncWithGridRowSizeOrig = function () {
                        this.displayTreeNoResize();
        if (this.redoRowHeights == true) {
            // Update row sizes with current sizes
            var rows = $("#treeviewer tr ");
            console.log("After load complete there are " + rows.length + " rows");
            var currentTop;

            for (var i = 1; i < rows.length; i++) {         // Skip the first tr it is not part of the table
                //var arow = rows.get(i);
                var arow = $("#treeviewer")[0].rows[i];
                var rowRect = arow.getBoundingClientRect();

    //            var rowRect = arow.getBoundingClientRect();
                if (i === 1) {
                    currentTop = 0;
                }
                var outerHeight = $(arow).outerHeight(true);       // include  margin and padding 
                if (rowRect.bottom - rowRect.top != outerHeight) {
                    console.log("Got different value here");
                }
//                console.log("Height for row " + i + " is " + outerHeight +  " top is " + currentTop);
                var positionInfo = window.treeViewer.rowStartHeight[i -1];
                if (undefined == positionInfo) {
                    positionInfo = new RowTopHeight();
                    window.treeViewer.rowStartHeight[i -1] = positionInfo;
                }
                positionInfo.setY(currentTop);
                positionInfo.setHeight(outerHeight);
                currentTop = currentTop + outerHeight;
            }
            if (rows.length > 1  && true == window.treeViewer.calculatedRowHeights) {
                window.treeViewer.treeInfo.setNodePositions(window.treeViewer.rowStartHeight);

                this.treeInfo.resetGraphObject();
                $("#treeviewer").trigger("jqGridResetFrozenHeights");
                this.displayTreeNoResize();
                window.treeViewer.redoRowHeights = false;
            }
        }


        //this.treeInfo.resetGraphObject();        
        //this.displayTreeNoResize();
        //$("#treeviewer").trigger("jqGridResetFrozenHeights");

    };
    
    TreeViewer.prototype.expandSFSelectSf = function(sfList) {
        if (undefined === sfList || null === sfList || sfList.length === 0) {
            return;
        }
        this.treeInfo.expandSfSelectSf(sfList);
        
    };
    
    TreeViewer.prototype.selectMSAPos = function(msaPos) {
        if (undefined === msaPos || null === msaPos || false === $.isNumeric(msaPos)) {
            return;
        }
        //    TODO need to implement this.treeInfo.selectMSACol(msaPos);
        var int = parseInt(msaPos);
        this.msaInfo.setSelectedIndex(msaPos);
    };
    
    TreeViewer.prototype.selectSEQPosRange = function(seqStartPos, seqEndPos) {
        if (undefined === seqStartPos || null === seqStartPos || false === $.isNumeric(seqStartPos) ||
            undefined === seqEndPos || null === seqEndPos || false === $.isNumeric(seqEndPos)) {
            return;
        }
        this.msaInfo.setAminoAcidRange(seqStartPos, seqEndPos);
    };
    
    
    TreeViewer.prototype.beginGridRequest = function(gridName) {

    };

    TreeViewer.prototype.endGridRequest = function(gridName) {

    };
    

       
    TreeViewer.prototype.getParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };
    

    

};






