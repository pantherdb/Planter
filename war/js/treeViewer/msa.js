function MSA() {
    
    this.matchPositions = [];           // array length equal to length of first sequence.  True for upper case and '-' else false
    this.tallyLookup = [];              // array length equal to length of first sequence.  Each entry is a hashtable.
    
    this.titleDisplayFullSeq;
    this.titleDisplayMatchState;
    
    this.sequenceList = [];
    
    this.annotIdToSeq = new Hashtable();
    this.annotIdToMatchStateSeq = new Hashtable();
    this.nodeNameToWeight = new Hashtable();
    this.msafullSeqLength;
    this.weightInfoAvailable = false;
    this.selectedIndex = -1;
    this.selectedAminoAcidStartPos = -1;
    this.selectedAminoAcidEndPos = -1;
    
    this.positionInterval = 25;
    this.characterWidth;
    
    this.view_full = 0;
    this.view_match_state = 1;
    this.view_history = 2;
    this.currentView = this.view_full;
    
    this.threshold = [80, 60, 40];
    this.colors = ["rgb(21, 138, 255)", "rgb(185, 220, 255)", "rgb(220, 233, 255)"];
    this.color_white = "rgb(255,255,255)";
    this.color_black = "rgb(0,0,0)";
    this.color_selected_index = "rgb(255,204,204)";
    this.color_selected_amino_acid_pos = "rgb(255, 255, 0)";
    this.color_history_dif_text = "rgb(255,0,0)";
    
    this.dot = ".";
    this.dash = "-";
  
    
    
    MSA.prototype.setSelectedIndex = function (selectedIndex) {
        if (selectedIndex < -1) {
            return;
        }
        this.selectedIndex = selectedIndex - 1;
    };
    
    MSA.prototype.setAminoAcidRange = function(selectedStartPos, selectedEndPos) {
        if (selectedStartPos < -1 || selectedEndPos < 1 || selectedEndPos < selectedStartPos) {
            return;
        }
        this.selectedAminoAcidStartPos = selectedStartPos - 1;
        this.selectedAminoAcidEndPos = selectedEndPos - 1;
    };
    
    // Return lowest positive position - can either be msa position or amino acid position
    MSA.prototype.getMinSelectedIndexRange = function() {
        var min = this.selectedIndex;
        if (this.selectedAminoAcidStartPos > 0 && min < 0) {
            return this.selectedAminoAcidStartPos;
        }
        if (min > 0 && this.selectedAminoAcidStartPos > 0) {
            return Math.min(min, this.selectedAminoAcidStartPos);
        }
        else {
            return min;
        }
    };
    // Does not work returns same character width as canvas element
//    MSA.prototype.getScrollPos = function() {
//        var minIndex = this.getMinSelectedIndexRange();
//        if (minIndex < 0) {
//            return -1;
//        }
//        $('body').append('<div id="msa_check"></div>');
//        var $elem = "<span id='msa_check_span' style=' font-size:14px; font-family: monospace;'>W</span>";
//        $("#msa_check").append($elem);
//        var width = $('#msa_check_span').width();
//        $('body').remove("#msa_check");
//        return width * minIndex;
//    };
    
    MSA.prototype.getColorPercentIdentity = function (char, index) {
        if (null === char || null === index || index > this.matchPositions.length) {
            return undefined;
        }
        if (char === "." || char === "-") {
            return this.color_white;
        }
        var lookup = this.tallyLookup[index];
        if (null === lookup) {
            return undefined;
        }
        var numEntries = lookup.get(char);
        var percentage = (numEntries / this.sequenceList.length) * 100;
        for (var i = 0; i < this.threshold.length; i++) {
            if (percentage > this.threshold[i]) {
                return this.colors[i];
            }
        }
        return this.color_white;
    };
    
    MSA.prototype.getSeqDisplay = function(annotId, parentAnnotId) {
        if (this.currentView === this.view_history && undefined !== parentAnnotId) {
            return this.getHistoryDisplay(annotId, parentAnnotId);
        }
        var displayStr = "";
        var sequence = this.annotIdToSeq.get(annotId);
        var previousColor = undefined;
        for (var i = 0; i < sequence.length; i++) {
            if (this.currentView === this.view_match_state && false === this.matchPositions[i]) {
                continue;
            }
            var char = sequence.charAt(i);
            var color = null;
            if (i === this.selectedIndex) {
                color = this.color_selected_index;
            }
            else if (this.selectedAminoAcidStartPos <= i && i <= this.selectedAminoAcidEndPos &&this.currentView !== this.view_match_state) {
                color = this.color_selected_amino_acid_pos;
            }            
            else {
                color = this.getColorPercentIdentity(char, i);
            }
            if (color === previousColor) {
                displayStr += char;
            }
            else {
                if (displayStr.length > 0) {
                    displayStr += "</span>";
                }
                displayStr += "<span style=' font-size:14px; font-family: monospace; background-color: " + color + ";'>";
                displayStr += char;
            }
            previousColor = color;
        }
        return displayStr;
    };
    
    MSA.prototype.getHistoryDisplay = function(annotId, parentAnnotId) {
        var displayStr = "";
        var sequence = this.annotIdToSeq.get(annotId);
        var parentSeq = this.annotIdToSeq.get(parentAnnotId);
        var previousColor = undefined;
        var previousTxtColor = undefined;
        for (var i = 0; i < sequence.length; i++) {

            var char = sequence.charAt(i);
            var pChar = undefined;
            var diff = false;
            if (parentSeq !== undefined) {
                pChar = parentSeq.charAt(i);
                if (char !== pChar) {
                    diff = true;
                }
            }
            var color = null;
            if (i === this.selectedIndex) {
                color = this.color_selected_index;
            }
            else if (this.selectedAminoAcidStartPos <= i && i <= this.selectedAminoAcidEndPos && this.currentView !== this.view_match_state) {
                color = this.color_selected_amino_acid_pos;
            }
            else {
                color = this.getColorPercentIdentity(char, i);
            }
            var textColor = undefined;
            if (true == diff) {
                textColor = this.color_history_dif_text;
            }
            if (color === previousColor && textColor === previousTxtColor) {
                displayStr += char;
            }
            else {
                if (displayStr.length > 0) {
                    displayStr += "</span>";
                }
                if (false === diff) {
                    displayStr += "<span style=' font-size:14px; font-family: monospace;background-color: " + color + ";'>";
                    displayStr += char;
                }
                else {
                    displayStr += "<span style=' font-size:14px; font-family: monospace;background-color: " + color + "; color: " + textColor + ";'>";
                    displayStr += char;
                }
            }
            previousColor = color;
            previousTxtColor = textColor;

        }
        return displayStr;
    };
    
    
//    MSA.prototype.setFullSeqHeader = function(fullSeqHeader) {
//        this.titleDisplayFullSeq = fullSeqHeader;
//    };
    
    MSA.prototype.getFullSeqHeader = function() {
        return this.titleDisplayFullSeq;
    };
    
//    MSA.prototype.setMatchStateHeader = function(matchSeqHeader) {
//       this. titleDisplayMatchState = matchSeqHeader;
//    };
    
    MSA.prototype.getMatchSeqHeader = function() {
        return this.titleDisplayMatchState;
    };
    
    MSA.prototype.setViewDefault = function() {
        this.currentView = this.view_full;
    };
    
    MSA.prototype.setViewMatchState = function() {
        this.currentView = this.view_match_state;
    };
    
    MSA.prototype.setViewHistory = function() {
        this.currentView = this.view_history;
    };
    
    MSA.prototype.getCurrentView = function() {
        return this.currentView;
    };
    
    MSA.prototype.setCharacterWidth = function(width) {
        this.characterWidth = width;
    };
    
    MSA.prototype.getCharacterWidth = function() {
        return this.characterWidth;
    };
    
    MSA.prototype.getWidth = function() {
        var viewSeq = this.titleDisplayFullSeq;
        if (this.view_match_state === this.currentView) {
            viewSeq = this.titleDisplayMatchState;
        }
        //console.log("Number of charactes is " + viewSeq.length);
        return this.characterWidth * viewSeq.length;
    };
    
    MSA.prototype.getSeqLength = function() {
        var viewSeq = this.titleDisplayFullSeq;
        if (this.view_match_state === this.currentView) {
            viewSeq = this.titleDisplayMatchState;
        }
        return viewSeq.length;
    };
    
    MSA.prototype.getTitle = function() {
        if (this.view_match_state === this.currentView) {
            return this.titleDisplayMatchState;
        }
        return this.titleDisplayFullSeq;
    };
    
    MSA.prototype.getSeq = function(annotId) {
        return this.annotIdToSeq.get(annotId);
    };
    
    MSA.prototype.getAminoAcidAlignPos = function(annotId, aminoAcidPos) {
        var pos = aminoAcidPos - 1;
        if (pos < 0) {
            return -1;
        }
        var sequence = this.annotIdToSeq.get(annotId);
        if (null === sequence || undefined === sequence || sequence.length < aminoAcidPos) {
            return -1;
        }
        var counter = 0;
        if (null !== sequence && undefined !== sequence) {
            for (var i = 0; i < sequence.length; i++) {
                var char = sequence.charAt(i);
                if (this.dot === char) {
                    continue;
                }
                if (this.dash === char) {
                    continue;
                }
                if (counter === pos) {
                    return i + 1;
                }
                counter++;
            }
        }
        return -1;
    };
        
    MSA.prototype.parse = function(seqList, weightList) {
        this.sequenceList = seqList.annotation_node_asArray;
        for (var i = 0; i < this.sequenceList.length; i++) {
            var seqInfo = this.sequenceList[i];
            var annotationNode = seqInfo.accession;
            var index = annotationNode.indexOf(":");
            if (index >= 0) {
                annotationNode = annotationNode.substring(index + 1, annotationNode.length);
            }
            var sequence = seqInfo.sequence;
            var fullHeader = [];
            var matchStateHeader = [];
            this.annotIdToSeq.put(annotationNode, sequence);
            if (i === 0) {
                this.msafullSeqLength = sequence.length;
                var matchPositionLength = 0;
                for (var j = 0; j < this.msafullSeqLength; j++) {
                    var current = sequence.charAt(j);
                    if (current === ".") {
                        this.matchPositions[j] = false;
                    }
                    else if (current === "-") {
                        this.matchPositions[j] = true;
                        matchPositionLength++;
                    }
                    else if (current === current.toUpperCase()) {
                        this.matchPositions[j] = true;
                        matchPositionLength++;
                    }
                    else {
                        this.matchPositions[j] = false;
                    }
                    
                    this.tallyLookup[j] = new Hashtable();
                    if (j > 0 && ((j + 1) % this.positionInterval === 0)) {
                        fullHeader.push("|");
                        var value = (j + 1).toString();
                        for (var k = 0; k < value.length; k++) {
                            intervalChar = value[value.length - 1 - k];
                            fullHeader[fullHeader.length - 2 - k] = intervalChar;
                        } 
                    }
                    else {
                        fullHeader.push(" ");
                    }
                    if (true === this.matchPositions[j]) {
                        if (matchPositionLength > 0 && (matchPositionLength + 1) % this.positionInterval === 0) {
                            matchStateHeader.push("|");
                            var value = (matchPositionLength + 1).toString();
                            for (var k = 0; k < value.length; k++) {
                                intervalChar = value[value.length - 1 - k];
                                matchStateHeader[fullHeader.length - 2 - k] = intervalChar;
                            }
                        }
                        else {
                            matchStateHeader.push(" ");
                        }
                    }
                }
                this.titleDisplayFullSeq = fullHeader.join("");
                this.titleDisplayMatchState = matchStateHeader.join("");
            }

            for (var j = 0; j < this.msafullSeqLength; j++) {
                var currentTalley = this.tallyLookup[j];
                var currentChar = sequence.charAt(j);
                
                // Tally unnecessary for dots and dashes
                if (currentChar === "." || currentChar === "-") {
                    continue;
                }
                var value = currentTalley.get(currentChar);
                if (value === null) {
                    currentTalley.put(currentChar, 1);
                }
                else {
                    currentTalley.put(currentChar, value + 1);
                }
            }
            
        }
        if (null === weightList || undefined === weightList) {
           return; 
        }
        this.weightInfoAvailable = true;
        for (var i = 0; i < weightList.length; i++) {
            var current = weightList[i];
            var nodeName = current.annotation_node_name;
            var weight = current.weight;
            this.nodeNameToWeight.put(nodeName, parseFloat(weight));
        }
    };
    
    function isLetter(char) {
        var code = char.charCodeAt();
        if (((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122))) {
            return true;
        }
        return false;
    };
};


