(function () {
	'use strict';

	/**
	 * @sugarch/bc-mod-hook-manager v0.3.4
	 *
	 * Copyright (c) 2025 SugarChain Studio
	 * License: MIT
	 * https://github.com/SugarChain-Studio/sugarch-utilities
	 * @preserve
	 */
	let t$2 = class t{constructor(t){this.hookMng=t,this.workList=[];}run(t,o){let i,n=false;for(const s of this.workList)if("inject"===s.value)s.work(t,o);else if("next"===s.value)i=o(t),n=true;else if("override"===s.value)i=s.work(t,o),n=true;else if("flag"===s.value){if(!s.flag)break;s.once&&(s.flag=false);}else if("check"===s.value&&!s.work(t,o))break;return n?i:o(t)}next(){return this.workList.push({value:"next"}),this}inject(t){return this.workList.push({value:"inject",work:t}),this}inside(t,{once:o=false,priority:i=1}={}){const n={value:"flag",flag:false,once:o};return this.hookMng.hookFunction(t,i,(t,o)=>{n.flag=true;const i=o(t);return n.flag=false,i}),this.workList.push(n),this}when(t){return this.workList.push({value:"check",work:t}),this}override(t){return this.workList.push({value:"override",work:t}),this}};let o$1;let i$1 = class i{static info(t){o$1?.info(t);}static warn(t){o$1?.warn(t);}static error(t){o$1?.error(t);}};let n$2 = class n{constructor(t=false){this.done=t,this.list=[];}run(){for(this.done=true;this.list.length>0;)this.list.shift()();}push(t){this.done?t():this.list.push(t);}};const s$2=new n$2,r$2=new n$2,e$1=new n$2,h$1=new n$2;function l$1(){return null!=globalThis.Player&&"number"==typeof globalThis.Player.MemberNumber}const u$1=new class{constructor(){this.mMod=void 0;}get mod(){return this.mMod}push(t,o){t.push(o);}initWithMod(t){this.mMod=t,h$1.run(),r$2.run();const o=()=>e$1.run();l$1()?o():this.mod.hookFunction("LoginResponse",0,(t,i)=>{i(t),l$1()&&o();}),s$2.run();}afterInit(t){this.push(s$2,t);}afterPlayerLogin(t){this.push(e$1,t);}patchFunction(t,o){this.push(h$1,()=>this.mod.patchFunction(t,o));}invokeOriginal(t,...o){return this.mod?this.mod.callOriginal(t,o):globalThis[t]?.(...o)}hookFunction(t,o,i){this.push(r$2,()=>this.mod.hookFunction(t,o,i));}progressiveHook(o,i=1){const n=new t$2(this);return this.hookFunction(o,i,(t,o)=>n.run(t,o)),n}insideFlag(t,o=1){const i={inside:false,args:void 0};return this.hookFunction(t,o,(t,o)=>{i.inside=true,i.args=t;const n=o(t);return i.inside=false,n}),i}hookPlayerFunction(t,o,i){var n;n=()=>this.mod.hookFunction(t,o,i),l$1()?e$1.push(n):n();}globalFunction(t,o){"function"!=typeof o&&i$1.warn("globalFunction: param is not a function"),null==globalThis[t]?globalThis[t]=o:globalThis[t]!=o&&i$1.warn(`globalFunction: ${t} is already defined`);}randomGlobalFunction(t,o){const i=t=>t+Math.random().toString(16).substring(2);let n=i(t);for(;null!=globalThis[n];)n=i(t);return globalThis[n]=o,n}setLogger(t){!function(t){o$1=t;}(t);}};

	/**
	 * @sugarch/bc-asset-manager v1.4.0
	 *
	 * Copyright (c) 2026 SugarChain Studio
	 * License: MIT
	 * https://github.com/SugarChain-Studio/sugarch-utilities
	 * @preserve
	 */
	let t$1 = class t{constructor(e,t){this.fulfilled=e,this.value=t;}then(e,t){ void 0!==this.value?e(this.value):t?t(this.value):console.error("Promise rejected without handler",this.value);}static resolve(e){return new t(true,e)}static reject(e){return new t(false,e)}};const r$1={},s$1={},n$1={},o=[],i=(e,t)=>s$1[e]?.[t];function a$1(){return r$1}function c(){return s$1}let u;function l(e){return !!(e&&e.Asset&&i(e.Asset.Group.Name,e.Asset.Name))}const m=new Set(["ItemTorso","ItemTorso2"]),f={ItemTorso:m,ItemTorso2:m},h={},p={};function E(e){return (f[e]&&Array.from(f[e])||[e]).map(e=>d(e))}function d(e){return {name:e,group:AssetGroupGet("Female3DCG",e),groupDef:AssetFemale3DCG.find(t=>t.Group===e)||n$1[e]}}function A(e){return h[e]}class I{static add(e){for(const[t,r]of Object.entries(e))for(const[e,s]of Object.entries(r))E(t).forEach(({name:t})=>{AssetFemale3DCGExtended[t]||(AssetFemale3DCGExtended[t]={}),AssetFemale3DCGExtended[t][e]||(AssetFemale3DCGExtended[t][e]=s);});}static get value(){return AssetFemale3DCGExtended}}const g={};class N{static add(e,t){return 0===Object.keys(g).length&&AssetFemale3DCG.forEach(e=>{g[e.Group]||(g[e.Group]={});for(const t of e.Asset){const r=$(t);g[e.Group][r.Name]=r;}}),g[e]||(g[e]={}),g[e][t.Name]=t,g}static get value(){return g}}function $(e){return "string"==typeof e?{Name:e}:e}
	/**
	 * @sugarch/bc-mod-i18n v0.0.4
	 *
	 * Copyright (c) 2026 SugarChain Studio
	 * License: MIT
	 * https://github.com/SugarChain-Studio/sugarch-utilities
	 * @preserve
	 */function L$1(e,t){const r="TW"!==TranslationLanguage?TranslationLanguage:"CN";let s=e(r);return void 0!==s?s:(s="CN"===r?e("CN"):e("EN")||e("CN"),void 0!==s?s:t)}function R(e,t){return L$1(t=>e[t],t)}function O(e,t,r){return L$1(r=>e[r]?.[t],r)}function G(e,t,r,s){return L$1(s=>e[s]?.[t]?.[r],s)}const v=new class{constructor(){this.translateEntry=R,this.translateString=O,this.translateGroupedEntries=G;}},C={};function D(e,t,r){for(const[s,n]of Object.entries(r)){C[s]||(C[s]={});for(const[r,o]of Object.entries(n))C[s][`${e}${t}${r}`]=o;}}let S=false;function T(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var y,F,w,b;function M(){if(F)return y;F=1;const e="object"==typeof process&&process.env&&process.env.NODE_DEBUG&&/\bsemver\b/i.test(process.env.NODE_DEBUG)?(...e)=>console.error("SEMVER",...e):()=>{};return y=e}function P(){if(b)return w;b=1;const e=Number.MAX_SAFE_INTEGER||9007199254740991;return w={MAX_LENGTH:256,MAX_SAFE_COMPONENT_LENGTH:16,MAX_SAFE_BUILD_LENGTH:250,MAX_SAFE_INTEGER:e,RELEASE_TYPES:["major","premajor","minor","preminor","patch","prepatch","prerelease"],SEMVER_SPEC_VERSION:"2.0.0",FLAG_INCLUDE_PRERELEASE:1,FLAG_LOOSE:2}}var _,j,x,U,k,B,X,V,W,H,z,Z={exports:{}};function J(){return _||(_=1,function(e,t){const{MAX_SAFE_COMPONENT_LENGTH:r,MAX_SAFE_BUILD_LENGTH:s,MAX_LENGTH:n}=P(),o=M(),i=(t=e.exports={}).re=[],a=t.safeRe=[],c=t.src=[],u=t.safeSrc=[],l=t.t={};let m=0;const f="[a-zA-Z0-9-]",h=[["\\s",1],["\\d",n],[f,s]],p=(e,t,r)=>{const s=(e=>{for(const[t,r]of h)e=e.split(`${t}*`).join(`${t}{0,${r}}`).split(`${t}+`).join(`${t}{1,${r}}`);return e})(t),n=m++;o(e,n,t),l[e]=n,c[n]=t,u[n]=s,i[n]=new RegExp(t,r?"g":void 0),a[n]=new RegExp(s,r?"g":void 0);};p("NUMERICIDENTIFIER","0|[1-9]\\d*"),p("NUMERICIDENTIFIERLOOSE","\\d+"),p("NONNUMERICIDENTIFIER",`\\d*[a-zA-Z-]${f}*`),p("MAINVERSION",`(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})`),p("MAINVERSIONLOOSE",`(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})`),p("PRERELEASEIDENTIFIER",`(?:${c[l.NONNUMERICIDENTIFIER]}|${c[l.NUMERICIDENTIFIER]})`),p("PRERELEASEIDENTIFIERLOOSE",`(?:${c[l.NONNUMERICIDENTIFIER]}|${c[l.NUMERICIDENTIFIERLOOSE]})`),p("PRERELEASE",`(?:-(${c[l.PRERELEASEIDENTIFIER]}(?:\\.${c[l.PRERELEASEIDENTIFIER]})*))`),p("PRERELEASELOOSE",`(?:-?(${c[l.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[l.PRERELEASEIDENTIFIERLOOSE]})*))`),p("BUILDIDENTIFIER",`${f}+`),p("BUILD",`(?:\\+(${c[l.BUILDIDENTIFIER]}(?:\\.${c[l.BUILDIDENTIFIER]})*))`),p("FULLPLAIN",`v?${c[l.MAINVERSION]}${c[l.PRERELEASE]}?${c[l.BUILD]}?`),p("FULL",`^${c[l.FULLPLAIN]}$`),p("LOOSEPLAIN",`[v=\\s]*${c[l.MAINVERSIONLOOSE]}${c[l.PRERELEASELOOSE]}?${c[l.BUILD]}?`),p("LOOSE",`^${c[l.LOOSEPLAIN]}$`),p("GTLT","((?:<|>)?=?)"),p("XRANGEIDENTIFIERLOOSE",`${c[l.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`),p("XRANGEIDENTIFIER",`${c[l.NUMERICIDENTIFIER]}|x|X|\\*`),p("XRANGEPLAIN",`[v=\\s]*(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:${c[l.PRERELEASE]})?${c[l.BUILD]}?)?)?`),p("XRANGEPLAINLOOSE",`[v=\\s]*(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:${c[l.PRERELEASELOOSE]})?${c[l.BUILD]}?)?)?`),p("XRANGE",`^${c[l.GTLT]}\\s*${c[l.XRANGEPLAIN]}$`),p("XRANGELOOSE",`^${c[l.GTLT]}\\s*${c[l.XRANGEPLAINLOOSE]}$`),p("COERCEPLAIN",`(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`),p("COERCE",`${c[l.COERCEPLAIN]}(?:$|[^\\d])`),p("COERCEFULL",c[l.COERCEPLAIN]+`(?:${c[l.PRERELEASE]})?`+`(?:${c[l.BUILD]})?(?:$|[^\\d])`),p("COERCERTL",c[l.COERCE],true),p("COERCERTLFULL",c[l.COERCEFULL],true),p("LONETILDE","(?:~>?)"),p("TILDETRIM",`(\\s*)${c[l.LONETILDE]}\\s+`,true),t.tildeTrimReplace="$1~",p("TILDE",`^${c[l.LONETILDE]}${c[l.XRANGEPLAIN]}$`),p("TILDELOOSE",`^${c[l.LONETILDE]}${c[l.XRANGEPLAINLOOSE]}$`),p("LONECARET","(?:\\^)"),p("CARETTRIM",`(\\s*)${c[l.LONECARET]}\\s+`,true),t.caretTrimReplace="$1^",p("CARET",`^${c[l.LONECARET]}${c[l.XRANGEPLAIN]}$`),p("CARETLOOSE",`^${c[l.LONECARET]}${c[l.XRANGEPLAINLOOSE]}$`),p("COMPARATORLOOSE",`^${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]})$|^$`),p("COMPARATOR",`^${c[l.GTLT]}\\s*(${c[l.FULLPLAIN]})$|^$`),p("COMPARATORTRIM",`(\\s*)${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]}|${c[l.XRANGEPLAIN]})`,true),t.comparatorTrimReplace="$1$2$3",p("HYPHENRANGE",`^\\s*(${c[l.XRANGEPLAIN]})\\s+-\\s+(${c[l.XRANGEPLAIN]})\\s*$`),p("HYPHENRANGELOOSE",`^\\s*(${c[l.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[l.XRANGEPLAINLOOSE]})\\s*$`),p("STAR","(<|>)?=?\\s*\\*"),p("GTE0","^\\s*>=\\s*0\\.0\\.0\\s*$"),p("GTE0PRE","^\\s*>=\\s*0\\.0\\.0-0\\s*$");}(Z,Z.exports)),Z.exports}function Y(){if(X)return B;X=1;const e=M(),{MAX_LENGTH:t,MAX_SAFE_INTEGER:r}=P(),{safeRe:s,t:n}=J(),o=function(){if(x)return j;x=1;const e=Object.freeze({loose:true}),t=Object.freeze({});return j=r=>r?"object"!=typeof r?e:r:t}(),{compareIdentifiers:i}=function(){if(k)return U;k=1;const e=/^[0-9]+$/,t=(t,r)=>{const s=e.test(t),n=e.test(r);return s&&n&&(t=+t,r=+r),t===r?0:s&&!n?-1:n&&!s?1:t<r?-1:1};return U={compareIdentifiers:t,rcompareIdentifiers:(e,r)=>t(r,e)},U}();class a{constructor(i,c){if(c=o(c),i instanceof a){if(i.loose===!!c.loose&&i.includePrerelease===!!c.includePrerelease)return i;i=i.version;}else if("string"!=typeof i)throw new TypeError(`Invalid version. Must be a string. Got type "${typeof i}".`);if(i.length>t)throw new TypeError(`version is longer than ${t} characters`);e("SemVer",i,c),this.options=c,this.loose=!!c.loose,this.includePrerelease=!!c.includePrerelease;const u=i.trim().match(c.loose?s[n.LOOSE]:s[n.FULL]);if(!u)throw new TypeError(`Invalid Version: ${i}`);if(this.raw=i,this.major=+u[1],this.minor=+u[2],this.patch=+u[3],this.major>r||this.major<0)throw new TypeError("Invalid major version");if(this.minor>r||this.minor<0)throw new TypeError("Invalid minor version");if(this.patch>r||this.patch<0)throw new TypeError("Invalid patch version");u[4]?this.prerelease=u[4].split(".").map(e=>{if(/^[0-9]+$/.test(e)){const t=+e;if(t>=0&&t<r)return t}return e}):this.prerelease=[],this.build=u[5]?u[5].split("."):[],this.format();}format(){return this.version=`${this.major}.${this.minor}.${this.patch}`,this.prerelease.length&&(this.version+=`-${this.prerelease.join(".")}`),this.version}toString(){return this.version}compare(t){if(e("SemVer.compare",this.version,this.options,t),!(t instanceof a)){if("string"==typeof t&&t===this.version)return 0;t=new a(t,this.options);}return t.version===this.version?0:this.compareMain(t)||this.comparePre(t)}compareMain(e){return e instanceof a||(e=new a(e,this.options)),i(this.major,e.major)||i(this.minor,e.minor)||i(this.patch,e.patch)}comparePre(t){if(t instanceof a||(t=new a(t,this.options)),this.prerelease.length&&!t.prerelease.length)return  -1;if(!this.prerelease.length&&t.prerelease.length)return 1;if(!this.prerelease.length&&!t.prerelease.length)return 0;let r=0;do{const s=this.prerelease[r],n=t.prerelease[r];if(e("prerelease compare",r,s,n),void 0===s&&void 0===n)return 0;if(void 0===n)return 1;if(void 0===s)return  -1;if(s!==n)return i(s,n)}while(++r)}compareBuild(t){t instanceof a||(t=new a(t,this.options));let r=0;do{const s=this.build[r],n=t.build[r];if(e("build compare",r,s,n),void 0===s&&void 0===n)return 0;if(void 0===n)return 1;if(void 0===s)return  -1;if(s!==n)return i(s,n)}while(++r)}inc(e,t,r){if(e.startsWith("pre")){if(!t&&false===r)throw new Error("invalid increment argument: identifier is empty");if(t){const e=`-${t}`.match(this.options.loose?s[n.PRERELEASELOOSE]:s[n.PRERELEASE]);if(!e||e[1]!==t)throw new Error(`invalid identifier: ${t}`)}}switch(e){case "premajor":this.prerelease.length=0,this.patch=0,this.minor=0,this.major++,this.inc("pre",t,r);break;case "preminor":this.prerelease.length=0,this.patch=0,this.minor++,this.inc("pre",t,r);break;case "prepatch":this.prerelease.length=0,this.inc("patch",t,r),this.inc("pre",t,r);break;case "prerelease":0===this.prerelease.length&&this.inc("patch",t,r),this.inc("pre",t,r);break;case "release":if(0===this.prerelease.length)throw new Error(`version ${this.raw} is not a prerelease`);this.prerelease.length=0;break;case "major":0===this.minor&&0===this.patch&&0!==this.prerelease.length||this.major++,this.minor=0,this.patch=0,this.prerelease=[];break;case "minor":0===this.patch&&0!==this.prerelease.length||this.minor++,this.patch=0,this.prerelease=[];break;case "patch":0===this.prerelease.length&&this.patch++,this.prerelease=[];break;case "pre":{const e=Number(r)?1:0;if(0===this.prerelease.length)this.prerelease=[e];else {let s=this.prerelease.length;for(;--s>=0;)"number"==typeof this.prerelease[s]&&(this.prerelease[s]++,s=-2);if(-1===s){if(t===this.prerelease.join(".")&&false===r)throw new Error("invalid increment argument: identifier already exists");this.prerelease.push(e);}}if(t){let s=[t,e];false===r&&(s=[t]),0===i(this.prerelease[0],t)?isNaN(this.prerelease[1])&&(this.prerelease=s):this.prerelease=s;}break}default:throw new Error(`invalid increment argument: ${e}`)}return this.raw=this.format(),this.build.length&&(this.raw+=`+${this.build.join(".")}`),this}}return B=a}var Q,q,K,ee,te=T(function(){if(z)return H;z=1;const e=function(){if(W)return V;W=1;const e=Y();return V=(t,r,s=false)=>{if(t instanceof e)return t;try{return new e(t,r)}catch(e){if(!s)return null;throw e}}}();return H=(t,r)=>{const s=e(t,r);return s?s.version:null}}());var re$1=function(){if(ee)return K;ee=1;const e=function(){if(q)return Q;q=1;const e=Y();return Q=(t,r,s)=>new e(t,s).compare(new e(r,s)),Q}();return K=(t,r,s)=>e(t,r,s)<0,K}(),se=T(re$1);
	/**
	 * @sugarch/bc-mod-utility v0.2.11
	 *
	 * Copyright (c) 2026 SugarChain Studio
	 * License: MIT
	 * https://github.com/SugarChain-Studio/sugarch-utilities
	 * @preserve
	 */
	function ne(e){return globalThis[e]}class oe{static _initStorage(){var e,t;ne(this._namespace)||(e=this._namespace,t={},globalThis[e]=t);}static get(e,t){this._initStorage();const r=ne(this._namespace);return e in r||(r[e]=t()),r[e]}static getMayOverride(e,t){this._initStorage();const r=ne(this._namespace);return r[e]=t(r[e]),r[e]}static getByVersion(e,t,r,s){if(this._initStorage(),!te(t))throw new Error(`Invalid version for ${e}: ${t}`);const n=ne(this._namespace),o=`${e}.__Version`,i=n[e],a=n[o];return i?a&&!se(a,t)||(n[e]=s(a,i),n[o]=t):(n[e]=r(i),n[o]=t),n[e]}static set(e,t){this._initStorage(),ne(this._namespace)[e]=t;}static has(e){return this._initStorage(),e in ne(this._namespace)}static delete(e){this._initStorage();const t=ne(this._namespace);return e in t&&delete t[e]}static setImplementation(e){const t=["get","set","has","delete"];for(const r of t){if("function"!=typeof e[r])throw new Error(`Implementation must provide a '${r}' function`);oe[r]=e[r];}}static createNamespace(e){return {get:(t,r)=>oe.get(`${e}.${t}`,r),getMayOverride:(t,r)=>oe.getMayOverride(`${e}.${t}`,r),set:(t,r)=>oe.set(`${e}.${t}`,r),has:t=>oe.has(`${e}.${t}`),delete:t=>oe.delete(`${e}.${t}`)}}}oe._namespace="__BC_LUZI_GLOBALS__";const ie=oe.createNamespace("OnceFlag");function ae(e,t){ie.get(e,()=>false)||(ie.set(e,true),t());}function ce(e){return new Promise(t=>setTimeout(t,e))}let ue=class{static get emptyImage(){return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAG3RFWHRTb2Z0d2FyZQBDZWxzeXMgU3R1ZGlvIFRvb2zBp+F8AAAADUlEQVQI12P4//8/AwAI/AL+XJ/P2gAAAABJRU5ErkJggg=="}static assetPreviewIconPath(e){const t="Asset"in e?e.Asset:e;return `${AssetGetPreviewPath(t)}/${t.Name}.png`}static activityPreviewIconPath(e){return `Assets/Female3DCG/Activity/${("Activity"in e?e.Activity:e).Name}.png`}};class le{get globalFuncName(){return this._globalFuncName}constructor(e,t){this.functions=[],this._globalFuncName=`${e}_${Math.random().toString(16).substring(2)}`,this.functions.push((e,...r)=>t(...r)),globalThis[this._globalFuncName]=(...e)=>this.run(...e);}register(e){return this.functions.push(e),this}run(...e){let t;for(const r of this.functions)t=r(t,...e);return t}}function me(e,t,r){return oe.get(e,()=>{const s=new le(e,t);return r?.(s),s})}function fe(e){return v.translateEntry(e,e.CN)}function he(e,t){return e?e.CN?e:{...e,CN:t}:{CN:t}}function pe(e,t,r){const s={};for(const[n,o]of Object.entries(r))o[e]?.[t]&&(s[n]=o[e][t]);return s}function Ee(e,t,r){const s={};for(const[n,o]of Object.entries(r))o[e]?.[t]&&(s[n]=o[e][t]);return s}const de={},Ae={};class Ie{static setAsset(e,t,r){Object.entries(r).forEach(([r,s])=>{const n=r;de[n]||(de[n]={}),de[n][e]||(de[n][e]={}),de[n][e][t]=s;});}static setGroup(e,t){Object.entries(t).forEach(([t,r])=>{const s=t;Ae[s]||(Ae[s]={}),Ae[s][e]=r;});}}function ge(e,t){e.Description=t;}function Ne(){Object.values(a$1()).forEach(e=>ge(e,function(e){return v.translateString(Ae,e,e.replace(/_.*?Luzi$/,""))}(e.Name))),Object.values(c()).map(e=>Object.values(e)).flat().forEach(e=>ge(e,function(e,t){return v.translateGroupedEntries(de,e,t,t.replace(/_.*?Luzi$/,""))}(e.Group.Name,e.Name))),Object.entries(c()).map(([e,t])=>({group:A(e),asset:t})).filter(({group:e})=>!!e).map(({group:e,asset:t})=>Object.entries(t).map(([t,r])=>({asset:r,fromAsset:AssetGet("Female3DCG",e,t)}))).flat().filter(({fromAsset:e})=>!!e).forEach(({asset:e,fromAsset:t})=>ge(e,t.Description));const e=TextAllScreenCache.get(AssetStringsPath),t=e=>{const t=p,r=new Set,s=AssetGroup.map(e=>e.Name).sort((e,t)=>t.length-e.length);Object.entries(e.cache).forEach(([n,o])=>{if(r.has(n))return;const i=s.find(e=>n.startsWith(e));if(!i)return;r.add(n);const a=t[i];if(!a)return;const c=n.slice(i.length);a.forEach(t=>{const r=t+c;e.cache[r]||(e.cache[r]=o);});});};e&&(e.loaded?t(e):e.rebuildListeners.push(e=>e&&t(e)));}let $e=false;const Le=new Map,Re=new Map;let Oe,Ge,ve;function Ce(e,t,r){const s=e.get(t);if(s){const n=r.noOverride?{...r.desc,...s.desc}:{...s.desc,...r.desc},o=r.noOverride?s.fallback:r.fallback;e.set(t,{desc:n,fallback:o,noOverride:r.noOverride});}else e.set(t,r);}function De(e,t,r,s=false){s&&Le.has(e)||Ce(Le,e,{desc:t,fallback:r,noOverride:s});}function Se(e,t,r,s=false){s&&Re.has(e)||Ce(Re,e,{desc:t,fallback:r,noOverride:s});}function Te(e){const t={};for(const[r,s]of Object.entries(e))for(const[e,n]of Object.entries(s))t[e]||(t[e]={}),t[e][r]=n;return Object.entries(t).reduce((e,[t,r])=>(e.push({key:t,value:r}),e),[])}function ye(e,t,{entries:r,noOverride:s}={}){const n=function(e){if(!e)return e=>({CN:e});const t={};for(const[r,s]of Object.entries(e))for(const[e,n]of Object.entries(s))t[e]||(t[e]={}),t[e][r]=n;return e=>t[e]||{CN:e}}(r),o=new Set;t.Layer?.filter(e=>!e.CopyLayerColor&&(e.AllowColorize??true)&&!e.HideColoring).forEach(({Name:r,ColorGroup:i})=>{r?De(`${e}${t.Name}${r}`,n(r),r,!!s):De(`${e}${t.Name}`,{CN:t.Name.replace(/_.*?Luzi$/,"")},t.Name,!!s),i&&o.add(i);}),o.forEach(r=>Se(`${e}${t.Name}${r}`,n(r),r,!!s));}function Fe(){me("LayerNameInject",()=>{},t=>u$1.patchFunction("ItemColorLoad",{"ItemColorGroupNames = new TextCache(`Assets/${c.AssetFamily}/ColorGroups.csv`);":`ItemColorGroupNames = new TextCache(\`Assets/\${c.AssetFamily}/ColorGroups.csv\`);${t.globalFuncName}(()=>ItemColorLayerNames, ()=>ItemColorGroupNames);`})).register((e,t,r)=>{Oe=t,Ge=r;}),u$1.hookFunction("ItemColorLoad",0,(e,t)=>{const r=t(e),s=Oe?.();var n;s&&s.cache&&(n=s,Le.forEach((e,t)=>{n.cache[t]&&e.noOverride||(n.cache[t]=v.translateEntry(e.desc,e.fallback));}));const o=Ge?.();return o&&o.cache&&function(e){Re.forEach((t,r)=>{e.cache[r]&&t.noOverride||(e.cache[r]=v.translateEntry(t.desc,t.fallback));});}(o),r});}class we{static info(e){ve?.info(e);}static warn(e){ve?.warn(e);}static error(e){ve?.error(e);}}let be=false;const Me=[];function Pe(e){be?e():Me.push(e);}const _e=[];let je=false;function xe(e){je?e():_e.push(e);}const Ue={};const ke={};function Be(e,t){const r=AssetGroupGet("Female3DCG",e);be&&r?t(r):(ke[e]||(ke[e]=[]),ke[e].push(t));}let Xe=false;const Ve=[];function We(e){Xe?e():Ve.push(e);}const He=new Set;function ze(t={start:"Start loading",end:"Loading completed, time usage: "}){const r=async()=>{we.info(t.start);const e=Date.now();for(!function(){for(;Me.length>0;)Me.shift()();}(),be=true,function(){for(;_e.length>0;)_e.shift()();}(),je=true,AssetGroup.forEach(e=>function(e){if(Ue[e.Name])for(;Ue[e.Name].length>0;)Ue[e.Name].shift()(e);}(e)),AssetGroup.forEach(e=>function(e){if(ke[e.Name])for(;ke[e.Name].length>0;)ke[e.Name].shift()(e);}(e)),CraftingAssets=CraftingAssetsPopulate(),Xe=true;Ve.length>0;)Ve.shift()();const r=Date.now();we.info(`${t.end} ${r-e}ms`);};AssetGroup.length>50?r():u$1.progressiveHook("AssetLoadAll",1).next().inject(()=>r());}function Ze(r,n,{extendedConfig:i,translation:a,dynamicName:u,preimage:l,noMirror:m,layerNames:f,assetStrings:h}={}){!function(e,t){const r=AssetGroupGet("Female3DCG",e);be&&r?t(r):(Ue[e]||(Ue[e]=[]),Ue[e].push(t));}(r,e=>{N.add(e.Name,n),i&&I.add(i);});const p=r;!function(e,t,r){const s=r=>{const n=t?[d(e)]:E(e),o=n.find(({group:e})=>!e);if(o)return He.has(o.name)?void console.error(`[AssetManager] Required group "${o.name}" not found`):(He.add(o.name),void Be(o.name,()=>s(r)));n.forEach(({group:e,groupDef:t})=>r(e,t));};be?s(r):Be(e,()=>s(r));}(r,!!m,(r,i)=>{const m=r.Name,E=$(n),d=AssetResolveCopyConfig.AssetDefinition(E,m,N.value);if(!d)return;const A=he(a,d.Name.replace(/_.*?Luzi$/,""));void 0!==c()[m]?.[E.Name]&&console.warn(`[AssetManager] Asset {${m}:${E.Name}} already existed!`),function(...[r,n,o,i]){u$1.invokeOriginal("AssetAdd",r,n,o,i);const a=r.Name,c=n.Name;s$1[a]||(s$1[a]={});const u=AssetGet("Female3DCG",a,c);return u?(s$1[a][c]=u,t$1.resolve(u)):t$1.reject(`Asset ${a}:${c} not found`)}(r,d,I.value,i).then(e=>{if(e.DynamicGroupName===e.Group.Name&&(e.DynamicGroupName=u||p),l){const t=AssetGet("Female3DCG",l.Name,d.Name);t&&(e.Description=t.Description,e.DynamicGroupName=t.DynamicGroupName,["ScriptDraw","BeforeDraw","AfterDraw"].filter(e=>t[`Dynamic${e}`]).forEach(e=>function(e,t,r,s){const n=`Assets${t}${r.Name}${s}`,o=`Assets${e}${r.Name}${s}`;globalThis[n]&&(globalThis[o]=globalThis[n]);}(m,l.Name,d,e)));}else e.Description=fe(A),function(e,t){o.push({name:e,asset:t});}(d.Name,e),ye(e.DynamicGroupName,d,{entries:f,noOverride:!f});h&&D(e.Group.Name,e.Name,h);}),Ie.setAsset(m,d.Name,A);});}const Je={};const Ye={};function Qe(e,t,r){if(!e.DialogPrefix){const s=`${t}${r}`;if("modular"===e.Archetype)return {DialogPrefix:{Header:`${s}Select`,Module:`${s}Module`,Option:`${s}Option`,Chat:`${s}Set`}};if("typed"===e.Archetype)return {DialogPrefix:{Header:`${s}Select`,Option:s,Chat:`${s}Set`,Npc:s}}}return {}}function qe(s,{translation:o,dynamicName:i,preimage:a}={}){Pe(()=>{const c=he(o,s.Group.replace(/_.*?Luzi$/,""));((function(...[s,o]){const i=u$1.invokeOriginal("AssetGroupAdd",s,o);return r$1[i.Name]=i,n$1[i.Name]=o,t$1.resolve(i)}))("Female3DCG",s).then(e=>{e.Description=fe(c),i&&(e.DynamicGroupName=i);const t=(()=>{if(!a)return;const e=AssetFemale3DCGExtended[a.Name];if(!e)return;const t={};for(const[r,s]of Object.entries(e))t[r]={Archetype:s.Archetype,CopyConfig:{GroupName:a.Name,AssetName:r},...Qe(s,a.Name,r)};return {[s.Group]:t}})();s.Asset.forEach(e=>{const r=$(e);if(t&&a){const e=Ye[a.Name]?.[r.Name];e&&We(()=>{const n=AssetGet("Female3DCG",s.Group,r.Name);n&&AssetBuildExtended(n,e,t,null,false);});}Ze(s.Group,r,{dynamicName:i,preimage:a,extendedConfig:t});});}),Ie.setGroup(s.Group,c);});}Pe(()=>{let t=false;u$1.hookFunction("AssetBuildExtended",0,(e,r)=>{if(t){const[t,r]=e;return Ye[t.Group.Name]??={},Ye[t.Group.Name][t.Name]=r,null}return r(e)}),t=true,u$1.invokeOriginal("ExtendedItemManualRegister"),t=false;});const Ke=new Set;function et(e,t,r,s){const n=()=>{const o=AssetFemale3DCG.find(e=>e.Group===t)||a$1()[t],i=AssetGroupGet("Female3DCG",t),c=AssetFemale3DCGExtended[t];if(!o||!i)return Ke.has(t)?void console.error(`[AssetManager] Group ${t} not found`):(Ke.add(t),void xe(n));var u,l;l=e,f[u=t]||(f[u]=new Set([u])),f[u].add(l),p[u]||(p[u]=new Set),p[u].add(l),h[l]=u;const m=he(r,e.replace(/_.*?Luzi$/,""));qe({...o,...s,Group:e,Default:false,Random:false},{translation:m,dynamicName:o.DynamicGroupName||o.Group,preimage:i}),AssetFemale3DCGExtended[e]=c;};xe(n);}function tt(){let t=false;u$1.hookFunction("DialogInventoryBuild",0,(e,r)=>{e[2]||(t="permissions"!==DialogMenuMode);const s=r(e);return "items"!==DialogMenuMode&&null!==DialogMenuMode||!u||e[0].IsPlayer()||u(e[0])||(DialogInventory=DialogInventory.filter(e=>!l(e))),s});const r=(t,r,s)=>{const n=h[s];return !!n&&u$1.invokeOriginal("InventoryAvailable",t,r,n)};u$1.hookFunction("DialogInventoryAdd",10,(e,s)=>{const n=s(e);if(!t)return n;t=false;const o=e[1].Asset.Group.Name,i=new Set(DialogInventory.map(e=>e.Asset.Name)),a=c()[o];return a?(Object.entries(a).filter(([e])=>!i.has(e)).filter(([t,s])=>s.Value>=0||r(e[0],t,o)).forEach(([t,r])=>DialogInventoryAdd(e[0],{Asset:r},false)),n):n});const s=[u$1.insideFlag("CharacterAppearanceValidate"),u$1.insideFlag("CraftingItemListBuild"),u$1.insideFlag("WardrobeFastLoad"),u$1.insideFlag("CraftingValidate")];u$1.hookFunction("InventoryAvailable",0,(...[e,t])=>s.some(e=>e.inside)&&!(!function(e,t){const r=i(e,t);return !!r&&r.Value>=0}(e[2],e[1])&&!r(...e))||t(e));}let rt,st=false;function nt(t){rt=t,st||(st=true,u$1.hookFunction("ValidationResolveRemoveDiff",1,(e,t)=>{const[r,s]=e;return s.C.IsPlayer()&&!s.fromModUser&&i(r.Asset.Group.Name,r.Asset.Name)?{item:r,valid:false}:t(e)}),u$1.hookFunction("ValidationResolveSwapDiff",1,(e,t)=>{const[r,s,n]=e;return n.C.IsPlayer()&&!n.fromModUser&&i(r.Asset.Group.Name,r.Asset.Name)?{item:r,valid:false}:t(e)}),u$1.hookFunction("ValidationResolveAppearanceDiff",1,(e,t)=>(rt&&(e[3].fromModUser=rt(e[3])),t(e))));}
	/**
	 * @sugarch/bc-image-mapping v2.2.0
	 *
	 * Copyright (c) 2026 SugarChain Studio
	 * License: MIT
	 * https://github.com/SugarChain-Studio/sugarch-utilities
	 * @preserve
	 */function ot(e,t){const r=new Set;let s=e;for(;t[s];){if(r.has(s))return console.warn(`Circular dependency detected during resolution: ${s}`),"";r.add(s),s=t[s];}return s}function it(e){const t={};for(const r of Object.keys(e)){const s=ot(r,e);if(!s)return console.warn(`Circular dependency detected during optimization: ${r}`),null;t[r]=s;}return t}class at{constructor(e,t){this.path=e,this.storage=t;}map(e){const t=Array.isArray(e)?e:[e],r={};for(const e of t)r[e]=this.path;return this.storage.addImgMapping(r),this}resolve(e){return this.storage.addImgMapping({[this.path]:e}),this}}const ct=new class{constructor(){this.basic={},this.custom={},this.customSrc={};}addImgMapping(e){const t={...this.customSrc,...e},r=it(t);r?(this.customSrc=t,this.custom=r):console.warn("Failed to add mappings due to circular dependencies.");}rebuildCustomMapping(){const e=it(this.customSrc);e?this.custom=e:console.warn("Failed to rebuild mappings due to circular dependencies.");}migrateTo(e){e.customSrc={...e.customSrc,...this.customSrc},e.basic={...e.basic,...this.basic},e.rebuildCustomMapping(),this.customSrc=e.customSrc,this.basic=e.basic,this.custom=e.custom;}setBasicImgMapping(e){this.basic={...e,...this.basic};}mapImgSrc(e){if("string"!=typeof e)return e;if(!e.endsWith(".png"))return e;if(e.startsWith("blob:"))return e;if(e.startsWith("data:"))return e;if(e.startsWith("http:"))return e;if(e.startsWith("https:"))return e;if(e.startsWith("@nomap/"))return e;const t=e.startsWith("./")?e.slice(2):e;let r=t;return this.custom[r]&&(r=this.custom[r]),this.basic[r]&&(r=this.basic[r]),r!==t?r:e}mapImg(e,t){let r=e;r.startsWith("data:image")||r.startsWith("http")||(this.custom[r]&&(r=this.custom[r]),this.basic[r]&&(r=this.basic[r]),r!==e&&t(r));}};class ut{constructor(){ae("ImgMappingOnce.GLDrawLoadImage.crossOrigin",()=>{u$1.patchFunction("GLDrawLoadImage",{"Img.src = url;":'Img.crossOrigin = "Anonymous";\n\t\tImg.src = url;'});}),["DrawImageEx","DrawImageResize","GLDrawImage","DrawGetImage"].forEach(t=>{u$1.hookFunction(t,10,(e,t)=>(e[0]=ct.mapImgSrc(e[0]),t(e)));}),ae("ImgMappingOnce.nomap",()=>{["DrawImageEx","DrawImageResize","GLDrawImage","DrawGetImage"].forEach(t=>{u$1.hookFunction(t,0,(e,t)=>("string"==typeof e[0]&&e[0].startsWith("@nomap/")&&(e[0]=e[0].substring(7)),t(e)));});}),u$1.hookFunction("GLDrawLoadTextureAlphaMask",0,(e,t)=>(Array.isArray(e[5])&&(e[5]=e[5].map(e=>({...e,Url:ct.mapImgSrc(e.Url)}))),t(e))),(async()=>{await function(e,t=100){return (async()=>{for(;!e();)await ce(t);})()}(()=>void 0!==globalThis.ElementButton),u$1.hookFunction("ElementButton.CreateForAsset",0,(e,t)=>(ct.mapImg(ue.assetPreviewIconPath(e[1]),t=>{e[4]={...e[4],image:t};}),t(e))),u$1.hookFunction("ElementButton.CreateForActivity",0,(e,t)=>{const r=e[1],s=e[4]?.image??(r.Item?ue.assetPreviewIconPath(r.Item.Asset):`Assets/Female3DCG/Activity/${r.Activity.Name}.png`);return ct.mapImg(s,t=>{e[4]={...e[4],image:t};}),t(e)}),u$1.hookFunction("ElementButton.Create",0,(e,t)=>{if(e[0]?.startsWith("dialog-inventory")){const t=e[2];t?.icons&&(t.icons=t.icons.map(e=>{if("string"==typeof e&&e.endsWith("Padlock")){const t=`Assets/Female3DCG/ItemMisc/Preview/${e}.png`,r=ct.mapImgSrc(t);if(r!==t)return {name:e,iconSrc:r,tooltipText:InterfaceTextGet("PreviewIconPadlock").replace("AssetName",AssetGet("Female3DCG","ItemMisc",e)?.Description??e)}}return e}));}if(e[0]?.startsWith("dialog-expression-button-grid-Emoticon")){const t=e[2];t?.image&&(t.image=ct.mapImgSrc(t.image));}return t(e)});})();}get storage(){return ct}addImgMapping(e){ct.addImgMapping(e);}setBasicImgMapping(e){ct.setBasicImgMapping(e);}createVirtualPath(e){return new at(e,ct)}}const lt=oe.get("ImageMapping@2.2.0",()=>new ut);const mt=new class{addAsset(e,t,r,s,n=false){if(r){Ze(e,t,{extendedConfig:{[e]:{[t.Name]:r}},translation:s,noMirror:n});}else Ze(e,t,{translation:s,noMirror:n});}addAssetWithConfig(e,t,r){const s=(e,t,r)=>{const s=Array.isArray(e)?e:[e],n={[t.Name]:r.extended},o={translation:r.translation,noMirror:r.noMirror,layerNames:r.layerNames,...r.extended?{extendedConfig:Object.fromEntries(s.map(e=>[e,n]))}:{},assetStrings:r.assetStrings};for(const e of s)Ze(e,t,o);};if(function(e){return Array.isArray(e)&&(0===e.length||Array.isArray(e[0])&&3===e[0].length)}(e))for(const[t,r,n]of e)s(t,r,n);else if(t&&Array.isArray(t))for(const[r,n]of t)s(e,r,n);else t&&r&&s(e,t,r);}addGroupedAssetsWithConfig(e,t,r){for(const[s,n]of Object.entries(e))for(const e of n){const n=s;Ze(n,e,{translation:Ee(n,e.Name,t),layerNames:pe(n,e.Name,r)});}}addGroupedAssets(e,t,r){for(const[s,n]of Object.entries(e))for(const e of n){const n=s,o=t&&Ee(n,e.Name,t);Ze(n,e,{extendedConfig:r&&r[n]?.[e.Name]&&{[n]:{[e.Name]:r[n][e.Name]}},translation:o});}}addGroupedConfig(e){!function(e){e&&I.add(e);}(e);}modifyAsset(e,t,r){!function(e,t,r){"string"==typeof e&&(e=[e]);for(const s of e){const e=n=>{const o=AssetGet("Female3DCG",n.Name,t);if(o)r(n,o);else {if(Je[s]||(Je[s]=new Set),Je[s].has(t))return void console.error(`[AssetManager] Asset ${s}:${t} not found`);Je[s].add(t),Be(s,e);}};Be(s,e);}}(e,t,r);}supplyExtended(t,r,s,n){!function(t,r,s,n){We(()=>{const o=Array.isArray(t)?t:[t];for(const t of o){const o=AssetGet("Female3DCG",t,r);o?I.value[t]?.[r]?console.warn(`[AssetManager] Asset {${t}:${r}} already has extended config!`):(I.add({[t]:{[r]:s}}),u$1.invokeOriginal("AssetBuildExtended",o,s,I.value),D(o.Group.Name,o.Name,n)):console.error(`[AssetManager] Asset {${t}:${r}} not found`);}});}(t,r,s,n);}modifyAssetLayers(e,t){!function(e,t){We(()=>{Asset.filter(e).forEach(e=>{e.Layer.forEach(r=>t(e,r));});});}(e,t);}modifyGroup(e,t){!function(e,t){Be(e,e=>t(e));}(e,t);}addCustomAssetString(e){!function(e){for(const[t,r]of Object.entries(e)){C[t]||(C[t]={});for(const[e,s]of Object.entries(r))C[t][e]=s,e.includes("ItemTorso2")?C[t][e.replace("ItemTorso2","ItemTorso")]=s:e.includes("ItemTorso")&&(C[t][e.replace("ItemTorso","ItemTorso2")]=s);}}(e);}addImageMapping(e){lt.addImgMapping(e);}get imageMapping(){return lt}addGroup(e,t){qe(e,{translation:t});}addCopyGroup(e,t,r,s){et(e,t,r,s);}addLayerNames(e,t,r){ye(e,t,{entries:r});}addLayerNamesRaw(e,t,r){!function(e,t,r){for(const{key:s,value:n}of Te(r))De(`${e}${t}${s}`,n,s);}(e,t,r);}addColorGroupNamesRaw(e,t,r){!function(e,t,r){for(const{key:s,value:n}of Te(r))Se(`${e}${t}${s}`,n,s);}(e,t,r);}assetIsCustomed(e){return void 0!==c()[e.Group.Name]?.[e.Name]}assetNameIsStrictCustomed(e){return void 0!==(t=e,o.find(e=>e.name===t)?.asset);var t;}afterLoad(e){We(e);}init(t){!function(){if(S)return;S=true;const t=e=>v.translateString(C,e);u$1.progressiveHook("AssetTextGet").override((e,r)=>t(e[0])||r(e)),u$1.progressiveHook("ChatRoomPublishCustomAction").inject(e=>{const[r,s,n]=e,o=t(r);o&&n.push({Tag:`MISSING TEXT IN "Interface.csv": ${r}`,Text:o});}).next();}(),function(){if($e)return;$e=true;const t=TextAllScreenCache.get(AssetStringsPath);t&&t.loaded&&("EN"===TranslationLanguage||"Bloated"!==t.get("Bloated"))&&Ne(),u$1.progressiveHook("AssetBuildDescription").next().inject(Ne),u$1.progressiveHook("TranslationAssetProcess").next().inject(Ne),me("CustomDialogInject",()=>{},t=>u$1.patchFunction("ChatRoomPublishAction",{"ChatRoomCharacterItemUpdate(":`${t.globalFuncName}(dictionary, PrevItem, NextItem);\nChatRoomCharacterItemUpdate(`})).register((e,t,r,s)=>{for(const[e,n]of [["PrevAsset",r],["NextAsset",s]])l(n)&&t.text(e,n.Craft?`${n.Craft.Name} (${n.Asset.Description})`:n.Asset.Description);});}(),Fe(),tt(),t(),ze();}enableValidation(e){nt(e);}enableFromModUserValidation(e){nt(e);}enableCustomAssetUseValidation(e){!function(e){u=e;}(e);}setLogger(e){!function(e){ve=e;}(e);}typeBodyGroupNames(){return this}};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var debug_1;
	var hasRequiredDebug;
	function requireDebug () {
		if (hasRequiredDebug) return debug_1;
		hasRequiredDebug = 1;
		const debug = (
		  typeof process === 'object' &&
		  process.env &&
		  process.env.NODE_DEBUG &&
		  /\bsemver\b/i.test(process.env.NODE_DEBUG)
		) ? (...args) => console.error('SEMVER', ...args)
		  : () => {};
		debug_1 = debug;
		return debug_1;
	}

	var constants$1;
	var hasRequiredConstants$1;
	function requireConstants$1 () {
		if (hasRequiredConstants$1) return constants$1;
		hasRequiredConstants$1 = 1;
		const SEMVER_SPEC_VERSION = '2.0.0';
		const MAX_LENGTH = 256;
		const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
		 9007199254740991;
		const MAX_SAFE_COMPONENT_LENGTH = 16;
		const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
		const RELEASE_TYPES = [
		  'major',
		  'premajor',
		  'minor',
		  'preminor',
		  'patch',
		  'prepatch',
		  'prerelease',
		];
		constants$1 = {
		  MAX_LENGTH,
		  MAX_SAFE_COMPONENT_LENGTH,
		  MAX_SAFE_BUILD_LENGTH,
		  MAX_SAFE_INTEGER,
		  RELEASE_TYPES,
		  SEMVER_SPEC_VERSION,
		  FLAG_INCLUDE_PRERELEASE: 0b001,
		  FLAG_LOOSE: 0b010,
		};
		return constants$1;
	}

	var re = {exports: {}};

	var hasRequiredRe;
	function requireRe () {
		if (hasRequiredRe) return re.exports;
		hasRequiredRe = 1;
		(function (module, exports) {
			const {
			  MAX_SAFE_COMPONENT_LENGTH,
			  MAX_SAFE_BUILD_LENGTH,
			  MAX_LENGTH,
			} = requireConstants$1();
			const debug = requireDebug();
			exports = module.exports = {};
			const re = exports.re = [];
			const safeRe = exports.safeRe = [];
			const src = exports.src = [];
			const safeSrc = exports.safeSrc = [];
			const t = exports.t = {};
			let R = 0;
			const LETTERDASHNUMBER = '[a-zA-Z0-9-]';
			const safeRegexReplacements = [
			  ['\\s', 1],
			  ['\\d', MAX_LENGTH],
			  [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
			];
			const makeSafeRegex = (value) => {
			  for (const [token, max] of safeRegexReplacements) {
			    value = value
			      .split(`${token}*`).join(`${token}{0,${max}}`)
			      .split(`${token}+`).join(`${token}{1,${max}}`);
			  }
			  return value
			};
			const createToken = (name, value, isGlobal) => {
			  const safe = makeSafeRegex(value);
			  const index = R++;
			  debug(name, index, value);
			  t[name] = index;
			  src[index] = value;
			  safeSrc[index] = safe;
			  re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
			  safeRe[index] = new RegExp(safe, isGlobal ? 'g' : undefined);
			};
			createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
			createToken('NUMERICIDENTIFIERLOOSE', '\\d+');
			createToken('NONNUMERICIDENTIFIER', `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
			createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
			                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
			                   `(${src[t.NUMERICIDENTIFIER]})`);
			createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
			                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
			                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`);
			createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NONNUMERICIDENTIFIER]
		}|${src[t.NUMERICIDENTIFIER]})`);
			createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NONNUMERICIDENTIFIER]
		}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
			createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
		}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
			createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
		}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
			createToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`);
			createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
		}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
			createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
		}${src[t.PRERELEASE]}?${
		  src[t.BUILD]}?`);
			createToken('FULL', `^${src[t.FULLPLAIN]}$`);
			createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
		}${src[t.PRERELEASELOOSE]}?${
		  src[t.BUILD]}?`);
			createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);
			createToken('GTLT', '((?:<|>)?=?)');
			createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
			createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
			createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
			                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
			                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
			                   `(?:${src[t.PRERELEASE]})?${
		                     src[t.BUILD]}?` +
			                   `)?)?`);
			createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
			                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
			                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
			                        `(?:${src[t.PRERELEASELOOSE]})?${
		                          src[t.BUILD]}?` +
			                        `)?)?`);
			createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
			createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
			createToken('COERCEPLAIN', `${'(^|[^\\d])' +
		              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
			              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
			              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
			createToken('COERCE', `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
			createToken('COERCEFULL', src[t.COERCEPLAIN] +
			              `(?:${src[t.PRERELEASE]})?` +
			              `(?:${src[t.BUILD]})?` +
			              `(?:$|[^\\d])`);
			createToken('COERCERTL', src[t.COERCE], true);
			createToken('COERCERTLFULL', src[t.COERCEFULL], true);
			createToken('LONETILDE', '(?:~>?)');
			createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
			exports.tildeTrimReplace = '$1~';
			createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
			createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
			createToken('LONECARET', '(?:\\^)');
			createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
			exports.caretTrimReplace = '$1^';
			createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
			createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
			createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
			createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
			createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
		}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
			exports.comparatorTrimReplace = '$1$2$3';
			createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
			                   `\\s+-\\s+` +
			                   `(${src[t.XRANGEPLAIN]})` +
			                   `\\s*$`);
			createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
			                        `\\s+-\\s+` +
			                        `(${src[t.XRANGEPLAINLOOSE]})` +
			                        `\\s*$`);
			createToken('STAR', '(<|>)?=?\\s*\\*');
			createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$');
			createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$');
		} (re, re.exports));
		return re.exports;
	}

	var parseOptions_1;
	var hasRequiredParseOptions;
	function requireParseOptions () {
		if (hasRequiredParseOptions) return parseOptions_1;
		hasRequiredParseOptions = 1;
		const looseOption = Object.freeze({ loose: true });
		const emptyOpts = Object.freeze({ });
		const parseOptions = options => {
		  if (!options) {
		    return emptyOpts
		  }
		  if (typeof options !== 'object') {
		    return looseOption
		  }
		  return options
		};
		parseOptions_1 = parseOptions;
		return parseOptions_1;
	}

	var identifiers;
	var hasRequiredIdentifiers;
	function requireIdentifiers () {
		if (hasRequiredIdentifiers) return identifiers;
		hasRequiredIdentifiers = 1;
		const numeric = /^[0-9]+$/;
		const compareIdentifiers = (a, b) => {
		  if (typeof a === 'number' && typeof b === 'number') {
		    return a === b ? 0 : a < b ? -1 : 1
		  }
		  const anum = numeric.test(a);
		  const bnum = numeric.test(b);
		  if (anum && bnum) {
		    a = +a;
		    b = +b;
		  }
		  return a === b ? 0
		    : (anum && !bnum) ? -1
		    : (bnum && !anum) ? 1
		    : a < b ? -1
		    : 1
		};
		const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
		identifiers = {
		  compareIdentifiers,
		  rcompareIdentifiers,
		};
		return identifiers;
	}

	var semver;
	var hasRequiredSemver;
	function requireSemver () {
		if (hasRequiredSemver) return semver;
		hasRequiredSemver = 1;
		const debug = requireDebug();
		const { MAX_LENGTH, MAX_SAFE_INTEGER } = requireConstants$1();
		const { safeRe: re, t } = requireRe();
		const parseOptions = requireParseOptions();
		const { compareIdentifiers } = requireIdentifiers();
		const isPrereleaseIdentifier = (prerelease, identifier) => {
		  const identifiers = identifier.split('.');
		  if (identifiers.length > prerelease.length) {
		    return false
		  }
		  for (let i = 0; i < identifiers.length; i++) {
		    if (compareIdentifiers(prerelease[i], identifiers[i]) !== 0) {
		      return false
		    }
		  }
		  return true
		};
		class SemVer {
		  constructor (version, options) {
		    options = parseOptions(options);
		    if (version instanceof SemVer) {
		      if (version.loose === !!options.loose &&
		        version.includePrerelease === !!options.includePrerelease) {
		        return version
		      } else {
		        version = version.version;
		      }
		    } else if (typeof version !== 'string') {
		      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`)
		    }
		    if (version.length > MAX_LENGTH) {
		      throw new TypeError(
		        `version is longer than ${MAX_LENGTH} characters`
		      )
		    }
		    debug('SemVer', version, options);
		    this.options = options;
		    this.loose = !!options.loose;
		    this.includePrerelease = !!options.includePrerelease;
		    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
		    if (!m) {
		      throw new TypeError(`Invalid Version: ${version}`)
		    }
		    this.raw = version;
		    this.major = +m[1];
		    this.minor = +m[2];
		    this.patch = +m[3];
		    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
		      throw new TypeError('Invalid major version')
		    }
		    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
		      throw new TypeError('Invalid minor version')
		    }
		    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
		      throw new TypeError('Invalid patch version')
		    }
		    if (!m[4]) {
		      this.prerelease = [];
		    } else {
		      this.prerelease = m[4].split('.').map((id) => {
		        if (/^[0-9]+$/.test(id)) {
		          const num = +id;
		          if (num >= 0 && num < MAX_SAFE_INTEGER) {
		            return num
		          }
		        }
		        return id
		      });
		    }
		    this.build = m[5] ? m[5].split('.') : [];
		    this.format();
		  }
		  format () {
		    this.version = `${this.major}.${this.minor}.${this.patch}`;
		    if (this.prerelease.length) {
		      this.version += `-${this.prerelease.join('.')}`;
		    }
		    return this.version
		  }
		  toString () {
		    return this.version
		  }
		  compare (other) {
		    debug('SemVer.compare', this.version, this.options, other);
		    if (!(other instanceof SemVer)) {
		      if (typeof other === 'string' && other === this.version) {
		        return 0
		      }
		      other = new SemVer(other, this.options);
		    }
		    if (other.version === this.version) {
		      return 0
		    }
		    return this.compareMain(other) || this.comparePre(other)
		  }
		  compareMain (other) {
		    if (!(other instanceof SemVer)) {
		      other = new SemVer(other, this.options);
		    }
		    if (this.major < other.major) {
		      return -1
		    }
		    if (this.major > other.major) {
		      return 1
		    }
		    if (this.minor < other.minor) {
		      return -1
		    }
		    if (this.minor > other.minor) {
		      return 1
		    }
		    if (this.patch < other.patch) {
		      return -1
		    }
		    if (this.patch > other.patch) {
		      return 1
		    }
		    return 0
		  }
		  comparePre (other) {
		    if (!(other instanceof SemVer)) {
		      other = new SemVer(other, this.options);
		    }
		    if (this.prerelease.length && !other.prerelease.length) {
		      return -1
		    } else if (!this.prerelease.length && other.prerelease.length) {
		      return 1
		    } else if (!this.prerelease.length && !other.prerelease.length) {
		      return 0
		    }
		    let i = 0;
		    do {
		      const a = this.prerelease[i];
		      const b = other.prerelease[i];
		      debug('prerelease compare', i, a, b);
		      if (a === undefined && b === undefined) {
		        return 0
		      } else if (b === undefined) {
		        return 1
		      } else if (a === undefined) {
		        return -1
		      } else if (a === b) {
		        continue
		      } else {
		        return compareIdentifiers(a, b)
		      }
		    } while (++i)
		  }
		  compareBuild (other) {
		    if (!(other instanceof SemVer)) {
		      other = new SemVer(other, this.options);
		    }
		    let i = 0;
		    do {
		      const a = this.build[i];
		      const b = other.build[i];
		      debug('build compare', i, a, b);
		      if (a === undefined && b === undefined) {
		        return 0
		      } else if (b === undefined) {
		        return 1
		      } else if (a === undefined) {
		        return -1
		      } else if (a === b) {
		        continue
		      } else {
		        return compareIdentifiers(a, b)
		      }
		    } while (++i)
		  }
		  inc (release, identifier, identifierBase) {
		    if (release.startsWith('pre')) {
		      if (!identifier && identifierBase === false) {
		        throw new Error('invalid increment argument: identifier is empty')
		      }
		      if (identifier) {
		        const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
		        if (!match || match[1] !== identifier) {
		          throw new Error(`invalid identifier: ${identifier}`)
		        }
		      }
		    }
		    switch (release) {
		      case 'premajor':
		        this.prerelease.length = 0;
		        this.patch = 0;
		        this.minor = 0;
		        this.major++;
		        this.inc('pre', identifier, identifierBase);
		        break
		      case 'preminor':
		        this.prerelease.length = 0;
		        this.patch = 0;
		        this.minor++;
		        this.inc('pre', identifier, identifierBase);
		        break
		      case 'prepatch':
		        this.prerelease.length = 0;
		        this.inc('patch', identifier, identifierBase);
		        this.inc('pre', identifier, identifierBase);
		        break
		      case 'prerelease':
		        if (this.prerelease.length === 0) {
		          this.inc('patch', identifier, identifierBase);
		        }
		        this.inc('pre', identifier, identifierBase);
		        break
		      case 'release':
		        if (this.prerelease.length === 0) {
		          throw new Error(`version ${this.raw} is not a prerelease`)
		        }
		        this.prerelease.length = 0;
		        break
		      case 'major':
		        if (
		          this.minor !== 0 ||
		          this.patch !== 0 ||
		          this.prerelease.length === 0
		        ) {
		          this.major++;
		        }
		        this.minor = 0;
		        this.patch = 0;
		        this.prerelease = [];
		        break
		      case 'minor':
		        if (this.patch !== 0 || this.prerelease.length === 0) {
		          this.minor++;
		        }
		        this.patch = 0;
		        this.prerelease = [];
		        break
		      case 'patch':
		        if (this.prerelease.length === 0) {
		          this.patch++;
		        }
		        this.prerelease = [];
		        break
		      case 'pre': {
		        const base = Number(identifierBase) ? 1 : 0;
		        if (this.prerelease.length === 0) {
		          this.prerelease = [base];
		        } else {
		          let i = this.prerelease.length;
		          while (--i >= 0) {
		            if (typeof this.prerelease[i] === 'number') {
		              this.prerelease[i]++;
		              i = -2;
		            }
		          }
		          if (i === -1) {
		            if (identifier === this.prerelease.join('.') && identifierBase === false) {
		              throw new Error('invalid increment argument: identifier already exists')
		            }
		            this.prerelease.push(base);
		          }
		        }
		        if (identifier) {
		          let prerelease = [identifier, base];
		          if (identifierBase === false) {
		            prerelease = [identifier];
		          }
		          if (isPrereleaseIdentifier(this.prerelease, identifier)) {
		            const prereleaseBase = this.prerelease[identifier.split('.').length];
		            if (isNaN(prereleaseBase)) {
		              this.prerelease = prerelease;
		            }
		          } else {
		            this.prerelease = prerelease;
		          }
		        }
		        break
		      }
		      default:
		        throw new Error(`invalid increment argument: ${release}`)
		    }
		    this.raw = this.format();
		    if (this.build.length) {
		      this.raw += `+${this.build.join('.')}`;
		    }
		    return this
		  }
		}
		semver = SemVer;
		return semver;
	}

	var parse_1;
	var hasRequiredParse;
	function requireParse () {
		if (hasRequiredParse) return parse_1;
		hasRequiredParse = 1;
		const SemVer = requireSemver();
		const parse = (version, options, throwErrors = false) => {
		  if (version instanceof SemVer) {
		    return version
		  }
		  try {
		    return new SemVer(version, options)
		  } catch (er) {
		    if (!throwErrors) {
		      return null
		    }
		    throw er
		  }
		};
		parse_1 = parse;
		return parse_1;
	}

	var valid_1;
	var hasRequiredValid;
	function requireValid () {
		if (hasRequiredValid) return valid_1;
		hasRequiredValid = 1;
		const parse = requireParse();
		const valid = (version, options) => {
		  const v = parse(version, options);
		  return v ? v.version : null
		};
		valid_1 = valid;
		return valid_1;
	}

	var validExports = requireValid();
	var e = /*@__PURE__*/getDefaultExportFromCjs(validExports);

	var compare_1;
	var hasRequiredCompare;
	function requireCompare () {
		if (hasRequiredCompare) return compare_1;
		hasRequiredCompare = 1;
		const SemVer = requireSemver();
		const compare = (a, b, loose) =>
		  new SemVer(a, loose).compare(new SemVer(b, loose));
		compare_1 = compare;
		return compare_1;
	}

	var lt_1;
	var hasRequiredLt;
	function requireLt () {
		if (hasRequiredLt) return lt_1;
		hasRequiredLt = 1;
		const compare = requireCompare();
		const lt = (a, b, loose) => compare(a, b, loose) < 0;
		lt_1 = lt;
		return lt_1;
	}

	var ltExports = requireLt();
	var t = /*@__PURE__*/getDefaultExportFromCjs(ltExports);

	function r(e){return globalThis[e]}class a{static _initStorage(){var e,t;r(this._namespace)||(e=this._namespace,t={},globalThis[e]=t);}static get(e,t){this._initStorage();const a=r(this._namespace);return e in a||(a[e]=t()),a[e]}static getMayOverride(e,t){this._initStorage();const a=r(this._namespace);return a[e]=t(a[e]),a[e]}static getByVersion(a,s,n,i){if(this._initStorage(),!e(s))throw new Error(`Invalid version for ${a}: ${s}`);const o=r(this._namespace),c=`${a}.__Version`,u=o[a],m=o[c];return u?m&&!t(m,s)||(o[a]=i(m,u),o[c]=s):(o[a]=n(u),o[c]=s),o[a]}static set(e,t){this._initStorage();r(this._namespace)[e]=t;}static has(e){this._initStorage();return e in r(this._namespace)}static delete(e){this._initStorage();const t=r(this._namespace);return e in t&&delete t[e]}static setImplementation(e){const t=["get","set","has","delete"];for(const r of t){if("function"!=typeof e[r])throw new Error(`Implementation must provide a '${r}' function`);a[r]=e[r];}}static createNamespace(e){return {get:(t,r)=>a.get(`${e}.${t}`,r),getMayOverride:(t,r)=>a.getMayOverride(`${e}.${t}`,r),set:(t,r)=>a.set(`${e}.${t}`,r),has:t=>a.has(`${e}.${t}`),delete:t=>a.delete(`${e}.${t}`)}}}a._namespace="__BC_LUZI_GLOBALS__";const s=a.createNamespace("OnceFlag");function n(e,t){s.get(e,(()=>false))||(s.set(e,true),t());}

	const ModInfo = {
	    name: "ShuangCustomAssets",
	    fullName: "Shuang自定义道具扩展",
	    version: "0.2.0",
	    author: "Shuang",
	    description: "支持动态贴图等自定义道具",
	    repository: "https://github.com/yourname/ShuangCustomAssets"
	};

	const CLEANUP_INTERVAL_MS = 60 * 1000;
	const STALE_ENTRY_TIMEOUT_MS = 5 * 60 * 1000;
	const _prunableCaches = [];
	let _timerStarted$1 = false;
	function pruneAll() {
	    const now = Date.now();
	    for (const { cache, name } of _prunableCaches) {
	        let pruned = 0;
	        for (const [key, entry] of cache) {
	            if (entry?.loaded && now - (entry.lastUsed || 0) > STALE_ENTRY_TIMEOUT_MS) {
	                cache.delete(key);
	                pruned++;
	            }
	        }
	        if (pruned > 0) {
	            console.log(`[ShuangAssets] 已释放 ${pruned} 个不再使用的${name}缓存（画面上已经看不到的图片）`);
	        }
	    }
	}
	function ensureTimerStarted$1() {
	    if (_timerStarted$1) return;
	    _timerStarted$1 = true;
	    setInterval(pruneAll, CLEANUP_INTERVAL_MS);
	}
	function pruneCachesNow() {
	    pruneAll();
	}
	function registerPrunableCache(cache, name) {
	    _prunableCaches.push({ cache, name });
	    ensureTimerStarted$1();
	}

	const NO_SPINNER_CLASS = "shuang-no-number-spinner";
	let _noSpinnerStyleInjected = false;
	function hideNumberInputSpinner(input) {
	    if (!input) return;
	    if (!_noSpinnerStyleInjected) {
	        const style = document.createElement("style");
	        style.textContent = `
            .${NO_SPINNER_CLASS}::-webkit-outer-spin-button,
            .${NO_SPINNER_CLASS}::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            .${NO_SPINNER_CLASS} {
                -moz-appearance: textfield;
                appearance: textfield;
            }
        `;
	        document.head.appendChild(style);
	        _noSpinnerStyleInjected = true;
	    }
	    input.classList.add(NO_SPINNER_CLASS);
	}
	const Logger = {
	    prefix: "[ShuangAssets]",
	    debugEnabled: false,
	    info(...args) {
	        if (this.debugEnabled) console.log(this.prefix, ...args);
	    },
	    warn(...args) {
	        console.warn(this.prefix, ...args);
	    },
	    error(...args) {
	        console.error(this.prefix, ...args);
	    }
	};
	function isChineseLang() {
	    const lang = (typeof TranslationLanguage !== "undefined") ? TranslationLanguage : "EN";
	    return lang === "CN" || lang === "TW";
	}
	function L(cn, en) {
	    return isChineseLang() ? cn : en;
	}
	const _corsImageCache = new Map();
	registerPrunableCache(_corsImageCache, L("静态图片", "static image"));
	function getCorsImage(url, onReady) {
	    let entry = _corsImageCache.get(url);
	    if (!entry) {
	        const img = new Image();
	        entry = { img, loaded: false, failed: false, lastUsed: Date.now(), _waiters: new Set() };
	        img.addEventListener("load", () => {
	            entry.loaded = true;
	            entry._waiters.forEach((fn) => { try { fn(); } catch (err) { Logger.error("[ShuangAssets] 图片就绪回调执行失败", err); } });
	            entry._waiters.clear();
	        });
	        img.addEventListener("error", () => {
	            entry.failed = true;
	            entry._waiters.forEach((fn) => { try { fn(); } catch (err) { Logger.error("[ShuangAssets] 图片就绪回调执行失败", err); } });
	            entry._waiters.clear();
	            Logger.warn(L(
	                `图片加载失败（很可能是图床未开启跨域 CORS，无 Access-Control-Allow-Origin 响应头）: ${url}`,
	                `Failed to load image (the host likely has no CORS / Access-Control-Allow-Origin header): ${url}`
	            ));
	        });
	        img.crossOrigin = "anonymous";
	        img.src = url;
	        _corsImageCache.set(url, entry);
	    } else {
	        entry.lastUsed = Date.now();
	    }
	    if (onReady && !entry.loaded && !entry.failed) {
	        entry._waiters.add(onReady);
	    }
	    return entry;
	}

	const registeredAssets = new Map();
	function registerAsset(name, registerFn) {
	    if (registeredAssets.has(name)) {
	        Logger.warn(`道具 "${name}" 已注册，跳过重复注册`);
	        return;
	    }
	    registeredAssets.set(name, registerFn);
	}
	function registerAssets(assets) {
	    for (const [name, registerFn] of assets) {
	        registerAsset(name, registerFn);
	    }
	}
	function initAssets() {
	    for (const [name, registerFn] of registeredAssets) {
	        try {
	            registerFn(mt);
	        } catch (e) {
	            Logger.error(`道具 "${name}" 初始化失败:`, e);
	        }
	    }
	}

	const ASSET_NAME = "自定义贴图";
	const DEFAULT_TEXTURE = {
	    Alias: "",
	    TextureURL: "",
	    OffsetX: 1,
	    OffsetY: 1,
	    ScaleX: 100,
	    ScaleY: 100,
	    ScaleLocked: true,
	    Rotation: 0,
	    Visible: true,
	    Opacity: 100,
	    MirrorH: false,
	    MirrorV: false,
	    PoseSettings: {},
	    TextureURLSource: 0,
	    CurrentConfigurator: 0,
	};
	const DEFAULT_PROPS = {
	    Textures: [],
	    HideEmoticon: false,
	    HideCosplay: false,
	    HideFacial: false,
	    HideHead: false,
	    HideBodyUpper: false,
	    HideBodyLower: false,
	    HideClothing: false,
	    HideItems: false,
	    HideBody: false
	};
	const POSE_CATEGORIES = {
	    BodyUpper: {
	        label: "手部姿势",
	        labelEn: "Arm Pose",
	        poses: ["BaseUpper", "Yoked", "OverTheHead", "BackBoxTie", "BackElbowTouch", "BackCuffs"]
	    },
	    BodyLower: {
	        label: "腿部姿势",
	        labelEn: "Leg Pose",
	        poses: ["BaseLower", "LegsClosed", "Kneel", "KneelingSpread", "Spread"]
	    },
	    BodyFull: {
	        label: "全身姿势",
	        labelEn: "Full Body Pose",
	        poses: ["Hogtied", "AllFours"]
	    }
	};
	Object.values(POSE_CATEGORIES).flatMap(c => c.poses);
	const POSE_LABELS = {
	    BaseUpper:      { cn: "基础手势",   en: "Arms Down" },
	    Yoked:          { cn: "举手",       en: "Yoked" },
	    OverTheHead:    { cn: "高举双手",   en: "Over The Head" },
	    BackBoxTie:     { cn: "轻松背手",   en: "Box Tie" },
	    BackElbowTouch: { cn: "紧绷背手",   en: "Elbow Touch" },
	    BackCuffs:      { cn: "背后手铐",   en: "Back Cuffs" },
	    BaseLower:      { cn: "站立",       en: "Standing" },
	    LegsClosed:     { cn: "站立闭合",   en: "Legs Closed" },
	    Kneel:          { cn: "跪姿",       en: "Kneel" },
	    KneelingSpread: { cn: "跪地张腿",   en: "Kneeling Spread" },
	    Spread:         { cn: "站立张腿",       en: "Spread" },
	    Hogtied:        { cn: "仰卧",       en: "Hogtied" },
	    AllFours:       { cn: "四肢着地",   en: "All Fours" }
	};
	function trimTrailingNulls(textures) {
	    if (!Array.isArray(textures)) return;
	    while (textures.length > 0 && textures[textures.length - 1] === null) {
	        textures.pop();
	    }
	}
	function migrateScaleField(texture) {
	    if (!texture || typeof texture !== "object") return;
	    if (texture.Scale !== undefined && texture.ScaleX === undefined) {
	        texture.ScaleX = texture.Scale;
	        texture.ScaleY = texture.Scale;
	        texture.ScaleLocked = true;
	        delete texture.Scale;
	    }
	    if (texture.PoseSettings && typeof texture.PoseSettings === "object") {
	        for (const ps of Object.values(texture.PoseSettings)) {
	            if (ps && ps.Scale !== undefined && ps.ScaleX === undefined) {
	                ps.ScaleX = ps.Scale;
	                ps.ScaleY = ps.Scale;
	                delete ps.Scale;
	            }
	        }
	    }
	}
	function getPoseKey(drawPose) {
	    if (!drawPose || drawPose.length === 0) return null;
	    const fullPoses = POSE_CATEGORIES.BodyFull.poses;
	    const upperPoses = POSE_CATEGORIES.BodyUpper.poses;
	    const lowerPoses = POSE_CATEGORIES.BodyLower.poses;
	    const fullPose = drawPose.find(p => fullPoses.includes(p));
	    if (fullPose) return fullPose;
	    const upperPose = drawPose.find(p => upperPoses.includes(p));
	    const lowerPose = drawPose.find(p => lowerPoses.includes(p));
	    if (upperPose && lowerPose) return `${upperPose}+${lowerPose}`;
	    if (upperPose) return upperPose;
	    if (lowerPose) return lowerPose;
	    return null;
	}
	const POSE_BAR_Y = 930;
	const POSE_TOGGLE_H = 40;
	const POSE_EDIT_TOGGLE_X = 1450;
	const POSE_EDIT_TOGGLE_W = 110;
	const POSE_ACTIVE_TOGGLE_X = 1570;
	const POSE_ACTIVE_TOGGLE_W = 110;
	const POSE_SWITCH_X = POSE_ACTIVE_TOGGLE_X + POSE_ACTIVE_TOGGLE_W + 10;
	const POSE_SWITCH_W = 100;
	const POSE_PAGE_BTN_W = 150;
	const POSE_PAGE_BTN_H = 40;
	const POSE_PAGE_BTN_GAP = 20;
	const POSE_PAGE_START_X = 1265;
	const POSE_PAGE_COLS = 3;
	const POSE_PAGE_START_Y = 435;
	const POSE_PAGE_ROW_STEP = 50;
	const POSE_PAGE_CATEGORY_GAP = 30;
	const POSE_PAGE_LABEL_X = 1100;
	const POSE_PAGE_LABEL_Y_OFFSET = 20;
	const POSE_PAGE_BOTTOM_Y = 760;
	const POSE_SPECIAL_BTN_X = 1265;
	const POSE_SPECIAL_BTN_W = 200;
	const POSE_CONFIRM_BTN_X = 1700;
	const POSE_CONFIRM_BTN_W = 150;
	const POSE_COMBO_LEFT_X = 1265;
	const POSE_COMBO_RIGHT_X = 1700;
	const POSE_COMBO_BTN_W = 60;
	const POSE_COMBO_NAME_Y = 405;
	const POSE_COMBO_DROPDOWN_ID = "ShuangPoseComboDropdown";
	const POSE_COMBO_DROPDOWN_X = 1330;
	const POSE_COMBO_DROPDOWN_Y = 385;
	const POSE_COMBO_DROPDOWN_W = 360;
	const POSE_COMBO_DROPDOWN_H = 40;
	const POSE_COMBO_SAVE_X = 1700;
	const POSE_COMBO_SAVE_Y = 900;
	const TEXTURES_PER_PAGE = 6;
	const MAX_TEXTURE_COUNT = 18;
	const LAYER_NAMES = Array.from({ length: MAX_TEXTURE_COUNT }, (_, i) => `Layer${i + 1}`);
	const ALL_ITEM_GROUPS = [
	    "ItemAddon", "ItemArms", "ItemBoots", "ItemBreast", "ItemButt",
	    "ItemDevices", "ItemEars", "ItemFeet", "ItemHands", "ItemHead",
	    "ItemHood", "ItemLegs", "ItemMisc", "ItemMouth", "ItemMouth2",
	    "ItemMouth3", "ItemNeck", "ItemNeckAccessories", "ItemNeckRestraints",
	    "ItemNipples", "ItemNipplesPiercings", "ItemNose", "ItemPelvis",
	    "ItemTorso", "ItemTorso2", "ItemVulva", "ItemVulvaPiercings",
	    "ItemHandheld"
	];
	const TEXTURE_REFRESH_INTERVAL = 200;
	const TEXTURE_DRAG_REFRESH_INTERVAL = 50;
	const ASSETS_CDN_PRIMARY = "https://shuang-custom-assets.pages.dev";
	const ASSETS_CDN_FALLBACK = "https://shuang-custom-assets.netlify.app";
	const HIDE_CATEGORIES = [
	    {
	        key: "HideEmoticon",
	        label: "表情图标",
	        labelEn: "Emoticon",
	        groups: [
	            "Emoticon"
	        ]
	    },
	    {
	        key: "HideCosplay",
	        label: "cosplay",
	        labelEn: "Cosplay",
	        groups: [
	            "HairFront", "HairBack", "新前发_Luzi", "新后发_Luzi", "额外头发_Luzi",
	            "新前发_Luzi_stack", "新后发_Luzi_stack",
	            "TailStraps", "Luzi_TailStraps_0",
	            "Wings", "Wings_笨笨蛋Luzi",
	            "动物身体_Luzi", "额外身高_Luzi"
	        ]
	    },
	    {
	        key: "HideFacial",
	        label: "五官",
	        labelEn: "Face",
	        groups: [
	            "Eyes", "Eyes2", "Eyebrows", "Blush", "EyeShadow",
	            "FacialHair", "Mouth", "左眼_Luzi", "右眼_Luzi"
	        ]
	    },
	    {
	        key: "HideHead",
	        label: "头部",
	        labelEn: "Head",
	        groups: [
	            "Head"
	        ]
	    },
	    {
	        key: "HideBodyUpper",
	        label: "上半身",
	        labelEn: "Body Upper",
	        groups: [
	            "BodyUpper", "Nipples",
	            "ArmsLeft", "ArmsRight", "HandsLeft", "HandsRight"
	        ]
	    },
	    {
	        key: "HideBodyLower",
	        label: "下半身",
	        labelEn: "Body Lower",
	        groups: [
	            "BodyLower", "Pussy",
	            "Height", "BodyStyle", "Pronouns",
	            "外观工具"
	        ]
	    },
	    {
	        key: "HideClothing",
	        label: "服饰",
	        labelEn: "Clothing",
	        groups: [
	            "Fluids", "BodyMarkings", "Decals", "Liquid2_Luzi", "身体痕迹_Luzi", "BodyMarkings2_Luzi",
	            "Glasses", "Mask", "Hat", "FaceMarkings", "Mask_笨笨蛋Luzi", "Hat_笨笨蛋Luzi",
	            "Cloth", "ClothLower", "ClothOuter", "ClothAccessory",
	            "Suit", "SuitLower", "Corset", "Bra", "Panties",
	            "Cloth_笨笨蛋Luzi", "Cloth_笨笨笨蛋Luzi2", "ClothLower_笨笨蛋Luzi", "ClothLower_笨笨笨蛋Luzi2",
	            "Bra_笨笨蛋Luzi", "Panties_笨笨蛋Luzi", "Suit_笨笨蛋Luzi", "SuitLower_笨笨蛋Luzi",
	            "ClothAccessory_笨笨蛋Luzi", "ClothAccessory_笨笨笨蛋Luzi2", "长袖子_Luzi",
	            "HairAccessory1", "HairAccessory2", "HairAccessory3",
	            "HairAccessory3_笨笨蛋Luzi", "Luzi_HairAccessory3_1", "Luzi_HairAccessory3_2",
	            "Necklace", "Necklace_笨笨蛋Luzi",
	            "Gloves", "Bracelet", "HandAccessoryLeft", "HandAccessoryRight", "Gloves_笨笨蛋Luzi",
	            "Socks", "SocksLeft", "SocksRight", "Shoes", "AnkletLeft", "AnkletRight", "Garters", "Shoes_笨笨蛋Luzi",
	            "Jewelry", "Luzi_Jewelry_0"
	        ]
	    },
	    {
	        key: "HideItems",
	        label: "拘束道具",
	        labelEn: "Restraints",
	        groups: [
	            "ItemAddon", "ItemArms", "ItemBoots", "ItemBreast", "ItemButt",
	            "ItemDevices", "ItemEars", "ItemFeet", "ItemHands", "ItemHead",
	            "ItemHood", "ItemLegs", "ItemMisc", "ItemMouth", "ItemMouth2",
	            "ItemMouth3", "ItemNeck", "ItemNeckAccessories", "ItemNeckRestraints",
	            "ItemNipples", "ItemNipplesPiercings", "ItemNose", "ItemPelvis",
	            "ItemTorso", "ItemTorso2", "ItemVulva", "ItemVulvaPiercings", "ItemHandheld"
	        ]
	    }
	];
	const ALL_HIDEABLE_GROUPS = HIDE_CATEGORIES.flatMap(c => c.groups);
	const FIELD_OFFSET_X = "CustomTextureOffsetX";
	const FIELD_OFFSET_Y = "CustomTextureOffsetY";
	const FIELD_SCALE_X = "CustomTextureScaleX";
	const FIELD_SCALE_Y = "CustomTextureScaleY";
	const FIELD_OPACITY = "CustomTextureOpacity";
	const FIELD_ROTATION = "CustomTextureRotation";
	const FIELD_PRIORITY = "CustomTexturePriority";
	const FIELD_URL = "CustomTextureURLInput";
	const STEPPER_BTN_W = 40;
	const STEPPER_BTN_H = 40;
	const STEPPER_MINUS_X = 1220;
	const STEPPER_PLUS_X = 1380;
	const STEPPER_INPUT_X = 1265;
	const STEPPER_INPUT_W = 110;
	const STEPPER_INPUT_H = 40;
	const STEPPER_FIELDS = [
	    { id: FIELD_OFFSET_X, y: 485, labelCn: "X偏移",   labelEn: "X Offset",   labelY: 505, prop: "OffsetX", def: 1,   min: null, max: null },
	    { id: FIELD_OFFSET_Y, y: 535, labelCn: "Y偏移",   labelEn: "Y Offset",   labelY: 555, prop: "OffsetY", def: 1,   min: null, max: null },
	    { id: FIELD_SCALE_X,  y: 635, labelCn: "缩放X%",  labelEn: "Scale X %",  labelY: 655, prop: "ScaleX",  def: 100, min: null, max: null },
	    { id: FIELD_SCALE_Y,  y: 680, labelCn: "缩放Y%",  labelEn: "Scale Y %",  labelY: 700, prop: "ScaleY",  def: 100, min: null, max: null }
	];
	const BAR_FIELDS = [
	    { id: FIELD_ROTATION, y: 730, labelCn: "旋转",     labelEn: "Rotation",      labelY: 750, prop: "Rotation", def: 0,   min: -360, max: 360, bar: true },
	    { id: FIELD_OPACITY,  y: 780, labelCn: "透明度%", labelEn: "Opacity %",     labelY: 800, prop: "Opacity",   def: 100, min: 0,   max: 100, bar: true },
	    { id: FIELD_PRIORITY, y: 830, labelCn: "图层优先级", labelEn: "Layer Priority", labelY: 850, prop: null,       def: 50,  min: -99, max: 99,  bar: true }
	];
	const BAR_TRACK_X = 1445;
	const BAR_TRACK_W = 220;
	const BAR_TRACK_H = 8;
	const BAR_HANDLE_SIZE = 24;
	const MOVE_BTN_X = 1435;
	const MOVE_BTN_Y = 510;
	const MOVE_BTN_W = 100;
	const MOVE_BTN_H = 40;
	const SCALE_DRAG_BTN_X = MOVE_BTN_X;
	const SCALE_DRAG_BTN_Y = 660;
	const SCALE_DRAG_BTN_W = 100;
	const SCALE_DRAG_BTN_H = 40;
	const ASPECT_LOCK_BTN_X = SCALE_DRAG_BTN_X + SCALE_DRAG_BTN_W + 20;
	const ASPECT_LOCK_BTN_Y = SCALE_DRAG_BTN_Y;
	const ASPECT_LOCK_BTN_W = 100;
	const ASPECT_LOCK_BTN_H = 40;
	const SCALE_DRAG_SENSITIVITY = 0.5;
	const MIRROR_ROW_Y = 585;
	const MIRROR_ROW_LABEL_Y = 605;
	const MIRROR_H_BTN_X = 1220;
	const MIRROR_V_BTN_X = 1330;
	const MIRROR_BTN_W = 90;
	const MIRROR_BTN_H = 40;
	const stepperPress = {
	    fieldId: null,
	    direction: 0,
	    startTime: 0,
	    lastUpdate: 0
	};
	const URL_BOX_X = 1220;
	const URL_BOX_Y = 435;
	const URL_BOX_W = 490;
	const URL_BOX_H = 40;
	const barDrag = {
	    fieldId: null
	};
	const scaleDrag = {
	    active: false,
	    startMouseX: 0,
	    startMouseY: 0,
	    startScaleX: 100,
	    startScaleY: 100
	};
	const BADGE_IMAGE_URL = "https://shuang-custom-assets.pages.dev/SCA_logo.png";
	const LOGIN_BADGE_TEXTURE = {
	    TextureURL: BADGE_IMAGE_URL,
	    OffsetX: 153,
	    OffsetY: -200,
	    ScaleX: 50,
	    ScaleY: 50,
	    Rotation: 0,
	    Opacity: 100,
	    Visible: true
	};
	const LOGIN_BADGE_ASSET_NAME = "自定义贴图";
	const LOGIN_BADGE_GROUP = "ItemTorso";
	const assetStrings = {
	    CN: { SelectBase: "贴图管理" },
	    EN: { SelectBase: "Texture Manager" }
	};

	const EXTENSION_ID = "ShuangCustomAssets";
	const CONTAINER_ID = "ShuangSettingsContainer";
	const ALWAYS_ALLOWED_DOMAINS = ["shuang-custom-assets.pages.dev"];
	const DEFAULT_ALLOWED_DOMAINS = [
	    "github.io", "gitlab.io", "ibb.co", "imgbb.com", "imgchest.com",
	    "imgur.com", "postimg.cc", "hd-r.icu",
	    "catbox.moe", "litter.catbox.moe",
	    "pub-*.r2.dev", "r2.cloudflarestorage.com",
	    "cdn.discordapp.com", "media.discordapp.net",
	    ...ALWAYS_ALLOWED_DOMAINS
	];
	let settingsPage = "main";
	let _pageHistory = [];
	let _scanResults = null;
	let _scanPendingDomain = null;
	function getSettings() {
	    if (!Player.ExtensionSettings) Player.ExtensionSettings = {};
	    if (!Player.ExtensionSettings[EXTENSION_ID]) {
	        Player.ExtensionSettings[EXTENSION_ID] = {
	            urlLoadMode: "whitelist",
	            allowedDomains: [...DEFAULT_ALLOWED_DOMAINS],
	            domainWarningEnabled: true,
	            animatedImageEnabled: true,
	            gifFrameRate: 100,
	            gifFpsSyncGame: false,
	            blockedPlayers: [],
	        };
	    }
	    return Player.ExtensionSettings[EXTENSION_ID];
	}
	function saveSettings() {
	    if (typeof ServerPlayerExtensionSettingsSync === "function")
	        ServerPlayerExtensionSettingsSync(EXTENSION_ID);
	}
	function getDomainWarningEnabled() {
	    return getSettings().domainWarningEnabled !== false;
	}
	function getAnimatedImageEnabled() {
	    return getSettings().animatedImageEnabled !== false;
	}
	function getGifFrameRate() {
	    const s = getSettings();
	    if (s.gifFpsSyncGame) {
	        const fps = (Player?.GraphicsSettings?.MaxFPS ?? 60) || 60;
	        return Math.max(16, Math.round(1000 / fps));
	    }
	    return (typeof s.gifFrameRate === "number" && s.gifFrameRate >= 33) ? s.gifFrameRate : 100;
	}
	function extractDomain(url) {
	    try { return new URL(url).hostname; } catch { return null; }
	}
	function isDomainInWhitelist(url) {
	    const domain = extractDomain(url);
	    if (!domain) return false;
	    const settings = getSettings();
	    const allowed = [...(settings.allowedDomains || []), ...ALWAYS_ALLOWED_DOMAINS];
	    return allowed.some(d => {
	        if (d.includes("*")) {
	            const p = new RegExp("^" + d.replace(/\./g, "\\.").replace(/\*/g, "[^/]+") + "$");
	            return p.test(domain);
	        }
	        return domain === d || domain.endsWith("." + d);
	    });
	}
	function isUrlAllowed(url) {
	    if (!url || !url.startsWith("https://")) return false;
	    const s = getSettings();
	    if (s.urlLoadMode === "unrestricted") return true;
	    return isDomainInWhitelist(url);
	}
	function addDomainToWhitelist(domain) {
	    if (!domain) return false;
	    domain = domain.toLowerCase().trim();
	    if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(domain)) return false;
	    const s = getSettings();
	    if (!s.allowedDomains) s.allowedDomains = [];
	    if (s.allowedDomains.includes(domain)) return false;
	    s.allowedDomains.push(domain);
	    saveSettings();
	    return true;
	}
	let _styleInjected = false;
	function _injectStyle() {
	    if (_styleInjected) return;
	    _styleInjected = true;
	    const s = document.createElement("style");
	    s.id = "ShuangSettingsStyle";
	    s.textContent = `
#${CONTAINER_ID} {
    /* 亮色（默认）：面板背景透明，保持原有外观 */
    --sca-fg:#1a1a1a; --sca-muted:#888; --sca-line:#eee; --sca-bg:transparent;
    --sca-card-bg:#fafafa; --sca-card-border:#e8e8e8; --sca-card-border-hover:#d0d0d0;
    --sca-btn-bg:#fff; --sca-btn-fg:#333; --sca-btn-border:#ccc;
    --sca-input-bg:#fff; --sca-input-fg:#333; --sca-input-border:#ccc;
    --sca-th-bg:#fafafa; --sca-th-fg:#666; --sca-th-line:#e0e0e0;
    --sca-td-even:#f8f8f8; --sca-td-odd:#fff; --sca-td-hover:#eef6ff;
    background:var(--sca-bg); box-sizing:border-box;
}
#${CONTAINER_ID}.sca-dark {
    /* 暗色：检测到暗背景时切换（见 _applyTheme） */
    --sca-fg:#e8e8e8; --sca-muted:#a0a6ae; --sca-line:#3a3d44; --sca-bg:#23252b;
    --sca-card-bg:#2c2f36; --sca-card-border:#3a3d44; --sca-card-border-hover:#4a4e57;
    --sca-btn-bg:#33363d; --sca-btn-fg:#e8e8e8; --sca-btn-border:#4a4e57;
    --sca-input-bg:#2c2f36; --sca-input-fg:#e8e8e8; --sca-input-border:#4a4e57;
    --sca-th-bg:#2c2f36; --sca-th-fg:#a0a6ae; --sca-th-line:#3a3d44;
    --sca-td-even:#282b31; --sca-td-odd:#23252b; --sca-td-hover:#31343c;
}
#${CONTAINER_ID} * { box-sizing:border-box; }
#${CONTAINER_ID} .sca-page { display:none; }
#${CONTAINER_ID} .sca-page.active { display:block; }
#${CONTAINER_ID} .sca-table-wrap { flex:1; min-height:200px; overflow-y:auto; }
#${CONTAINER_ID} .sca-table-wrap table { width:100%; border-collapse:collapse; }
#${CONTAINER_ID} .sca-table-wrap th { text-align:left; padding:10px 14px; color:var(--sca-th-fg); font-weight:normal; font-size:14px; border-bottom:2px solid var(--sca-th-line); background:var(--sca-th-bg); position:sticky; top:0; z-index:1; }
#${CONTAINER_ID} .sca-table-wrap td { padding:10px 14px; font-size:15px; color:var(--sca-fg); }
#${CONTAINER_ID} .sca-table-wrap tr:nth-child(even) td { background:var(--sca-td-even); }
#${CONTAINER_ID} .sca-table-wrap tr:nth-child(odd) td { background:var(--sca-td-odd); }
#${CONTAINER_ID} .sca-table-wrap tr:hover td { background:var(--sca-td-hover); }
#${CONTAINER_ID} .sca-bottom { flex-shrink:0; padding-top:12px; border-top:1px solid var(--sca-line); margin-top:10px; }
#${CONTAINER_ID} .sca-card { background:var(--sca-card-bg); border:1px solid var(--sca-card-border); border-radius:8px; padding:16px; margin-bottom:12px; }
#${CONTAINER_ID} .sca-card:hover { border-color:var(--sca-card-border-hover); }
#${CONTAINER_ID} .sca-card.active { border-color:#4caf50; background:#f1faf1; }
#${CONTAINER_ID}.sca-dark .sca-card.active { background:#1f2e22; }
#${CONTAINER_ID} .sca-card-title { font-size:16px; font-weight:600; margin-bottom:4px; color:var(--sca-fg); }
#${CONTAINER_ID} .sca-card-desc { font-size:13px; color:var(--sca-muted); }
#${CONTAINER_ID} .sca-tag { display:inline-block; padding:2px 10px; border-radius:10px; font-size:12px; font-weight:600; margin-left:8px; }
#${CONTAINER_ID} .sca-tag.green { background:#e8f5e9; color:#2e7d32; }
#${CONTAINER_ID} .sca-tag.orange { background:#fff3e0; color:#e65100; }
#${CONTAINER_ID} .sca-btn { display:inline-flex; align-items:center; justify-content:center; padding:9px 22px; border:1px solid var(--sca-btn-border); border-radius:6px; cursor:pointer; font-size:15px; user-select:none; transition:all 0.12s; background:var(--sca-btn-bg); color:var(--sca-btn-fg); }
#${CONTAINER_ID} .sca-btn:hover { filter:brightness(0.92); transform:translateY(-1px); box-shadow:0 2px 6px rgba(0,0,0,0.1); }
#${CONTAINER_ID} .sca-btn:active { filter:brightness(0.8); transform:translateY(0); }
#${CONTAINER_ID} .sca-btn:disabled { opacity:0.4; cursor:default; filter:none; transform:none; box-shadow:none; }
#${CONTAINER_ID} .sca-btn.danger { background:#e53935; color:#fff; border-color:#c62828; }
#${CONTAINER_ID} .sca-btn.primary { background:#4caf50; color:#fff; border-color:#388e3c; }
#${CONTAINER_ID} .sca-btn.small { padding:6px 14px; font-size:13px; border-radius:4px; }
#${CONTAINER_ID} .sca-input { padding:9px 12px; border:1px solid var(--sca-input-border); border-radius:6px; font-size:15px; outline:none; background:var(--sca-input-bg); color:var(--sca-input-fg); }
#${CONTAINER_ID} .sca-input:focus { border-color:#4caf50; box-shadow:0 0 0 3px rgba(76,175,80,0.15); }
#${CONTAINER_ID} .sca-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
#${CONTAINER_ID} .sca-label { color:var(--sca-fg); }
#${CONTAINER_ID} .sca-title { font-size:22px; font-weight:700; margin-bottom:4px; color:var(--sca-fg); letter-spacing:-0.3px; }
#${CONTAINER_ID} .sca-subtitle { font-size:14px; color:var(--sca-muted); margin-bottom:14px; }
#${CONTAINER_ID} .sca-section-title { font-size:17px; font-weight:600; margin:16px 0 10px; color:var(--sca-fg); }
#${CONTAINER_ID} .sca-page.active.sca-flex { display:flex; flex-direction:column; height:100%; }
`;
	    document.head.appendChild(s);
	}
	function _getContainer() {
	    let el = document.getElementById(CONTAINER_ID);
	    if (!el) {
	        _injectStyle();
	        el = document.createElement("div");
	        el.id = CONTAINER_ID;
	        el.style.cssText = "position:fixed;overflow:hidden;z-index:1000;font-family:Arial,'Microsoft YaHei',sans-serif";
	        document.body.appendChild(el);
	    }
	    return el;
	}
	function _removeContainer() {
	    const el = document.getElementById(CONTAINER_ID);
	    if (el) el.remove();
	}
	function _posContainer() {
	    const el = document.getElementById(CONTAINER_ID);
	    if (!el) return;
	    const sx = MainCanvas.canvas.clientWidth / MainCanvasWidth;
	    const sy = MainCanvas.canvas.clientHeight / MainCanvasHeight;
	    el.style.left = (MainCanvas.canvas.offsetLeft + 380 * sx) + "px";
	    el.style.top = (MainCanvas.canvas.offsetTop + 160 * sy) + "px";
	    el.style.width = ((MainCanvasWidth - 760) * sx) + "px";
	    el.style.height = ((MainCanvasHeight - 240) * sy) + "px";
	}
	let _lastThemeCheck = 0;
	function _applyTheme() {
	    const el = document.getElementById(CONTAINER_ID);
	    if (!el) return;
	    const now = Date.now();
	    if (now - _lastThemeCheck < 500) return;
	    _lastThemeCheck = now;
	    let dark = false;
	    try {
	        const px = MainCanvas.getImageData(1000, 460, 1, 1).data;
	        const lum = 0.299 * px[0] + 0.587 * px[1] + 0.114 * px[2];
	        dark = lum < 128;
	    } catch (_) { dark = false; }
	    el.classList.toggle("sca-dark", dark);
	}
	function _navigateTo(page) {
	    _pageHistory.push(settingsPage);
	    settingsPage = page;
	    _renderCurrentPage();
	}
	function _goBack() {
	    if (_pageHistory.length > 0) {
	        settingsPage = _pageHistory.pop();
	    } else {
	        settingsPage = "main";
	    }
	    _renderCurrentPage();
	}
	function _renderMainPage() {
	    const s = getSettings();
	    const modeLabel = s.urlLoadMode === "whitelist"
	        ? L("白名单模式", "Whitelist")
	        : L("不限制模式", "Unrestricted");
	    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("自定义贴图 - 安全设置", "Custom Texture - Security Settings")}</div>
            <div class="sca-row" style="margin:6px 0 14px">
                <span style="font-size:15px;color:var(--sca-muted)">${L("当前模式：", "Current mode: ")}<strong style="color:var(--sca-fg)">${modeLabel}</strong></span>
            </div>

            <div class="sca-card" onclick="ShuangSettings.nav('modeSelect')" style="cursor:pointer">
                <div class="sca-card-title">${L("加载模式设置", "Load Mode Settings")} <span class="sca-tag ${s.urlLoadMode === 'whitelist' ? 'green' : 'orange'}">${modeLabel}</span></div>
                <div class="sca-card-desc">${L("选择白名单模式或不限制模式", "Choose whitelist or unrestricted mode")}</div>
            </div>

            ${s.urlLoadMode === "whitelist" ? `
            <div class="sca-card" onclick="ShuangSettings.nav('whitelist')" style="cursor:pointer">
                <div class="sca-card-title">${L("域名白名单管理", "Domain Whitelist")} <span style="font-size:13px;color:var(--sca-muted);font-weight:normal">${L(`${s.allowedDomains?.length || 0} 个域名`, `${s.allowedDomains?.length || 0} domains`)}</span></div>
                <div class="sca-card-desc">${L("添加或移除可信域名，仅这些域名下的贴图会加载", "Add or remove trusted domains")}</div>
            </div>
            ` : ""}

            <div style="margin:12px 0;border-top:1px solid var(--sca-line);padding-top:12px">
                <div class="sca-row" style="margin-bottom:8px">
                    <span class="sca-label">${L("不可信域名提示", "Untrusted domain warning")}</span>
                    <button class="sca-btn ${s.domainWarningEnabled !== false ? 'primary' : ''}" onclick="ShuangSettings.toggle('domainWarningEnabled')" style="width:70px">
                        ${s.domainWarningEnabled !== false ? L("开", "On") : L("关", "Off")}
                    </button>
                </div>
                <div class="sca-row" style="margin-bottom:8px">
                    <span class="sca-label">${L("启用动态图片", "Enable animated images")}</span>
                    <button class="sca-btn ${s.animatedImageEnabled !== false ? 'primary' : ''}" onclick="ShuangSettings.toggle('animatedImageEnabled')" style="width:70px">
                        ${s.animatedImageEnabled !== false ? L("开", "On") : L("关", "Off")}
                    </button>
                </div>
                <div class="sca-row">
                    <span class="sca-label">${L("动图帧率", "GIF Frame Rate")}</span>
                    <input class="sca-input" type="number" min="2" max="30" value="${Math.round(1000 / getGifFrameRate())}" style="width:80px" onchange="ShuangSettings.setFps(this.value)" ${s.gifFpsSyncGame ? "disabled" : ""}>
                    <span style="font-size:14px;color:var(--sca-muted)">fps</span>
                    <button class="sca-btn ${s.gifFpsSyncGame ? 'primary' : ''}" onclick="ShuangSettings.toggle('gifFpsSyncGame')" style="min-width:160px">
                        ${L(`同步游戏帧率: ${s.gifFpsSyncGame ? "开" : "关"}`, `Sync FPS: ${s.gifFpsSyncGame ? "On" : "Off"}`)}
                    </button>
                </div>
            </div>

            <div style="margin-top:auto;padding-top:12px;border-top:1px solid var(--sca-line)">
                <div class="sca-card" onclick="ShuangSettings.nav('blocked')" style="cursor:pointer">
                    <div class="sca-card-title">${L("屏蔽玩家管理", "Blocked Players")} <span style="font-size:13px;color:var(--sca-muted);font-weight:normal">${L(`${(s.blockedPlayers || []).length} 人`, `${(s.blockedPlayers || []).length} players`)}</span></div>
                    <div class="sca-card-desc">${L("屏蔽某玩家的贴图来源或配置，其贴图将不显示", "Block textures from or configured by specific players")}</div>
                </div>
            </div>
        </div>
    `;
	}
	function _renderModeSelectPage() {
	    const s = getSettings();
	    const isWhitelist = s.urlLoadMode === "whitelist";
	    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("选择贴图加载模式", "Select Load Mode")}</div>
            <div class="sca-subtitle">${L("选择白名单模式或不限制模式", "Choose whitelist or unrestricted mode")}</div>

            <div class="sca-card ${isWhitelist ? 'active' : ''}" onclick="ShuangSettings.setMode('whitelist')" style="cursor:pointer">
                <div class="sca-card-title">${L("白名单模式", "Whitelist Mode")} ${isWhitelist ? `<span class="sca-tag green">${L("当前", "Current")}</span>` : ""}</div>
                <div class="sca-card-desc">${L("仅加载来自可信域名的贴图 URL（推荐）", "Only load textures from trusted domains (recommended)")}</div>
            </div>

            <div class="sca-card ${!isWhitelist ? 'active' : ''}" onclick="ShuangSettings.nav('unrestrictedConfirm')" style="cursor:pointer">
                <div class="sca-card-title">${L("不限制模式", "Unrestricted Mode")} ${!isWhitelist ? `<span class="sca-tag orange">${L("当前", "Current")}</span>` : ""}</div>
                <div class="sca-card-desc">${L("加载所有 HTTPS 贴图 URL（存在隐私风险）", "Load any HTTPS texture URL (privacy risk)")}</div>
            </div>

            ${isWhitelist ? "" : `
            <div style="margin-top:16px;padding:12px;background:#fff3e0;border-radius:8px;border:1px solid #ffcc02">
                <span style="color:#e65100;font-size:14px">⚠️ ${L("不限制模式下，所有 HTTPS 贴图都会加载，可能包含不适宜内容。", "In unrestricted mode, all HTTPS textures will load. This may include inappropriate content.")}</span>
            </div>
            `}
        </div>
    `;
	}
	function _renderWhitelistPage() {
	    const s = getSettings();
	    const domains = s.allowedDomains || [];
	    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("域名白名单管理", "Domain Whitelist")}</div>
            <div class="sca-subtitle">${L("仅来自这些域名的贴图 URL 会被加载", "Only texture URLs from these domains will load")}</div>

            <div class="sca-table-wrap" style="flex:1;min-height:200px">
                <table class="sca-table">
                    <thead><tr><th style="width:40px">#</th><th>${L("域名", "Domain")}</th><th style="width:100px">${L("操作", "Action")}</th></tr></thead>
                    <tbody>
                        ${domains.length === 0 ? `
                            <tr><td colspan="3" style="text-align:center;color:var(--sca-muted);padding:30px">${L("（暂无域名，请添加）", "(No domains, add one)")}</td></tr>
                        ` : domains.map((d, i) => `
                            <tr>
                                <td style="color:var(--sca-muted)">${i + 1}</td>
                                <td>${d}</td>
                                <td><button class="sca-btn danger small" onclick="ShuangSettings.removeDomain(${i})">${L("删除", "Delete")}</button></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <div class="sca-bottom">
                <div class="sca-row">
                    <span class="sca-label">${L("添加域名:", "Add domain:")}</span>
                    <input class="sca-input" id="ShuangDomainInput" type="text" placeholder="${L("example.com", "example.com")}" style="width:250px" onkeydown="if(event.key==='Enter')ShuangSettings.addDomain()">
                    <button class="sca-btn primary" onclick="ShuangSettings.addDomain()">${L("添加", "Add")}</button>
                    <button class="sca-btn" onclick="ShuangSettings.addDefaultDomains()" style="background:#e3f2fd;border-color:#90caf9">${L("添加推荐域名", "Add Defaults")}</button>
                    <button class="sca-btn" onclick="ShuangSettings.scanRoom()" style="background:#fff3e0;border-color:#ffb74d">${L("扫描房间", "Scan Room")}</button>
                    <button class="sca-btn danger" onclick="ShuangSettings.clearDomains()">${L("清空全部", "Clear All")}</button>
                </div>
            </div>
        </div>
    `;
	    const input = document.getElementById("ShuangDomainInput");
	    if (input) setTimeout(() => input.focus(), 50);
	}
	function _renderBlockedPage() {
	    const s = getSettings();
	    const blocked = s.blockedPlayers || [];
	    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("屏蔽玩家管理", "Blocked Players")}</div>
            <div class="sca-subtitle">${L("被屏蔽的玩家，其贴图来源或配置的贴图将不会显示",
                "Textures from or configured by blocked players will be hidden")}</div>

            <div class="sca-table-wrap" style="flex:1;min-height:200px">
                <table class="sca-table">
                    <thead><tr><th style="width:100px">${L("ID", "ID")}</th><th>${L("昵称", "Nickname")}</th><th style="width:120px">${L("操作", "Action")}</th></tr></thead>
                    <tbody id="ShuangBlockedTableBody">
                        ${blocked.length === 0 ? `
                            <tr><td colspan="3" style="text-align:center;color:var(--sca-muted);padding:30px">${L("（暂无屏蔽的玩家）", "(No blocked players)")}</td></tr>
                        ` : blocked.map((mn, i) => {
                            const name = _getPlayerName(mn);
                            return `<tr>
                                <td>#${mn}</td>
                                <td>${name || "-"}</td>
                                <td><button class="sca-btn danger small" onclick="ShuangSettings.unblock(${i})">${L("取消屏蔽", "Unblock")}</button></td>
                            </tr>`;
                        }).join("")}
                    </tbody>
                </table>
            </div>

            <div class="sca-bottom">
                <div class="sca-section-title" style="margin-top:0">${L("添加屏蔽", "Add Block")}</div>
                <div class="sca-row">
                    <span class="sca-label">MemberNumber:</span>
                    <input class="sca-input" id="ShuangBlockedNewInput" type="text" placeholder="${L("输入 MemberNumber", "Enter MemberNumber")}" style="width:200px">
                    <button class="sca-btn primary" onclick="ShuangSettings.addBlocked()">${L("添加", "Add")}</button>
                    <button class="sca-btn" onclick="ShuangSettings.nav('roomPick')">${L("从房间中选择 >>>", "From Room >>>")}</button>
                </div>
            </div>
        </div>
    `;
	    const inp = document.getElementById("ShuangBlockedNewInput");
	    if (inp) {
	        inp.onkeydown = (e) => {
	            if (e.key === "Enter") ShuangSettings.addBlocked();
	        };
	        setTimeout(() => inp.focus(), 50);
	    }
	}
	function collectUntrustedUrls() {
	    const results = [];
	    const chars = [];
	    if (typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter)) {
	        chars.push(...ChatRoomCharacter);
	    }
	    if (typeof Player !== "undefined" && Player && chars.indexOf(Player) === -1) {
	        chars.push(Player);
	    }
	    for (const C of chars) {
	        if (!C || !C.Appearance) continue;
	        const name = (typeof CharacterNickname === "function" ? CharacterNickname(C) : "")
	            || C.Nickname || C.Name || "Unknown";
	        for (const item of C.Appearance) {
	            if (!item?.Asset || item.Asset.Name !== ASSET_NAME) continue;
	            const textures = item?.Property?.Textures;
	            if (!Array.isArray(textures)) continue;
	            for (const texture of textures) {
	                if (!texture) continue;
	                _addIfUntrusted(results, name, texture.TextureURL);
	                if (texture.PoseSettings && typeof texture.PoseSettings === "object") {
	                    for (const ps of Object.values(texture.PoseSettings)) {
	                        if (ps && typeof ps === "object") {
	                            _addIfUntrusted(results, name, ps.TextureURL);
	                        }
	                    }
	                }
	            }
	        }
	    }
	    const seen = new Set();
	    return results.filter(r => {
	        const key = r.name + "|" + r.url;
	        if (seen.has(key)) return false;
	        seen.add(key);
	        return true;
	    });
	}
	function _addIfUntrusted(results, name, url) {
	    if (!url || typeof url !== "string") return;
	    if (isDomainInWhitelist(url)) return;
	    const domain = extractDomain(url);
	    if (!domain) return;
	    results.push({ name, url, domain });
	}
	function _getScanResults() {
	    if (_scanResults === null) {
	        _scanResults = collectUntrustedUrls();
	    }
	    return _scanResults;
	}
	function _refreshScanResults() {
	    _scanResults = collectUntrustedUrls();
	}
	function _renderScanPage() {
	    const s = getSettings();
	    const inRoom = typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter) && ChatRoomCharacter.length > 0;
	    const results = _getScanResults();
	    if (s.urlLoadMode !== "whitelist") {
	        _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("房间不可信域名扫描", "Room Untrusted Domain Scan")}</div>
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--sca-muted)">
                <div style="font-size:16px">${L("此功能仅在白名单模式下可用", "This feature is only available in Whitelist mode")}</div>
                <div style="font-size:14px">${L("请先切换到白名单模式", "Please switch to Whitelist mode first")}</div>
            </div>
        </div>`;
	        return;
	    }
	    if (_scanPendingDomain) {
	        _renderScanConfirmPage();
	        return;
	    }
	    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("房间不可信域名扫描", "Room Untrusted Domain Scan")}</div>
            <div class="sca-subtitle">${inRoom
                ? L("当前房间内所有玩家身上的不可信贴图域名", "Untrusted texture domains from all players in the current room")
                : L("当前不在房间中，仅扫描了自己的贴图", "Not in a room, only your own textures were scanned")}</div>

            ${results.length === 0 ? `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">
                <div style="font-size:18px;color:#4caf50">${L("✔ 未发现不可信域名", "✔ No untrusted domains found")}</div>
                <div style="font-size:14px;color:var(--sca-muted)">${L("当前房间内所有玩家的贴图域名均已在白名单中", "All texture domains in the current room are already whitelisted")}</div>
            </div>
            ` : `
            <div style="font-size:14px;color:#e65100;margin-bottom:8px">${L(`发现 ${results.length} 个不可信域名`, `${results.length} untrusted domains found`)}</div>
            <div class="sca-table-wrap" style="flex:1;min-height:200px">
                <table class="sca-table">
                    <thead><tr>
                        <th style="width:36px">#</th>
                        <th style="width:160px">${L("玩家", "Player")}</th>
                        <th style="width:240px">${L("域名", "Domain")}</th>
                        <th>${L("URL", "URL")}</th>
                        <th style="width:90px">${L("操作", "Action")}</th>
                    </tr></thead>
                    <tbody>
                        ${results.map((r, i) => `
                        <tr>
                            <td style="color:var(--sca-muted)">${i + 1}</td>
                            <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.name}">${r.name}</td>
                            <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.domain}">${r.domain}</td>
                            <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--sca-muted);font-size:13px" title="${r.url}">${r.url}</td>
                            <td><button class="sca-btn primary small" onclick="ShuangSettings.trustDomain(&quot;${r.domain.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}&quot;)">${L("信任", "Trust")}</button></td>
                        </tr>`).join("")}
                    </tbody>
                </table>
            </div>
            `}
        </div>
    `;
	}
	function _renderScanConfirmPage() {
	    const domain = _scanPendingDomain;
	    const lines = isChineseLang() ? [
	        `即将添加域名到白名单: ${domain}`,
	        "",
	        "添加后，来自该域名的贴图 URL 将被允许加载",
	        "",
	        "请注意以下风险：",
	        "1. 请确认您信任该域名提供者",
	        "2. 该域名的所有 URL 都将被加载",
	        "3. 恶意域名可能用于追踪您的 IP 地址",
	        "4. 恶意域名可能导致隐私信息泄露",
	        "",
	        "确定要添加此域名到可信列表吗？",
	    ] : [
	        `About to add domain to whitelist: ${domain}`,
	        "",
	        "Once added, texture URLs from this domain will be allowed",
	        "",
	        "Please note the following risks:",
	        "1. Make sure you trust this domain's provider",
	        "2. All URLs from this domain will be loaded",
	        "3. A malicious domain may track your IP address",
	        "4. A malicious domain may leak private info",
	        "",
	        "Add this domain to the trusted list?",
	    ];
	    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title" style="color:#e53935">${L("⚠ 添加可信域名确认 ⚠", "⚠ Confirm Trusted Domain ⚠")}</div>
            <div style="flex:1;min-height:0;overflow-y:auto;padding:12px;background:#fff8f8;border:1px solid #ffcdd2;border-radius:8px;margin:8px 0">
                ${lines.map(line => line ? `<div style="font-size:15px;color:#333;padding:3px 0">${line}</div>` : `<div style="height:8px"></div>`).join("")}
            </div>
            <div class="sca-row" style="justify-content:center;gap:16px;padding-top:12px;border-top:1px solid var(--sca-line)">
                <button class="sca-btn primary" onclick="ShuangSettings.confirmTrustDomain()" style="min-width:160px;font-size:17px;padding:12px 30px;background:#4caf50;border-color:#43a047">
                    ${L("确认添加", "Add")}
                </button>
                <button class="sca-btn secondary" onclick="ShuangSettings.cancelTrustDomain()" style="min-width:160px;font-size:17px;padding:12px 30px">
                    ${L("取消", "Cancel")}
                </button>
            </div>
        </div>
    `;
	}
	function _renderRoomPickPage() {
	    const chars = (typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter))
	        ? ChatRoomCharacter : [];
	    if (Player && chars.indexOf(Player) === -1) chars.push(Player);
	    const blocked = getSettings().blockedPlayers || [];
	    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("从房间选择要屏蔽的玩家", "Select from Room")}</div>

            <div class="sca-table-wrap" style="flex:1;min-height:200px">
                <table class="sca-table">
                    <thead><tr><th style="width:100px">${L("ID", "ID")}</th><th>${L("昵称", "Nickname")}</th><th style="width:120px">${L("操作", "Action")}</th></tr></thead>
                    <tbody>
                        ${chars.filter(c => c.MemberNumber).map(c => {
                            const mn = c.MemberNumber;
                            const name = (typeof CharacterNickname === "function" ? CharacterNickname(c) : "") || c.Nickname || c.Name || "";
                            const isBlocked = blocked.indexOf(mn) !== -1;
                            return `<tr>
                                <td>#${mn}</td>
                                <td>${name || "-"}</td>
                                <td>${isBlocked
                                    ? `<span style="color:var(--sca-muted);font-size:14px">${L("已屏蔽", "Blocked")}</span>`
                                    : `<button class="sca-btn danger small" onclick="ShuangSettings.blockFromRoom(${mn})">${L("屏蔽", "Block")}</button>`
                                }</td>
                            </tr>`;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
	}
	function _renderUnrestrictedConfirmPage() {
	    const lines = isChineseLang() ? [
	        "不限制模式将加载来自任意 HTTPS 地址的贴图 URL",
	        "",
	        "请注意以下风险：",
	        "1. 其他玩家可能提供恶意的贴图 URL",
	        "2. 这些 URL 可能被用于追踪您的 IP 地址",
	        "3. 恶意 URL 可能导致隐私信息泄露",
	        "4. 您的真实 IP 可能被第三方记录",
	        "",
	        "我们强烈建议您保持白名单模式",
	        "",
	        "确定要开启不限制模式吗？",
	    ] : [
	        "Unrestricted mode loads texture URLs from any HTTPS address",
	        "",
	        "Please note the following risks:",
	        "1. Other players may provide malicious texture URLs",
	        "2. These URLs may be used to track your IP address",
	        "3. Malicious URLs may leak private information",
	        "4. Your real IP may be recorded by third parties",
	        "",
	        "We strongly recommend keeping Whitelist mode",
	        "",
	        "Are you sure you want to enable Unrestricted mode?",
	    ];
	    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title" style="color:#e53935">${L("⚠ 隐私安全警告 ⚠", "⚠ Privacy & Security Warning ⚠")}</div>
            <div style="flex:1;min-height:0;overflow-y:auto;padding:12px;background:#fff8f8;border:1px solid #ffcdd2;border-radius:8px;margin:8px 0">
                ${lines.map(line => line ? `<div style="font-size:15px;color:#333;padding:3px 0">${line}</div>` : `<div style="height:8px"></div>`).join("")}
            </div>
            <div class="sca-row" style="justify-content:center;gap:16px;padding-top:12px;border-top:1px solid var(--sca-line)">
                <button class="sca-btn danger" onclick="ShuangSettings.confirmUnrestricted()" style="min-width:160px;font-size:17px;padding:12px 30px">
                    ${L("确定开启", "Enable")}
                </button>
                <button class="sca-btn secondary" onclick="ShuangSettings.cancelUnrestricted()" style="min-width:160px;font-size:17px;padding:12px 30px">
                    ${L("取消", "Cancel")}
                </button>
            </div>
        </div>
    `;
	}
	window.ShuangSettings = {
	    nav: (page) => _navigateTo(page),
	    back: () => _goBack(),
	    toggle: (key) => {
	        const s = getSettings();
	        s[key] = !s[key];
	        saveSettings();
	        _renderCurrentPage();
	    },
	    setFps: (val) => {
	        const p = parseInt(val);
	        if (isNaN(p)) return;
	        const c = Math.max(2, Math.min(30, p));
	        const ms = Math.round(1000 / c);
	        const s = getSettings();
	        if (s.gifFrameRate !== ms) { s.gifFrameRate = ms; saveSettings(); }
	    },
	    setMode: (mode) => {
	        const s = getSettings();
	        s.urlLoadMode = mode;
	        saveSettings();
	        _renderModeSelectPage();
	    },
	    unblock: (index) => {
	        const s = getSettings();
	        const b = s.blockedPlayers || [];
	        b.splice(index, 1);
	        s.blockedPlayers = b;
	        saveSettings();
	        _refreshRoomCharacters();
	        _renderBlockedPage();
	    },
	    addBlocked: () => {
	        const inp = document.getElementById("ShuangBlockedNewInput");
	        if (!inp) return;
	        const val = parseInt(inp.value, 10);
	        if (Number.isFinite(val) && val > 0) {
	            const s = getSettings();
	            const b = s.blockedPlayers || [];
	            if (b.indexOf(val) === -1) {
	                b.push(val);
	                s.blockedPlayers = b;
	                saveSettings();
	                _refreshRoomCharacters();
	            }
	            inp.value = "";
	            _renderBlockedPage();
	        }
	    },
	    blockFromRoom: (mn) => {
	        const s = getSettings();
	        const b = s.blockedPlayers || [];
	        if (b.indexOf(mn) === -1) {
	            b.push(mn);
	            s.blockedPlayers = b;
	            saveSettings();
	            _refreshRoomCharacters();
	        }
	        _renderRoomPickPage();
	    },
	    addDomain: () => {
	        const inp = document.getElementById("ShuangDomainInput");
	        if (!inp || !inp.value.trim()) return;
	        addDomainToWhitelist(inp.value.trim());
	        inp.value = "";
	        _renderWhitelistPage();
	    },
	    removeDomain: (index) => {
	        const s = getSettings();
	        s.allowedDomains.splice(index, 1);
	        saveSettings();
	        _renderWhitelistPage();
	    },
	    clearDomains: () => {
	        const s = getSettings();
	        s.allowedDomains = [];
	        saveSettings();
	        _renderWhitelistPage();
	    },
	    addDefaultDomains: () => {
	        const s = getSettings();
	        for (const d of DEFAULT_ALLOWED_DOMAINS) {
	            if (!s.allowedDomains.includes(d)) s.allowedDomains.push(d);
	        }
	        saveSettings();
	        _renderWhitelistPage();
	    },
	    scanRoom: () => {
	        _scanResults = null;
	        _scanPendingDomain = null;
	        _navigateTo("scan");
	    },
	    trustDomain: (domain) => {
	        _scanPendingDomain = domain;
	        _renderScanPage();
	    },
	    confirmTrustDomain: () => {
	        const domain = _scanPendingDomain;
	        if (!domain) return;
	        const success = addDomainToWhitelist(domain);
	        if (success) Logger.info(`从房间扫描添加可信域名: ${domain}`);
	        _scanPendingDomain = null;
	        _refreshScanResults();
	        _renderScanPage();
	    },
	    cancelTrustDomain: () => {
	        _scanPendingDomain = null;
	        _renderScanPage();
	    },
	    confirmUnrestricted: () => {
	        const s = getSettings();
	        s.urlLoadMode = "unrestricted";
	        saveSettings();
	        Logger.info("已切换到不限制模式");
	        _pageHistory = [];
	        settingsPage = "main";
	        _renderCurrentPage();
	    },
	    cancelUnrestricted: () => {
	        _goBack();
	    }
	};
	function _renderCurrentPage() {
	    const container = _getContainer();
	    switch (settingsPage) {
	        case "main": _renderMainPage(); break;
	        case "modeSelect": _renderModeSelectPage(); break;
	        case "whitelist": _renderWhitelistPage(); break;
	        case "scan": _renderScanPage(); break;
	        case "blocked": _renderBlockedPage(); break;
	        case "roomPick": _renderRoomPickPage(); break;
	        case "unrestrictedConfirm": _renderUnrestrictedConfirmPage(); break;
	        default: container.innerHTML = ""; break;
	    }
	    _posContainer();
	}
	function _refreshRoomCharacters() {
	    try {
	        const chars = (typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter))
	            ? ChatRoomCharacter : [];
	        if (Player && chars.indexOf(Player) === -1) chars.push(Player);
	        for (const C of chars) {
	            if (typeof CharacterRefresh === "function") CharacterRefresh(C, false, false);
	        }
	    } catch (_) {}
	}
	function _getPlayerName(mn) {
	    try {
	        if (typeof CharacterNickname === "function") {
	            const chars = (typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter))
	                ? ChatRoomCharacter : [];
	            for (const C of chars) {
	                if (C.MemberNumber === mn) return CharacterNickname(C) || C.Name || "";
	            }
	            if (Player && Player.MemberNumber === mn) return CharacterNickname(Player) || Player.Name || "";
	        }
	        if (Player && Player.MemberNumber === mn) return Player.Nickname || Player.Name || "";
	    } catch (_) {}
	    return "";
	}
	function initSettings() {
	    if (typeof PreferenceRegisterExtensionSetting !== "function") {
	        setTimeout(initSettings, 1000);
	        return;
	    }
	    PreferenceRegisterExtensionSetting({
	        Identifier: EXTENSION_ID,
	        ButtonText: L("自定义贴图设置", "Custom Texture Settings"),
	        Image: BADGE_IMAGE_URL,
	        load: () => {
	            settingsPage = "main";
	            _pageHistory = [];
	            _getContainer();
	            _renderCurrentPage();
	        },
	        run: () => {
	            MainCanvas.textAlign = "center";
	            if (settingsPage !== "main") {
	                DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png",
	                    L("返回", "Back"));
	            } else {
	                DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png",
	                    L("退出", "Exit"));
	            }
	            _posContainer();
	            _applyTheme();
	            MainCanvas.textAlign = "center";
	        },
	        click: () => {
	            if (MouseIn(1815, 75, 90, 90)) {
	                if (settingsPage !== "main") {
	                    _goBack();
	                } else {
	                    PreferenceSubscreenExtensionsClear();
	                }
	            }
	        },
	        exit: () => {
	            _removeContainer();
	            settingsPage = "main";
	            _pageHistory = [];
	            return true;
	        },
	        unload: () => {
	            _removeContainer();
	            settingsPage = "main";
	            _pageHistory = [];
	        },
	    });
	    Logger.info("扩展设置已注册");
	}

	function refreshCharacterAppearance(C) {
	    if (!C) return;
	    try {
	        if (typeof CharacterAppearanceBuildCanvas === "function") {
	            CharacterAppearanceBuildCanvas(C);
	            C.MustDraw = false;
	        } else if (typeof CharacterRefresh === "function") {
	            CharacterRefresh(C, false, false);
	        }
	    } catch (err) {
	        Logger.error("[ShuangAssets] 角色外观重绘失败", err);
	    }
	}
	const _pendingOneShot = new Set();
	function queueOneShotRefresh(C) {
	    if (!C || _pendingOneShot.has(C)) return;
	    _pendingOneShot.add(C);
	    setTimeout(() => {
	        _pendingOneShot.delete(C);
	        refreshCharacterAppearance(C);
	    }, 0);
	}

	const GIF_POLL_INTERVAL_DEFAULT_MS = 100;
	const STALE_CHARACTER_TIMEOUT_MS = 5 * 60 * 1000;
	const _knownAnimatedCharacters = new Map();
	let _timerStarted = false;
	function isCurrentlyVisible(C) {
	    if (typeof DrawLastCharacters === "undefined" || !Array.isArray(DrawLastCharacters)) {
	        return true;
	    }
	    return DrawLastCharacters.includes(C);
	}
	function kickAllKnownAnimated() {
	    if (_knownAnimatedCharacters.size === 0) return;
	    for (const [C, entry] of _knownAnimatedCharacters) {
	        entry.nextDue = Infinity;
	        refreshCharacterAppearance(C);
	    }
	}
	function kickDueAnimated() {
	    if (_knownAnimatedCharacters.size === 0) return;
	    const now = Date.now();
	    for (const [C, entry] of _knownAnimatedCharacters) {
	        if (now < entry.nextDue) continue;
	        if (!isCurrentlyVisible(C)) continue;
	        entry.nextDue = Infinity;
	        refreshCharacterAppearance(C);
	    }
	}
	function forgetCharacter(C) {
	    if (C) _knownAnimatedCharacters.delete(C);
	}
	function pruneStaleCharacters() {
	    const now = Date.now();
	    for (const [C, entry] of _knownAnimatedCharacters) {
	        if (now - entry.lastSeen > STALE_CHARACTER_TIMEOUT_MS) {
	            _knownAnimatedCharacters.delete(C);
	        }
	    }
	}
	function ensureTimerStarted() {
	    if (_timerStarted) return;
	    _timerStarted = true;
	    const tick = () => {
	        pruneStaleCharacters();
	        kickDueAnimated();
	        setTimeout(tick, getGifFrameRate());
	    };
	    setTimeout(tick, GIF_POLL_INTERVAL_DEFAULT_MS);
	    if (typeof document !== "undefined") {
	        document.addEventListener("visibilitychange", () => {
	            if (document.visibilityState !== "visible") return;
	            kickAllKnownAnimated();
	        });
	    }
	}
	function setupGifAnimationHooks(HookManager) {
	    if (!HookManager || typeof HookManager.hookFunction !== "function") return;
	    try {
	        HookManager.hookFunction("CommonSetScreen", 0, (args, next) => {
	            const ret = next(args);
	            setTimeout(() => kickAllKnownAnimated(), 0);
	            pruneCachesNow();
	            return ret;
	        });
	    } catch (err) {
	        Logger.error("[ShuangAssets] 注册画面切换动图钩子失败", err);
	    }
	    if (typeof HookManager.afterPlayerLogin === "function") {
	        try {
	            HookManager.afterPlayerLogin(() => setTimeout(() => kickAllKnownAnimated(), 0));
	        } catch (err) {
	            Logger.error("[ShuangAssets] 注册登入动图钩子失败", err);
	        }
	    }
	    try {
	        HookManager.hookFunction("ChatRoomSyncItem", 0, (args, next) => {
	            const ret = next(args);
	            try {
	                const data = args[0];
	                const target = data?.Item?.Target;
	                if (
	                    typeof target === "number"
	                    && typeof ChatRoomCharacter !== "undefined"
	                    && Array.isArray(ChatRoomCharacter)
	                ) {
	                    const C = ChatRoomCharacter.find((c) => c.MemberNumber === target);
	                    if (C) forgetCharacter(C);
	                }
	            } catch (err) {
	                Logger.error("[ShuangAssets] 处理道具同步事件失败", err);
	            }
	            return ret;
	        });
	    } catch (err) {
	        Logger.error("[ShuangAssets] 注册道具同步动图钩子失败", err);
	    }
	}
	function notifyGifFrame(C, layerIndex, frameIndex, nextDueAt) {
	    if (!C || frameIndex < 0) return;
	    ensureTimerStarted();
	    const now = Date.now();
	    const due = typeof nextDueAt === "number" ? nextDueAt : now;
	    let entry = _knownAnimatedCharacters.get(C);
	    if (!entry) {
	        entry = { lastSeen: now, nextDue: due };
	        _knownAnimatedCharacters.set(C, entry);
	    } else {
	        entry.lastSeen = now;
	        entry.nextDue = Math.min(entry.nextDue, due);
	    }
	}

	const TAG_CONTENT = "SCA_INFO";
	const TAG_KEY = "SCA_INFO";
	const ICON_X = 320;
	const ICON_Y = 0;
	const ICON_SIZE = 40;
	function sendTag(target) {
	    if (typeof ServerSend !== "function") return;
	    if (!Player?.MemberNumber) return;
	    if (!Player[TAG_KEY]) Player[TAG_KEY] = { version: ModInfo.version };
	    const msg = {
	        Content: TAG_CONTENT,
	        Type: "Hidden",
	        Dictionary: [{ Type: TAG_CONTENT, Content: { version: ModInfo.version } }]
	    };
	    if (typeof target === "number") msg.Target = target;
	    ServerSend("ChatRoomChat", msg);
	}
	function setupModTagHooks(HookManager) {
	    if (!HookManager || typeof HookManager.hookFunction !== "function") return;
	    if (typeof HookManager.afterPlayerLogin === "function") {
	        HookManager.afterPlayerLogin(() => {
	            Player[TAG_KEY] = { version: ModInfo.version };
	        });
	    }
	    if (typeof ChatRoomSync === "function") {
	        HookManager.hookFunction("ChatRoomSync", 0, (args, next) => {
	            const ret = next(args);
	            try { sendTag(); } catch (e) { Logger.error("[ShuangAssets] 广播 mod 状态失败", e); }
	            return ret;
	        });
	    }
	    if (typeof ChatRoomSyncMemberJoin === "function") {
	        HookManager.hookFunction("ChatRoomSyncMemberJoin", 0, (args, next) => {
	            const ret = next(args);
	            try {
	                const source = args[0]?.SourceMemberNumber;
	                if (typeof source === "number") sendTag(source);
	            } catch (e) { Logger.error("[ShuangAssets] 定向发送 mod 状态失败", e); }
	            return ret;
	        });
	    }
	    if (typeof ChatRoomMessage === "function") {
	        HookManager.hookFunction("ChatRoomMessage", 0, (args, next) => {
	            const data = args[0];
	            try {
	                if (data?.Type === "Hidden" && data?.Content === TAG_CONTENT) {
	                    const sender = data.Sender;
	                    const payload = Array.isArray(data.Dictionary)
	                        ? data.Dictionary.find(d => d?.Type === TAG_CONTENT)?.Content
	                        : undefined;
	                    if (typeof sender === "number" && payload
	                        && typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter)) {
	                        const C = ChatRoomCharacter.find(c => c.MemberNumber === sender);
	                        if (C) C[TAG_KEY] = payload;
	                    }
	                }
	            } catch (e) { Logger.error("[ShuangAssets] 接收 mod 状态失败", e); }
	            return next(args);
	        });
	    }
	    if (typeof ChatRoomDrawCharacterStatusIcons === "function") {
	        HookManager.hookFunction("ChatRoomDrawCharacterStatusIcons", 10, (args, next) => {
	            next(args);
	            try {
	                const [C, CharX, CharY, Zoom] = args;
	                if (typeof ChatRoomHideIconState !== "undefined" && ChatRoomHideIconState !== 0) return;
	                if (!C?.[TAG_KEY]) return;
	                const iconX = CharX + ICON_X * Zoom;
	                const iconY = CharY + ICON_Y * Zoom;
	                const iconW = ICON_SIZE * Zoom;
	                const iconH = ICON_SIZE * Zoom;
	                DrawImageResize(BADGE_IMAGE_URL, iconX, iconY, iconW, iconH);
	                if (typeof MouseIn === "function" && typeof MainCanvas !== "undefined"
	                    && MouseIn(iconX, iconY, iconW, iconH) && Array.isArray(DrawHoverElements)) {
	                    const ver = C[TAG_KEY]?.version ?? ModInfo.version;
	                    DrawHoverElements.push(() => {
	                        const boxW = 120 * Zoom;
	                        const boxH = 24 * Zoom;
	                        const boxX = iconX + (iconW - boxW) / 2;
	                        const boxY = iconY + iconH + 3 * Zoom;
	                        MainCanvas.save();
	                        MainCanvas.fillStyle = "rgba(0,0,0,0.8)";
	                        MainCanvas.fillRect(boxX, boxY, boxW, boxH);
	                        MainCanvas.textAlign = "center";
	                        MainCanvas.textBaseline = "middle";
	                        MainCanvas.font = `${Math.round(13 * Zoom)}px Arial`;
	                        MainCanvas.fillStyle = "#FFF";
	                        MainCanvas.fillText(`SCA v${ver}`, boxX + boxW / 2, boxY + boxH / 2);
	                        MainCanvas.restore();
	                    });
	                }
	            } catch (e) { Logger.error("[ShuangAssets] 绘制 mod 图标失败", e); }
	        });
	    }
	}

	const state = {
	    currentEditTexture: -1,
	    tempTextureData: null,
	    currentListPage: 0,
	    currentView: "list",
	    pendingDomainToAdd: null,
	    tutorialPage: 0,
	    originalEditTexture: null,
	    tempPriority: 50,
	    originalOverridePriority: undefined,
	    isDragMode: false,
	    dragActive: false,
	    dragStartMouseX: 0,
	    dragStartMouseY: 0,
	    dragStartOffsetX: 0,
	    dragStartOffsetY: 0,
	    isScaleDragMode: false,
	    _lastTextureRefresh: 0,
	    _pendingTextureRefresh: false,
	    statusMessage: null,
	    statusMessageExpiry: 0,
	    _fieldsDirty: false,
	    poseEditing: null,
	    poseViewMode: false,
	    lastPoseKey: null,
	    poseSwitchMode: false,
	    previewPoseMapping: null,
	    poseSelectedList: [],
	    poseComboList: [],
	    poseComboIndex: 0,
	    _pointerDown: false,
	    _stepperListenerReady: false,
	};
	function resetDragState() {
	    state.isDragMode = false;
	    state.dragActive = false;
	    state.isScaleDragMode = false;
	    scaleDrag.active = false;
	    barDrag.fieldId = null;
	}
	function showStatus(text, color = "#4CAF50", durationMs = 5000) {
	    state.statusMessage = { text, color };
	    state.statusMessageExpiry = Date.now() + durationMs;
	}

	function updateHideArray(item) {
	    if (!item || !item.Property) return false;
	    const hide = [];
	    const currentGroup = item.Asset?.Group?.Name;
	    for (const cat of HIDE_CATEGORIES) {
	        if (item.Property[cat.key] === true) {
	            for (const g of cat.groups) {
	                if (cat.key === "HideItems" && g === currentGroup) continue;
	                hide.push(g);
	            }
	        }
	    }
	    const oldHide = item.Property.Hide || [];
	    const newHideStr = [...hide].sort().join(",");
	    const oldHideStr = [...oldHide].sort().join(",");
	    const needsRefresh = newHideStr !== oldHideStr;
	    if (hide.length > 0) {
	        item.Property.Hide = hide;
	    } else {
	        delete item.Property.Hide;
	    }
	    return needsRefresh;
	}

	const BEACON_CONTENT = "SCA-itemedit";
	const MISSING_TAG = `MISSING TEXT IN "Interface.csv": ${BEACON_CONTENT}`;
	function nameOf(mn, carried) {
	    try {
	        const chars = (typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter))
	            ? ChatRoomCharacter : [];
	        const C = chars.find(c => c?.MemberNumber === mn)
	            || (Player?.MemberNumber === mn ? Player : null);
	        if (C) {
	            const nn = typeof CharacterNickname === "function" ? CharacterNickname(C) : "";
	            return nn || C.Nickname || C.Name || carried || `#${mn}`;
	        }
	    } catch (_) {}
	    return `#${mn}`;
	}
	function buildText(srcName, tgtName, isSelf) {
	    if (isSelf) {
	        return L(`${srcName} 编辑了自己的自定义贴图`, `${srcName} edited their own custom texture`);
	    }
	    return L(`${srcName} 编辑了 ${tgtName} 的自定义贴图`, `${srcName} edited ${tgtName}'s custom texture`);
	}
	function sendItemEditBeacon(targetChar) {
	    try {
	        if (typeof ServerSend !== "function") return;
	        if (typeof ServerPlayerIsInChatRoom === "function" && !ServerPlayerIsInChatRoom()) return;
	        const srcMN = Player?.MemberNumber;
	        const tgtMN = targetChar?.MemberNumber;
	        if (typeof srcMN !== "number" || typeof tgtMN !== "number") return;
	        const srcName = nameOf(srcMN);
	        const tgtName = nameOf(tgtMN);
	        const fallback = buildText(srcName, tgtName, srcMN === tgtMN);
	        ServerSend("ChatRoomChat", {
	            Type: "Action",
	            Content: BEACON_CONTENT,
	            Dictionary: [
	                { Tag: MISSING_TAG, Text: fallback },
	                { Type: BEACON_CONTENT, Source: srcMN, Target: tgtMN },
	            ],
	        });
	    } catch (e) {
	        Logger.error("[ShuangAssets] 发送编辑动作信标失败", e);
	    }
	}
	function setupItemEditBeacon(HookManager) {
	    if (!HookManager || typeof HookManager.hookFunction !== "function") return;
	    if (typeof ChatRoomMessage !== "function") return;
	    HookManager.hookFunction("ChatRoomMessage", 0, (args, next) => {
	        try {
	            const data = args[0];
	            if (data?.Type === "Action" && data?.Content === BEACON_CONTENT && Array.isArray(data.Dictionary)) {
	                const payload = data.Dictionary.find(d => d?.Type === BEACON_CONTENT);
	                const missing = data.Dictionary.find(d => d?.Tag === MISSING_TAG);
	                if (payload && missing) {
	                    const srcName = nameOf(payload.Source);
	                    const tgtName = nameOf(payload.Target);
	                    missing.Text = buildText(srcName, tgtName, payload.Source === payload.Target);
	                }
	            }
	        } catch (e) { Logger.error("[ShuangAssets] 本地化编辑动作信标失败", e); }
	        return next(args);
	    });
	}

	const snapshotStore = new Map();
	const lastBroadcast = new Map();
	const BEACON_DEBOUNCE_MS = 3000;
	function itemKeyOf(item) {
	    const g = item?.Asset?.Group?.Name || "";
	    const n = item?.Asset?.Name || "";
	    return `${g}:${n}`;
	}
	function recordItemBaseline(item) {
	    if (!item) return;
	    snapshotStore.set(itemKeyOf(item), JSON.stringify(item.Property ?? {}));
	}
	function syncItemToServer(item) {
	    if (CurrentScreen === "Crafting") return;
	    const C = CharacterGetCurrent();
	    if (!C || typeof ChatRoomCharacterItemUpdate !== "function") return;
	    const key = itemKeyOf(item);
	    const snap = JSON.stringify(item.Property ?? {});
	    const prev = snapshotStore.get(key);
	    if (prev !== undefined && prev !== snap) {
	        const now = Date.now();
	        const last = lastBroadcast.get(key) || 0;
	        if (now - last >= BEACON_DEBOUNCE_MS) {
	            sendItemEditBeacon(C);
	            lastBroadcast.set(key, now);
	        }
	    }
	    snapshotStore.set(key, snap);
	    ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);
	    if (C.IsPlayer()) {
	        if (typeof ChatRoomCharacterUpdate === "function") {
	            ChatRoomCharacterUpdate(C);
	        }
	        if (typeof ServerPlayerAppearanceSync === "function") {
	            ServerPlayerAppearanceSync();
	        }
	    }
	    Logger.info(`[ShuangAssets] 已同步道具到服务器`);
	}

	function getEditTarget() {
	    if (state.poseEditing && state.tempTextureData?.PoseSettings?.[state.poseEditing]) {
	        return state.tempTextureData.PoseSettings[state.poseEditing];
	    }
	    return state.tempTextureData;
	}
	function refreshEditInputs() {
	    if (!getEditTarget()) return;
	    state._fieldsDirty = true;
	}
	function inheritGlobalFields() {
	    const g = state.tempTextureData;
	    return {
	        enabled: false,
	        TextureURL: g?.TextureURL || "",
	        OffsetX: g?.OffsetX ?? 1,
	        OffsetY: g?.OffsetY ?? 1,
	        ScaleX: g?.ScaleX ?? 100,
	        ScaleY: g?.ScaleY ?? 100,
	        ScaleLocked: g?.ScaleLocked !== false,
	        Rotation: g?.Rotation ?? 0,
	        Opacity: g?.Opacity ?? 100,
	        MirrorH: g?.MirrorH === true,
	        MirrorV: g?.MirrorV === true
	    };
	}
	function clearPreviewPose() {
	    const C = CharacterGetCurrent();
	    if (!C) return;
	    state.previewPoseMapping = null;
	    CharacterLoadCanvas(C);
	}
	function derivePoseEditing(poseKey) {
	    if (!state.poseViewMode) {
	        state.poseEditing = null;
	        return;
	    }
	    const ps = state.tempTextureData?.PoseSettings?.[poseKey];
	    state.poseEditing = (ps && ps.enabled === true) ? poseKey : null;
	}
	function switchPose(newPoseKey) {
	    if (!newPoseKey) {
	        state.poseEditing = null;
	        refreshEditInputs();
	        return;
	    }
	    if (state.poseViewMode) {
	        const parts = newPoseKey.split("+");
	        const poseName = parts[0] || newPoseKey;
	        setPreviewPose(poseName);
	    }
	    derivePoseEditing(newPoseKey);
	    refreshEditInputs();
	}
	function drawPoseBar() {
	    const C = CharacterGetCurrent();
	    const poseKey = getPoseKey(C?.DrawPose);
	    if (poseKey) {
	        DrawText(L("视角", "View"), POSE_EDIT_TOGGLE_X + POSE_EDIT_TOGGLE_W / 2, POSE_BAR_Y - 28, "White", "Black");
	        DrawButton(POSE_EDIT_TOGGLE_X, POSE_BAR_Y - POSE_TOGGLE_H / 2,
	            POSE_EDIT_TOGGLE_W, POSE_TOGGLE_H,
	            state.poseViewMode ? L("当前视角", "Pose View") : L("全局视角", "Global View"),
	            state.poseViewMode ? "#4CAF50" : "White", null,
	            L("切换视角：全局视角或当前姿势视角", "Switch view: global or current pose"), false);
	        DrawText(L("生效", "Active"), POSE_ACTIVE_TOGGLE_X + POSE_ACTIVE_TOGGLE_W / 2, POSE_BAR_Y - 28, "White", "Black");
	        const ps = state.tempTextureData?.PoseSettings?.[poseKey];
	        const isActive = ps?.enabled === true;
	        DrawButton(POSE_ACTIVE_TOGGLE_X, POSE_BAR_Y - POSE_TOGGLE_H / 2,
	            POSE_ACTIVE_TOGGLE_W, POSE_TOGGLE_H,
	            isActive ? L("独特", "Unique") : L("全局", "Global"),
	            isActive ? "#4CAF50" : "White", null,
	            L("切换当前姿势使用的配置来源", "Switch config source for current pose"), false);
	    }
	    DrawButton(POSE_SWITCH_X, POSE_BAR_Y - POSE_TOGGLE_H / 2,
	        POSE_SWITCH_W, POSE_TOGGLE_H,
	        L("批量配置", "Batch"), "White", null,
	        L("打开姿势选择页面，批量配置多个姿势", "Open pose selection page for batch configuration"), false);
	}
	function handlePoseBarClick() {
	    const C = CharacterGetCurrent();
	    const poseKey = getPoseKey(C?.DrawPose);
	    if (MouseIn(POSE_SWITCH_X, POSE_BAR_Y - POSE_TOGGLE_H / 2,
	            POSE_SWITCH_W, POSE_TOGGLE_H)) {
	        state.poseSwitchMode = "select";
	        return true;
	    }
	    if (poseKey) {
	        if (MouseIn(POSE_EDIT_TOGGLE_X, POSE_BAR_Y - POSE_TOGGLE_H / 2,
	                POSE_EDIT_TOGGLE_W, POSE_TOGGLE_H)) {
	            state.poseViewMode = !state.poseViewMode;
	            if (state.poseViewMode) {
	                const parts = poseKey.split("+");
	                setPreviewPose(parts[0] || poseKey);
	                derivePoseEditing(poseKey);
	            } else {
	                clearPreviewPose();
	                state.poseEditing = null;
	            }
	            refreshEditInputs();
	            return true;
	        }
	        if (MouseIn(POSE_ACTIVE_TOGGLE_X, POSE_BAR_Y - POSE_TOGGLE_H / 2,
	                POSE_ACTIVE_TOGGLE_W, POSE_TOGGLE_H)) {
	            if (!state.tempTextureData) return true;
	            if (!state.tempTextureData.PoseSettings) {
	                state.tempTextureData.PoseSettings = {};
	            }
	            let ps = state.tempTextureData.PoseSettings[poseKey];
	            if (!ps) {
	                ps = inheritGlobalFields();
	                ps.enabled = true;
	                state.tempTextureData.PoseSettings[poseKey] = ps;
	            } else {
	                ps.enabled = !(ps.enabled === true);
	            }
	            if (state.poseViewMode) {
	                derivePoseEditing(poseKey);
	            }
	            state._fieldsDirty = true;
	            return true;
	        }
	    }
	    return false;
	}
	function drawPoseSwitchPage() {
	    const C = CharacterGetCurrent();
	    if (!C) return;
	    DrawText(L("切换姿势", "Switch Pose"), 1500, 360, "White", "Gray");
	    DrawText(L("选择要批量配置的姿势", "Select poses for batch configuration"),
	        1505, 405, "Yellow", "Black");
	    let rowY = POSE_PAGE_START_Y;
	    for (const [catKey, cat] of Object.entries(POSE_CATEGORIES)) {
	        const categoryFirstRowY = rowY;
	        DrawText(L(cat.label, cat.labelEn), POSE_PAGE_LABEL_X,
	            categoryFirstRowY + POSE_PAGE_LABEL_Y_OFFSET, "White", "Gray");
	        for (let i = 0; i < cat.poses.length; i++) {
	            const poseName = cat.poses[i];
	            const col = i % POSE_PAGE_COLS;
	            const row = Math.floor(i / POSE_PAGE_COLS);
	            const btnX = POSE_PAGE_START_X + col * (POSE_PAGE_BTN_W + POSE_PAGE_BTN_GAP);
	            const btnY = categoryFirstRowY + row * POSE_PAGE_ROW_STEP;
	            const isSelected = state.poseSelectedList.includes(poseName);
	            const label = POSE_LABELS[poseName];
	            const btnText = label ? L(label.cn, label.en) : poseName;
	            const bgColor = isSelected ? "#FF9800" : "White";
	            DrawButton(btnX, btnY, POSE_PAGE_BTN_W, POSE_PAGE_BTN_H,
	                btnText, bgColor, null, null, false);
	        }
	        const rowCount = Math.ceil(cat.poses.length / POSE_PAGE_COLS);
	        rowY = categoryFirstRowY + rowCount * POSE_PAGE_ROW_STEP + POSE_PAGE_CATEGORY_GAP;
	    }
	    const upperPoses = POSE_CATEGORIES.BodyUpper.poses;
	    const lowerPoses = POSE_CATEGORIES.BodyLower.poses;
	    const hasUpper = state.poseSelectedList.some(p => upperPoses.includes(p));
	    const hasLower = state.poseSelectedList.some(p => lowerPoses.includes(p));
	    const hasFull = state.poseSelectedList.some(p => POSE_CATEGORIES.BodyFull.poses.includes(p));
	    const canEnter = (hasUpper && hasLower) || hasFull;
	    DrawButton(POSE_SPECIAL_BTN_X, POSE_PAGE_BOTTOM_Y, POSE_SPECIAL_BTN_W, POSE_PAGE_BTN_H,
	        L("编辑选中姿势", "Edit Selected"), canEnter ? "White" : "Gray", null,
	        L("为选中的姿势组合设置统一配置（需同时选上身和下身姿势）", "Set unified config for selected pose combinations (requires both upper and lower poses)"), false);
	    DrawButton(POSE_CONFIRM_BTN_X, POSE_PAGE_BOTTOM_Y, POSE_CONFIRM_BTN_W, POSE_PAGE_BTN_H,
	        L("确认", "Confirm"), "White", null,
	        L("返回编辑面板", "Back to edit panel"), false);
	}
	function handlePoseSwitchClick() {
	    const C = CharacterGetCurrent();
	    if (!C) return false;
	    if (MouseIn(POSE_SPECIAL_BTN_X, POSE_PAGE_BOTTOM_Y, POSE_SPECIAL_BTN_W, POSE_PAGE_BTN_H)) {
	        const upperPoses = POSE_CATEGORIES.BodyUpper.poses;
	        const lowerPoses = POSE_CATEGORIES.BodyLower.poses;
	        const hasUpper = state.poseSelectedList.some(p => upperPoses.includes(p));
	        const hasLower = state.poseSelectedList.some(p => lowerPoses.includes(p));
	        const hasFull = state.poseSelectedList.some(p => POSE_CATEGORIES.BodyFull.poses.includes(p));
	        if ((hasUpper && hasLower) || hasFull) {
	            enterSpecialConfig();
	        } else {
	            showStatus(
	                L("需要同时选择上身和下身姿势", "Need to select both upper and lower poses"),
	                "#FF6B6B", 3000
	            );
	        }
	        return true;
	    }
	    if (MouseIn(POSE_CONFIRM_BTN_X, POSE_PAGE_BOTTOM_Y, POSE_CONFIRM_BTN_W, POSE_PAGE_BTN_H)) {
	        state.poseSwitchMode = false;
	        state.poseSelectedList = [];
	        return true;
	    }
	    let rowY = POSE_PAGE_START_Y;
	    for (const [catKey, cat] of Object.entries(POSE_CATEGORIES)) {
	        const categoryFirstRowY = rowY;
	        for (let i = 0; i < cat.poses.length; i++) {
	            const poseName = cat.poses[i];
	            const col = i % POSE_PAGE_COLS;
	            const row = Math.floor(i / POSE_PAGE_COLS);
	            const btnX = POSE_PAGE_START_X + col * (POSE_PAGE_BTN_W + POSE_PAGE_BTN_GAP);
	            const btnY = categoryFirstRowY + row * POSE_PAGE_ROW_STEP;
	            if (MouseIn(btnX, btnY, POSE_PAGE_BTN_W, POSE_PAGE_BTN_H)) {
	                const idx = state.poseSelectedList.indexOf(poseName);
	                if (idx >= 0) {
	                    state.poseSelectedList.splice(idx, 1);
	                } else {
	                    state.poseSelectedList.push(poseName);
	                }
	                return true;
	            }
	        }
	        const rowCount = Math.ceil(cat.poses.length / POSE_PAGE_COLS);
	        rowY = categoryFirstRowY + rowCount * POSE_PAGE_ROW_STEP + POSE_PAGE_CATEGORY_GAP;
	    }
	    return false;
	}
	function enterSpecialConfig() {
	    const upperPoses = POSE_CATEGORIES.BodyUpper.poses;
	    const lowerPoses = POSE_CATEGORIES.BodyLower.poses;
	    const fullPoses = POSE_CATEGORIES.BodyFull.poses;
	    const selectedUpper = state.poseSelectedList.filter(p => upperPoses.includes(p));
	    const selectedLower = state.poseSelectedList.filter(p => lowerPoses.includes(p));
	    const selectedFull = state.poseSelectedList.filter(p => fullPoses.includes(p));
	    const combos = [];
	    for (const up of selectedUpper) {
	        for (const lo of selectedLower) {
	            combos.push(`${up}+${lo}`);
	        }
	    }
	    for (const fp of selectedFull) {
	        combos.push(fp);
	    }
	    state.poseComboList = combos;
	    state.poseComboIndex = 0;
	    state.poseSwitchMode = "special";
	    if (!state.tempTextureData.PoseSettings) {
	        state.tempTextureData.PoseSettings = {};
	    }
	    for (const comboKey of combos) {
	        if (!state.tempTextureData.PoseSettings[comboKey]) {
	            const cfg = inheritGlobalFields();
	            cfg.enabled = true;
	            state.tempTextureData.PoseSettings[comboKey] = cfg;
	        } else {
	            state.tempTextureData.PoseSettings[comboKey].enabled = true;
	        }
	    }
	    state.poseEditing = combos[0];
	    setPreviewPoseCombo(combos[0]);
	    createComboDropdown();
	    refreshEditInputs();
	}
	function setPreviewPoseCombo(poseKey) {
	    const poseNames = poseKey.split("+");
	    for (const name of poseNames) {
	        setPreviewPose(name);
	    }
	}
	function createComboDropdown() {
	    let sel = document.getElementById(POSE_COMBO_DROPDOWN_ID);
	    if (!sel) {
	        sel = document.createElement("select");
	        sel.id = POSE_COMBO_DROPDOWN_ID;
	        sel.style.position = "fixed";
	        sel.style.zIndex = "100";
	        sel.style.fontSize = "14px";
	        sel.addEventListener("change", () => {
	            const idx = parseInt(sel.value, 10);
	            if (Number.isFinite(idx) && idx >= 0 && idx < state.poseComboList.length) {
	                state.poseComboIndex = idx;
	                state.poseEditing = state.poseComboList[idx];
	                setPreviewPoseCombo(state.poseEditing);
	                refreshEditInputs();
	            }
	        });
	        document.body.appendChild(sel);
	    }
	    sel.innerHTML = "";
	    for (let i = 0; i < state.poseComboList.length; i++) {
	        const comboKey = state.poseComboList[i];
	        const labels = comboKey.split("+").map(p => {
	            const label = POSE_LABELS[p];
	            return label ? L(label.cn, label.en) : p;
	        });
	        const opt = document.createElement("option");
	        opt.value = String(i);
	        opt.textContent = `(${i + 1}/${state.poseComboList.length}) ${labels.join(" + ")}`;
	        sel.appendChild(opt);
	    }
	    sel.value = String(state.poseComboIndex);
	    positionComboDropdown();
	}
	function positionComboDropdown() {
	    const sel = document.getElementById(POSE_COMBO_DROPDOWN_ID);
	    if (!sel) return;
	    sel.value = String(state.poseComboIndex);
	    const canvas = MainCanvas?.canvas;
	    if (!canvas) return;
	    const rect = canvas.getBoundingClientRect();
	    const scaleX = rect.width / (MainCanvas?.width || 2000);
	    const scaleY = rect.height / (MainCanvas?.height || 1000);
	    sel.style.left = `${rect.left + POSE_COMBO_DROPDOWN_X * scaleX}px`;
	    sel.style.top = `${rect.top + POSE_COMBO_DROPDOWN_Y * scaleY}px`;
	    sel.style.width = `${POSE_COMBO_DROPDOWN_W * scaleX}px`;
	    sel.style.height = `${POSE_COMBO_DROPDOWN_H * scaleY}px`;
	    sel.style.display = state.poseSwitchMode === "special" ? "block" : "none";
	}
	function removeComboDropdown() {
	    const sel = document.getElementById(POSE_COMBO_DROPDOWN_ID);
	    if (sel) sel.remove();
	}
	function drawComboSelector() {
	    DrawButton(POSE_COMBO_LEFT_X, POSE_COMBO_NAME_Y - POSE_TOGGLE_H / 2,
	        POSE_COMBO_BTN_W, POSE_TOGGLE_H,
	        "\u25C0", "White", null, L("上一个组合", "Previous combo"), false);
	    DrawButton(POSE_COMBO_RIGHT_X, POSE_COMBO_NAME_Y - POSE_TOGGLE_H / 2,
	        POSE_COMBO_BTN_W, POSE_TOGGLE_H,
	        "\u25B6", "White", null, L("下一个组合", "Next combo"), false);
	    positionComboDropdown();
	    DrawButton(POSE_COMBO_SAVE_X, POSE_COMBO_SAVE_Y - POSE_TOGGLE_H / 2,
	        POSE_CONFIRM_BTN_W, POSE_TOGGLE_H,
	        L("保存并返回", "Save & Back"), "White", null,
	        L("保存配置并返回姿势选择页面", "Save config and return to pose selection"), false);
	}
	function handlePoseSpecialConfigClick(item, textureIndex, data) {
	    if (MouseIn(POSE_COMBO_LEFT_X, POSE_COMBO_NAME_Y - POSE_TOGGLE_H / 2,
	            POSE_COMBO_BTN_W, POSE_TOGGLE_H)) {
	        state.poseComboIndex = (state.poseComboIndex - 1 + state.poseComboList.length) % state.poseComboList.length;
	        state.poseEditing = state.poseComboList[state.poseComboIndex];
	        setPreviewPoseCombo(state.poseEditing);
	        refreshEditInputs();
	        return true;
	    }
	    if (MouseIn(POSE_COMBO_RIGHT_X, POSE_COMBO_NAME_Y - POSE_TOGGLE_H / 2,
	            POSE_COMBO_BTN_W, POSE_TOGGLE_H)) {
	        state.poseComboIndex = (state.poseComboIndex + 1) % state.poseComboList.length;
	        state.poseEditing = state.poseComboList[state.poseComboIndex];
	        setPreviewPoseCombo(state.poseEditing);
	        refreshEditInputs();
	        return true;
	    }
	    if (MouseIn(POSE_COMBO_SAVE_X, POSE_COMBO_SAVE_Y - POSE_TOGGLE_H / 2,
	            POSE_CONFIRM_BTN_W, POSE_TOGGLE_H)) {
	        for (const comboKey of state.poseComboList) {
	            if (state.tempTextureData?.PoseSettings?.[comboKey]) {
	                state.tempTextureData.PoseSettings[comboKey].enabled = true;
	            }
	        }
	        removeComboDropdown();
	        state.poseSwitchMode = "select";
	        state.poseEditing = null;
	        refreshEditInputs();
	        return true;
	    }
	    return false;
	}
	function setupStepperListeners() {
	    if (state._stepperListenerReady) return;
	    state._stepperListenerReady = true;
	    document.addEventListener("mousedown", () => {
	        state._pointerDown = true;
	        tryStartBarDrag();
	    });
	    document.addEventListener("mouseup", () => {
	        state._pointerDown = false;
	        stepperPress.fieldId = null;
	        state._lastTextureRefresh = 0;
	    });
	    document.addEventListener("touchstart", () => {
	        state._pointerDown = true;
	        tryStartBarDrag();
	    }, { passive: true });
	    document.addEventListener("touchend", () => {
	        state._pointerDown = false;
	        stepperPress.fieldId = null;
	        state._lastTextureRefresh = 0;
	    });
	    document.addEventListener("touchcancel", () => {
	        state._pointerDown = false;
	        stepperPress.fieldId = null;
	        state._lastTextureRefresh = 0;
	    });
	}
	function tryStartBarDrag() {
	    if (state.currentEditTexture < 0 || state.poseSwitchMode === "select") return;
	    for (const field of BAR_FIELDS) {
	        const barTop = field.y + STEPPER_INPUT_H / 2 - BAR_HANDLE_SIZE / 2;
	        if (MouseIn(BAR_TRACK_X - BAR_HANDLE_SIZE / 2, barTop, BAR_TRACK_W + BAR_HANDLE_SIZE, BAR_HANDLE_SIZE)) {
	            setFieldValue(field, barValueFromMouseX(field, MouseX));
	            barDrag.fieldId = field.id;
	            return;
	        }
	    }
	}
	function getFieldValue(field) {
	    if (field.prop === null) return state.tempPriority;
	    const target = getEditTarget();
	    const v = target ? target[field.prop] : undefined;
	    return typeof v === "number" && !isNaN(v) ? v : field.def;
	}
	function setFieldValue(field, value) {
	    if (isNaN(value)) value = field.def;
	    if (field.min !== null) value = Math.max(field.min, value);
	    if (field.max !== null) value = Math.min(field.max, value);
	    if (field.prop === null) {
	        if (state.tempPriority !== value) {
	            state.tempPriority = value;
	            state._fieldsDirty = true;
	        }
	    } else {
	        const target = getEditTarget();
	        if (target) {
	            if (target[field.prop] !== value) {
	                target[field.prop] = value;
	                state._fieldsDirty = true;
	            }
	            if (target.ScaleLocked !== false) {
	                if (field.prop === "ScaleX" && target.ScaleY !== value) {
	                    target.ScaleY = value;
	                    state._fieldsDirty = true;
	                } else if (field.prop === "ScaleY" && target.ScaleX !== value) {
	                    target.ScaleX = value;
	                    state._fieldsDirty = true;
	                }
	            }
	        }
	    }
	}
	function applyStepperChange(field, delta) {
	    setFieldValue(field, getFieldValue(field) + delta);
	}
	function createEditPanelDomInputs() {
	    if (state._editInputsReady) return;
	    state._editInputsReady = true;
	    const urlInput = ElementCreateInput(FIELD_URL, "text", "", "https://");
	    urlInput.addEventListener("input", () => {
	        const target = getEditTarget();
	        if (!target) return;
	        target.TextureURL = urlInput.value.trim();
	        state._fieldsDirty = true;
	    });
	    for (const field of [...STEPPER_FIELDS, ...BAR_FIELDS]) {
	        const input = ElementCreateInput(field.id, "number", String(field.def), "");
	        if (field.min !== null) input.min = String(field.min);
	        if (field.max !== null) input.max = String(field.max);
	        input.step = "1";
	        hideNumberInputSpinner(input);
	        input.addEventListener("input", () => {
	            const parsed = parseInt(input.value, 10);
	            if (!Number.isFinite(parsed)) return;
	            setFieldValue(field, parsed);
	        });
	        input.addEventListener("change", () => {
	            input.value = String(getFieldValue(field));
	        });
	    }
	}
	function positionEditPanelInputs() {
	    const showing = state.currentEditTexture >= 0 && state.poseSwitchMode !== "select";
	    const urlInput = document.getElementById(FIELD_URL);
	    if (urlInput) {
	        if (showing) {
	            ElementPosition(FIELD_URL, URL_BOX_X + URL_BOX_W / 2, URL_BOX_Y + URL_BOX_H / 2, URL_BOX_W, URL_BOX_H);
	            if (document.activeElement !== urlInput) {
	                const val = getEditTarget()?.TextureURL || "";
	                if (urlInput.value !== val) urlInput.value = val;
	            }
	        } else {
	            ElementPosition(FIELD_URL, -999, -999, 0, 0);
	        }
	    }
	    for (const field of [...STEPPER_FIELDS, ...BAR_FIELDS]) {
	        const input = document.getElementById(field.id);
	        if (!input) continue;
	        if (showing) {
	            ElementPosition(field.id, STEPPER_INPUT_X + STEPPER_INPUT_W / 2, field.y + STEPPER_INPUT_H / 2,
	                STEPPER_INPUT_W, STEPPER_INPUT_H);
	            if (document.activeElement !== input) {
	                const val = String(getFieldValue(field));
	                if (input.value !== val) input.value = val;
	            }
	        } else {
	            ElementPosition(field.id, -999, -999, 0, 0);
	        }
	    }
	    positionComboDropdown();
	}
	function removeEditPanelInputs() {
	    if (!state._editInputsReady) return;
	    state._editInputsReady = false;
	    const ids = [FIELD_URL, ...STEPPER_FIELDS.map(f => f.id), ...BAR_FIELDS.map(f => f.id)];
	    for (const id of ids) {
	        const el = document.getElementById(id);
	        if (el) el.remove();
	    }
	    removeComboDropdown();
	}
	function drawBarField(field) {
	    const value = getFieldValue(field);
	    const ratio = (value - field.min) / (field.max - field.min);
	    const trackY = field.y + STEPPER_INPUT_H / 2 - BAR_TRACK_H / 2;
	    MainCanvas.fillStyle = "#999999";
	    MainCanvas.fillRect(BAR_TRACK_X, trackY, BAR_TRACK_W, BAR_TRACK_H);
	    if (field.min < 0 && field.max > 0) {
	        const zeroRatio = (0 - field.min) / (field.max - field.min);
	        const zeroX = BAR_TRACK_X + zeroRatio * BAR_TRACK_W;
	        MainCanvas.fillStyle = "#000000";
	        MainCanvas.fillRect(zeroX - 1, trackY - 4, 2, BAR_TRACK_H + 8);
	    }
	    const handleX = BAR_TRACK_X + ratio * BAR_TRACK_W - BAR_HANDLE_SIZE / 2;
	    const handleY = field.y + STEPPER_INPUT_H / 2 - BAR_HANDLE_SIZE / 2;
	    MainCanvas.fillStyle = barDrag.fieldId === field.id ? "#4CAF50" : "#FFFFFF";
	    MainCanvas.fillRect(handleX, handleY, BAR_HANDLE_SIZE, BAR_HANDLE_SIZE);
	    MainCanvas.strokeStyle = "#000000";
	    MainCanvas.lineWidth = 2;
	    MainCanvas.strokeRect(handleX, handleY, BAR_HANDLE_SIZE, BAR_HANDLE_SIZE);
	}
	function barValueFromMouseX(field, mouseX) {
	    const ratio = Math.max(0, Math.min(1, (mouseX - BAR_TRACK_X) / BAR_TRACK_W));
	    return Math.round(field.min + ratio * (field.max - field.min));
	}
	function handleBarFieldClick(field) {
	    const barTop = field.y + STEPPER_INPUT_H / 2 - BAR_HANDLE_SIZE / 2;
	    if (MouseIn(BAR_TRACK_X - BAR_HANDLE_SIZE / 2, barTop, BAR_TRACK_W + BAR_HANDLE_SIZE, BAR_HANDLE_SIZE)) {
	        setFieldValue(field, barValueFromMouseX(field, MouseX));
	        barDrag.fieldId = field.id;
	        return true;
	    }
	    return false;
	}
	function updateBarDrag() {
	    if (!barDrag.fieldId) return;
	    if (!state._pointerDown) {
	        barDrag.fieldId = null;
	        return;
	    }
	    const field = BAR_FIELDS.find(f => f.id === barDrag.fieldId);
	    if (!field) {
	        barDrag.fieldId = null;
	        return;
	    }
	    setFieldValue(field, barValueFromMouseX(field, MouseX));
	}
	function drawScaleDragButton() {
	    DrawButton(SCALE_DRAG_BTN_X, SCALE_DRAG_BTN_Y, SCALE_DRAG_BTN_W, SCALE_DRAG_BTN_H,
	        L("拖移", "Drag"), state.isScaleDragMode ? "#4CAF50" : "White", null, null, false);
	    if (MouseIn(SCALE_DRAG_BTN_X, SCALE_DRAG_BTN_Y, SCALE_DRAG_BTN_W, SCALE_DRAG_BTN_H)) {
	        const hintX = 1820;
	        const hintY = SCALE_DRAG_BTN_Y + SCALE_DRAG_BTN_H / 2;
	        const lines = isChineseLang()
	            ? ["开启后可在左侧", "预览区域拖动", "缩放图片"]
	            : ["When enabled,", "drag on the preview", "to resize the image"];
	        for (let i = 0; i < lines.length; i++) {
	            DrawText(lines[i], hintX, hintY - 22 + i * 30, "Yellow", "Black");
	        }
	    }
	}
	function handleScaleDragButtonClick() {
	    if (!MouseIn(SCALE_DRAG_BTN_X, SCALE_DRAG_BTN_Y, SCALE_DRAG_BTN_W, SCALE_DRAG_BTN_H)) return false;
	    state.isScaleDragMode = !state.isScaleDragMode;
	    scaleDrag.active = false;
	    if (state.isScaleDragMode) {
	        state.isDragMode = false;
	        state.dragActive = false;
	    }
	    return true;
	}
	function updateScaleDrag() {
	    if (!state.isScaleDragMode) {
	        scaleDrag.active = false;
	        return;
	    }
	    const target = getEditTarget();
	    if (!target) {
	        scaleDrag.active = false;
	        return;
	    }
	    const inPreviewArea = MouseX >= 0 && MouseX <= 1000 && MouseY >= 0 && MouseY <= 1000;
	    if (!state._pointerDown || !inPreviewArea) {
	        scaleDrag.active = false;
	        return;
	    }
	    if (!scaleDrag.active) {
	        scaleDrag.active = true;
	        scaleDrag.startMouseX = MouseX;
	        scaleDrag.startMouseY = MouseY;
	        const sx = Number(target.ScaleX);
	        const sy = Number(target.ScaleY);
	        scaleDrag.startScaleX = Number.isFinite(sx) ? sx : 100;
	        scaleDrag.startScaleY = Number.isFinite(sy) ? sy : 100;
	        return;
	    }
	    const deltaX = (MouseX - scaleDrag.startMouseX) * SCALE_DRAG_SENSITIVITY;
	    const deltaY = (MouseY - scaleDrag.startMouseY) * SCALE_DRAG_SENSITIVITY;
	    let newScaleX, newScaleY;
	    if (target.ScaleLocked !== false) {
	        newScaleX = newScaleY = Math.round(scaleDrag.startScaleX + deltaX);
	    } else {
	        newScaleX = Math.round(scaleDrag.startScaleX + deltaX);
	        newScaleY = Math.round(scaleDrag.startScaleY + deltaY);
	    }
	    if (target.ScaleX !== newScaleX || target.ScaleY !== newScaleY) {
	        target.ScaleX = newScaleX;
	        target.ScaleY = newScaleY;
	        state._fieldsDirty = true;
	    }
	}
	function drawAspectLockButton() {
	    const target = getEditTarget();
	    const locked = target?.ScaleLocked !== false;
	    DrawButton(ASPECT_LOCK_BTN_X, ASPECT_LOCK_BTN_Y, ASPECT_LOCK_BTN_W, ASPECT_LOCK_BTN_H,
	        L("等比", "Lock"), locked ? "#4CAF50" : "White", null, null, false);
	    if (MouseIn(ASPECT_LOCK_BTN_X, ASPECT_LOCK_BTN_Y, ASPECT_LOCK_BTN_W, ASPECT_LOCK_BTN_H)) {
	        const hintX = 1820;
	        const hintY = ASPECT_LOCK_BTN_Y + ASPECT_LOCK_BTN_H / 2;
	        const lines = isChineseLang()
	            ? ["锁定缩放X/Y", "比例始终一致"]
	            : ["Lock the X/Y", "scale ratio together"];
	        for (let i = 0; i < lines.length; i++) {
	            DrawText(lines[i], hintX, hintY - 15 + i * 30, "Yellow", "Black");
	        }
	    }
	}
	function handleAspectLockButtonClick() {
	    if (!MouseIn(ASPECT_LOCK_BTN_X, ASPECT_LOCK_BTN_Y, ASPECT_LOCK_BTN_W, ASPECT_LOCK_BTN_H)) return false;
	    const target = getEditTarget();
	    if (!target) return true;
	    const newLocked = !(target.ScaleLocked !== false);
	    target.ScaleLocked = newLocked;
	    if (newLocked && target.ScaleX !== target.ScaleY) {
	        target.ScaleY = target.ScaleX;
	        state._fieldsDirty = true;
	    }
	    return true;
	}
	function drawMirrorRow() {
	    DrawText(L("镜像", "Mirror"), 1100, MIRROR_ROW_LABEL_Y, "White", "Gray");
	    const target = getEditTarget();
	    const mirrorH = target?.MirrorH === true;
	    const mirrorV = target?.MirrorV === true;
	    DrawButton(MIRROR_H_BTN_X, MIRROR_ROW_Y, MIRROR_BTN_W, MIRROR_BTN_H,
	        L("水平", "H-Flip"), mirrorH ? "#4CAF50" : "White", null,
	        L("水平镜像翻转图片", "Flip the image horizontally"), false);
	    DrawButton(MIRROR_V_BTN_X, MIRROR_ROW_Y, MIRROR_BTN_W, MIRROR_BTN_H,
	        L("垂直", "V-Flip"), mirrorV ? "#4CAF50" : "White", null,
	        L("垂直镜像翻转图片", "Flip the image vertically"), false);
	}
	function handleMirrorRowClick() {
	    const target = getEditTarget();
	    if (!target) return false;
	    if (MouseIn(MIRROR_H_BTN_X, MIRROR_ROW_Y, MIRROR_BTN_W, MIRROR_BTN_H)) {
	        target.MirrorH = !(target.MirrorH === true);
	        state._fieldsDirty = true;
	        return true;
	    }
	    if (MouseIn(MIRROR_V_BTN_X, MIRROR_ROW_Y, MIRROR_BTN_W, MIRROR_BTN_H)) {
	        target.MirrorV = !(target.MirrorV === true);
	        state._fieldsDirty = true;
	        return true;
	    }
	    return false;
	}
	function drawMoveButton() {
	    DrawButton(MOVE_BTN_X, MOVE_BTN_Y, MOVE_BTN_W, MOVE_BTN_H,
	        L("移动", "Move"), state.isDragMode ? "#4CAF50" : "White", null, null, false);
	    if (MouseIn(MOVE_BTN_X, MOVE_BTN_Y, MOVE_BTN_W, MOVE_BTN_H)) {
	        const hintX = 1770;
	        const hintY = MOVE_BTN_Y + MOVE_BTN_H / 2;
	        const lines = isChineseLang()
	            ? ["开启后可在左侧", "角色预览区域", "按住鼠标", "拖动图片"]
	            : ["When enabled,", "drag on the", "character preview", "to move the image"];
	        for (let i = 0; i < lines.length; i++) {
	            DrawText(lines[i], hintX, hintY - 22 + i * 30, "Yellow", "Black");
	        }
	    }
	}
	function handleMoveButtonClick() {
	    if (!MouseIn(MOVE_BTN_X, MOVE_BTN_Y, MOVE_BTN_W, MOVE_BTN_H)) return false;
	    state.isDragMode = !state.isDragMode;
	    state.dragActive = false;
	    if (state.isDragMode) {
	        state.isScaleDragMode = false;
	        scaleDrag.active = false;
	    }
	    return true;
	}
	function updateDragMove() {
	    if (!state.isDragMode) {
	        state.dragActive = false;
	        return;
	    }
	    const target = getEditTarget();
	    if (!target) {
	        state.dragActive = false;
	        return;
	    }
	    const inPreviewArea = MouseX >= 0 && MouseX <= 1000 && MouseY >= 0 && MouseY <= 1000;
	    if (!state._pointerDown || !inPreviewArea) {
	        state.dragActive = false;
	        return;
	    }
	    if (!state.dragActive) {
	        state.dragActive = true;
	        state.dragStartMouseX = MouseX;
	        state.dragStartMouseY = MouseY;
	        state.dragStartOffsetX = parseInt(target.OffsetX) || 0;
	        state.dragStartOffsetY = parseInt(target.OffsetY) || 0;
	        return;
	    }
	    const newOffsetX = Math.round(state.dragStartOffsetX + (MouseX - state.dragStartMouseX));
	    const newOffsetY = Math.round(state.dragStartOffsetY + (MouseY - state.dragStartMouseY));
	    if (target.OffsetX !== newOffsetX || target.OffsetY !== newOffsetY) {
	        target.OffsetX = newOffsetX;
	        target.OffsetY = newOffsetY;
	        state._fieldsDirty = true;
	    }
	}
	function updateSteppers() {
	    if (!state._pointerDown) {
	        stepperPress.fieldId = null;
	        return;
	    }
	    let activeField = null;
	    let activeDirection = 0;
	    for (const field of [...STEPPER_FIELDS, ...BAR_FIELDS]) {
	        if (MouseIn(STEPPER_MINUS_X, field.y, STEPPER_BTN_W, STEPPER_BTN_H)) {
	            activeField = field;
	            activeDirection = -1;
	            break;
	        }
	        if (MouseIn(STEPPER_PLUS_X, field.y, STEPPER_BTN_W, STEPPER_BTN_H)) {
	            activeField = field;
	            activeDirection = 1;
	            break;
	        }
	    }
	    if (!activeField) {
	        stepperPress.fieldId = null;
	        return;
	    }
	    const now = Date.now();
	    if (stepperPress.fieldId !== activeField.id || stepperPress.direction !== activeDirection) {
	        stepperPress.fieldId = activeField.id;
	        stepperPress.direction = activeDirection;
	        stepperPress.startTime = now;
	        stepperPress.lastUpdate = now;
	        applyStepperChange(activeField, activeDirection);
	        return;
	    }
	    const elapsed = now - stepperPress.startTime;
	    const interval = Math.max(40, 150 - elapsed * 0.035);
	    const stepMultiplier = Math.min(50, 1 + Math.floor(elapsed / 300));
	    if (now - stepperPress.lastUpdate >= interval) {
	        applyStepperChange(activeField, activeDirection * stepMultiplier);
	        stepperPress.lastUpdate = now;
	    }
	}
	function drawStepperButton(x, y, icon) {
	    DrawButton(x, y, STEPPER_BTN_W, STEPPER_BTN_H, "", "White", null, null);
	    DrawImageResize(icon, x + 2, y + 2, STEPPER_BTN_W - 4, STEPPER_BTN_H - 4);
	}
	const POSE_HOOK_NAME = "SCA_PosePreview";
	function registerPoseHook() {
	    const C = CharacterGetCurrent();
	    if (!C) return;
	    state.previewPoseMapping = null;
	    C.RegisterHook("BeforeSortLayers", POSE_HOOK_NAME, () => {
	        if (state.previewPoseMapping) {
	            C.DrawPoseMapping = { ...state.previewPoseMapping };
	        }
	    });
	}
	function unregisterPoseHook() {
	    const C = CharacterGetCurrent();
	    if (!C) return;
	    C.UnregisterHook("BeforeSortLayers", POSE_HOOK_NAME);
	    state.previewPoseMapping = null;
	    CharacterLoadCanvas(C);
	}
	function setPreviewPose(poseName) {
	    const C = CharacterGetCurrent();
	    if (!C) return;
	    const newPose = PoseRecord[poseName];
	    if (!newPose) return;
	    if (newPose.Category === "BodyFull") {
	        state.previewPoseMapping = { [newPose.Category]: newPose.Name };
	    } else {
	        const current = state.previewPoseMapping || C.ActivePoseMapping || {};
	        const baseMapping = { ...current };
	        for (const [category, name] of Object.entries(baseMapping)) {
	            const pose = PoseRecord[name];
	            if (!pose || !pose.AllowMenu || pose.Category === "BodyFull") {
	                delete baseMapping[category];
	            }
	        }
	        if (!baseMapping.BodyUpper) baseMapping.BodyUpper = "BaseUpper";
	        if (!baseMapping.BodyLower) baseMapping.BodyLower = "BaseLower";
	        baseMapping[newPose.Category] = newPose.Name;
	        state.previewPoseMapping = baseMapping;
	    }
	    CharacterLoadCanvas(C);
	}
	function createEditInputs(texture) {
	    state._fieldsDirty = false;
	    state.poseEditing = null;
	    state.poseViewMode = true;
	    state.lastPoseKey = null;
	    state.poseSwitchMode = false;
	    state.poseSelectedList = [];
	    state.poseComboList = [];
	    state.poseComboIndex = 0;
	    registerPoseHook();
	    const item = DialogFocusItem;
	    const layerName = LAYER_NAMES[state.currentEditTexture];
	    const op = item?.Property?.OverridePriority;
	    let priorityValue = 50;
	    if (typeof op === "number") {
	        priorityValue = op;
	    } else if (op && typeof op[layerName] === "number") {
	        priorityValue = op[layerName];
	    }
	    state.tempPriority = priorityValue;
	    state.originalOverridePriority = op ? JSON.parse(JSON.stringify(op)) : undefined;
	}
	function drawTextureEditPanel(item, textureIndex, data) {
	    if (state.poseSwitchMode === "select") {
	        drawPoseSwitchPage();
	        return;
	    }
	    setupStepperListeners();
	    updateSteppers();
	    updateDragMove();
	    updateBarDrag();
	    updateScaleDrag();
	    if (!state.poseSwitchMode) {
	        const C = CharacterGetCurrent();
	        const currentPoseKey = getPoseKey(C?.DrawPose);
	        if (state.lastPoseKey !== currentPoseKey) {
	            state.lastPoseKey = currentPoseKey;
	            switchPose(currentPoseKey);
	        }
	    }
	    if (state.tempTextureData) {
	        if (state._fieldsDirty) {
	            state._fieldsDirty = false;
	            if (!item.Property) item.Property = { Textures: [] };
	            if (!item.Property.Textures) item.Property.Textures = [];
	            const previousUrl = item.Property.Textures[textureIndex]?.TextureURL || "";
	            const newUrl = state.tempTextureData.TextureURL || "";
	            const urlChanged = previousUrl !== newUrl;
	            const renderData = JSON.parse(JSON.stringify(state.tempTextureData));
	            if (!state.poseViewMode && renderData.PoseSettings) {
	                for (const key of Object.keys(renderData.PoseSettings)) {
	                    renderData.PoseSettings[key].enabled = false;
	                }
	            }
	            item.Property.Textures[textureIndex] = renderData;
	            const layerName = LAYER_NAMES[textureIndex];
	            if (typeof item.Property.OverridePriority !== "object" || item.Property.OverridePriority === null) {
	                item.Property.OverridePriority = {};
	            }
	            item.Property.OverridePriority[layerName] = state.tempPriority;
	            state._pendingTextureRefresh = true;
	            if (urlChanged && isUrlAllowed(newUrl)) {
	                const entry = getCorsImage(newUrl);
	                if (!entry.img.complete) {
	                    const C = CharacterGetCurrent();
	                    entry.img.addEventListener("load", () => {
	                        Logger.info(`[ShuangAssets] 图片加载完成: ${newUrl.substring(0, 50)}...`);
	                        if (C) CharacterRefresh(C, false, false);
	                    }, { once: true });
	                }
	            }
	            if (state.poseSwitchMode === "special" && state.poseComboList.length > 1 && state.poseEditing) {
	                const srcConfig = state.tempTextureData?.PoseSettings?.[state.poseEditing];
	                if (srcConfig) {
	                    for (const comboKey of state.poseComboList) {
	                        if (comboKey !== state.poseEditing && state.tempTextureData.PoseSettings?.[comboKey]) {
	                            const destEnabled = state.tempTextureData.PoseSettings[comboKey].enabled;
	                            Object.assign(state.tempTextureData.PoseSettings[comboKey], srcConfig);
	                            state.tempTextureData.PoseSettings[comboKey].enabled = destEnabled;
	                        }
	                    }
	                }
	            }
	        }
	        if (state._pendingTextureRefresh) {
	            const now = Date.now();
	            const isDragging = state.dragActive || scaleDrag.active || !!barDrag.fieldId;
	            const interval = isDragging ? TEXTURE_DRAG_REFRESH_INTERVAL : TEXTURE_REFRESH_INTERVAL;
	            if (now - state._lastTextureRefresh >= interval) {
	                const C = CharacterGetCurrent();
	                if (C) CharacterRefresh(C, false, false);
	                state._lastTextureRefresh = now;
	                state._pendingTextureRefresh = false;
	            }
	        }
	    }
	    if (state.poseSwitchMode === "special") {
	        drawComboSelector();
	    } else {
	        drawPoseBar();
	    }
	    if (state.poseSwitchMode === "special") {
	        DrawText(L("批量编辑", "Batch Edit"), 1500, 360, "White", "Gray");
	    } else {
	        DrawText(L(`编辑图层${textureIndex + 1}`, `Edit Layer ${textureIndex + 1}`), 1500, 360, "White", "Gray");
	        DrawText(L("修改后自动预览，点击「确认」返回列表", "Auto-previews on change; press \u2713 to return"), 1505, 405, "Yellow", "Black");
	    }
	    DrawText(L("贴图", "Image"), 1100, 455, "White", "Gray");
	    const currentUrl = getEditTarget()?.TextureURL || "";
	    if (currentUrl && !isDomainInWhitelist(currentUrl)) {
	        const domain = extractDomain(currentUrl);
	        if (domain) {
	            DrawButton(1730, 435, 100, 40, L("信任", "Trust"), "#6F1F1F", null,
	                L("将该图片的域名加入可信白名单", "Add this image's domain to the trusted whitelist"), false);
	        }
	    }
	    drawMoveButton();
	    for (const field of STEPPER_FIELDS) {
	        DrawText(L(field.labelCn, field.labelEn), 1100, field.labelY, "White", "Gray");
	        drawStepperButton(STEPPER_MINUS_X, field.y, "Icons/Minus.png");
	        drawStepperButton(STEPPER_PLUS_X, field.y, "Icons/Plus.png");
	    }
	    drawScaleDragButton();
	    drawAspectLockButton();
	    for (const field of BAR_FIELDS) {
	        DrawText(L(field.labelCn, field.labelEn), 1100, field.labelY, "White", "Gray");
	        drawStepperButton(STEPPER_MINUS_X, field.y, "Icons/Minus.png");
	        drawStepperButton(STEPPER_PLUS_X, field.y, "Icons/Plus.png");
	        drawBarField(field);
	    }
	    drawMirrorRow();
	    if (!state.poseSwitchMode) {
	        DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
	            L("保存该图层并返回列表", "Save this layer & back to list"));
	        DrawButton(1885, 245, 90, 90, "", "White", "Icons/Trash.png",
	            L("删除此图层", "Delete this layer"), false);
	    }
	}
	function handleTextureEditClick(item, textureIndex, data) {
	    if (state.poseSwitchMode === "select") {
	        handlePoseSwitchClick();
	        return;
	    }
	    if (state.poseSwitchMode === "special") {
	        if (handlePoseSpecialConfigClick()) {
	            return;
	        }
	    }
	    if (!state.poseSwitchMode) {
	        if (handlePoseBarClick()) {
	            return;
	        }
	    }
	    const currentUrl = getEditTarget()?.TextureURL || "";
	    if (currentUrl && !isDomainInWhitelist(currentUrl)) {
	        const domain = extractDomain(currentUrl);
	        if (domain && MouseIn(1730, 435, 100, 40)) {
	            state.pendingDomainToAdd = domain;
	            state.currentView = "addDomainConfirm";
	            state.currentEditTexture = -1;
	            state.tempTextureData = null;
	            state.originalOverridePriority = undefined;
	            state._pendingTextureRefresh = false;
	            state.poseEditing = null;
	            state.poseSwitchMode = false;
	            state.poseSelectedList = [];
	            state.poseComboList = [];
	            state.poseComboIndex = 0;
	            unregisterPoseHook();
	            resetDragState();
	            return;
	        }
	    }
	    if (handleMoveButtonClick()) {
	        return;
	    }
	    if (handleScaleDragButtonClick()) {
	        return;
	    }
	    if (handleAspectLockButtonClick()) {
	        return;
	    }
	    for (const field of BAR_FIELDS) {
	        if (handleBarFieldClick(field)) {
	            return;
	        }
	    }
	    if (handleMirrorRowClick()) {
	        return;
	    }
	    if (!state.poseSwitchMode && MouseIn(1885, 245, 90, 90)) {
	        item.Property.Textures[textureIndex] = null;
	        trimTrailingNulls(item.Property.Textures);
	        state.currentEditTexture = -1;
	        state.tempTextureData = null;
	        state.originalOverridePriority = undefined;
	        state._pendingTextureRefresh = false;
	        state.currentListPage = 0;
	        state.poseEditing = null;
	        state.poseSwitchMode = false;
	        state.poseSelectedList = [];
	        state.poseComboList = [];
	        state.poseComboIndex = 0;
	        unregisterPoseHook();
	        resetDragState();
	        syncItemToServer(item);
	        const C = CharacterGetCurrent();
	        if (C) CharacterRefresh(C, false, false);
	        return;
	    }
	    if (!state.poseSwitchMode && MouseIn(1885, 135, 90, 90)) {
	        const toIntOr = (val, fallback) => {
	            const n = parseInt(val, 10);
	            return Number.isFinite(n) ? n : fallback;
	        };
	        const finalTexture = JSON.parse(JSON.stringify(state.tempTextureData));
	        finalTexture.TextureURL = String(state.tempTextureData?.TextureURL?.trim() || "");
	        finalTexture.OffsetX = toIntOr(state.tempTextureData?.OffsetX, 0);
	        finalTexture.OffsetY = toIntOr(state.tempTextureData?.OffsetY, 0);
	        finalTexture.ScaleX = toIntOr(state.tempTextureData?.ScaleX, 100);
	        finalTexture.ScaleY = toIntOr(state.tempTextureData?.ScaleY, 100);
	        finalTexture.ScaleLocked = state.tempTextureData?.ScaleLocked !== false;
	        finalTexture.Rotation = Math.max(-360, Math.min(360, toIntOr(state.tempTextureData?.Rotation, 0)));
	        finalTexture.Opacity = Math.max(0, Math.min(100, toIntOr(state.tempTextureData?.Opacity, 100)));
	        finalTexture.MirrorH = state.tempTextureData?.MirrorH === true;
	        finalTexture.MirrorV = state.tempTextureData?.MirrorV === true;
	        const existing = item.Property.Textures[textureIndex];
	        finalTexture.Visible = (existing && existing.Visible !== undefined) ? existing.Visible : true;
	        const mn = typeof Player?.MemberNumber === "number" ? Player.MemberNumber : 0;
	        if (finalTexture.TextureURL !== (existing?.TextureURL || "")) {
	            finalTexture.TextureURLSource = mn;
	        } else if (existing) {
	            finalTexture.TextureURLSource = existing.TextureURLSource || 0;
	        }
	        finalTexture.CurrentConfigurator = mn;
	        if (!item.Property) item.Property = { Textures: [] };
	        if (!item.Property.Textures) item.Property.Textures = [];
	        item.Property.Textures[textureIndex] = finalTexture;
	        const layerName = LAYER_NAMES[textureIndex];
	        if (typeof item.Property.OverridePriority !== "object" || item.Property.OverridePriority === null) {
	            item.Property.OverridePriority = {};
	        }
	        item.Property.OverridePriority[layerName] = state.tempPriority;
	        syncItemToServer(item);
	        state.currentEditTexture = -1;
	        state.tempTextureData = null;
	        state.originalOverridePriority = undefined;
	        state._pendingTextureRefresh = false;
	        state.currentListPage = Math.floor(textureIndex / TEXTURES_PER_PAGE);
	        state.poseEditing = null;
	        state.poseSwitchMode = false;
	        state.poseSelectedList = [];
	        state.poseComboList = [];
	        state.poseComboIndex = 0;
	        unregisterPoseHook();
	        resetDragState();
	        const C = CharacterGetCurrent();
	        if (C) CharacterRefresh(C, false, false);
	        return;
	    }
	}

	function exportConfig(item) {
	    const textures = item.Property?.Textures || [];
	    const usedCount = textures.filter(t => t != null).length;
	    const overridePriority = (item.Property?.OverridePriority && typeof item.Property.OverridePriority === "object")
	        ? item.Property.OverridePriority
	        : {};
	    const config = {
	        type: "ShuangCustomAssets",
	        version: 7,
	        textures: textures,
	        overridePriority: overridePriority,
	    };
	    for (const cat of HIDE_CATEGORIES) {
	        config[cat.key.charAt(0).toLowerCase() + cat.key.slice(1)] = item.Property?.[cat.key] === true;
	    }
	    const json = JSON.stringify(config, null, 2);
	    navigator.clipboard.writeText(json).then(() => {
	        Logger.info("配置已复制到剪贴板");
	        showStatus(L(`✔ 已复制到剪贴板，共 ${usedCount} 个图层`,
	            `✔ Copied to clipboard, ${usedCount} layers`), "#4CAF50");
	    }).catch(err => {
	        Logger.warn(L(`复制到剪贴板失败，改为下载: ${err?.message ?? err}`, `Clipboard copy failed, downloading instead: ${err?.message ?? err}`));
	        const blob = new Blob([json], { type: "application/json" });
	        const url = URL.createObjectURL(blob);
	        const a = document.createElement("a");
	        a.href = url;
	        a.download = "shuang-custom-assets-config.json";
	        a.click();
	        URL.revokeObjectURL(url);
	        showStatus(L("✔ 剪贴板不可用，已改为下载配置文件", "✔ Clipboard unavailable, downloaded config file"), "#FF9800");
	    });
	}
	function sanitizePriorityMap(raw, layerCount) {
	    const result = {};
	    if (!raw || typeof raw !== "object") return result;
	    for (const key in raw) {
	        const idx = LAYER_NAMES.indexOf(key);
	        if (idx === -1 || idx >= layerCount) continue;
	        const val = parseInt(raw[key]);
	        if (isNaN(val)) continue;
	        result[key] = Math.max(-99, Math.min(99, val));
	    }
	    return result;
	}
	function importConfig(item, mode) {
	    navigator.clipboard.readText().then(text => {
	        try {
	            const config = JSON.parse(text);
	            if (config.type !== "ShuangCustomAssets") {
	                throw new Error("无效的配置类型");
	            }
	            if (!Array.isArray(config.textures)) {
	                throw new Error("配置格式错误");
	            }
	            const toIntOr = (val, fallback) => {
	                const n = parseInt(val, 10);
	                return Number.isFinite(n) ? n : fallback;
	            };
	            const validTextures = config.textures.map(t => {
	                if (t == null) return null;
	                const legacyScale = toIntOr(t.Scale, 100);
	                const cleaned = {
	                    Alias: String(t.Alias || ""),
	                    TextureURL: String(t.TextureURL || ""),
	                    OffsetX: toIntOr(t.OffsetX, 0),
	                    OffsetY: toIntOr(t.OffsetY, 0),
	                    ScaleX: toIntOr(t.ScaleX, legacyScale),
	                    ScaleY: toIntOr(t.ScaleY, legacyScale),
	                    ScaleLocked: t.ScaleLocked !== false,
	                    Rotation: toIntOr(t.Rotation, 0),
	                    Visible: t.Visible !== false,
	                    Opacity: Math.max(0, Math.min(100, toIntOr(t.Opacity, 100))),
	                    MirrorH: t.MirrorH === true,
	                    MirrorV: t.MirrorV === true,
	                    TextureURLSource: typeof Player?.MemberNumber === "number" ? Player.MemberNumber : 0,
	                    CurrentConfigurator: typeof Player?.MemberNumber === "number" ? Player.MemberNumber : 0,
	                };
	                if (t.PoseSettings && typeof t.PoseSettings === "object" && !Array.isArray(t.PoseSettings)) {
	                    cleaned.PoseSettings = t.PoseSettings;
	                    migrateScaleField(cleaned);
	                }
	                return cleaned;
	            });
	            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
	            if (!item.Property.Textures) item.Property.Textures = [];
	            if (mode === "append") {
	                const nonNullImports = [];
	                for (let i = 0; i < validTextures.length; i++) {
	                    if (validTextures[i] != null) {
	                        nonNullImports.push({ texture: validTextures[i], sourceIdx: i });
	                    }
	                }
	                const existing = item.Property.Textures;
	                const targetMappings = [];
	                let importIdx = 0;
	                for (let i = 0; i < existing.length && importIdx < nonNullImports.length; i++) {
	                    if (existing[i] == null) {
	                        existing[i] = nonNullImports[importIdx].texture;
	                        targetMappings.push({ source: nonNullImports[importIdx].sourceIdx, target: i });
	                        importIdx++;
	                    }
	                }
	                while (importIdx < nonNullImports.length) {
	                    if (existing.length >= MAX_TEXTURE_COUNT) {
	                        throw new Error(`超过贴图数量上限（最多 ${MAX_TEXTURE_COUNT} 个）`);
	                    }
	                    existing.push(nonNullImports[importIdx].texture);
	                    targetMappings.push({ source: nonNullImports[importIdx].sourceIdx, target: existing.length - 1 });
	                    importIdx++;
	                }
	                const importedPriority = sanitizePriorityMap(config.overridePriority, MAX_TEXTURE_COUNT);
	                if (Object.keys(importedPriority).length > 0) {
	                    if (typeof item.Property.OverridePriority !== "object" || item.Property.OverridePriority === null) {
	                        item.Property.OverridePriority = {};
	                    }
	                    for (const mapping of targetMappings) {
	                        const sourceKey = LAYER_NAMES[mapping.source];
	                        const targetKey = LAYER_NAMES[mapping.target];
	                        if (sourceKey && targetKey && importedPriority[sourceKey] !== undefined) {
	                            item.Property.OverridePriority[targetKey] = importedPriority[sourceKey];
	                        }
	                    }
	                }
	            } else {
	                if (validTextures.length > MAX_TEXTURE_COUNT) {
	                    throw new Error(`超过贴图数量上限（最多 ${MAX_TEXTURE_COUNT} 个，当前 ${validTextures.length} 个）`);
	                }
	                item.Property.Textures = validTextures;
	                trimTrailingNulls(item.Property.Textures);
	                for (const cat of HIDE_CATEGORIES) {
	                    item.Property[cat.key] = config[cat.key.charAt(0).toLowerCase() + cat.key.slice(1)] === true;
	                }
	                if (config.hideBody === true) {
	                    item.Property.HideHead = true;
	                    item.Property.HideBodyUpper = true;
	                    item.Property.HideBodyLower = true;
	                }
	                const importedPriority = sanitizePriorityMap(config.overridePriority, MAX_TEXTURE_COUNT);
	                if (Object.keys(importedPriority).length > 0) {
	                    item.Property.OverridePriority = importedPriority;
	                } else {
	                    delete item.Property.OverridePriority;
	                }
	            }
	            updateHideArray(item);
	            const count = item.Property.Textures.filter(t => t != null).length;
	            const modeText = mode === "append" ? "追加" : "覆盖";
	            const modeTextEn = mode === "append" ? "Append" : "Replace";
	            Logger.info(`${modeText}导入成功:`, count, "个图层");
	            showStatus(L(`✔ ${modeText}导入成功，共 ${count} 个图层`,
	                `✔ ${modeTextEn} import OK, ${count} layers`), "#4CAF50");
	            syncItemToServer(item);
	            const C = CharacterGetCurrent();
	            if (C) CharacterRefresh(C, false, false);
	        } catch (err) {
	            Logger.warn(L(`导入失败: ${err.message}`, `Import failed: ${err.message}`));
	            showStatus(L(`✘ 导入失败: ${err.message}`, `✘ Import failed: ${err.message}`), "#E53935");
	        }
	    }).catch(err => {
	        Logger.warn(L(`读取剪贴板失败: ${err?.message ?? err}`, `Cannot read clipboard: ${err?.message ?? err}`));
	        showStatus(L("✘ 读取剪贴板失败，请确保已复制配置 JSON", "✘ Cannot read clipboard, make sure the config JSON is copied"), "#E53935");
	    });
	}

	function drawAddDomainConfirm() {
	    DrawText(L("⚠ 添加可信域名确认 ⚠", "⚠ Confirm Trusted Domain ⚠"), 1500, 370, "Red", "Gray");
	    let y = 440;
	    const lines = isChineseLang() ? [
	        { t: `即将添加域名到白名单: ${state.pendingDomainToAdd}`, c: "Cyan" },
	        { t: "", c: "White" },
	        { t: "添加后，来自该域名的贴图 URL 将被允许加载", c: "White" },
	        { t: "", c: "White" },
	        { t: "请注意以下风险：", c: "White" },
	        { t: "1. 请确认您信任该域名提供者", c: "White" },
	        { t: "2. 该域名的所有 URL 都将被加载", c: "White" },
	        { t: "3. 恶意域名可能用于追踪您的 IP 地址", c: "White" },
	        { t: "4. 恶意域名可能导致隐私信息泄露", c: "White" },
	        { t: "", c: "White" },
	        { t: "确定要添加此域名到可信列表吗？", c: "Red" },
	    ] : [
	        { t: `About to add domain to whitelist: ${state.pendingDomainToAdd}`, c: "Cyan" },
	        { t: "", c: "White" },
	        { t: "Once added, texture URLs from this domain will be allowed", c: "White" },
	        { t: "", c: "White" },
	        { t: "Please note the following risks:", c: "White" },
	        { t: "1. Make sure you trust this domain's provider", c: "White" },
	        { t: "2. All URLs from this domain will be loaded", c: "White" },
	        { t: "3. A malicious domain may track your IP address", c: "White" },
	        { t: "4. A malicious domain may leak private info", c: "White" },
	        { t: "", c: "White" },
	        { t: "Add this domain to the trusted list?", c: "Red" },
	    ];
	    for (const line of lines) {
	        DrawText(line.t, 1500, y, line.c, "Black");
	        y += 35;
	    }
	    y += 10;
	    DrawButton(1250, y, 200, 50, L("确认添加", "Add"), "#4CAF50", "#66BB6A", false,
	        L(`将 ${state.pendingDomainToAdd} 加入白名单`, `Add ${state.pendingDomainToAdd} to whitelist`));
	    DrawButton(1500, y, 200, 50, L("取消", "Cancel"), "#9E9E9E", "#BDBDBD", false,
	        L("放弃添加并返回", "Discard and go back"));
	}
	function handleAddDomainConfirmClick(item, data) {
	    const baseY = 440 + 35 * 11 + 10;
	    if (MouseIn(1250, baseY, 200, 50)) {
	        if (state.pendingDomainToAdd) {
	            const success = addDomainToWhitelist(state.pendingDomainToAdd);
	            if (success) {
	                Logger.info(`已添加可信域名: ${state.pendingDomainToAdd}`);
	                showStatus(L(`✔ 已添加可信域名: ${state.pendingDomainToAdd}`,
	                    `✔ Trusted domain added: ${state.pendingDomainToAdd}`), "#4CAF50");
	            }
	        }
	        state.pendingDomainToAdd = null;
	        state.currentView = "list";
	        const C = CharacterGetCurrent();
	        if (C) CharacterRefresh(C, false, false);
	        return;
	    }
	    if (MouseIn(1500, baseY, 200, 50)) {
	        state.pendingDomainToAdd = null;
	        state.currentView = "list";
	        return;
	    }
	}
	function drawHideSettings(item) {
	    DrawText(L("隐藏设置", "Hide Settings"), 1500, 360, "White", "Gray");
	    DrawText(L("选择需要隐藏的部位分类", "Choose which part categories to hide"), 1505, 410, "#fff942", "Gray");
	    const startY = 450;
	    const rowHeight = 55;
	    for (let i = 0; i < HIDE_CATEGORIES.length; i++) {
	        const cat = HIDE_CATEGORIES[i];
	        const y = startY + i * rowHeight;
	        const isHidden = item.Property?.[cat.key] === true;
	        const catLabel = L(cat.label, cat.labelEn);
	        DrawText(catLabel, 1100, y + 20, "White");
	        DrawButton(1200, y, 400, 40, L(`${cat.groups.length}个部位`, `${cat.groups.length} parts`), "White", null,
	            L(`该分类包含 ${cat.groups.length} 个部位组`, `This category covers ${cat.groups.length} groups`), false);
	        DrawButton(1620, y, 100, 40, isHidden ? L("隐藏", "Hidden") : L("显示", "Shown"),
	            isHidden ? "#666666" : "#4CAF50",
	            null, L(`点击切换是否隐藏「${catLabel}」`, `Toggle hiding "${catLabel}"`), false);
	    }
	    DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
	        L("确认并返回列表", "Confirm & back to list"));
	}
	function handleHideSettingsClick(item) {
	    const startY = 450;
	    const rowHeight = 55;
	    for (let i = 0; i < HIDE_CATEGORIES.length; i++) {
	        const cat = HIDE_CATEGORIES[i];
	        const y = startY + i * rowHeight;
	        if (MouseIn(1620, y, 100, 40)) {
	            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
	            item.Property[cat.key] = !(item.Property[cat.key] === true);
	            updateHideArray(item);
	            Logger.info(`${cat.label} 切换为: ${item.Property[cat.key]}`);
	            syncItemToServer(item);
	            const C = CharacterGetCurrent();
	            if (C) CharacterRefresh(C, false, false);
	            return;
	        }
	    }
	    if (MouseIn(1885, 135, 90, 90)) {
	        state.currentView = "list";
	        return;
	    }
	}
	function drawTextureListMain(item) {
	    const textures = item.Property?.Textures || [];
	    DrawText(L("贴图管理", "Texture Manager"), 1500, 360, "White", "Gray");
	    const usedSlots = textures.filter(t => t != null).length;
	    DrawText(L(`已使用 ${usedSlots}/${MAX_TEXTURE_COUNT} 个槽位`,
	        `${usedSlots}/${MAX_TEXTURE_COUNT} slots used`), 1505, 410, "#ebfe58", "Gray");
	    DrawButton(1665, 25, 90, 90, "", "White", "Icons/Private.png",
	        L("隐藏设置：隐藏身体部位/服饰等", "Hide settings: hide body parts / clothing"));
	    DrawButton(1885, 235, 90, 90, "", "White", "Icons/Question.png",
	        L("使用教程", "Tutorial"));
	    const startY = 450;
	    const itemHeight = 60;
	    const totalPages = Math.max(1, Math.ceil(MAX_TEXTURE_COUNT / TEXTURES_PER_PAGE));
	    if (state.currentListPage >= totalPages) state.currentListPage = totalPages - 1;
	    if (state.currentListPage < 0) state.currentListPage = 0;
	    const pageStart = state.currentListPage * TEXTURES_PER_PAGE;
	    const pageEnd = Math.min(pageStart + TEXTURES_PER_PAGE, MAX_TEXTURE_COUNT);
	    for (let i = pageStart; i < pageEnd; i++) {
	        const y = startY + (i - pageStart) * itemHeight;
	        const texture = textures[i];
	        DrawText(L(`槽位${i + 1}:`, `Slot ${i + 1}:`), 1100, y + 20, "White");
	        if (texture) {
	            const urlPreview = texture.TextureURL
	                ? (texture.TextureURL.length > 12 ? texture.TextureURL.substring(0, 12) + "..." : texture.TextureURL)
	                : L("(空)", "(empty)");
	            const displayText = texture.Alias || urlPreview;
	            DrawButton(1200, y, 400, 40, displayText, "White", null,
	                L("点击修改别名", "Click to edit alias"), false);
	            const isVisible = texture.Visible !== false;
	            DrawButton(1620, y, 100, 40, isVisible ? L("显示", "Shown") : L("隐藏", "Hidden"),
	                isVisible ? "#4CAF50" : "#666666", null,
	                L("点击切换该图层显示/隐藏", "Toggle this layer's visibility"), false);
	            DrawButton(1740, y, 100, 40, L("编辑", "Edit"), "White", null,
	                L("编辑该图层的 URL 与参数", "Edit this layer's URL and parameters"), false);
	            if (texture.TextureURL && !isDomainInWhitelist(texture.TextureURL)) {
	                DrawButton(1860, y, 100, 40, L("信任", "Trust"), "#6F1F1F", null,
	                    L("将该图片的域名加入可信白名单", "Add this image's domain to the trusted whitelist"), false);
	            }
	        } else {
	            DrawButton(1200, y, 400, 40, L("（空槽位）", "(empty slot)"), "#333333", null,
	                L("点击添加贴图到此槽位", "Click to add a texture to this slot"), false);
	            DrawButton(1740, y, 100, 40, L("添加", "Add"), "#D4FFD4", null,
	                L("在此槽位添加新贴图", "Add a new texture to this slot"), false);
	        }
	    }
	    const btnY = startY + TEXTURES_PER_PAGE * itemHeight;
	    const hasPages = totalPages > 1;
	    if (hasPages) {
	        DrawButton(1885, 810, 90, 90, "", "White", "Icons/Down.png",
	            L("下一页", "Next page"), !hasPages);
	    }
	    DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
	        L("确认并退出（保存并关闭）", "Confirm & Exit (save and close)"));
	    const ioBtnY = btnY + 120;
	    DrawButton(1170, ioBtnY, 200, 50, L("导出配置", "Export"), "#4CAF50", null,
	        L("将当前配置复制到剪贴板", "Copy current config to clipboard"), false);
	    DrawButton(1390, ioBtnY, 200, 50, L("覆盖导入", "Import (Replace)"), "#28639A", null,
	        L("用剪贴板配置覆盖当前所有图层", "Replace all layers with clipboard config"), false);
	    DrawButton(1610, ioBtnY, 200, 50, L("追加导入", "Import (Append)"), "#28639A", null,
	        L("将剪贴板配置追加到当前图层后", "Append clipboard config after current layers"), false);
	    if (state.statusMessage && Date.now() < state.statusMessageExpiry) {
	        DrawText(state.statusMessage.text, 1505, 890, state.statusMessage.color, "Black");
	    }
	}
	function handleTextureListClick(item, data) {
	    const textures = item.Property?.Textures || [];
	    if (MouseIn(1665, 25, 90, 90)) {
	        state.currentView = "hide";
	        return;
	    }
	    if (MouseIn(1885, 235, 90, 90)) {
	        state.currentView = "tutorial";
	        state.tutorialPage = 0;
	        return;
	    }
	    const startY = 450;
	    const itemHeight = 60;
	    const totalPages = Math.max(1, Math.ceil(MAX_TEXTURE_COUNT / TEXTURES_PER_PAGE));
	    if (state.currentListPage >= totalPages) state.currentListPage = totalPages - 1;
	    if (state.currentListPage < 0) state.currentListPage = 0;
	    const pageStart = state.currentListPage * TEXTURES_PER_PAGE;
	    const pageEnd = Math.min(pageStart + TEXTURES_PER_PAGE, MAX_TEXTURE_COUNT);
	    for (let i = pageStart; i < pageEnd; i++) {
	        const y = startY + (i - pageStart) * itemHeight;
	        const texture = textures[i];
	        if (texture) {
	            if (MouseIn(1200, y, 400, 40)) {
	                const current = texture.Alias || "";
	                const newAlias = prompt(L("请输入图层别名（留空清除别名）：", "Enter layer alias (leave empty to clear):"), current);
	                if (newAlias !== null && newAlias !== undefined) {
	                    texture.Alias = newAlias.trim();
	                    syncItemToServer(item);
	                }
	                return;
	            }
	            if (MouseIn(1620, y, 100, 40)) {
	                textures[i].Visible = textures[i].Visible === false ? true : false;
	                textures[i].CurrentConfigurator = typeof Player?.MemberNumber === "number" ? Player.MemberNumber : 0;
	                syncItemToServer(item);
	                const C = CharacterGetCurrent();
	                if (C) CharacterRefresh(C, false, false);
	                return;
	            }
	            if (MouseIn(1740, y, 100, 40)) {
	                state.currentEditTexture = i;
	                state.tempTextureData = JSON.parse(JSON.stringify(textures[i]));
	                state.originalEditTexture = JSON.parse(JSON.stringify(textures[i]));
	                if (!data.PersistentData) data.PersistentData = {};
	                data.PersistentData._originalTexture = JSON.parse(JSON.stringify(textures[i]));
	                createEditInputs(textures[i]);
	                resetDragState();
	                return;
	            }
	            if (texture?.TextureURL && !isDomainInWhitelist(texture.TextureURL) && MouseIn(1860, y, 100, 40)) {
	                const domain = extractDomain(texture.TextureURL);
	                if (domain) {
	                    state.pendingDomainToAdd = domain;
	                    state.currentView = "addDomainConfirm";
	                }
	                return;
	            }
	        } else {
	            if (MouseIn(1740, y, 100, 40) || MouseIn(1200, y, 400, 40)) {
	                const newTexture = JSON.parse(JSON.stringify(DEFAULT_TEXTURE));
	                if (!item.Property) item.Property = { ...DEFAULT_PROPS };
	                if (!item.Property.Textures) item.Property.Textures = [];
	                item.Property.Textures[i] = newTexture;
	                state.currentEditTexture = i;
	                state.tempTextureData = JSON.parse(JSON.stringify(newTexture));
	                state.originalEditTexture = null;
	                if (!data.PersistentData) data.PersistentData = {};
	                data.PersistentData._originalTexture = JSON.parse(JSON.stringify(newTexture));
	                createEditInputs();
	                resetDragState();
	                return;
	            }
	        }
	    }
	    const hasPages = totalPages > 1;
	    if (hasPages && MouseIn(1885, 810, 90, 90)) {
	        state.currentListPage = (state.currentListPage + 1) % totalPages;
	        return;
	    }
	    if (MouseIn(1885, 135, 90, 90)) {
	        const C = CharacterGetCurrent();
	        if (item) {
	            if (!item.Property) item.Property = { Textures: [] };
	            if (!item.Property.Textures) item.Property.Textures = [];
	            updateHideArray(item);
	            Logger.info("保存贴图数据:", JSON.stringify(item.Property.Textures));
	            Logger.info(`隐藏分类 - ${HIDE_CATEGORIES.map(c => `${c.label}: ${item.Property[c.key]}`).join(', ')}`);
	            syncItemToServer(item);
	            if (C) CharacterRefresh(C, false, false);
	            Logger.info("贴图设置已保存并同步");
	        }
	        if (typeof DialogLeaveFocusItem === "function") DialogLeaveFocusItem();
	        return;
	    }
	    const btnY = startY + TEXTURES_PER_PAGE * itemHeight;
	    const ioBtnY = btnY + 120;
	    if (MouseIn(1170, ioBtnY, 200, 50)) {
	        exportConfig(item);
	        return;
	    }
	    if (MouseIn(1390, ioBtnY, 200, 50)) {
	        importConfig(item, "overwrite");
	        return;
	    }
	    if (MouseIn(1610, ioBtnY, 200, 50)) {
	        const usedSlots = (item.Property?.Textures || []).filter(t => t != null).length;
	        if (usedSlots >= MAX_TEXTURE_COUNT) {
	            showStatus(L(`✘ 超过贴图数量上限（最多 ${MAX_TEXTURE_COUNT} 个）`,
	                `✘ Texture limit reached (max ${MAX_TEXTURE_COUNT})`), "#E53935");
	            return;
	        }
	        importConfig(item, "append");
	        return;
	    }
	}
	function returnToListFromSubview() {
	    if (state.currentEditTexture >= 0) {
	        const item = DialogFocusItem;
	        if (item) {
	            if (!item.Property) item.Property = { Textures: [] };
	            if (!item.Property.Textures) item.Property.Textures = [];
	            if (state.originalEditTexture) {
	                item.Property.Textures[state.currentEditTexture] = JSON.parse(JSON.stringify(state.originalEditTexture));
	            } else {
	                item.Property.Textures[state.currentEditTexture] = null;
	                trimTrailingNulls(item.Property.Textures);
	            }
	            syncItemToServer(item);
	            const C = CharacterGetCurrent();
	            if (C) CharacterRefresh(C, false, false);
	        }
	    }
	    state.currentEditTexture = -1;
	    state.tempTextureData = null;
	    state.originalEditTexture = null;
	    state.originalOverridePriority = undefined;
	    state.pendingDomainToAdd = null;
	    state.poseSwitchMode = false;
	    unregisterPoseHook();
	    resetDragState();
	    state.currentView = "list";
	}

	const TUTORIAL_PAGES = [
	    {
	        title: { cn: "什么是自定义贴图？", en: "What is Custom Texture?" },
	        lines: [
	            { cn: "自定义贴图可以在角色身上叠加自定义图片。", en: "Overlay custom images on your character." },
	            {},
	            { cn: "核心功能：", en: "Core features:" },
	            { cn: "• 最多 18 个图层，可独立设置图片和参数", en: "• Up to 18 layers with independent settings" },
	            { cn: "• 支持 GIF 动图播放", en: "• Animated GIF playback" },
	            { cn: "• 支持按姿势切换不同贴图效果", en: "• Per-pose texture switching" },
	            { cn: "• 可隐藏身体部位/服饰，避免遮挡贴图", en: "• Hide body parts / clothing" },
	            { cn: "• 域名白名单安全机制", en: "• Domain whitelist security" },
	            {},
	            { cn: "点击「下一页」继续了解各项功能。", en: "Click \"Next\" to continue.", color: "Gray" },
	        ]
	    },
	    {
	        title: { cn: "图层与全局设置", en: "Layers & Global Settings" },
	        lines: [
	            { cn: "每个图层有一组「全局设置」，作为默认参数：", en: "Each layer has global settings as defaults:" },
	            {},
	            { cn: "• 贴图网址：图片的 URL 地址", en: "• Texture URL: the image URL" },
	            { cn: "• X/Y 偏移：图片在角色身上的位置", en: "• X/Y Offset: image position" },
	            { cn: "• 缩放 X/Y：水平和垂直缩放比例", en: "• Scale X/Y: horizontal & vertical scale" },
	            { cn: "• 旋转：图片旋转角度（0-360°）", en: "• Rotation: 0-360 degrees" },
	            { cn: "• 透明度：图片不透明度（0-100%）", en: "• Opacity: 0-100%" },
	            { cn: "• 镜射：水平/垂直翻转图片", en: "• Mirror: flip H / V" },
	            {},
	            { cn: "不用特殊姿势设置时，只需调整全局设置。", en: "Without per-pose settings, just adjust globals.", color: "Gray" },
	        ]
	    },
	    {
	        title: { cn: "特殊姿势设置", en: "Per-Pose Settings" },
	        lines: [
	            { cn: "可为特定姿势设置不同的贴图参数。", en: "Set different params for specific poses." },
	            {},
	            { cn: "底部有两个开关：", en: "Two toggles at the bottom:" },
	            { cn: "「视角」开关：", en: "\"View\" toggle:" },
	            { cn: "  全局视角 = 编辑全局配置，角色不换姿势", en: "  Global = edit global, no pose change" },
	            { cn: "  当前视角 = 编辑当前姿势配置并预览", en: "  Current = edit & preview current pose" },
	            { cn: "「生效」开关：", en: "\"Active\" toggle:" },
	            { cn: "  开启 = 该姿势使用独立配置", en: "  On = use pose-specific config" },
	            { cn: "  关闭 = 回退到全局配置", en: "  Off = fall back to global config" },
	        ]
	    },
	    {
	        title: { cn: "批量配置", en: "Batch Configuration" },
	        lines: [
	            { cn: "需要为多个姿势设置相同效果时使用：", en: "Batch config for multiple poses:" },
	            {},
	            { cn: "1. 点击「批量配置」进入姿势选择页", en: "1. Click \"Batch Config\" to select poses" },
	            { cn: "2. 多选需要配置的姿势（橙色 = 选中）", en: "2. Multi-select (orange = selected)" },
	            { cn: "3. 点击「编辑选中姿势」进入批量编辑", en: "3. Click \"Edit Selected\" to batch edit" },
	            { cn: "4. 调整参数，所有选中姿势组合会同步", en: "4. Adjust params - all combos sync" },
	            { cn: "5. 保存后所有选中姿势都有相同配置", en: "5. Save to apply to all selected" },
	            {},
	            { cn: "适合：多个姿势用同一张贴图、统一调整偏移等。", en: "Useful: same image across poses, etc.", color: "Gray" },
	        ]
	    },
	    {
	        title: { cn: "隐藏设置", en: "Hide Settings" },
	        lines: [
	            { cn: "隐藏设置可隐藏遮挡贴图的身体部位或服饰。", en: "Hide parts that occlude your textures." },
	            {},
	            { cn: "8 个分类：", en: "8 categories:" },
	            { cn: "• 表情图标：聊天表情", en: "• Emoticon: chat emotes" },
	            { cn: "• cosplay：发型、翅膀、动物身体等", en: "• Cosplay: hair, wings, animal body" },
	            { cn: "• 五官：眼睛、眉毛、嘴巴等", en: "• Face: eyes, eyebrows, mouth" },
	            { cn: "• 头部 / 上半身 / 下半身：身体模型", en: "• Head / Body Upper / Body Lower" },
	            { cn: "• 服饰：衣服、鞋子、饰品等", en: "• Clothing: clothes, shoes, etc." },
	            { cn: "• 拘束道具：所有拘束物品", en: "• Restraints: all restraint items" },
	            {},
	            { cn: "在列表页右上角点击隐藏图标进入。", en: "Click the hide icon on the list page.", color: "Gray" },
	        ]
	    },
	    {
	        title: { cn: "安全与域名白名单", en: "Security & Whitelist" },
	        lines: [
	            { cn: "白名单模式（推荐）：只加载可信域名的图片。", en: "Whitelist mode: only trusted domains load." },
	            {},
	            { cn: "添加可信域名的方式：", en: "Ways to add trusted domains:" },
	            { cn: "• 编辑面板中点击「信任」按钮", en: "• Click \"Trust\" in the edit panel" },
	            { cn: "• 白名单管理页面手动添加", en: "• Add manually in whitelist page" },
	            { cn: "• 「扫描房间」查看房间内不可信域名", en: "• \"Scan Room\" for all untrusted" },
	            { cn: "不可信域名提示：", en: "Untrusted domain warning:" },
	            { cn: "  开启 = 显示警告图片", en: "  On = show warning image" },
	            { cn: "  关闭 = 直接跳过不加载", en: "  Off = skip silently" },
	            { cn: "在扩展设置页面可调整安全选项。", en: "Adjust in extension settings.", color: "Gray" },
	        ]
	    },
	    {
	        title: { cn: "导入导出", en: "Import / Export" },
	        lines: [
	            { cn: "在列表页底部有三个按钮：", en: "Three buttons at the bottom:" },
	            {},
	            { cn: "• 导出配置：复制所有图层配置到剪贴板", en: "• Export: copy configs to clipboard" },
	            { cn: "• 覆盖导入：用剪贴板配置替换所有图层", en: "• Import (Replace): replace all" },
	            { cn: "• 追加导入：在当前图层后追加配置", en: "• Import (Append): add after current" },
	            { cn: "配置包含图层所有参数（URL、偏移、", en: "Config includes all params (URL, offset," },
	            { cn: "缩放、旋转、透明度、镜射、姿势设置等）。", en: "scale, rotation, opacity, mirror, etc.)" },
	            { cn: "不包含隐藏设置。", en: "Excludes hide settings." },
	            {},
	            { cn: "追加导入超过 18 层上限会提示。", en: "Append checks the 18-layer limit.", color: "Gray" },
	        ]
	    },
	];
	const TITLE_Y = 360;
	const SUBTITLE_Y = 410;
	const CONTENT_START_Y = 470;
	const LINE_HEIGHT = 38;
	const CLOSE_BTN = { x: 1885, y: 25, w: 90, h: 90 };
	const PREV_BTN = { x: 1250, y: 900, w: 150, h: 50 };
	const NEXT_BTN = { x: 1600, y: 900, w: 150, h: 50 };
	function drawTutorial() {
	    const totalPages = TUTORIAL_PAGES.length;
	    if (state.tutorialPage >= totalPages) state.tutorialPage = totalPages - 1;
	    if (state.tutorialPage < 0) state.tutorialPage = 0;
	    const page = TUTORIAL_PAGES[state.tutorialPage];
	    const cn = isChineseLang();
	    DrawText(L(page.title.cn, page.title.en), 1500, TITLE_Y, "White", "Gray");
	    DrawText(L(`第 ${state.tutorialPage + 1}/${totalPages} 页`, `Page ${state.tutorialPage + 1}/${totalPages}`),
	        1505, SUBTITLE_Y, "#ebfe58", "Gray");
	    let y = CONTENT_START_Y;
	    for (const line of page.lines) {
	        const text = cn ? line.cn : line.en;
	        if (text) {
	            const color = line.color || "White";
	            DrawText(text, 1500, y, color, "Gray");
	        }
	        y += LINE_HEIGHT;
	    }
	    DrawButton(CLOSE_BTN.x, CLOSE_BTN.y, CLOSE_BTN.w, CLOSE_BTN.h, "", "White", "Icons/Exit.png",
	        L("关闭教程", "Close tutorial"));
	    const hasPrev = state.tutorialPage > 0;
	    const isLastPage = state.tutorialPage >= totalPages - 1;
	    if (hasPrev) {
	        DrawButton(PREV_BTN.x, PREV_BTN.y, PREV_BTN.w, PREV_BTN.h,
	            L("上一页", "Prev"), "#555555", "#777777", false,
	            L("上一页", "Previous page"));
	    }
	    DrawButton(NEXT_BTN.x, NEXT_BTN.y, NEXT_BTN.w, NEXT_BTN.h,
	        isLastPage ? L("理解了", "Got it") : L("下一页", "Next"),
	        "#555555", "#777777", false,
	        isLastPage ? L("退出教程", "Exit tutorial") : L("下一页", "Next page"));
	}
	function handleTutorialClick() {
	    if (MouseIn(CLOSE_BTN.x, CLOSE_BTN.y, CLOSE_BTN.w, CLOSE_BTN.h)) {
	        state.currentView = "list";
	        state.tutorialPage = 0;
	        return;
	    }
	    const totalPages = TUTORIAL_PAGES.length;
	    if (state.tutorialPage > 0 && MouseIn(PREV_BTN.x, PREV_BTN.y, PREV_BTN.w, PREV_BTN.h)) {
	        state.tutorialPage--;
	        return;
	    }
	    if (MouseIn(NEXT_BTN.x, NEXT_BTN.y, NEXT_BTN.w, NEXT_BTN.h)) {
	        if (state.tutorialPage < totalPages - 1) {
	            state.tutorialPage++;
	        } else {
	            state.currentView = "list";
	            state.tutorialPage = 0;
	        }
	        return;
	    }
	}

	const _resolvedAssetUrls = new Map();
	function resolveFixedAssetUrl(filename) {
	    if (_resolvedAssetUrls.has(filename)) {
	        return _resolvedAssetUrls.get(filename);
	    }
	    const primaryUrl = `${ASSETS_CDN_PRIMARY}/${filename}`;
	    const fallbackUrl = `${ASSETS_CDN_FALLBACK}/${filename}`;
	    const entry = getCorsImage(primaryUrl);
	    if (entry.failed) {
	        _resolvedAssetUrls.set(filename, fallbackUrl);
	        return fallbackUrl;
	    }
	    if (entry.loaded) {
	        _resolvedAssetUrls.set(filename, primaryUrl);
	    }
	    return primaryUrl;
	}

	var lib$1 = {};

	var gif = {};

	var lib = {};

	var hasRequiredLib$1;
	function requireLib$1 () {
		if (hasRequiredLib$1) return lib;
		hasRequiredLib$1 = 1;
		Object.defineProperty(lib, "__esModule", {
		  value: true
		});
		lib.loop = lib.conditional = lib.parse = void 0;
		var parse = function parse(stream, schema) {
		  var result = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
		  var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : result;
		  if (Array.isArray(schema)) {
		    schema.forEach(function (partSchema) {
		      return parse(stream, partSchema, result, parent);
		    });
		  } else if (typeof schema === 'function') {
		    schema(stream, result, parent, parse);
		  } else {
		    var key = Object.keys(schema)[0];
		    if (Array.isArray(schema[key])) {
		      parent[key] = {};
		      parse(stream, schema[key], result, parent[key]);
		    } else {
		      parent[key] = schema[key](stream, result, parent, parse);
		    }
		  }
		  return result;
		};
		lib.parse = parse;
		var conditional = function conditional(schema, conditionFunc) {
		  return function (stream, result, parent, parse) {
		    if (conditionFunc(stream, result, parent)) {
		      parse(stream, schema, result, parent);
		    }
		  };
		};
		lib.conditional = conditional;
		var loop = function loop(schema, continueFunc) {
		  return function (stream, result, parent, parse) {
		    var arr = [];
		    var lastStreamPos = stream.pos;
		    while (continueFunc(stream, result, parent)) {
		      var newParent = {};
		      parse(stream, schema, result, newParent);
		      if (stream.pos === lastStreamPos) {
		        break;
		      }
		      lastStreamPos = stream.pos;
		      arr.push(newParent);
		    }
		    return arr;
		  };
		};
		lib.loop = loop;
		return lib;
	}

	var uint8 = {};

	var hasRequiredUint8;
	function requireUint8 () {
		if (hasRequiredUint8) return uint8;
		hasRequiredUint8 = 1;
		Object.defineProperty(uint8, "__esModule", {
		  value: true
		});
		uint8.readBits = uint8.readArray = uint8.readUnsigned = uint8.readString = uint8.peekBytes = uint8.readBytes = uint8.peekByte = uint8.readByte = uint8.buildStream = void 0;
		var buildStream = function buildStream(uint8Data) {
		  return {
		    data: uint8Data,
		    pos: 0
		  };
		};
		uint8.buildStream = buildStream;
		var readByte = function readByte() {
		  return function (stream) {
		    return stream.data[stream.pos++];
		  };
		};
		uint8.readByte = readByte;
		var peekByte = function peekByte() {
		  var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
		  return function (stream) {
		    return stream.data[stream.pos + offset];
		  };
		};
		uint8.peekByte = peekByte;
		var readBytes = function readBytes(length) {
		  return function (stream) {
		    return stream.data.subarray(stream.pos, stream.pos += length);
		  };
		};
		uint8.readBytes = readBytes;
		var peekBytes = function peekBytes(length) {
		  return function (stream) {
		    return stream.data.subarray(stream.pos, stream.pos + length);
		  };
		};
		uint8.peekBytes = peekBytes;
		var readString = function readString(length) {
		  return function (stream) {
		    return Array.from(readBytes(length)(stream)).map(function (value) {
		      return String.fromCharCode(value);
		    }).join('');
		  };
		};
		uint8.readString = readString;
		var readUnsigned = function readUnsigned(littleEndian) {
		  return function (stream) {
		    var bytes = readBytes(2)(stream);
		    return littleEndian ? (bytes[1] << 8) + bytes[0] : (bytes[0] << 8) + bytes[1];
		  };
		};
		uint8.readUnsigned = readUnsigned;
		var readArray = function readArray(byteSize, totalOrFunc) {
		  return function (stream, result, parent) {
		    var total = typeof totalOrFunc === 'function' ? totalOrFunc(stream, result, parent) : totalOrFunc;
		    var parser = readBytes(byteSize);
		    var arr = new Array(total);
		    for (var i = 0; i < total; i++) {
		      arr[i] = parser(stream);
		    }
		    return arr;
		  };
		};
		uint8.readArray = readArray;
		var subBitsTotal = function subBitsTotal(bits, startIndex, length) {
		  var result = 0;
		  for (var i = 0; i < length; i++) {
		    result += bits[startIndex + i] && Math.pow(2, length - i - 1);
		  }
		  return result;
		};
		var readBits = function readBits(schema) {
		  return function (stream) {
		    var _byte = readByte()(stream);
		    var bits = new Array(8);
		    for (var i = 0; i < 8; i++) {
		      bits[7 - i] = !!(_byte & 1 << i);
		    }
		    return Object.keys(schema).reduce(function (res, key) {
		      var def = schema[key];
		      if (def.length) {
		        res[key] = subBitsTotal(bits, def.index, def.length);
		      } else {
		        res[key] = bits[def.index];
		      }
		      return res;
		    }, {});
		  };
		};
		uint8.readBits = readBits;
		return uint8;
	}

	var hasRequiredGif;
	function requireGif () {
		if (hasRequiredGif) return gif;
		hasRequiredGif = 1;
		(function (exports) {
			Object.defineProperty(exports, "__esModule", {
			  value: true
			});
			exports["default"] = void 0;
			var _ = requireLib$1();
			var _uint = requireUint8();
			var subBlocksSchema = {
			  blocks: function blocks(stream) {
			    var terminator = 0x00;
			    var chunks = [];
			    var streamSize = stream.data.length;
			    var total = 0;
			    for (var size = (0, _uint.readByte)()(stream); size !== terminator; size = (0, _uint.readByte)()(stream)) {
			      if (!size) break;
			      if (stream.pos + size >= streamSize) {
			        var availableSize = streamSize - stream.pos;
			        chunks.push((0, _uint.readBytes)(availableSize)(stream));
			        total += availableSize;
			        break;
			      }
			      chunks.push((0, _uint.readBytes)(size)(stream));
			      total += size;
			    }
			    var result = new Uint8Array(total);
			    var offset = 0;
			    for (var i = 0; i < chunks.length; i++) {
			      result.set(chunks[i], offset);
			      offset += chunks[i].length;
			    }
			    return result;
			  }
			};
			var gceSchema = (0, _.conditional)({
			  gce: [{
			    codes: (0, _uint.readBytes)(2)
			  }, {
			    byteSize: (0, _uint.readByte)()
			  }, {
			    extras: (0, _uint.readBits)({
			      future: {
			        index: 0,
			        length: 3
			      },
			      disposal: {
			        index: 3,
			        length: 3
			      },
			      userInput: {
			        index: 6
			      },
			      transparentColorGiven: {
			        index: 7
			      }
			    })
			  }, {
			    delay: (0, _uint.readUnsigned)(true)
			  }, {
			    transparentColorIndex: (0, _uint.readByte)()
			  }, {
			    terminator: (0, _uint.readByte)()
			  }]
			}, function (stream) {
			  var codes = (0, _uint.peekBytes)(2)(stream);
			  return codes[0] === 0x21 && codes[1] === 0xf9;
			});
			var imageSchema = (0, _.conditional)({
			  image: [{
			    code: (0, _uint.readByte)()
			  }, {
			    descriptor: [{
			      left: (0, _uint.readUnsigned)(true)
			    }, {
			      top: (0, _uint.readUnsigned)(true)
			    }, {
			      width: (0, _uint.readUnsigned)(true)
			    }, {
			      height: (0, _uint.readUnsigned)(true)
			    }, {
			      lct: (0, _uint.readBits)({
			        exists: {
			          index: 0
			        },
			        interlaced: {
			          index: 1
			        },
			        sort: {
			          index: 2
			        },
			        future: {
			          index: 3,
			          length: 2
			        },
			        size: {
			          index: 5,
			          length: 3
			        }
			      })
			    }]
			  }, (0, _.conditional)({
			    lct: (0, _uint.readArray)(3, function (stream, result, parent) {
			      return Math.pow(2, parent.descriptor.lct.size + 1);
			    })
			  }, function (stream, result, parent) {
			    return parent.descriptor.lct.exists;
			  }), {
			    data: [{
			      minCodeSize: (0, _uint.readByte)()
			    }, subBlocksSchema]
			  }]
			}, function (stream) {
			  return (0, _uint.peekByte)()(stream) === 0x2c;
			});
			var textSchema = (0, _.conditional)({
			  text: [{
			    codes: (0, _uint.readBytes)(2)
			  }, {
			    blockSize: (0, _uint.readByte)()
			  }, {
			    preData: function preData(stream, result, parent) {
			      return (0, _uint.readBytes)(parent.text.blockSize)(stream);
			    }
			  }, subBlocksSchema]
			}, function (stream) {
			  var codes = (0, _uint.peekBytes)(2)(stream);
			  return codes[0] === 0x21 && codes[1] === 0x01;
			});
			var applicationSchema = (0, _.conditional)({
			  application: [{
			    codes: (0, _uint.readBytes)(2)
			  }, {
			    blockSize: (0, _uint.readByte)()
			  }, {
			    id: function id(stream, result, parent) {
			      return (0, _uint.readString)(parent.blockSize)(stream);
			    }
			  }, subBlocksSchema]
			}, function (stream) {
			  var codes = (0, _uint.peekBytes)(2)(stream);
			  return codes[0] === 0x21 && codes[1] === 0xff;
			});
			var commentSchema = (0, _.conditional)({
			  comment: [{
			    codes: (0, _uint.readBytes)(2)
			  }, subBlocksSchema]
			}, function (stream) {
			  var codes = (0, _uint.peekBytes)(2)(stream);
			  return codes[0] === 0x21 && codes[1] === 0xfe;
			});
			var schema = [{
			  header: [{
			    signature: (0, _uint.readString)(3)
			  }, {
			    version: (0, _uint.readString)(3)
			  }]
			}, {
			  lsd: [{
			    width: (0, _uint.readUnsigned)(true)
			  }, {
			    height: (0, _uint.readUnsigned)(true)
			  }, {
			    gct: (0, _uint.readBits)({
			      exists: {
			        index: 0
			      },
			      resolution: {
			        index: 1,
			        length: 3
			      },
			      sort: {
			        index: 4
			      },
			      size: {
			        index: 5,
			        length: 3
			      }
			    })
			  }, {
			    backgroundColorIndex: (0, _uint.readByte)()
			  }, {
			    pixelAspectRatio: (0, _uint.readByte)()
			  }]
			}, (0, _.conditional)({
			  gct: (0, _uint.readArray)(3, function (stream, result) {
			    return Math.pow(2, result.lsd.gct.size + 1);
			  })
			}, function (stream, result) {
			  return result.lsd.gct.exists;
			}),
			{
			  frames: (0, _.loop)([gceSchema, applicationSchema, commentSchema, imageSchema, textSchema], function (stream) {
			    var nextCode = (0, _uint.peekByte)()(stream);
			    return nextCode === 0x21 || nextCode === 0x2c;
			  })
			}];
			var _default = schema;
			exports["default"] = _default;
		} (gif));
		return gif;
	}

	var deinterlace = {};

	var hasRequiredDeinterlace;
	function requireDeinterlace () {
		if (hasRequiredDeinterlace) return deinterlace;
		hasRequiredDeinterlace = 1;
		Object.defineProperty(deinterlace, "__esModule", {
		  value: true
		});
		deinterlace.deinterlace = void 0;
		var deinterlace$1 = function deinterlace(pixels, width) {
		  var newPixels = new Array(pixels.length);
		  var rows = pixels.length / width;
		  var cpRow = function cpRow(toRow, fromRow) {
		    var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
		    newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
		  };
		  var offsets = [0, 4, 2, 1];
		  var steps = [8, 8, 4, 2];
		  var fromRow = 0;
		  for (var pass = 0; pass < 4; pass++) {
		    for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
		      cpRow(toRow, fromRow);
		      fromRow++;
		    }
		  }
		  return newPixels;
		};
		deinterlace.deinterlace = deinterlace$1;
		return deinterlace;
	}

	var lzw = {};

	var hasRequiredLzw;
	function requireLzw () {
		if (hasRequiredLzw) return lzw;
		hasRequiredLzw = 1;
		Object.defineProperty(lzw, "__esModule", {
		  value: true
		});
		lzw.lzw = void 0;
		var lzw$1 = function lzw(minCodeSize, data, pixelCount) {
		  var MAX_STACK_SIZE = 4096;
		  var nullCode = -1;
		  var npix = pixelCount;
		  var available, clear, code_mask, code_size, end_of_information, in_code, old_code, bits, code, i, datum, data_size, first, top, bi, pi;
		  var dstPixels = new Array(pixelCount);
		  var prefix = new Array(MAX_STACK_SIZE);
		  var suffix = new Array(MAX_STACK_SIZE);
		  var pixelStack = new Array(MAX_STACK_SIZE + 1);
		  data_size = minCodeSize;
		  clear = 1 << data_size;
		  end_of_information = clear + 1;
		  available = clear + 2;
		  old_code = nullCode;
		  code_size = data_size + 1;
		  code_mask = (1 << code_size) - 1;
		  for (code = 0; code < clear; code++) {
		    prefix[code] = 0;
		    suffix[code] = code;
		  }
		  var datum, bits, first, top, pi, bi;
		  datum = bits = first = top = pi = bi = 0;
		  for (i = 0; i < npix;) {
		    if (top === 0) {
		      if (bits < code_size) {
		        datum += data[bi] << bits;
		        bits += 8;
		        bi++;
		        continue;
		      }
		      code = datum & code_mask;
		      datum >>= code_size;
		      bits -= code_size;
		      if (code > available || code == end_of_information) {
		        break;
		      }
		      if (code == clear) {
		        code_size = data_size + 1;
		        code_mask = (1 << code_size) - 1;
		        available = clear + 2;
		        old_code = nullCode;
		        continue;
		      }
		      if (old_code == nullCode) {
		        pixelStack[top++] = suffix[code];
		        old_code = code;
		        first = code;
		        continue;
		      }
		      in_code = code;
		      if (code == available) {
		        pixelStack[top++] = first;
		        code = old_code;
		      }
		      while (code > clear) {
		        pixelStack[top++] = suffix[code];
		        code = prefix[code];
		      }
		      first = suffix[code] & 0xff;
		      pixelStack[top++] = first;
		      if (available < MAX_STACK_SIZE) {
		        prefix[available] = old_code;
		        suffix[available] = first;
		        available++;
		        if ((available & code_mask) === 0 && available < MAX_STACK_SIZE) {
		          code_size++;
		          code_mask += available;
		        }
		      }
		      old_code = in_code;
		    }
		    top--;
		    dstPixels[pi++] = pixelStack[top];
		    i++;
		  }
		  for (i = pi; i < npix; i++) {
		    dstPixels[i] = 0;
		  }
		  return dstPixels;
		};
		lzw.lzw = lzw$1;
		return lzw;
	}

	var hasRequiredLib;
	function requireLib () {
		if (hasRequiredLib) return lib$1;
		hasRequiredLib = 1;
		Object.defineProperty(lib$1, "__esModule", {
		  value: true
		});
		lib$1.decompressFrames = lib$1.decompressFrame = lib$1.parseGIF = void 0;
		var _gif = _interopRequireDefault(requireGif());
		var _jsBinarySchemaParser = requireLib$1();
		var _uint = requireUint8();
		var _deinterlace = requireDeinterlace();
		var _lzw = requireLzw();
		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
		var parseGIF = function parseGIF(arrayBuffer) {
		  var byteData = new Uint8Array(arrayBuffer);
		  return (0, _jsBinarySchemaParser.parse)((0, _uint.buildStream)(byteData), _gif["default"]);
		};
		lib$1.parseGIF = parseGIF;
		var generatePatch = function generatePatch(image) {
		  var totalPixels = image.pixels.length;
		  var patchData = new Uint8ClampedArray(totalPixels * 4);
		  for (var i = 0; i < totalPixels; i++) {
		    var pos = i * 4;
		    var colorIndex = image.pixels[i];
		    var color = image.colorTable[colorIndex] || [0, 0, 0];
		    patchData[pos] = color[0];
		    patchData[pos + 1] = color[1];
		    patchData[pos + 2] = color[2];
		    patchData[pos + 3] = colorIndex !== image.transparentIndex ? 255 : 0;
		  }
		  return patchData;
		};
		var decompressFrame = function decompressFrame(frame, gct, buildImagePatch) {
		  if (!frame.image) {
		    console.warn('gif frame does not have associated image.');
		    return;
		  }
		  var image = frame.image;
		  var totalPixels = image.descriptor.width * image.descriptor.height;
		  var pixels = (0, _lzw.lzw)(image.data.minCodeSize, image.data.blocks, totalPixels);
		  if (image.descriptor.lct.interlaced) {
		    pixels = (0, _deinterlace.deinterlace)(pixels, image.descriptor.width);
		  }
		  var resultImage = {
		    pixels: pixels,
		    dims: {
		      top: frame.image.descriptor.top,
		      left: frame.image.descriptor.left,
		      width: frame.image.descriptor.width,
		      height: frame.image.descriptor.height
		    }
		  };
		  if (image.descriptor.lct && image.descriptor.lct.exists) {
		    resultImage.colorTable = image.lct;
		  } else {
		    resultImage.colorTable = gct;
		  }
		  if (frame.gce) {
		    resultImage.delay = (frame.gce.delay || 10) * 10;
		    resultImage.disposalType = frame.gce.extras.disposal;
		    if (frame.gce.extras.transparentColorGiven) {
		      resultImage.transparentIndex = frame.gce.transparentColorIndex;
		    }
		  }
		  if (buildImagePatch) {
		    resultImage.patch = generatePatch(resultImage);
		  }
		  return resultImage;
		};
		lib$1.decompressFrame = decompressFrame;
		var decompressFrames = function decompressFrames(parsedGif, buildImagePatches) {
		  return parsedGif.frames.filter(function (f) {
		    return f.image;
		  }).map(function (f) {
		    return decompressFrame(f, parsedGif.gct, buildImagePatches);
		  });
		};
		lib$1.decompressFrames = decompressFrames;
		return lib$1;
	}

	var libExports = requireLib();

	function commonjsRequire(path) {
		throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
	}

	var UPNG$1 = {exports: {}};

	var common = {};

	var hasRequiredCommon;
	function requireCommon () {
		if (hasRequiredCommon) return common;
		hasRequiredCommon = 1;
		(function (exports) {
			var TYPED_OK =  (typeof Uint8Array !== 'undefined') &&
			                (typeof Uint16Array !== 'undefined') &&
			                (typeof Int32Array !== 'undefined');
			function _has(obj, key) {
			  return Object.prototype.hasOwnProperty.call(obj, key);
			}
			exports.assign = function (obj ) {
			  var sources = Array.prototype.slice.call(arguments, 1);
			  while (sources.length) {
			    var source = sources.shift();
			    if (!source) { continue; }
			    if (typeof source !== 'object') {
			      throw new TypeError(source + 'must be non-object');
			    }
			    for (var p in source) {
			      if (_has(source, p)) {
			        obj[p] = source[p];
			      }
			    }
			  }
			  return obj;
			};
			exports.shrinkBuf = function (buf, size) {
			  if (buf.length === size) { return buf; }
			  if (buf.subarray) { return buf.subarray(0, size); }
			  buf.length = size;
			  return buf;
			};
			var fnTyped = {
			  arraySet: function (dest, src, src_offs, len, dest_offs) {
			    if (src.subarray && dest.subarray) {
			      dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
			      return;
			    }
			    for (var i = 0; i < len; i++) {
			      dest[dest_offs + i] = src[src_offs + i];
			    }
			  },
			  flattenChunks: function (chunks) {
			    var i, l, len, pos, chunk, result;
			    len = 0;
			    for (i = 0, l = chunks.length; i < l; i++) {
			      len += chunks[i].length;
			    }
			    result = new Uint8Array(len);
			    pos = 0;
			    for (i = 0, l = chunks.length; i < l; i++) {
			      chunk = chunks[i];
			      result.set(chunk, pos);
			      pos += chunk.length;
			    }
			    return result;
			  }
			};
			var fnUntyped = {
			  arraySet: function (dest, src, src_offs, len, dest_offs) {
			    for (var i = 0; i < len; i++) {
			      dest[dest_offs + i] = src[src_offs + i];
			    }
			  },
			  flattenChunks: function (chunks) {
			    return [].concat.apply([], chunks);
			  }
			};
			exports.setTyped = function (on) {
			  if (on) {
			    exports.Buf8  = Uint8Array;
			    exports.Buf16 = Uint16Array;
			    exports.Buf32 = Int32Array;
			    exports.assign(exports, fnTyped);
			  } else {
			    exports.Buf8  = Array;
			    exports.Buf16 = Array;
			    exports.Buf32 = Array;
			    exports.assign(exports, fnUntyped);
			  }
			};
			exports.setTyped(TYPED_OK);
		} (common));
		return common;
	}

	var deflate$1 = {};

	var deflate = {};

	var trees = {};

	var hasRequiredTrees;
	function requireTrees () {
		if (hasRequiredTrees) return trees;
		hasRequiredTrees = 1;
		var utils = requireCommon();
		var Z_FIXED               = 4;
		var Z_BINARY              = 0;
		var Z_TEXT                = 1;
		var Z_UNKNOWN             = 2;
		function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }
		var STORED_BLOCK = 0;
		var STATIC_TREES = 1;
		var DYN_TREES    = 2;
		var MIN_MATCH    = 3;
		var MAX_MATCH    = 258;
		var LENGTH_CODES  = 29;
		var LITERALS      = 256;
		var L_CODES       = LITERALS + 1 + LENGTH_CODES;
		var D_CODES       = 30;
		var BL_CODES      = 19;
		var HEAP_SIZE     = 2 * L_CODES + 1;
		var MAX_BITS      = 15;
		var Buf_size      = 16;
		var MAX_BL_BITS = 7;
		var END_BLOCK   = 256;
		var REP_3_6     = 16;
		var REPZ_3_10   = 17;
		var REPZ_11_138 = 18;
		var extra_lbits =
		  [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
		var extra_dbits =
		  [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
		var extra_blbits =
		  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];
		var bl_order =
		  [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
		var DIST_CODE_LEN = 512;
		var static_ltree  = new Array((L_CODES + 2) * 2);
		zero(static_ltree);
		var static_dtree  = new Array(D_CODES * 2);
		zero(static_dtree);
		var _dist_code    = new Array(DIST_CODE_LEN);
		zero(_dist_code);
		var _length_code  = new Array(MAX_MATCH - MIN_MATCH + 1);
		zero(_length_code);
		var base_length   = new Array(LENGTH_CODES);
		zero(base_length);
		var base_dist     = new Array(D_CODES);
		zero(base_dist);
		function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
		  this.static_tree  = static_tree;
		  this.extra_bits   = extra_bits;
		  this.extra_base   = extra_base;
		  this.elems        = elems;
		  this.max_length   = max_length;
		  this.has_stree    = static_tree && static_tree.length;
		}
		var static_l_desc;
		var static_d_desc;
		var static_bl_desc;
		function TreeDesc(dyn_tree, stat_desc) {
		  this.dyn_tree = dyn_tree;
		  this.max_code = 0;
		  this.stat_desc = stat_desc;
		}
		function d_code(dist) {
		  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
		}
		function put_short(s, w) {
		  s.pending_buf[s.pending++] = (w) & 0xff;
		  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
		}
		function send_bits(s, value, length) {
		  if (s.bi_valid > (Buf_size - length)) {
		    s.bi_buf |= (value << s.bi_valid) & 0xffff;
		    put_short(s, s.bi_buf);
		    s.bi_buf = value >> (Buf_size - s.bi_valid);
		    s.bi_valid += length - Buf_size;
		  } else {
		    s.bi_buf |= (value << s.bi_valid) & 0xffff;
		    s.bi_valid += length;
		  }
		}
		function send_code(s, c, tree) {
		  send_bits(s, tree[c * 2], tree[c * 2 + 1]);
		}
		function bi_reverse(code, len) {
		  var res = 0;
		  do {
		    res |= code & 1;
		    code >>>= 1;
		    res <<= 1;
		  } while (--len > 0);
		  return res >>> 1;
		}
		function bi_flush(s) {
		  if (s.bi_valid === 16) {
		    put_short(s, s.bi_buf);
		    s.bi_buf = 0;
		    s.bi_valid = 0;
		  } else if (s.bi_valid >= 8) {
		    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
		    s.bi_buf >>= 8;
		    s.bi_valid -= 8;
		  }
		}
		function gen_bitlen(s, desc)
		{
		  var tree            = desc.dyn_tree;
		  var max_code        = desc.max_code;
		  var stree           = desc.stat_desc.static_tree;
		  var has_stree       = desc.stat_desc.has_stree;
		  var extra           = desc.stat_desc.extra_bits;
		  var base            = desc.stat_desc.extra_base;
		  var max_length      = desc.stat_desc.max_length;
		  var h;
		  var n, m;
		  var bits;
		  var xbits;
		  var f;
		  var overflow = 0;
		  for (bits = 0; bits <= MAX_BITS; bits++) {
		    s.bl_count[bits] = 0;
		  }
		  tree[s.heap[s.heap_max] * 2 + 1] = 0;
		  for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
		    n = s.heap[h];
		    bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
		    if (bits > max_length) {
		      bits = max_length;
		      overflow++;
		    }
		    tree[n * 2 + 1] = bits;
		    if (n > max_code) { continue; }
		    s.bl_count[bits]++;
		    xbits = 0;
		    if (n >= base) {
		      xbits = extra[n - base];
		    }
		    f = tree[n * 2];
		    s.opt_len += f * (bits + xbits);
		    if (has_stree) {
		      s.static_len += f * (stree[n * 2 + 1] + xbits);
		    }
		  }
		  if (overflow === 0) { return; }
		  do {
		    bits = max_length - 1;
		    while (s.bl_count[bits] === 0) { bits--; }
		    s.bl_count[bits]--;
		    s.bl_count[bits + 1] += 2;
		    s.bl_count[max_length]--;
		    overflow -= 2;
		  } while (overflow > 0);
		  for (bits = max_length; bits !== 0; bits--) {
		    n = s.bl_count[bits];
		    while (n !== 0) {
		      m = s.heap[--h];
		      if (m > max_code) { continue; }
		      if (tree[m * 2 + 1] !== bits) {
		        s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
		        tree[m * 2 + 1] = bits;
		      }
		      n--;
		    }
		  }
		}
		function gen_codes(tree, max_code, bl_count)
		{
		  var next_code = new Array(MAX_BITS + 1);
		  var code = 0;
		  var bits;
		  var n;
		  for (bits = 1; bits <= MAX_BITS; bits++) {
		    next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
		  }
		  for (n = 0;  n <= max_code; n++) {
		    var len = tree[n * 2 + 1];
		    if (len === 0) { continue; }
		    tree[n * 2] = bi_reverse(next_code[len]++, len);
		  }
		}
		function tr_static_init() {
		  var n;
		  var bits;
		  var length;
		  var code;
		  var dist;
		  var bl_count = new Array(MAX_BITS + 1);
		  length = 0;
		  for (code = 0; code < LENGTH_CODES - 1; code++) {
		    base_length[code] = length;
		    for (n = 0; n < (1 << extra_lbits[code]); n++) {
		      _length_code[length++] = code;
		    }
		  }
		  _length_code[length - 1] = code;
		  dist = 0;
		  for (code = 0; code < 16; code++) {
		    base_dist[code] = dist;
		    for (n = 0; n < (1 << extra_dbits[code]); n++) {
		      _dist_code[dist++] = code;
		    }
		  }
		  dist >>= 7;
		  for (; code < D_CODES; code++) {
		    base_dist[code] = dist << 7;
		    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
		      _dist_code[256 + dist++] = code;
		    }
		  }
		  for (bits = 0; bits <= MAX_BITS; bits++) {
		    bl_count[bits] = 0;
		  }
		  n = 0;
		  while (n <= 143) {
		    static_ltree[n * 2 + 1] = 8;
		    n++;
		    bl_count[8]++;
		  }
		  while (n <= 255) {
		    static_ltree[n * 2 + 1] = 9;
		    n++;
		    bl_count[9]++;
		  }
		  while (n <= 279) {
		    static_ltree[n * 2 + 1] = 7;
		    n++;
		    bl_count[7]++;
		  }
		  while (n <= 287) {
		    static_ltree[n * 2 + 1] = 8;
		    n++;
		    bl_count[8]++;
		  }
		  gen_codes(static_ltree, L_CODES + 1, bl_count);
		  for (n = 0; n < D_CODES; n++) {
		    static_dtree[n * 2 + 1] = 5;
		    static_dtree[n * 2] = bi_reverse(n, 5);
		  }
		  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
		  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES, MAX_BITS);
		  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES, MAX_BL_BITS);
		}
		function init_block(s) {
		  var n;
		  for (n = 0; n < L_CODES;  n++) { s.dyn_ltree[n * 2] = 0; }
		  for (n = 0; n < D_CODES;  n++) { s.dyn_dtree[n * 2] = 0; }
		  for (n = 0; n < BL_CODES; n++) { s.bl_tree[n * 2] = 0; }
		  s.dyn_ltree[END_BLOCK * 2] = 1;
		  s.opt_len = s.static_len = 0;
		  s.last_lit = s.matches = 0;
		}
		function bi_windup(s)
		{
		  if (s.bi_valid > 8) {
		    put_short(s, s.bi_buf);
		  } else if (s.bi_valid > 0) {
		    s.pending_buf[s.pending++] = s.bi_buf;
		  }
		  s.bi_buf = 0;
		  s.bi_valid = 0;
		}
		function copy_block(s, buf, len, header)
		{
		  bi_windup(s);
		  {
		    put_short(s, len);
		    put_short(s, ~len);
		  }
		  utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
		  s.pending += len;
		}
		function smaller(tree, n, m, depth) {
		  var _n2 = n * 2;
		  var _m2 = m * 2;
		  return (tree[_n2] < tree[_m2] ||
		         (tree[_n2] === tree[_m2] && depth[n] <= depth[m]));
		}
		function pqdownheap(s, tree, k)
		{
		  var v = s.heap[k];
		  var j = k << 1;
		  while (j <= s.heap_len) {
		    if (j < s.heap_len &&
		      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
		      j++;
		    }
		    if (smaller(tree, v, s.heap[j], s.depth)) { break; }
		    s.heap[k] = s.heap[j];
		    k = j;
		    j <<= 1;
		  }
		  s.heap[k] = v;
		}
		function compress_block(s, ltree, dtree)
		{
		  var dist;
		  var lc;
		  var lx = 0;
		  var code;
		  var extra;
		  if (s.last_lit !== 0) {
		    do {
		      dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
		      lc = s.pending_buf[s.l_buf + lx];
		      lx++;
		      if (dist === 0) {
		        send_code(s, lc, ltree);
		      } else {
		        code = _length_code[lc];
		        send_code(s, code + LITERALS + 1, ltree);
		        extra = extra_lbits[code];
		        if (extra !== 0) {
		          lc -= base_length[code];
		          send_bits(s, lc, extra);
		        }
		        dist--;
		        code = d_code(dist);
		        send_code(s, code, dtree);
		        extra = extra_dbits[code];
		        if (extra !== 0) {
		          dist -= base_dist[code];
		          send_bits(s, dist, extra);
		        }
		      }
		    } while (lx < s.last_lit);
		  }
		  send_code(s, END_BLOCK, ltree);
		}
		function build_tree(s, desc)
		{
		  var tree     = desc.dyn_tree;
		  var stree    = desc.stat_desc.static_tree;
		  var has_stree = desc.stat_desc.has_stree;
		  var elems    = desc.stat_desc.elems;
		  var n, m;
		  var max_code = -1;
		  var node;
		  s.heap_len = 0;
		  s.heap_max = HEAP_SIZE;
		  for (n = 0; n < elems; n++) {
		    if (tree[n * 2] !== 0) {
		      s.heap[++s.heap_len] = max_code = n;
		      s.depth[n] = 0;
		    } else {
		      tree[n * 2 + 1] = 0;
		    }
		  }
		  while (s.heap_len < 2) {
		    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
		    tree[node * 2] = 1;
		    s.depth[node] = 0;
		    s.opt_len--;
		    if (has_stree) {
		      s.static_len -= stree[node * 2 + 1];
		    }
		  }
		  desc.max_code = max_code;
		  for (n = (s.heap_len >> 1); n >= 1; n--) { pqdownheap(s, tree, n); }
		  node = elems;
		  do {
		    n = s.heap[1];
		    s.heap[1] = s.heap[s.heap_len--];
		    pqdownheap(s, tree, 1);
		    m = s.heap[1];
		    s.heap[--s.heap_max] = n;
		    s.heap[--s.heap_max] = m;
		    tree[node * 2] = tree[n * 2] + tree[m * 2];
		    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
		    tree[n * 2 + 1] = tree[m * 2 + 1] = node;
		    s.heap[1] = node++;
		    pqdownheap(s, tree, 1);
		  } while (s.heap_len >= 2);
		  s.heap[--s.heap_max] = s.heap[1];
		  gen_bitlen(s, desc);
		  gen_codes(tree, max_code, s.bl_count);
		}
		function scan_tree(s, tree, max_code)
		{
		  var n;
		  var prevlen = -1;
		  var curlen;
		  var nextlen = tree[0 * 2 + 1];
		  var count = 0;
		  var max_count = 7;
		  var min_count = 4;
		  if (nextlen === 0) {
		    max_count = 138;
		    min_count = 3;
		  }
		  tree[(max_code + 1) * 2 + 1] = 0xffff;
		  for (n = 0; n <= max_code; n++) {
		    curlen = nextlen;
		    nextlen = tree[(n + 1) * 2 + 1];
		    if (++count < max_count && curlen === nextlen) {
		      continue;
		    } else if (count < min_count) {
		      s.bl_tree[curlen * 2] += count;
		    } else if (curlen !== 0) {
		      if (curlen !== prevlen) { s.bl_tree[curlen * 2]++; }
		      s.bl_tree[REP_3_6 * 2]++;
		    } else if (count <= 10) {
		      s.bl_tree[REPZ_3_10 * 2]++;
		    } else {
		      s.bl_tree[REPZ_11_138 * 2]++;
		    }
		    count = 0;
		    prevlen = curlen;
		    if (nextlen === 0) {
		      max_count = 138;
		      min_count = 3;
		    } else if (curlen === nextlen) {
		      max_count = 6;
		      min_count = 3;
		    } else {
		      max_count = 7;
		      min_count = 4;
		    }
		  }
		}
		function send_tree(s, tree, max_code)
		{
		  var n;
		  var prevlen = -1;
		  var curlen;
		  var nextlen = tree[0 * 2 + 1];
		  var count = 0;
		  var max_count = 7;
		  var min_count = 4;
		  if (nextlen === 0) {
		    max_count = 138;
		    min_count = 3;
		  }
		  for (n = 0; n <= max_code; n++) {
		    curlen = nextlen;
		    nextlen = tree[(n + 1) * 2 + 1];
		    if (++count < max_count && curlen === nextlen) {
		      continue;
		    } else if (count < min_count) {
		      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);
		    } else if (curlen !== 0) {
		      if (curlen !== prevlen) {
		        send_code(s, curlen, s.bl_tree);
		        count--;
		      }
		      send_code(s, REP_3_6, s.bl_tree);
		      send_bits(s, count - 3, 2);
		    } else if (count <= 10) {
		      send_code(s, REPZ_3_10, s.bl_tree);
		      send_bits(s, count - 3, 3);
		    } else {
		      send_code(s, REPZ_11_138, s.bl_tree);
		      send_bits(s, count - 11, 7);
		    }
		    count = 0;
		    prevlen = curlen;
		    if (nextlen === 0) {
		      max_count = 138;
		      min_count = 3;
		    } else if (curlen === nextlen) {
		      max_count = 6;
		      min_count = 3;
		    } else {
		      max_count = 7;
		      min_count = 4;
		    }
		  }
		}
		function build_bl_tree(s) {
		  var max_blindex;
		  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
		  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
		  build_tree(s, s.bl_desc);
		  for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
		    if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
		      break;
		    }
		  }
		  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
		  return max_blindex;
		}
		function send_all_trees(s, lcodes, dcodes, blcodes)
		{
		  var rank;
		  send_bits(s, lcodes - 257, 5);
		  send_bits(s, dcodes - 1,   5);
		  send_bits(s, blcodes - 4,  4);
		  for (rank = 0; rank < blcodes; rank++) {
		    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
		  }
		  send_tree(s, s.dyn_ltree, lcodes - 1);
		  send_tree(s, s.dyn_dtree, dcodes - 1);
		}
		function detect_data_type(s) {
		  var black_mask = 0xf3ffc07f;
		  var n;
		  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
		    if ((black_mask & 1) && (s.dyn_ltree[n * 2] !== 0)) {
		      return Z_BINARY;
		    }
		  }
		  if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 ||
		      s.dyn_ltree[13 * 2] !== 0) {
		    return Z_TEXT;
		  }
		  for (n = 32; n < LITERALS; n++) {
		    if (s.dyn_ltree[n * 2] !== 0) {
		      return Z_TEXT;
		    }
		  }
		  return Z_BINARY;
		}
		var static_init_done = false;
		function _tr_init(s)
		{
		  if (!static_init_done) {
		    tr_static_init();
		    static_init_done = true;
		  }
		  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
		  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
		  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
		  s.bi_buf = 0;
		  s.bi_valid = 0;
		  init_block(s);
		}
		function _tr_stored_block(s, buf, stored_len, last)
		{
		  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
		  copy_block(s, buf, stored_len);
		}
		function _tr_align(s) {
		  send_bits(s, STATIC_TREES << 1, 3);
		  send_code(s, END_BLOCK, static_ltree);
		  bi_flush(s);
		}
		function _tr_flush_block(s, buf, stored_len, last)
		{
		  var opt_lenb, static_lenb;
		  var max_blindex = 0;
		  if (s.level > 0) {
		    if (s.strm.data_type === Z_UNKNOWN) {
		      s.strm.data_type = detect_data_type(s);
		    }
		    build_tree(s, s.l_desc);
		    build_tree(s, s.d_desc);
		    max_blindex = build_bl_tree(s);
		    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
		    static_lenb = (s.static_len + 3 + 7) >>> 3;
		    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }
		  } else {
		    opt_lenb = static_lenb = stored_len + 5;
		  }
		  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
		    _tr_stored_block(s, buf, stored_len, last);
		  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
		    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
		    compress_block(s, static_ltree, static_dtree);
		  } else {
		    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
		    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
		    compress_block(s, s.dyn_ltree, s.dyn_dtree);
		  }
		  init_block(s);
		  if (last) {
		    bi_windup(s);
		  }
		}
		function _tr_tally(s, dist, lc)
		{
		  s.pending_buf[s.d_buf + s.last_lit * 2]     = (dist >>> 8) & 0xff;
		  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;
		  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
		  s.last_lit++;
		  if (dist === 0) {
		    s.dyn_ltree[lc * 2]++;
		  } else {
		    s.matches++;
		    dist--;
		    s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
		    s.dyn_dtree[d_code(dist) * 2]++;
		  }
		  return (s.last_lit === s.lit_bufsize - 1);
		}
		trees._tr_init  = _tr_init;
		trees._tr_stored_block = _tr_stored_block;
		trees._tr_flush_block  = _tr_flush_block;
		trees._tr_tally = _tr_tally;
		trees._tr_align = _tr_align;
		return trees;
	}

	var adler32_1;
	var hasRequiredAdler32;
	function requireAdler32 () {
		if (hasRequiredAdler32) return adler32_1;
		hasRequiredAdler32 = 1;
		function adler32(adler, buf, len, pos) {
		  var s1 = (adler & 0xffff) |0,
		      s2 = ((adler >>> 16) & 0xffff) |0,
		      n = 0;
		  while (len !== 0) {
		    n = len > 2000 ? 2000 : len;
		    len -= n;
		    do {
		      s1 = (s1 + buf[pos++]) |0;
		      s2 = (s2 + s1) |0;
		    } while (--n);
		    s1 %= 65521;
		    s2 %= 65521;
		  }
		  return (s1 | (s2 << 16)) |0;
		}
		adler32_1 = adler32;
		return adler32_1;
	}

	var crc32_1;
	var hasRequiredCrc32;
	function requireCrc32 () {
		if (hasRequiredCrc32) return crc32_1;
		hasRequiredCrc32 = 1;
		function makeTable() {
		  var c, table = [];
		  for (var n = 0; n < 256; n++) {
		    c = n;
		    for (var k = 0; k < 8; k++) {
		      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
		    }
		    table[n] = c;
		  }
		  return table;
		}
		var crcTable = makeTable();
		function crc32(crc, buf, len, pos) {
		  var t = crcTable,
		      end = pos + len;
		  crc ^= -1;
		  for (var i = pos; i < end; i++) {
		    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
		  }
		  return (crc ^ (-1));
		}
		crc32_1 = crc32;
		return crc32_1;
	}

	var messages;
	var hasRequiredMessages;
	function requireMessages () {
		if (hasRequiredMessages) return messages;
		hasRequiredMessages = 1;
		messages = {
		  2:      'need dictionary',
		  1:      'stream end',
		  0:      '',
		  '-1':   'file error',
		  '-2':   'stream error',
		  '-3':   'data error',
		  '-4':   'insufficient memory',
		  '-5':   'buffer error',
		  '-6':   'incompatible version'
		};
		return messages;
	}

	var hasRequiredDeflate$1;
	function requireDeflate$1 () {
		if (hasRequiredDeflate$1) return deflate;
		hasRequiredDeflate$1 = 1;
		var utils   = requireCommon();
		var trees   = requireTrees();
		var adler32 = requireAdler32();
		var crc32   = requireCrc32();
		var msg     = requireMessages();
		var Z_NO_FLUSH      = 0;
		var Z_PARTIAL_FLUSH = 1;
		var Z_FULL_FLUSH    = 3;
		var Z_FINISH        = 4;
		var Z_BLOCK         = 5;
		var Z_OK            = 0;
		var Z_STREAM_END    = 1;
		var Z_STREAM_ERROR  = -2;
		var Z_DATA_ERROR    = -3;
		var Z_BUF_ERROR     = -5;
		var Z_DEFAULT_COMPRESSION = -1;
		var Z_FILTERED            = 1;
		var Z_HUFFMAN_ONLY        = 2;
		var Z_RLE                 = 3;
		var Z_FIXED               = 4;
		var Z_DEFAULT_STRATEGY    = 0;
		var Z_UNKNOWN             = 2;
		var Z_DEFLATED  = 8;
		var MAX_MEM_LEVEL = 9;
		var MAX_WBITS = 15;
		var DEF_MEM_LEVEL = 8;
		var LENGTH_CODES  = 29;
		var LITERALS      = 256;
		var L_CODES       = LITERALS + 1 + LENGTH_CODES;
		var D_CODES       = 30;
		var BL_CODES      = 19;
		var HEAP_SIZE     = 2 * L_CODES + 1;
		var MAX_BITS  = 15;
		var MIN_MATCH = 3;
		var MAX_MATCH = 258;
		var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);
		var PRESET_DICT = 0x20;
		var INIT_STATE = 42;
		var EXTRA_STATE = 69;
		var NAME_STATE = 73;
		var COMMENT_STATE = 91;
		var HCRC_STATE = 103;
		var BUSY_STATE = 113;
		var FINISH_STATE = 666;
		var BS_NEED_MORE      = 1;
		var BS_BLOCK_DONE     = 2;
		var BS_FINISH_STARTED = 3;
		var BS_FINISH_DONE    = 4;
		var OS_CODE = 0x03;
		function err(strm, errorCode) {
		  strm.msg = msg[errorCode];
		  return errorCode;
		}
		function rank(f) {
		  return ((f) << 1) - ((f) > 4 ? 9 : 0);
		}
		function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }
		function flush_pending(strm) {
		  var s = strm.state;
		  var len = s.pending;
		  if (len > strm.avail_out) {
		    len = strm.avail_out;
		  }
		  if (len === 0) { return; }
		  utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
		  strm.next_out += len;
		  s.pending_out += len;
		  strm.total_out += len;
		  strm.avail_out -= len;
		  s.pending -= len;
		  if (s.pending === 0) {
		    s.pending_out = 0;
		  }
		}
		function flush_block_only(s, last) {
		  trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
		  s.block_start = s.strstart;
		  flush_pending(s.strm);
		}
		function put_byte(s, b) {
		  s.pending_buf[s.pending++] = b;
		}
		function putShortMSB(s, b) {
		  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
		  s.pending_buf[s.pending++] = b & 0xff;
		}
		function read_buf(strm, buf, start, size) {
		  var len = strm.avail_in;
		  if (len > size) { len = size; }
		  if (len === 0) { return 0; }
		  strm.avail_in -= len;
		  utils.arraySet(buf, strm.input, strm.next_in, len, start);
		  if (strm.state.wrap === 1) {
		    strm.adler = adler32(strm.adler, buf, len, start);
		  }
		  else if (strm.state.wrap === 2) {
		    strm.adler = crc32(strm.adler, buf, len, start);
		  }
		  strm.next_in += len;
		  strm.total_in += len;
		  return len;
		}
		function longest_match(s, cur_match) {
		  var chain_length = s.max_chain_length;
		  var scan = s.strstart;
		  var match;
		  var len;
		  var best_len = s.prev_length;
		  var nice_match = s.nice_match;
		  var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
		      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
		  var _win = s.window;
		  var wmask = s.w_mask;
		  var prev  = s.prev;
		  var strend = s.strstart + MAX_MATCH;
		  var scan_end1  = _win[scan + best_len - 1];
		  var scan_end   = _win[scan + best_len];
		  if (s.prev_length >= s.good_match) {
		    chain_length >>= 2;
		  }
		  if (nice_match > s.lookahead) { nice_match = s.lookahead; }
		  do {
		    match = cur_match;
		    if (_win[match + best_len]     !== scan_end  ||
		        _win[match + best_len - 1] !== scan_end1 ||
		        _win[match]                !== _win[scan] ||
		        _win[++match]              !== _win[scan + 1]) {
		      continue;
		    }
		    scan += 2;
		    match++;
		    do {
		    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
		             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
		             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
		             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
		             scan < strend);
		    len = MAX_MATCH - (strend - scan);
		    scan = strend - MAX_MATCH;
		    if (len > best_len) {
		      s.match_start = cur_match;
		      best_len = len;
		      if (len >= nice_match) {
		        break;
		      }
		      scan_end1  = _win[scan + best_len - 1];
		      scan_end   = _win[scan + best_len];
		    }
		  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
		  if (best_len <= s.lookahead) {
		    return best_len;
		  }
		  return s.lookahead;
		}
		function fill_window(s) {
		  var _w_size = s.w_size;
		  var p, n, m, more, str;
		  do {
		    more = s.window_size - s.lookahead - s.strstart;
		    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
		      utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
		      s.match_start -= _w_size;
		      s.strstart -= _w_size;
		      s.block_start -= _w_size;
		      n = s.hash_size;
		      p = n;
		      do {
		        m = s.head[--p];
		        s.head[p] = (m >= _w_size ? m - _w_size : 0);
		      } while (--n);
		      n = _w_size;
		      p = n;
		      do {
		        m = s.prev[--p];
		        s.prev[p] = (m >= _w_size ? m - _w_size : 0);
		      } while (--n);
		      more += _w_size;
		    }
		    if (s.strm.avail_in === 0) {
		      break;
		    }
		    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
		    s.lookahead += n;
		    if (s.lookahead + s.insert >= MIN_MATCH) {
		      str = s.strstart - s.insert;
		      s.ins_h = s.window[str];
		      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
		      while (s.insert) {
		        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
		        s.prev[str & s.w_mask] = s.head[s.ins_h];
		        s.head[s.ins_h] = str;
		        str++;
		        s.insert--;
		        if (s.lookahead + s.insert < MIN_MATCH) {
		          break;
		        }
		      }
		    }
		  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
		}
		function deflate_stored(s, flush) {
		  var max_block_size = 0xffff;
		  if (max_block_size > s.pending_buf_size - 5) {
		    max_block_size = s.pending_buf_size - 5;
		  }
		  for (;;) {
		    if (s.lookahead <= 1) {
		      fill_window(s);
		      if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
		        return BS_NEED_MORE;
		      }
		      if (s.lookahead === 0) {
		        break;
		      }
		    }
		    s.strstart += s.lookahead;
		    s.lookahead = 0;
		    var max_start = s.block_start + max_block_size;
		    if (s.strstart === 0 || s.strstart >= max_start) {
		      s.lookahead = s.strstart - max_start;
		      s.strstart = max_start;
		      flush_block_only(s, false);
		      if (s.strm.avail_out === 0) {
		        return BS_NEED_MORE;
		      }
		    }
		    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
		      flush_block_only(s, false);
		      if (s.strm.avail_out === 0) {
		        return BS_NEED_MORE;
		      }
		    }
		  }
		  s.insert = 0;
		  if (flush === Z_FINISH) {
		    flush_block_only(s, true);
		    if (s.strm.avail_out === 0) {
		      return BS_FINISH_STARTED;
		    }
		    return BS_FINISH_DONE;
		  }
		  if (s.strstart > s.block_start) {
		    flush_block_only(s, false);
		    if (s.strm.avail_out === 0) {
		      return BS_NEED_MORE;
		    }
		  }
		  return BS_NEED_MORE;
		}
		function deflate_fast(s, flush) {
		  var hash_head;
		  var bflush;
		  for (;;) {
		    if (s.lookahead < MIN_LOOKAHEAD) {
		      fill_window(s);
		      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
		        return BS_NEED_MORE;
		      }
		      if (s.lookahead === 0) {
		        break;
		      }
		    }
		    hash_head = 0;
		    if (s.lookahead >= MIN_MATCH) {
		      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
		      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
		      s.head[s.ins_h] = s.strstart;
		    }
		    if (hash_head !== 0 && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
		      s.match_length = longest_match(s, hash_head);
		    }
		    if (s.match_length >= MIN_MATCH) {
		      bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
		      s.lookahead -= s.match_length;
		      if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
		        s.match_length--;
		        do {
		          s.strstart++;
		          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
		          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
		          s.head[s.ins_h] = s.strstart;
		        } while (--s.match_length !== 0);
		        s.strstart++;
		      } else
		      {
		        s.strstart += s.match_length;
		        s.match_length = 0;
		        s.ins_h = s.window[s.strstart];
		        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;
		      }
		    } else {
		      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
		      s.lookahead--;
		      s.strstart++;
		    }
		    if (bflush) {
		      flush_block_only(s, false);
		      if (s.strm.avail_out === 0) {
		        return BS_NEED_MORE;
		      }
		    }
		  }
		  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
		  if (flush === Z_FINISH) {
		    flush_block_only(s, true);
		    if (s.strm.avail_out === 0) {
		      return BS_FINISH_STARTED;
		    }
		    return BS_FINISH_DONE;
		  }
		  if (s.last_lit) {
		    flush_block_only(s, false);
		    if (s.strm.avail_out === 0) {
		      return BS_NEED_MORE;
		    }
		  }
		  return BS_BLOCK_DONE;
		}
		function deflate_slow(s, flush) {
		  var hash_head;
		  var bflush;
		  var max_insert;
		  for (;;) {
		    if (s.lookahead < MIN_LOOKAHEAD) {
		      fill_window(s);
		      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
		        return BS_NEED_MORE;
		      }
		      if (s.lookahead === 0) { break; }
		    }
		    hash_head = 0;
		    if (s.lookahead >= MIN_MATCH) {
		      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
		      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
		      s.head[s.ins_h] = s.strstart;
		    }
		    s.prev_length = s.match_length;
		    s.prev_match = s.match_start;
		    s.match_length = MIN_MATCH - 1;
		    if (hash_head !== 0 && s.prev_length < s.max_lazy_match &&
		        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)) {
		      s.match_length = longest_match(s, hash_head);
		      if (s.match_length <= 5 &&
		         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096))) {
		        s.match_length = MIN_MATCH - 1;
		      }
		    }
		    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
		      max_insert = s.strstart + s.lookahead - MIN_MATCH;
		      bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
		      s.lookahead -= s.prev_length - 1;
		      s.prev_length -= 2;
		      do {
		        if (++s.strstart <= max_insert) {
		          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
		          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
		          s.head[s.ins_h] = s.strstart;
		        }
		      } while (--s.prev_length !== 0);
		      s.match_available = 0;
		      s.match_length = MIN_MATCH - 1;
		      s.strstart++;
		      if (bflush) {
		        flush_block_only(s, false);
		        if (s.strm.avail_out === 0) {
		          return BS_NEED_MORE;
		        }
		      }
		    } else if (s.match_available) {
		      bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
		      if (bflush) {
		        flush_block_only(s, false);
		      }
		      s.strstart++;
		      s.lookahead--;
		      if (s.strm.avail_out === 0) {
		        return BS_NEED_MORE;
		      }
		    } else {
		      s.match_available = 1;
		      s.strstart++;
		      s.lookahead--;
		    }
		  }
		  if (s.match_available) {
		    bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
		    s.match_available = 0;
		  }
		  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
		  if (flush === Z_FINISH) {
		    flush_block_only(s, true);
		    if (s.strm.avail_out === 0) {
		      return BS_FINISH_STARTED;
		    }
		    return BS_FINISH_DONE;
		  }
		  if (s.last_lit) {
		    flush_block_only(s, false);
		    if (s.strm.avail_out === 0) {
		      return BS_NEED_MORE;
		    }
		  }
		  return BS_BLOCK_DONE;
		}
		function deflate_rle(s, flush) {
		  var bflush;
		  var prev;
		  var scan, strend;
		  var _win = s.window;
		  for (;;) {
		    if (s.lookahead <= MAX_MATCH) {
		      fill_window(s);
		      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
		        return BS_NEED_MORE;
		      }
		      if (s.lookahead === 0) { break; }
		    }
		    s.match_length = 0;
		    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
		      scan = s.strstart - 1;
		      prev = _win[scan];
		      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
		        strend = s.strstart + MAX_MATCH;
		        do {
		        } while (prev === _win[++scan] && prev === _win[++scan] &&
		                 prev === _win[++scan] && prev === _win[++scan] &&
		                 prev === _win[++scan] && prev === _win[++scan] &&
		                 prev === _win[++scan] && prev === _win[++scan] &&
		                 scan < strend);
		        s.match_length = MAX_MATCH - (strend - scan);
		        if (s.match_length > s.lookahead) {
		          s.match_length = s.lookahead;
		        }
		      }
		    }
		    if (s.match_length >= MIN_MATCH) {
		      bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
		      s.lookahead -= s.match_length;
		      s.strstart += s.match_length;
		      s.match_length = 0;
		    } else {
		      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
		      s.lookahead--;
		      s.strstart++;
		    }
		    if (bflush) {
		      flush_block_only(s, false);
		      if (s.strm.avail_out === 0) {
		        return BS_NEED_MORE;
		      }
		    }
		  }
		  s.insert = 0;
		  if (flush === Z_FINISH) {
		    flush_block_only(s, true);
		    if (s.strm.avail_out === 0) {
		      return BS_FINISH_STARTED;
		    }
		    return BS_FINISH_DONE;
		  }
		  if (s.last_lit) {
		    flush_block_only(s, false);
		    if (s.strm.avail_out === 0) {
		      return BS_NEED_MORE;
		    }
		  }
		  return BS_BLOCK_DONE;
		}
		function deflate_huff(s, flush) {
		  var bflush;
		  for (;;) {
		    if (s.lookahead === 0) {
		      fill_window(s);
		      if (s.lookahead === 0) {
		        if (flush === Z_NO_FLUSH) {
		          return BS_NEED_MORE;
		        }
		        break;
		      }
		    }
		    s.match_length = 0;
		    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
		    s.lookahead--;
		    s.strstart++;
		    if (bflush) {
		      flush_block_only(s, false);
		      if (s.strm.avail_out === 0) {
		        return BS_NEED_MORE;
		      }
		    }
		  }
		  s.insert = 0;
		  if (flush === Z_FINISH) {
		    flush_block_only(s, true);
		    if (s.strm.avail_out === 0) {
		      return BS_FINISH_STARTED;
		    }
		    return BS_FINISH_DONE;
		  }
		  if (s.last_lit) {
		    flush_block_only(s, false);
		    if (s.strm.avail_out === 0) {
		      return BS_NEED_MORE;
		    }
		  }
		  return BS_BLOCK_DONE;
		}
		function Config(good_length, max_lazy, nice_length, max_chain, func) {
		  this.good_length = good_length;
		  this.max_lazy = max_lazy;
		  this.nice_length = nice_length;
		  this.max_chain = max_chain;
		  this.func = func;
		}
		var configuration_table;
		configuration_table = [
		  new Config(0, 0, 0, 0, deflate_stored),
		  new Config(4, 4, 8, 4, deflate_fast),
		  new Config(4, 5, 16, 8, deflate_fast),
		  new Config(4, 6, 32, 32, deflate_fast),
		  new Config(4, 4, 16, 16, deflate_slow),
		  new Config(8, 16, 32, 32, deflate_slow),
		  new Config(8, 16, 128, 128, deflate_slow),
		  new Config(8, 32, 128, 256, deflate_slow),
		  new Config(32, 128, 258, 1024, deflate_slow),
		  new Config(32, 258, 258, 4096, deflate_slow)
		];
		function lm_init(s) {
		  s.window_size = 2 * s.w_size;
		  zero(s.head);
		  s.max_lazy_match = configuration_table[s.level].max_lazy;
		  s.good_match = configuration_table[s.level].good_length;
		  s.nice_match = configuration_table[s.level].nice_length;
		  s.max_chain_length = configuration_table[s.level].max_chain;
		  s.strstart = 0;
		  s.block_start = 0;
		  s.lookahead = 0;
		  s.insert = 0;
		  s.match_length = s.prev_length = MIN_MATCH - 1;
		  s.match_available = 0;
		  s.ins_h = 0;
		}
		function DeflateState() {
		  this.strm = null;
		  this.status = 0;
		  this.pending_buf = null;
		  this.pending_buf_size = 0;
		  this.pending_out = 0;
		  this.pending = 0;
		  this.wrap = 0;
		  this.gzhead = null;
		  this.gzindex = 0;
		  this.method = Z_DEFLATED;
		  this.last_flush = -1;
		  this.w_size = 0;
		  this.w_bits = 0;
		  this.w_mask = 0;
		  this.window = null;
		  this.window_size = 0;
		  this.prev = null;
		  this.head = null;
		  this.ins_h = 0;
		  this.hash_size = 0;
		  this.hash_bits = 0;
		  this.hash_mask = 0;
		  this.hash_shift = 0;
		  this.block_start = 0;
		  this.match_length = 0;
		  this.prev_match = 0;
		  this.match_available = 0;
		  this.strstart = 0;
		  this.match_start = 0;
		  this.lookahead = 0;
		  this.prev_length = 0;
		  this.max_chain_length = 0;
		  this.max_lazy_match = 0;
		  this.level = 0;
		  this.strategy = 0;
		  this.good_match = 0;
		  this.nice_match = 0;
		  this.dyn_ltree  = new utils.Buf16(HEAP_SIZE * 2);
		  this.dyn_dtree  = new utils.Buf16((2 * D_CODES + 1) * 2);
		  this.bl_tree    = new utils.Buf16((2 * BL_CODES + 1) * 2);
		  zero(this.dyn_ltree);
		  zero(this.dyn_dtree);
		  zero(this.bl_tree);
		  this.l_desc   = null;
		  this.d_desc   = null;
		  this.bl_desc  = null;
		  this.bl_count = new utils.Buf16(MAX_BITS + 1);
		  this.heap = new utils.Buf16(2 * L_CODES + 1);
		  zero(this.heap);
		  this.heap_len = 0;
		  this.heap_max = 0;
		  this.depth = new utils.Buf16(2 * L_CODES + 1);
		  zero(this.depth);
		  this.l_buf = 0;
		  this.lit_bufsize = 0;
		  this.last_lit = 0;
		  this.d_buf = 0;
		  this.opt_len = 0;
		  this.static_len = 0;
		  this.matches = 0;
		  this.insert = 0;
		  this.bi_buf = 0;
		  this.bi_valid = 0;
		}
		function deflateResetKeep(strm) {
		  var s;
		  if (!strm || !strm.state) {
		    return err(strm, Z_STREAM_ERROR);
		  }
		  strm.total_in = strm.total_out = 0;
		  strm.data_type = Z_UNKNOWN;
		  s = strm.state;
		  s.pending = 0;
		  s.pending_out = 0;
		  if (s.wrap < 0) {
		    s.wrap = -s.wrap;
		  }
		  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
		  strm.adler = (s.wrap === 2) ?
		    0
		  :
		    1;
		  s.last_flush = Z_NO_FLUSH;
		  trees._tr_init(s);
		  return Z_OK;
		}
		function deflateReset(strm) {
		  var ret = deflateResetKeep(strm);
		  if (ret === Z_OK) {
		    lm_init(strm.state);
		  }
		  return ret;
		}
		function deflateSetHeader(strm, head) {
		  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
		  if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }
		  strm.state.gzhead = head;
		  return Z_OK;
		}
		function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
		  if (!strm) {
		    return Z_STREAM_ERROR;
		  }
		  var wrap = 1;
		  if (level === Z_DEFAULT_COMPRESSION) {
		    level = 6;
		  }
		  if (windowBits < 0) {
		    wrap = 0;
		    windowBits = -windowBits;
		  }
		  else if (windowBits > 15) {
		    wrap = 2;
		    windowBits -= 16;
		  }
		  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
		    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
		    strategy < 0 || strategy > Z_FIXED) {
		    return err(strm, Z_STREAM_ERROR);
		  }
		  if (windowBits === 8) {
		    windowBits = 9;
		  }
		  var s = new DeflateState();
		  strm.state = s;
		  s.strm = strm;
		  s.wrap = wrap;
		  s.gzhead = null;
		  s.w_bits = windowBits;
		  s.w_size = 1 << s.w_bits;
		  s.w_mask = s.w_size - 1;
		  s.hash_bits = memLevel + 7;
		  s.hash_size = 1 << s.hash_bits;
		  s.hash_mask = s.hash_size - 1;
		  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
		  s.window = new utils.Buf8(s.w_size * 2);
		  s.head = new utils.Buf16(s.hash_size);
		  s.prev = new utils.Buf16(s.w_size);
		  s.lit_bufsize = 1 << (memLevel + 6);
		  s.pending_buf_size = s.lit_bufsize * 4;
		  s.pending_buf = new utils.Buf8(s.pending_buf_size);
		  s.d_buf = 1 * s.lit_bufsize;
		  s.l_buf = (1 + 2) * s.lit_bufsize;
		  s.level = level;
		  s.strategy = strategy;
		  s.method = method;
		  return deflateReset(strm);
		}
		function deflateInit(strm, level) {
		  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
		}
		function deflate$1(strm, flush) {
		  var old_flush, s;
		  var beg, val;
		  if (!strm || !strm.state ||
		    flush > Z_BLOCK || flush < 0) {
		    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
		  }
		  s = strm.state;
		  if (!strm.output ||
		      (!strm.input && strm.avail_in !== 0) ||
		      (s.status === FINISH_STATE && flush !== Z_FINISH)) {
		    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
		  }
		  s.strm = strm;
		  old_flush = s.last_flush;
		  s.last_flush = flush;
		  if (s.status === INIT_STATE) {
		    if (s.wrap === 2) {
		      strm.adler = 0;
		      put_byte(s, 31);
		      put_byte(s, 139);
		      put_byte(s, 8);
		      if (!s.gzhead) {
		        put_byte(s, 0);
		        put_byte(s, 0);
		        put_byte(s, 0);
		        put_byte(s, 0);
		        put_byte(s, 0);
		        put_byte(s, s.level === 9 ? 2 :
		                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
		                     4 : 0));
		        put_byte(s, OS_CODE);
		        s.status = BUSY_STATE;
		      }
		      else {
		        put_byte(s, (s.gzhead.text ? 1 : 0) +
		                    (s.gzhead.hcrc ? 2 : 0) +
		                    (!s.gzhead.extra ? 0 : 4) +
		                    (!s.gzhead.name ? 0 : 8) +
		                    (!s.gzhead.comment ? 0 : 16)
		        );
		        put_byte(s, s.gzhead.time & 0xff);
		        put_byte(s, (s.gzhead.time >> 8) & 0xff);
		        put_byte(s, (s.gzhead.time >> 16) & 0xff);
		        put_byte(s, (s.gzhead.time >> 24) & 0xff);
		        put_byte(s, s.level === 9 ? 2 :
		                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
		                     4 : 0));
		        put_byte(s, s.gzhead.os & 0xff);
		        if (s.gzhead.extra && s.gzhead.extra.length) {
		          put_byte(s, s.gzhead.extra.length & 0xff);
		          put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
		        }
		        if (s.gzhead.hcrc) {
		          strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
		        }
		        s.gzindex = 0;
		        s.status = EXTRA_STATE;
		      }
		    }
		    else
		    {
		      var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
		      var level_flags = -1;
		      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
		        level_flags = 0;
		      } else if (s.level < 6) {
		        level_flags = 1;
		      } else if (s.level === 6) {
		        level_flags = 2;
		      } else {
		        level_flags = 3;
		      }
		      header |= (level_flags << 6);
		      if (s.strstart !== 0) { header |= PRESET_DICT; }
		      header += 31 - (header % 31);
		      s.status = BUSY_STATE;
		      putShortMSB(s, header);
		      if (s.strstart !== 0) {
		        putShortMSB(s, strm.adler >>> 16);
		        putShortMSB(s, strm.adler & 0xffff);
		      }
		      strm.adler = 1;
		    }
		  }
		  if (s.status === EXTRA_STATE) {
		    if (s.gzhead.extra) {
		      beg = s.pending;
		      while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
		        if (s.pending === s.pending_buf_size) {
		          if (s.gzhead.hcrc && s.pending > beg) {
		            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
		          }
		          flush_pending(strm);
		          beg = s.pending;
		          if (s.pending === s.pending_buf_size) {
		            break;
		          }
		        }
		        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
		        s.gzindex++;
		      }
		      if (s.gzhead.hcrc && s.pending > beg) {
		        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
		      }
		      if (s.gzindex === s.gzhead.extra.length) {
		        s.gzindex = 0;
		        s.status = NAME_STATE;
		      }
		    }
		    else {
		      s.status = NAME_STATE;
		    }
		  }
		  if (s.status === NAME_STATE) {
		    if (s.gzhead.name) {
		      beg = s.pending;
		      do {
		        if (s.pending === s.pending_buf_size) {
		          if (s.gzhead.hcrc && s.pending > beg) {
		            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
		          }
		          flush_pending(strm);
		          beg = s.pending;
		          if (s.pending === s.pending_buf_size) {
		            val = 1;
		            break;
		          }
		        }
		        if (s.gzindex < s.gzhead.name.length) {
		          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
		        } else {
		          val = 0;
		        }
		        put_byte(s, val);
		      } while (val !== 0);
		      if (s.gzhead.hcrc && s.pending > beg) {
		        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
		      }
		      if (val === 0) {
		        s.gzindex = 0;
		        s.status = COMMENT_STATE;
		      }
		    }
		    else {
		      s.status = COMMENT_STATE;
		    }
		  }
		  if (s.status === COMMENT_STATE) {
		    if (s.gzhead.comment) {
		      beg = s.pending;
		      do {
		        if (s.pending === s.pending_buf_size) {
		          if (s.gzhead.hcrc && s.pending > beg) {
		            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
		          }
		          flush_pending(strm);
		          beg = s.pending;
		          if (s.pending === s.pending_buf_size) {
		            val = 1;
		            break;
		          }
		        }
		        if (s.gzindex < s.gzhead.comment.length) {
		          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
		        } else {
		          val = 0;
		        }
		        put_byte(s, val);
		      } while (val !== 0);
		      if (s.gzhead.hcrc && s.pending > beg) {
		        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
		      }
		      if (val === 0) {
		        s.status = HCRC_STATE;
		      }
		    }
		    else {
		      s.status = HCRC_STATE;
		    }
		  }
		  if (s.status === HCRC_STATE) {
		    if (s.gzhead.hcrc) {
		      if (s.pending + 2 > s.pending_buf_size) {
		        flush_pending(strm);
		      }
		      if (s.pending + 2 <= s.pending_buf_size) {
		        put_byte(s, strm.adler & 0xff);
		        put_byte(s, (strm.adler >> 8) & 0xff);
		        strm.adler = 0;
		        s.status = BUSY_STATE;
		      }
		    }
		    else {
		      s.status = BUSY_STATE;
		    }
		  }
		  if (s.pending !== 0) {
		    flush_pending(strm);
		    if (strm.avail_out === 0) {
		      s.last_flush = -1;
		      return Z_OK;
		    }
		  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
		    flush !== Z_FINISH) {
		    return err(strm, Z_BUF_ERROR);
		  }
		  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
		    return err(strm, Z_BUF_ERROR);
		  }
		  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
		    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
		    var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
		      (s.strategy === Z_RLE ? deflate_rle(s, flush) :
		        configuration_table[s.level].func(s, flush));
		    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
		      s.status = FINISH_STATE;
		    }
		    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
		      if (strm.avail_out === 0) {
		        s.last_flush = -1;
		      }
		      return Z_OK;
		    }
		    if (bstate === BS_BLOCK_DONE) {
		      if (flush === Z_PARTIAL_FLUSH) {
		        trees._tr_align(s);
		      }
		      else if (flush !== Z_BLOCK) {
		        trees._tr_stored_block(s, 0, 0, false);
		        if (flush === Z_FULL_FLUSH) {
		          zero(s.head);
		          if (s.lookahead === 0) {
		            s.strstart = 0;
		            s.block_start = 0;
		            s.insert = 0;
		          }
		        }
		      }
		      flush_pending(strm);
		      if (strm.avail_out === 0) {
		        s.last_flush = -1;
		        return Z_OK;
		      }
		    }
		  }
		  if (flush !== Z_FINISH) { return Z_OK; }
		  if (s.wrap <= 0) { return Z_STREAM_END; }
		  if (s.wrap === 2) {
		    put_byte(s, strm.adler & 0xff);
		    put_byte(s, (strm.adler >> 8) & 0xff);
		    put_byte(s, (strm.adler >> 16) & 0xff);
		    put_byte(s, (strm.adler >> 24) & 0xff);
		    put_byte(s, strm.total_in & 0xff);
		    put_byte(s, (strm.total_in >> 8) & 0xff);
		    put_byte(s, (strm.total_in >> 16) & 0xff);
		    put_byte(s, (strm.total_in >> 24) & 0xff);
		  }
		  else
		  {
		    putShortMSB(s, strm.adler >>> 16);
		    putShortMSB(s, strm.adler & 0xffff);
		  }
		  flush_pending(strm);
		  if (s.wrap > 0) { s.wrap = -s.wrap; }
		  return s.pending !== 0 ? Z_OK : Z_STREAM_END;
		}
		function deflateEnd(strm) {
		  var status;
		  if (!strm || !strm.state) {
		    return Z_STREAM_ERROR;
		  }
		  status = strm.state.status;
		  if (status !== INIT_STATE &&
		    status !== EXTRA_STATE &&
		    status !== NAME_STATE &&
		    status !== COMMENT_STATE &&
		    status !== HCRC_STATE &&
		    status !== BUSY_STATE &&
		    status !== FINISH_STATE
		  ) {
		    return err(strm, Z_STREAM_ERROR);
		  }
		  strm.state = null;
		  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
		}
		function deflateSetDictionary(strm, dictionary) {
		  var dictLength = dictionary.length;
		  var s;
		  var str, n;
		  var wrap;
		  var avail;
		  var next;
		  var input;
		  var tmpDict;
		  if (!strm || !strm.state) {
		    return Z_STREAM_ERROR;
		  }
		  s = strm.state;
		  wrap = s.wrap;
		  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
		    return Z_STREAM_ERROR;
		  }
		  if (wrap === 1) {
		    strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
		  }
		  s.wrap = 0;
		  if (dictLength >= s.w_size) {
		    if (wrap === 0) {
		      zero(s.head);
		      s.strstart = 0;
		      s.block_start = 0;
		      s.insert = 0;
		    }
		    tmpDict = new utils.Buf8(s.w_size);
		    utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
		    dictionary = tmpDict;
		    dictLength = s.w_size;
		  }
		  avail = strm.avail_in;
		  next = strm.next_in;
		  input = strm.input;
		  strm.avail_in = dictLength;
		  strm.next_in = 0;
		  strm.input = dictionary;
		  fill_window(s);
		  while (s.lookahead >= MIN_MATCH) {
		    str = s.strstart;
		    n = s.lookahead - (MIN_MATCH - 1);
		    do {
		      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
		      s.prev[str & s.w_mask] = s.head[s.ins_h];
		      s.head[s.ins_h] = str;
		      str++;
		    } while (--n);
		    s.strstart = str;
		    s.lookahead = MIN_MATCH - 1;
		    fill_window(s);
		  }
		  s.strstart += s.lookahead;
		  s.block_start = s.strstart;
		  s.insert = s.lookahead;
		  s.lookahead = 0;
		  s.match_length = s.prev_length = MIN_MATCH - 1;
		  s.match_available = 0;
		  strm.next_in = next;
		  strm.input = input;
		  strm.avail_in = avail;
		  s.wrap = wrap;
		  return Z_OK;
		}
		deflate.deflateInit = deflateInit;
		deflate.deflateInit2 = deflateInit2;
		deflate.deflateReset = deflateReset;
		deflate.deflateResetKeep = deflateResetKeep;
		deflate.deflateSetHeader = deflateSetHeader;
		deflate.deflate = deflate$1;
		deflate.deflateEnd = deflateEnd;
		deflate.deflateSetDictionary = deflateSetDictionary;
		deflate.deflateInfo = 'pako deflate (from Nodeca project)';
		return deflate;
	}

	var strings = {};

	var hasRequiredStrings;
	function requireStrings () {
		if (hasRequiredStrings) return strings;
		hasRequiredStrings = 1;
		var utils = requireCommon();
		var STR_APPLY_OK = true;
		var STR_APPLY_UIA_OK = true;
		try { String.fromCharCode.apply(null, [ 0 ]); } catch (__) { STR_APPLY_OK = false; }
		try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }
		var _utf8len = new utils.Buf8(256);
		for (var q = 0; q < 256; q++) {
		  _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
		}
		_utf8len[254] = _utf8len[254] = 1;
		strings.string2buf = function (str) {
		  var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
		  for (m_pos = 0; m_pos < str_len; m_pos++) {
		    c = str.charCodeAt(m_pos);
		    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
		      c2 = str.charCodeAt(m_pos + 1);
		      if ((c2 & 0xfc00) === 0xdc00) {
		        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
		        m_pos++;
		      }
		    }
		    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
		  }
		  buf = new utils.Buf8(buf_len);
		  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
		    c = str.charCodeAt(m_pos);
		    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
		      c2 = str.charCodeAt(m_pos + 1);
		      if ((c2 & 0xfc00) === 0xdc00) {
		        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
		        m_pos++;
		      }
		    }
		    if (c < 0x80) {
		      buf[i++] = c;
		    } else if (c < 0x800) {
		      buf[i++] = 0xC0 | (c >>> 6);
		      buf[i++] = 0x80 | (c & 0x3f);
		    } else if (c < 0x10000) {
		      buf[i++] = 0xE0 | (c >>> 12);
		      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
		      buf[i++] = 0x80 | (c & 0x3f);
		    } else {
		      buf[i++] = 0xf0 | (c >>> 18);
		      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
		      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
		      buf[i++] = 0x80 | (c & 0x3f);
		    }
		  }
		  return buf;
		};
		function buf2binstring(buf, len) {
		  if (len < 65534) {
		    if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
		      return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
		    }
		  }
		  var result = '';
		  for (var i = 0; i < len; i++) {
		    result += String.fromCharCode(buf[i]);
		  }
		  return result;
		}
		strings.buf2binstring = function (buf) {
		  return buf2binstring(buf, buf.length);
		};
		strings.binstring2buf = function (str) {
		  var buf = new utils.Buf8(str.length);
		  for (var i = 0, len = buf.length; i < len; i++) {
		    buf[i] = str.charCodeAt(i);
		  }
		  return buf;
		};
		strings.buf2string = function (buf, max) {
		  var i, out, c, c_len;
		  var len = max || buf.length;
		  var utf16buf = new Array(len * 2);
		  for (out = 0, i = 0; i < len;) {
		    c = buf[i++];
		    if (c < 0x80) { utf16buf[out++] = c; continue; }
		    c_len = _utf8len[c];
		    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }
		    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
		    while (c_len > 1 && i < len) {
		      c = (c << 6) | (buf[i++] & 0x3f);
		      c_len--;
		    }
		    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }
		    if (c < 0x10000) {
		      utf16buf[out++] = c;
		    } else {
		      c -= 0x10000;
		      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
		      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
		    }
		  }
		  return buf2binstring(utf16buf, out);
		};
		strings.utf8border = function (buf, max) {
		  var pos;
		  max = max || buf.length;
		  if (max > buf.length) { max = buf.length; }
		  pos = max - 1;
		  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }
		  if (pos < 0) { return max; }
		  if (pos === 0) { return max; }
		  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
		};
		return strings;
	}

	var zstream;
	var hasRequiredZstream;
	function requireZstream () {
		if (hasRequiredZstream) return zstream;
		hasRequiredZstream = 1;
		function ZStream() {
		  this.input = null;
		  this.next_in = 0;
		  this.avail_in = 0;
		  this.total_in = 0;
		  this.output = null;
		  this.next_out = 0;
		  this.avail_out = 0;
		  this.total_out = 0;
		  this.msg = '';
		  this.state = null;
		  this.data_type = 2;
		  this.adler = 0;
		}
		zstream = ZStream;
		return zstream;
	}

	var hasRequiredDeflate;
	function requireDeflate () {
		if (hasRequiredDeflate) return deflate$1;
		hasRequiredDeflate = 1;
		var zlib_deflate = requireDeflate$1();
		var utils        = requireCommon();
		var strings      = requireStrings();
		var msg          = requireMessages();
		var ZStream      = requireZstream();
		var toString = Object.prototype.toString;
		var Z_NO_FLUSH      = 0;
		var Z_FINISH        = 4;
		var Z_OK            = 0;
		var Z_STREAM_END    = 1;
		var Z_SYNC_FLUSH    = 2;
		var Z_DEFAULT_COMPRESSION = -1;
		var Z_DEFAULT_STRATEGY    = 0;
		var Z_DEFLATED  = 8;
		function Deflate(options) {
		  if (!(this instanceof Deflate)) return new Deflate(options);
		  this.options = utils.assign({
		    level: Z_DEFAULT_COMPRESSION,
		    method: Z_DEFLATED,
		    chunkSize: 16384,
		    windowBits: 15,
		    memLevel: 8,
		    strategy: Z_DEFAULT_STRATEGY,
		    to: ''
		  }, options || {});
		  var opt = this.options;
		  if (opt.raw && (opt.windowBits > 0)) {
		    opt.windowBits = -opt.windowBits;
		  }
		  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
		    opt.windowBits += 16;
		  }
		  this.err    = 0;
		  this.msg    = '';
		  this.ended  = false;
		  this.chunks = [];
		  this.strm = new ZStream();
		  this.strm.avail_out = 0;
		  var status = zlib_deflate.deflateInit2(
		    this.strm,
		    opt.level,
		    opt.method,
		    opt.windowBits,
		    opt.memLevel,
		    opt.strategy
		  );
		  if (status !== Z_OK) {
		    throw new Error(msg[status]);
		  }
		  if (opt.header) {
		    zlib_deflate.deflateSetHeader(this.strm, opt.header);
		  }
		  if (opt.dictionary) {
		    var dict;
		    if (typeof opt.dictionary === 'string') {
		      dict = strings.string2buf(opt.dictionary);
		    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
		      dict = new Uint8Array(opt.dictionary);
		    } else {
		      dict = opt.dictionary;
		    }
		    status = zlib_deflate.deflateSetDictionary(this.strm, dict);
		    if (status !== Z_OK) {
		      throw new Error(msg[status]);
		    }
		    this._dict_set = true;
		  }
		}
		Deflate.prototype.push = function (data, mode) {
		  var strm = this.strm;
		  var chunkSize = this.options.chunkSize;
		  var status, _mode;
		  if (this.ended) { return false; }
		  _mode = (mode === ~~mode) ? mode : ((mode === true) ? Z_FINISH : Z_NO_FLUSH);
		  if (typeof data === 'string') {
		    strm.input = strings.string2buf(data);
		  } else if (toString.call(data) === '[object ArrayBuffer]') {
		    strm.input = new Uint8Array(data);
		  } else {
		    strm.input = data;
		  }
		  strm.next_in = 0;
		  strm.avail_in = strm.input.length;
		  do {
		    if (strm.avail_out === 0) {
		      strm.output = new utils.Buf8(chunkSize);
		      strm.next_out = 0;
		      strm.avail_out = chunkSize;
		    }
		    status = zlib_deflate.deflate(strm, _mode);
		    if (status !== Z_STREAM_END && status !== Z_OK) {
		      this.onEnd(status);
		      this.ended = true;
		      return false;
		    }
		    if (strm.avail_out === 0 || (strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH))) {
		      if (this.options.to === 'string') {
		        this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
		      } else {
		        this.onData(utils.shrinkBuf(strm.output, strm.next_out));
		      }
		    }
		  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);
		  if (_mode === Z_FINISH) {
		    status = zlib_deflate.deflateEnd(this.strm);
		    this.onEnd(status);
		    this.ended = true;
		    return status === Z_OK;
		  }
		  if (_mode === Z_SYNC_FLUSH) {
		    this.onEnd(Z_OK);
		    strm.avail_out = 0;
		    return true;
		  }
		  return true;
		};
		Deflate.prototype.onData = function (chunk) {
		  this.chunks.push(chunk);
		};
		Deflate.prototype.onEnd = function (status) {
		  if (status === Z_OK) {
		    if (this.options.to === 'string') {
		      this.result = this.chunks.join('');
		    } else {
		      this.result = utils.flattenChunks(this.chunks);
		    }
		  }
		  this.chunks = [];
		  this.err = status;
		  this.msg = this.strm.msg;
		};
		function deflate(input, options) {
		  var deflator = new Deflate(options);
		  deflator.push(input, true);
		  if (deflator.err) { throw deflator.msg || msg[deflator.err]; }
		  return deflator.result;
		}
		function deflateRaw(input, options) {
		  options = options || {};
		  options.raw = true;
		  return deflate(input, options);
		}
		function gzip(input, options) {
		  options = options || {};
		  options.gzip = true;
		  return deflate(input, options);
		}
		deflate$1.Deflate = Deflate;
		deflate$1.deflate = deflate;
		deflate$1.deflateRaw = deflateRaw;
		deflate$1.gzip = gzip;
		return deflate$1;
	}

	var inflate$1 = {};

	var inflate = {};

	var inffast;
	var hasRequiredInffast;
	function requireInffast () {
		if (hasRequiredInffast) return inffast;
		hasRequiredInffast = 1;
		var BAD = 30;
		var TYPE = 12;
		inffast = function inflate_fast(strm, start) {
		  var state;
		  var _in;
		  var last;
		  var _out;
		  var beg;
		  var end;
		  var dmax;
		  var wsize;
		  var whave;
		  var wnext;
		  var s_window;
		  var hold;
		  var bits;
		  var lcode;
		  var dcode;
		  var lmask;
		  var dmask;
		  var here;
		  var op;
		  var len;
		  var dist;
		  var from;
		  var from_source;
		  var input, output;
		  state = strm.state;
		  _in = strm.next_in;
		  input = strm.input;
		  last = _in + (strm.avail_in - 5);
		  _out = strm.next_out;
		  output = strm.output;
		  beg = _out - (start - strm.avail_out);
		  end = _out + (strm.avail_out - 257);
		  dmax = state.dmax;
		  wsize = state.wsize;
		  whave = state.whave;
		  wnext = state.wnext;
		  s_window = state.window;
		  hold = state.hold;
		  bits = state.bits;
		  lcode = state.lencode;
		  dcode = state.distcode;
		  lmask = (1 << state.lenbits) - 1;
		  dmask = (1 << state.distbits) - 1;
		  top:
		  do {
		    if (bits < 15) {
		      hold += input[_in++] << bits;
		      bits += 8;
		      hold += input[_in++] << bits;
		      bits += 8;
		    }
		    here = lcode[hold & lmask];
		    dolen:
		    for (;;) {
		      op = here >>> 24;
		      hold >>>= op;
		      bits -= op;
		      op = (here >>> 16) & 0xff;
		      if (op === 0) {
		        output[_out++] = here & 0xffff;
		      }
		      else if (op & 16) {
		        len = here & 0xffff;
		        op &= 15;
		        if (op) {
		          if (bits < op) {
		            hold += input[_in++] << bits;
		            bits += 8;
		          }
		          len += hold & ((1 << op) - 1);
		          hold >>>= op;
		          bits -= op;
		        }
		        if (bits < 15) {
		          hold += input[_in++] << bits;
		          bits += 8;
		          hold += input[_in++] << bits;
		          bits += 8;
		        }
		        here = dcode[hold & dmask];
		        dodist:
		        for (;;) {
		          op = here >>> 24;
		          hold >>>= op;
		          bits -= op;
		          op = (here >>> 16) & 0xff;
		          if (op & 16) {
		            dist = here & 0xffff;
		            op &= 15;
		            if (bits < op) {
		              hold += input[_in++] << bits;
		              bits += 8;
		              if (bits < op) {
		                hold += input[_in++] << bits;
		                bits += 8;
		              }
		            }
		            dist += hold & ((1 << op) - 1);
		            if (dist > dmax) {
		              strm.msg = 'invalid distance too far back';
		              state.mode = BAD;
		              break top;
		            }
		            hold >>>= op;
		            bits -= op;
		            op = _out - beg;
		            if (dist > op) {
		              op = dist - op;
		              if (op > whave) {
		                if (state.sane) {
		                  strm.msg = 'invalid distance too far back';
		                  state.mode = BAD;
		                  break top;
		                }
		              }
		              from = 0;
		              from_source = s_window;
		              if (wnext === 0) {
		                from += wsize - op;
		                if (op < len) {
		                  len -= op;
		                  do {
		                    output[_out++] = s_window[from++];
		                  } while (--op);
		                  from = _out - dist;
		                  from_source = output;
		                }
		              }
		              else if (wnext < op) {
		                from += wsize + wnext - op;
		                op -= wnext;
		                if (op < len) {
		                  len -= op;
		                  do {
		                    output[_out++] = s_window[from++];
		                  } while (--op);
		                  from = 0;
		                  if (wnext < len) {
		                    op = wnext;
		                    len -= op;
		                    do {
		                      output[_out++] = s_window[from++];
		                    } while (--op);
		                    from = _out - dist;
		                    from_source = output;
		                  }
		                }
		              }
		              else {
		                from += wnext - op;
		                if (op < len) {
		                  len -= op;
		                  do {
		                    output[_out++] = s_window[from++];
		                  } while (--op);
		                  from = _out - dist;
		                  from_source = output;
		                }
		              }
		              while (len > 2) {
		                output[_out++] = from_source[from++];
		                output[_out++] = from_source[from++];
		                output[_out++] = from_source[from++];
		                len -= 3;
		              }
		              if (len) {
		                output[_out++] = from_source[from++];
		                if (len > 1) {
		                  output[_out++] = from_source[from++];
		                }
		              }
		            }
		            else {
		              from = _out - dist;
		              do {
		                output[_out++] = output[from++];
		                output[_out++] = output[from++];
		                output[_out++] = output[from++];
		                len -= 3;
		              } while (len > 2);
		              if (len) {
		                output[_out++] = output[from++];
		                if (len > 1) {
		                  output[_out++] = output[from++];
		                }
		              }
		            }
		          }
		          else if ((op & 64) === 0) {
		            here = dcode[(here & 0xffff) + (hold & ((1 << op) - 1))];
		            continue dodist;
		          }
		          else {
		            strm.msg = 'invalid distance code';
		            state.mode = BAD;
		            break top;
		          }
		          break;
		        }
		      }
		      else if ((op & 64) === 0) {
		        here = lcode[(here & 0xffff) + (hold & ((1 << op) - 1))];
		        continue dolen;
		      }
		      else if (op & 32) {
		        state.mode = TYPE;
		        break top;
		      }
		      else {
		        strm.msg = 'invalid literal/length code';
		        state.mode = BAD;
		        break top;
		      }
		      break;
		    }
		  } while (_in < last && _out < end);
		  len = bits >> 3;
		  _in -= len;
		  bits -= len << 3;
		  hold &= (1 << bits) - 1;
		  strm.next_in = _in;
		  strm.next_out = _out;
		  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
		  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
		  state.hold = hold;
		  state.bits = bits;
		  return;
		};
		return inffast;
	}

	var inftrees;
	var hasRequiredInftrees;
	function requireInftrees () {
		if (hasRequiredInftrees) return inftrees;
		hasRequiredInftrees = 1;
		var utils = requireCommon();
		var MAXBITS = 15;
		var ENOUGH_LENS = 852;
		var ENOUGH_DISTS = 592;
		var CODES = 0;
		var LENS = 1;
		var DISTS = 2;
		var lbase = [
		  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
		  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
		];
		var lext = [
		  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
		  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
		];
		var dbase = [
		  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
		  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
		  8193, 12289, 16385, 24577, 0, 0
		];
		var dext = [
		  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
		  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
		  28, 28, 29, 29, 64, 64
		];
		inftrees = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)
		{
		  var bits = opts.bits;
		  var len = 0;
		  var sym = 0;
		  var min = 0, max = 0;
		  var root = 0;
		  var curr = 0;
		  var drop = 0;
		  var left = 0;
		  var used = 0;
		  var huff = 0;
		  var incr;
		  var fill;
		  var low;
		  var mask;
		  var next;
		  var base = null;
		  var base_index = 0;
		  var end;
		  var count = new utils.Buf16(MAXBITS + 1);
		  var offs = new utils.Buf16(MAXBITS + 1);
		  var extra = null;
		  var extra_index = 0;
		  var here_bits, here_op, here_val;
		  for (len = 0; len <= MAXBITS; len++) {
		    count[len] = 0;
		  }
		  for (sym = 0; sym < codes; sym++) {
		    count[lens[lens_index + sym]]++;
		  }
		  root = bits;
		  for (max = MAXBITS; max >= 1; max--) {
		    if (count[max] !== 0) { break; }
		  }
		  if (root > max) {
		    root = max;
		  }
		  if (max === 0) {
		    table[table_index++] = (1 << 24) | (64 << 16) | 0;
		    table[table_index++] = (1 << 24) | (64 << 16) | 0;
		    opts.bits = 1;
		    return 0;
		  }
		  for (min = 1; min < max; min++) {
		    if (count[min] !== 0) { break; }
		  }
		  if (root < min) {
		    root = min;
		  }
		  left = 1;
		  for (len = 1; len <= MAXBITS; len++) {
		    left <<= 1;
		    left -= count[len];
		    if (left < 0) {
		      return -1;
		    }
		  }
		  if (left > 0 && (type === CODES || max !== 1)) {
		    return -1;
		  }
		  offs[1] = 0;
		  for (len = 1; len < MAXBITS; len++) {
		    offs[len + 1] = offs[len] + count[len];
		  }
		  for (sym = 0; sym < codes; sym++) {
		    if (lens[lens_index + sym] !== 0) {
		      work[offs[lens[lens_index + sym]]++] = sym;
		    }
		  }
		  if (type === CODES) {
		    base = extra = work;
		    end = 19;
		  } else if (type === LENS) {
		    base = lbase;
		    base_index -= 257;
		    extra = lext;
		    extra_index -= 257;
		    end = 256;
		  } else {
		    base = dbase;
		    extra = dext;
		    end = -1;
		  }
		  huff = 0;
		  sym = 0;
		  len = min;
		  next = table_index;
		  curr = root;
		  drop = 0;
		  low = -1;
		  used = 1 << root;
		  mask = used - 1;
		  if ((type === LENS && used > ENOUGH_LENS) ||
		    (type === DISTS && used > ENOUGH_DISTS)) {
		    return 1;
		  }
		  for (;;) {
		    here_bits = len - drop;
		    if (work[sym] < end) {
		      here_op = 0;
		      here_val = work[sym];
		    }
		    else if (work[sym] > end) {
		      here_op = extra[extra_index + work[sym]];
		      here_val = base[base_index + work[sym]];
		    }
		    else {
		      here_op = 32 + 64;
		      here_val = 0;
		    }
		    incr = 1 << (len - drop);
		    fill = 1 << curr;
		    min = fill;
		    do {
		      fill -= incr;
		      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
		    } while (fill !== 0);
		    incr = 1 << (len - 1);
		    while (huff & incr) {
		      incr >>= 1;
		    }
		    if (incr !== 0) {
		      huff &= incr - 1;
		      huff += incr;
		    } else {
		      huff = 0;
		    }
		    sym++;
		    if (--count[len] === 0) {
		      if (len === max) { break; }
		      len = lens[lens_index + work[sym]];
		    }
		    if (len > root && (huff & mask) !== low) {
		      if (drop === 0) {
		        drop = root;
		      }
		      next += min;
		      curr = len - drop;
		      left = 1 << curr;
		      while (curr + drop < max) {
		        left -= count[curr + drop];
		        if (left <= 0) { break; }
		        curr++;
		        left <<= 1;
		      }
		      used += 1 << curr;
		      if ((type === LENS && used > ENOUGH_LENS) ||
		        (type === DISTS && used > ENOUGH_DISTS)) {
		        return 1;
		      }
		      low = huff & mask;
		      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
		    }
		  }
		  if (huff !== 0) {
		    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
		  }
		  opts.bits = root;
		  return 0;
		};
		return inftrees;
	}

	var hasRequiredInflate$1;
	function requireInflate$1 () {
		if (hasRequiredInflate$1) return inflate;
		hasRequiredInflate$1 = 1;
		var utils         = requireCommon();
		var adler32       = requireAdler32();
		var crc32         = requireCrc32();
		var inflate_fast  = requireInffast();
		var inflate_table = requireInftrees();
		var CODES = 0;
		var LENS = 1;
		var DISTS = 2;
		var Z_FINISH        = 4;
		var Z_BLOCK         = 5;
		var Z_TREES         = 6;
		var Z_OK            = 0;
		var Z_STREAM_END    = 1;
		var Z_NEED_DICT     = 2;
		var Z_STREAM_ERROR  = -2;
		var Z_DATA_ERROR    = -3;
		var Z_MEM_ERROR     = -4;
		var Z_BUF_ERROR     = -5;
		var Z_DEFLATED  = 8;
		var    HEAD = 1;
		var    FLAGS = 2;
		var    TIME = 3;
		var    OS = 4;
		var    EXLEN = 5;
		var    EXTRA = 6;
		var    NAME = 7;
		var    COMMENT = 8;
		var    HCRC = 9;
		var    DICTID = 10;
		var    DICT = 11;
		var        TYPE = 12;
		var        TYPEDO = 13;
		var        STORED = 14;
		var        COPY_ = 15;
		var        COPY = 16;
		var        TABLE = 17;
		var        LENLENS = 18;
		var        CODELENS = 19;
		var            LEN_ = 20;
		var            LEN = 21;
		var            LENEXT = 22;
		var            DIST = 23;
		var            DISTEXT = 24;
		var            MATCH = 25;
		var            LIT = 26;
		var    CHECK = 27;
		var    LENGTH = 28;
		var    DONE = 29;
		var    BAD = 30;
		var    MEM = 31;
		var    SYNC = 32;
		var ENOUGH_LENS = 852;
		var ENOUGH_DISTS = 592;
		var MAX_WBITS = 15;
		var DEF_WBITS = MAX_WBITS;
		function zswap32(q) {
		  return  (((q >>> 24) & 0xff) +
		          ((q >>> 8) & 0xff00) +
		          ((q & 0xff00) << 8) +
		          ((q & 0xff) << 24));
		}
		function InflateState() {
		  this.mode = 0;
		  this.last = false;
		  this.wrap = 0;
		  this.havedict = false;
		  this.flags = 0;
		  this.dmax = 0;
		  this.check = 0;
		  this.total = 0;
		  this.head = null;
		  this.wbits = 0;
		  this.wsize = 0;
		  this.whave = 0;
		  this.wnext = 0;
		  this.window = null;
		  this.hold = 0;
		  this.bits = 0;
		  this.length = 0;
		  this.offset = 0;
		  this.extra = 0;
		  this.lencode = null;
		  this.distcode = null;
		  this.lenbits = 0;
		  this.distbits = 0;
		  this.ncode = 0;
		  this.nlen = 0;
		  this.ndist = 0;
		  this.have = 0;
		  this.next = null;
		  this.lens = new utils.Buf16(320);
		  this.work = new utils.Buf16(288);
		  this.lendyn = null;
		  this.distdyn = null;
		  this.sane = 0;
		  this.back = 0;
		  this.was = 0;
		}
		function inflateResetKeep(strm) {
		  var state;
		  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
		  state = strm.state;
		  strm.total_in = strm.total_out = state.total = 0;
		  strm.msg = '';
		  if (state.wrap) {
		    strm.adler = state.wrap & 1;
		  }
		  state.mode = HEAD;
		  state.last = 0;
		  state.havedict = 0;
		  state.dmax = 32768;
		  state.head = null;
		  state.hold = 0;
		  state.bits = 0;
		  state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
		  state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
		  state.sane = 1;
		  state.back = -1;
		  return Z_OK;
		}
		function inflateReset(strm) {
		  var state;
		  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
		  state = strm.state;
		  state.wsize = 0;
		  state.whave = 0;
		  state.wnext = 0;
		  return inflateResetKeep(strm);
		}
		function inflateReset2(strm, windowBits) {
		  var wrap;
		  var state;
		  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
		  state = strm.state;
		  if (windowBits < 0) {
		    wrap = 0;
		    windowBits = -windowBits;
		  }
		  else {
		    wrap = (windowBits >> 4) + 1;
		    if (windowBits < 48) {
		      windowBits &= 15;
		    }
		  }
		  if (windowBits && (windowBits < 8 || windowBits > 15)) {
		    return Z_STREAM_ERROR;
		  }
		  if (state.window !== null && state.wbits !== windowBits) {
		    state.window = null;
		  }
		  state.wrap = wrap;
		  state.wbits = windowBits;
		  return inflateReset(strm);
		}
		function inflateInit2(strm, windowBits) {
		  var ret;
		  var state;
		  if (!strm) { return Z_STREAM_ERROR; }
		  state = new InflateState();
		  strm.state = state;
		  state.window = null;
		  ret = inflateReset2(strm, windowBits);
		  if (ret !== Z_OK) {
		    strm.state = null;
		  }
		  return ret;
		}
		function inflateInit(strm) {
		  return inflateInit2(strm, DEF_WBITS);
		}
		var virgin = true;
		var lenfix, distfix;
		function fixedtables(state) {
		  if (virgin) {
		    var sym;
		    lenfix = new utils.Buf32(512);
		    distfix = new utils.Buf32(32);
		    sym = 0;
		    while (sym < 144) { state.lens[sym++] = 8; }
		    while (sym < 256) { state.lens[sym++] = 9; }
		    while (sym < 280) { state.lens[sym++] = 7; }
		    while (sym < 288) { state.lens[sym++] = 8; }
		    inflate_table(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });
		    sym = 0;
		    while (sym < 32) { state.lens[sym++] = 5; }
		    inflate_table(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });
		    virgin = false;
		  }
		  state.lencode = lenfix;
		  state.lenbits = 9;
		  state.distcode = distfix;
		  state.distbits = 5;
		}
		function updatewindow(strm, src, end, copy) {
		  var dist;
		  var state = strm.state;
		  if (state.window === null) {
		    state.wsize = 1 << state.wbits;
		    state.wnext = 0;
		    state.whave = 0;
		    state.window = new utils.Buf8(state.wsize);
		  }
		  if (copy >= state.wsize) {
		    utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
		    state.wnext = 0;
		    state.whave = state.wsize;
		  }
		  else {
		    dist = state.wsize - state.wnext;
		    if (dist > copy) {
		      dist = copy;
		    }
		    utils.arraySet(state.window, src, end - copy, dist, state.wnext);
		    copy -= dist;
		    if (copy) {
		      utils.arraySet(state.window, src, end - copy, copy, 0);
		      state.wnext = copy;
		      state.whave = state.wsize;
		    }
		    else {
		      state.wnext += dist;
		      if (state.wnext === state.wsize) { state.wnext = 0; }
		      if (state.whave < state.wsize) { state.whave += dist; }
		    }
		  }
		  return 0;
		}
		function inflate$1(strm, flush) {
		  var state;
		  var input, output;
		  var next;
		  var put;
		  var have, left;
		  var hold;
		  var bits;
		  var _in, _out;
		  var copy;
		  var from;
		  var from_source;
		  var here = 0;
		  var here_bits, here_op, here_val;
		  var last_bits, last_op, last_val;
		  var len;
		  var ret;
		  var hbuf = new utils.Buf8(4);
		  var opts;
		  var n;
		  var order =
		    [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];
		  if (!strm || !strm.state || !strm.output ||
		      (!strm.input && strm.avail_in !== 0)) {
		    return Z_STREAM_ERROR;
		  }
		  state = strm.state;
		  if (state.mode === TYPE) { state.mode = TYPEDO; }
		  put = strm.next_out;
		  output = strm.output;
		  left = strm.avail_out;
		  next = strm.next_in;
		  input = strm.input;
		  have = strm.avail_in;
		  hold = state.hold;
		  bits = state.bits;
		  _in = have;
		  _out = left;
		  ret = Z_OK;
		  inf_leave:
		  for (;;) {
		    switch (state.mode) {
		      case HEAD:
		        if (state.wrap === 0) {
		          state.mode = TYPEDO;
		          break;
		        }
		        while (bits < 16) {
		          if (have === 0) { break inf_leave; }
		          have--;
		          hold += input[next++] << bits;
		          bits += 8;
		        }
		        if ((state.wrap & 2) && hold === 0x8b1f) {
		          state.check = 0;
		          hbuf[0] = hold & 0xff;
		          hbuf[1] = (hold >>> 8) & 0xff;
		          state.check = crc32(state.check, hbuf, 2, 0);
		          hold = 0;
		          bits = 0;
		          state.mode = FLAGS;
		          break;
		        }
		        state.flags = 0;
		        if (state.head) {
		          state.head.done = false;
		        }
		        if (!(state.wrap & 1) ||
		          (((hold & 0xff) << 8) + (hold >> 8)) % 31) {
		          strm.msg = 'incorrect header check';
		          state.mode = BAD;
		          break;
		        }
		        if ((hold & 0x0f) !== Z_DEFLATED) {
		          strm.msg = 'unknown compression method';
		          state.mode = BAD;
		          break;
		        }
		        hold >>>= 4;
		        bits -= 4;
		        len = (hold & 0x0f) + 8;
		        if (state.wbits === 0) {
		          state.wbits = len;
		        }
		        else if (len > state.wbits) {
		          strm.msg = 'invalid window size';
		          state.mode = BAD;
		          break;
		        }
		        state.dmax = 1 << len;
		        strm.adler = state.check = 1;
		        state.mode = hold & 0x200 ? DICTID : TYPE;
		        hold = 0;
		        bits = 0;
		        break;
		      case FLAGS:
		        while (bits < 16) {
		          if (have === 0) { break inf_leave; }
		          have--;
		          hold += input[next++] << bits;
		          bits += 8;
		        }
		        state.flags = hold;
		        if ((state.flags & 0xff) !== Z_DEFLATED) {
		          strm.msg = 'unknown compression method';
		          state.mode = BAD;
		          break;
		        }
		        if (state.flags & 0xe000) {
		          strm.msg = 'unknown header flags set';
		          state.mode = BAD;
		          break;
		        }
		        if (state.head) {
		          state.head.text = ((hold >> 8) & 1);
		        }
		        if (state.flags & 0x0200) {
		          hbuf[0] = hold & 0xff;
		          hbuf[1] = (hold >>> 8) & 0xff;
		          state.check = crc32(state.check, hbuf, 2, 0);
		        }
		        hold = 0;
		        bits = 0;
		        state.mode = TIME;
		      case TIME:
		        while (bits < 32) {
		          if (have === 0) { break inf_leave; }
		          have--;
		          hold += input[next++] << bits;
		          bits += 8;
		        }
		        if (state.head) {
		          state.head.time = hold;
		        }
		        if (state.flags & 0x0200) {
		          hbuf[0] = hold & 0xff;
		          hbuf[1] = (hold >>> 8) & 0xff;
		          hbuf[2] = (hold >>> 16) & 0xff;
		          hbuf[3] = (hold >>> 24) & 0xff;
		          state.check = crc32(state.check, hbuf, 4, 0);
		        }
		        hold = 0;
		        bits = 0;
		        state.mode = OS;
		      case OS:
		        while (bits < 16) {
		          if (have === 0) { break inf_leave; }
		          have--;
		          hold += input[next++] << bits;
		          bits += 8;
		        }
		        if (state.head) {
		          state.head.xflags = (hold & 0xff);
		          state.head.os = (hold >> 8);
		        }
		        if (state.flags & 0x0200) {
		          hbuf[0] = hold & 0xff;
		          hbuf[1] = (hold >>> 8) & 0xff;
		          state.check = crc32(state.check, hbuf, 2, 0);
		        }
		        hold = 0;
		        bits = 0;
		        state.mode = EXLEN;
		      case EXLEN:
		        if (state.flags & 0x0400) {
		          while (bits < 16) {
		            if (have === 0) { break inf_leave; }
		            have--;
		            hold += input[next++] << bits;
		            bits += 8;
		          }
		          state.length = hold;
		          if (state.head) {
		            state.head.extra_len = hold;
		          }
		          if (state.flags & 0x0200) {
		            hbuf[0] = hold & 0xff;
		            hbuf[1] = (hold >>> 8) & 0xff;
		            state.check = crc32(state.check, hbuf, 2, 0);
		          }
		          hold = 0;
		          bits = 0;
		        }
		        else if (state.head) {
		          state.head.extra = null;
		        }
		        state.mode = EXTRA;
		      case EXTRA:
		        if (state.flags & 0x0400) {
		          copy = state.length;
		          if (copy > have) { copy = have; }
		          if (copy) {
		            if (state.head) {
		              len = state.head.extra_len - state.length;
		              if (!state.head.extra) {
		                state.head.extra = new Array(state.head.extra_len);
		              }
		              utils.arraySet(
		                state.head.extra,
		                input,
		                next,
		                copy,
		                len
		              );
		            }
		            if (state.flags & 0x0200) {
		              state.check = crc32(state.check, input, copy, next);
		            }
		            have -= copy;
		            next += copy;
		            state.length -= copy;
		          }
		          if (state.length) { break inf_leave; }
		        }
		        state.length = 0;
		        state.mode = NAME;
		      case NAME:
		        if (state.flags & 0x0800) {
		          if (have === 0) { break inf_leave; }
		          copy = 0;
		          do {
		            len = input[next + copy++];
		            if (state.head && len &&
		                (state.length < 65536 )) {
		              state.head.name += String.fromCharCode(len);
		            }
		          } while (len && copy < have);
		          if (state.flags & 0x0200) {
		            state.check = crc32(state.check, input, copy, next);
		          }
		          have -= copy;
		          next += copy;
		          if (len) { break inf_leave; }
		        }
		        else if (state.head) {
		          state.head.name = null;
		        }
		        state.length = 0;
		        state.mode = COMMENT;
		      case COMMENT:
		        if (state.flags & 0x1000) {
		          if (have === 0) { break inf_leave; }
		          copy = 0;
		          do {
		            len = input[next + copy++];
		            if (state.head && len &&
		                (state.length < 65536 )) {
		              state.head.comment += String.fromCharCode(len);
		            }
		          } while (len && copy < have);
		          if (state.flags & 0x0200) {
		            state.check = crc32(state.check, input, copy, next);
		          }
		          have -= copy;
		          next += copy;
		          if (len) { break inf_leave; }
		        }
		        else if (state.head) {
		          state.head.comment = null;
		        }
		        state.mode = HCRC;
		      case HCRC:
		        if (state.flags & 0x0200) {
		          while (bits < 16) {
		            if (have === 0) { break inf_leave; }
		            have--;
		            hold += input[next++] << bits;
		            bits += 8;
		          }
		          if (hold !== (state.check & 0xffff)) {
		            strm.msg = 'header crc mismatch';
		            state.mode = BAD;
		            break;
		          }
		          hold = 0;
		          bits = 0;
		        }
		        if (state.head) {
		          state.head.hcrc = ((state.flags >> 9) & 1);
		          state.head.done = true;
		        }
		        strm.adler = state.check = 0;
		        state.mode = TYPE;
		        break;
		      case DICTID:
		        while (bits < 32) {
		          if (have === 0) { break inf_leave; }
		          have--;
		          hold += input[next++] << bits;
		          bits += 8;
		        }
		        strm.adler = state.check = zswap32(hold);
		        hold = 0;
		        bits = 0;
		        state.mode = DICT;
		      case DICT:
		        if (state.havedict === 0) {
		          strm.next_out = put;
		          strm.avail_out = left;
		          strm.next_in = next;
		          strm.avail_in = have;
		          state.hold = hold;
		          state.bits = bits;
		          return Z_NEED_DICT;
		        }
		        strm.adler = state.check = 1;
		        state.mode = TYPE;
		      case TYPE:
		        if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
		      case TYPEDO:
		        if (state.last) {
		          hold >>>= bits & 7;
		          bits -= bits & 7;
		          state.mode = CHECK;
		          break;
		        }
		        while (bits < 3) {
		          if (have === 0) { break inf_leave; }
		          have--;
		          hold += input[next++] << bits;
		          bits += 8;
		        }
		        state.last = (hold & 0x01);
		        hold >>>= 1;
		        bits -= 1;
		        switch ((hold & 0x03)) {
		          case 0:
		            state.mode = STORED;
		            break;
		          case 1:
		            fixedtables(state);
		            state.mode = LEN_;
		            if (flush === Z_TREES) {
		              hold >>>= 2;
		              bits -= 2;
		              break inf_leave;
		            }
		            break;
		          case 2:
		            state.mode = TABLE;
		            break;
		          case 3:
		            strm.msg = 'invalid block type';
		            state.mode = BAD;
		        }
		        hold >>>= 2;
		        bits -= 2;
		        break;
		      case STORED:
		        hold >>>= bits & 7;
		        bits -= bits & 7;
		        while (bits < 32) {
		          if (have === 0) { break inf_leave; }
		          have--;
		          hold += input[next++] << bits;
		          bits += 8;
		        }
		        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
		          strm.msg = 'invalid stored block lengths';
		          state.mode = BAD;
		          break;
		        }
		        state.length = hold & 0xffff;
		        hold = 0;
		        bits = 0;
		        state.mode = COPY_;
		        if (flush === Z_TREES) { break inf_leave; }
		      case COPY_:
		        state.mode = COPY;
		      case COPY:
		        copy = state.length;
		        if (copy) {
		          if (copy > have) { copy = have; }
		          if (copy > left) { copy = left; }
		          if (copy === 0) { break inf_leave; }
		          utils.arraySet(output, input, next, copy, put);
		          have -= copy;
		          next += copy;
		          left -= copy;
		          put += copy;
		          state.length -= copy;
		          break;
		        }
		        state.mode = TYPE;
		        break;
		      case TABLE:
		        while (bits < 14) {
		          if (have === 0) { break inf_leave; }
		          have--;
		          hold += input[next++] << bits;
		          bits += 8;
		        }
		        state.nlen = (hold & 0x1f) + 257;
		        hold >>>= 5;
		        bits -= 5;
		        state.ndist = (hold & 0x1f) + 1;
		        hold >>>= 5;
		        bits -= 5;
		        state.ncode = (hold & 0x0f) + 4;
		        hold >>>= 4;
		        bits -= 4;
		        if (state.nlen > 286 || state.ndist > 30) {
		          strm.msg = 'too many length or distance symbols';
		          state.mode = BAD;
		          break;
		        }
		        state.have = 0;
		        state.mode = LENLENS;
		      case LENLENS:
		        while (state.have < state.ncode) {
		          while (bits < 3) {
		            if (have === 0) { break inf_leave; }
		            have--;
		            hold += input[next++] << bits;
		            bits += 8;
		          }
		          state.lens[order[state.have++]] = (hold & 0x07);
		          hold >>>= 3;
		          bits -= 3;
		        }
		        while (state.have < 19) {
		          state.lens[order[state.have++]] = 0;
		        }
		        state.lencode = state.lendyn;
		        state.lenbits = 7;
		        opts = { bits: state.lenbits };
		        ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
		        state.lenbits = opts.bits;
		        if (ret) {
		          strm.msg = 'invalid code lengths set';
		          state.mode = BAD;
		          break;
		        }
		        state.have = 0;
		        state.mode = CODELENS;
		      case CODELENS:
		        while (state.have < state.nlen + state.ndist) {
		          for (;;) {
		            here = state.lencode[hold & ((1 << state.lenbits) - 1)];
		            here_bits = here >>> 24;
		            here_op = (here >>> 16) & 0xff;
		            here_val = here & 0xffff;
		            if ((here_bits) <= bits) { break; }
		            if (have === 0) { break inf_leave; }
		            have--;
		            hold += input[next++] << bits;
		            bits += 8;
		          }
		          if (here_val < 16) {
		            hold >>>= here_bits;
		            bits -= here_bits;
		            state.lens[state.have++] = here_val;
		          }
		          else {
		            if (here_val === 16) {
		              n = here_bits + 2;
		              while (bits < n) {
		                if (have === 0) { break inf_leave; }
		                have--;
		                hold += input[next++] << bits;
		                bits += 8;
		              }
		              hold >>>= here_bits;
		              bits -= here_bits;
		              if (state.have === 0) {
		                strm.msg = 'invalid bit length repeat';
		                state.mode = BAD;
		                break;
		              }
		              len = state.lens[state.have - 1];
		              copy = 3 + (hold & 0x03);
		              hold >>>= 2;
		              bits -= 2;
		            }
		            else if (here_val === 17) {
		              n = here_bits + 3;
		              while (bits < n) {
		                if (have === 0) { break inf_leave; }
		                have--;
		                hold += input[next++] << bits;
		                bits += 8;
		              }
		              hold >>>= here_bits;
		              bits -= here_bits;
		              len = 0;
		              copy = 3 + (hold & 0x07);
		              hold >>>= 3;
		              bits -= 3;
		            }
		            else {
		              n = here_bits + 7;
		              while (bits < n) {
		                if (have === 0) { break inf_leave; }
		                have--;
		                hold += input[next++] << bits;
		                bits += 8;
		              }
		              hold >>>= here_bits;
		              bits -= here_bits;
		              len = 0;
		              copy = 11 + (hold & 0x7f);
		              hold >>>= 7;
		              bits -= 7;
		            }
		            if (state.have + copy > state.nlen + state.ndist) {
		              strm.msg = 'invalid bit length repeat';
		              state.mode = BAD;
		              break;
		            }
		            while (copy--) {
		              state.lens[state.have++] = len;
		            }
		          }
		        }
		        if (state.mode === BAD) { break; }
		        if (state.lens[256] === 0) {
		          strm.msg = 'invalid code -- missing end-of-block';
		          state.mode = BAD;
		          break;
		        }
		        state.lenbits = 9;
		        opts = { bits: state.lenbits };
		        ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
		        state.lenbits = opts.bits;
		        if (ret) {
		          strm.msg = 'invalid literal/lengths set';
		          state.mode = BAD;
		          break;
		        }
		        state.distbits = 6;
		        state.distcode = state.distdyn;
		        opts = { bits: state.distbits };
		        ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
		        state.distbits = opts.bits;
		        if (ret) {
		          strm.msg = 'invalid distances set';
		          state.mode = BAD;
		          break;
		        }
		        state.mode = LEN_;
		        if (flush === Z_TREES) { break inf_leave; }
		      case LEN_:
		        state.mode = LEN;
		      case LEN:
		        if (have >= 6 && left >= 258) {
		          strm.next_out = put;
		          strm.avail_out = left;
		          strm.next_in = next;
		          strm.avail_in = have;
		          state.hold = hold;
		          state.bits = bits;
		          inflate_fast(strm, _out);
		          put = strm.next_out;
		          output = strm.output;
		          left = strm.avail_out;
		          next = strm.next_in;
		          input = strm.input;
		          have = strm.avail_in;
		          hold = state.hold;
		          bits = state.bits;
		          if (state.mode === TYPE) {
		            state.back = -1;
		          }
		          break;
		        }
		        state.back = 0;
		        for (;;) {
		          here = state.lencode[hold & ((1 << state.lenbits) - 1)];
		          here_bits = here >>> 24;
		          here_op = (here >>> 16) & 0xff;
		          here_val = here & 0xffff;
		          if (here_bits <= bits) { break; }
		          if (have === 0) { break inf_leave; }
		          have--;
		          hold += input[next++] << bits;
		          bits += 8;
		        }
		        if (here_op && (here_op & 0xf0) === 0) {
		          last_bits = here_bits;
		          last_op = here_op;
		          last_val = here_val;
		          for (;;) {
		            here = state.lencode[last_val +
		                    ((hold & ((1 << (last_bits + last_op)) - 1)) >> last_bits)];
		            here_bits = here >>> 24;
		            here_op = (here >>> 16) & 0xff;
		            here_val = here & 0xffff;
		            if ((last_bits + here_bits) <= bits) { break; }
		            if (have === 0) { break inf_leave; }
		            have--;
		            hold += input[next++] << bits;
		            bits += 8;
		          }
		          hold >>>= last_bits;
		          bits -= last_bits;
		          state.back += last_bits;
		        }
		        hold >>>= here_bits;
		        bits -= here_bits;
		        state.back += here_bits;
		        state.length = here_val;
		        if (here_op === 0) {
		          state.mode = LIT;
		          break;
		        }
		        if (here_op & 32) {
		          state.back = -1;
		          state.mode = TYPE;
		          break;
		        }
		        if (here_op & 64) {
		          strm.msg = 'invalid literal/length code';
		          state.mode = BAD;
		          break;
		        }
		        state.extra = here_op & 15;
		        state.mode = LENEXT;
		      case LENEXT:
		        if (state.extra) {
		          n = state.extra;
		          while (bits < n) {
		            if (have === 0) { break inf_leave; }
		            have--;
		            hold += input[next++] << bits;
		            bits += 8;
		          }
		          state.length += hold & ((1 << state.extra) - 1);
		          hold >>>= state.extra;
		          bits -= state.extra;
		          state.back += state.extra;
		        }
		        state.was = state.length;
		        state.mode = DIST;
		      case DIST:
		        for (;;) {
		          here = state.distcode[hold & ((1 << state.distbits) - 1)];
		          here_bits = here >>> 24;
		          here_op = (here >>> 16) & 0xff;
		          here_val = here & 0xffff;
		          if ((here_bits) <= bits) { break; }
		          if (have === 0) { break inf_leave; }
		          have--;
		          hold += input[next++] << bits;
		          bits += 8;
		        }
		        if ((here_op & 0xf0) === 0) {
		          last_bits = here_bits;
		          last_op = here_op;
		          last_val = here_val;
		          for (;;) {
		            here = state.distcode[last_val +
		                    ((hold & ((1 << (last_bits + last_op)) - 1)) >> last_bits)];
		            here_bits = here >>> 24;
		            here_op = (here >>> 16) & 0xff;
		            here_val = here & 0xffff;
		            if ((last_bits + here_bits) <= bits) { break; }
		            if (have === 0) { break inf_leave; }
		            have--;
		            hold += input[next++] << bits;
		            bits += 8;
		          }
		          hold >>>= last_bits;
		          bits -= last_bits;
		          state.back += last_bits;
		        }
		        hold >>>= here_bits;
		        bits -= here_bits;
		        state.back += here_bits;
		        if (here_op & 64) {
		          strm.msg = 'invalid distance code';
		          state.mode = BAD;
		          break;
		        }
		        state.offset = here_val;
		        state.extra = (here_op) & 15;
		        state.mode = DISTEXT;
		      case DISTEXT:
		        if (state.extra) {
		          n = state.extra;
		          while (bits < n) {
		            if (have === 0) { break inf_leave; }
		            have--;
		            hold += input[next++] << bits;
		            bits += 8;
		          }
		          state.offset += hold & ((1 << state.extra) - 1);
		          hold >>>= state.extra;
		          bits -= state.extra;
		          state.back += state.extra;
		        }
		        if (state.offset > state.dmax) {
		          strm.msg = 'invalid distance too far back';
		          state.mode = BAD;
		          break;
		        }
		        state.mode = MATCH;
		      case MATCH:
		        if (left === 0) { break inf_leave; }
		        copy = _out - left;
		        if (state.offset > copy) {
		          copy = state.offset - copy;
		          if (copy > state.whave) {
		            if (state.sane) {
		              strm.msg = 'invalid distance too far back';
		              state.mode = BAD;
		              break;
		            }
		          }
		          if (copy > state.wnext) {
		            copy -= state.wnext;
		            from = state.wsize - copy;
		          }
		          else {
		            from = state.wnext - copy;
		          }
		          if (copy > state.length) { copy = state.length; }
		          from_source = state.window;
		        }
		        else {
		          from_source = output;
		          from = put - state.offset;
		          copy = state.length;
		        }
		        if (copy > left) { copy = left; }
		        left -= copy;
		        state.length -= copy;
		        do {
		          output[put++] = from_source[from++];
		        } while (--copy);
		        if (state.length === 0) { state.mode = LEN; }
		        break;
		      case LIT:
		        if (left === 0) { break inf_leave; }
		        output[put++] = state.length;
		        left--;
		        state.mode = LEN;
		        break;
		      case CHECK:
		        if (state.wrap) {
		          while (bits < 32) {
		            if (have === 0) { break inf_leave; }
		            have--;
		            hold |= input[next++] << bits;
		            bits += 8;
		          }
		          _out -= left;
		          strm.total_out += _out;
		          state.total += _out;
		          if (_out) {
		            strm.adler = state.check =
		                (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));
		          }
		          _out = left;
		          if ((state.flags ? hold : zswap32(hold)) !== state.check) {
		            strm.msg = 'incorrect data check';
		            state.mode = BAD;
		            break;
		          }
		          hold = 0;
		          bits = 0;
		        }
		        state.mode = LENGTH;
		      case LENGTH:
		        if (state.wrap && state.flags) {
		          while (bits < 32) {
		            if (have === 0) { break inf_leave; }
		            have--;
		            hold += input[next++] << bits;
		            bits += 8;
		          }
		          if (hold !== (state.total & 0xffffffff)) {
		            strm.msg = 'incorrect length check';
		            state.mode = BAD;
		            break;
		          }
		          hold = 0;
		          bits = 0;
		        }
		        state.mode = DONE;
		      case DONE:
		        ret = Z_STREAM_END;
		        break inf_leave;
		      case BAD:
		        ret = Z_DATA_ERROR;
		        break inf_leave;
		      case MEM:
		        return Z_MEM_ERROR;
		      case SYNC:
		      default:
		        return Z_STREAM_ERROR;
		    }
		  }
		  strm.next_out = put;
		  strm.avail_out = left;
		  strm.next_in = next;
		  strm.avail_in = have;
		  state.hold = hold;
		  state.bits = bits;
		  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
		                      (state.mode < CHECK || flush !== Z_FINISH))) {
		    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
		  }
		  _in -= strm.avail_in;
		  _out -= strm.avail_out;
		  strm.total_in += _in;
		  strm.total_out += _out;
		  state.total += _out;
		  if (state.wrap && _out) {
		    strm.adler = state.check =
		      (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
		  }
		  strm.data_type = state.bits + (state.last ? 64 : 0) +
		                    (state.mode === TYPE ? 128 : 0) +
		                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
		  if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
		    ret = Z_BUF_ERROR;
		  }
		  return ret;
		}
		function inflateEnd(strm) {
		  if (!strm || !strm.state ) {
		    return Z_STREAM_ERROR;
		  }
		  var state = strm.state;
		  if (state.window) {
		    state.window = null;
		  }
		  strm.state = null;
		  return Z_OK;
		}
		function inflateGetHeader(strm, head) {
		  var state;
		  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
		  state = strm.state;
		  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }
		  state.head = head;
		  head.done = false;
		  return Z_OK;
		}
		function inflateSetDictionary(strm, dictionary) {
		  var dictLength = dictionary.length;
		  var state;
		  var dictid;
		  var ret;
		  if (!strm  || !strm.state ) { return Z_STREAM_ERROR; }
		  state = strm.state;
		  if (state.wrap !== 0 && state.mode !== DICT) {
		    return Z_STREAM_ERROR;
		  }
		  if (state.mode === DICT) {
		    dictid = 1;
		    dictid = adler32(dictid, dictionary, dictLength, 0);
		    if (dictid !== state.check) {
		      return Z_DATA_ERROR;
		    }
		  }
		  ret = updatewindow(strm, dictionary, dictLength, dictLength);
		  if (ret) {
		    state.mode = MEM;
		    return Z_MEM_ERROR;
		  }
		  state.havedict = 1;
		  return Z_OK;
		}
		inflate.inflateReset = inflateReset;
		inflate.inflateReset2 = inflateReset2;
		inflate.inflateResetKeep = inflateResetKeep;
		inflate.inflateInit = inflateInit;
		inflate.inflateInit2 = inflateInit2;
		inflate.inflate = inflate$1;
		inflate.inflateEnd = inflateEnd;
		inflate.inflateGetHeader = inflateGetHeader;
		inflate.inflateSetDictionary = inflateSetDictionary;
		inflate.inflateInfo = 'pako inflate (from Nodeca project)';
		return inflate;
	}

	var constants;
	var hasRequiredConstants;
	function requireConstants () {
		if (hasRequiredConstants) return constants;
		hasRequiredConstants = 1;
		constants = {
		  Z_NO_FLUSH:         0,
		  Z_PARTIAL_FLUSH:    1,
		  Z_SYNC_FLUSH:       2,
		  Z_FULL_FLUSH:       3,
		  Z_FINISH:           4,
		  Z_BLOCK:            5,
		  Z_TREES:            6,
		  Z_OK:               0,
		  Z_STREAM_END:       1,
		  Z_NEED_DICT:        2,
		  Z_ERRNO:           -1,
		  Z_STREAM_ERROR:    -2,
		  Z_DATA_ERROR:      -3,
		  Z_BUF_ERROR:       -5,
		  Z_NO_COMPRESSION:         0,
		  Z_BEST_SPEED:             1,
		  Z_BEST_COMPRESSION:       9,
		  Z_DEFAULT_COMPRESSION:   -1,
		  Z_FILTERED:               1,
		  Z_HUFFMAN_ONLY:           2,
		  Z_RLE:                    3,
		  Z_FIXED:                  4,
		  Z_DEFAULT_STRATEGY:       0,
		  Z_BINARY:                 0,
		  Z_TEXT:                   1,
		  Z_UNKNOWN:                2,
		  Z_DEFLATED:               8
		};
		return constants;
	}

	var gzheader;
	var hasRequiredGzheader;
	function requireGzheader () {
		if (hasRequiredGzheader) return gzheader;
		hasRequiredGzheader = 1;
		function GZheader() {
		  this.text       = 0;
		  this.time       = 0;
		  this.xflags     = 0;
		  this.os         = 0;
		  this.extra      = null;
		  this.extra_len  = 0;
		  this.name       = '';
		  this.comment    = '';
		  this.hcrc       = 0;
		  this.done       = false;
		}
		gzheader = GZheader;
		return gzheader;
	}

	var hasRequiredInflate;
	function requireInflate () {
		if (hasRequiredInflate) return inflate$1;
		hasRequiredInflate = 1;
		var zlib_inflate = requireInflate$1();
		var utils        = requireCommon();
		var strings      = requireStrings();
		var c            = requireConstants();
		var msg          = requireMessages();
		var ZStream      = requireZstream();
		var GZheader     = requireGzheader();
		var toString = Object.prototype.toString;
		function Inflate(options) {
		  if (!(this instanceof Inflate)) return new Inflate(options);
		  this.options = utils.assign({
		    chunkSize: 16384,
		    windowBits: 0,
		    to: ''
		  }, options || {});
		  var opt = this.options;
		  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
		    opt.windowBits = -opt.windowBits;
		    if (opt.windowBits === 0) { opt.windowBits = -15; }
		  }
		  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
		      !(options && options.windowBits)) {
		    opt.windowBits += 32;
		  }
		  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
		    if ((opt.windowBits & 15) === 0) {
		      opt.windowBits |= 15;
		    }
		  }
		  this.err    = 0;
		  this.msg    = '';
		  this.ended  = false;
		  this.chunks = [];
		  this.strm   = new ZStream();
		  this.strm.avail_out = 0;
		  var status  = zlib_inflate.inflateInit2(
		    this.strm,
		    opt.windowBits
		  );
		  if (status !== c.Z_OK) {
		    throw new Error(msg[status]);
		  }
		  this.header = new GZheader();
		  zlib_inflate.inflateGetHeader(this.strm, this.header);
		  if (opt.dictionary) {
		    if (typeof opt.dictionary === 'string') {
		      opt.dictionary = strings.string2buf(opt.dictionary);
		    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
		      opt.dictionary = new Uint8Array(opt.dictionary);
		    }
		    if (opt.raw) {
		      status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
		      if (status !== c.Z_OK) {
		        throw new Error(msg[status]);
		      }
		    }
		  }
		}
		Inflate.prototype.push = function (data, mode) {
		  var strm = this.strm;
		  var chunkSize = this.options.chunkSize;
		  var dictionary = this.options.dictionary;
		  var status, _mode;
		  var next_out_utf8, tail, utf8str;
		  var allowBufError = false;
		  if (this.ended) { return false; }
		  _mode = (mode === ~~mode) ? mode : ((mode === true) ? c.Z_FINISH : c.Z_NO_FLUSH);
		  if (typeof data === 'string') {
		    strm.input = strings.binstring2buf(data);
		  } else if (toString.call(data) === '[object ArrayBuffer]') {
		    strm.input = new Uint8Array(data);
		  } else {
		    strm.input = data;
		  }
		  strm.next_in = 0;
		  strm.avail_in = strm.input.length;
		  do {
		    if (strm.avail_out === 0) {
		      strm.output = new utils.Buf8(chunkSize);
		      strm.next_out = 0;
		      strm.avail_out = chunkSize;
		    }
		    status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
		    if (status === c.Z_NEED_DICT && dictionary) {
		      status = zlib_inflate.inflateSetDictionary(this.strm, dictionary);
		    }
		    if (status === c.Z_BUF_ERROR && allowBufError === true) {
		      status = c.Z_OK;
		      allowBufError = false;
		    }
		    if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
		      this.onEnd(status);
		      this.ended = true;
		      return false;
		    }
		    if (strm.next_out) {
		      if (strm.avail_out === 0 || status === c.Z_STREAM_END || (strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH))) {
		        if (this.options.to === 'string') {
		          next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
		          tail = strm.next_out - next_out_utf8;
		          utf8str = strings.buf2string(strm.output, next_out_utf8);
		          strm.next_out = tail;
		          strm.avail_out = chunkSize - tail;
		          if (tail) { utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0); }
		          this.onData(utf8str);
		        } else {
		          this.onData(utils.shrinkBuf(strm.output, strm.next_out));
		        }
		      }
		    }
		    if (strm.avail_in === 0 && strm.avail_out === 0) {
		      allowBufError = true;
		    }
		  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);
		  if (status === c.Z_STREAM_END) {
		    _mode = c.Z_FINISH;
		  }
		  if (_mode === c.Z_FINISH) {
		    status = zlib_inflate.inflateEnd(this.strm);
		    this.onEnd(status);
		    this.ended = true;
		    return status === c.Z_OK;
		  }
		  if (_mode === c.Z_SYNC_FLUSH) {
		    this.onEnd(c.Z_OK);
		    strm.avail_out = 0;
		    return true;
		  }
		  return true;
		};
		Inflate.prototype.onData = function (chunk) {
		  this.chunks.push(chunk);
		};
		Inflate.prototype.onEnd = function (status) {
		  if (status === c.Z_OK) {
		    if (this.options.to === 'string') {
		      this.result = this.chunks.join('');
		    } else {
		      this.result = utils.flattenChunks(this.chunks);
		    }
		  }
		  this.chunks = [];
		  this.err = status;
		  this.msg = this.strm.msg;
		};
		function inflate(input, options) {
		  var inflator = new Inflate(options);
		  inflator.push(input, true);
		  if (inflator.err) { throw inflator.msg || msg[inflator.err]; }
		  return inflator.result;
		}
		function inflateRaw(input, options) {
		  options = options || {};
		  options.raw = true;
		  return inflate(input, options);
		}
		inflate$1.Inflate = Inflate;
		inflate$1.inflate = inflate;
		inflate$1.inflateRaw = inflateRaw;
		inflate$1.ungzip  = inflate;
		return inflate$1;
	}

	var pako_1;
	var hasRequiredPako;
	function requirePako () {
		if (hasRequiredPako) return pako_1;
		hasRequiredPako = 1;
		var assign    = requireCommon().assign;
		var deflate   = requireDeflate();
		var inflate   = requireInflate();
		var constants = requireConstants();
		var pako = {};
		assign(pako, deflate, inflate, constants);
		pako_1 = pako;
		return pako_1;
	}

	var hasRequiredUPNG;
	function requireUPNG () {
		if (hasRequiredUPNG) return UPNG$1.exports;
		hasRequiredUPNG = 1;
		(function (module) {
	(function(){
			var UPNG = {};
			var pako;
			{module.exports = UPNG;}
			if (typeof commonjsRequire == "function") {pako = requirePako();}  else {pako = window.pako;}
			(function(UPNG, pako){
			UPNG.toRGBA8 = function(out)
			{
				var w = out.width, h = out.height;
				if(out.tabs.acTL==null) return [UPNG.toRGBA8.decodeImage(out.data, w, h, out).buffer];
				var frms = [];
				if(out.frames[0].data==null) out.frames[0].data = out.data;
				var img, empty = new Uint8Array(w*h*4);
				for(var i=0; i<out.frames.length; i++)
				{
					var frm = out.frames[i];
					var fx=frm.rect.x, fy=frm.rect.y, fw = frm.rect.width, fh = frm.rect.height;
					var fdata = UPNG.toRGBA8.decodeImage(frm.data, fw,fh, out);
					if(i==0) img = fdata;
					else if(frm.blend  ==0) UPNG._copyTile(fdata, fw, fh, img, w, h, fx, fy, 0);
					else if(frm.blend  ==1) UPNG._copyTile(fdata, fw, fh, img, w, h, fx, fy, 1);
					frms.push(img.buffer);  img = img.slice(0);
					if     (frm.dispose==0) ;
					else if(frm.dispose==1) UPNG._copyTile(empty, fw, fh, img, w, h, fx, fy, 0);
					else if(frm.dispose==2) {
						var pi = i-1;
						while(out.frames[pi].dispose==2) pi--;
						img = new Uint8Array(frms[pi]).slice(0);
					}
				}
				return frms;
			};
			UPNG.toRGBA8.decodeImage = function(data, w, h, out)
			{
				var area = w*h, bpp = UPNG.decode._getBPP(out);
				var bpl = Math.ceil(w*bpp/8);
				var bf = new Uint8Array(area*4), bf32 = new Uint32Array(bf.buffer);
				var ctype = out.ctype, depth = out.depth;
				var rs = UPNG._bin.readUshort;
				if     (ctype==6) {
					var qarea = area<<2;
					if(depth== 8) for(var i=0; i<qarea;i++) {  bf[i] = data[i];   }
					if(depth==16) for(var i=0; i<qarea;i++) {  bf[i] = data[i<<1];  }
				}
				else if(ctype==2) {
					var ts=out.tabs["tRNS"], tr=-1, tg=-1, tb=-1;
					if(ts) {  tr=ts[0];  tg=ts[1];  tb=ts[2];  }
					if(depth== 8) for(var i=0; i<area; i++) {  var qi=i<<2, ti=i*3;  bf[qi] = data[ti];  bf[qi+1] = data[ti+1];  bf[qi+2] = data[ti+2];  bf[qi+3] = 255;
						if(tr!=-1 && data[ti]   ==tr && data[ti+1]   ==tg && data[ti+2]   ==tb) bf[qi+3] = 0;  }
					if(depth==16) for(var i=0; i<area; i++) {  var qi=i<<2, ti=i*6;  bf[qi] = data[ti];  bf[qi+1] = data[ti+2];  bf[qi+2] = data[ti+4];  bf[qi+3] = 255;
						if(tr!=-1 && rs(data,ti)==tr && rs(data,ti+2)==tg && rs(data,ti+4)==tb) bf[qi+3] = 0;  }
				}
				else if(ctype==3) {
					var p=out.tabs["PLTE"], ap=out.tabs["tRNS"], tl=ap?ap.length:0;
					if(depth==1) for(var y=0; y<h; y++) {  var s0 = y*bpl, t0 = y*w;
						for(var i=0; i<w; i++) { var qi=(t0+i)<<2, j=((data[s0+(i>>3)]>>(7-((i&7)<<0)))& 1), cj=3*j;  bf[qi]=p[cj];  bf[qi+1]=p[cj+1];  bf[qi+2]=p[cj+2];  bf[qi+3]=(j<tl)?ap[j]:255;  }
					}
					if(depth==2) for(var y=0; y<h; y++) {  var s0 = y*bpl, t0 = y*w;
						for(var i=0; i<w; i++) { var qi=(t0+i)<<2, j=((data[s0+(i>>2)]>>(6-((i&3)<<1)))& 3), cj=3*j;  bf[qi]=p[cj];  bf[qi+1]=p[cj+1];  bf[qi+2]=p[cj+2];  bf[qi+3]=(j<tl)?ap[j]:255;  }
					}
					if(depth==4) for(var y=0; y<h; y++) {  var s0 = y*bpl, t0 = y*w;
						for(var i=0; i<w; i++) { var qi=(t0+i)<<2, j=((data[s0+(i>>1)]>>(4-((i&1)<<2)))&15), cj=3*j;  bf[qi]=p[cj];  bf[qi+1]=p[cj+1];  bf[qi+2]=p[cj+2];  bf[qi+3]=(j<tl)?ap[j]:255;  }
					}
					if(depth==8) for(var i=0; i<area; i++ ) {  var qi=i<<2, j=data[i]                      , cj=3*j;  bf[qi]=p[cj];  bf[qi+1]=p[cj+1];  bf[qi+2]=p[cj+2];  bf[qi+3]=(j<tl)?ap[j]:255;  }
				}
				else if(ctype==4) {
					if(depth== 8)  for(var i=0; i<area; i++) {  var qi=i<<2, di=i<<1, gr=data[di];  bf[qi]=gr;  bf[qi+1]=gr;  bf[qi+2]=gr;  bf[qi+3]=data[di+1];  }
					if(depth==16)  for(var i=0; i<area; i++) {  var qi=i<<2, di=i<<2, gr=data[di];  bf[qi]=gr;  bf[qi+1]=gr;  bf[qi+2]=gr;  bf[qi+3]=data[di+2];  }
				}
				else if(ctype==0) {
					var tr = out.tabs["tRNS"] ? out.tabs["tRNS"] : -1;
					if(depth== 1) for(var i=0; i<area; i++) {  var gr=255*((data[i>>3]>>(7 -((i&7)   )))& 1), al=(gr==tr*255)?0:255;  bf32[i]=(al<<24)|(gr<<16)|(gr<<8)|gr;  }
					if(depth== 2) for(var i=0; i<area; i++) {  var gr= 85*((data[i>>2]>>(6 -((i&3)<<1)))& 3), al=(gr==tr* 85)?0:255;  bf32[i]=(al<<24)|(gr<<16)|(gr<<8)|gr;  }
					if(depth== 4) for(var i=0; i<area; i++) {  var gr= 17*((data[i>>1]>>(4 -((i&1)<<2)))&15), al=(gr==tr* 17)?0:255;  bf32[i]=(al<<24)|(gr<<16)|(gr<<8)|gr;  }
					if(depth== 8) for(var i=0; i<area; i++) {  var gr=data[i  ] , al=(gr           ==tr)?0:255;  bf32[i]=(al<<24)|(gr<<16)|(gr<<8)|gr;  }
					if(depth==16) for(var i=0; i<area; i++) {  var gr=data[i<<1], al=(rs(data,i<<1)==tr)?0:255;  bf32[i]=(al<<24)|(gr<<16)|(gr<<8)|gr;  }
				}
				return bf;
			};
			UPNG.decode = function(buff)
			{
				var data = new Uint8Array(buff), offset = 8, bin = UPNG._bin, rUs = bin.readUshort, rUi = bin.readUint;
				var out = {tabs:{}, frames:[]};
				var dd = new Uint8Array(data.length), doff = 0;
				var fd, foff = 0;
				var mgck = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
				for(var i=0; i<8; i++) if(data[i]!=mgck[i]) throw "The input is not a PNG file!";
				while(offset<data.length)
				{
					var len  = bin.readUint(data, offset);  offset += 4;
					var type = bin.readASCII(data, offset, 4);  offset += 4;
					if     (type=="IHDR")  {  UPNG.decode._IHDR(data, offset, out);  }
					else if(type=="IDAT") {
						for(var i=0; i<len; i++) dd[doff+i] = data[offset+i];
						doff += len;
					}
					else if(type=="acTL")  {
						out.tabs[type] = {  num_frames:rUi(data, offset), num_plays:rUi(data, offset+4)  };
						fd = new Uint8Array(data.length);
					}
					else if(type=="fcTL")  {
						if(foff!=0) {  var fr = out.frames[out.frames.length-1];
							fr.data = UPNG.decode._decompress(out, fd.slice(0,foff), fr.rect.width, fr.rect.height);  foff=0;
						}
						var rct = {x:rUi(data, offset+12),y:rUi(data, offset+16),width:rUi(data, offset+4),height:rUi(data, offset+8)};
						var del = rUs(data, offset+22);  del = rUs(data, offset+20) / (del==0?100:del);
						var frm = {rect:rct, delay:Math.round(del*1000), dispose:data[offset+24], blend:data[offset+25]};
						out.frames.push(frm);
					}
					else if(type=="fdAT") {
						for(var i=0; i<len-4; i++) fd[foff+i] = data[offset+i+4];
						foff += len-4;
					}
					else if(type=="pHYs") {
						out.tabs[type] = [bin.readUint(data, offset), bin.readUint(data, offset+4), data[offset+8]];
					}
					else if(type=="cHRM") {
						out.tabs[type] = [];
						for(var i=0; i<8; i++) out.tabs[type].push(bin.readUint(data, offset+i*4));
					}
					else if(type=="tEXt") {
						if(out.tabs[type]==null) out.tabs[type] = {};
						var nz = bin.nextZero(data, offset);
						var keyw = bin.readASCII(data, offset, nz-offset);
						var text = bin.readASCII(data, nz+1, offset+len-nz-1);
						out.tabs[type][keyw] = text;
					}
					else if(type=="iTXt") {
						if(out.tabs[type]==null) out.tabs[type] = {};
						var nz = 0, off = offset;
						nz = bin.nextZero(data, off);
						var keyw = bin.readASCII(data, off, nz-off);  off = nz + 1;
						data[off]; data[off+1];  off+=2;
						nz = bin.nextZero(data, off);
						bin.readASCII(data, off, nz-off);  off = nz + 1;
						nz = bin.nextZero(data, off);
						bin.readUTF8(data, off, nz-off);  off = nz + 1;
						var text  = bin.readUTF8(data, off, len-(off-offset));
						out.tabs[type][keyw] = text;
					}
					else if(type=="PLTE") {
						out.tabs[type] = bin.readBytes(data, offset, len);
					}
					else if(type=="hIST") {
						var pl = out.tabs["PLTE"].length/3;
						out.tabs[type] = [];  for(var i=0; i<pl; i++) out.tabs[type].push(rUs(data, offset+i*2));
					}
					else if(type=="tRNS") {
						if     (out.ctype==3) out.tabs[type] = bin.readBytes(data, offset, len);
						else if(out.ctype==0) out.tabs[type] = rUs(data, offset);
						else if(out.ctype==2) out.tabs[type] = [ rUs(data,offset),rUs(data,offset+2),rUs(data,offset+4) ];
					}
					else if(type=="gAMA") out.tabs[type] = bin.readUint(data, offset)/100000;
					else if(type=="sRGB") out.tabs[type] = data[offset];
					else if(type=="bKGD")
					{
						if     (out.ctype==0 || out.ctype==4) out.tabs[type] = [rUs(data, offset)];
						else if(out.ctype==2 || out.ctype==6) out.tabs[type] = [rUs(data, offset), rUs(data, offset+2), rUs(data, offset+4)];
						else if(out.ctype==3) out.tabs[type] = data[offset];
					}
					else if(type=="IEND") {
						if(foff!=0) {  var fr = out.frames[out.frames.length-1];
							fr.data = UPNG.decode._decompress(out, fd.slice(0,foff), fr.rect.width, fr.rect.height);  foff=0;
						}
						out.data = UPNG.decode._decompress(out, dd, out.width, out.height);  break;
					}
					offset += len;
					bin.readUint(data, offset);  offset += 4;
				}
				delete out.compress;  delete out.interlace;  delete out.filter;
				return out;
			};
			UPNG.decode._decompress = function(out, dd, w, h) {
				if(out.compress ==0) dd = UPNG.decode._inflate(dd);
				if     (out.interlace==0) dd = UPNG.decode._filterZero(dd, out, 0, w, h);
				else if(out.interlace==1) dd = UPNG.decode._readInterlace(dd, out);
				return dd;
			};
			UPNG.decode._inflate = function(data) {  return pako["inflate"](data);  };
			UPNG.decode._readInterlace = function(data, out)
			{
				var w = out.width, h = out.height;
				var bpp = UPNG.decode._getBPP(out), cbpp = bpp>>3, bpl = Math.ceil(w*bpp/8);
				var img = new Uint8Array( h * bpl );
				var di = 0;
				var starting_row  = [ 0, 0, 4, 0, 2, 0, 1 ];
				var starting_col  = [ 0, 4, 0, 2, 0, 1, 0 ];
				var row_increment = [ 8, 8, 8, 4, 4, 2, 2 ];
				var col_increment = [ 8, 8, 4, 4, 2, 2, 1 ];
				var pass=0;
				while(pass<7)
				{
					var ri = row_increment[pass], ci = col_increment[pass];
					var sw = 0, sh = 0;
					var cr = starting_row[pass];  while(cr<h) {  cr+=ri;  sh++;  }
					var cc = starting_col[pass];  while(cc<w) {  cc+=ci;  sw++;  }
					var bpll = Math.ceil(sw*bpp/8);
					UPNG.decode._filterZero(data, out, di, sw, sh);
					var y=0, row = starting_row[pass];
					while(row<h)
					{
						var col = starting_col[pass];
						var cdi = (di+y*bpll)<<3;
						while(col<w)
						{
							if(bpp==1) {
								var val = data[cdi>>3];  val = (val>>(7-(cdi&7)))&1;
								img[row*bpl + (col>>3)] |= (val << (7-((col&3)<<0)));
							}
							if(bpp==2) {
								var val = data[cdi>>3];  val = (val>>(6-(cdi&7)))&3;
								img[row*bpl + (col>>2)] |= (val << (6-((col&3)<<1)));
							}
							if(bpp==4) {
								var val = data[cdi>>3];  val = (val>>(4-(cdi&7)))&15;
								img[row*bpl + (col>>1)] |= (val << (4-((col&1)<<2)));
							}
							if(bpp>=8) {
								var ii = row*bpl+col*cbpp;
								for(var j=0; j<cbpp; j++) img[ii+j] = data[(cdi>>3)+j];
							}
							cdi+=bpp;  col+=ci;
						}
						y++;  row += ri;
					}
					if(sw*sh!=0) di += sh * (1 + bpll);
					pass = pass + 1;
				}
				return img;
			};
			UPNG.decode._getBPP = function(out) {
				var noc = [1,null,3,1,2,null,4][out.ctype];
				return noc * out.depth;
			};
			UPNG.decode._filterZero = function(data, out, off, w, h)
			{
				var bpp = UPNG.decode._getBPP(out), bpl = Math.ceil(w*bpp/8), paeth = UPNG.decode._paeth;
				bpp = Math.ceil(bpp/8);
				for(var y=0; y<h; y++)  {
					var i = off+y*bpl, di = i+y+1;
					var type = data[di-1];
					if     (type==0) for(var x=  0; x<bpl; x++) data[i+x] = data[di+x];
					else if(type==1) {
						for(var x=  0; x<bpp; x++) data[i+x] = data[di+x];
						for(var x=bpp; x<bpl; x++) data[i+x] = (data[di+x] + data[i+x-bpp])&255;
					}
					else if(y==0) {
						for(var x=  0; x<bpp; x++) data[i+x] = data[di+x];
						if(type==2) for(var x=bpp; x<bpl; x++) data[i+x] = (data[di+x])&255;
						if(type==3) for(var x=bpp; x<bpl; x++) data[i+x] = (data[di+x] + (data[i+x-bpp]>>1) )&255;
						if(type==4) for(var x=bpp; x<bpl; x++) data[i+x] = (data[di+x] + paeth(data[i+x-bpp], 0, 0) )&255;
					}
					else {
						if(type==2) { for(var x=  0; x<bpl; x++) data[i+x] = (data[di+x] + data[i+x-bpl])&255;  }
						if(type==3) { for(var x=  0; x<bpp; x++) data[i+x] = (data[di+x] + (data[i+x-bpl]>>1))&255;
						              for(var x=bpp; x<bpl; x++) data[i+x] = (data[di+x] + ((data[i+x-bpl]+data[i+x-bpp])>>1) )&255;  }
						if(type==4) { for(var x=  0; x<bpp; x++) data[i+x] = (data[di+x] + paeth(0, data[i+x-bpl], 0))&255;
									  for(var x=bpp; x<bpl; x++) data[i+x] = (data[di+x] + paeth(data[i+x-bpp], data[i+x-bpl], data[i+x-bpp-bpl]) )&255;  }
					}
				}
				return data;
			};
			UPNG.decode._paeth = function(a,b,c)
			{
				var p = a+b-c, pa = Math.abs(p-a), pb = Math.abs(p-b), pc = Math.abs(p-c);
				if (pa <= pb && pa <= pc)  return a;
				else if (pb <= pc)  return b;
				return c;
			};
			UPNG.decode._IHDR = function(data, offset, out)
			{
				var bin = UPNG._bin;
				out.width  = bin.readUint(data, offset);  offset += 4;
				out.height = bin.readUint(data, offset);  offset += 4;
				out.depth     = data[offset];  offset++;
				out.ctype     = data[offset];  offset++;
				out.compress  = data[offset];  offset++;
				out.filter    = data[offset];  offset++;
				out.interlace = data[offset];  offset++;
			};
			UPNG._bin = {
				nextZero   : function(data,p)  {  while(data[p]!=0) p++;  return p;  },
				readUshort : function(buff,p)  {  return (buff[p]<< 8) | buff[p+1];  },
				writeUshort: function(buff,p,n){  buff[p] = (n>>8)&255;  buff[p+1] = n&255;  },
				readUint   : function(buff,p)  {  return (buff[p]*(256*256*256)) + ((buff[p+1]<<16) | (buff[p+2]<< 8) | buff[p+3]);  },
				writeUint  : function(buff,p,n){  buff[p]=(n>>24)&255;  buff[p+1]=(n>>16)&255;  buff[p+2]=(n>>8)&255;  buff[p+3]=n&255;  },
				readASCII  : function(buff,p,l){  var s = "";  for(var i=0; i<l; i++) s += String.fromCharCode(buff[p+i]);  return s;    },
				writeASCII : function(data,p,s){  for(var i=0; i<s.length; i++) data[p+i] = s.charCodeAt(i);  },
				readBytes  : function(buff,p,l){  var arr = [];   for(var i=0; i<l; i++) arr.push(buff[p+i]);   return arr;  },
				pad : function(n) { return n.length < 2 ? "0" + n : n; },
				readUTF8 : function(buff, p, l) {
					var s = "", ns;
					for(var i=0; i<l; i++) s += "%" + UPNG._bin.pad(buff[p+i].toString(16));
					try {  ns = decodeURIComponent(s); }
					catch(e) {  return UPNG._bin.readASCII(buff, p, l);  }
					return  ns;
				}
			};
			UPNG._copyTile = function(sb, sw, sh, tb, tw, th, xoff, yoff, mode)
			{
				var w = Math.min(sw,tw), h = Math.min(sh,th);
				var si=0, ti=0;
				for(var y=0; y<h; y++)
					for(var x=0; x<w; x++)
					{
						if(xoff>=0 && yoff>=0) {  si = (y*sw+x)<<2;  ti = (( yoff+y)*tw+xoff+x)<<2;  }
						else                   {  si = ((-yoff+y)*sw-xoff+x)<<2;  ti = (y*tw+x)<<2;  }
						if     (mode==0) {  tb[ti] = sb[si];  tb[ti+1] = sb[si+1];  tb[ti+2] = sb[si+2];  tb[ti+3] = sb[si+3];  }
						else if(mode==1) {
							var fa = sb[si+3]*(1/255), fr=sb[si]*fa, fg=sb[si+1]*fa, fb=sb[si+2]*fa;
							var ba = tb[ti+3]*(1/255), br=tb[ti]*ba, bg=tb[ti+1]*ba, bb=tb[ti+2]*ba;
							var ifa=1-fa, oa = fa+ba*ifa, ioa = (oa==0?0:1/oa);
							tb[ti+3] = 255*oa;
							tb[ti+0] = (fr+br*ifa)*ioa;
							tb[ti+1] = (fg+bg*ifa)*ioa;
							tb[ti+2] = (fb+bb*ifa)*ioa;
						}
						else if(mode==2){
							var fa = sb[si+3], fr=sb[si], fg=sb[si+1], fb=sb[si+2];
							var ba = tb[ti+3], br=tb[ti], bg=tb[ti+1], bb=tb[ti+2];
							if(fa==ba && fr==br && fg==bg && fb==bb) {  tb[ti]=0;  tb[ti+1]=0;  tb[ti+2]=0;  tb[ti+3]=0;  }
							else {  tb[ti]=fr;  tb[ti+1]=fg;  tb[ti+2]=fb;  tb[ti+3]=fa;  }
						}
						else if(mode==3){
							var fa = sb[si+3], fr=sb[si], fg=sb[si+1], fb=sb[si+2];
							var ba = tb[ti+3], br=tb[ti], bg=tb[ti+1], bb=tb[ti+2];
							if(fa==ba && fr==br && fg==bg && fb==bb) continue;
							if(fa<220 && ba>20) return false;
						}
					}
				return true;
			};
			UPNG.encode = function(bufs, w, h, ps, dels, forbidPlte)
			{
				if(ps==null) ps=0;
				if(forbidPlte==null) forbidPlte = false;
				var data = new Uint8Array(bufs[0].byteLength*bufs.length+100);
				var wr=[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
				for(var i=0; i<8; i++) data[i]=wr[i];
				var offset = 8,  bin = UPNG._bin, crc = UPNG.crc.crc, wUi = bin.writeUint, wUs = bin.writeUshort, wAs = bin.writeASCII;
				var nimg = UPNG.encode.compressPNG(bufs, w, h, ps, forbidPlte);
				wUi(data,offset, 13);     offset+=4;
				wAs(data,offset,"IHDR");  offset+=4;
				wUi(data,offset,w);  offset+=4;
				wUi(data,offset,h);  offset+=4;
				data[offset] = nimg.depth;  offset++;
				data[offset] = nimg.ctype;  offset++;
				data[offset] = 0;  offset++;
				data[offset] = 0;  offset++;
				data[offset] = 0;  offset++;
				wUi(data,offset,crc(data,offset-17,17));  offset+=4;
				wUi(data,offset, 1);      offset+=4;
				wAs(data,offset,"sRGB");  offset+=4;
				data[offset] = 1;  offset++;
				wUi(data,offset,crc(data,offset-5,5));  offset+=4;
				var anim = bufs.length>1;
				if(anim) {
					wUi(data,offset, 8);      offset+=4;
					wAs(data,offset,"acTL");  offset+=4;
					wUi(data,offset, bufs.length);      offset+=4;
					wUi(data,offset, 0);      offset+=4;
					wUi(data,offset,crc(data,offset-12,12));  offset+=4;
				}
				if(nimg.ctype==3) {
					var dl = nimg.plte.length;
					wUi(data,offset, dl*3);  offset+=4;
					wAs(data,offset,"PLTE");  offset+=4;
					for(var i=0; i<dl; i++){
						var ti=i*3, c=nimg.plte[i], r=(c)&255, g=(c>>8)&255, b=(c>>16)&255;
						data[offset+ti+0]=r;  data[offset+ti+1]=g;  data[offset+ti+2]=b;
					}
					offset+=dl*3;
					wUi(data,offset,crc(data,offset-dl*3-4,dl*3+4));  offset+=4;
					if(nimg.gotAlpha) {
						wUi(data,offset, dl);  offset+=4;
						wAs(data,offset,"tRNS");  offset+=4;
						for(var i=0; i<dl; i++)  data[offset+i]=(nimg.plte[i]>>24)&255;
						offset+=dl;
						wUi(data,offset,crc(data,offset-dl-4,dl+4));  offset+=4;
					}
				}
				var fi = 0;
				for(var j=0; j<nimg.frames.length; j++)
				{
					var fr = nimg.frames[j];
					if(anim) {
						wUi(data,offset, 26);     offset+=4;
						wAs(data,offset,"fcTL");  offset+=4;
						wUi(data, offset, fi++);   offset+=4;
						wUi(data, offset, fr.rect.width );   offset+=4;
						wUi(data, offset, fr.rect.height);   offset+=4;
						wUi(data, offset, fr.rect.x);   offset+=4;
						wUi(data, offset, fr.rect.y);   offset+=4;
						wUs(data, offset, dels[j]);   offset+=2;
						wUs(data, offset,  1000);   offset+=2;
						data[offset] = fr.dispose;  offset++;
						data[offset] = fr.blend  ;  offset++;
						wUi(data,offset,crc(data,offset-30,30));  offset+=4;
					}
					var imgd = fr.cimg, dl = imgd.length;
					wUi(data,offset, dl+(j==0?0:4));     offset+=4;
					var ioff = offset;
					wAs(data,offset,(j==0)?"IDAT":"fdAT");  offset+=4;
					if(j!=0) {  wUi(data, offset, fi++);  offset+=4;  }
					for(var i=0; i<dl; i++) data[offset+i] = imgd[i];
					offset += dl;
					wUi(data,offset,crc(data,ioff,offset-ioff));  offset+=4;
				}
				wUi(data,offset, 0);     offset+=4;
				wAs(data,offset,"IEND");  offset+=4;
				wUi(data,offset,crc(data,offset-4,4));  offset+=4;
				return data.buffer.slice(0,offset);
			};
			UPNG.encode.compressPNG = function(bufs, w, h, ps, forbidPlte)
			{
				var out = UPNG.encode.compress(bufs, w, h, ps, false, forbidPlte);
				for(var i=0; i<bufs.length; i++) {
					var frm = out.frames[i]; frm.rect.width; var nh=frm.rect.height, bpl=frm.bpl, bpp=frm.bpp;
					var fdata = new Uint8Array(nh*bpl+nh);
					frm.cimg = UPNG.encode._filterZero(frm.img,nh,bpp,bpl,fdata);
				}
				return out;
			};
			UPNG.encode.compress = function(bufs, w, h, ps, forGIF, forbidPlte)
			{
				if(forbidPlte==null) forbidPlte = false;
				var ctype = 6, depth = 8, bpp = 4, alphaAnd=255;
				for(var j=0; j<bufs.length; j++)  {
					var img = new Uint8Array(bufs[j]), ilen = img.length;
					for(var i=0; i<ilen; i+=4) alphaAnd &= img[i+3];
				}
				var gotAlpha = (alphaAnd)!=255;
				var cmap={}, plte=[];  if(bufs.length!=0) {  cmap[0]=0;  plte.push(0);  if(ps!=0) ps--;  }
				if(ps!=0) {
					var qres = UPNG.quantize(bufs, ps, forGIF);  bufs = qres.bufs;
					for(var i=0; i<qres.plte.length; i++) {  var c=qres.plte[i].est.rgba;  if(cmap[c]==null) {  cmap[c]=plte.length;  plte.push(c);  }     }
				}
				else {
					for(var j=0; j<bufs.length; j++)  {
						var img32 = new Uint32Array(bufs[j]), ilen = img32.length;
						for(var i=0; i<ilen; i++) {
							var c = img32[i];
							if((i<w || (c!=img32[i-1] && c!=img32[i-w])) && cmap[c]==null) {  cmap[c]=plte.length;  plte.push(c);  if(plte.length>=300) break;  }
						}
					}
				}
				var brute = gotAlpha ? forGIF : false;
				var cc=plte.length;
				if(cc<=256 && forbidPlte==false) {
					if(cc<= 2) depth=1;  else if(cc<= 4) depth=2;  else if(cc<=16) depth=4;  else depth=8;
					if(forGIF) depth=8;
					gotAlpha = true;
				}
				var frms = [];
				for(var j=0; j<bufs.length; j++)
				{
					var cimg = new Uint8Array(bufs[j]), cimg32 = new Uint32Array(cimg.buffer);
					var nx=0, ny=0, nw=w, nh=h, blend=0;
					if(j!=0 && !brute) {
						var tlim = (forGIF || j==1 || frms[frms.length-2].dispose==2)?1:2, tstp = 0, tarea = 1e9;
						for(var it=0; it<tlim; it++)
						{
							var pimg = new Uint8Array(bufs[j-1-it]), p32 = new Uint32Array(bufs[j-1-it]);
							var mix=w,miy=h,max=-1,may=-1;
							for(var y=0; y<h; y++) for(var x=0; x<w; x++) {
								var i = y*w+x;
								if(cimg32[i]!=p32[i]) {
									if(x<mix) mix=x;  if(x>max) max=x;
									if(y<miy) miy=y;  if(y>may) may=y;
								}
							}
							var sarea = (max==-1) ? 1 : (max-mix+1)*(may-miy+1);
							if(sarea<tarea) {
								tarea = sarea;  tstp = it;
								if(max==-1) {  nx=ny=0;  nw=nh=1;  }
								else {  nx = mix; ny = miy; nw = max-mix+1; nh = may-miy+1;  }
							}
						}
						var pimg = new Uint8Array(bufs[j-1-tstp]);
						if(tstp==1) frms[frms.length-1].dispose = 2;
						var nimg = new Uint8Array(nw*nh*4); new Uint32Array(nimg.buffer);
						UPNG.   _copyTile(pimg,w,h, nimg,nw,nh, -nx,-ny, 0);
						if(UPNG._copyTile(cimg,w,h, nimg,nw,nh, -nx,-ny, 3)) {
							UPNG._copyTile(cimg,w,h, nimg,nw,nh, -nx,-ny, 2);  blend = 1;
						}
						else {
							UPNG._copyTile(cimg,w,h, nimg,nw,nh, -nx,-ny, 0);  blend = 0;
						}
						cimg = nimg;  cimg32 = new Uint32Array(cimg.buffer);
					}
					var bpl = 4*nw;
					if(cc<=256 && forbidPlte==false) {
						bpl = Math.ceil(depth*nw/8);
						var nimg = new Uint8Array(bpl*nh);
						for(var y=0; y<nh; y++) {  var i=y*bpl, ii=y*nw;
							if     (depth==8) for(var x=0; x<nw; x++) nimg[i+(x)   ]   =  (cmap[cimg32[ii+x]]             );
							else if(depth==4) for(var x=0; x<nw; x++) nimg[i+(x>>1)]  |=  (cmap[cimg32[ii+x]]<<(4-(x&1)*4));
							else if(depth==2) for(var x=0; x<nw; x++) nimg[i+(x>>2)]  |=  (cmap[cimg32[ii+x]]<<(6-(x&3)*2));
							else if(depth==1) for(var x=0; x<nw; x++) nimg[i+(x>>3)]  |=  (cmap[cimg32[ii+x]]<<(7-(x&7)*1));
						}
						cimg=nimg;  ctype=3;  bpp=1;
					}
					else if(gotAlpha==false && bufs.length==1) {
						var nimg = new Uint8Array(nw*nh*3), area=nw*nh;
						for(var i=0; i<area; i++) { var ti=i*3, qi=i*4;  nimg[ti]=cimg[qi];  nimg[ti+1]=cimg[qi+1];  nimg[ti+2]=cimg[qi+2];  }
						cimg=nimg;  ctype=2;  bpp=3;  bpl=3*nw;
					}
					frms.push({rect:{x:nx,y:ny,width:nw,height:nh}, img:cimg, bpl:bpl, bpp:bpp, blend:blend, dispose:brute?1:0});
				}
				return {ctype:ctype, depth:depth, plte:plte, gotAlpha:gotAlpha, frames:frms  };
			};
			UPNG.encode._filterZero = function(img,h,bpp,bpl,data)
			{
				var fls = [];
				for(var t=0; t<5; t++) {  if(h*bpl>500000 && (t==2 || t==3 || t==4)) continue;
					for(var y=0; y<h; y++) UPNG.encode._filterLine(data, img, y, bpl, bpp, t);
					fls.push(pako["deflate"](data));  if(bpp==1) break;
				}
				var ti, tsize=1e9;
				for(var i=0; i<fls.length; i++) if(fls[i].length<tsize) {  ti=i;  tsize=fls[i].length;  }
				return fls[ti];
			};
			UPNG.encode._filterLine = function(data, img, y, bpl, bpp, type)
			{
				var i = y*bpl, di = i+y, paeth = UPNG.decode._paeth;
				data[di]=type;  di++;
				if(type==0) for(var x=0; x<bpl; x++) data[di+x] = img[i+x];
				else if(type==1) {
					for(var x=  0; x<bpp; x++) data[di+x] =  img[i+x];
					for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x]-img[i+x-bpp]+256)&255;
				}
				else if(y==0) {
					for(var x=  0; x<bpp; x++) data[di+x] = img[i+x];
					if(type==2) for(var x=bpp; x<bpl; x++) data[di+x] = img[i+x];
					if(type==3) for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x] - (img[i+x-bpp]>>1) +256)&255;
					if(type==4) for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x] - paeth(img[i+x-bpp], 0, 0) +256)&255;
				}
				else {
					if(type==2) { for(var x=  0; x<bpl; x++) data[di+x] = (img[i+x]+256 - img[i+x-bpl])&255;  }
					if(type==3) { for(var x=  0; x<bpp; x++) data[di+x] = (img[i+x]+256 - (img[i+x-bpl]>>1))&255;
								  for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x]+256 - ((img[i+x-bpl]+img[i+x-bpp])>>1))&255;  }
					if(type==4) { for(var x=  0; x<bpp; x++) data[di+x] = (img[i+x]+256 - paeth(0, img[i+x-bpl], 0))&255;
								  for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x]+256 - paeth(img[i+x-bpp], img[i+x-bpl], img[i+x-bpp-bpl]))&255;  }
				}
			};
			UPNG.crc = {
				table : ( function() {
				   var tab = new Uint32Array(256);
				   for (var n=0; n<256; n++) {
						var c = n;
						for (var k=0; k<8; k++) {
							if (c & 1)  c = 0xedb88320 ^ (c >>> 1);
							else        c = c >>> 1;
						}
						tab[n] = c;  }
					return tab;  })(),
				update : function(c, buf, off, len) {
					for (var i=0; i<len; i++)  c = UPNG.crc.table[(c ^ buf[off+i]) & 0xff] ^ (c >>> 8);
					return c;
				},
				crc : function(b,o,l)  {  return UPNG.crc.update(0xffffffff,b,o,l) ^ 0xffffffff;  }
			};
			UPNG.quantize = function(bufs, ps, roundAlpha)
			{
				var imgs = [], totl = 0;
				for(var i=0; i<bufs.length; i++) {  imgs.push(UPNG.encode.alphaMul(new Uint8Array(bufs[i]), roundAlpha));  totl+=bufs[i].byteLength;  }
				var nimg = new Uint8Array(totl), nimg32 = new Uint32Array(nimg.buffer), noff=0;
				for(var i=0; i<imgs.length; i++) {
					var img = imgs[i], il = img.length;
					for(var j=0; j<il; j++) nimg[noff+j] = img[j];
					noff += il;
				}
				var root = {i0:0, i1:nimg.length, bst:null, est:null, tdst:0, left:null, right:null };
				root.bst = UPNG.quantize.stats(  nimg,root.i0, root.i1  );  root.est = UPNG.quantize.estats( root.bst );
				var leafs = [root];
				while(leafs.length<ps)
				{
					var maxL = 0, mi=0;
					for(var i=0; i<leafs.length; i++) if(leafs[i].est.L > maxL) {  maxL=leafs[i].est.L;  mi=i;  }
					if(maxL<1e-3) break;
					var node = leafs[mi];
					var s0 = UPNG.quantize.splitPixels(nimg,nimg32, node.i0, node.i1, node.est.e, node.est.eMq255);
					var ln = {i0:node.i0, i1:s0, bst:null, est:null, tdst:0, left:null, right:null };  ln.bst = UPNG.quantize.stats( nimg, ln.i0, ln.i1 );
					ln.est = UPNG.quantize.estats( ln.bst );
					var rn = {i0:s0, i1:node.i1, bst:null, est:null, tdst:0, left:null, right:null };  rn.bst = {R:[], m:[], N:node.bst.N-ln.bst.N};
					for(var i=0; i<16; i++) rn.bst.R[i] = node.bst.R[i]-ln.bst.R[i];
					for(var i=0; i< 4; i++) rn.bst.m[i] = node.bst.m[i]-ln.bst.m[i];
					rn.est = UPNG.quantize.estats( rn.bst );
					node.left = ln;  node.right = rn;
					leafs[mi]=ln;  leafs.push(rn);
				}
				leafs.sort(function(a,b) {  return b.bst.N-a.bst.N;  });
				for(var ii=0; ii<imgs.length; ii++) {
					var planeDst = UPNG.quantize.planeDst;
					var sb = new Uint8Array(imgs[ii].buffer), tb = new Uint32Array(imgs[ii].buffer), len = sb.length;
					for(var i=0; i<len; i+=4) {
						var r=sb[i]*(1/255), g=sb[i+1]*(1/255), b=sb[i+2]*(1/255), a=sb[i+3]*(1/255);
						var nd = root;
						while(nd.left) nd = (planeDst(nd.est,r,g,b,a)<=0) ? nd.left : nd.right;
						tb[i>>2] = nd.est.rgba;
					}
					imgs[ii]=tb.buffer;
				}
				return {  bufs:imgs, plte:leafs  };
			};
			UPNG.quantize.getNearest = function(nd, r,g,b,a)
			{
				if(nd.left==null) {  nd.tdst = UPNG.quantize.dist(nd.est.q,r,g,b,a);  return nd;  }
				var planeDst = UPNG.quantize.planeDst(nd.est,r,g,b,a);
				var node0 = nd.left, node1 = nd.right;
				if(planeDst>0) {  node0=nd.right;  node1=nd.left;  }
				var ln = UPNG.quantize.getNearest(node0, r,g,b,a);
				if(ln.tdst<=planeDst*planeDst) return ln;
				var rn = UPNG.quantize.getNearest(node1, r,g,b,a);
				return rn.tdst<ln.tdst ? rn : ln;
			};
			UPNG.quantize.planeDst = function(est, r,g,b,a) {  var e = est.e;  return e[0]*r + e[1]*g + e[2]*b + e[3]*a - est.eMq;  };
			UPNG.quantize.dist     = function(q,   r,g,b,a) {  var d0=r-q[0], d1=g-q[1], d2=b-q[2], d3=a-q[3];  return d0*d0+d1*d1+d2*d2+d3*d3;  };
			UPNG.quantize.splitPixels = function(nimg, nimg32, i0, i1, e, eMq)
			{
				var vecDot = UPNG.quantize.vecDot;
				i1-=4;
				while(i0<i1)
				{
					while(vecDot(nimg, i0, e)<=eMq) i0+=4;
					while(vecDot(nimg, i1, e)> eMq) i1-=4;
					if(i0>=i1) break;
					var t = nimg32[i0>>2];  nimg32[i0>>2] = nimg32[i1>>2];  nimg32[i1>>2]=t;
					i0+=4;  i1-=4;
				}
				while(vecDot(nimg, i0, e)>eMq) i0-=4;
				return i0+4;
			};
			UPNG.quantize.vecDot = function(nimg, i, e)
			{
				return nimg[i]*e[0] + nimg[i+1]*e[1] + nimg[i+2]*e[2] + nimg[i+3]*e[3];
			};
			UPNG.quantize.stats = function(nimg, i0, i1){
				var R = [0,0,0,0,  0,0,0,0,  0,0,0,0,  0,0,0,0];
				var m = [0,0,0,0];
				var N = (i1-i0)>>2;
				for(var i=i0; i<i1; i+=4)
				{
					var r = nimg[i]*(1/255), g = nimg[i+1]*(1/255), b = nimg[i+2]*(1/255), a = nimg[i+3]*(1/255);
					m[0]+=r;  m[1]+=g;  m[2]+=b;  m[3]+=a;
					R[ 0] += r*r;  R[ 1] += r*g;  R[ 2] += r*b;  R[ 3] += r*a;
					               R[ 5] += g*g;  R[ 6] += g*b;  R[ 7] += g*a;
					                              R[10] += b*b;  R[11] += b*a;
					                                             R[15] += a*a;
				}
				R[4]=R[1];  R[8]=R[2];  R[12]=R[3];  R[9]=R[6];  R[13]=R[7];  R[14]=R[11];
				return {R:R, m:m, N:N};
			};
			UPNG.quantize.estats = function(stats){
				var R = stats.R, m = stats.m, N = stats.N;
				var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], iN = (N==0 ? 0 : 1/N);
				var Rj = [
					R[ 0] - m0*m0*iN,  R[ 1] - m0*m1*iN,  R[ 2] - m0*m2*iN,  R[ 3] - m0*m3*iN,
					R[ 4] - m1*m0*iN,  R[ 5] - m1*m1*iN,  R[ 6] - m1*m2*iN,  R[ 7] - m1*m3*iN,
					R[ 8] - m2*m0*iN,  R[ 9] - m2*m1*iN,  R[10] - m2*m2*iN,  R[11] - m2*m3*iN,
					R[12] - m3*m0*iN,  R[13] - m3*m1*iN,  R[14] - m3*m2*iN,  R[15] - m3*m3*iN
				];
				var A = Rj, M = UPNG.M4;
				var b = [0.5,0.5,0.5,0.5], mi = 0, tmi = 0;
				if(N!=0)
				for(var i=0; i<10; i++) {
					b = M.multVec(A, b);  tmi = Math.sqrt(M.dot(b,b));  b = M.sml(1/tmi,  b);
					if(Math.abs(tmi-mi)<1e-9) break;  mi = tmi;
				}
				var q = [m0*iN, m1*iN, m2*iN, m3*iN];
				var eMq255 = M.dot(M.sml(255,q),b);
				var ia = (q[3]<0.001) ? 0 : 1/q[3];
				return {  Cov:Rj, q:q, e:b, L:mi,  eMq255:eMq255, eMq : M.dot(b,q),
							rgba: (((Math.round(255*q[3])<<24) | (Math.round(255*q[2]*ia)<<16) |  (Math.round(255*q[1]*ia)<<8) | (Math.round(255*q[0]*ia)<<0))>>>0)  };
			};
			UPNG.M4 = {
				multVec : function(m,v) {
						return [
							m[ 0]*v[0] + m[ 1]*v[1] + m[ 2]*v[2] + m[ 3]*v[3],
							m[ 4]*v[0] + m[ 5]*v[1] + m[ 6]*v[2] + m[ 7]*v[3],
							m[ 8]*v[0] + m[ 9]*v[1] + m[10]*v[2] + m[11]*v[3],
							m[12]*v[0] + m[13]*v[1] + m[14]*v[2] + m[15]*v[3]
						];
				},
				dot : function(x,y) {  return  x[0]*y[0]+x[1]*y[1]+x[2]*y[2]+x[3]*y[3];  },
				sml : function(a,y) {  return [a*y[0],a*y[1],a*y[2],a*y[3]];  }
			};
			UPNG.encode.alphaMul = function(img, roundA) {
				var nimg = new Uint8Array(img.length), area = img.length>>2;
				for(var i=0; i<area; i++) {
					var qi=i<<2, ia=img[qi+3];
					if(roundA) ia = ((ia<128))?0:255;
					var a = ia*(1/255);
					nimg[qi+0] = img[qi+0]*a;  nimg[qi+1] = img[qi+1]*a;  nimg[qi+2] = img[qi+2]*a;  nimg[qi+3] = ia;
				}
				return nimg;
			};
			})(UPNG, pako);
			})();
		} (UPNG$1));
		return UPNG$1.exports;
	}

	var UPNGExports = requireUPNG();
	var UPNG = /*@__PURE__*/getDefaultExportFromCjs(UPNGExports);

	const _gifCache = new Map();
	registerPrunableCache(_gifCache, L("动图", "animated image"));
	function notifyReady(entry) {
	    entry._waiters.forEach((fn) => {
	        try { fn(); } catch (err) { Logger.error("[ShuangAssets] 动图就绪回调执行失败", err); }
	    });
	    entry._waiters.clear();
	}
	const MAX_CONCURRENT_DECODES = 3;
	const COMPOSE_CHUNK_SIZE = 6;
	let _activeDecodes = 0;
	const _decodeQueue = [];
	function _pumpDecodeQueue() {
	    while (_activeDecodes < MAX_CONCURRENT_DECODES && _decodeQueue.length > 0) {
	        const task = _decodeQueue.shift();
	        _activeDecodes++;
	        task().finally(() => {
	            _activeDecodes--;
	            _pumpDecodeQueue();
	        });
	    }
	}
	function scheduleDecodeTask(task) {
	    return new Promise((resolve, reject) => {
	        _decodeQueue.push(() => task().then(resolve, reject));
	        _pumpDecodeQueue();
	    });
	}
	function _yieldToMainThread() {
	    return new Promise((resolve) => setTimeout(resolve, 0));
	}
	async function decodeApng(buffer, entry) {
	    const png = UPNG.decode(buffer);
	    entry.width = png.width;
	    entry.height = png.height;
	    const frameCount = png.tabs && png.tabs.acTL ? png.frames.length : 1;
	    entry.isAnimated = frameCount > 1;
	    if (!entry.isAnimated) {
	        entry.failed = true;
	        return;
	    }
	    const rgbaFrames = UPNG.toRGBA8(png);
	    for (let i = 0; i < rgbaFrames.length; i++) {
	        const frameCanvas = document.createElement("canvas");
	        frameCanvas.width = entry.width || 1;
	        frameCanvas.height = entry.height || 1;
	        const ctx = frameCanvas.getContext("2d");
	        const imageData = new ImageData(
	            new Uint8ClampedArray(rgbaFrames[i]),
	            entry.width,
	            entry.height
	        );
	        ctx.putImageData(imageData, 0, 0);
	        const rawDelay = png.frames[i].delay;
	        const delay = rawDelay > 10 ? rawDelay : 100;
	        entry.frames.push({ canvas: frameCanvas, delay });
	        entry.totalDuration += delay;
	        if ((i + 1) % COMPOSE_CHUNK_SIZE === 0 && i + 1 < rgbaFrames.length) {
	            await _yieldToMainThread();
	        }
	    }
	}
	async function decodeAnimatedWebp(buffer, entry) {
	    if (typeof ImageDecoder === "undefined") {
	        entry.failed = true;
	        return;
	    }
	    const decoder = new ImageDecoder({ data: buffer, type: "image/webp" });
	    await decoder.tracks.ready;
	    const track = decoder.tracks.selectedTrack;
	    if (!track || !track.animated || track.frameCount <= 1) {
	        entry.failed = true;
	        decoder.close();
	        return;
	    }
	    const frameCount = track.frameCount;
	    for (let i = 0; i < frameCount; i++) {
	        const { image } = await decoder.decode({ frameIndex: i });
	        if (i === 0) {
	            entry.width = image.displayWidth;
	            entry.height = image.displayHeight;
	        }
	        const frameCanvas = document.createElement("canvas");
	        frameCanvas.width = entry.width || 1;
	        frameCanvas.height = entry.height || 1;
	        frameCanvas.getContext("2d").drawImage(image, 0, 0);
	        const rawDelayMs = image.duration ? image.duration / 1000 : 0;
	        const delay = rawDelayMs > 10 ? rawDelayMs : 100;
	        image.close();
	        entry.frames.push({ canvas: frameCanvas, delay });
	        entry.totalDuration += delay;
	        if ((i + 1) % COMPOSE_CHUNK_SIZE === 0 && i + 1 < frameCount) {
	            await _yieldToMainThread();
	        }
	    }
	    entry.isAnimated = true;
	    decoder.close();
	}
	function getAnimatedImage(url, onReady) {
	    let entry = _gifCache.get(url);
	    if (entry) {
	        entry.lastUsed = Date.now();
	        if (onReady && !entry.loaded) entry._waiters.add(onReady);
	        return entry;
	    }
	    entry = {
	        loaded: false,
	        failed: false,
	        isAnimated: false,
	        frames: [],
	        totalDuration: 0,
	        width: 0,
	        height: 0,
	        lastUsed: Date.now(),
	        _waiters: new Set()
	    };
	    _gifCache.set(url, entry);
	    if (onReady) entry._waiters.add(onReady);
	    scheduleDecodeTask(() =>
	        fetch(url, { mode: "cors", credentials: "omit" })
	            .then((res) => {
	                if (!res.ok) throw new Error(`HTTP ${res.status}`);
	                return res.arrayBuffer();
	            })
	            .then(async (buffer) => {
	                const header = new Uint8Array(buffer, 0, Math.min(12, buffer.byteLength));
	                const isGifHeader = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46;
	                const isPngHeader = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
	                const isWebpHeader = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46
	                    && header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;
	                if (isPngHeader) {
	                    await decodeApng(buffer, entry);
	                    entry.loaded = true;
	                    notifyReady(entry);
	                    return;
	                }
	                if (isWebpHeader) {
	                    await decodeAnimatedWebp(buffer, entry);
	                    entry.loaded = true;
	                    notifyReady(entry);
	                    return;
	                }
	                if (!isGifHeader) {
	                    entry.failed = true;
	                    entry.loaded = true;
	                    notifyReady(entry);
	                    return;
	                }
	                const gif = libExports.parseGIF(buffer);
	                const rawFrames = libExports.decompressFrames(gif, true);
	                entry.width = gif.lsd.width;
	                entry.height = gif.lsd.height;
	                entry.isAnimated = rawFrames.length > 1;
	                const composeCanvas = document.createElement("canvas");
	                composeCanvas.width = entry.width || 1;
	                composeCanvas.height = entry.height || 1;
	                const composeCtx = composeCanvas.getContext("2d");
	                const patchCanvas = document.createElement("canvas");
	                const patchCtx = patchCanvas.getContext("2d");
	                let lastDisposalType = null;
	                let lastDims = null;
	                let disposalRestoreFromIdx = null;
	                for (let currIdx = 0; currIdx < rawFrames.length; currIdx++) {
	                    const frame = rawFrames[currIdx];
	                    const { dims } = frame;
	                    if (currIdx > 0) {
	                        if (lastDisposalType === 3) {
	                            if (disposalRestoreFromIdx !== null) {
	                                composeCtx.clearRect(0, 0, entry.width, entry.height);
	                                composeCtx.drawImage(entry.frames[disposalRestoreFromIdx].canvas, 0, 0);
	                            } else if (lastDims) {
	                                composeCtx.clearRect(lastDims.left, lastDims.top, lastDims.width, lastDims.height);
	                            }
	                        } else {
	                            disposalRestoreFromIdx = currIdx - 1;
	                        }
	                        if (lastDisposalType === 2 && lastDims) {
	                            composeCtx.clearRect(lastDims.left, lastDims.top, lastDims.width, lastDims.height);
	                        }
	                    }
	                    patchCanvas.width = dims.width || 1;
	                    patchCanvas.height = dims.height || 1;
	                    const patchImageData = patchCtx.createImageData(patchCanvas.width, patchCanvas.height);
	                    patchImageData.data.set(frame.patch);
	                    patchCtx.putImageData(patchImageData, 0, 0);
	                    composeCtx.drawImage(patchCanvas, dims.left, dims.top);
	                    const frameCanvas = document.createElement("canvas");
	                    frameCanvas.width = entry.width || 1;
	                    frameCanvas.height = entry.height || 1;
	                    frameCanvas.getContext("2d").drawImage(composeCanvas, 0, 0);
	                    const delay = frame.delay > 10 ? frame.delay : 100;
	                    entry.frames.push({ canvas: frameCanvas, delay });
	                    entry.totalDuration += delay;
	                    lastDisposalType = frame.disposalType;
	                    lastDims = dims;
	                    if ((currIdx + 1) % COMPOSE_CHUNK_SIZE === 0 && currIdx + 1 < rawFrames.length) {
	                        await _yieldToMainThread();
	                    }
	                }
	                entry.loaded = true;
	                notifyReady(entry);
	            })
	            .catch((err) => {
	                entry.failed = true;
	                entry.loaded = true;
	                notifyReady(entry);
	                Logger.warn(L(
	                    `GIF/APNG/WebP 解析失败（可能该图床未开启跨域 CORS，或档案已损毁）: ${url}`,
	                    `Failed to parse GIF/APNG/WebP (the host may not support CORS, or the file is corrupted): ${url}`
	                ), err);
	            })
	    );
	    return entry;
	}
	function getGifFrameState(entry, elapsedMs) {
	    if (!entry.loaded || entry.failed || entry.frames.length === 0 || entry.totalDuration <= 0) {
	        return { index: -1, remainingMs: 0 };
	    }
	    let t = elapsedMs % entry.totalDuration;
	    for (let i = 0; i < entry.frames.length; i++) {
	        const delay = entry.frames[i].delay;
	        if (t < delay) return { index: i, remainingMs: delay - t };
	        t -= delay;
	    }
	    const lastFrame = entry.frames[entry.frames.length - 1];
	    return { index: entry.frames.length - 1, remainingMs: lastFrame.delay };
	}

	function resolvePoseParams(texture, drawPose) {
	    const base = {
	        TextureURL: texture.TextureURL ?? "",
	        Visible: texture.Visible ?? true,
	        OffsetX: texture.OffsetX ?? 1,
	        OffsetY: texture.OffsetY ?? 1,
	        ScaleX: texture.ScaleX ?? texture.Scale ?? 100,
	        ScaleY: texture.ScaleY ?? texture.Scale ?? 100,
	        Rotation: texture.Rotation ?? 0,
	        Opacity: texture.Opacity ?? 100,
	        MirrorH: texture.MirrorH ?? false,
	        MirrorV: texture.MirrorV ?? false
	    };
	    const poseKey = getPoseKey(drawPose);
	    if (!poseKey) return base;
	    const ps = texture.PoseSettings?.[poseKey];
	    if (!ps || ps.enabled !== true) return base;
	    const { enabled, Scale: legacyScale, ...overrides } = ps;
	    if (legacyScale !== undefined && overrides.ScaleX === undefined) {
	        overrides.ScaleX = legacyScale;
	        overrides.ScaleY = legacyScale;
	    }
	    return { ...base, ...overrides };
	}
	function renderTexture(data, originalFunction, drawData) {
	    const { X, Y, drawCanvas, drawCanvasBlink, C, A, CA, L } = drawData;
	    const item = CA;
	    const layerIndex = LAYER_NAMES.indexOf(L);
	    if (layerIndex === 0 && item?.Property) {
	        updateHideArray(item);
	        if (data.PersistentData && !data.PersistentData._cacheMigrated) {
	            for (const key in data.PersistentData) {
	                if (!key.startsWith("_")) {
	                    delete data.PersistentData[key];
	                }
	            }
	            data.PersistentData._cacheMigrated = true;
	        }
	    }
	    if (layerIndex === -1) return;
	    const textures = item?.Property?.Textures;
	    if (!textures || layerIndex >= textures.length) return;
	    const texture = textures[layerIndex];
	    if (!texture) return;
	    const params = resolvePoseParams(texture, C.DrawPose);
	    if (!params.TextureURL) return;
	    if (params.Visible === false) return;
	    const blockedPlayers = (() => {
	        try {
	            const s = Player?.ExtensionSettings?.ShuangCustomAssets;
	            return Array.isArray(s?.blockedPlayers) ? s.blockedPlayers : [];
	        } catch (_) { return []; }
	    })();
	    if (blockedPlayers.length > 0) {
	        const texSource = texture.TextureURLSource || 0;
	        const texConfig = texture.CurrentConfigurator || 0;
	        if ((texSource > 0 && blockedPlayers.indexOf(texSource) !== -1) ||
	            (texConfig > 0 && blockedPlayers.indexOf(texConfig) !== -1)) {
	            return;
	        }
	    }
	    const warnEnabled = getDomainWarningEnabled();
	    let imageUrl, offsetX, offsetY, scaleX, scaleY, rotation, displayOpacity, mirrorH, mirrorV;
	    if (isUrlAllowed(params.TextureURL)) {
	        imageUrl = params.TextureURL;
	        offsetX = params.OffsetX || 0;
	        offsetY = params.OffsetY || 0;
	        scaleX = (params.ScaleX ?? 100) / 100;
	        scaleY = (params.ScaleY ?? 100) / 100;
	        rotation = params.Rotation || 0;
	        displayOpacity = Math.max(0, Math.min(100, params.Opacity ?? 100)) / 100;
	        mirrorH = params.MirrorH === true;
	        mirrorV = params.MirrorV === true;
	    } else if (warnEnabled && !isDomainInWhitelist(params.TextureURL)) {
	        imageUrl = 'https://shuang-custom-assets.pages.dev/SCA_untrusted_domain.png';
	        offsetX = 167;
	        offsetY = -256;
	        scaleX = scaleY = 50 / 100;
	        rotation = 0;
	        displayOpacity = 1.0;
	        mirrorH = false;
	        mirrorV = false;
	    } else {
	        return;
	    }
	    if (imageUrl.startsWith(ASSETS_CDN_PRIMARY + "/")) {
	        imageUrl = resolveFixedAssetUrl(imageUrl.substring((ASSETS_CDN_PRIMARY + "/").length));
	    }
	    const gifEntry = getAnimatedImage(imageUrl);
	    let img, sourceWidth, sourceHeight, gifFrameIndex = -1;
	    if (!gifEntry.loaded) {
	        getAnimatedImage(imageUrl, () => queueOneShotRefresh(C));
	        return;
	    } else if (!gifEntry.failed && gifEntry.isAnimated) {
	        if (getAnimatedImageEnabled()) {
	            const layerGifStartKey = `_gifStart_${layerIndex}`;
	            if (!data.PersistentData) data.PersistentData = {};
	            if (data.PersistentData[layerGifStartKey] == null) {
	                data.PersistentData[layerGifStartKey] = Date.now();
	            }
	            const elapsed = Date.now() - data.PersistentData[layerGifStartKey];
	            const gifFrameState = getGifFrameState(gifEntry, elapsed);
	            gifFrameIndex = gifFrameState.index;
	            if (gifFrameIndex < 0) return;
	            notifyGifFrame(C, layerIndex, gifFrameIndex, Date.now() + gifFrameState.remainingMs);
	        } else {
	            gifFrameIndex = 0;
	        }
	        img = gifEntry.frames[gifFrameIndex].canvas;
	        sourceWidth = gifEntry.width;
	        sourceHeight = gifEntry.height;
	    } else if (!gifEntry.failed && !gifEntry.isAnimated) {
	        const onlyFrame = gifEntry.frames[0];
	        if (!onlyFrame) return;
	        img = onlyFrame.canvas;
	        sourceWidth = gifEntry.width;
	        sourceHeight = gifEntry.height;
	    } else {
	        const imgEntry = getCorsImage(imageUrl);
	        if (imgEntry.failed) return;
	        if (!imgEntry.img.complete || imgEntry.img.naturalWidth <= 0) {
	            getCorsImage(imageUrl, () => queueOneShotRefresh(C));
	            return;
	        }
	        img = imgEntry.img;
	        sourceWidth = img.naturalWidth;
	        sourceHeight = img.naturalHeight;
	    }
	    const width = Math.round(sourceWidth * scaleX);
	    const height = Math.round(sourceHeight * scaleY);
	    const rad = rotation * Math.PI / 180;
	    const cos = Math.abs(Math.cos(rad));
	    const sin = Math.abs(Math.sin(rad));
	    const bboxWidth = Math.round(width * cos + height * sin);
	    const bboxHeight = Math.round(width * sin + height * cos);
	    const layerCanvasKey = `_canvas_${layerIndex}`;
	    const layerParamsKey = `_params_${layerIndex}`;
	    const currentParams = `${imageUrl}_${gifFrameIndex}_${width}_${height}_${rotation}_${displayOpacity}_${mirrorH ? 1 : 0}_${mirrorV ? 1 : 0}`;
	    let tempCanvas = data.PersistentData?.[layerCanvasKey];
	    const paramsChanged = data.PersistentData?.[layerParamsKey] !== currentParams;
	    if (!tempCanvas || (gifEntry.isAnimated && paramsChanged)) {
	        tempCanvas = AnimationGenerateTempCanvas(C, A, bboxWidth, bboxHeight);
	        if (!data.PersistentData) data.PersistentData = {};
	        data.PersistentData[layerCanvasKey] = tempCanvas;
	        data.PersistentData[layerParamsKey] = null;
	    }
	    if (data.PersistentData[layerParamsKey] !== currentParams) {
	        if (tempCanvas.width !== bboxWidth || tempCanvas.height !== bboxHeight) {
	            tempCanvas.width = bboxWidth;
	            tempCanvas.height = bboxHeight;
	        }
	        const ctx = tempCanvas.getContext("2d");
	        ctx.clearRect(0, 0, bboxWidth, bboxHeight);
	        ctx.save();
	        ctx.globalAlpha = displayOpacity;
	        ctx.translate(bboxWidth / 2, bboxHeight / 2);
	        ctx.rotate(rad);
	        ctx.scale(mirrorH ? -1 : 1, mirrorV ? -1 : 1);
	        ctx.drawImage(img, -width / 2, -height / 2, width, height);
	        ctx.restore();
	        data.PersistentData[layerParamsKey] = currentParams;
	    }
	    const drawX = X + offsetX - (bboxWidth - width) / 2;
	    const drawY = Y + offsetY - (bboxHeight - height) / 2;
	    drawCanvas(tempCanvas, drawX, drawY);
	    drawCanvasBlink(tempCanvas, drawX, drawY);
	}

	function setupLoginBadge(HookManager) {
	    HookManager.progressiveHook("LoginDoNextThankYou")
	        .next()
	        .inject((args, next) => {
	            if (CurrentScreen !== "Login") return next(args);
	            if (typeof LoginCharacter === "undefined" || !LoginCharacter) return next(args);
	            const existing = LoginCharacter.Appearance.find(
	                a => a.Asset.Group.Name === LOGIN_BADGE_GROUP && a.Asset.Name === LOGIN_BADGE_ASSET_NAME
	            );
	            if (!existing) {
	                InventoryWear(LoginCharacter, LOGIN_BADGE_ASSET_NAME, LOGIN_BADGE_GROUP);
	                const item = LoginCharacter.Appearance.find(
	                    a => a.Asset.Group.Name === LOGIN_BADGE_GROUP && a.Asset.Name === LOGIN_BADGE_ASSET_NAME
	                );
	                if (item) {
	                    if (!item.Property) item.Property = {};
	                    item.Property.Textures = [{ ...LOGIN_BADGE_TEXTURE }];
	                    for (const cat of HIDE_CATEGORIES) {
	                        item.Property[cat.key] = false;
	                    }
	                    item.Property.Hide = [];
	                }
	                CharacterRefresh(LoginCharacter);
	            }
	            next(args);
	        });
	}

	const TEXTURE_GROUPS = new Set(ALL_ITEM_GROUPS);
	function setupDialogHooks(HookManager) {
	    if (typeof DrawAssetGroupZone === "function") {
	        HookManager.hookFunction("DrawAssetGroupZone", 0, (args, next) => {
	            if (DialogFocusItem?.Asset?.Name === ASSET_NAME) return;
	            return next(args);
	        });
	    }
	    if (typeof DialogClickedInZone === "function") {
	        HookManager.hookFunction("DialogClickedInZone", 0, (args, next) => {
	            if (DialogFocusItem?.Asset?.Name === ASSET_NAME && state.currentEditTexture >= 0) {
	                return false;
	            }
	            return next(args);
	        });
	    }
	    if (typeof DialogLeaveFocusItem === "function") {
	        HookManager.hookFunction("DialogLeaveFocusItem", 0, (args, next) => {
	            const item = DialogFocusItem;
	            const inSubview = state.currentEditTexture >= 0 || state.currentView !== "list";
	            if (item?.Asset?.Name === ASSET_NAME && inSubview) {
	                if (state.poseSwitchMode) {
	                    state.poseSwitchMode = false;
	                    return;
	                }
	                returnToListFromSubview();
	                return;
	            }
	            return next(args);
	        });
	    }
	    if (typeof InventoryGroupIsBlockedForCharacter === "function") {
	        HookManager.hookFunction("InventoryGroupIsBlockedForCharacter", 0, (args, next) => {
	            const C = args[0];
	            const GroupName = args[1];
	            if (C?.Appearance && TEXTURE_GROUPS.has(GroupName)) {
	                const hasTexture = C.Appearance.some(
	                    i => i.Asset?.Group?.Name === GroupName && i.Asset?.Name === ASSET_NAME
	                );
	                if (hasTexture) return false;
	            }
	            return next(args);
	        });
	    }
	}

	function isItemLockedForPlayer(item) {
	    if (!item?.Property?.LockedBy) return false;
	    const C = CharacterGetCurrent();
	    if (!C) return false;
	    return !DialogCanUnlock(C, item);
	}
	const asset = {
	    Name: ASSET_NAME,
	    Random: false,
	    Left: 125,
	    Top: 225,
	    ParentGroup: {},
	    Priority: 50,
	    PoseMapping: {},
	    DynamicGroupName: "ItemMisc",
	    AllowColorize: false,
	    Extended: true,
	    AllowLock: true,
	    AllowTighten: true,
	    DrawLocks: false,
	    Difficulty: 2,
	    Layer: LAYER_NAMES.map(name => ({ Name: name, AllowColorize: false }))
	};
	const translation = {
	    CN: "自定义贴图",
	    EN: "Custom Texture"
	};
	const layerNames = {
	    CN: Object.fromEntries(LAYER_NAMES.map((name, i) => [name, `图层${i + 1}`])),
	    EN: Object.fromEntries(LAYER_NAMES.map(name => [name, name]))
	};
	const extended = {
	    Archetype: "noarch",
	    DrawImages: false,
	    ChangeWhenLocked: false,
	    BaselineProperty: {
	        Textures: [],
	        HideEmoticon: false,
	        HideCosplay: false,
	        HideFacial: false,
	        HideHead: false,
	        HideBodyUpper: false,
	        HideBodyLower: false,
	        HideClothing: false,
	        HideItems: false,
	        HideBody: false
	    },
	    ScriptHooks: {
	        Load: (data, originalFunction) => {
	            originalFunction();
	            const item = DialogFocusItem;
	            if (!item) return;
	            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
	            if (!item.Property.Textures) item.Property.Textures = [];
	            if (item.Property.HideBody === true) {
	                item.Property.HideHead = true;
	                item.Property.HideBodyUpper = true;
	                item.Property.HideBodyLower = true;
	                delete item.Property.HideBody;
	            }
	            for (const cat of HIDE_CATEGORIES) {
	                if (item.Property[cat.key] === undefined) item.Property[cat.key] = false;
	            }
	            updateHideArray(item);
	            for (const texture of item.Property.Textures) {
	                migrateScaleField(texture);
	            }
	            state.currentEditTexture = -1;
	            state.tempTextureData = null;
	            state.originalEditTexture = null;
	            state.originalOverridePriority = undefined;
	            state.currentListPage = 0;
	            state.currentView = "list";
	            state._pendingTextureRefresh = false;
	            resetDragState();
	            recordItemBaseline(item);
	        },
	        Draw: (data, originalFunction) => {
	            originalFunction();
	            const item = DialogFocusItem;
	            if (!item) return;
	            createEditPanelDomInputs();
	            positionEditPanelInputs();
	            if (state.currentView === "addDomainConfirm") {
	                drawAddDomainConfirm();
	            } else if (state.currentView === "tutorial") {
	                drawTutorial();
	            } else if (state.currentEditTexture >= 0) {
	                drawTextureEditPanel(item, state.currentEditTexture);
	            } else if (state.currentView === "hide") {
	                drawHideSettings(item);
	            } else {
	                drawTextureListMain(item);
	            }
	            if (isItemLockedForPlayer(item)) {
	                DrawText(L("已上锁", "Locked"), 1500, 95, "#FF4444", "Black");
	            }
	            DrawButton(1775, 25, 90, 90, "", "White", "Icons/DialogPermissionMode.png",
	                L("前往设置", "Go to settings"));
	        },
	        Click: (data, originalFunction) => {
	            const item = DialogFocusItem;
	            if (item?.Asset?.Name === ASSET_NAME && MouseIn(1775, 25, 90, 90)) {
	                if (DialogFocusItem !== null) {
	                    DialogFocusItem = null;
	                }
	                if (typeof DialogLeave === "function") {
	                    DialogLeave();
	                }
	                PreferenceSubscreenExtensionsOpen("ShuangCustomAssets");
	                return;
	            }
	            originalFunction();
	            if (!item) return;
	            const isLocked = isItemLockedForPlayer(item);
	            const isPaginationClick = state.currentView === "list"
	                && state.currentEditTexture < 0
	                && MouseIn(1885, 810, 90, 90);
	            if (isLocked && !isPaginationClick) {
	                DialogExtendedMessage = L(
	                    "此道具已上锁，无权限的玩家无法修改配置",
	                    "This item is locked. Players without permission cannot modify configuration."
	                );
	                return;
	            }
	            if (state.currentView === "addDomainConfirm") {
	                handleAddDomainConfirmClick();
	            } else if (state.currentView === "tutorial") {
	                handleTutorialClick();
	            } else if (state.currentEditTexture >= 0) {
	                handleTextureEditClick(item, state.currentEditTexture);
	            } else if (state.currentView === "hide") {
	                handleHideSettingsClick(item);
	            } else {
	                handleTextureListClick(item, data);
	            }
	        },
	        Exit: (data) => {
	            if (state.currentEditTexture >= 0) {
	                const item = DialogFocusItem;
	                const originalTexture = data.PersistentData?._originalTexture;
	                if (item && originalTexture) {
	                    if (!item.Property) item.Property = { Textures: [] };
	                    if (!item.Property.Textures) item.Property.Textures = [];
	                    item.Property.Textures[state.currentEditTexture] = { ...originalTexture };
	                    if (state.originalOverridePriority !== undefined) {
	                        item.Property.OverridePriority = JSON.parse(JSON.stringify(state.originalOverridePriority));
	                    } else {
	                        delete item.Property.OverridePriority;
	                    }
	                    syncItemToServer(item);
	                    const C = CharacterGetCurrent();
	                    if (C) CharacterRefresh(C, false, false);
	                }
	            }
	            state.currentEditTexture = -1;
	            state.tempTextureData = null;
	            state.originalEditTexture = null;
	            state.originalOverridePriority = undefined;
	            state.currentListPage = 0;
	            state.currentView = "list";
	            state.tutorialPage = 0;
	            state.poseSwitchMode = false;
	            state.poseSelectedList = [];
	            state.poseComboList = [];
	            state.poseComboIndex = 0;
	            state.poseViewMode = false;
	            resetDragState();
	            unregisterPoseHook();
	            removeEditPanelInputs();
	        },
	        AfterDraw: (data, originalFunction, drawData) => {
	            renderTexture(data, originalFunction, drawData);
	        }
	    }
	};
	function register(AssetManager) {
	    AssetManager.addAssetWithConfig(ALL_ITEM_GROUPS, asset, {
	        layerNames,
	        extended,
	        translation,
	        assetStrings,
	        noMirror: true
	    });
	    const previewMappings = {};
	    for (const group of ALL_ITEM_GROUPS) {
	        previewMappings[`Assets/Female3DCG/${group}/Preview/${asset.Name}.png`] = BADGE_IMAGE_URL;
	    }
	    AssetManager.addImageMapping(previewMappings);
	    const allAllowHide = ALL_HIDEABLE_GROUPS;
	    AssetManager.afterLoad(() => {
	        for (const group of ALL_ITEM_GROUPS) {
	            const assetObj = AssetGet("Female3DCG", group, asset.Name);
	            if (assetObj) {
	                assetObj.AllowHide = allAllowHide;
	                if (Array.isArray(assetObj.Layer)) {
	                    for (const layer of assetObj.Layer) layer.HasImage = false;
	                }
	                assetObj.Block = [];
	                assetObj.AllowLock = true;
	                assetObj.AllowTighten = true;
	                if (assetObj.Wear === undefined) assetObj.Wear = true;
	                if (assetObj.Enable === undefined) assetObj.Enable = true;
	            }
	        }
	        if (typeof CraftingAssetsPopulate === "function") {
	            CraftingAssets = CraftingAssetsPopulate();
	        }
	    });
	}

	const assets = [
	    ["自定义贴图", register],
	];

	(globalThis).ShuangAssets = { Logger };
	function init() {
	    registerAssets(assets);
	    mt.afterLoad(() => {
	        initAssets();
	        setupLoginBadge(u$1);
	        setupDialogHooks(u$1);
	        setupGifAnimationHooks(u$1);
	        setupModTagHooks(u$1);
	        setupItemEditBeacon(u$1);
	        u$1.afterPlayerLogin(() => {
	            initSettings();
	        });
	        console.log(`[ShuangAssets] ${ModInfo.fullName} v${ModInfo.version} ✅ loaded`);
	    });
	}
	function setup() {
	    init();
	}
	n(ModInfo.name, async () => {
	    try {
	        await import('https://cdn.jsdelivr.net/npm/bondage-club-mod-sdk@1.2.0');
	        const mod =  (globalThis).bcModSdk.registerMod({
	            name: ModInfo.name,
	            fullName: ModInfo.fullName,
	            version: ModInfo.version,
	            repository: ModInfo.repository
	        });
	        u$1.initWithMod(mod);
	        u$1.hookFunction("CraftingDeserialize", 0, (args, next) => {
	            const craftString = args[0];
	            if (typeof craftString === "string" && craftString.length > 0) {
	                const sep = typeof CraftingSerializeFieldSep !== "undefined" ? CraftingSerializeFieldSep : ",";
	                const parts = craftString.split(sep);
	                if (parts[0] && (!parts[3] || parts[3] === "")) {
	                    parts[3] = "Crafted Item";
	                    args[0] = parts.join(sep);
	                }
	            }
	            const craft = next(args);
	            if (craft && craft.ItemProperty && typeof craft.ItemProperty === "object" && craft.ItemProperty.HideBody === true) {
	                craft.ItemProperty.HideHead = true;
	                craft.ItemProperty.HideBodyUpper = true;
	                craft.ItemProperty.HideBodyLower = true;
	            }
	            return craft;
	        });
	        u$1.hookFunction("GLDraw2DCanvas", 0, (args, next) => {
	            const gl = args[0];
	            const Img = args[1];
	            if (gl?.textureCache) {
	                const name = Img?.getAttribute?.("name");
	                if (name) {
	                    const old = gl.textureCache.get(name);
	                    if (old?.texture) {
	                        gl.deleteTexture(old.texture);
	                    }
	                }
	            }
	            return next(args);
	        });
	        mt.setLogger(Logger);
	        mt.init(setup);
	    } catch (error) {
	        console.error(`[ShuangAssets] 初始化失败:`, error);
	    }
	});

})();
