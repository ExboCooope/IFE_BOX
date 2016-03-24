/**
 * Created by xiexianbo on 16-2-17.
 * 自动补全库
 */

var EEditor={};

EEditor.autoCompleteFunc=function(type){
    this.autoCompletePool={};
    this.autoCompleteActive=1;
    this.addEventListener("input",EEditor.inputEvent);
    this.addEventListener("keydown",EEditor.tabRemover);
    this.lastSelectStart=0;
    this.autoCompleteType=type;
};

EEditor.autoCompleteSelection=document.createElement("span");

EEditor.inputEvent=function(){
   // if(!this.autoCompletePool.length)return;
    var p=this.selectionStart;
    if(p==this.lastSelectStart+1){
        var t=EEditor.getLastWord(this.value.slice(0,this.selectionStart));
        if(!t)t="";
        var c;
        var q={};
        this._wordStart=p-t.length;
        this._wordMid= t.length;
        if(this.autoCompleteType){
            q=EEditor.generateSelectionPool(this.value.slice(0,this.selectionStart));
        }
        for(var i in this.autoCompletePool){
            q[i]=this.autoCompletePool[i];
        }
        if(c=EEditor.lookFor(t,q)){
            for(var i in c){
                this.setRangeText(i.slice(t.length));
                this.setSelectionRange(p,p+i.length- t.length);
                break;
            }
            //var a=this.getBoundingClientRect();
            var a=this.getPageRect();
            EEditor.showSelectPool(c, a.right, a.top,this);
        }
    }else{
        EEditor.autoCompleteSelection.$del();
    }
    this.lastSelectStart=p;
};

EEditor.tabRemover=function(e){
    if(e.keyCode==9){
        if(this.selectionStart!=this.selectionEnd){
            e.preventDefault();
            this.selectionStart=this.selectionEnd;
            this.lastSelectStart=this.selectionStart;
        }
    }
};

EEditor.generateSelectionPool=function(root){
    var re=/[a-zA-Z_][\w|\.|\[|\]]*$/;
    var t=re.exec(root);
    var p={};
    var u;
    if(t){
        var re2=/\.\w*$/;
        var t2=re2.exec(root);
        if(!t2){
            u=window;
        }else{
            var str1=t[0].slice(0,t[0].length-t2[0].length);
            u=eval(str1);
        }

        while(u){
            for(var i in u){
                p[i]=u[i];
            }
            u= u.prototype;
        }
    }
    return p;
};

EEditor.showSelectPool=function(data,x,y,root){
    EEditor.autoCompleteSelection.$c("autocompleteselect").$Sa().$del();
    EEditor.autoCompleteSelection.style.top=y+"px";
    EEditor.autoCompleteSelection.style.left=x+"px";
    EEditor.autoCompleteSelection.root=root;
    for(var i in data){
        EEditor.autoCompleteSelection.$Gap("div").$t(i).$c("autocompleteitem").$v("root",root).onclick=EEditor.selonclickfunc;
    }
    document.body.$ap(EEditor.autoCompleteSelection);
};

EEditor.getLastWord=function(str){
    var re=/\w+$/;
    var t=re.exec(str);
    return t? t[0]:null;
};

EEditor.lookFor=function(str,pool){
    var k=str.length;
    var p={};
    for(var i in pool){
        if(i.slice(0,k)==str && i!=str){
            p[i]=pool[i];
        }
    }
    return p;
};

EEditor.selonclickfunc=function(e){
    e.stopPropagation();
    this.root.selectionStart=this.root._wordStart;
    this.root.setRangeText(this.innerHTML);
    this.root.selectionStart=this.root.selectionEnd;
    this.root.lastSelectStart=this.root.selectionStart;
    this.$P().$del();
};

document.body.addEventListener("click",function(e){EEditor.autoCompleteSelection.$del();return true;});

HTMLTextAreaElement.prototype.createAutoComplete=EEditor.autoCompleteFunc;

var RN=/\d*[\d+|\.]\d*/;
var RV=/[a-zA-Z_]\w*/;
var RO=/\([^\(\)\[\]\{\}]*\)/;


var RF=/[a-zA-Z_]\w*\(\)/;


