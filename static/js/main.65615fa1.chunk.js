(this["webpackJsonptm.az-visuals.com"]=this["webpackJsonptm.az-visuals.com"]||[]).push([[0],{118:function(e,t,n){},119:function(e,t,n){},124:function(e,t,n){"use strict";n.r(t);var r={};n.r(r),n.d(r,"Walker",(function(){return D})),n.d(r,"toTree",(function(){return F}));var a,i,c=n(0),o=n.n(c),s=n(44),u=n.n(s),l=(n(79),n(32)),d=n(6),f=n(58),p=n(5),b=n(14),j=n(129),h=n(69),O=n(59),g=n(1),v=Object(c.createContext)({credentials:{signRequest:function(){return Promise.reject(new Error("Not Implemented"))}},logout:function(){throw new Error("Not Implemented")}}),x=function(e){var t=e.enabled,n=e.clientId,r=e.tenantId,a=e.redirectUri,i=e.logRedirectInfo,o=Object(c.useState)(!t),s=Object(b.a)(o,2),u=s[0],l=s[1],d=Object(c.useState)(),f=Object(b.a)(d,2),p=f[0],x=f[1],m=Object(c.useMemo)((function(){return t?new h.a({clientId:n,tenant:r,redirectUri:a}):{finalizeLogin:function(){return Promise.reject(new Error("Not implemented"))},login:function(){},logout:function(){}}}),[t,n,r,a]),y=Object(c.useMemo)((function(){return function(){m.logout()}}),[m]);return Object(c.useEffect)((function(){if(t){var e=Object(O.parse)(document.location.href.split("?")[1]||"");e&&e.token?(x(new j.a(e.token)),l(!0)):(console.log("Login begin: ".concat(document.location.hash)),m.finalizeLogin().then((function(e){e.isLoggedIn?(x(e.creds),l(!0)):(l(!1),x(void 0),m.login())})))}}),[t,m,i]),Object(g.jsx)(g.Fragment,{children:u?Object(g.jsx)(v.Provider,{value:{credentials:p,logout:y},children:e.children}):Object(g.jsx)("h1",{children:"Redirecting for authentication..."})})},m=n(9),y=n.n(m),w=n(22),k=n(67),I=n(68),M=n(62),C=n(63),E=n(64),S=n(45),A=n.n(S),N=A()("az-visuals.hierarchy.graph"),z=A()("az-visuals.hierarchy.graph.before"),D=function(){function e(t){Object(M.a)(this,e),this.options=t,this.graph=new E.DepGraph}return Object(C.a)(e,[{key:"walkAndBuild",value:function(e){var t=this;return Array.isArray(e)?e.forEach((function(e){return t.walkAndBuildInternal(e)})):this.walkAndBuildInternal(e),this.graph}},{key:"walkAndBuildInternal",value:function(e,t){var n=this,r=this.options.isParent(e),a=r?e:t;if(!this.options.isIgnored(e)&&"undefined"!==typeof e){var i=this.options.fields.getType(e),c=this.options.fields.getId(e);e[this.options.fields.type]=i,e[this.options.fields.id]=c;var o=Object(p.a)({},e);if(this.options.fields.strip().forEach((function(e){delete o[e]})),this.graph.hasNode(c)){var s=this.graph.getNodeData(c),u=Object(p.a)(Object(p.a)({},o),s);r=this.options.isParent(o),a=r?u:t,z("updating data for ".concat(c)),this.graph.setNodeData(c,u),N("updated data for ".concat(c))}else z("adding node ".concat(c)),this.graph.addNode(c,o),N("added node ".concat(c));if(!r){var l=this.options.fields.getId(t);z("".concat(c," will depend on ").concat(l)),this.graph.addDependency(c,l),N("".concat(c," depends on ").concat(l))}}if(Array.isArray(e))e.forEach((function(e){return n.walkAndBuildInternal(e,a)}));else if("object"===typeof e)for(var d in e){var f=e[d];this.walkAndBuildInternal(f,a)}}}]),e}(),F=function e(t,n){return n?t.directDependantsOf(n).map((function(n){return{_data:t.getNodeData(n),children:e(t,n)}})):t.overallOrder(!0).map((function(n){return{_data:t.getNodeData(n),children:e(t,n)}}))},R="Microsoft.Network/trafficManagerProfiles",T={textAnchor:"start",x:40},B={x:40,dy:"1.2em"},P=function(){var e=Object(w.a)(y.a.mark((function e(t,n){var r,a,i,c;return y.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=new k.a(t),e.next=3,r.tenants.list();case 3:return a=e.sent,i=a[0].tenantId,e.next=7,r.subscriptions.list();case 7:return c=e.sent,e.abrupt("return",c.filter((function(e){return n.test(e.displayName)||n.test(e.subscriptionId)})).map((function(e){return Object(p.a)(Object(p.a)({},e),{},{tenantId:i})})));case 9:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}(),L=function(){var e=Object(w.a)(y.a.mark((function e(t,n){var r,a;return y.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(r=ee(n.id).resourceGroup,!n.endpoints||!n.endpoints.find((function(e){return e.type!==R}))){e.next=8;break}return e.next=4,t.profiles.get(r,n.name);case 4:return a=e.sent,e.abrupt("return",Object(p.a)(Object(p.a)({},a),{},{rgName:r}));case 8:return e.abrupt("return",Object(p.a)(Object(p.a)({},n),{},{rgName:r}));case 9:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}(),U=function(){var e=Object(w.a)(y.a.mark((function e(t,n,r){var a,i,c;return y.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return a=n.map((function(e){return{client:new I.a(t,e.subscriptionId),tenantId:e.tenantId}})),e.next=3,Promise.all(a.map((function(e){return e.client.profiles.listBySubscription().then(function(){var t=Object(w.a)(y.a.mark((function t(n){var r;return y.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,Promise.all(n.map((function(t){return L(e.client,t)})));case 2:return r=t.sent,t.abrupt("return",r.map((function(t){return Object(p.a)(Object(p.a)({},t),{},{tenantId:e.tenantId})})));case 4:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}())})));case 3:return i=e.sent,c=i.flat(),e.abrupt("return",c.filter((function(e){return r.test(e.name)})));case 6:case"end":return e.stop()}}),e)})));return function(t,n,r){return e.apply(this,arguments)}}(),_={isIgnored:function(e){return $(e)||!(e.type===R||"Microsoft.Network/trafficManagerProfiles/nestedEndpoints"===e.type||"Microsoft.Network/trafficManagerProfiles/azureEndpoints"===e.type||"Microsoft.Network/trafficManagerProfiles/externalEndpoints"===e.type)},isParent:function(e){return!$(e)&&e.type===R},fields:{id:"id",type:"type",getId:function(e){var t;return null!==(t=e.targetResourceId)&&void 0!==t?t:e.id},getType:function(e){return e.type},strip:function(){return["tags"]}}},G=function(){var e=Object(w.a)(y.a.mark((function e(t,n,a){var i,c,o;return y.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,P(t,n);case 2:return i=e.sent,e.next=5,U(t,i,a);case 5:return c=e.sent,o=new r.Walker(_),e.abrupt("return",o.walkAndBuild(c));case 8:case"end":return e.stop()}}),e)})));return function(t,n,r){return e.apply(this,arguments)}}(),H=function(){var e=Object(w.a)(y.a.mark((function e(t,n,a){var i,c,o,s,u,l;return y.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return i=new URL(t),c="subscriptionFilter=".concat(encodeURIComponent(n.source),"&trafficManagerFilter=").concat(encodeURIComponent(a.source)),o="".concat(i.origin).concat(i.pathname),i.search&&i.search.length>0?o+="".concat(i.search,"&").concat(c):o+="?".concat(c),e.next=6,fetch(o);case 6:return s=e.sent,e.next=9,s.json();case 9:return u=e.sent,l=new r.Walker(_),e.abrupt("return",l.walkAndBuild(u));case 12:case"end":return e.stop()}}),e)})));return function(t,n,r){return e.apply(this,arguments)}}(),W=function(e){return"all"===e?/.+/:new RegExp(e)},q=function(e,t,n){var r=e.getNodeData(t);return{name:r.name,attributes:Y(r,n),children:V(e,t,n)}},V=function e(t,n,r){return t.directDependantsOf(n).map((function(a){var i=t.getNodeData(a);return i.tenantId||(i.tenantId=t.getNodeData(n).tenantId),{name:i.name,attributes:Y(i,r),children:e(t,a,r)}}))};!function(e){e.True="true",e.False="false"}(a||(a={})),function(e){e.Unknown="",e.Enabled="Enabled",e.Disabled="Disabled"}(i||(i={}));var J,K=function(e,t,n){return"https://".concat(e,"/#@{").concat(t,"}/resource").concat(n)},Q=function(e){return e.endpointStatus===i.Enabled&&"Degraded"!==e.endpointMonitorStatus&&"Disabled"!==e.endpointMonitorStatus&&"Inactive"!==e.endpointMonitorStatus&&"Stopped"!==e.endpointMonitorStatus},X=function(e){if(e.type===R){var t,n,r=null!==(t=null===(n=e.endpoints)||void 0===n?void 0:n.some((function(e){return Q(e)})))&&void 0!==t&&t;return e.profileStatus===i.Enabled&&r?a.True:a.False}return e.endpointStatus===i.Enabled&&Q(e)?a.True:a.False},Y=function(e,t){var n,r,a,i={type:e.type||"",routingMethod:e.trafficRoutingMethod||"",monitorStatus:(null===(n=e.monitorConfig)||void 0===n?void 0:n.profileMonitorStatus)||e.endpointMonitorStatus||"",enabled:e.profileStatus||e.endpointStatus||"",activeAndEnabled:X(e),portalUrl:K(t,e.tenantId,e.id)};("undefined"!==typeof e.weight&&(i.weight="".concat(e.weight)),"undefined"!==typeof e.geoMapping)&&(i.geographies=null!==(r=null===e||void 0===e||null===(a=e.geoMapping)||void 0===a?void 0:a.join(", "))&&void 0!==r?r:"world");return"undefined"!==typeof e.priority&&(i.priority="".concat(e.priority)),i},Z=function(e,t){return e.target.data.attributes.activeAndEnabled===a.True?"active-link":"inactive-link"},$=function(e){return"undefined"===typeof e||null===e},ee=function(e){var t=/\/resourceGroups\/(.+?)\/providers\/Microsoft.Network\/trafficManagerProfiles\/(.+)\/?/.exec(e);if(null==t||t.length<2)throw new Error("Invalid resourceId: '".concat(e,"'"));return{resourceGroup:t[1],name:t[2]}},te=n(66),ne=n.n(te);n(118);!function(e){e.Azure="azure",e.Custom="custom"}(J||(J={}));var re=function(e){var t=Object(d.h)(),n=t.subscription,r=t.trafficManager,a=function(e){var t,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",r=Object(c.useState)(null!==(t=localStorage.getItem(e))&&void 0!==t?t:n),a=Object(b.a)(r,2),i=a[0],o=a[1];return[i,function(t){localStorage.setItem(e,t),o(t)}]}("az-visuals.tm.landing-page","true"),i=Object(b.a)(a,2),o=i[0],s=i[1],u=W(n),l=W(r);return Object(g.jsx)("div",{style:{display:"flex",height:"100vh",overflow:"hidden"},children:"true"===o?Object(g.jsx)(ae,{onReady:function(){return s("false")}}):Object(g.jsx)(ie,Object(p.a)({portalHostname:e.portalHostname,subscriptionFilter:u,trafficManagerFilter:l},e.api))})},ae=function(e){return Object(g.jsxs)("div",{style:{textAlign:"center"},children:[Object(g.jsx)("h1",{children:"Traffic Manager Visualizer"}),Object(g.jsx)("h2",{children:"A tool to inspect complex traffic manager hierarchies"}),Object(g.jsx)("h4",{children:"Options:"}),Object(g.jsxs)("ul",{style:{listStyle:"none"},children:[Object(g.jsx)("li",{children:Object(g.jsxs)("p",{children:["Limit subscriptions with"," ",Object(g.jsx)("span",{style:{backgroundColor:"rgba(27,31,35,0.05)",borderRadius:"6px",color:"#2C7BB6"},children:"/subscriptions/<subscriptionRegex>/"})," "]})}),Object(g.jsx)("li",{children:Object(g.jsxs)("p",{children:["Limit traffic managers with"," ",Object(g.jsx)("span",{style:{backgroundColor:"rgba(27,31,35,0.05)",borderRadius:"6px",color:"#D7191C"},children:"/traffic-managers/<trafficManagerRegex>/"})," "]})}),Object(g.jsx)("li",{children:Object(g.jsxs)("p",{children:["Visualize a specific hierarchy root with"," ",Object(g.jsx)("span",{style:{backgroundColor:"rgba(27,31,35,0.05)",borderRadius:"6px",color:"#8C52FC"},children:"/?root=/full/path/to/root/tm"})," "]})}),Object(g.jsx)("li",{children:Object(g.jsxs)("p",{children:["For example:",Object(g.jsx)("br",{}),Object(g.jsxs)("span",{style:{backgroundColor:"rgba(27,31,35,0.05)",borderRadius:"6px"},children:["/#/subscriptions/",Object(g.jsx)("span",{style:{color:"#2C7BB6"},children:"94738bcd-b366-4610-8e4e-004d8fab4161"}),"/traffic-managers/",Object(g.jsx)("span",{style:{color:"#D7191C"},children:"all"}),"?root=",Object(g.jsx)("span",{style:{color:"#8C52FC"},children:"/subscriptions/94738bcd-b366-4610-8e4e-004d8fab4161/resourceGroups/tntviz-test/providers/Microsoft.Network/trafficManagerProfiles/prd-toplevel"})]})," "]})}),Object(g.jsx)("li",{children:Object(g.jsxs)("p",{children:["... or append"," ",Object(g.jsx)("span",{style:{backgroundColor:"rgba(27,31,35,0.05)",borderRadius:"6px"},children:"?token=<yourToken>"})," ","to the url, to use a custom token for authentication - and refresh the page."]})})]}),Object(g.jsx)("button",{onClick:e.onReady,children:"Begin"})]})},ie=function(e){var t,n=e.type,r=e.url,a=e.subscriptionFilter,i=e.trafficManagerFilter,o=e.portalHostname,s=Object(c.useContext)(v).credentials,u=new URLSearchParams(Object(d.g)().search),l=Object(d.f)(),f=Object(c.useState)(),j=Object(b.a)(f,2),h=j[0],O=j[1],x=Object(c.useState)([]),m=Object(b.a)(x,2),y=m[0],w=m[1],k=Object(c.useState)(),I=Object(b.a)(k,2),M=I[0],C=I[1],E=null!==(t=u.get("root"))&&void 0!==t?t:"first",S=Object(c.useCallback)((function(){return function(){var e;return null!==(e=y.find((function(e){return e===E})))&&void 0!==e?e:y[0]}}),[E,y]);return Object(c.useEffect)((function(){n===J.Azure?G(s,a,i).then((function(e){O(e)})):n===J.Custom&&H(r,a,i).then((function(e){O(e)}))}),[n,r,s,a,i]),Object(c.useEffect)((function(){if(h){var e=h.overallOrder(!0);w(e)}}),[h]),Object(c.useEffect)((function(){if(y.length>0){var e=S();C(e)}}),[y,E,S]),Object(c.useEffect)((function(){M&&l.replace(Object(p.a)(Object(p.a)({},l.location),{},{search:"?root=".concat(M)}))}),[M,l]),Object(g.jsx)(g.Fragment,{children:M?Object(g.jsx)(ce,{tree:q(h,M,o),treeId:M,availableRoots:y,requestTree:function(e){C(e)}}):Object(g.jsx)("h1",{children:"Loading..."})})},ce=function(e){var t=e.tree,n=e.treeId,r=e.availableRoots,a=e.requestTree,i=Object(c.useState)([]),o=Object(b.a)(i,2),s=o[0],u=o[1];Object(c.useEffect)((function(){u(r.map((function(e){return{label:e,value:e}})))}),[r]);return Object(g.jsxs)("div",{style:{display:"flex",flexDirection:"column",flexGrow:1,height:"100vh",border:"2px solid #777",borderBottomWidth:"0px",borderTopWidth:"0px"},children:[Object(g.jsx)("select",{value:n,onChange:function(e){a(e.currentTarget.value)},children:s.map((function(e){var t=e.label,n=e.value;return Object(g.jsx)("option",{value:n,children:t},n)}))}),t&&Object(g.jsx)(oe,{tree:t})]})},oe=function(e){return Object(g.jsx)(ne.a,{data:e.tree,orientation:"vertical",depthFactor:500,nodeSize:{x:400,y:400},pathClassFunc:Z,renderCustomNodeElement:function(e){return Object(g.jsx)(se,Object(p.a)({},e))}})},se=function(e){var t=e.nodeDatum,n=e.toggleNode,r=t.attributes,i=r.activeAndEnabled,c=r.portalUrl,o=Object(f.a)(r,["activeAndEnabled","portalUrl"]);return Object(g.jsxs)(g.Fragment,{children:[Object(g.jsx)("circle",{fill:i===a.True?"#2C7BB6":"#D7191C",r:15,onClick:function(){n()}}),Object(g.jsxs)("g",{className:"rd3t-label",children:[Object(g.jsx)("text",Object(p.a)(Object(p.a)({className:"rd3t-label__title"},T),{},{onClick:function(){window.open(c,"_blank")},children:t.name})),Object(g.jsx)("text",{className:"rd3t-label__attributes",children:o&&Object.entries(o).map((function(e,t){var n=Object(b.a)(e,2),r=n[0],a=n[1];return Object(g.jsxs)("tspan",Object(p.a)(Object(p.a)({},B),{},{children:[r,": ",a]}),"".concat(r,"-").concat(t))}))})]})]})},ue="traffic-managers",le="subscriptions";function de(){var e=function(){var e=Object(c.useState)(),t=Object(b.a)(e,2),n=t[0],r=t[1];return Object(c.useEffect)((function(){fetch("/runtime-manifest.json").then(function(){var e=Object(w.a)(y.a.mark((function e(t){var n;return y.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.json();case 2:n=e.sent,r(n);case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}())}),[]),n}();return e?Object(g.jsx)(fe,{manifest:e}):Object(g.jsx)("h1",{children:"Loading runtime"})}var fe=function(e){var t,n,r,a,i,c,o,s,u=e.manifest;return Object(g.jsx)(x,{enabled:u.apiType===J.Azure,clientId:null!==(t=null===(n=u.azure)||void 0===n?void 0:n.clientId)&&void 0!==t?t:"",redirectUri:null!==(r=null===(a=u.azure)||void 0===a?void 0:a.redirectUri)&&void 0!==r?r:"",tenantId:null!==(i=null===(c=u.azure)||void 0===c?void 0:c.tenantId)&&void 0!==i?i:"common",children:Object(g.jsx)(l.a,{children:Object(g.jsxs)(d.c,{children:[Object(g.jsx)(d.a,{exact:!0,path:"/",children:Object(g.jsxs)("div",{children:[Object(g.jsxs)("h1",{children:["Az-Visuals"," ",Object(g.jsx)("small",{children:"A collection of web-based tools for visualizing Azure resources. \u2601\ud83d\udd0e\ud83c\udf81"})]}),Object(g.jsx)("h3",{children:"Available Tools:"}),Object(g.jsx)("ul",{children:Object(g.jsx)("li",{children:Object(g.jsx)(l.b,{to:"/".concat(le,"/all/").concat(ue,"/all"),children:"Traffic Managers"})})})]})}),Object(g.jsx)(d.a,{path:"/".concat(le,"/:").concat("subscription","/").concat(ue,"/:").concat("trafficManager"),children:Object(g.jsx)(re,{api:{type:u.apiType,url:null!==(o=null===(s=u.custom)||void 0===s?void 0:s.url)&&void 0!==o?o:""},portalHostname:u.portalHostname})})]})})})};n(119);var pe=function(){return Object(g.jsx)(de,{})},be=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,134)).then((function(t){var n=t.getCLS,r=t.getFID,a=t.getFCP,i=t.getLCP,c=t.getTTFB;n(e),r(e),a(e),i(e),c(e)}))};u.a.render(Object(g.jsx)(o.a.StrictMode,{children:Object(g.jsx)(pe,{})}),document.getElementById("root")),be()},79:function(e,t,n){}},[[124,1,2]]]);
//# sourceMappingURL=main.65615fa1.chunk.js.map