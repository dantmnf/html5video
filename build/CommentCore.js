/** 
 Comment Filters/Filter Lang
 Licensed Under MIT License
 **/

function CommentFilter() {
    this.rulebook = {"all": []};
    this.modifiers = [];
    this.runtime = null;
    this.allowTypes = {
        "1": true,
        "4": true,
        "5": true,
        "6": true,
        "7": true,
        "17": true
    };
    this.doModify = function(cmt) {
        for (var k = 0; k < this.modifiers.length; k++) {
            cmt = this.modifiers[k](cmt);
        }
        return cmt;
    };
    this.isMatchRule = function(cmtData, rule) {
        switch (rule['operator']) {
            case '==':
                if (cmtData[rule['subject']] == rule['value']) {
                    return false;
                }
                ;
                break;
            case '>':
                if (cmtData[rule['subject']] > rule['value']) {
                    return false;
                }
                ;
                break;
            case '<':
                if (cmtData[rule['subject']] < rule['value']) {
                    return false;
                }
                ;
                break;
            case 'range':
                if (cmtData[rule['subject']] > rule.value.min && cmtData[rule['subject']] < rule.value.max) {
                    return false;
                }
                ;
                break;
            case '!=':
                if (cmtData[rule['subject']] != rule.value) {
                    return false;
                }
                break;
            case '~':
                if (new RegExp(rule.value).test(cmtData[rule[subject]])) {
                    return false;
                }
                break;
            case '!~':
                if (!(new RegExp(rule.value).test(cmtData[rule[subject]]))) {
                    return false;
                }
                break;
        }
        return true;
    };
    this.beforeSend = function(cmt) {
        //Check with the rules upon size
        var cmtMode = cmt.data.mode;
        if (this.rulebook[cmtMode] != null) {
            for (var i = 0; i < this.rulebook[cmtMode].length; i++) {
                if (this.rulebook[cmtMode][i].subject == 'width' || this.rulebook[cmtMode][i].subject == 'height') {
                    if (this.rulebook[cmtMode][i].subject == 'width') {
                        switch (this.rulebook[cmtMode][i].operator) {
                            case '>':
                                if (this.rulebook[cmtMode][i].value < cmt.offsetWidth)
                                    return false;
                                break;
                            case '<':
                                if (this.rulebook[cmtMode][i].value > cmt.offsetWidth)
                                    return false;
                                break;
                            case 'range':
                                if (this.rulebook[cmtMode][i].value.max > cmt.offsetWidth && this.rulebook[cmtMode][i].min < cmt.offsetWidth)
                                    return false;
                                break;
                            case '==':
                                if (this.rulebook[cmtMode][i].value == cmt.offsetWidth)
                                    return false;
                                break;
                            default:
                                break;
                        }
                    } else {
                        switch (this.rulebook[cmtMode][i].operator) {
                            case '>':
                                if (this.rulebook[cmtMode][i].value < cmt.offsetHeight)
                                    return false;
                                break;
                            case '<':
                                if (this.rulebook[cmtMode][i].value > cmt.offsetHeight)
                                    return false;
                                break;
                            case 'range':
                                if (this.rulebook[cmtMode][i].value.max > cmt.offsetHeight && this.rulebook[cmtMode][i].min < cmt.offsetHeight)
                                    return false;
                                break;
                            case '==':
                                if (this.rulebook[cmtMode][i].value == cmt.offsetHeight)
                                    return false;
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            return true;
        } else {
            return true;
        }
    }
    this.doValidate = function(cmtData) {
        if (!this.allowTypes[cmtData.mode])
            return false;
        /** Create abstract cmt data **/
        abstCmtData = {
            text: cmtData.text,
            mode: cmtData.mode,
            color: cmtData.color,
            size: cmtData.size,
            stime: cmtData.stime,
            hash: cmtData.hash,
        }
        if (this.rulebook[cmtData.mode] != null && this.rulebook[cmtData.mode].length > 0) {
            for (var i = 0; i < this.rulebook[cmtData.mode]; i++) {
                if (!this.isMatchRule(abstCmtData, this.rulebook[cmtData.mode][i]))
                    return false;
            }
        }
        for (var i = 0; i < this.rulebook[cmtData.mode]; i++) {
            if (!this.isMatchRule(abstCmtData, this.rulebook[cmtData.mode][i]))
                return false;
        }
        return true;
    };
    this.addRule = function(rule) {
        if (this.rulebook[rule.mode + ""] == null)
            this.rulebook[rule.mode + ""] = [];
        /** Normalize Operators **/
        switch (rule.operator) {
            case 'eq':
            case 'equals':
            case '=':
                rule.operator = '==';
                break;
            case 'ineq':
                rule.operator = '!=';
                break;
            case 'regex':
            case 'matches':
                rule.operator = '~';
                break;
            case 'notmatch':
            case 'iregex':
                rule.operator = '!~';
                break;
        }
        this.rulebook[rule.mode].push(rule);
        return (this.rulebook[rule.mode].length - 1);
    };
    this.addModifier = function(f) {
        this.modifiers.push(f);
    };
    this.runtimeFilter = function(cmt) {
        if (this.runtime == null)
            return cmt;
        return this.runtime(cmt);
    };
    this.setRuntimeFilter = function(f) {
        this.runtime = f;
    }
}/** 
 Comment Space Allocators Classes
 Licensed Under MIT License
 You may create your own.
 **/
function CommentSpaceAllocator(w, h) {
    this.width = w;
    this.height = h;
    this.dur = 4000;
    this.pools = [[]];
    this.pool = this.pools[0];
    this.setBounds = function(w, h) {
        this.width = w;
        this.height = h;
    };
    this.add = function(cmt) {
        if (cmt.height >= this.height) {
            cmt.cindex = this.pools.indexOf(this.pool);
            cmt.y = 0;
        } else {
            cmt.cindex = this.pools.indexOf(this.pool);
            cmt.y = this.setY(cmt);
        }
    };
    this.remove = function(cmt) {
        var tpool = this.pools[cmt.cindex];
        tpool.remove(cmt);
    };
    this.validateCmt = function(cmt) {
        cmt.bottom = cmt.offsetTop + cmt.offsetHeight;
        cmt.y = cmt.offsetTop;
        cmt.x = cmt.offsetLeft;
        cmt.right = cmt.offsetLeft + cmt.offsetWidth;
        cmt.height = cmt.offsetHeight;
        cmt.width = cmt.offsetWidth;
        cmt.y = cmt.offsetTop;
        cmt.x = cmt.offsetLeft;
        return cmt;
    };
    this.setY = function(cmt, index) {
        if (!index)
            var index = 0;
        cmt = this.validateCmt(cmt);
        if (this.pools.length <= index) {
            this.pools.push([]);
        }
        this.pool = this.pools[index];
        if (this.pool.length == 0) {
            this.pool.push(cmt);
            return 0;
        }
        else if (this.vCheck(0, cmt)) {
            this.pool.binsert(cmt, function(a, b) {
                if (a.bottom < b.bottom) {
                    return -1;
                } else if (a.bottom == b.bottom) {
                    return 0;
                } else {
                    return 1;
                }
            });
            return cmt.y;
        }
        var y = 0;
        for (var k = 0; k < this.pool.length; k++) {
            y = this.pool[k].bottom + 1;
            if (y + cmt.offsetHeight > this.height) {
                break;
            }
            if (this.vCheck(y, cmt)) {
                this.pool.binsert(cmt, function(a, b) {
                    if (a.bottom < b.bottom) {
                        return -1;
                    } else if (a.bottom == b.bottom) {
                        return 0;
                    } else {
                        return 1;
                    }
                });
                return cmt.y;
            }
        }
        this.setY(cmt, index + 1);
    };
    this.vCheck = function(y, cmt) {
        var bottom = y + cmt.height;
        var right = cmt.x + cmt.width;
        this.validateCmt(cmt);
        for (var i = 0; i < this.pool.length; i++) {
            this.pool[i] = this.validateCmt(this.pool[i]);
            if (this.pool[i].y > bottom || this.pool[i].bottom < y)
                continue;
            else if (this.pool[i].right < cmt.x || this.pool[i].x > right) {
                if (this.getEnd(this.pool[i]) < this.getMiddle(cmt))
                    continue;
                else
                    return false;
            } else {
                return false;
            }
        }
        cmt.y = y;
        cmt.bottom = cmt.height + y;
        return true;
    };
    this.getEnd = function(cmt) {
        return cmt.stime + cmt.ttl;
    };
    this.getMiddle = function(cmt) {
        return cmt.stime + (cmt.ttl / 2);
    };
}
function TopCommentSpaceAllocator(w, h) {
    var csa = new CommentSpaceAllocator(w, h);
    csa.add = function(cmt) {
        csa.validateCmt(cmt);
        cmt.x = (csa.width - cmt.width) / 2;
        if (cmt.height >= csa.height) {
            cmt.cindex = csa.pools.indexOf(csa.pool);
            cmt.y = 0;
        } else {
            cmt.cindex = csa.pools.indexOf(csa.pool);
            cmt.y = csa.setY(cmt);
        }
    };
    csa.vCheck = function(y, cmt) {
        var bottom = y + cmt.height;
        for (var i = 0; i < csa.pool.length; i++) {
            var c = csa.validateCmt(csa.pool[i]);
            if (c.y > bottom || c.bottom < y) {
                continue;
            } else {
                return false;
            }
        }
        cmt.y = y;
        cmt.bottom = cmt.bottom + y;
        return true;
    };
    this.setBounds = function(w, h) {
        csa.setBounds(w, h);
    };
    this.add = function(what) {
        csa.add(what);
    };
    this.remove = function(d) {
        csa.remove(d);
    };
}
function BottomCommentSpaceAllocator(w, h) {
    var csa = new CommentSpaceAllocator(w, h);
    csa.add = function(cmt) {
        cmt.y = "";
        cmt.bottom = 0;
        csa.validateCmt(cmt);
        cmt.x = (csa.width - cmt.width) / 2;
        if (cmt.height >= csa.height) {
            cmt.cindex = csa.pools.indexOf(csa.pool);
            cmt.bottom = 0;
        } else {
            cmt.cindex = csa.pools.indexOf(csa.pool);
            cmt.bottom = csa.setY(cmt);
        }
    };
    csa.validateCmt = function(cmt) {
        cmt.y = csa.height - (cmt.offsetTop + cmt.offsetHeight);
        cmt.bottom = cmt.y + cmt.offsetHeight;
        cmt.x = cmt.offsetLeft;
        cmt.right = cmt.offsetLeft + cmt.offsetWidth;
        cmt.height = cmt.offsetHeight;
        cmt.width = cmt.offsetWidth;
        cmt.y = cmt.y;
        cmt.x = cmt.offsetLeft;
        return cmt;
    };
    csa.vCheck = function(y, cmt) {
        var bottom = y + cmt.height;
        for (var i = 0; i < csa.pool.length; i++) {
            var c = csa.validateCmt(csa.pool[i]);
            if (c.y > bottom || c.bottom < y) {
                continue;
            } else {
                return false;
            }
        }
        cmt.y = y;
        cmt.bottom = cmt.bottom + y;
        return true;
    };
    this.setBounds = function(w, h) {
        csa.setBounds(w, h);
    };
    this.add = function(what) {
        csa.add(what);
    };
    this.remove = function(d) {
        csa.remove(d);
    };
}
function ReverseCommentSpaceAllocator(w, h) {
    var csa = new CommentSpaceAllocator(w, h);
    csa.vCheck = function(y, cmt) {
        var bottom = y + cmt.height;
        var right = cmt.x + cmt.width;
        this.validateCmt(cmt);
        for (var i = 0; i < this.pool.length; i++) {
            var c = this.validateCmt(this.pool[i]);
            if (c.y > bottom || c.bottom < y)
                continue;
            else if (c.x > right || c.right < cmt.x) {
                if (this.getEnd(c) < this.getMiddle(cmt))
                    continue;
                else
                    return false;
            } else {
                return false;
            }
        }
        cmt.y = y;
        cmt.bottom = cmt.height + y;
        return true;
    }
    this.setBounds = function(w, h) {
        csa.setBounds(w, h);
    };
    this.add = function(what) {
        csa.add(what);
    };
    this.remove = function(d) {
        csa.remove(d);
    };
}
function BottomScrollCommentSpaceAllocator(w, h) {
    var csa = new CommentSpaceAllocator(w, h);
    csa.validateCmt = function(cmt) {
        cmt.y = csa.height - (cmt.offsetTop + cmt.offsetHeight);
        cmt.bottom = cmt.y + cmt.offsetHeight;
        cmt.x = cmt.offsetLeft;
        cmt.right = cmt.offsetLeft + cmt.offsetWidth;
        cmt.height = cmt.offsetHeight;
        cmt.width = cmt.offsetWidth;
        cmt.y = cmt.y;
        cmt.x = cmt.offsetLeft;
        return cmt;
    };
    csa.add = function(cmt) {
        cmt.y = "";
        cmt.bottom = 0;
        csa.validateCmt(cmt);
        cmt.x = csa.width;
        if (cmt.height >= csa.height) {
            cmt.cindex = csa.pools.indexOf(csa.pool);
            cmt.bottom = 0;
        } else {
            cmt.cindex = csa.pools.indexOf(csa.pool);
            cmt.bottom = csa.setY(cmt);
        }
    };
    this.setBounds = function(w, h) {
        csa.setBounds(w, h);
    };
    this.add = function(what) {
        csa.add(what);
    };
    this.remove = function(d) {
        csa.remove(d);
    };
}/******
 * CommentCoreLibrary (github.com/jabbany/CommentCoreLibrary)
 *  - Licensed under the MIT license
 * Modified for <canvas> by dantmnf, used in project html5video(github.com/dantmnf/html5video)
 ******/

var ABGlobal = {
    is_webkit: function() {
        /*try {
            if (/webkit/.test(navigator.userAgent.toLowerCase()))
                return true;
        } catch (e) {
            return false;
        }*/
        return false;
    }
};


CmtDivWrapper = function() {
    
};


Array.prototype.remove = function(obj) {
    for (var a = 0; a < this.length; a++)
        if (this[a] == obj) {
            this.splice(a, 1);
            break;
        }
};
Array.prototype.bsearch = function(what, how) {
    if (this.length == 0)
        return 0;
    if (how(what, this[0]) < 0)
        return 0;
    if (how(what, this[this.length - 1]) >= 0)
        return this.length;
    var low = 0;
    var i = 0;
    var count = 0;
    var high = this.length - 1;
    while (low <= high) {
        i = Math.floor((high + low + 1) / 2);
        count++;
        if (how(what, this[i - 1]) >= 0 && how(what, this[i]) < 0) {
            return i;
        } else if (how(what, this[i - 1]) < 0) {
            high = i - 1;
        } else if (how(what, this[i]) >= 0) {
            low = i;
        } else
            console.error('Program Error');
        if (count > 1500)
            console.error('Too many run cycles.');
    }
    return -1;
};
Array.prototype.binsert = function(what, how) {
    this.splice(this.bsearch(what, how), 0, what);
};
/****** Load Core Engine Classes ******/
function CommentManager(stageObject) {
    var __timer = 0;
    var lastpos = 0;
    this.stage = stageObject;
    this.def = {opacity: 1};
    this.timeline = [];
    this.runline = [];
    this.position = 0;
    this.limiter = 0;
    this.filter = null;
    this.csa = {
        scroll: new CommentSpaceAllocator(0, 0),
        top: new TopCommentSpaceAllocator(0, 0),
        bottom: new BottomCommentSpaceAllocator(0, 0),
        reverse: new ReverseCommentSpaceAllocator(0, 0),
        scrollbtm: new BottomScrollCommentSpaceAllocator(0, 0)
    };
    
    this.bufferCanvas = document.createElement("canvas");
    
    /** Private **/
    this.initCmt = function(cmt, data) {
        //cmt.className = 'cmt';
        //if (ABGlobal.is_webkit() && data.mode < 7)
            //cmt.className += " webkit-helper";
        cmt.stime = data.stime;
        cmt.mode = data.mode;
        cmt.data = data;
        if (cmt.mode == 17) {

        } else {
            //cmt.appendChild(document.createTextNode(data.text));
            cmt.innerText = data.text;
            cmt.fontSize = data.size + "px";
        }
        if (data.font != null && data.font != '')
            cmt.fontFamily = data.font;
        if (data.shadow == false && data.shadow != null)
            cmt.className = 'cmt noshadow';
        if (data.color != null)
            cmt.color = data.color;
        if (data.color == "#000000")
            cmt.className += " rshadow"
        if (this.def.opacity != 1 && data.mode == 1)
            cmt.opacity = this.def.opacity;
        if (data.alphaFrom != null)
            cmt.opacity = data.alphaFrom;
        cmt.ttl = 4000;
        cmt.dur = 4000;
        return cmt;
    };
    this.startTimer = function() {
        if (__timer > 0)
            return;
        var lastTPos = new Date().getTime();
        var cmMgr = this;
        __timer = window.setInterval(function() {
            var elapsed = new Date().getTime() - lastTPos;
            lastTPos = new Date().getTime();
            cmMgr.onTimerEvent(elapsed, cmMgr);
        }, 10);
    };
    this.stopTimer = function() {
        window.clearInterval(__timer);
        __timer = 0;
    };
}

/** Public **/
CommentManager.prototype.seek = function(time) {
    this.position = this.timeline.bsearch(time, function(a, b) {
        if (a < b.stime)
            return -1
        else if (a > b.stime)
            return 1;
        else
            return 0;
    });
};
CommentManager.prototype.validate = function(cmt) {
    if (cmt == null)
        return false;
    return this.filter.doValidate(cmt);
};
CommentManager.prototype.load = function(a) {
    this.timeline = a;
    this.timeline.sort(function(a, b) {
        if (a.stime > b.stime)
            return 2;
        else if (a.stime < b.stime)
            return -2;
        else {
            if (a.date > b.date)
                return 1;
            else if (a.date < b.date)
                return -1;
            else if (a.dbid != null && b.dbid != null) {
                if (a.dbid > b.dbid)
                    return 1;
                else if (a.dbid < b.dbid)
                    return -1;
                return 0;
            } else
                return 0;
        }
    });
};
CommentManager.prototype.clear = function() {
    for (var i = 0; i < this.runline.length; i++) {
        this.finish(this.runline[i]);
        //this.stage.removeChild(this.runline[i]);
    }
    this.runline = [];
};
CommentManager.prototype.setBounds = function() {
    for (var comAlloc in this.csa) {
        this.csa[comAlloc].setBounds(this.stage.getContext("2d").width, this.stage.getContext("2d").height);
    }
};
CommentManager.prototype.init = function() {
    this.setBounds();
    if (this.filter == null)
        this.filter = new CommentFilter(); //Only create a filter if none exist
};
CommentManager.prototype.time = function(time) {
    time = time - 1;
    if (this.position >= this.timeline.length || Math.abs(this.lastPos - time) >= 2000) {
        this.seek(time);
        this.lastPos = time;
        if (this.timeline.length <= this.position)
            return;
    } else
        this.lastPos = time;
    for (; this.position < this.timeline.length; this.position++) {
        if (this.validate(this.timeline[this.position]) && this.timeline[this.position]['stime'] <= time)
            this.sendComment(this.timeline[this.position]);
        else
            break;
    }
};
CommentManager.prototype.sendComment = function(data) {
    var cmt = new CmtDivWrapper;
    if (this.filter != null) {
        data = this.filter.doModify(data);
        if (data == null)
            return;
    }
    cmt = this.initCmt(cmt, data);
    //this.stage.appendChild(cmt);
    cmt.width = (cmt.offsetWidth + 1);
    cmt.height = (cmt.offsetHeight - 3);
    cmt.x = this.stage.getContext("2d").width;
    if (this.filter != null && !this.filter.beforeSend(cmt)) {
        //this.stage.removeChild(cmt);
        cmt = null;
        return;
    }
    switch (cmt.mode) {
        default:
        case 1:
            {
                this.csa.scroll.add(cmt);
            }
            break;
        case 2:
            {
                this.csa.scrollbtm.add(cmt);
            }
            break;
        case 4:
            {
                this.csa.bottom.add(cmt);
            }
            break;
        case 5:
            {
                this.csa.top.add(cmt);
            }
            break;
        case 6:
            {
                this.csa.reverse.add(cmt);
            }
            break;
        case 17:
        case 7:
            {
                cmt.y = data.y;
                cmt.x = data.x;
                cmt.ttl = data.duration;
                cmt.dur = data.duration;
                if (data.rY != 0 || data.rZ != 0) {
                    /** TODO: revise when browser manufacturers make up their mind on Transform APIs **/
                    //cmt.style.transformOrigin = "0% 0%";
                    /*cmt.style.webkitTransformOrigin = "0% 0%";
                    cmt.style.OTransformOrigin = "0% 0%";
                    cmt.style.MozTransformOrigin = "0% 0%";
                    cmt.style.MSTransformOrigin = "0% 0%";*/
                    //cmt.style.transform = "rotateY(" + (data.rY > 180 && data.rY < 270 ? (0 - data.rY) : data.rY) + "deg) rotateZ(" + (data.rZ > 180 && data.rZ < 270 ? (0 - data.rZ) : data.rZ) + "deg)";
                    cmt.transformY = (data.rY > 180 && data.rY < 270 ? (0 - data.rY) : data.rY);
                    cmt.transformZ = (data.rZ > 180 && data.rZ < 270 ? (0 - data.rZ) : data.rZ);
                    /*cmt.style.webkitTransform = "rotateY(" + (data.rY > 180 && data.rY < 270 ? (0 - data.rY) : data.rY) + "deg) rotateZ(" + (data.rZ > 180 && data.rZ < 270 ? (0 - data.rZ) : data.rZ) + "deg)";
                    cmt.style.OTransform = "rotateY(" + (data.rY > 180 && data.rY < 270 ? (0 - data.rY) : data.rY) + "deg) rotateZ(" + (data.rZ > 180 && data.rZ < 270 ? (0 - data.rZ) : data.rZ) + "deg)";
                    cmt.style.MozTransform = "rotateY(" + (data.rY > 180 && data.rY < 270 ? (0 - data.rY) : data.rY) + "deg) rotateZ(" + (data.rZ > 180 && data.rZ < 270 ? (0 - data.rZ) : data.rZ) + "deg)";
                    cmt.style.MSTransform = "rotateY(" + (data.rY > 180 && data.rY < 270 ? (0 - data.rY) : data.rY) + "deg) rotateZ(" + (data.rZ > 180 && data.rZ < 270 ? (0 - data.rZ) : data.rZ) + "deg)";*/
                }
            }
            break;
    }
    if (data.border)
        cmt.border = "1px solid #00ffff";
    this.runline.push(cmt);
};
CommentManager.prototype.finish = function(cmt) {
    switch (cmt.mode) {
        default:
        case 1:
            {
                this.csa.scroll.remove(cmt);
            }
            break;
        case 2:
            {
                this.csa.scrollbtm.remove(cmt);
            }
            break;
        case 4:
            {
                this.csa.bottom.remove(cmt);
            }
            break;
        case 5:
            {
                this.csa.top.remove(cmt);
            }
            break;
        case 6:
            {
                this.csa.reverse.remove(cmt);
            }
            break;
        case 7:
            break;
    }
};
/** Static Functions **/
CommentManager.prototype.onTimerEvent = function(timePassed, cmObj) {
    var ctx = this.bufferCanvas.getContext("2d");
    ctx.clearRect(0,0,ctx.width,ctx.height);
    for (var i = 0; i < cmObj.runline.length; i++) {
        var cmt = cmObj.runline[i];
        cmt.ttl -= timePassed;
        if (cmt.mode == 1 || cmt.mode == 2)
            cmt.x = (cmt.ttl / cmt.dur) * (cmObj.stage.getContext("2d").width + cmt.offsetWidth) - cmt.offsetWidth;
        else if (cmt.mode == 6)
            cmt.x = (1 - cmt.ttl / cmt.dur) * (cmObj.stage.getContext("2d").width + cmt.offsetWidth) - cmt.offsetWidth;
        else if (cmt.mode == 4 || cmt.mode == 5 || cmt.mode >= 7) {
            if (cmt.dur == null)
                cmt.dur = 4000;
            if (cmt.data.alphaFrom != null && cmt.data.alphaTo != null) {
                cmt.opacity = (cmt.data.alphaFrom - cmt.data.alphaTo) * (cmt.ttl / cmt.dur) + cmt.data.alphaTo;
            }
            if (cmt.mode == 7 && cmt.data.movable) {
                cmt.y = ((cmt.data.toY - cmt.data.y) * (Math.min(Math.max(cmt.dur - cmt.data.moveDelay - cmt.ttl, 0), cmt.data.moveDuration) / cmt.data.moveDuration) + parseInt(cmt.data.y));
                cmt.x = ((cmt.data.toX - cmt.data.x) * (Math.min(Math.max(cmt.dur - cmt.data.moveDelay - cmt.ttl, 0), cmt.data.moveDuration) / cmt.data.moveDuration) + parseInt(cmt.data.x));
            }
        }
        if (cmObj.filter != null) {
            cmt = cmObj.filter.runtimeFilter(cmt);
        }
        if (cmt.ttl <= 0) {
            //cmObj.stage.removeChild(cmt);
            cmObj.runline.splice(i, 1);//remove the comment
            cmObj.finish(cmt);
        }
        //ctx.scale(Math.cos(cmt.transformY * Math.PI/180), 1);
        //ctx.rotate(cmt.transformZ * Math.PI/180);
        ctx.globalAlpha = cmt.opacity;
        ctx.fillStyle = cmt.color;
        ctx.font = cmt.fontSize + " " + cmt.fontFamily;
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.fillText(cmt.innerText, cmt.x, cmt.y);
        ctx.strokeText(cmt.innerText, cmt.x, cmt.y);
        //ctx.setTransform(1,0,0,1,0,0);
        var stgctx = this.stage.getContext("2d");
        stgctx.clearRect(0,0,stgctx.width,stgctx.height);
        stgctx.drawImage(this.bufferCanvas, 0, 0);
    }
};

/*CommentManager.prototype.renderCanvas = function() {
    var ctx = this.bufferCanvas.getContext("2d");
    for(var i = 0; i < cmObj.runline.length; i++) {
        var cmt = cmObj.runline[i];
        ctx.scale(Math.cos(cmt.transformY * Math.PI/180), 1);
        ctx.rotate(cmt.transformZ * Math.PI/180);
        ctx.fillStyle = cmt.color;
        ctx.font = cmt.fontSize + " " + cmt.fontFamily;
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.fillText(cmt.innerText, cmt.x, cmt.y);
        ctx.strokeText(cmt.innerText, cmt.x, cmt.y);
        ctx.setTransform(1,0,0,1,0,0);
    }
};*/