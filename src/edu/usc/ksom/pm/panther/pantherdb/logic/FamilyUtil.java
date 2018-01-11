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
package edu.usc.ksom.pm.panther.pantherdb.logic;

import edu.usc.ksom.pm.panther.pantherdb.dataModel.Family;
import edu.usc.ksom.pm.panther.pantherdb.util.LibraryHelper;
import edu.usc.ksom.pm.panther.pantherdb.util.Utils;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class FamilyUtil {
    public static final String STR_EMPTY = "";
    public static final String STRING_PATTERN_BOOK_PANTHER = "PTHR[0-9]{5}";
    public static final Pattern PATTERN_BOOK_PANTHER = Pattern.compile(STRING_PATTERN_BOOK_PANTHER);
        
    /**
     * Get ids of families from library.  
     * @return 
     */
    public static List<Family> getFamilies() {
        List<String> infoStr = Utils.readFromURL(LibraryHelper.getURLFamilies());
        if (null == infoStr) {
            return null;
        }
        String familyListStr = String.join(STR_EMPTY, infoStr);
        Matcher matcher = PATTERN_BOOK_PANTHER.matcher(familyListStr);
        ArrayList<Family> familyList = new ArrayList<Family>();
        HashSet<String> famSet = new HashSet<String>();
        while (matcher.find()) {
            String accession = matcher.group();
            if (false == famSet.contains(accession)) {
                Family fam = new Family();
                fam.setAccession(matcher.group());
                familyList.add(fam);
                famSet.add(accession);
            }
        }
        return familyList;
    }
}
