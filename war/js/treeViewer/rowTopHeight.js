function RowTopHeight() {
    this.height;
    this.y;

    RowTopHeight.prototype.setHeight = function(height) {
        this.height = height;
    };

    RowTopHeight.prototype.setY = function(y) {
        this.y = y;
    };

    RowTopHeight.prototype.getHeight = function() {
        return this.height;
    };            

    RowTopHeight.prototype.getY = function() {
        return this.y;
    };
} 


