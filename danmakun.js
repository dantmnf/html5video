/* 
Danmakun - everything about danmaku.
 */


danmakun = function(selector) {
    this.$_ = $(selector);
    this.dom = $_[0];
    
    this.danmakuPool = [];
    this.danmakuInDisplay = [];
    this.ctx = this.dom.getContext("2d");
    this.bufferCvs = document.createElement("canvas");
    this.bufferCtx = this.bufferCvs.getContext("2d");
    this.settings = {};
    
};

danmakun.prototype.loadSettings =function() {
    /*
    { "danmakuAlpha":0.8,
      "danmakuStroke":0.4,
      "danmakuShadow":true,
      "danmakuSpeed":6000, //in millseconds
      "danmakuFontSize":"24px",
      "danmakuFontFace":"sans-serif" }
     */
    //require json
    xmlhttp_ldset = new XMLHttpRequest();
    xmlhttp_ldset.onreadystatechange = function() {
        if(xmlhttp_ldset.readyState == 4 && xmlhttp_ldset.status == 200) {
            this.settings = JSON.parse(xmlhttp_ldset.responseText);
            xmlhttp_ldset = null;
        }
    };
    xmlhttp_ldset.open("GET", "userconf.php?type=danmaku&random="+Math.random(),true);
    xmlhttp_ldset.send();
};

danmakun.prototype.fillPool = function() {
    /*
     * [{ "at":100, //in millseconds
     *    "type":0,   //0-normal,1-top,2-bottom,3-backward,4-special
     *    "size":24,
     *    "color":"#fff"
     *    "x":0,
     *    "y":0,
     *    "duration":0, //for special
     *    "poster":"admin",
     *    "content":"233" }]
     */
    var response;
    //TODO: require json
    xmlhttp_fpool = new XMLHttpRequest();
    xmlhttp_fpool.onreadystatechange = function() {
        if(xmlhttp_fpool.readyState == 4 && xmlhttp_fpool.status == 200) {
            this.danmakuPool = JSON.parse(xmlhttp_fpool.responseText);
            xmlhttp_fpool = null;
        }
    };
    xmlhttp_fpool.open("GET", "danmaku.php?type=fillpool&av="+video.id+"&random="+Math.random(),true);
    xmlhttp_fpool.send();
};

danmakun.prototype.update = function() {
    
};