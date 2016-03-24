/**
 * Created by xiexianbo on 16-3-21.
 */

var Global={
    allow_animation:1,
    move_time:60,
    rotate_time:30,
    stopped:0,
    _connection:{
        target:null,
        direction:null,
        type:null
    },
    refresh_type:true,
    BLOCK_NONE:0,
    BLOCK_WALL:1,
    BLOCK_PLAYER:2,
    BLOCK_SELECT:3,

    BLOCK_TYPE:["无","墙","玩家","选择"],

    DIRECTION_UP:1,
    DIRECTION_DOWN:3,
    DIRECTION_LEFT:4,
    DIRECTION_RIGHT:2,
    DIRECTION:["无","上","右","下","左"],
    DIRECTIONS:[[0,0],[0,-1],[1,0],[0,1],[-1,0]],
    DIRECTION_STYLE:[
        {w:20,h:20,x:40,y:40},
        {w:100,h:20,x:0,y:0},
        {w:20,h:100,x:80,y:0},
        {w:100,h:20,x:0,y:80},
        {w:20,h:100,x:0,y:0}
    ],

    addDirection:function(pos,dir,l){
        if(arguments.length<=2){
            l=1;
        }
        return [pos[0]+Global.DIRECTIONS[dir][0]*l,pos[1]+Global.DIRECTIONS[dir][1]*l];
    },

    block_pool:[],
    block_area:null,
    block_display:null,
    player:null,
    createBlock:function(type){
        var a=new Block(type,this.block_area);
        a.id=this.block_pool.pushM(a);
        return a;
    },
    deleteBlock:function(block){
        for(var i=0;i<this.block_pool.length;i++){
            if(this.block_pool[i]==block){
                delete this.block_pool[i];
            }
        }
        if(block.dom.parentNode)block.dom.parentNode.removeChild(block.dom);
    },
    refresher:function(){
        Global.refresh();
        if(Global.paused){
            Global.stopped=1;
            return;
        }
        if(Global.refresh_type){
            window.requestAnimationFrame(Global.refresher);
        }else{
            setTimeout(Global.refresher,16);
        }
    },
    refresh:function(){
        Global.stopped=0;
        OrderEmitter.runOrder();
        for(var j=0;j<Global._wait_pool.length;j++)
        {
            if(Global._wait_pool[j]){
                Global._wait_pool[j][0]--;
                if(Global._wait_pool[j][0]<=0){
                    Global._wait_pool[j][1]();
                    delete Global._wait_pool[j];
                }
            }
        }

        for(var i=0;i<this.block_pool.length;i++){
            if(this.block_pool[i]){
                this.block_pool[i].think();
                this.block_pool[i].draw();
            }
        }

    },

    blockZoomFunc:function(w,h){
        for(var i=0;i<this.block_pool.length;i++){
            if(this.block_pool[i]){
                var p=this.block_pool[i].move_dest;
                if(p[0]>=w || p[1]>=h){
                    if(this.block_pool[i].type==this.BLOCK_PLAYER){
                        p[0]=p[0]>=w?w-1:p[0];
                        p[1]=p[1]>=h?h-1:p[1];
                        this.block_pool[i].move_frame[1]=0;
                    }else{
                        this.block_pool[i].remove();
                    }
                }
            }
        }
    },

    setPlayerPos:function(x,y){
        if(!this.player){
            this.player=this.createBlock(this.BLOCK_PLAYER);
        }
        this.player.position=[x,y];
        this.player.moveTo(3,3,1);
        return this.player;
    },

    fitPosition:function(x,y,w,h){
        if(x instanceof Array){
            y=x[1];
            x=x[0];
        }else if(x.position){
            y= x.position[1];
            x= x.position[0];
        }
        y=Math.round(y);
        x=Math.round(x);
        if(arguments.length==4){
            x=x>=w?w-1:x;
            y=y>=h?h-1:y;
        }
        return [x,y];
    },

    fitPosition2:function(x){

        x[0]=(x[0]+0.5)>>0;
        x[1]=(x[1]+0.5)>>0;
    },

    smoother1:function(start,end,rate){
        var cl={};
        var r=(Math.sin((rate-0.5)*Math.PI)+1)/2;
        for(var i in start){
            if(+(start[i]+"")===start[i]){
                if(end[i]===undefined){
                    cl[i]=start[i];
                }else{
                    cl[i]=r*(end[i]-start[i])+start[i];
                }
            }
        }
        return cl;
    },

    smoother2:function(start,end,rate,cl){
        var r=(Math.sin((rate-0.5)*Math.PI)+1)/2;
        for(var i in start){
            if(+(start[i]+"")===start[i]){
                if(end[i]===undefined){
                    cl[i]=start[i];
                }else{
                    cl[i]=r*(end[i]-start[i])+start[i];
                }
            }
        }
        return cl;
    },

    applyAttribute:function(target,attr){
        for(var i in attr){
           target[i]=attr[i];
        }
    },



    _wait_pool:[],
    wait:function(time,func){
        this._wait_pool.pushM([time,func]);
    },
    _order_template:{
        code:null,
        done:0
    },

    log:function(message,deep){
        var flag=0;
        if(this.console.scrollHeight==this.console.scrollTop+this.console.clientHeight){
            flag=1;
        }
        var lll=this.console.$Gap("div").$t(message).$c("consoleitem");

        if(flag){
            this.console.scrollTop=this.console.scrollHeight;
        }
        if(deep){
            console.log(message);
            lll.$st("color","red");
        }
    },

    _ai_template:{
        think:function(){}
    }


};

