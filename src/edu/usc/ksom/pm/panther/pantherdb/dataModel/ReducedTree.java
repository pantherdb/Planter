/**
 *  Copyright 2018 University Of Southern California
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package edu.usc.ksom.pm.panther.pantherdb.dataModel;

import edu.usc.ksom.pm.panther.pantherdb.treeViewer.TreeManager;
import edu.usc.ksom.pm.panther.pantherdb.util.PantherGeneHelper;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Vector;


public class ReducedTree implements ITree{
    private String familyId;
    private String[] speciesList;
    private boolean infoValid = false;
    private String errorMsg = null;
    private AnnotationNode root = null;
    private HashSet treeNodes = null;
    private HashMap<String, AnnotationNode> nodeLookup;
    private long durationTreeInfo = -1;
    
    public static final String MSG_INVALID_BOOK_ID = "Invalid book id specified";
    public static final String MSG_SPECIES_LIST_INVALID = "Invalid species list";
    public static final String MSG_INVALID_SPECIES_SPECIFIED_PART_1 = "Invalid species specified ";
    public static final String MSG_UNABLE_TO_RETRIEVE_TREE = "Unable to retrieve tree";
    public static final String MSG_NO_NODES_IN_TREE_AFTER_REMOVAL = "No nodes in tree, after reducing nodes";
    


    
    public ReducedTree(String familyId, String[] speciesList) {
        this.familyId = familyId;
        this.speciesList = speciesList;
        
        // Get the tree
        Tree tree = TreeManager.getTree(familyId);
        if (null == tree) {
            return;
        }
        
        AnnotationNode treeRoot = tree.getRoot();
        if (null == treeRoot) {
            infoValid = false;
            errorMsg = MSG_UNABLE_TO_RETRIEVE_TREE;
            return;
        }        
                
        if (null == speciesList || 0 == speciesList.length) {
            infoValid = true;
            root = tree.getRoot();
            nodeLookup = tree.getNodeLookup();
            return;
        }
        
        // Get the species that should go into the tree and put into a set
        HashSet<String> speciesSet = new HashSet<String>(Arrays.asList(speciesList));
        
        // Determine which leaf nodes should be removed
        HashSet<AnnotationNode> nodeSet = new HashSet();
        HashSet removeSet = new HashSet();
        getTreeNodes(treeRoot, nodeSet, removeSet, speciesSet);
        
        Iterator removeIter = removeSet.iterator();
        while (removeIter.hasNext()) {
            AnnotationNode removeNode = (AnnotationNode)removeIter.next();
            removeNode(nodeSet, removeNode, treeRoot);
        }
        if (true == nodeSet.isEmpty() || null == treeRoot) {
            infoValid = false;
            errorMsg = MSG_NO_NODES_IN_TREE_AFTER_REMOVAL;
            return;
        }
        AnnotationNode origRoot = treeRoot;
        removeNonLeafSingleNodes(treeRoot, nodeSet);        // sets tree root, if it has to be updated
        if (root == null) {
            root = origRoot;
        }
        if (true == nodeSet.isEmpty() || null == root) {
            infoValid = false;
            errorMsg = MSG_NO_NODES_IN_TREE_AFTER_REMOVAL;
            return;
        }
        treeNodes = nodeSet;
        nodeLookup = new HashMap<String, AnnotationNode> ();
        for (AnnotationNode an: nodeSet) {
            String id = an.getAnnotationNodeId();
            if (null == id) {
                continue;
            }
            nodeLookup.put(id, an);
        }

        infoValid = true;
    }
    
    private void getTreeNodes(AnnotationNode an, HashSet<AnnotationNode> nodeSet, HashSet<AnnotationNode> removeSet, HashSet<String> speciesSet) {
        //System.out.println("Traversing now we have " + an.getAnnotationNodeId() + " " + an.getNodeName());
        if (null == an) {
            return;
        }
        nodeSet.add(an);
        String longName = an.getNodeName();
        if (null != longName && 0 != longName.length()) {
            PantherGeneHelper pgh = new PantherGeneHelper(longName);
            String organism = pgh.getOrganism();
            if (null == organism || false == speciesSet.contains(organism)) {
                removeSet.add(an);
            }
        }
        Vector children = an.getChildren();
        if (null == children) {
            return;
        }
        for (int i = 0; i < children.size(); i++) {
            AnnotationNode child = (AnnotationNode)children.get(i);
            getTreeNodes(child, nodeSet, removeSet, speciesSet);
        }
    }
    
    private void removeNode(HashSet nodeSet, AnnotationNode removeNode, AnnotationNode currentRoot) {
        if (null == removeNode) {
            return;
        }
        //System.out.println("Removing " + removeNode.getAnnotationNodeId());        
        nodeSet.remove(removeNode);        
        AnnotationNode parent = removeNode.getParent();
        if (null == parent) {
            currentRoot = parent;
            return;
        }
        Vector children = parent.getChildren();
        if (null == children) {
            String longName = parent.getGeneId();
            if (null == longName || 0 == longName.length()) {
                removeNode(nodeSet, parent, currentRoot);
            }
            return;
        }
        children.remove(removeNode);
        if (true == children.isEmpty()) {
            parent.setChildren(null);
            String longName = parent.getNodeName();
            if (null == longName || 0 == longName.length()) {
                removeNode(nodeSet, parent, currentRoot);
            }
        }
//        else if (1 == children.size()) {
//            AnnotationNode child = (AnnotationNode)children.get(0);
//            AnnotationNode grandParent = parent.getParent();
//            if (null == grandParent) {
//                currentRoot = child;
//                nodeSet.remove(parent);
//            }
//            else {
//                child.setParent(grandParent);
//                grandParent.getChildren().setElementAt(child, grandParent.getChildren().indexOf(parent));
//                removeNode(nodeSet, parent, currentRoot);
//            }
//        }
    }
    
    public void removeNonLeafSingleNodes(AnnotationNode node, HashSet nodeSet) {
        Vector children = node.getChildren();
        
        if (null == children || children.isEmpty()) {
            return;
        }
        int numChildren = children.size();
        if (1 == numChildren) {
            AnnotationNode parent = node.getParent();
            AnnotationNode onlyChild = (AnnotationNode)children.get(0);
            if (null == parent) {
                nodeSet.remove(node);
                onlyChild.setParent(null);
                root = onlyChild;
            }
            else {
                onlyChild.setBranchLength(Double.toString(Double.parseDouble(parent.getBranchLength()) + Double.parseDouble(onlyChild.getBranchLength())));            
                nodeSet.remove(node);
                onlyChild.setParent(parent);                
                parent.getChildren().setElementAt(onlyChild, parent.getChildren().indexOf(node));
            }
            
        }
        for (int i = 0; i < numChildren; i++) {
            removeNonLeafSingleNodes((AnnotationNode)children.get(i), nodeSet);
        }
    }
    
    
    public String getFamilyId() {
        return familyId;
    }

    public String[] getSpeciesList() {
        return speciesList;
    }

    public boolean isInfoValid() {
        return infoValid;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public HashSet getTreeNodes() {
        return treeNodes;
    }


    public long getDurationTreeInfo() {
        return durationTreeInfo;
    }
    
    public static void main(String args[]) {
        ReducedTree rt = new ReducedTree("PTHR11461", new String[]{"HUMAN", "RAT", "MOUSE", "XENTR", "DANRE", "DROME", "ANOGA", "CAEEL", "CAEBR", "PRIPA", "YEAST", "CANAL", "SCHPO", "CHICK", "DICDI", "ARATH", "ECOLI", "BACSU"});
    }

    @Override
    public AnnotationNode getRoot() {
        return root;
    }

    @Override
    public HashMap<String, AnnotationNode> getNodeLookup() {
        return nodeLookup;
    }

    @Override
    public String getId() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
}
