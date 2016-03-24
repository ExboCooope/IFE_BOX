/**
 * Created by xiexianbo on 15-12-16.
 * 简易矩阵库
 * 直接增强Float32Array
 */
Float32Array.identity=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
Float32Array.prototype.multM4=function(a){
    this.set(this.newMultM4(a));
    return this;
};

Float32Array.prototype.newMult4=function(a){
    var m3=new Float32Array(4);
    var j;
    for(j=0;j<4;j++){
        m3[j]=a[0]*this[j]+a[1]*this[j+4]+a[2]*this[j+8]+a[3]*this[j+12];
    }
    return m3;
};
Float32Array.prototype.newMultM4=function(a){
    var m3=new Float32Array(16);
    var i;
    var j;
    for(i=0;i<16;i+=4){
        for(j=0;j<4;j++){
            m3[i+j]=a[i]*this[j]+a[i+1]*this[j+4]+a[i+2]*this[j+8]+a[i+3]*this[j+12];
        }
    }
    return m3;
};

Float32Array.prototype.newMultM4B=function(a){
    var m3=new Float32Array(16);
    var i;
    var j;
    m3[0]=a[0]*this[0]+a[1]*this[4]+a[2]*this[8]+a[3]*this[12];
    m3[1]=a[0]*this[1]+a[1]*this[5]+a[2]*this[9]+a[3]*this[13];
    m3[2]=a[0]*this[2]+a[1]*this[6]+a[2]*this[10]+a[3]*this[14];
    m3[3]=a[0]*this[3]+a[1]*this[7]+a[2]*this[11]+a[3]*this[15];
    m3[4]=a[4]*this[0]+a[5]*this[4]+a[6]*this[8]+a[7]*this[12];
    m3[5]=a[4]*this[1]+a[5]*this[5]+a[6]*this[9]+a[7]*this[13];
    m3[6]=a[4]*this[2]+a[5]*this[6]+a[6]*this[10]+a[7]*this[14];
    m3[7]=a[4]*this[3]+a[5]*this[7]+a[6]*this[11]+a[7]*this[15];
    m3[8]=a[8]*this[0]+a[9]*this[4]+a[10]*this[8]+a[11]*this[12];
    m3[9]=a[8]*this[1]+a[9]*this[5]+a[10]*this[9]+a[11]*this[13];
    m3[10]=a[8]*this[2]+a[9]*this[6]+a[10]*this[10]+a[11]*this[14];
    m3[11]=a[8]*this[3]+a[9]*this[7]+a[10]*this[11]+a[11]*this[15];
    m3[12]=a[12]*this[0]+a[13]*this[4]+a[14]*this[8]+a[15]*this[12];
    m3[13]=a[12]*this[1]+a[13]*this[5]+a[14]*this[9]+a[15]*this[13];
    m3[14]=a[12]*this[2]+a[13]*this[6]+a[14]*this[10]+a[15]*this[14];
    m3[15]=a[12]*this[3]+a[13]*this[7]+a[14]*this[11]+a[15]*this[15];
    return m3;
};


function arrayNewMultM4(o,a){
    var m3=[];
    var i;
    var j;
    for(i=0;i<16;i+=4){
        for(j=0;j<4;j++){
            m3[i+j]=a[i]*o[j]+a[i+1]*o[j+4]+a[i+2]*o[j+8]+a[i+3]*o[j+12];
        }
    }
    return m3;
}

Float32Array.prototype.setIdentity=function(){
    this.set(Float32Array.identity);
    return this;
};

function EMat4(a){
    return a?(new Float32Array(a)):(new Float32Array(16));
}
function EVec4(a){
    return a?(new Float32Array(a)):(new Float32Array(4));
}

function EVec3(a){
    return a?(new Float32Array(a)):(new Float32Array(3));
}