function InputObject(){
    Global.input=this;
    this.dom=$g("div").$c("inputMAIN");
    this.sidebar=this.dom.$Gap("span").$c("inputSIDENOTE");
    this.textarea=this.dom.$Gap("textarea").$c("inputAREA");
    var that=this;
    this.textarea.addEventListener("input",function(e){
        that.refresh();
    });
    this.textarea.addEventListener("keydown",function(e){
        that.refresh();
    });
    this.textarea.addEventListener("scroll",function(e){
        that.refresh();
    });

    this.textarea.createAutoComplete(0);
    this.textarea.autoCompletePool={
        GO:1,
        TUN:1,
        LEF:1,
        RIG:1,
        TOP:1,
        BOT:1,
        MOV:1,
        BAC:1,
        TRA:1,
        BRU:1,
        BUILD:1,
        TO:1
    };
    this.codelist=[];

}


InputObject.prototype.refresh=function(){
    var a=this.textarea;
    var b=this.sidebar;
    var t=this.textarea.value;
    var lpn= a.scrollHeight>200?35:37;
    var l=1;
    var ii=0;
    var flag=1;
    this.codelist=[];
    var that=this;
    var s= t.split("\n");
    var si=0;
    b.innerHTML="";
    var f=function(){
        b.$ta("<br>");
    };
    var g=function(){
        var t2=OrderEmitter.parseOrder(s[si++]);
        if(t2){
            that.codelist.push(t2);
            b.$ta(""+l);
        }else if(s!=""){
            b.$ta('<span style="background-color: red">'+l+'</span>');
        }else{
            b.$ta(""+l);
        }
    };

    for(var i=0;i< t.length;i++){
        if(t.charCodeAt(i)==10){//换行
            if(flag){
                g();
                flag=0;
            }
            f();
            l++;
            ii=0;

            flag=1;
        }else{
            if(t.charCodeAt(i)>255){
                ii+=2;
                if(ii>lpn){
                    ii=2;
                    f();
                }
            }else{
                ii+=1;
                if(ii>lpn){
                    ii=1;
                    f();
                }
            }
            if(flag){
                g();
                flag=0;
            }
        }
    }
    if(flag){
        g();
        flag=0;
    }
    b.style.top= "-"+a.scrollTop+"px";
    b.style.height= a.scrollHeight+"px";

};

InputObject.prototype.submit=function(){
    for(var i=0;i<this.codelist.length;i++){
        OrderEmitter.addOrder(this.codelist[i]);
    }
    this.refresh();
};

