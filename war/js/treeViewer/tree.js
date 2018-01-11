function Tree() {
    this.root;
    this.currentRoot;
    this.orderedNodes = [];        //Current Terminus nodes
    this.allNodes = [];
    this.anToNodeLookup = new Hashtable();

    this.nodePositions;

    this.scale = 100;
    this.red = "rgb(255, 0, 0)";
    this.green = "rgb(0, 204, 0)";
    this.purple = "rgb(0, 119, 255)";
    this.orange = "rgb(255, 153, 0)";
    this.turquoise = "rgb(0, 255, 255)";
    this.backgroundColor = "rgb(207, 226, 245)";

    this.markerWidth = 4;
    this.imageOffset = 10;
    this.circleRadius = 2;
    this.characterWidth;

    this.view = 0;        // 0 for phylogenetic view, 1 for detail view
    this.graphObject;


    Tree.prototype.parse = function (jsRoot) {
        if (this.root === undefined) {
            this.root = new Node();
            this.root.parse(this.root, jsRoot, this.anToNodeLookup);
            this.currentRoot = this.root;
        }
        this.setNumLeavesInTree(this.root);
        this.setupNodes(this.currentRoot);
        

    };
    
    Tree.prototype.setCharacterWidth = function(width) {
        this.characterWidth = width;
    };


    Tree.prototype.getNode = function (anId) {
        return this.anToNodeLookup.get(anId);
    };
    
    // NumleavesinTree is the number of descendants - not count of leaf nodes
    Tree.prototype.setNumLeavesInTree = function(node) {
        var children = node.getChildren();
        if (undefined === children) {
            node.setNumLeavesInTree(0);
            return;
        }
        var total = 0;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            this.setNumLeavesInTree(child);
            var childLeaves = child.getNumLeavesInTree();
            childLeaves++;  // + 1 for child node
            total = total + childLeaves;
        }
        node.setNumLeavesInTree(total);
    };
    
    
    Tree.prototype.setNodeOrdering = function() {
        this.graphObject = undefined;
        this.orderedNodes.length = 0;
        this.reorderNodes(this.currentRoot);
    };
    
    Tree.prototype.reorderNodes = function(node) {
        if (0 === this.view) {
            if (true === node.isTerminus()) {
                this.orderedNodes.push(node);
                return;
            }
            var children = node.getChildren();
            if (undefined === children) {
                return;
            }
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                this.reorderNodes(child);
            }
        }
        else {
            this.orderedNodes.push(node);
            if (true === node.isTerminus()) {   
                return;
            }
            var children = node.getChildren();
            if (undefined === children) {
                return;
            }
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                this.reorderNodes(child);
            }
        }
    };

    Tree.prototype.expandAllSubfamilyNodes = function() {
        this.currentRoot.expandAllSubfamilyNodes(this.currentRoot);
        this.setNodeOrdering();
        this.setNodePositions(this.nodePositions);
    };
    
    Tree.prototype.expandAllNodes = function() {
        this.currentRoot.expandAllNodes(this.currentRoot);
        this.setNodeOrdering();
        this.setNodePositions(this.nodePositions);        
    };
    
    Tree.prototype.resetRootToMain = function() {
        this.currentRoot = this.root;
        this.setNodeOrdering();
        this.setNodePositions(this.nodePositions);        
    };
    
    Tree.prototype.collapseLowestLevelSubfamily = function() {
        this.currentRoot.collapseLowestLevelSf(this.currentRoot);
        this.setNodeOrdering();
        this.setNodePositions(this.nodePositions);
    };
    
    Tree.prototype.setScale = function(value) {
        this.scale = value;
        this.graphObject = undefined;
//        console.log('scale finished' + Date());
    };
    
    Tree.prototype.ladderTop = function() {
//        console.log('ladder top started ' + Date());
        this.ladder(this.root, false);
        this.setNodeOrdering();
        this.setNodePositions(this.nodePositions);
//        console.log('ladder top finished ' + Date());        
    };
    
    Tree.prototype.ladderBottom = function() {
        this.ladder(this.root, true);
        this.setNodeOrdering();
        this.setNodePositions(this.nodePositions);
    };
    
    Tree.prototype.ladderOriginal = function() {
        this.ladderTreeOriginal(this.root);
        this.setNodeOrdering();
        this.setNodePositions(this.nodePositions);
    };
    
    Tree.prototype.ladderSort = function(bottom) {
        return function(a, b) {
            if (false === bottom) {
                if (a.getNumLeavesInTree() < b.getNumLeavesInTree()) {
                    return 1;
                }
                if (a.getNumLeavesInTree() > b.getNumLeavesInTree()) {
                    return -1;
                }
                return 0;
            }
            else {
                if (a.getNumLeavesInTree() < b.getNumLeavesInTree()) {
                    return -1;
                }
                if (a.getNumLeavesInTree() > b.getNumLeavesInTree()) {
                    return  1;
                }
                return 0; 
            }
        };
    };
    
    Tree.prototype.ladderSortOriginal = function() {
        return function(a, b) {
            if (a.getOriginalNodeOrder() > b.getOriginalNodeOrder()) {
                return 1;
            }
            if (a.getOriginalNodeOrder() < b.getOriginalNodeOrder()) {
                return -1;
            }
            return 0;
        };
    };
    
    // parameter bottom = true for ladder bottom
    Tree.prototype.ladder = function (node, bottom) {
        //console.log("laddering " + node.getAnnotationNodeId() + " bottom is " + bottom);
        if ((undefined === node.children)) {
            return;
        }
        var origChildren = node.getChildren();
//        for (var i = 0; i < origChildren.length; i++) {
//            console.log("Original children order " + origChildren[i].getAnnotationNodeId());
//        }
        origChildren.sort(this.ladderSort(bottom));
//        var newChildrenOrder = node.getChildren();
//        for (var i = 0; i < newChildrenOrder.length; i++) {
//            console.log("New children order " + newChildrenOrder[i].getAnnotationNodeId());
//        }        
        
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            this.ladder(children[i], bottom);
        }
    };
    
    Tree.prototype.ladderTreeOriginal = function(node) {
        //console.log("laddering " + node.getAnnotationNodeId());
        if ((undefined === node.children)) {
            return;
        }
        var origChildren = node.getChildren();
//        for (var i = 0; i < origChildren.length; i++) {
//            //console.log("Original children order " + origChildren[i].getAnnotationNodeId());
//        }
        origChildren.sort(this.ladderSortOriginal());
//        var newChildrenOrder = node.getChildren();
//        for (var i = 0; i < newChildrenOrder.length; i++) {
//            //console.log("New children order " + newChildrenOrder[i].getAnnotationNodeId());
//        }        
        
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            this.ladderTreeOriginal(children[i]);
        }     
    };

    Tree.prototype.setupNodes = function (node) {
        if (0 === this.view) {
            this.allNodes.push(node);
            if (true === node.isTerminus()) {
                this.orderedNodes.push(node);
                return;
            }
            var children = node.getChildren();
            if (undefined === children) {
                return;
            }
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                this.setupNodes(child);
            }
        }
        else {
            if (true === node.isTerminus()) {
                this.orderedNodes.push(node);
                return;
            }
            this.orderedNodes.push(node);
            var children = node.getChildren();
            if (undefined === children) {
                return;
            }
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                this.setupNodes(child);
//                if (child.isExpanded() && undefined !== child.getChildren()) {
//                    var grandChildren = child.getChildren();
//                    for (var j = 0; j < grandChildren.length; j++) {
//                        this.setupNodes(grandChildren[j]);
//                    }
//                    continue;
//                }
            }
        }
    };

    Tree.prototype.colorBySubfamily = function () {
        var colorSettings = new DefaultColorPreferences();
        var customColors = colorSettings.getCustomColors();
        var numColors = customColors.length;
        var subLeafSpecifier = colorSettings.getSubfamilyLeafSpecifier();
        var sfLeafColor = colorSettings.getSubfamilyLeafColor();

        var subfamilyCounter = 0;
        var previousSf = undefined;
        var handledSfLookup = new Hashtable();
        for (var i = 0; i < this.allNodes.length; i++) {
            var node = this.allNodes[i];
//            if ("AN1" === node.getAnnotationNodeId()) {
//                console.log("Here");
//            }
            if (true === node.isLeaf()) {
                continue;
            }
            var nextSf = this.getSubfamilyAncestor(node);
            if (undefined === nextSf) {
                continue;
            }
            if (undefined !== previousSf && (previousSf === nextSf)) {
                continue;
            }
            previousSf = nextSf;
            if (null !== handledSfLookup.get(nextSf)) {
                continue;
            }
            handledSfLookup.put(nextSf, nextSf);

            if (true === subLeafSpecifier && nextSf.isLeaf()) {
                this.setSubtreeColorForAllNonSfLeafNodes(nextSf, sfLeafColor);
            }
            else {
                var index = subfamilyCounter % numColors;
                this.setSubtreeColorForAllNonSfLeafNodes(nextSf, customColors[index]);
                subfamilyCounter++;
            }

        }

    };

    Tree.prototype.getSubfamilyAncestor = function (node) {
        if (null === node || undefined === node) {
            return undefined;
        }
        if (undefined !== node.getSubfamilyInfo()) {
            return node;
        }
        return this.getSubfamilyAncestor(node.getParent());
    };

    Tree.prototype.setSubtreeColorForAllNonSfLeafNodes = function (node, color) {
        if (undefined === node) {
            return;
        }

        node.setColor(color);
        var children = node.getChildren();
        if (undefined === children) {
            return;
        }

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (undefined !== child.getSubfamilyInfo()) {
                continue;
            }
            this.setSubtreeColorForAllNonSfLeafNodes(child, color);
        }
    };

    Tree.prototype.getNumNodes = function () {
        return this.orderedNodes.length;
    };

    Tree.prototype.getNodes = function () {
        return this.orderedNodes;
    };

    Tree.prototype.getAllNodes = function () {
        return this.allNodes;
    };


    Tree.prototype.setNodePositions = function (nodePos) {
        this.nodePositions = nodePos;
        var min = nodePos.length;
        if (this.orderedNodes.length < min) {
            min = this.orderedNodes.length;
        }
        for (var i = 0; i < min; i++) {
            this.orderedNodes[i].setPosition(this.nodePositions[i]);
            //console.log("Set position of node " + this.orderedNodes[i].getAnnotationNodeId() + " " + this.orderedNodes[i].getPosition().getY() + " height is " + this.orderedNodes[i].getPosition().getHeight());
        }
        if (this.view === 0) {
            this.calculateInternalNodePositions(this.currentRoot);
        }
        else {

            this.calculateNodePositions(this.currentRoot, 0);
        }
    };
    
    Tree.prototype.resetGraphObject = function() {
        this.graphObject = undefined;
    };
    
    
