export const close=(a,b)=>Math.abs(a-b)<1e-6;
export const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);
export const midpoint=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
export const area=pts=>pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-q[0]*p[1];},0)/2;
function intersects(a,b,c,d){const orient=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);return orient(a,b,c)*orient(a,b,d)<=1e-9&&orient(c,d,a)*orient(c,d,b)<=1e-9;}
export function validQuad(p){
  return p?.length===4&&p.every(a=>a.length===2&&a.every(Number.isFinite))&&p.every((a,i)=>p.every((b,j)=>i===j||distance(a,b)>1e-6))&&Math.abs(area(p))>1e-6&&p.every((_,i)=>Math.abs(cross(p[i],p[(i+1)%4],p[(i+2)%4]))>1e-6)&&!intersects(p[0],p[1],p[2],p[3])&&!intersects(p[1],p[2],p[3],p[0]);
}
export function analyse(p){
  if(!validQuad(p))return {valid:false,families:[]};
  const sides=p.map((a,i)=>distance(a,p[(i+1)%4]));
  const angles=p.map((b,i)=>{const a=p[(i+3)%4],c=p[(i+1)%4],u=[a[0]-b[0],a[1]-b[1]],v=[c[0]-b[0],c[1]-b[1]];const angle=Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)))))*180/Math.PI;return cross(a,b,c)*area(p)<0?360-angle:angle;});
  const vec=(a,b)=>[b[0]-a[0],b[1]-a[1]],parallel=(u,v)=>close(u[0]*v[1]-u[1]*v[0],0);
  const pairs=[parallel(vec(p[0],p[1]),vec(p[3],p[2])),parallel(vec(p[0],p[3]),vec(p[1],p[2]))];
  const parallelogram=pairs.every(Boolean),rectangle=angles.every(n=>close(n,90)),rhombus=sides.every(n=>close(n,sides[0]));
  const kite=(close(sides[0],sides[1])&&close(sides[2],sides[3]))||(close(sides[0],sides[3])&&close(sides[1],sides[2]));
  const d1=vec(p[0],p[2]),d2=vec(p[1],p[3]);
  const flags={'Quadrilateral':true,'Trapezium':pairs.some(Boolean),'Parallelogram':parallelogram,'Rectangle':rectangle,'Rhombus':rhombus,'Kite':kite,'Square':rectangle&&rhombus};
  return {valid:true,convex:angles.every(a=>a<180),sides,angles,parallelPairs:pairs.filter(Boolean).length,diagonals:[distance(p[0],p[2]),distance(p[1],p[3])],bisect:distance(midpoint(p[0],p[2]),midpoint(p[1],p[3]))<1e-6,perpendicular:close(d1[0]*d2[0]+d1[1]*d2[1],0),families:Object.keys(flags).filter(k=>flags[k])};
}
export function fromDiagonals(a,b,angle){const t=angle*Math.PI/180;return [[-a/2,0],[b/2*Math.cos(t),b/2*Math.sin(t)],[a/2,0],[-b/2*Math.cos(t),-b/2*Math.sin(t)]];}
export function parallelogram(width=5,side=3,angle=60){const t=angle*Math.PI/180,x=side*Math.cos(t),y=side*Math.sin(t);return [[0,0],[width,0],[width+x,y],[x,y]];}
export const SHAPES={rectangle:[[0,0],[6,0],[6,3],[0,3]],square:[[0,0],[4,0],[4,4],[0,4]],parallelogram:[[0,0],[5,0],[7,3],[2,3]],rhombus:[[0,0],[5,0],[8,4],[3,4]],kite:[[0,0],[3,2],[0,6],[-3,2]],trapezium:[[0,0],[6,0],[4,3],[1,3]],isosceles:[[0,0],[6,0],[5,3],[1,3]],concave:[[0,0],[4,0],[1,1],[0,4]],general:[[0,0],[5,0],[6,3],[1,4]]};
export const FAMILIES=['Quadrilateral','Trapezium','Parallelogram','Rectangle','Rhombus','Kite','Square'];
export const starScore=(hits,total)=>hits/total>=.85?3:hits/total>=.55?2:1;
export const parseAnswer=s=>/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(String(s).trim())?Number(s):null;
export const pretty=n=>Number(n.toFixed(1)).toLocaleString('en-IN');
export const missingAngle=angles=>360-angles.reduce((a,b)=>a+b,0);
