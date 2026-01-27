import{b as D,I as _,d as M,e as U,w as W,_ as b,f as s,h as N,i as R,y as q,j as x,k as S,l as F}from"./reactNode-D4IkgGug.js";import{r as l,R as h}from"./index-V_9YcWOP.js";function G(n){return n.replace(/-(.)/g,function(e,o){return o.toUpperCase()})}function H(n,e){W(n,"[@ant-design/icons] ".concat(e))}function k(n){return b(n)==="object"&&typeof n.name=="string"&&typeof n.theme=="string"&&(b(n.icon)==="object"||typeof n.icon=="function")}function I(){var n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return Object.keys(n).reduce(function(e,o){var r=n[o];switch(o){case"class":e.className=r,delete e.class;break;default:delete e[o],e[G(o)]=r}return e},{})}function T(n,e,o){return o?h.createElement(n.tag,s(s({key:e},I(n.attrs)),o),(n.children||[]).map(function(r,a){return T(r,"".concat(e,"-").concat(n.tag,"-").concat(a))})):h.createElement(n.tag,s({key:e},I(n.attrs)),(n.children||[]).map(function(r,a){return T(r,"".concat(e,"-").concat(n.tag,"-").concat(a))}))}function E(n){return D(n)[0]}function z(n){return n?Array.isArray(n)?n:[n]:[]}var J=`
.anticon {
  display: inline-flex;
  align-items: center;
  color: inherit;
  font-style: normal;
  line-height: 0;
  text-align: center;
  text-transform: none;
  vertical-align: -0.125em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.anticon > * {
  line-height: 1;
}

.anticon svg {
  display: inline-block;
}

.anticon::before {
  display: none;
}

.anticon .anticon-icon {
  display: block;
}

.anticon[tabindex] {
  cursor: pointer;
}

.anticon-spin::before,
.anticon-spin {
  display: inline-block;
  -webkit-animation: loadingCircle 1s infinite linear;
  animation: loadingCircle 1s infinite linear;
}

@-webkit-keyframes loadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes loadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
`,K=function(e){var o=l.useContext(_),r=o.csp,a=o.prefixCls,c=o.layer,t=J;a&&(t=t.replace(/anticon/g,a)),c&&(t="@layer ".concat(c,` {
`).concat(t,`
}`)),l.useEffect(function(){var d=e.current,u=M(d);U(t,"@ant-design-icons",{prepend:!c,csp:r,attachTo:u})},[])},Q=["icon","className","onClick","style","primaryColor","secondaryColor"],C={primaryColor:"#333",secondaryColor:"#E6E6E6",calculated:!1};function V(n){var e=n.primaryColor,o=n.secondaryColor;C.primaryColor=e,C.secondaryColor=o||E(e),C.calculated=!!o}function X(){return s({},C)}var f=function(e){var o=e.icon,r=e.className,a=e.onClick,c=e.style,t=e.primaryColor,d=e.secondaryColor,u=N(e,Q),y=l.useRef(),m=C;if(t&&(m={primaryColor:t,secondaryColor:d||E(t)}),K(y),H(k(o),"icon should be icon definiton, but got ".concat(o)),!k(o))return null;var i=o;return i&&typeof i.icon=="function"&&(i=s(s({},i),{},{icon:i.icon(m.primaryColor,m.secondaryColor)})),T(i.icon,"svg-".concat(i.name),s(s({className:r,onClick:a,style:c,"data-icon":i.name,width:"1em",height:"1em",fill:"currentColor","aria-hidden":"true"},u),{},{ref:y}))};f.displayName="IconReact";f.getTwoToneColors=X;f.setTwoToneColors=V;function j(n){var e=z(n),o=R(e,2),r=o[0],a=o[1];return f.setTwoToneColors({primaryColor:r,secondaryColor:a})}function Y(){var n=f.getTwoToneColors();return n.calculated?[n.primaryColor,n.secondaryColor]:n.primaryColor}var Z=["className","icon","spin","rotate","tabIndex","onClick","twoToneColor"];j(F.primary);var g=l.forwardRef(function(n,e){var o=n.className,r=n.icon,a=n.spin,c=n.rotate,t=n.tabIndex,d=n.onClick,u=n.twoToneColor,y=N(n,Z),m=l.useContext(_),i=m.prefixCls,v=i===void 0?"anticon":i,$=m.rootClassName,A=q($,v,x(x({},"".concat(v,"-").concat(r.name),!!r.name),"".concat(v,"-spin"),!!a||r.name==="loading"),o),p=t;p===void 0&&d&&(p=-1);var O=c?{msTransform:"rotate(".concat(c,"deg)"),transform:"rotate(".concat(c,"deg)")}:void 0,L=z(u),w=R(L,2),P=w[0],B=w[1];return l.createElement("span",S({role:"img","aria-label":r.name},y,{ref:e,tabIndex:p,onClick:d,className:A}),l.createElement(f,{icon:r,primaryColor:P,secondaryColor:B,style:O}))});g.displayName="AntdIcon";g.getTwoToneColor=Y;g.setTwoToneColor=j;var nn={icon:{tag:"svg",attrs:{viewBox:"0 0 1024 1024",focusable:"false"},children:[{tag:"path",attrs:{d:"M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"}}]},name:"loading",theme:"outlined"},en=function(e,o){return l.createElement(g,S({},e,{ref:o,icon:nn}))},an=l.forwardRef(en);export{g as I,an as R};
