/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/*A class to control <video> elements with jQuery*/
videoPlayer = function(selector){
  this.jq = $(selector);
  this.dom = this.jq[0];
  
  
  //TODO
};

videoPlayer.prototype.togglePlayPause = function () {
    if(this.dom.paused) {
        this.dom.play();
    } else {
        this.dom.pause();
    }
};

onReady = function() {
    testCanvas();
    vdo = new videoPlayer("#myVideo");
    $("#playpause").click(function() {
        vdo.togglePlayPause();
    });
};


testCanvas = function() {
    var ctx = $("#myCvs")[0].getContext("2d");
    ctx.shadowBlur = 20;
    ctx.shadowColor = "green";
/*    ctx.moveTo(10, 10);
    ctx.lineTo(150, 50);
    ctx.lineTo(10, 50);
    ctx.stroke();*/
    ctx.font = "20px Georgia";
    ctx.fillText("Hello World!", 100, 60);
};


$(document).ready(onReady);