Float32Array.prototype.normalize3=function(){
    var a=this[0]*this[0]+this[1]*this[1]+this[2]*this[2];
    if(a){
        a=1/Math.sqrt(a);
        this[0]*=a;
        this[1]*=a;
        this[2]*=a;
    }
   // console.log(this);
    return this;
};
Float32Array.prototype.normalize4=function(){
    var a=this[3];
    if(a){
        a=1/a;
        this[0]*=a;
        this[1]*=a;
        this[2]*=a;
    }
    //console.log(this);
    return this;
};
Float32Array.prototype.pow3=function(a){
    this[0]*=a[0];
    this[1]*=a[1];
    this[2]*=a[2];
    return this;
};
Float32Array.prototype.pot=function(a){
    return this[0]*a[0]+this[1]*a[1]+this[2]*a[2];
};
Float32Array.prototype.newSub3=function(a){
    return new Float32Array([this[0]-a[0],this[1]-a[1],this[2]-a[2]]);
};
Float32Array.prototype.sub3=function(a){
    this[0]-=a[0];
    this[1]-=a[1];
    this[2]-=a[2];
    return this;
};

Float32Array.prototype.add3=function(a){
    this[0]+=a[0];
    this[1]+=a[1];
    this[2]+=a[2];
    return this;
};
Float32Array.prototype.mulS3=function(a){
    this[0]*=a;
    this[1]*=a;
    this[2]*=a;
    return this;
};

Float32Array.prototype.newCross=function(a){
    return new Float32Array([this[1]*a[2]-this[2]*a[1],this[2]*a[0]-this[0]*a[2],this[0]*a[1]-this[1]*a[0]]);
};


Float32Array.prototype.translateXYZ=function(x,y,z){
    this[12]=this[0]*x+this[4]*y+this[8]*z+this[12];
    this[13]=this[1]*x+this[5]*y+this[9]*z+this[13];
    this[14]=this[2]*x+this[6]*y+this[10]*z+this[14];
    this[15]=this[3]*x+this[7]*y+this[11]*z+this[15];
    return this;
};

Float32Array.prototype.translate3=function(a){
    this[12]=this[0]*a[0]+this[4]*a[1]+this[8]*a[2]+this[12];
    this[13]=this[1]*a[0]+this[5]*a[1]+this[9]*a[2]+this[13];
    this[14]=this[2]*a[0]+this[6]*a[1]+this[10]*a[2]+this[14];
    this[15]=this[3]*a[0]+this[7]*a[1]+this[11]*a[2]+this[15];
    return this;
};

Float32Array.prototype.setLookAt=function(eye,center,up){
    var fD=EVec3(center).sub3(eye).normalize3();
    var fUD=EVec3(up).normalize3();
    var fC=fD.newCross(fUD).normalize3();
    var fU=fC.newCross(fD).normalize3();
  //  console.log(this);
    this.set([fC[0],fU[0],-fD[0],0,fC[1],fU[1],-fD[1],0,fC[2],fU[2],-fD[2],0,0,0,0,1]);
    this.translateXYZ(-eye[0],-eye[1],-eye[2]);
    return this;
};

Float32Array.prototype.lookAt=function(eye,center,up){
    return this.multM4(EMat4().setLookAt(eye,center,up));
};

Float32Array.prototype.newLookAt=function(eye,center,up){
    return EMat4(this).lookAt(eye,center,up);
};

Float32Array.prototype.newLookDirectionV=function(eye,dir,f,up){
    return EMat4(this).lookAt(eye,EVec3(dir).normalize3().mulS3(f).add3(eye),up);
};

Float32Array.prototype.rotateXY3=function(x,y){
    var nx=this[0]*Math.cos(y)+this[2]*Math.sin(y);
    var nz=-this[0]*Math.sin(y)+this[2]*Math.cos(y);
    var q=Math.sqrt(nx*nx+nz*nz);
    var t=Math.atan(this[1]/q);
    t+=x;
    if(t>Math.PI/2-0.01)t=Math.PI/2-0.01;
    if(t<-Math.PI/2+0.01)t=-Math.PI/2+0.01;
    var ny=Math.tan(t);
    this.set([nx/q,ny,nz/q]);
};

Float32Array.prototype.setPerspective=function(tfov,cut){
    var n=cut[0];
    var f=cut[1];
    var w=2*tfov[0]*n;
    var h=2*tfov[1]*n;
    var a=(f+n)/(n-f);
    var b=2*n*f/(n-f);
    this.set([2*n/w,0,0,0,0,2*n/h,0,0, 0,0,a,-1,0,0,b,0]);
    return this;
};

var test=EMat4().setPerspective([1,1],[5,100]);
function testp(x,y,z){
    var v=test.newMult4([x,y,z,1]).normalize4();
    console.log(v[0],v[1],v[2]);
}