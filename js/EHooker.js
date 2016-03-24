/**
 * Created by xiexianbo on 16-1-27.
 * JavaScript钩子库
 * 用于监视指定对象的方法调用
 * 同时还可以追踪该对象应用的call和apply（会重写call和apply函数，慎用）
 */



var ECH=(function(){
    var Hooker=function(){
        this._template={};
        this._trace_pool=[];
        if(!Function.prototype._apply)Function.prototype._apply=Function.prototype.apply;
        if(!Function.prototype._call)Function.prototype._call=Function.prototype.call;

    };
    Hooker._detach_hook=function(){
        Function.prototype.apply=Function.prototype._apply;
        Function.prototype.call=Function.prototype._call;
        Hooker._hooker_attached=0;
    };
    Hooker._hooker_attached=0;
    Hooker._attach_hook=function(){
        Function.prototype.apply=Hooker._apply_function;
        Function.prototype.call=Hooker._call_function;
        Hooker._hooker_attached=1;
    };
    Hooker._disable=0;
    Hooker._apply_function=function(thisArg,a){
        Hooker._detach_hook();
        var t;
        if(thisArg){
            if(thisArg._hook_main){
                t=thisArg._hook_main(null,this,a);
            }else{
                t=this._apply(thisArg,a);
            }
        }
        Hooker._attach_hook();
        return t;
    };

    Hooker._call_function=function(thisArg){

        Hooker._detach_hook();
        var t;
        if(thisArg){
            var p=[];
            for(var i=1;i<arguments.length;i++){
                p.push(arguments[i]);
            }
            if(thisArg._hook_main){
                t=thisArg._hook_main(null,this,p);
            }else{
                t=this._apply(thisArg,p);
            }
        }
        Hooker._attach_hook();
        return t;
    };




    Hooker.prototype={
        /**
         * 对targetObject的targetFunctionString函数添加钩子，使用相同参数，调用函数前引用recallFunctionStart，调用函数后引用recallFunctionEnd
         * @param {object} targetObject
         * @param {string} targetFunctionString;
         * @param {function} recallFunctionStart;
         * @param {function} recallFunctionEnd;
        */
        hook_object_function:function(targetObject,targetFunctionString,recallFunctionStart,recallFunctionEnd){
            if(!this._template[targetFunctionString]){
                this._template[targetFunctionString]=[];
            }
            var cls_function=targetObject[targetFunctionString]||targetObject.__proto__[targetFunctionString];
            if(!cls_function)return this;
            this._template[targetFunctionString].push([targetObject,cls_function,!targetObject[targetFunctionString]]);
            targetObject[targetFunctionString]=function(){
                if(recallFunctionStart)recallFunctionStart._apply(this,arguments);
                var rtn=cls_function._apply(this,arguments);
                if(recallFunctionEnd)recallFunctionEnd._apply(this,arguments,rtn);
                return rtn;
            };
            return this;
        },
        unhook_object_function:function(targetObject,targetFunctionString){
            var itm=this._template[targetFunctionString];
            if(!itm)return this;
            for(var i=0;i<itm.length;i++){
                if(itm[i]){
                    if(targetObject==itm[i][0]){
                        if(itm[i][2]){
                            delete targetObject[targetFunctionString];
                        }else{
                            targetObject[targetFunctionString]=itm[i][1];
                        }
                        delete itm[i];
                    }
                }
            }
            return this;
        },
        trace_object:function(targetObject,callBack,beforeObject,redirectObject){
            targetObject._hook_main=this._hook_main_dispacher;
            targetObject._hooker={callback:callBack,functions:{}};
            for(var i in targetObject){
                if(i=="_hook_main")continue;
                if(targetObject[i].__proto__==Function.prototype){
                    targetObject._hooker.functions[i]=targetObject[i];
                    (function(){
                        var u=targetObject[i];
                        var s=i;
                        targetObject[i]=function(){
                            var t;
                            if(beforeObject&&beforeObject[s])beforeObject[s].apply(beforeObject[s],arguments);
                            if(redirectObject&&beforeObject[s]){
                                t=redirectObject[s].apply(redirectObject[s],arguments);
                            }else{
                                t=this._hook_main(s,u,arguments);
                            }
                            return t;
                        }
                    })();
                }

            }
            if(targetObject.__proto__){

                for(var j in targetObject.__proto__){
                    if(j=="_hook_main")continue;
                    if(targetObject.__proto__[j].__proto__==Function.prototype){
                        targetObject._hooker.functions[j]=targetObject.__proto__[j];
                        (function(){
                            var u=targetObject.__proto__[j];
                            var s=i;
                            targetObject[i]=function(){
                                var t;
                                if(beforeObject&&beforeObject[s])beforeObject[s].apply(beforeObject[s],arguments);
                                if(redirectObject&&beforeObject[s]){
                                    t=redirectObject[s].apply(redirectObject[s],arguments);
                                }else{
                                    t=this._hook_main(s,u,arguments);
                                }
                                return t;
                            }
                        })();

                    }
                }
            }

        },

        enable_call_apply_intercept:function(){
            Hooker._attach_hook();
        },

        disable_call_apply_intercept:function(){
            Hooker._detach_hook();
        },





        _hook_main_dispacher:function(sCallName,fCallFunction,aArg){
            var t=Hooker._hooker_attached;
            if(t){
                Hooker._detach_hook();
            }
            /*
            if(Hooker._disable){
                if(!sCallName){
                    return 0;
                }else{
                    //this.__hooker[sCallName]._apply(this,aArg);
                    return fCallFunction._apply(this,aArg);
                }
            }
            */
            //Hooker._disable=1;
            //console.log("Hooked!");
            //Hooker._disable=0;
           // if(!sCallName){
           //     return 0;
           // }else{
                //this.__hooker[sCallName]._apply(this,aArg);
           //     return fCallFunction._apply(this,aArg);
           // }

            var t2=fCallFunction._apply(this,aArg);
            if(!Hooker._disable){
            Hooker._disable=1;
            if(this._hooker.callback)this._hooker.callback(sCallName,fCallFunction,aArg,t2);

            console.log("(",this,") is called by ",sCallName?sCallName:fCallFunction," .");
            Hooker._disable=0;
            }



            if(t){
                Hooker._attach_hook();
            }
            return t2;
        }


    };
    return Hooker;
})();