function BlockArea(w,h){
    this.dom=$g("div").$c("blockMAIN");
    this.area=[];
    this.w=w;
    this.h=h;
    Global.block_area=this;
    this.make();
}
BlockArea.prototype.makeItem=function(){
    var a=$g("span").$c("blockEMPTY");
    var s=(100/this.w)+"%";
    a.$st("width",s);
    s=(100/this.h)+"%";
    a.$st("height",s);
    return a;
};
BlockArea.prototype.setWH=function(w,h){
    this.area=[];
    this.w=w;
    this.h=h;
    this.dom.$Sa().$del();
    Global.blockZoomFunc(w,h);
    this.make();
};
BlockArea.prototype.make=function(){
    for(var i=0;i<this.w;i++){
        this.area[i]=[];
        for(var j=0;j<this.h;j++){
            var a=this.makeItem();
            a.style.top=(100/this.h)*j+"%";
            a.style.left=(100/this.w)*i+"%";
            this.area[i][j]=a;
            a.getBlock=BlockArea.getBlock;
            a.setBlock=BlockArea.setBlock;
            a.position=[i,j];
            if($si("context").checked)a.setContextMenu(BlockArea.m);
            this.dom.$ap(a);
        }
    }
};


BlockArea.getBlock=function(){
    var t=this.$Sa();
    var a=[];
    for(var i=0;i< t.length;i++){
        a.push(t[i].block);
    }
    return a;
};
BlockArea.setBlock=function(block){
    if(block.dom.parentNode!=this){
        if(block.dom.parentNode)block.dom.parentNode.removeChild(block.dom);
        this.appendChild(block.dom);
    }

};

BlockArea.prototype.setWall=function(x,y){
    if(!this.getPosition(x,y).getBlock().hasBlockType(Global.BLOCK_WALL) && !this.getPosition(x,y).getBlock().hasBlockType(Global.BLOCK_PLAYER)){
        var t=Global.createBlock(Global.BLOCK_WALL);
        t.moveTo(x,y);
    }
};

BlockArea.m=new DataSource();
BlockArea.m1=new DataSource({name:"放置方块"},BlockArea.m);
BlockArea.m1_1=new DataSource({name:"墙",onclick:function(e,a){
    Global.block_area.setWall(a.position);
}},BlockArea.m1);
BlockArea.m1_2=new DataSource({name:"无",onclick:function(e,a){
    var t=a.getBlock();
    for(var i=0;i< t.length;i++){
        if(t[i]!=Global.player){
            t[i].remove();
        }else{

        }
    }
}},BlockArea.m1);
BlockArea.m2=new DataSource({name:"玩家指令"},BlockArea.m);
BlockArea.m2_2=new DataSource({name:"行动完成后移动至此处",onclick:function(e,a){
    OrderEmitter.addOrder(["ORDER_MOV2",[a.position[0],a.position[1]],-1]);
}},BlockArea.m2);
new DataSource({},BlockArea.m2);
BlockArea.m2_1=new DataSource({name:"直接传送至此处",onclick:function(e,a){
    Global.player.cMoveTo(a);
    Global.player.failed=1;
}},BlockArea.m2);
BlockArea.m2_3=new DataSource({name:"取消AI指令",onclick:function(e,a){
    Global.player.ai.clearOrder();
}},BlockArea.m2);
BlockArea.m2_4=new DataSource({name:"取消所有指令",onclick:function(e,a){
    OrderEmitter.resetOrder();
}},BlockArea.m2);

BlockArea.prototype.isOut=function(x,y){
    if(x instanceof Array){
        y=x[1];
        x=x[0];
    }else if(x.position){
        y= x.position[1];
        x= x.position[0];
    }
    y=Math.round(y);
    x=Math.round(x);
    if(x<0 || y<0 || x>=this.w || y>this.h)return true;
    return false;
};

BlockArea.prototype.getPosition=function(x,y){
    if(x instanceof Array){
        y=x[1];
        x=x[0];
    }else if(x.position){
        y= x.position[1];
        x= x.position[0];
    }
    y=Math.round(y);
    x=Math.round(x);
    //if(this.isOut(x,y))return null;
    //x=x<0?(x+(((-x/this.n1)>>0)+1)*this.n1):x%this.w;
    //y=y<0?(y+(((-y/this.n1)>>0)+1)*this.n1):y%this.h;
    x=x<0?0:x>=this.w?this.w-1:x;
    y=y<0?0:y>=this.h?this.h-1:y;
    return this.area[x][y];
};



