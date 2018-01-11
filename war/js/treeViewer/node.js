function Node() {
    this.annotationNodeId;
    this.originalNodeOrder;             // Ordering between this node and siblings
    this.leafNodeInfo;
    this.branchLength = 0;
    this.cumulativeBranchLength = 0;
    this.subfamilyInfo;
    this.propagatedSfName;
    this.eventType;
    this.referenceSpeciationEvent;
    this.numLeavesInTree;              // NumleavesinTree is the number of descendants including leaves - not just count of leaf nodes
    this.nodeType;
    this.mf;
    this.bp;
    this.cc;
    this.pc;
    this.color = "rgb(0, 0, 0)";
    this.backgroundColor = undefined;
    this.tooltip;
    
    this.parent;
    
 
    this.expanded = true;
    this.children;
    this.position;
    
    this.nodeTypeDuplication = "DUPLICATION";//"1>0";
    this.nodeTypeHorizontalTransfer = "HORIZONTAL_TRANSFER";//"0>0";  TODO WRONG!!!! Need to fix
    
    Node.prototype.getColor = function() {
        return this.color;
    };
    
    Node.prototype.setColor = function(colr) {
        this.color = colr;
    };
    
    Node.prototype.getBgColor = function() {
        return this.backgroundColor;
    };
    
    Node.prototype.setBgColor = function(colr) {
        this.backgroundColor = colr;
    };
    
    Node.prototype.getBranchLength = function() {
        return this.branchLength;
    };
    
    Node.prototype.getCumulativeBranchLength = function() {
        return this.cumulativeBranchLength;
    };
    
    Node.prototype.isDuplication = function() {
        if (undefined === this.nodeType) {
            return false;
        }
        var index = this.nodeType.indexOf(this.nodeTypeDuplication);
        if (index < 0) {
            return false;
        }
        return true;
    };
    
    Node.prototype.isHorizontalTransfer = function() {
        if (undefined === this.nodeType) {
            return false;
        }
        var index = this.nodeType.indexOf(this.nodeTypeHorizontalTransfer);
        if (index < 0) {
            return false;
        }
        return true;        
    };

    Node.prototype.setPosition = function(rowTopHeight) {
        this.position = rowTopHeight;
    };
    
    Node.prototype.getPosition = function() {
        return this.position;
    };
    
    Node.prototype.getAnnotationNodeId = function() {
        return this.annotationNodeId;
    };
    
    Node.prototype.getOriginalNodeOrder = function() {
        return this.originalNodeOrder;
    };
    
    Node.prototype.getLeafNodeInfo = function() {
        return this.leafNodeInfo;
    };
    
    Node.prototype.getSubfamilyInfo = function() {
        return this.subfamilyInfo;
    };
    
    Node.prototype.getPropagatedSfName = function() {
        return this.propagatedSfName;
    };
    
    Node.prototype.getEventType = function() {
        return this.eventType;
    };

    Node.prototype.getReferenceSpeciationEvent = function() {
        return this.referenceSpeciationEvent;
    };
    
    // NumleavesinTree is the number of descendants including leaves - not just count of leaf nodes
    Node.prototype.getNumLeavesInTree = function() {
        return this.numLeavesInTree;
    };
    
    // NumleavesinTree is the number of descendants including leaves - not just count of leaf nodes
    Node.prototype.setNumLeavesInTree = function(numLeaves) {
        this.numLeavesInTree = numLeaves;
    };
    
    Node.prototype.getMf = function() {
        return this.mf;
    };
    
    Node.prototype.getBp = function() {
        return this.bp;
    };
    
    Node.prototype.getCc = function() {
        return this.cc;
    };
    
    Node.prototype.getPc = function() {
        return this.pc;
    };
    
    Node.prototype.setChildren = function(children) {
        this.children = children;
    };
    
    Node.prototype.getChildren = function() {
        return  this.children;
    };
    
    Node.prototype.setExpanded = function (isExpanded) {
        this.expanded = isExpanded;
    };
    
    Node.prototype.isExpanded = function() {
        return this.expanded;
    };
    
    Node.prototype.isLeaf = function() {
        if (undefined === this.children || 0 === this.children.length) {
            return true;
        }
        return false;
    };
    
    Node.prototype.isTerminus = function() {
        if (true === this.isLeaf() || false === this.isExpanded()) {
            return true;
        }
        return false;
    };
    
    Node.prototype.isSubfamily = function() {
//        if (this.annotationNodeId === "AN207") {
//            console.log("Here");
//        }
        if (undefined !== this.subfamilyInfo) {
            return true;
        }
        return false;
    };
    
    Node.prototype.getParent = function() {
        return this.parent;
    };
    
    Node.prototype.getDescendent = function(node, list) {
        if (null === node) {
            return;
        }
        var children = node.getChildren();
        if (undefined !== children) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                list.push(child);
                this.getDescendent(child, list);
            }
        }
    };
    
    Node.prototype.moveToTop = function(node) {
        if (null === node) {
            return;
        }
        var parent = node.getParent();
        if (null === parent || undefined === parent) {
            return;
        }
        var siblings = parent.getChildren();
        if (null === siblings) {
            return;
        }
        for (var i = 0; i < siblings.length; i++) {
            if (siblings[i] === node) {
                if (i === 0) {
                    break;
                }
                var temp = siblings[0];               
                siblings[0] = siblings[i];
                siblings[i] = temp;
                break;
            }
        }
        this.moveToTop(parent);
    };
    
    Node.prototype.getDescendentSfList = function(node, includeNode) {
        var descendents = [];
        this.getDescendent(node, descendents);
        
        if (true === includeNode) {
            descendents.push(node);
        }
        
        var descendentSf = [];
        for (var i = 0; i < descendents.length; i++) {
            var aDesc = descendents[i];
            if (undefined === aDesc.getSubfamilyInfo()) {
                continue;
            }
            descendentSf.push(aDesc);
        }
        if (descendentSf.length === 0) {
            return undefined;
        }
        return descendentSf;
    };
    
    Node.prototype.expandAllSubfamilyNodes = function (node) {
        var allSf = this.getDescendentSfList(node, true);
        if (undefined === allSf) {
            return;
        }
        for (var i = 0; i < allSf.length; i++) {
            var aDesc = allSf[i];
            aDesc.setExpanded(true);
        }
    };
    
    Node.prototype.expandAllNodes = function(node) {
        node.setExpanded(true);
//        if (node.getAnnotationNodeId() === 'AN278') {
//            console.log("Here");
//        }
        if (undefined === node.children) {
            return;
        }
        for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
//            if (undefined === child) {
//                console.log("Here");
//            }
            child.setExpanded(true);
            this.expandAllNodes(child);
        }
    };
    
    Node.prototype.collapseLowestLevelSf = function (node) {
        var allSf = this.getDescendentSfList(node, true);
        if (undefined === allSf) {
            return;
        }
        
        var sfForCollapseTbl = new Hashtable();
        for (var i = 0; i < allSf.length; i++) {
            var aDesc = allSf[i];
            var descSfList = this.getDescendentSfList(aDesc, false);
            if (undefined === descSfList) {
                sfForCollapseTbl.put(aDesc, aDesc);
            }
        }
        this.colapseLowestLevelSfNode(sfForCollapseTbl);
    };
    
    Node.prototype.colapseLowestLevelSfNode = function(sfForcollapseTbl) {
        var nodes = sfForcollapseTbl.keys(); 
        if (undefined === nodes) {
            return;
        }
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].setExpanded(false);
        }
    };
    
    
    Node.prototype.getLabel = function() {
        if (undefined !== this.getSubfamilyInfo()) {
//            if ("SF26" === this.getSubfamilyInfo().getSubfamilyId()) {
//                console.log("Here");
//            }
            return this.getSubfamilyInfo().getSubfamilyId() + "-" + this.getSubfamilyInfo().getSubfamilyName()+ " (" + this.getAnnotationNodeId() + ")";
        }
        if (undefined !== this.getLeafNodeInfo()) {
            var sfAncestor = this.getSubfamilyAncestor(this);
            if (undefined !== sfAncestor && null !== sfAncestor && undefined !== sfAncestor.getSubfamilyInfo()) {
                return sfAncestor.getSubfamilyInfo().getSubfamilyId() + "-" + this.getLeafNodeInfo().getNodeSpeciesGeneSymbolDisplay() + " (" + this.getAnnotationNodeId() + ")";
            }
            else {
                return this.getLeafNodeInfo().getNodeSpeciesGeneSymbolDisplay() + " (" + this.getAnnotationNodeId() + ")";
            }
        }
        return this.getAnnotationNodeId();
    };
    
    Node.prototype.getSubfamilyAncestor = function(node) {
        if (undefined === node) {
            return undefined;
        }
        if (undefined !== node.getSubfamilyInfo()) {
            return node;
        }
        return this.getSubfamilyAncestor(node.getParent());
    };
    
    Node.prototype.getTooltip = function() {
        if (undefined !== this.tooltip) {
            return this.tooltip;
        }
        var sfAncestor = this.getSubfamilyAncestor(this);
        var leafNodeInfo = this.getLeafNodeInfo();
        if (undefined === sfAncestor) {
            if (undefined === leafNodeInfo) {
                this.tooltip = this.getAnnotationNodeId();
                return this.tooltip;
            }
            this.tooltip = this.getAnnotationNodeId() + "-" + leafNodeInfo.getNodeName();
            return this.tooltip;
        }
        var sfInfo = sfAncestor.getSubfamilyInfo();
        this.tooltip = this.getAnnotationNodeId() + " Member of subfamily " + sfInfo.getSubfamilyId() + " " + sfInfo.getSubfamilyName();
        return this.tooltip;
    };
    
    Node.prototype.parse = function(node, jsNode, anToNodeLookup) {
        node.annotationNodeId = jsNode.accession;
        //console.log("Parsing node " +  node.annotationNodeId);
        anToNodeLookup.put(node.annotationNodeId, node);
        node.mf = jsNode.MF;
        node.bp = jsNode.BP;
        node.cc = jsNode.CC;
        node.pc =  jsNode.PC;
        node.referenceSpeciationEvent = jsNode.reference_speciation_event;
        node.eventType = jsNode.event_type;
        node.nodeType =  jsNode.node_type;
        node.branchLength = parseFloat(jsNode.branch_length);
        if (undefined !== node.parent) {
            node.cumulativeBranchLength = node.parent.cumulativeBranchLength + node.parent.branchLength;
        }
        
        // Handle subfamily information
        var sfId = jsNode.sf_id;
        if (undefined !== sfId) {
            var subfamily = new Subfamily();
            var index = sfId.indexOf(":");
            if (index >= 0) {
                sfId = sfId.substring(index + 1, sfId.length);
            }
            subfamily.setSubfamilyId(sfId);
            subfamily.setSubfamilyName(jsNode.sf_name);
            node.subfamilyInfo = subfamily;
        }
        var sfName = jsNode.sf_name;
        if (undefined !== sfName) {
            node.propagatedSfName = sfName;
        };
        
        // Children
        var children = jsNode.children;
        if (undefined === children) {
            var leafNodeInfo = new LeafNodeInfo();
            node.leafNodeInfo = leafNodeInfo;
            leafNodeInfo.definition = jsNode.definition;
            leafNodeInfo.geneId = jsNode.gene_id;
            leafNodeInfo.geneSymbol = jsNode.gene_symbol;
            leafNodeInfo.organism = jsNode.organism;
            leafNodeInfo.nodeName = jsNode.node_name;
            return;
        }
        node.children = [];
        var childList = children.annotation_node_asArray;
        for (var i = 0; i < childList.length; i++) {
            var child = new Node();
            child.parent = node;
            child.originalNodeOrder = i;
            node.children.push(child);
            node.parse(child, childList[i], anToNodeLookup);
        }
    };
};