//    Tree.prototype.recalculateNodePositions = function() {
//        this.graphObject = undefined;
//        for (var i = 0; i < this.orderedNodes.length; i++) {
//            this.orderedNodes[i].setPosition(this.nodePositions[i]);
//            console.log("Set new position of node " + this.orderedNodes[i].getAnnotationNodeId() + " " + this.orderedNodes[i].getPosition().getY());
//        }
//        if (this.view === 0) {
//            this.calculateInternalNodePositions(this.currentRoot);
//        }
//        else {
//            this.calculateNodePositions(this.currentRoot, 0);
//        }
//    };

    Tree.prototype.getTreeHeight = function () {
        var lastNode = this.orderedNodes[this.orderedNodes.length - 1];
        var position = lastNode.getPosition();
        return position.getY() + position.getHeight();
    };
    
    Tree.prototype.calculateNodePositions = function (node, posIndex) {

        var posInfo = new RowTopHeight();
        var curPos = this.nodePositions[posIndex];
//        if (undefined == curPos) {
//            console.log("Here");
//        }
        posInfo.setY(curPos.getY());
        posInfo.setHeight(curPos.getHeight());
        node.setPosition(posInfo);
        //console.log("Index is " + posIndex + " Setting position of " + node.getAnnotationNodeId() + " of " + curPos.getY());
        if (true === node.isTerminus()) {
            return posIndex + 1;
        }
        
        
        var currentPos = posIndex + 1;
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            currentPos = this.calculateNodePositions(child, currentPos);
        }
        return currentPos;
    };

    Tree.prototype.calculateInternalNodePositions = function (node) {
        if (node.isTerminus()) {
            return;
        }
        var total = 0;
        var heights = 0;
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            this.calculateInternalNodePositions(children[i]);
        }

        var posInfo = new RowTopHeight();
        // if even
        if (children.length  % 2 === 0) {
            var topChild = children[0].getPosition();
            var bottomChild = children[children.length - 1].getPosition();
            var totalHeight = (bottomChild.getY() + bottomChild.getHeight()) - topChild.getY();

            //console.log("setting height " + (totalHeight + bottomChild.getHeight())/ children.length + " used to be " + topChild.getHeight());
            posInfo.setHeight(totalHeight / children.length);   //  posInfo.setHeight(topChild.getHeight());   
            posInfo.setY(((topChild.getY() + bottomChild.getY() + bottomChild.getHeight()) / 2) - (posInfo.getHeight() / 2) );
        }
        else {
            var middle = Math.floor((children.length + 1) / 2) - 1;
            var middlePos = children[middle].getPosition();
            
            posInfo.setY(middlePos.getY());
            posInfo.setHeight(middlePos.getHeight());        


        }
        node.setPosition(posInfo);