function Block(type,base){
    this.type=type;
    this.position=[0,0];
    this.base=base;
    this.move_begin=[0,0];//开始移动位置
    this.move_dest=[0,0];//结束移动位置
    this.move_frame=[30,0];// 总用时 剩余时间
    this.network=[];
    this.dom=$g("div").$c("block");
    this.dom.block=this;
    if(type==Global.BLOCK_WALL){
        this.dom.style.backgroundColor="#000";
    }else if(type==Global.BLOCK_PLAYER){
        this.head=this.dom.$Gap("div").$c("playerHEAD");
        this.dom.style.backgroundColor="red";

        this.headstyle={w:0,h:0,x:0,y:0};
        this.headstylebegin={w:0,h:0,x:0,y:0};
        this.headstyle_frame=[30,0];
        this.ai=new AI_1(this);
    }
    this.direction=1;
    this.order_pool=[];
    this.order_head=0;
}
Block.prototype.moveTo=function(x,y,time){
    if(x instanceof Array){
        y=x[1];
        x=x[0];
    }else if(x.position){
        y= x.position[1];
        x= x.position[0];
    }
    time=time||0;
    this.move_begin[0]=this.position[0];
    this.move_begin[1]=this.position[1];
    this.move_dest[0]=x;
    this.move_dest[1]=y;
    this.move_frame[0]=time<=0?1:time;
    this.move_frame[1]=time;
    if(time==0){
        this.position[0]=x;
        this.position[1]=y;
    }
    Global.log(this.discribe()+" 正在移动到("+x+","+y+")，用时"+time);
};

Block.prototype.discribe=function(){
    return "方块"+this.id+"("+Global.BLOCK_TYPE[this.type]+")@("+this.position[0]+","+this.position[1]+")";
};

Block.prototype.cMoveTo=function(x,y,time){

    time=time||0;
    if(x instanceof Array){
        y=x[1];
        x=x[0];
    }else if(x.position){
        y= x.position[1];
        x= x.position[0];
    }
    y=Math.round(y);
    x=Math.round(x);
    Global.log(this.discribe()+" 试图移动到("+x+","+y+")");
    if(x>=this.base.w||x<0||y>=this.base.h||y<0){
        Global.log("不能移出屏幕！",1);
        this.failed=1;
        return 0;
    }
    var ta=this.base.getPosition(x,y).getBlock();
    for(var i=0;i<ta.length;i++){
        if(ta[i].type==Global.BLOCK_WALL){
            Global.log("撞墙啦！",1);
            this.failed=1;
            return 0;
        }
    }
    this.moveTo(x,y,time);
    //console.log(time);
    return time;

};


Block.prototype.changeDirection=function(dir,time){

    time=time||0;
    dir=dir>>0;
    dir=dir<0?0:(dir>4?0:dir);
    Global.log(this.discribe()+" 正在转向("+Global.DIRECTION[this.direction]+"-->"+Global.DIRECTION[dir]+")，用时"+time);
    this.direction=dir;
    if(this.type==Global.BLOCK_PLAYER){
        Global.applyAttribute(this.headstylebegin,this.headstyle);
        this.headstyle_frame[0]=time<=0?1:time;
        this.headstyle_frame[1]=time;
    }

};

Block.prototype.cChangeDirection=function(dir,time){
    time=time||0;
    dir=dir>>0;
    dir=dir<0?0:(dir>4?0:dir);
    if(this.direction==dir && this.headstyle_frame[1]==0){
        return 0;
    }
    this.changeDirection(dir,time);
    return time;
};

