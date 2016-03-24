/**
 * @module MenuSystem
 * @author xiexb
 * 右键菜单系统，使用一个DataSource树建立菜单。
 * 包含了input type=file的特殊功能
 */
//define(function (require) {
//    var DataSource=require("./DataSource");
//    require("./DomBuilder");

function Menu(datasource,rootitem){
    this.data_source=datasource;
    this.subMenu=null;
    this.width=200;
    this.height=400;
    this.root=null;
    this.dom=null;
    this.x=0;
    this.y=0;
    this.all_item=[];
    this.fontwidth=8;
    this.overitem=null;
    this.make();
    this.rootitem=rootitem;
}

//设置Menu的位置，从(x,y)开始往右下延伸，如果某个方向被挡住，就使用altx向左或者alty向上展开
//第一次使用时精度稍低（使用计算的宽度和高度），打开以后，宽度和高度会被实际测量
Menu.prototype.setPosition=function(x,y,altx,alty){
    this.x=x;
    this.y=y;

    altx=altx||x;
    alty=alty||y;

    var b=document.body.getBoundingClientRect();

    if(x+this.width> b.right){
        this.x=altx-this.width;
    }
    if(y+this.height> b.bottom){
        this.y=alty-this.height;
    }

    if(this.x+this.width> b.right)this.x=b.right-this.width;
    if(this.y+this.height> b.bottom)this.y=b.bottom-this.height;
    if(this.x<0)this.x=0;
    if(this.y<0)this.y=0;

    this.dom.style.top=this.y+"px";
    this.dom.style.left=this.x+"px";
};

//打开菜单
Menu.prototype.open=function(){
    if(!this.dom.parentNode){
        document.body.$ap(this.dom);
    }
    var b=this.dom.getBoundingClientRect();
    this.width= b.width;
    this.height= b.height;
    if(this.overitem)this.overitem.$c(this.overitem.item.disabled?"menuitemdisabled":"menuitem");
};

//关闭菜单和子菜单
Menu.prototype.close=function(){
    if(!this.dom)return this;
    var a=this.dom.$P();
    if(a){
        a.removeChild(this.dom);
    }
    if(this.subMenu){
        this.subMenu.close();
        this.subMenu=null;
    }
    if(this.overitem)this.overitem.$c(this.overitem.item.disabled?"menuitemdisabled":"menuitem")
    this.overitem=null;
    return this;
};

//建立菜单
Menu.prototype.make=function(){
    var a=$g("div").$st("position","absolute");
    var w=this.getMaxItemWidth()*this.fontwidth+24+16;
    a.style.width=w+"px";
    this.width=w+2;
    this.height=0;

    a.$c("menu");
    this.dom=a;
    this.all_item=[];
    for(var i=0;i<this.data_source.childs.length;i++){
        a.$ap(this.makeDataItem(this.data_source.childs[i]));
    }
    var that=this;
    this.dom.addEventListener("mousedown",Menu.onmousedownbreaker,true,1);
    a.addEventListener("selectstart",function(e){e.preventDefault();return false;},true);
    return this;
};

//菜单选中函数
Menu.prototype.onclickfunction=function(e){
    //console.log("click!");
    if(!this.item.disabled){
        if(this.item.onclick){
            this.item.onclick(e,this._menu.rootitem);
        }
    }
    this._menu.onclickfunction2();
    e.stopPropagation();
    return false;
};

    //菜单中inputfile选中函数，使用延迟可以避免菜单在当帧被关闭而无法打开文件
    Menu.prototype.onclickfunction3=function(e){
        console.log("click!");
        if(!this.item.disabled){
            if(this.item.onclick){
                this.item.onclick(e,this._menu.rootitem);
            }
        }
        this.value="";//设置初始值，否则onchange有可能不会触发
        var that=this;
        setTimeout(function(){that._menu.onclickfunction2();},1);
        e.stopPropagation();
        return false;
    };
//防止在Menu上点击触发其他事件
Menu.onmousedownbreaker=function(e){
    e.stopPropagation();
    return false;
};
//取元素最大宽度 单位字节
Menu.prototype.getMaxItemWidth=function(){
    var c=0;
    for(var i=0;i<this.data_source.childs.length;i++){
        var t=this.data_source.childs[i];

        var ci= (t.name?t.name.getLength():0)+(t.short_cut_name? t.short_cut_name.getLength()+2:0);
        if(ci>c)c=ci;
    }
    return c;
};