//        console.log("Setting position for internal node " + node.getAnnotationNodeId() + " " + posInfo.getY());
    };

    Tree.prototype.getTreeSVG = function (width) {
//        if (this.view === 0) {
            if (this.graphObject === undefined) {
                var calculatedObj = {backgroundStruct: "", treeStruct: "", markerStruct: ""};
                this.getSVGInfo(this.currentRoot, width, calculatedObj);
                this.graphObject = calculatedObj;
            }
            return this.graphObject.backgroundStruct + this.graphObject.treeStruct + this.graphObject.markerStruct;
//        }
//        else {
//            if (this.graphObject === undefined) {
//                var calculatedObj = {treeStruct: "", markerStruct: ""};
//                this.getSVGInfo(this.currentRoot, width, calculatedObj);
//                this.graphObject = calculatedObj;
//            }
//            
//            return this.graphObject.treeStruct + this.graphObject.markerStruct;
//        }
    };
    
    Tree.prototype.getGraphicSubfamilyInternalNode = function (x, y, height) {
        var yCoord = y + (height / 2);
        // Draw diamond
        var xstart = x - this.markerWidth;
        var yBottom = yCoord + this.markerWidth;
        var xEnd = x + this.markerWidth;
        var yTop = yCoord - this.markerWidth;
        var color = this.purple;
        
        return "<polygon points='" + xstart + "," + yCoord + " " +
                                     x + "," + yBottom + " " + 
                                     xEnd + "," + yCoord + " " + 
                                     x + "," + yTop + " " +                                      
                                     xstart + "," + yCoord + "' style='fill:" + color + "; stroke:black;stroke-width:1; '></polygon>";
    };
    
    
    
    Tree.prototype.getGraphicCollapsedRerootedSubfamily = function (x, y, height) {        
        return this.getGraphicCollapsed(x, y, height, this.purple);
    };
    
    Tree.prototype.getGraphicRerootedDuplication = function (x, y, height) {        
        return this.getGraphicRerooted(x, y, height, this.orange);
    };

    Tree.prototype.getGraphicRerootedHorizontalTransfer = function (x, y, height) {        
        return this.getGraphicRerooted(x, y, height, this.turquoise);
    };
    
    Tree.prototype.getGraphicRerootedNonDupHorizontalTransfer = function (x, y, height) {        
        return this.getGraphicRerooted(x, y, height, this.green);
    };
    
     Tree.prototype.getGraphicRerootedCollapsedNonSubfamily = function (x, y, height) {        
        return this.getGraphicRerooted(x, y, height, this.red);
    };    
    
    
    Tree.prototype.getGraphicCollapsed = function (x, y, height, color) {
        var yCoord = y + (height / 2);
        var xstart = x - this.markerWidth;
        var yBottom = yCoord + this.markerWidth;
        var xEnd = x + (this.markerWidth);
        var yTop = yCoord - this.markerWidth;
        
        return "<polygon points='" + xstart + "," + yCoord + " " +
                                     xEnd + "," + yBottom + " " + 
                                     xEnd + "," + yTop + " " +                                    
                                     xstart + "," + yCoord + "' style='fill:" + color + "; stroke:black;stroke-width:1; '></polygon>";
    };
    
    Tree.prototype.getGraphicRerooted = function (x, y, height, color) {
        var yCoord = y + (height / 2);
        var xstart = x - this.markerWidth;
        var yBottom = yCoord + this.markerWidth;
        var xEnd = x + (this.markerWidth);
        var yTop = yCoord - this.markerWidth;
        
        return "<polygon points='" + xstart + "," + yTop + " " +
                                     xstart + "," + yBottom + " " + 
                                     xEnd + "," + yCoord + " " +                                    
                                     xstart + "," + yTop + "' style='fill:" + color + "; stroke:black;stroke-width:1; '></polygon>";
    };    
    
    Tree.prototype.getGraphicExpandedDuplication = function (x, y, height) {
        return this.getGraphicCircle(x, y, height, this.orange);
    };
    
    Tree.prototype.getGraphicExpandedHozuzontalTransfer = function (x, y, height) {
        return this.getGraphicCircle(x, y, height, this.turquoise);
    };
    
    Tree.prototype.getGraphicExpandedNonDupHorTrans = function (x, y, height) {
        return this.getGraphicCircle(x, y, height, this.green);
    };

    Tree.prototype.getGraphicCollapsedNonSubfamily = function (x, y, height) {
        return this.getGraphicCollapsed(x, y, height, this.red);
    };    
    
    Tree.prototype.getGraphicCircle = function (x, y, height, color) {
        var yCoord = y + (height / 2);
        var xstart = x - this.markerWidth;
        var yBottom = yCoord + this.markerWidth;
        var xEnd = x + (this.markerWidth * 2);
        var yTop = yCoord - this.markerWidth;
        
        return "<circle + cx='" + xstart  + "'  cy='" + yCoord + "' r='" + this.markerWidth + "' stroke='black' stroke-width='1' fill='" + color + "'> </circle>";
    };     