Block.prototype.think=function(){
    if(this.ai){
        this.ai.think();
    }
    var rate=1-this.move_frame[1]/this.move_frame[0];
    if(this.move_frame[1]>0)this.move_frame[1]--;

    if(this.move_frame[1]==0){
        this.position[0]=this.move_dest[0];
        this.position[1]=this.move_dest[1];
        Global.fitPosition2(this.position);
    }else{
        Global.smoother2(this.move_begin,this.move_dest,rate,this.position);
    }
    if(this.type==Global.BLOCK_PLAYER){
        rate=1-this.headstyle_frame[1]/this.headstyle_frame[0];
        if(this.headstyle_frame[1]>0)this.headstyle_frame[1]--;
        Global.smoother2(this.headstylebegin,Global.DIRECTION_STYLE[this.direction],rate,this.headstyle);
    }
};
Block.prototype.draw=function(){
    var x,y;
    this.base.getPosition(this.position).setBlock(this);
    x=this.position[0];
    y=this.position[1];
    if(Global.allow_animation){
        y=(y+0.5)>>0;
        x=(x+0.5)>>0;
    }
    var dx,dy;
    dx=this.position[0]-x;
    dy=this.position[1]-y;
    this.dom.style.left=(100*dx)+"%";
    this.dom.style.top=(100*dy)+"%";
    if(this.type==Global.BLOCK_PLAYER){
        this.head.style.width=this.headstyle.w+"%";
        this.head.style.height=this.headstyle.h+"%";
        this.head.style.top=this.headstyle.y+"%";
        this.head.style.left=this.headstyle.x+"%";
    }
};
Block.prototype.remove=function(){
    Global.log(this.discribe()+" 被销毁了");
    delete Global.block_pool[this.id];
    if(this.dom.parentNode){
        this.dom.parentNode.removeChild(this.dom);
    }
};

function BlockMainDisplay(w,h,n1,n2){
    this.dom=$g("div").$c("blockOUT");
    this.w=w;
    this.h=h;
    this.inw=w-20;
    this.inh=h-20;
    this.n1=n1;
    this.n2=n2;
    this.x=[];
    this.y=[];
    this.xaxis=null;
    this.yaxis=null;
    this.block=null;
    this.dom.style.height=h+4+'px';
    this.dom.style.width=w+4+'px';
    Global.block_display=this;

}
BlockMainDisplay.prototype.setWH=function(w,h){
    this.n1=w;
    this.n2=h;
    this.xaxis.$del();
    this.yaxis.$del();
    this.xaxis=$g("div").$c("blockAXIS");
    this.xaxis.style.top="0px";
    this.xaxis.style.height="20px";
    this.xaxis.style.left="20px";
    this.xaxis.style.width=(this.w-20+2)+"px";
    for(var i=0;i<this.n1;i++){
        this.x[i]=this.makeItemA().$t(""+i);
        this.x[i].style.top="0px";
        this.x[i].style.left=(100/this.n1)*i+"%";
        this.xaxis.$ap(this.x[i]);
    }
    this.yaxis=$g("span").$c("blockAXIS");
    this.yaxis.style.top="20px";
    this.yaxis.style.width="20px";
    this.yaxis.style.left="0px";
    this.yaxis.style.height=(this.h-20+2)+"px";
    for(var j=0;j<this.n2;j++){
        this.y[i]=this.makeItemB().$t(""+j);
        this.y[i].style.left="0px";
        this.y[i].style.top=(100/this.n2)*j+"%";
        this.yaxis.$ap(this.y[i]);
    }
    this.dom.$ap(this.xaxis);
    this.dom.$ap(this.yaxis);
};
BlockMainDisplay.prototype.makeItemA=function(){
    var a=$g("span").$c("blockNUM");
    var s=(100/this.n1)+"%";
    a.$st("width",s);
    s="100%";
    a.$st("height",s);
    return a;
};
BlockMainDisplay.prototype.makeItemB=function(){
    var a=$g("div").$c("blockNUM");
    var s=(100/this.n2)+"%";
    a.$st("height",s);
    a.$st("line-height",(this.inh/this.n2)+"px");
    s="100%";
    a.$st("width",s);

    return a;
};
BlockMainDisplay.prototype.make=function(){
    this.xaxis=$g("div").$c("blockAXIS");
    this.xaxis.style.top="0px";
    this.xaxis.style.height="20px";
    this.xaxis.style.left="20px";
    this.xaxis.style.width=(this.w-20+2)+"px";
    for(var i=0;i<this.n1;i++){
        this.x[i]=this.makeItemA().$t(""+i);
        this.x[i].style.top="0px";
        this.x[i].style.left=(100/this.n1)*i+"%";
        this.xaxis.$ap(this.x[i]);
    }
    this.yaxis=$g("span").$c("blockAXIS");
    this.yaxis.style.top="20px";
    this.yaxis.style.width="20px";
    this.yaxis.style.left="0px";
    this.yaxis.style.height=(this.h-20+2)+"px";
    for(var j=0;j<this.n2;j++){
        this.y[i]=this.makeItemB().$t(""+j);
        this.y[i].style.left="0px";
        this.y[i].style.top=(100/this.n2)*j+"%";
        this.yaxis.$ap(this.y[i]);
    }
    this.block=new BlockArea(this.n1,this.n2);
    this.dom.$ap(this.block.dom);
    this.dom.$ap(this.xaxis);
    this.dom.$ap(this.yaxis);
    this.block.dom.style.top="20px";
    this.block.dom.style.left="20px";
    this.block.dom.style.width=(this.w-20)+"px";
    this.block.dom.style.height=(this.h-20)+"px";
};