//关闭菜单和父菜单
Menu.prototype.onclickfunction2=function(){
    var a=this;
    while(a.root)a=a.root;
    a.close();
};

//根据DataSource创建菜单项
Menu.prototype.makeDataItem=function(item){

    if(!item.name){ //空名字的DataSource被当成分隔栏
        this.height+=3;
        return $g("div").$c("menuline");
    }
    this.height+=22;

    var a=$g("div").$c(item.disabled?"menuitemdisabled":"menuitem");
    if(item.fileinput){ //处理fileinput
        a.$ap(item.fileinput);
        item.fileinput.$c("fileinput");
        item.fileinput.style.width=(this.width-2)+"px";
        item.fileinput.style.left="0px";
       // item.fileinput.onclick=function(e){
       //     console.log(e);
       // }
        item.fileinput.item=item;
        item.fileinput._menu=this;
    }
    if(item.icon){
        b= a.$Gap("img").$c("icon");
        b.src=item.icon;
    }else{
        b= a.$Gap("span").$c("icon");
    }
    var c= a.$Gap("span").$c("menuitemname").$t(item.name);

    var that=this;
    a.item=item;
    a._menu=this;
    item.menuitem=a;

        if(item.childs.length>0){
            var g=a.$Gap("span").$c("menusubicon");
            //触发子菜单事件
            a.onmouseover=function(){
                if(that.overitem!=a){
                    if(that.subMenu){
                        if(that.overitem)that.subMenu.close();
                        if(that.overitem)that.overitem.$c(that.overitem.item.disabled?"menuitemdisabled":"menuitem");
                        that.subMenu=null;
                    }
                    //console.log(a.getBoundingClientRect());
                    if(!item.disabled){
                        //var b=a.getBoundingClientRect();
                        var b= a.getPageRect();
                        that.subMenu=new Menu(item,that.rootitem);
                        that.subMenu.setPosition(b.right-5, b.top, b.left+5, b.bottom);
                        that.subMenu.root=that;
                        that.subMenu.open();
                        that.overitem=a;
                        a.$c("menuitemkeep");
                    }
                }
            }
        }else{
            if(item.fileinput){
                item.fileinput.addEventListener("click",this.onclickfunction3,false,-1);
            }else{
                a.addEventListener("click",this.onclickfunction,false,1);
            }
            a.$Gap("span").$c("menusubiconplace");
            a.onmouseover=function(){
                if(that.overitem!=a){

                    if(that.subMenu){
                        if(that.overitem)that.overitem.$c(that.overitem.item.disabled?"menuitemdisabled":"menuitem");
                        that.subMenu.close();
                    }
                   that.overitem=a;
                }
            }
        }

    var f= a.$Gap("span").$c("menushortcut").$t(item.short_cut_name||"");

    this.all_item.push(a);
    return a;
};


//设置一个Element的右键菜单，如果参数为空则取消菜单
Element.prototype.setContextMenu=function(object){
    var that=this;
    if(this._context_menu){
        this.removeEventListener("contextmenu",this._context_f1,false);
        document.body.removeEventListener("mousedown",this._context_f2,false);
        this._context_menu=null;
    }
    if(object instanceof DataSource){
        object=new Menu(object,this);
    }
    if(object instanceof Menu){
        this._context_menu=object;
        this._context_f1=function(e){
            that._context_menu.close();
            if(!e.cpt){
                that._context_menu.setPosition(e.pageX, e.pageY, e.pageX,5000);
                that._context_menu.open();
            }
            e.preventDefault();
            e.cpt=1;
            //e.stopPropagation();
        };
        this.addEventListener("contextmenu",this._context_f1,false,-2);
        this._context_f2=function(e){
            //if(e.button==2){
            //}else{
                that._context_menu.close();
            //}
            return true;
        };
        document.body.addEventListener("mousedown",this._context_f2,false,-1);
    }

};

//取中文文本长度
String.prototype.getLength=function(){
    var l=this.length;
    var k=0;
    for(var i=0;i<l;i++){
        if(this.charCodeAt(i)>255){
            k++;
        }
    }
    return k+l;
};

HTMLElement.prototype.getPageRect=function(){
    var y=this.getBoundingClientRect();
    var x={};
    for(var i in y){
        x[i]=y[i];
    }
    x.top= x.top+document.body.scrollTop;
    x.left= x.left+document.body.scrollLeft;
    x.bottom= x.bottom+document.body.scrollTop;
    x.right= x.right+document.body.scrollLeft;
    return x;
};


//    return Menu;
//});