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
package edu.usc.ksom.pm.panther.pantherdb.treeViewer;

import edu.usc.ksom.pm.panther.pantherdb.MSA.MSAParser;
import edu.usc.ksom.pm.panther.pantherdb.dataModel.ReducedTree;
import edu.usc.ksom.pm.panther.pantherdb.dataModel.AnnotationNode;
import edu.usc.ksom.pm.panther.pantherdb.dataModel.MSA;
import edu.usc.ksom.pm.panther.pantherdb.dataModel.Tree;
import edu.usc.ksom.pm.panther.pantherdb.util.LibraryHelper;
import java.util.HashMap;
import java.util.List;


public class TreeManager {

    public static Tree getTree(String book) {
        if (null == book) {
            return null;
        }
        
        String url = LibraryHelper.getURLTreeFile(book);
        List<String> contents = edu.usc.ksom.pm.panther.pantherdb.util.Utils.readFromURL(url);
        if (null == contents) {
            return null;
        }
        return TreeParser.getTree(book, contents);        
    }
    
   
    
    public static MSA getMSA(String book) {
        String url = LibraryHelper.getURLForMSA(book);
        
        List<String> seqInfo = edu.usc.ksom.pm.panther.pantherdb.util.Utils.readFromURL(url);
        return MSAParser.getMSA(book, seqInfo);
    }
}