var OrderEmitter={
    order_pool:[],
    order_head:0,
    ORDER_GO:function(e,ps,order){
        var a= Global.addDirection(e.position, e.direction);
        var t=e.cMoveTo(a[0],a[1],Global.move_time);
        Global.wait(t+1,function(){order.done=1;});
    },
    ORDER_TUN:function(e,ps,order){
        var a= Global.addDirection(e.position, e.direction);
        var t=e.cChangeDirection(((e.direction-1)+ps[0]+4)%4+1,Global.rotate_time);
        Global.wait(t,function(){order.done=1;});
    },
    ORDER_MOV:function(e,ps,order){
        var t=e.cChangeDirection(ps[0],Global.rotate_time);
        Global.wait(t,function(){
            var a= Global.addDirection(e.position, e.direction);
            var t2=e.cMoveTo(a[0],a[1],Global.move_time);
            Global.wait(t2+1,function(){order.done=1;});
        });
    },
    ORDER_TRA:function(e,ps,order){
        var a= Global.addDirection(e.position, ps[0]);
        var t=e.cMoveTo(a[0],a[1],Global.move_time);
        Global.wait(t+1,function(){order.done=1;});
    },

    ORDER_MOV2:function(e,ps,order){
        e.ai.setIssue("issueMoveTo",order,ps);
    },

    ORDER_REPEAT:function(e,ps,order){
        e.ai.setIssue("issueRepeat",order,ps);
    },

    ORDER_AI_FINISH:function(e,ps,order){
        if(e.ai.return_object){
            e.ai.return_object.done=1;
        }
        Global.log(e.discribe()+" 的AI控制结束了");
        order.done=1;
    },

    ORDER_BUILD:function(e,ps,order){
        var a= Global.addDirection(e.position, e.direction);
        if(e.base.isOut(a)){
            Global.log(e.discribe()+" 尝试在场地外放置墙",1);
        }else if(e.base.getPosition(a).getBlock().hasBlockType(Global.BLOCK_WALL)){
            Global.log(e.discribe()+" 尝试在墙里放置墙",1);
        }else{
            Global.log(e.discribe()+" 在面前放置墙");
            Global.createBlock(Global.BLOCK_WALL).moveTo(a);
        }
        Global.wait(10,function(){order.done=1;});
    },

    ORDER_COLOR:function(e,ps,order){
        var a= Global.addDirection(e.position, e.direction);
        if(e.base.isOut(a)){
            Global.log(e.discribe()+" 尝试在场地外刷墙",1);
        }else if(e.base.getPosition(a).getBlock().hasBlockType(Global.BLOCK_WALL)){
            var g=e.base.getPosition(a).getBlock();
            for(var i=0;i< g.length;i++){
                if(g[i].type==Global.BLOCK_WALL){
                    g[i].dom.style.backgroundColor=ps[0];
                    Global.log(e.discribe()+" 把"+g[i].discribe()+"刷成了"+ps[0]+"色");
                }
            }
        }else{
            Global.log(e.discribe()+" 在空位置刷墙",1);
            Global.createBlock(Global.BLOCK_WALL).moveTo(a);
        }
        Global.wait(10,function(){order.done=1;});
    },

    parseOrder:function(s){
        var z= s.split(" ");
        if(z[0]=="GO"){
            if(z[1]===undefined){
                return ["ORDER_GO",[],-1];
            }else{
                return ["ORDER_REPEAT",["GO",+z[1]],-1];
            }

        }else if(z[0]=="TUN"){
            if(!(z[2]===undefined)){
                if(z[1]=="LEF" || z[1]=="RIG" || z[1]=="BAC"){
                    return ["ORDER_REPEAT",[z[0]+" "+z[1],+z[2]],-1];
                }
            }
            if(z[1]=="LEF")return ["ORDER_TUN",[-1],-1];
            if(z[1]=="RIG")return ["ORDER_TUN",[1],-1];
            if(z[1]=="BAC")return ["ORDER_TUN",[2],-1];
        }else if(z[0]=="TRA"){
            if(!(z[2]===undefined)){
                if(z[1]=="LEF" || z[1]=="RIG" || z[1]=="TOP" || z[1]=="BOT"){
                    return ["ORDER_REPEAT",[z[0]+" "+z[1],+z[2]],-1];
                }
            }
            if(z[1]=="LEF")return ["ORDER_TRA",[4],-1];
            if(z[1]=="RIG")return ["ORDER_TRA",[2],-1];
            if(z[1]=="TOP")return ["ORDER_TRA",[1],-1];
            if(z[1]=="BOT")return ["ORDER_TRA",[3],-1];
        }else if(z[0]=="MOV"){
            if(!(z[2]===undefined)){
                if(z[1]=="LEF" || z[1]=="RIG" || z[1]=="TOP" || z[1]=="BOT"){
                    return ["ORDER_REPEAT",[z[0]+" "+z[1],+z[2]],-1];
                }
            }
            if(z[1]=="LEF")return ["ORDER_MOV",[4],-1];
            if(z[1]=="RIG")return ["ORDER_MOV",[2],-1];
            if(z[1]=="TOP")return ["ORDER_MOV",[1],-1];
            if(z[1]=="BOT")return ["ORDER_MOV",[3],-1];
            if(z[1]=="TO")return ["ORDER_MOV2",[+z[2].split(",")[0],+z[2].split(",")[1]],-1]
        }else if(z[0]=="BUILD"){
            return ["ORDER_BUILD",[],-1];
        }else if(z[0]=="BRU"){
            if(z[1]){
                return ["ORDER_COLOR",[z[1]],-1];
            }
        }


        return null;
    },

    runOrder:function(){
        var finish_flag=1;
        if(this.order_head>0){
            var d=this.order_pool[this.order_head-1];
            if(!d||!d.done){
                finish_flag=0;
            }
        }

        if(finish_flag&&this.order_pool[this.order_head]){

            d=this.order_pool[this.order_head];
            var target= d.code[2]<0?Global.player:Global.block_pool[d.code[2]];
            OrderEmitter[d.code[0]](target, d.code[1], d);
            this.order_head++;
        }
    },

    addOrder:function(order){
        this.order_pool.push({code:order});
    },

    resetOrder:function(){
        this.order_head=0;
        this.order_pool=[];
    }

};

