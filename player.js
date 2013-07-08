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
    $(".size-video").height(window.frameElement.height - $("#videoController").height() - $("#progressBar").height());
    testCanvas();
    vdo = new videoPlayer("#myVideo");
    $("#playpause").click(function() {
        vdo.togglePlayPause();
    });
    
};


testCanvas = function() {
    var ctx = $("#myCvs")[0].getContext("2d");
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(0,0,0,0.6)";
/*    ctx.moveTo(10, 10);
    ctx.lineTo(150, 50);
    ctx.lineTo(10, 50);
    ctx.stroke();*/
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.fillText("这不科学！", 100, 60);
    ctx.strokeText("这不科学！", 100, 60);
    
};


$(document).ready(onReady);
