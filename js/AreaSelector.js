/**
 * Created by xiexianbo on 16-3-22.
 */

function AreaSelector(){
    this.dom=$g("div").$c("selectAREA");
}

AreaSelector.mouseDownEvent=function(e){
    if(e.button==0){
        if(this._active_select==0){
            this._active_select=1;
            this._base_x= e.clientX;
            this._base_y= e.clientY;
        }
    }
    return false;
};
AreaSelector.mouseMoveEvent=function(e){
    if(this._active_select==1){
        var dx= e.clientX-this._base_x;
        var dy= e.clientY-this._base_y;
        if(dx*dx+dy*dy>10){
            this._active_select=2;
            this.appendChild(this._selector.dom);
        }
    }
    if(this._active_select==2){
        dx= e.clientX-this._base_x;
        dy= e.clientY-this._base_y;
        var b=this.getBoundingClientRect();
        var ty=(dy>0? this._base_y:e.clientY)-b.top;
        var tx=(dx>0? this._base_x:e.clientX)- b.left;
        var w=(dx<0?-dx:dx);
        var h=(dy<0?-dy:dy);
        this._selector.dom.style.top=ty+"px";
        //this._selector.dom.style.bottom=(this._base_y< e.clientY? e.clientY:this._base_y)+"px";
        this._selector.dom.style.left=tx+"px";

        this._selector.dom.style.width=w+"px";
        this._selector.dom.style.height=h+"px";
        //this._selector.dom.style.right=(this._base_x< e.clientX? e.clientX:this._base_x)+"px";

        this._selector.rect.top=ty;
        this._selector.rect.left=tx;
        this._selector.rect.right=tx+w;
        this._selector.rect.bottom=ty+h;
        this._selector.rect.width=w;
        this._selector.rect.height=h;
    }
    return false;
};

AreaSelector.mouseUpEvent=function(e){
    if(e.button==0){
        if(this._active_select==2){
            this.removeChild(this._selector.dom);
            console.log(this._selector.rect);
            this._active_select=0;
        }else if(this._active_select==1){
            this._active_select=0;
        }
    }
    return false;
};


HTMLElement.prototype.addSelector=function(s){
    this._selector=s;
    this._selector.rect={};
    this._active_select=0;
    this.addEventListener("mousedown",AreaSelector.mouseDownEvent);
    this.addEventListener("mousemove",AreaSelector.mouseMoveEvent);
    this.addEventListener("mouseup",AreaSelector.mouseUpEvent);
};

HTMLElement.prototype.setStatic=function(){
    this.addEventListener("selectstart",HTMLElement.preventSelectFunction,true);
    this.addEventListener("dragstart",HTMLElement.preventSelectFunction,true);
    this.style.cursor="default";
};
HTMLElement.preventSelectFunction=function(e){
    e.preventDefault();
    return false;
};