Block.prototype.addOrder=OrderEmitter.addOrder;
Block.prototype.runOrder=OrderEmitter.runOrder;
Block.prototype.resetOrder=OrderEmitter.resetOrder;

Array.prototype.pushM=function(a){
    for(var i=0;i<this.length;i++){
        if(this[i]===undefined){
            this[i]=a;
            return i;
        }
    }
    this[i]=a;
    return i;
};

Array.prototype.hasBlockType=function(b){
    for(var i=0;i<this.length;i++){
        if(this[i]){
            if(this[i].type==b){
                return this[i];
            }
        }
    }
    return null;
};

function AI_1(player){
    this.base=player.base;
    this.player=player;
    this.issue=null;
    this.link=[];
    this.phase=1;
    this.return_object=null;
    this.order_head=0;
    this.order_pool=[];
}
AI_1.prototype.think=function(){
    if(this.current && this.player.failed){
        Global.log(this.player.discribe()+" 的行动失败了！准备重新执行指令");
        this.player.failed=0;
        this.reSetIssue();
    }
    this.runOrder();
};

AI_1.prototype.generateLink=function(){

    for(var i=0;i<this.base.w;i++){
        this.link[i]=[];
        for(var j=0;j<this.base.h;j++){
            this.link[i][j]={link:[],path:"",phase:0};
        }
    }

    for( i=0;i<this.base.w;i++){
        for( j=0;j<this.base.h;j++){
            for(var d=0;d<5;d++){
                var ij;
                var p=this.base.getPosition(ij=Global.addDirection([i,j],d)).getBlock();
                if(p.hasBlockType(Global.BLOCK_WALL)|| p.hasBlockType(Global.BLOCK_PLAYER) || this.base.isOut(ij)){
                    this.link[i][j].link[d]=null;
                }else{
                    this.link[i][j].link[d]=this.link[ij[0]]&&this.link[ij[0]][ij[1]];
                }
            }
        }
    }
};

