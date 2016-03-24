/**
 * Created by xiexianbo on 16-1-28.
 * WebGL增强库
 * 主要包含了初始化、取WebGL纹理、WebGL文字纹理设置功能
 */

(function(){
    var a=function(){

    };


    var b=function(){
        if(!HTMLCanvasElement.prototype.getContext3D){
            HTMLCanvasElement.prototype.getContext3D=function(arg){
                arg=arg||{preserveDrawingBuffer:true};
                var c=this.getContext("webgl",arg)||this.getContext("experimental-webgl",arg);
                if(!c)return null;
                c.width=this.width;
                c.height=this.height;
                return c;
            }
        }
        if(!WebGLRenderingContext.prototype.setText){
            WebGLRenderingContext.prototype.setText=function(sTexture,sText,sFont,sColor){
                var a=WebGLRenderingContext._text_render_element; //All WebGl instance will use the same template
                if(!a){
                    WebGLRenderingContext._text_render_canvas=document.createElement("canvas");
                    WebGLRenderingContext._text_render_element=document.createElement("o");
                    a=WebGLRenderingContext._text_render_element;
                }
                a.style.opacity=0;
                a.style.position="absolute";
                a.innerHTML=sText;
                a.style.font=sFont;
                document.body.appendChild(a);
                var r= a.getClientRects();
                if(r.length){
                    r=r[0];
                }else{
                    return 0;
                }
                document.body.removeChild(a);

                a=WebGLRenderingContext._text_render_canvas;
                a.width= r.width+2;
                a.height= r.height+2;
                var c= a.getContext("2d");
                c.font = sFont;
                c.fillStyle = sColor;
                c.textAlign="left";
                c.textBaseline="top";
                c.fillText(sText,1,1);

                this.bindTexture(this.TEXTURE_2D,sTexture);
                this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR);
                this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR);
                this.texParameteri(this.TEXTURE_2D,this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);
                this.texParameteri(this.TEXTURE_2D,this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);
                this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, a);
                this.bindTexture(this.TEXTURE_2D, null);

                return 1;
            }
        }
        if(!WebGLRenderingContext.prototype.getImageData){
            WebGLRenderingContext.prototype.getImageData=function(x,y,w,h,notmirrored){
                var a={};

                w=w>>0;
                h=h>>0;
                x=x>>0;
                y=y>>0;
                a.width=w;
                a.height=h;
                var tbuff=new Uint8Array(w*h*4);
                var buff=tbuff;

                if(!notmirrored){
                    this.readPixels(x,this.height-y,w,h,this.RGBA,this.UNSIGNED_BYTE,tbuff);
                    buff=new Uint8Array(w*h*4);
                    for(var i=0;i<h;i++){

                        buff.set(tbuff.subarray(i*w*4,(i+1)*w*4-1),(h-i-1)*w*4);
                    }
                }else{
                    this.readPixels(x,y,w,h,this.RGBA,this.UNSIGNED_BYTE,tbuff);
                }
                //a.__proto__=ImageData;
                a.data=buff;
                return a;
            }
        }
        if(!CanvasRenderingContext2D.prototype._putImageData){
            CanvasRenderingContext2D.prototype._putImageData=CanvasRenderingContext2D.prototype.putImageData;
         }
        /**
         @param {ImageData||Object} image_data
         @param {Number} dx
         @param {Number} dy
         @param {Number} [dirtyX]
         @param {Number} [dirtyY]
         @param {Number} [dirtyWidth]
         @param {Number} [dirtyHeight]
         */
         CanvasRenderingContext2D.prototype.putImageData=function(image_data,dx,dy,dirtyX,dirtyY,dirtyWidth,dirtyHeight){
                if(image_data instanceof ImageData){
                    if(arguments.length==3){
                        this._putImageData(image_data,dx,dy);
                    }else{
                        this._putImageData(image_data,dx,dy,dirtyX,dirtyY,dirtyWidth,dirtyHeight);
                    }
                }else{
                    if(image_data.height && image_data.width && image_data.data){
                        var t=this.getImageData(0,0,image_data.width,image_data.height);
                        t.data.set(image_data.data);
                        if(arguments.length==3){
                            this._putImageData(t,dx,dy);
                        }else{
                            this._putImageData(t,dx,dy,dirtyX,dirtyY,dirtyWidth,dirtyHeight);
                        }
                    }
                }
         };



        if(!WebGLRenderingContext.prototype.useEShader){
            WebGLRenderingContext.prototype.useEShader=function(oEShader){
                var gl=this;
                var oShaderPrograms=oEShader;
                if(oShaderPrograms.program){
                    gl.useProgram(oShaderPrograms.program);
                    this.m_oUsingProgram=program;
                    return oShaderPrograms;
                }
                var program=oShaderPrograms;
                //gl.activeTexture(gl.TEXTURE0);
                //gl.activeTexture(gl.TEXTURE1);
                var fs=this.createFS(oShaderPrograms.fragment);
                var vs=this.createVS(oShaderPrograms.vertex);
                var shader_program=gl.createProgram();
                gl.attachShader(shader_program,vs);
                gl.attachShader(shader_program,fs);
                gl.linkProgram(shader_program);

                if(!gl.getProgramParameter(shader_program,gl.LINK_STATUS)){
                    alert("无法连接着色器")
                }
                program.program=shader_program;
                gl.useProgram(shader_program);
                this.m_oUsingProgram=program;
                for(var i in program.input){
                    var oInput=program.input[i];
                    var name=oInput[0];
                    if(oInput[1]==0){
                        oInput[4]=gl.getAttribLocation(oEShader.program,name);
                    }else if(oInput[1]==1){
                        oInput[4]=gl.getUniformLocation(oEShader.program,name);
                    }else if(oInput[1]==2){
                        oInput[4]=gl.getUniformLocation(oEShader.program,name);
                    }
                }
                return program;
            };
        }
        if(!WebGLRenderingContext.prototype.createFS){
            WebGLRenderingContext.prototype.createFS=function(sFragmentShader){
                var gl=this;
                var shader=gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(shader,sFragmentShader);
                gl.compileShader(shader);

                if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
                    alert("无法编译片段着色器");
                    return null;
                }

                return shader;
            };
        }
        if(!WebGLRenderingContext.prototype.createVS){
            WebGLRenderingContext.prototype.createVS=function(sVertexShader){
                var ctGl=this;

                var shader=ctGl.createShader(ctGl.VERTEX_SHADER);
                ctGl.shaderSource(shader,sVertexShader);
                ctGl.compileShader(shader);

                if(!ctGl.getShaderParameter(shader,ctGl.COMPILE_STATUS)){
                    alert("无法编译顶点着色器");
                    return null;
                }

                return shader;
            };
        }
        function generateDefaultShaders(e){
            e.ESHADER_VERTEXCOLOR_WIND={
                vertex://"precision mediump float;" +
                    "attribute vec2 aVertex;" +
                        "attribute vec4 aColor;" +
                        "varying vec4 vColor;" +
                        "uniform vec2 uWindow;" +
                        "void main(void) {" +
                        "gl_Position = vec4((aVertex*2.0/uWindow-1.0)*vec2(1.0,-1.0),0.0,1.0);" +
                        "vColor=aColor;" +
                        "}",

                fragment:"precision mediump float;" +
                    "varying vec4 vColor;" +
                    "void main(void) {" +
                    "gl_FragColor=vColor;" +
                    "}",
                input:{
                    vertexPos:["aVertex",0,2],
                    vertexUV:["aColor",0,4],
                    windowSize:["uWindow",1,2]

                }
            };
            e.ESHADER_UNIFORMCOLOR_WIND={
                vertex://"precision mediump float;" +
                    "attribute vec2 aVertex;" +
                        "varying vec4 vColor;" +
                        "uniform vec2 uWindow;" +
                        "void main(void) {" +
                        "gl_Position = vec4((aVertex*2.0/uWindow-1.0)*vec2(1.0,-1.0),0.0,1.0);" +
                        "vColor=aColor;" +
                        "}",

                fragment:"precision mediump float;" +
                    "uniform vec4 uColor;" +
                    "void main(void) {" +
                    "gl_FragColor=vColor;" +
                    "}",
                input:{
                    vertexPos:["aVertex",0,2],
                    vertexUV:["uColor",1,4],
                    windowSize:["uWindow",1,2]

                }
            };

        }


    };

    b();
    return a;
})();