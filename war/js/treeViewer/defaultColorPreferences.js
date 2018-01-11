function DefaultColorPreferences() {
    this.subfamilyLeafSpecifier = true;
    this.subFamilyLeafColor = "rgb(0,0,0)";
    this.customColors = ["rgb(0, 0, 255)","rgb(255, 0, 0)","rgb(0, 128, 0)","rgb(255, 0, 255)","rgb(128, 0, 0)"];
    
    this.selectedColor = "rgb(207, 226, 245)";
    
    DefaultColorPreferences.prototype.getSubfamilyLeafSpecifier = function() {
        return this.subfamilyLeafSpecifier;
    };
    
    DefaultColorPreferences.prototype.getSubfamilyLeafColor = function() {
        return this.subFamilyLeafColor;
    };
    
    DefaultColorPreferences.prototype.getCustomColors = function() {
        return this.customColors;
    };
    
    DefaultColorPreferences.prototype.getSelectedColor = function() {
        return this.selectedColor;
    };   
};