AI_1.prototype.buildPath=function(){
    this.phase++;
    var p0=Global.fitPosition(this.player.position);
    var p=[this.link[p0[0]][p0[1]]];
    this.link[p0[0]][p0[1]].path="";
    var h=0;
    while(h< p.length){
        var c=p[h];
        c.phase=this.phase;
        var k=(Math.random()*3.999)>>0;
        for(var i=0;i<4;i++){
            var j=((k+i)%4)+1;
            if(c.link[j] && c.link[j].phase!=this.phase){
                p.push(c.link[j]);
                c.link[j].phase=this.phase;
                c.link[j].path= c.path+""+j;
            }
        }
        h++;
    }
};




AI_1.prototype.generatePathOrder=function(){

    this.resetOrder();
    this.generateLink();
    this.buildPath();
    this.issue.position=Global.fitPosition(this.issue.position,null,this.base.w,this.base.h);
    var c=this.link[this.issue.position[0]][this.issue.position[1]];
    if(c.phase==this.phase){
        var s="";
        var p= c.path;
        var q= p.length;
        for(var i=0;i<q;i++){
            this.addOrder(["ORDER_MOV",[+p[i]],-1]);
            s=s+Global.DIRECTION[+p[i]];
        }
        Global.log("生成路径 "+s);
        this.addOrder(["ORDER_AI_FINISH",[],-1]);
    }else{
        Global.log(this.player.discribe()+" 的AI没有找到通往("+this.issue.position[0]+","+this.issue.position[1]+")的路",1);
        this.addOrder(["ORDER_AI_FINISH",[],-1]);
    }
};

AI_1.prototype.setIssue=function(name,code,para){
    this.resetOrder();
    Global.log(this.player.discribe()+" 的AI收到命令"+name+"，参数("+para.toString()+")");
    this.current=[name,code,para];
    this[name](code,para);
};

AI_1.prototype.reSetIssue=function(){
    this.resetOrder();
    this[this.current[0]](this.current[1],this.current[2]);
};

AI_1.prototype.issueMoveTo=function(code,position){
    this.issue={position:position};
    Global.log(this.player.discribe()+" 的AI试图移动到("+this.issue.position[0]+","+this.issue.position[1]+")");

    this.return_object=code;
    this.generatePathOrder();
};

AI_1.prototype.issueRepeat=function(code,content){
    this.issue={code:content[0],time:content[1]};
    this.return_object=code;
    if(!content.accept){
        content.accept=1;
    }else{
        this.addOrder(["ORDER_AI_FINISH",[],-1]);
        return;
    }
    Global.log(this.player.discribe()+" 的AI将重复指令"+this.issue.code+" "+this.issue.time+"次");
    var p=OrderEmitter.parseOrder(this.issue.code);
    for(var i=0;i<this.issue.time;i++){
        this.addOrder(p);
    }
    this.addOrder(["ORDER_AI_FINISH",[],-1]);
};


AI_1.prototype.addOrder=OrderEmitter.addOrder;
AI_1.prototype.runOrder=OrderEmitter.runOrder;
AI_1.prototype.resetOrder=OrderEmitter.resetOrder;
AI_1.prototype.clearOrder=function(){
    OrderEmitter.resetOrder.call(this);
    this.addOrder(["ORDER_AI_FINISH",[],-1]);
};

Global.console=$g("div").$c("console");