//    Tree.prototype.detailSVG = function (node, width, graphObj) {
//        return this.getSVGInfo(node, width, graphObj);
//    };

    Tree.prototype.getSVGInfo = function (node, width, graphObj) {
//        if ('AN939' === node.getAnnotationNodeId()) {
//            console.log("Here");
//        }
        //var svgString = "";
        var nodePosition = node.getPosition();
        var nodeXCoord = ((node.getBranchLength() + node.getCumulativeBranchLength()) * this.scale) + this.imageOffset;
        var nodeYCoord = nodePosition.getY() + (nodePosition.getHeight() / 2);
        //var nodeXCoordStart = nodeXCoord;
        var nodeYCoordStart = nodeYCoord;
        
        if (undefined !== node.getBgColor()) {
          //  <rect x="100" y="100" width="100%" height="200" fill="yellow" stroke="black" stroke-width="3" />
           graphObj.backgroundStruct = graphObj.backgroundStruct + "<rect x='0' y='" + nodePosition.getY() + "' width='100%' height='" + nodePosition.getHeight()+ "' fill='" + node.getBgColor() + "' />\n";
        }
       
        
        if (this.currentRoot === node) {
                // Can't draw line from parent since we don't have one
        }
        else {
            // Draw line from parent to node
            var parent = node.getParent();
            var parentPosition = parent.getPosition();
            var parentXCoord = ((parent.getBranchLength() + parent.getCumulativeBranchLength()) * this.scale)  + this.imageOffset;
            var parentYCoord = parentPosition.getY() + (parentPosition.getHeight() / 2);
            
            var parentXCoordStart = parentXCoord;// + this.markerWidth;
            
            var parentYCoordStart = parentYCoord;
            var parentColor = parent.getColor();

            graphObj.treeStruct = graphObj.treeStruct + "<line x1='" + parentXCoordStart + "'  y1='" + parentYCoordStart + "'  x2='" + parentXCoordStart + "'  y2='" + nodeYCoordStart + "'" +
                    " style='stroke:" + parentColor + "; stroke-width:1' />\n" +
                    "<line x1='" + parentXCoordStart + "'  y1='" + nodeYCoordStart + "'  x2='" + nodeXCoord + "'  y2='" + nodeYCoord + "'" +
                    " style='stroke:" + parentColor + "; stroke-width:1' />\n";
            
            if (parentXCoord > nodeXCoord) {
//                console.log(node.getAnnotationNodeId() + " strange position");
            }
        }    
            
        var markerColor = this.getMarkerColor(node);
        var nodeColor = node.getColor();
        if (true === node.isSubfamily() && (true === node.isLeaf() || true == node.isExpanded())) {
            // Draw diamond
            var xstart = nodeXCoord - this.markerWidth;
            var yBottom = nodeYCoord + this.markerWidth;
            var xEnd = nodeXCoord + this.markerWidth;
            var yTop = nodeYCoord - this.markerWidth;
            graphObj.markerStruct = graphObj.markerStruct + "<polygon id='" + node.getAnnotationNodeId() + "' onmousedown='mouseDown(evt);' points='" + xstart + "," + nodeYCoord +  " " +  
                                                        nodeXCoord + "," + yBottom + " " +
                                                        xEnd + "," + nodeYCoord + " " +
                                                        nodeXCoord + "," + yTop + " " + 
                                                        xstart + "," + nodeYCoord + 
                                                        "' style='fill:" + markerColor + "; stroke:black;stroke-width:1;cursor: pointer;'><title>" + node.getLabel() + "</title></polygon>\n";
                                                
                                                
            //graphObj.markerStruct = graphObj.markerStruct + "<text x='" + (nodeXCoord + (this.markerWidth * 2)) + "' y='" + nodePosition.getY() + "' style='font-family: Arial, Helvetica, sans-serif;font-size:14px' fill='" + nodeColor + "'>" + node.getAnnotationNodeId() + "</text>\n";
        }
        else if (false === node.isLeaf()) {
            if (this.currentRoot === node && this.currentRoot !== this.root) {
                // Draw triangle
                var xstart = nodeXCoord - this.markerWidth;
                var yBottom = nodeYCoord + this.markerWidth;
                var xEnd = nodeXCoord + this.markerWidth;
                var yTop = nodeYCoord - this.markerWidth;
                graphObj.markerStruct = graphObj.markerStruct + "<polygon id='" + node.getAnnotationNodeId() + "' onmousedown='mouseDown(evt);' points='" + xstart + "," + yTop +  " " +  
                                                        xstart + "," + yBottom + " " +
                                                        xEnd + "," + nodeYCoord + " " +
                                                        xstart + "," + yTop + 
                                                        "' style='fill:" + markerColor + "; stroke:black;stroke-width:1;cursor: pointer;'><title>" + node.getLabel() + "</title></polygon>\n";
            }
            else {
                if (true == node.isTerminus()) {
                    // If node is collapsed, draw a red triangle with point touching the end of the branch
                    
                // Draw triangle
                var xstart = nodeXCoord;
                var yBottom = nodeYCoord + this.markerWidth;
                var xEnd = nodeXCoord + (this.markerWidth * 2);
                var yTop = nodeYCoord - this.markerWidth;
                graphObj.markerStruct = graphObj.markerStruct + "<polygon id='" + node.getAnnotationNodeId() + "' onmousedown='mouseDown(evt);' points='" + xstart + "," + nodeYCoord +  " " +  
                                                            xEnd + "," + yBottom + " " +
                                                            xEnd + "," + yTop + " " + 
                                                            xstart + "," + nodeYCoord + 
                                                            "' style='fill:" + markerColor + "; stroke:black;stroke-width:1;cursor: pointer;'><title>" + node.getLabel() + "</title></polygon>\n";                    
                    
                    
                    
                    
                    
                }
                else {
                // Draw circle
                graphObj.markerStruct = graphObj.markerStruct + "<circle id='" + node.getAnnotationNodeId() + "' onmousedown='mouseDown(evt);' cx='" + nodeXCoord  + "'  cy='" + nodeYCoord + "' r='" + this.markerWidth + "' stroke='black' stroke-width='1' fill='" + markerColor + "' cursor='pointer' >  <title>" + node.getTooltip() + "</title> </circle>\n";
                }
            }

            
        }
        if (true === node.isTerminus()) {
            // Draw Label
            var textPos = nodePosition.getY() + (nodePosition.getHeight() / 2);
            //console.log("Text pos for " + node.getLabel() + " is " + textPos);
            if (this.view === 1) {
                if (true == node.isLeaf()) {
                    graphObj.markerStruct = graphObj.markerStruct + "<text x='" + (nodeXCoord + (this.markerWidth * 2)) + "' y='" + textPos + "' style='font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height: 16px;line-height: 16px;dominant-baseline: middle;' fill='" + nodeColor + "'>" + node.getLeafNodeInfo().getOrganism() + " </text>\n";
                }
                else {
                    var nodeText = node.getReferenceSpeciationEvent();
                    if (undefined === nodeText) {
                        nodeText = node.getAnnotationNodeId();
                    }
                    graphObj.markerStruct = graphObj.markerStruct + "<text x='" + (nodeXCoord + (this.markerWidth * 2)) + "' y='" + textPos + "' style='font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height: 16px;dominant-baseline: middle;' fill='" + nodeColor + "'>" + nodeText + "</text>\n";                    
                }
            }
            else {
                graphObj.markerStruct = graphObj.markerStruct + "<text x='" + (nodeXCoord + (this.markerWidth * 2)) + "' y='" + textPos + "' style='font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height: 16px;dominant-baseline: middle;' fill='" + nodeColor + "'>" + node.getLabel() + " </text>\n";
            }
            return;
        }
        else if (this.view === 1 && false === node.isTerminus()) {
                var textPos = nodePosition.getY() + (nodePosition.getHeight() / 2);
                //console.log("Text pos for " + node.getLabel() + " is " + textPos);
                var nodeText = node.getReferenceSpeciationEvent();
                if (undefined === nodeText) {
                    nodeText = node.getAnnotationNodeId();
                }
                graphObj.markerStruct = graphObj.markerStruct + "<text x='" + (nodeXCoord + (this.markerWidth * 2)) + "' y='" + textPos + "' style='font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height: 16px;dominant-baseline: middle;' fill='" + nodeColor + "'>" + nodeText + "</text>\n";
        }
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            this.getSVGInfo(children[i], width, graphObj);
        }
    };
    

    


    Tree.prototype.getMarkerColor = function (node) {
        if (undefined !== node.getSubfamilyInfo()) {
            return this.purple;
        }
        if (false === node.isExpanded()) {
            return this.red;
        }
        if (true === node.isDuplication()) {
            return this.orange;
        }
        if (true === node.isHorizontalTransfer()) {
            return this.turquoise;
        }
        return this.green;
    };
    
    Tree.prototype.collapseExpand = function(annotationNodeId) {
        var node = this.findNode(this.currentRoot, annotationNodeId);
        if (null === node) {
            return;
        }
        if (node.isLeaf()) {
            return;
        }
        node.setExpanded(!(node.isExpanded()));
        this.setNodeOrdering();
        this.setNodePositions(this.nodePositions);
    };
    
    Tree.prototype.reroot = function(annotationNodeId) {
        var node = this.findNode(this.currentRoot, annotationNodeId);
        if (null === node) {
            return;
        }
        if (node.isLeaf()) {
            return;
        }
        this.currentRoot =  node;
        this.setNodeOrdering();
        this.setNodePositions(this.nodePositions);
    };
    
    Tree.prototype.findNode = function(curNode, annotationNodeId) {
        if (curNode.getAnnotationNodeId() === annotationNodeId) {
            return curNode;
        }
        if (false === curNode.isExpanded) {
            return null;
        }
        var children = curNode.getChildren();
        if (undefined === children) {
            return null;
        }
        var searchNode = null;
        for (var i = 0; i < children.length; i++) {
            searchNode = this.findNode(children[i], annotationNodeId);
            if (null === searchNode) {
                continue;
            }
            if (searchNode.getAnnotationNodeId() === annotationNodeId) {
                return searchNode;
            }
        }
        return null;
    };
    
    Tree.prototype.toggleView = function() {
        if (this.view === 0) {
            this.view = 1;
        } 
        else {
            this.view = 0;
        }
        this.orderedNodes.length = 0;
        this.allNodes.length = 0;
        this.setupNodes(this.currentRoot);
        this.graphObject = undefined;
        this.setNodePositions(this.nodePositions);
    };
    
    Tree.prototype.moveToTop = function(node) {
        node.moveToTop(node);
        this.setNodeOrdering();
        this.setNodePositions(this.nodePositions);        
    };     
    
    Tree.prototype.expandSfSelectSf = function(sfList) {
        var selectedNodesList = [];
        
        for (var i = 0; i < this.allNodes.length; i++) {
            var curNode = this.allNodes[i];
            curNode.setBgColor(undefined);
            
            if (false === curNode.isSubfamily()) {
                continue;
            }
            var sfInfo = curNode.getSubfamilyInfo();
            var sfId = sfInfo.getSubfamilyId();
            for (var j = 0; j < sfList.length; j++) {
                if (sfList[j] !== sfId) {
                    continue;
                } 
                // complete
                curNode.getDescendent(curNode, selectedNodesList);
                selectedNodesList.push(curNode);
                curNode.expandAllNodes(curNode);
            }
        }
        for (var i = 0; i < selectedNodesList.length; i++) {
            selectedNodesList[i].setBgColor(this.backgroundColor);
        }
        this.setNodeOrdering();
        this.setNodePositions(this.nodePositions);
        return selectedNodesList;
    };

    // Use annotation node id
    Tree.prototype.expandSfSelectSeq = function(seqList) {
        var selectedNodesList = [];
        for (var i = 0; i < this.allNodes.length; i++) {
            var curNode = this.allNodes[i];
            curNode.setBgColor(undefined);
            
            var idInfo = curNode.getLeafNodeInfo();
            if (undefined === idInfo) {
                continue;
            }
            
            var seqId = idInfo.getNodeName();
            for (var j = 0; j < seqList.length; j++) {
                var parts = seqId.split("|");
                var found = false;
                if (seqList[j] === seqId) {
                    found = true;
                }
                // full sequence match or match gene part for example in HUMAN|HGNC=15469|UniProtKB=O75061, we are looking for HGNC=15469
                if (false == found && (parts != null && parts != undefined && parts.length >= 3 && (seqList[j] == parts[1]))) {
                    found = true;
                } 
                if (false == found) {
                    continue;
                }
                curNode.setBgColor(this.backgroundColor);
                selectedNodesList.push(curNode);
                var sfAncestor = this.getSubfamilyAncestor(curNode);
                if (sfAncestor !== undefined && sfAncestor !== null) {
                    sfAncestor.setExpanded(true);
                }
            }
        }
        this.setNodeOrdering();
        this.setNodePositions(this.nodePositions);
        return selectedNodesList;
    };
};