function Subfamily() {
    this.subfamilyId;
    this.subfamilyName;
    
    Subfamily.prototype.getSubfamilyId = function() {
        return this.subfamilyId;
    };
    
    Subfamily.prototype.setSubfamilyId = function(sfId) {
        this.subfamilyId = sfId;
    };
    
     Subfamily.prototype.getSubfamilyName = function() {
        return this.subfamilyName;
    };
    
    Subfamily.prototype.setSubfamilyName = function(sfName) {
        this.subfamilyName = sfName;
    };
};


function LeafNodeInfo() {
    this.nodeName;
    this.geneId;
    this.geneSymbol;
    this.organism;
    this.definition;
    
    LeafNodeInfo.prototype.getNodeName = function() {
        return this.nodeName;
    };
    
    LeafNodeInfo.prototype.getGeneId = function() {
        return this.geneId;
    };
    
    LeafNodeInfo.prototype.getGeneSymbol = function() {
        return this.geneSymbol;
    };
    
    LeafNodeInfo.prototype.getOrganism = function() {
        if (undefined != this.organism) {
            return this.organism;
        }
        if (undefined != this.nodeName) {
            var parts = this.nodeName.split("|");
            if (0 < parts.length) {
                return parts[0];
            }
        }
        return "";
    };
    
    LeafNodeInfo.prototype.getDefinition = function() {
        return this.definition;
    };
    LeafNodeInfo.prototype.getNodeSpeciesGeneSymbolDisplay = function() {
        var parts = this.nodeName.split("|");
        if (0 < parts.length) {
            if (null != this.geneSymbol && undefined != this.geneSymbol) {
                return parts[0] + "_" + this.geneSymbol;
            }
            else {
                return parts[0];
            }
        }
        return this.nodeName;
    }
};


