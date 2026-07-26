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

	var constants;
	var hasRequiredConstants;
	function requireConstants () {
		if (hasRequiredConstants) return constants;
		hasRequiredConstants = 1;
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
		constants = {
		  MAX_LENGTH,
		  MAX_SAFE_COMPONENT_LENGTH,
		  MAX_SAFE_BUILD_LENGTH,
		  MAX_SAFE_INTEGER,
		  RELEASE_TYPES,
		  SEMVER_SPEC_VERSION,
		  FLAG_INCLUDE_PRERELEASE: 0b001,
		  FLAG_LOOSE: 0b010,
		};
		return constants;
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
			} = requireConstants();
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
		const { MAX_LENGTH, MAX_SAFE_INTEGER } = requireConstants();
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
	    version: "0.1.0",
	    author: "Shuang",
	    description: "支持动态贴图等自定义道具",
	    repository: "https://github.com/yourname/ShuangCustomAssets"
	};

	const Logger = {
	    prefix: "[ShuangAssets]",
	    info(...args) {
	        console.log(this.prefix, ...args);
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
	function getCorsImage(url) {
	    let entry = _corsImageCache.get(url);
	    if (!entry) {
	        const img = new Image();
	        entry = { img, loaded: false, failed: false };
	        img.addEventListener("load", () => { entry.loaded = true; });
	        img.addEventListener("error", () => {
	            entry.failed = true;
	            Logger.warn(L(
	                `图片加载失败（很可能是图床未开启跨域 CORS，无 Access-Control-Allow-Origin 响应头）: ${url}`,
	                `Failed to load image (the host likely has no CORS / Access-Control-Allow-Origin header): ${url}`
	            ));
	        });
	        img.crossOrigin = "anonymous";
	        img.src = url;
	        _corsImageCache.set(url, entry);
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
	    Logger.info(`道具 "${name}" 注册成功`);
	}
	function registerAssets(assets) {
	    for (const [name, registerFn] of assets) {
	        registerAsset(name, registerFn);
	    }
	}
	function initAssets() {
	    Logger.info(`开始初始化 ${registeredAssets.size} 个道具`);
	    for (const [name, registerFn] of registeredAssets) {
	        try {
	            registerFn(mt);
	            Logger.info(`道具 "${name}" 初始化完成`);
	        } catch (e) {
	            Logger.error(`道具 "${name}" 初始化失败:`, e);
	        }
	    }
	}

	const EXTENSION_ID = "ShuangCustomAssets";
	const ALWAYS_ALLOWED_DOMAINS = [
	    "shuang-custom-assets.pages.dev"
	];
	const DEFAULT_ALLOWED_DOMAINS = [
	    "github.io",
	    "gitlab.io",
	    "ibb.co",
	    "imgbb.com",
	    "imgchest.com",
	    "imgur.com",
	    "postimg.cc",
	    "hd-r.icu",
	    "catbox.moe",
	    "litter.catbox.moe",
	    "pub-*.r2.dev",
	    "r2.cloudflarestorage.com",
	    "cdn.discordapp.com",
	    "media.discordapp.net",
	    ...ALWAYS_ALLOWED_DOMAINS
	];
	let settingsPage = "main";
	let whitelistPage = 0;
	function getSettings() {
	    if (!Player.ExtensionSettings) Player.ExtensionSettings = {};
	    if (!Player.ExtensionSettings[EXTENSION_ID]) {
	        Player.ExtensionSettings[EXTENSION_ID] = {
	            urlLoadMode: "whitelist",
	            allowedDomains: [...DEFAULT_ALLOWED_DOMAINS],
	            domainWarningEnabled: true,
	        };
	    }
	    return Player.ExtensionSettings[EXTENSION_ID];
	}
	function saveSettings() {
	    if (typeof ServerPlayerExtensionSettingsSync === "function") {
	        ServerPlayerExtensionSettingsSync(EXTENSION_ID);
	    }
	}
	function getDomainWarningEnabled() {
	    const settings = getSettings();
	    return settings.domainWarningEnabled !== false;
	}
	function extractDomain(url) {
	    try {
	        const u = new URL(url);
	        return u.hostname;
	    } catch {
	        return null;
	    }
	}
	function domainMatches(domain, pattern) {
	    if (!domain || !pattern) return false;
	    if (pattern.includes("*")) {
	        const re = new RegExp(
	            "^" + pattern.split("*").map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[^.]*") + "$",
	            "i"
	        );
	        return re.test(domain);
	    }
	    return domain === pattern || domain.endsWith("." + pattern);
	}
	function isUrlAllowed(url) {
	    if (!url || typeof url !== "string") return false;
	    if (!url.startsWith("https://")) return false;
	    const domain = extractDomain(url);
	    if (domain && ALWAYS_ALLOWED_DOMAINS.some(d => domainMatches(domain, d))) {
	        return true;
	    }
	    if (!domain) return false;
	    const settings = getSettings();
	    if (settings.urlLoadMode === "unrestricted") {
	        return true;
	    }
	    const allowed = settings.allowedDomains || [];
	    return allowed.some(entry => domainMatches(domain, entry));
	}
	function isDomainInWhitelist(url) {
	    const settings = getSettings();
	    if (settings.urlLoadMode !== "whitelist") return true;
	    const domain = extractDomain(url);
	    if (!domain) return false;
	    if (ALWAYS_ALLOWED_DOMAINS.some(d => domainMatches(domain, d))) return true;
	    const allowed = settings.allowedDomains || [];
	    return allowed.some(a => domainMatches(domain, a));
	}
	function addDomainToWhitelist(domain) {
	    if (!domain) return false;
	    domain = domain.toLowerCase().trim();
	    if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(domain)) return false;
	    const settings = getSettings();
	    if (!settings.allowedDomains) settings.allowedDomains = [];
	    if (settings.allowedDomains.includes(domain)) return false;
	    settings.allowedDomains.push(domain);
	    saveSettings();
	    return true;
	}
	function registerExtensionSetting() {
	    if (typeof PreferenceRegisterExtensionSetting !== "function") {
	        Logger.warn("PreferenceRegisterExtensionSetting 不可用，延迟注册");
	        return;
	    }
	    PreferenceRegisterExtensionSetting({
	        Identifier: EXTENSION_ID,
	        ButtonText: L("自定义贴图设置", "Custom Texture Settings"),
	        Image: "Icons/Texture.png",
	        load: () => {
	            settingsPage = "main";
	            whitelistPage = 0;
	            _createDomainInput();
	        },
	        run: () => {
	            MainCanvas.textAlign = "center";
	            if (settingsPage === "main") {
	                _drawMainPage();
	            } else if (settingsPage === "modeSelect") {
	                _drawModeSelectPage();
	            } else if (settingsPage === "whitelist") {
	                _drawWhitelistPage();
	            } else if (settingsPage === "unrestrictedConfirm") {
	                _drawUnrestrictedConfirmPage();
	            }
	            _updateInputPosition();
	            MainCanvas.textAlign = "center";
	        },
	        click: () => {
	            if (settingsPage === "main") {
	                _clickMainPage();
	            } else if (settingsPage === "modeSelect") {
	                _clickModeSelectPage();
	            } else if (settingsPage === "whitelist") {
	                _clickWhitelistPage();
	            } else if (settingsPage === "unrestrictedConfirm") {
	                _clickUnrestrictedConfirmPage();
	            }
	        },
	        exit: () => {
	            _removeDomainInput();
	            settingsPage = "main";
	            whitelistPage = 0;
	            return true;
	        },
	        unload: () => {
	            _removeDomainInput();
	            settingsPage = "main";
	            whitelistPage = 0;
	        },
	    });
	    Logger.info("扩展设置已注册");
	}
	function _drawTextLeft(text, x, y, color, backColor) {
	    MainCanvas.textAlign = "left";
	    DrawText(text, x, y, color, backColor);
	    MainCanvas.textAlign = "center";
	}
	function _drawMainPage() {
	    const settings = getSettings();
	    DrawText(L("自定义贴图 - 安全设置", "Custom Texture - Security Settings"), 1000, 100, "Black", "Gray");
	    const modeText = settings.urlLoadMode === "whitelist"
	        ? L("当前模式：白名单模式", "Current mode: Whitelist")
	        : L("当前模式：不限制模式", "Current mode: Unrestricted");
	    DrawText(modeText, 1000, 180, "Black", "Gray");
	    const descText = settings.urlLoadMode === "whitelist"
	        ? L("仅加载来自可信域名的贴图 URL", "Only load texture URLs from trusted domains")
	        : L("加载所有 HTTPS 贴图 URL（可能存在隐私风险）", "Load all HTTPS texture URLs (privacy risk)");
	    DrawText(descText, 1000, 220, "Gray", "White");
	    DrawButton(800, 280, 400, 60, L("加载模式设置 >>>", "Load Mode Settings >>>"), "White",
	        null, L("选择白名单/不限制加载模式", "Choose whitelist / unrestricted load mode"));
	    if (settings.urlLoadMode === "whitelist") {
	        DrawButton(800, 360, 400, 60, L("域名白名单管理 >>>", "Domain Whitelist >>>"), "White",
	            null, L("添加或删除可信域名", "Add or remove trusted domains"));
	        DrawText(L(`已配置 ${settings.allowedDomains?.length || 0} 个可信域名`,
	            `${settings.allowedDomains?.length || 0} trusted domains configured`), 1000, 440, "Gray", "White");
	    }
	    const warnY = settings.urlLoadMode === "whitelist" ? 500 : 360;
	    const isWarnOn = settings.domainWarningEnabled !== false;
	    DrawText(L("不可信域名提示", "Untrusted domain warning"), 800, warnY + 22, "Black", "White");
	    DrawButton(1150, warnY - 5, 80, 35, isWarnOn ? L("开", "On") : L("关", "Off"),
	        isWarnOn ? "#4CAF50" : "#666666",
	        isWarnOn ? "#66BB6A" : "#999999", false,
	        L("是否对不在白名单的域名显示警告图片", "Whether to show a warning image for non-whitelisted domains"));
	    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", L("退出", "Exit"));
	}
	function _drawModeSelectPage() {
	    const settings = getSettings();
	    DrawText(L("选择贴图加载模式", "Select texture load mode"), 1000, 100, "Black", "Gray");
	    const whitelistActive = settings.urlLoadMode === "whitelist";
	    DrawButton(700, 200, 600, 80,
	        L(`白名单模式${whitelistActive ? "（当前）" : ""}`, `Whitelist${whitelistActive ? " (current)" : ""}`),
	        whitelistActive ? "#D4FFD4" : "White",
	        null, L("仅加载可信域名的贴图（推荐）", "Only load textures from trusted domains (recommended)"));
	    DrawText(L("仅加载来自可信域名的贴图 URL", "Only load texture URLs from trusted domains"), 1000, 300, "Gray", "White");
	    const unrestrictedActive = settings.urlLoadMode === "unrestricted";
	    DrawButton(700, 360, 600, 80,
	        L(`不限制模式${unrestrictedActive ? "（当前）" : ""}`, `Unrestricted${unrestrictedActive ? " (current)" : ""}`),
	        unrestrictedActive ? "#FFE4D4" : "White",
	        null, L("加载任意 HTTPS 贴图（有隐私风险）", "Load any HTTPS texture (privacy risk)"));
	    DrawText(L("加载所有 HTTPS 贴图 URL", "Load all HTTPS texture URLs"), 1000, 460, "Gray", "White");
	    DrawButton(800, 560, 400, 60, L("返回", "Back"), "White", null, L("返回上一页", "Back to previous page"));
	    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", L("退出", "Exit"));
	}
	function _drawWhitelistPage() {
	    const settings = getSettings();
	    const domains = settings.allowedDomains || [];
	    const listStartY = 190;
	    const lineH = 45;
	    const maxShow = 8;
	    const domainTextX = 400;
	    const deleteBtnX = 1300;
	    const deleteBtnW = 120;
	    const totalPages = Math.max(1, Math.ceil(domains.length / maxShow));
	    if (whitelistPage >= totalPages) whitelistPage = totalPages - 1;
	    if (whitelistPage < 0) whitelistPage = 0;
	    const pageStart = whitelistPage * maxShow;
	    const pageEnd = Math.min(pageStart + maxShow, domains.length);
	    const hasPrev = whitelistPage > 0;
	    const hasNext = whitelistPage < totalPages - 1;
	    DrawText(L("域名白名单管理", "Domain Whitelist"), 1000, 100, "Black", "Gray");
	    DrawText(L("仅来自这些域名的贴图 URL 会被加载", "Only texture URLs from these domains will load"), 1000, 140, "Gray", "White");
	    for (let i = pageStart; i < pageEnd; i++) {
	        const displayIdx = i - pageStart;
	        const y = listStartY + displayIdx * lineH;
	        _drawTextLeft(`${i + 1}. ${domains[i]}`, domainTextX, y, "Black", "White");
	        DrawButton(deleteBtnX, y - 17, deleteBtnW, 35, L("删除", "Delete"), "#FFD4D4",
	            null, L(`从白名单移除 ${domains[i]}`, `Remove ${domains[i]} from whitelist`));
	    }
	    const paginationY = listStartY + maxShow * lineH + 10;
	    DrawText(L(`第 ${whitelistPage + 1}/${totalPages} 页  (共 ${domains.length} 个域名)`,
	        `Page ${whitelistPage + 1}/${totalPages}  (${domains.length} domains)`), 1000, paginationY, "Gray", "White");
	    DrawButton(1180, paginationY - 17, 80, 35, L("上一页", "Prev"), "#555555", "#777777", !hasPrev,
	        L("上一页", "Previous page"));
	    DrawButton(1270, paginationY - 17, 80, 35, L("下一页", "Next"), "#555555", "#777777", !hasNext,
	        L("下一页", "Next page"));
	    const inputY = paginationY + 40;
	    _drawTextLeft(L("添加域名:", "Add domain:"), domainTextX, inputY, "Black", "White");
	    DrawButton(900, inputY - 17, 100, 35, L("添加", "Add"), "#D4FFD4",
	        null, L("将输入框中的域名加入白名单", "Add the entered domain to the whitelist"));
	    DrawButton(1010, inputY - 17, 100, 35, L("清空全部", "Clear All"), "#FFD4D4",
	        null, L("移除所有可信域名", "Remove all trusted domains"));
	    DrawButton(1120, inputY - 17, 120, 35, L("添加推荐域名", "Add Defaults"), "#B3E5FC",
	        null, L("添加内置推荐图床域名", "Add the built-in recommended image hosts"));
	    const ieY = inputY + 50;
	    DrawButton(900, ieY - 17, 120, 35, L("导出配置", "Export"), "#FF9800", "#FFB74D", false,
	        L("将白名单复制到剪贴板", "Copy the whitelist to clipboard"));
	    DrawButton(1030, ieY - 17, 120, 35, L("导入配置", "Import"), "#2196F3", "#42A5F5", false,
	        L("从 JSON 导入白名单", "Import a whitelist from JSON"));
	    DrawButton(800, 720, 400, 60, L("返回", "Back"), "White", null, L("返回上一页", "Back to previous page"));
	    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", L("退出", "Exit"));
	}
	function _drawUnrestrictedConfirmPage() {
	    DrawText(L("⚠ 隐私安全警告 ⚠", "⚠ Privacy & Security Warning ⚠"), 1000, 120, "Red", "Yellow");
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
	    let y = 180;
	    for (let i = 0; i < lines.length; i++) {
	        const line = lines[i];
	        const color = (i === lines.length - 1) ? "Red" : "Black";
	        DrawText(line, 1000, y, color, "White");
	        y += 35;
	    }
	    DrawButton(700, y + 20, 280, 60, L("我已了解风险，确认开启", "I understand, enable it"), "#FFD4D4",
	        null, L("切换到不限制模式", "Switch to Unrestricted mode"));
	    DrawButton(1020, y + 20, 280, 60, L("取消，保持白名单模式", "Cancel, keep Whitelist"), "#D4FFD4",
	        null, L("保持白名单模式", "Keep Whitelist mode"));
	    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", L("退出", "Exit"));
	}
	function _clickMainPage() {
	    const settings = getSettings();
	    if (MouseIn(1815, 75, 90, 90)) {
	        PreferenceSubscreenExtensionsClear();
	        return;
	    }
	    if (MouseIn(800, 280, 400, 60)) {
	        settingsPage = "modeSelect";
	        return;
	    }
	    if (settings.urlLoadMode === "whitelist" && MouseIn(800, 360, 400, 60)) {
	        settingsPage = "whitelist";
	        return;
	    }
	    const warnY = settings.urlLoadMode === "whitelist" ? 500 : 360;
	    if (MouseIn(1150, warnY - 5, 80, 35)) {
	        settings.domainWarningEnabled = !(settings.domainWarningEnabled !== false);
	        saveSettings();
	        return;
	    }
	}
	function _clickModeSelectPage() {
	    const settings = getSettings();
	    if (MouseIn(1815, 75, 90, 90)) {
	        PreferenceSubscreenExtensionsClear();
	        return;
	    }
	    if (MouseIn(700, 200, 600, 80)) {
	        if (settings.urlLoadMode !== "whitelist") {
	            settings.urlLoadMode = "whitelist";
	            saveSettings();
	            Logger.info("切换到白名单模式");
	        }
	        settingsPage = "main";
	        return;
	    }
	    if (MouseIn(700, 360, 600, 80)) {
	        if (settings.urlLoadMode !== "unrestricted") {
	            settingsPage = "unrestrictedConfirm";
	            return;
	        }
	        settings.urlLoadMode = "whitelist";
	        saveSettings();
	        settingsPage = "main";
	        return;
	    }
	    if (MouseIn(800, 560, 400, 60)) {
	        settingsPage = "main";
	        return;
	    }
	}
	function _clickWhitelistPage() {
	    const settings = getSettings();
	    const domains = settings.allowedDomains || [];
	    if (MouseIn(1815, 75, 90, 90)) {
	        PreferenceSubscreenExtensionsClear();
	        return;
	    }
	    const listStartY = 190;
	    const lineH = 45;
	    const maxShow = 8;
	    const deleteBtnX = 1300;
	    const deleteBtnW = 120;
	    const totalPages = Math.max(1, Math.ceil(domains.length / maxShow));
	    for (let i = 0; i < maxShow; i++) {
	        const idx = whitelistPage * maxShow + i;
	        if (idx >= domains.length) break;
	        const y = listStartY + i * lineH;
	        if (MouseIn(deleteBtnX, y - 17, deleteBtnW, 35)) {
	            const removed = domains.splice(idx, 1)[0];
	            settings.allowedDomains = domains;
	            saveSettings();
	            if (domains.length > 0 && whitelistPage >= Math.ceil(domains.length / maxShow)) {
	                whitelistPage = Math.max(0, Math.ceil(domains.length / maxShow) - 1);
	            }
	            Logger.info(`删除域名: ${removed}`);
	            return;
	        }
	    }
	    const paginationY = listStartY + maxShow * lineH + 10;
	    const hasPrev = whitelistPage > 0;
	    const hasNext = whitelistPage < totalPages - 1;
	    if (hasPrev && MouseIn(1180, paginationY - 17, 80, 35)) {
	        whitelistPage--;
	        return;
	    }
	    if (hasNext && MouseIn(1270, paginationY - 17, 80, 35)) {
	        whitelistPage++;
	        return;
	    }
	    const inputY = paginationY + 40;
	    if (MouseIn(900, inputY - 17, 100, 35)) {
	        const input = document.getElementById("ShuangTextureDomainInput");
	        const domain = input?.value?.trim()?.toLowerCase();
	        if (domain && !domains.includes(domain)) {
	            if (/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(domain)) {
	                domains.push(domain);
	                settings.allowedDomains = domains;
	                saveSettings();
	                input.value = "";
	                whitelistPage = Math.max(0, Math.ceil(domains.length / maxShow) - 1);
	                Logger.info(`添加域名: ${domain}`);
	            }
	        }
	        return;
	    }
	    if (MouseIn(1010, inputY - 17, 100, 35)) {
	        if (confirm(L("确定要清空所有可信域名吗？", "Clear all trusted domains?"))) {
	            settings.allowedDomains = [];
	            saveSettings();
	            whitelistPage = 0;
	            Logger.info("清空所有域名");
	        }
	        return;
	    }
	    if (MouseIn(1120, inputY - 17, 120, 35)) {
	        const existing = new Set(settings.allowedDomains || []);
	        let added = 0;
	        for (const d of DEFAULT_ALLOWED_DOMAINS) {
	            if (!existing.has(d)) {
	                settings.allowedDomains.push(d);
	                existing.add(d);
	                added++;
	            }
	        }
	        if (added > 0) {
	            saveSettings();
	            whitelistPage = Math.max(0, Math.ceil(settings.allowedDomains.length / maxShow) - 1);
	            Logger.info(`添加了 ${added} 个推荐域名`);
	        }
	        return;
	    }
	    const ieY = inputY + 50;
	    if (MouseIn(900, ieY - 17, 120, 35)) {
	        const json = JSON.stringify(settings.allowedDomains || [], null, 2);
	        navigator.clipboard.writeText(json).then(() => {
	            Logger.info("域名白名单已复制到剪贴板");
	        }).catch(() => {
	            const ta = document.createElement("textarea");
	            ta.value = json;
	            document.body.appendChild(ta);
	            ta.select();
	            document.execCommand("copy");
	            document.body.removeChild(ta);
	            Logger.info("域名白名单已复制到剪贴板");
	        });
	        return;
	    }
	    if (MouseIn(1030, ieY - 17, 120, 35)) {
	        const jsonStr = prompt(L(
	            "请粘贴域名白名单 JSON 配置：\n格式如: [\"domain1.com\", \"domain2.com\"]",
	            "Paste the whitelist JSON config:\ne.g. [\"domain1.com\", \"domain2.com\"]"));
	        if (jsonStr) {
	            try {
	                const imported = JSON.parse(jsonStr);
	                if (!Array.isArray(imported)) throw new Error("不是数组格式");
	                const existing = new Set(settings.allowedDomains || []);
	                let added = 0;
	                for (const d of imported) {
	                    const domain = String(d).toLowerCase().trim();
	                    if (domain && !existing.has(domain) && /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(domain)) {
	                        settings.allowedDomains.push(domain);
	                        existing.add(domain);
	                        added++;
	                    }
	                }
	                if (added > 0) {
	                    saveSettings();
	                    whitelistPage = Math.max(0, Math.ceil(settings.allowedDomains.length / maxShow) - 1);
	                    Logger.info(`导入了 ${added} 个域名`);
	                } else {
	                    Logger.info("导入完成，无新增域名");
	                }
	            } catch (e) {
	                Logger.error("导入域名配置失败:", e);
	                alert(L("导入失败：JSON 格式错误，请检查后重试", "Import failed: invalid JSON, please check and retry"));
	            }
	        }
	        return;
	    }
	    if (MouseIn(800, 720, 400, 60)) {
	        settingsPage = "main";
	        return;
	    }
	}
	function _clickUnrestrictedConfirmPage() {
	    const settings = getSettings();
	    if (MouseIn(1815, 75, 90, 90)) {
	        PreferenceSubscreenExtensionsClear();
	        return;
	    }
	    const confirmY = 180 + 35 * 11 + 20;
	    if (MouseIn(700, confirmY, 280, 60)) {
	        settings.urlLoadMode = "unrestricted";
	        saveSettings();
	        Logger.info("已切换到不限制模式");
	        settingsPage = "main";
	        return;
	    }
	    if (MouseIn(1020, confirmY, 280, 60)) {
	        settingsPage = "main";
	        return;
	    }
	}
	function _createDomainInput() {
	    ElementCreateInput("ShuangTextureDomainInput", "text", "", "example.com");
	    _updateInputPosition();
	}
	function _updateInputPosition() {
	    const input = document.getElementById("ShuangTextureDomainInput");
	    if (input && settingsPage === "whitelist") {
	        const inputY = 190 + 8 * 45 + 10 + 40;
	        ElementPosition("ShuangTextureDomainInput", 720, inputY, 350, 40);
	    } else if (input) {
	        ElementPosition("ShuangTextureDomainInput", -999, -999, 0, 0);
	    }
	}
	function _removeDomainInput() {
	    const input = document.getElementById("ShuangTextureDomainInput");
	    if (input) input.remove();
	}

	const DEFAULT_TEXTURE = {
	    TextureURL: "",
	    OffsetX: 1,
	    OffsetY: 1,
	    Scale: 100,
	    Rotation: 0,
	    Visible: true,
	    Opacity: 100
	};
	const DEFAULT_PROPS = {
	    Textures: [],
	    HideCosplay: false,
	    HideFacial: false,
	    HideBody: false,
	    HideClothing: false,
	    HideItems: false
	};
	let currentEditTexture = -1;
	let tempTextureData = null;
	let currentListPage = 0;
	let currentView = "list";
	let pendingDomainToAdd = null;
	let originalEditTexture = null;
	let statusMessage = null;
	let statusMessageExpiry = 0;
	function showStatus(text, color = "#4CAF50", durationMs = 5000) {
	    statusMessage = { text, color };
	    statusMessageExpiry = Date.now() + durationMs;
	}
	const TEXTURES_PER_PAGE = 6;
	const HIDE_CATEGORIES = [
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
	        key: "HideBody",
	        label: "身体",
	        labelEn: "Body",
	        groups: [
	            "Emoticon", "Head", "BodyUpper", "BodyLower", "Height",
	            "BodyStyle", "Pronouns", "Nipples", "Pussy",
	            "ArmsLeft", "ArmsRight", "HandsLeft", "HandsRight",
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
	const INPUT_URL = "CustomTextureURLInput";
	const INPUT_OFFSET_X = "CustomTextureOffsetXInput";
	const INPUT_OFFSET_Y = "CustomTextureOffsetYInput";
	const INPUT_SCALE = "CustomTextureScaleInput";
	const INPUT_ROTATION = "CustomTextureRotationInput";
	const INPUT_OPACITY = "CustomTextureOpacityInput";
	const MAX_TEXTURE_COUNT = 16;
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
	const asset = {
	    Name: "自定义贴图",
	    Random: false,
	    Left: 125,
	    Top: 225,
	    ParentGroup: {},
	    Priority: 50,
	    PoseMapping: {},
	    DynamicGroupName: "ItemMisc",
	    AllowColorize: false,
	    Extended: true,
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
	    BaselineProperty: {
	        Textures: [],
	        HideCosplay: false,
	        HideFacial: false,
	        HideBody: false,
	        HideClothing: false,
	        HideItems: false,
	        Hide: []
	    },
	    ScriptHooks: {
	        Load: (data, originalFunction) => {
	            originalFunction();
	            const item = DialogFocusItem;
	            if (!item) return;
	            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
	            if (!item.Property.Textures) item.Property.Textures = [];
	            for (const cat of HIDE_CATEGORIES) {
	                if (item.Property[cat.key] === undefined) item.Property[cat.key] = false;
	            }
	            updateHideArray(item);
	            currentEditTexture = -1;
	            tempTextureData = null;
	            originalEditTexture = null;
	            currentListPage = 0;
	            currentView = "list";
	            [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
	        },
	        Draw: (data, originalFunction) => {
	            originalFunction();
	            const item = DialogFocusItem;
	            if (!item) return;
	            if (currentView === "addDomainConfirm") {
	                drawAddDomainConfirm();
	            } else if (currentEditTexture >= 0) {
	                drawTextureEditPanel(item, currentEditTexture);
	            } else if (currentView === "hide") {
	                drawHideSettings(item);
	            } else {
	                drawTextureListMain(item);
	            }
	        },
	        Click: (data, originalFunction) => {
	            originalFunction();
	            const item = DialogFocusItem;
	            if (!item) return;
	            if (currentView === "addDomainConfirm") {
	                handleAddDomainConfirmClick();
	            } else if (currentEditTexture >= 0) {
	                handleTextureEditClick(item, currentEditTexture);
	            } else if (currentView === "hide") {
	                handleHideSettingsClick(item);
	            } else {
	                handleTextureListClick(item, data);
	            }
	        },
	        Exit: (data) => {
	            if (currentEditTexture >= 0) {
	                const item = DialogFocusItem;
	                const originalTexture = data.PersistentData?._originalTexture;
	                if (item && originalTexture) {
	                    if (!item.Property) item.Property = { Textures: [] };
	                    if (!item.Property.Textures) item.Property.Textures = [];
	                    item.Property.Textures[currentEditTexture] = { ...originalTexture };
	                    syncItemToServer(item);
	                    const C = CharacterGetCurrent();
	                    if (C) CharacterRefresh(C, false, false);
	                }
	            }
	            currentEditTexture = -1;
	            tempTextureData = null;
	            originalEditTexture = null;
	            currentListPage = 0;
	            currentView = "list";
	            [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
	        },
	        AfterDraw: (data, originalFunction, drawData) => {
	            const { X, Y, drawCanvas, drawCanvasBlink, C, A, CA, L } = drawData;
	            const item = CA;
	            const layerIndex = LAYER_NAMES.indexOf(L);
	            if (layerIndex === 0 && item?.Property) {
	                updateHideArray(item);
	            }
	            if (layerIndex === -1) return;
	            const textures = item?.Property?.Textures;
	            if (!textures || layerIndex >= textures.length) return;
	            const texture = textures[layerIndex];
	            if (!texture || !texture.TextureURL) return;
	            if (texture.Visible === false) return;
	            const warnEnabled = getDomainWarningEnabled();
	            let imageUrl, offsetX, offsetY, scale, rotation, displayOpacity;
	            if (warnEnabled && !isDomainInWhitelist(texture.TextureURL)) {
	                imageUrl = 'https://shuang-custom-assets.pages.dev/SCA_untrusted_domain.png';
	                offsetX = 167;
	                offsetY = -256;
	                scale = 16 / 100;
	                rotation = 0;
	                displayOpacity = 1.0;
	            } else if (!isUrlAllowed(texture.TextureURL)) {
	                return;
	            } else {
	                imageUrl = texture.TextureURL;
	                offsetX = texture.OffsetX || 0;
	                offsetY = texture.OffsetY || 0;
	                scale = (texture.Scale || 100) / 100;
	                rotation = texture.Rotation || 0;
	                displayOpacity = Math.max(0, Math.min(100, texture.Opacity ?? 100)) / 100;
	            }
	            const imgEntry = getCorsImage(imageUrl);
	            if (imgEntry.failed) return;
	            const img = imgEntry.img;
	            if (!img.complete || img.naturalWidth <= 0) return;
	            const width = Math.round(img.naturalWidth * scale);
	            const height = Math.round(img.naturalHeight * scale);
	            const rad = rotation * Math.PI / 180;
	            const cos = Math.abs(Math.cos(rad));
	            const sin = Math.abs(Math.sin(rad));
	            const bboxWidth = Math.round(width * cos + height * sin);
	            const bboxHeight = Math.round(width * sin + height * cos);
	            const cacheKey = `${imageUrl}_${width}_${height}_${rotation}_${displayOpacity}_${layerIndex}`;
	            let tempCanvas = data.PersistentData?.[cacheKey];
	            if (!tempCanvas) {
	                tempCanvas = AnimationGenerateTempCanvas(C, A, bboxWidth, bboxHeight);
	                const ctx = tempCanvas.getContext("2d");
	                ctx.clearRect(0, 0, bboxWidth, bboxHeight);
	                ctx.save();
	                ctx.globalAlpha = displayOpacity;
	                ctx.translate(bboxWidth / 2, bboxHeight / 2);
	                ctx.rotate(rad);
	                ctx.translate(-width / 2, -height / 2);
	                ctx.drawImage(img, 0, 0, width, height);
	                ctx.restore();
	                if (!data.PersistentData) data.PersistentData = {};
	                data.PersistentData[cacheKey] = tempCanvas;
	            }
	            const drawX = X + offsetX - (bboxWidth - width) / 2;
	            const drawY = Y + offsetY - (bboxHeight - height) / 2;
	            drawCanvas(tempCanvas, drawX, drawY);
	            drawCanvasBlink(tempCanvas, drawX, drawY);
	        }
	    }
	};
	function drawAddDomainConfirm() {
	    DrawText(L("⚠ 添加可信域名确认 ⚠", "⚠ Confirm Trusted Domain ⚠"), 1500, 370, "Red", "Gray");
	    let y = 440;
	    const lines = isChineseLang() ? [
	        { t: `即将添加域名到白名单: ${pendingDomainToAdd}`, c: "Cyan" },
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
	        { t: `About to add domain to whitelist: ${pendingDomainToAdd}`, c: "Cyan" },
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
	        L(`将 ${pendingDomainToAdd} 加入白名单`, `Add ${pendingDomainToAdd} to whitelist`));
	    DrawButton(1500, y, 200, 50, L("取消", "Cancel"), "#9E9E9E", "#BDBDBD", false,
	        L("放弃添加并返回", "Discard and go back"));
	}
	function handleAddDomainConfirmClick(item, data) {
	    const baseY = 440 + 35 * 11 + 10;
	    if (MouseIn(1250, baseY, 200, 50)) {
	        if (pendingDomainToAdd) {
	            const success = addDomainToWhitelist(pendingDomainToAdd);
	            if (success) {
	                Logger.info(`已添加可信域名: ${pendingDomainToAdd}`);
	                showStatus(L(`✔ 已添加可信域名: ${pendingDomainToAdd}`,
	                    `✔ Trusted domain added: ${pendingDomainToAdd}`), "#4CAF50");
	            }
	        }
	        pendingDomainToAdd = null;
	        currentView = "list";
	        const C = CharacterGetCurrent();
	        if (C) CharacterRefresh(C, false, false);
	        return;
	    }
	    if (MouseIn(1500, baseY, 200, 50)) {
	        pendingDomainToAdd = null;
	        currentView = "list";
	        return;
	    }
	}
	function drawHideSettings(item) {
	    DrawText(L("隐藏设置", "Hide Settings"), 1500, 360, "White", "Gray");
	    DrawText(L("选择需要隐藏的部位分类", "Choose which part categories to hide"), 1505, 410, "#fff942", "Gray");
	    const startY = 450;
	    const rowHeight = 60;
	    for (let i = 0; i < HIDE_CATEGORIES.length; i++) {
	        const cat = HIDE_CATEGORIES[i];
	        const y = startY + i * rowHeight;
	        const isHidden = item.Property?.[cat.key] === true;
	        const catLabel = L(cat.label, cat.labelEn);
	        DrawText(catLabel, 1100, y + 20, "White");
	        DrawButton(1200, y, 400, 40, L(`${cat.groups.length}个部位`, `${cat.groups.length} parts`), "White", null,
	            L(`该分类包含 ${cat.groups.length} 个部位组`, `This category covers ${cat.groups.length} groups`), false);
	        DrawButton(1620, y, 100, 40, isHidden ? L("隐藏", "Hidden") : L("显示", "Shown"),
	            isHidden ? "#666666" : "#4ba055",
	            null, L(`点击切换是否隐藏「${catLabel}」`, `Toggle hiding "${catLabel}"`), false);
	    }
	    DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
	        L("确认并返回列表", "Confirm & back to list"));
	}
	function handleHideSettingsClick(item) {
	    const startY = 450;
	    const rowHeight = 60;
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
	        currentView = "list";
	        return;
	    }
	}
	function drawTextureListMain(item) {
	    const textures = item.Property?.Textures || [];
	    DrawText(L("贴图管理", "Texture Manager"), 1500, 360, "White", "Gray");
	    DrawText(L(`已添加${textures.length}个贴图（最多${MAX_TEXTURE_COUNT}个）`,
	        `${textures.length} textures added (max ${MAX_TEXTURE_COUNT})`), 1505, 410, "#ebfe58", "Gray");
	    DrawButton(1665, 25, 90, 90, "", "White", "Icons/Private.png",
	        L("隐藏设置：隐藏身体部位/服饰等", "Hide settings: hide body parts / clothing"));
	    const startY = 450;
	    const itemHeight = 60;
	    const ADD_BTN_BASE_Y = 450;
	    const ADD_BTN_STEP = 60;
	    const totalPages = Math.max(1, Math.ceil(textures.length / TEXTURES_PER_PAGE));
	    if (currentListPage >= totalPages) currentListPage = totalPages - 1;
	    if (currentListPage < 0) currentListPage = 0;
	    const pageStart = currentListPage * TEXTURES_PER_PAGE;
	    const pageEnd = Math.min(pageStart + TEXTURES_PER_PAGE, textures.length);
	    const itemsOnPage = pageEnd - pageStart;
	    for (let i = pageStart; i < pageEnd; i++) {
	        const y = startY + (i - pageStart) * itemHeight;
	        const texture = textures[i];
	        const urlPreview = texture?.TextureURL
	            ? (texture.TextureURL.length > 12 ? texture.TextureURL.substring(0, 12) + "..." : texture.TextureURL)
	            : "(空)";
	        DrawText(L(`图层${i + 1} :`, `Layer ${i + 1}:`), 1100, y + 20, "White");
	        DrawButton(1200, y, 400, 40, urlPreview, "White", null,
	            texture?.TextureURL || L("(空)", "(empty)"), false);
	        const isVisible = texture?.Visible !== false;
	        DrawButton(1620, y, 100, 40, isVisible ? L("显示", "Shown") : L("隐藏", "Hidden"),
	            isVisible ? "#4ba055" : "#666666", null,
	            L("点击切换该图层显示/隐藏", "Toggle this layer's visibility"), false);
	        DrawButton(1740, y, 100, 40, L("编辑", "Edit"), "White", null,
	            L("编辑该图层的 URL 与参数", "Edit this layer's URL and parameters"), false);
	        if (texture?.TextureURL && !isDomainInWhitelist(texture.TextureURL)) {
	            DrawButton(1860, y, 100, 40, L("信任", "Trust"), "#6F1F1F", null,
	                L("将该图片的域名加入可信白名单", "Add this image's domain to the trusted whitelist"), false);
	        }
	    }
	    if (textures.length < MAX_TEXTURE_COUNT) {
	        const addBtnY = ADD_BTN_BASE_Y + itemsOnPage * ADD_BTN_STEP;
	        DrawButton(1450, addBtnY, 90, 90, "", "White", "Icons/Plus.png",
	            L("添加一个新贴图图层", "Add a new texture layer"));
	    }
	    const btnY = startY + TEXTURES_PER_PAGE * itemHeight;
	    const hasPages = totalPages > 1;
	    if (textures.length >= 7) {
	        DrawButton(1885, 810, 90, 90, "", "White", "Icons/Down.png",
	            L("下一页", "Next page"), !hasPages);
	    }
	    DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
	        L("确认并退出（保存并关闭）", "Confirm & Exit (save and close)"));
	    const ioBtnY = btnY + 120;
	    DrawButton(1170, ioBtnY, 200, 50, L("导出配置", "Export"), "#4CAF50", "#66BB6A", false,
	        L("将当前配置复制到剪贴板", "Copy current config to clipboard"));
	    DrawButton(1390, ioBtnY, 200, 50, L("覆盖导入", "Import (Replace)"), "#28639A", null,
	        L("用剪贴板配置覆盖当前所有图层", "Replace all layers with clipboard config"), false);
	    DrawButton(1610, ioBtnY, 200, 50, L("追加导入", "Import (Append)"), "#28639A", null,
	        L("将剪贴板配置追加到当前图层后", "Append clipboard config after current layers"), false);
	    if (statusMessage && Date.now() < statusMessageExpiry) {
	        DrawText(statusMessage.text, 1505, 890, statusMessage.color, "Black");
	    }
	}
	function handleTextureListClick(item, data) {
	    const textures = item.Property?.Textures || [];
	    if (MouseIn(1665, 25, 90, 90)) {
	        currentView = "hide";
	        return;
	    }
	    const startY = 450;
	    const itemHeight = 60;
	    const ADD_BTN_BASE_Y = 450;
	    const ADD_BTN_STEP = 60;
	    const totalPages = Math.max(1, Math.ceil(textures.length / TEXTURES_PER_PAGE));
	    if (currentListPage >= totalPages) currentListPage = totalPages - 1;
	    if (currentListPage < 0) currentListPage = 0;
	    const pageStart = currentListPage * TEXTURES_PER_PAGE;
	    const pageEnd = Math.min(pageStart + TEXTURES_PER_PAGE, textures.length);
	    const itemsOnPage = pageEnd - pageStart;
	    for (let i = pageStart; i < pageEnd; i++) {
	        const y = startY + (i - pageStart) * itemHeight;
	        const texture = textures[i];
	        if (MouseIn(1620, y, 100, 40)) {
	            textures[i].Visible = textures[i].Visible === false ? true : false;
	            syncItemToServer(item);
	            const C = CharacterGetCurrent();
	            if (C) CharacterRefresh(C, false, false);
	            return;
	        }
	        if (MouseIn(1740, y, 100, 40)) {
	            currentEditTexture = i;
	            tempTextureData = { ...textures[i] };
	            originalEditTexture = { ...textures[i] };
	            if (!data.PersistentData) data.PersistentData = {};
	            data.PersistentData._originalTexture = { ...textures[i] };
	            createEditInputs(textures[i]);
	            return;
	        }
	        if (texture?.TextureURL && !isDomainInWhitelist(texture.TextureURL) && MouseIn(1860, y, 100, 40)) {
	            const domain = extractDomain(texture.TextureURL);
	            if (domain) {
	                pendingDomainToAdd = domain;
	                currentView = "addDomainConfirm";
	            }
	            return;
	        }
	    }
	    if (textures.length < MAX_TEXTURE_COUNT) {
	        const addBtnY = ADD_BTN_BASE_Y + itemsOnPage * ADD_BTN_STEP;
	        if (MouseIn(1450, addBtnY, 90, 90)) {
	            const newTexture = { ...DEFAULT_TEXTURE };
	            item.Property.Textures.push(newTexture);
	            currentEditTexture = textures.length - 1;
	            tempTextureData = { ...newTexture };
	            originalEditTexture = null;
	            if (!data.PersistentData) data.PersistentData = {};
	            data.PersistentData._originalTexture = { ...newTexture };
	            createEditInputs(newTexture);
	            return;
	        }
	    }
	    const btnY = startY + TEXTURES_PER_PAGE * itemHeight;
	    const hasPages = totalPages > 1;
	    if (textures.length >= 7 && hasPages && MouseIn(1885, 810, 90, 90)) {
	        currentListPage = (currentListPage + 1) % totalPages;
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
	        if ((item.Property?.Textures || []).length >= MAX_TEXTURE_COUNT) {
	            showStatus(L(`✘ 超过贴图数量上限（最多 ${MAX_TEXTURE_COUNT} 个）`,
	                `✘ Texture limit reached (max ${MAX_TEXTURE_COUNT})`), "#E53935");
	            return;
	        }
	        importConfig(item, "append");
	        return;
	    }
	}
	function exportConfig(item) {
	    const textures = item.Property?.Textures || [];
	    const config = {
	        type: "ShuangCustomAssets",
	        version: 4,
	        textures: textures,
	        hideCosplay: item.Property?.HideCosplay === true,
	        hideFacial: item.Property?.HideFacial === true,
	        hideBody: item.Property?.HideBody === true,
	        hideClothing: item.Property?.HideClothing === true,
	        hideItems: item.Property?.HideItems === true
	    };
	    const json = JSON.stringify(config, null, 2);
	    navigator.clipboard.writeText(json).then(() => {
	        Logger.info("配置已复制到剪贴板");
	        showStatus(L(`✔ 已复制到剪贴板，共 ${textures.length} 个图层`,
	            `✔ Copied to clipboard, ${textures.length} layers`), "#4CAF50");
	    }).catch(err => {
	        Logger.error("复制失败:", err);
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
	            const validTextures = config.textures.map(t => ({
	                TextureURL: String(t.TextureURL || ""),
	                OffsetX: parseInt(t.OffsetX) || 0,
	                OffsetY: parseInt(t.OffsetY) || 0,
	                Scale: parseInt(t.Scale) || 100,
	                Rotation: parseInt(t.Rotation) || 0,
	                Visible: t.Visible !== false,
	                Opacity: Math.max(0, Math.min(100, parseInt(t.Opacity) || 100))
	            }));
	            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
	            if (!item.Property.Textures) item.Property.Textures = [];
	            if (mode === "append") {
	                const currentCount = item.Property.Textures.length;
	                const totalCount = currentCount + validTextures.length;
	                if (totalCount > MAX_TEXTURE_COUNT) {
	                    throw new Error(`超过贴图数量上限（当前 ${currentCount} + 导入 ${validTextures.length} = ${totalCount}，最多 ${MAX_TEXTURE_COUNT}）`);
	                }
	                item.Property.Textures = [...item.Property.Textures, ...validTextures];
	            } else {
	                if (validTextures.length > MAX_TEXTURE_COUNT) {
	                    throw new Error(`超过贴图数量上限（最多 ${MAX_TEXTURE_COUNT} 个，当前 ${validTextures.length} 个）`);
	                }
	                item.Property.Textures = validTextures;
	                for (const cat of HIDE_CATEGORIES) {
	                    item.Property[cat.key] = config[cat.key.charAt(0).toLowerCase() + cat.key.slice(1)] === true;
	                }
	            }
	            updateHideArray(item);
	            const count = item.Property.Textures.length;
	            const modeText = mode === "append" ? "追加" : "覆盖";
	            const modeTextEn = mode === "append" ? "Append" : "Replace";
	            Logger.info(`${modeText}导入成功:`, count, "个图层");
	            showStatus(L(`✔ ${modeText}导入成功，共 ${count} 个图层`,
	                `✔ ${modeTextEn} import OK, ${count} layers`), "#4CAF50");
	            syncItemToServer(item);
	            const C = CharacterGetCurrent();
	            if (C) CharacterRefresh(C, false, false);
	        } catch (err) {
	            Logger.error("导入失败:", err.message);
	            showStatus(L(`✘ 导入失败: ${err.message}`, `✘ Import failed: ${err.message}`), "#E53935");
	        }
	    }).catch(err => {
	        Logger.error("读取剪贴板失败:", err);
	        showStatus(L("✘ 读取剪贴板失败，请确保已复制配置 JSON", "✘ Cannot read clipboard, make sure the config JSON is copied"), "#E53935");
	    });
	}
	function createEditInputs(texture) {
	    let input = ElementCreateInput(INPUT_URL, "text", texture.TextureURL || "", "1000");
	    if (input) {
	        input.setAttribute("placeholder", "https://...");
	        input.style.width = "350px";
	    }
	    ElementPositionFixed(INPUT_URL, 1220, 435, 490, 40);
	    input = ElementCreateInput(INPUT_OFFSET_X, "number", String(texture.OffsetX ?? 1), "10");
	    if (input) input.style.width = "80px";
	    ElementPositionFixed(INPUT_OFFSET_X, 1220, 485, 200, 40);
	    input = ElementCreateInput(INPUT_OFFSET_Y, "number", String(texture.OffsetY ?? 1), "10");
	    if (input) input.style.width = "80px";
	    ElementPositionFixed(INPUT_OFFSET_Y, 1220, 535, 200, 40);
	    input = ElementCreateInput(INPUT_SCALE, "number", String(texture.Scale || 100), "10");
	    if (input) input.style.width = "80px";
	    ElementPositionFixed(INPUT_SCALE, 1220, 585, 200, 40);
	    input = ElementCreateInput(INPUT_ROTATION, "number", String(texture.Rotation || 0), "10");
	    if (input) input.style.width = "80px";
	    ElementPositionFixed(INPUT_ROTATION, 1220, 635, 200, 40);
	    input = ElementCreateInput(INPUT_OPACITY, "number", String(texture.Opacity ?? 100), "10");
	    if (input) {
	        input.style.width = "80px";
	        input.min = "0";
	        input.max = "100";
	    }
	    ElementPositionFixed(INPUT_OPACITY, 1220, 685, 200, 40);
	}
	function syncItemToServer(item) {
	    if (CurrentScreen === "Crafting") return;
	    const C = CharacterGetCurrent();
	    if (!C || typeof ChatRoomCharacterItemUpdate !== "function") return;
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
	function drawTextureEditPanel(item, textureIndex, data) {
	    const urlInput = document.getElementById(INPUT_URL);
	    const offsetXInput = document.getElementById(INPUT_OFFSET_X);
	    const offsetYInput = document.getElementById(INPUT_OFFSET_Y);
	    const scaleInput = document.getElementById(INPUT_SCALE);
	    const rotationInput = document.getElementById(INPUT_ROTATION);
	    const opacityInput = document.getElementById(INPUT_OPACITY);
	    if (tempTextureData) {
	        const newUrl = urlInput?.value?.trim() || "";
	        const newOffsetX = parseInt(offsetXInput?.value) || 0;
	        const newOffsetY = parseInt(offsetYInput?.value) || 0;
	        const newScale = parseInt(scaleInput?.value) || 100;
	        const newRotation = parseInt(rotationInput?.value) || 0;
	        const newOpacity = Math.max(0, Math.min(100, parseInt(opacityInput?.value) || 100));
	        if (tempTextureData.TextureURL !== newUrl ||
	            tempTextureData.OffsetX !== newOffsetX ||
	            tempTextureData.OffsetY !== newOffsetY ||
	            tempTextureData.Scale !== newScale ||
	            tempTextureData.Rotation !== newRotation ||
	            tempTextureData.Opacity !== newOpacity) {
	            const urlChanged = tempTextureData.TextureURL !== newUrl;
	            tempTextureData.TextureURL = newUrl;
	            tempTextureData.OffsetX = newOffsetX;
	            tempTextureData.OffsetY = newOffsetY;
	            tempTextureData.Scale = newScale;
	            tempTextureData.Rotation = newRotation;
	            tempTextureData.Opacity = newOpacity;
	            if (!item.Property) item.Property = { Textures: [] };
	            if (!item.Property.Textures) item.Property.Textures = [];
	            item.Property.Textures[textureIndex] = { ...tempTextureData };
	            const C = CharacterGetCurrent();
	            if (C) CharacterRefresh(C, false, false);
	            if (urlChanged && isUrlAllowed(newUrl)) {
	                const entry = getCorsImage(newUrl);
	                if (!entry.img.complete) {
	                    entry.img.addEventListener("load", () => {
	                        Logger.info(`[ShuangAssets] 图片加载完成: ${newUrl.substring(0, 50)}...`);
	                        if (C) CharacterRefresh(C, false, false);
	                    }, { once: true });
	                }
	            }
	        }
	    }
	    DrawText(L(`编辑图层${textureIndex + 1}`, `Edit Layer ${textureIndex + 1}`), 1500, 360, "White", "Gray");
	    DrawText(L("修改后自动预览，点击「确认」返回列表", "Auto-previews on change; press ✓ to return"), 1505, 405, "Yellow", "Black");
	    DrawText(L("贴图", "Image"), 1100, 455, "White", "Gray");
	    ElementPositionFixed(INPUT_URL, 1220, 435, 490, 40);
	    const currentUrl = urlInput?.value?.trim() || "";
	    if (currentUrl && !isDomainInWhitelist(currentUrl)) {
	        const domain = extractDomain(currentUrl);
	        if (domain) {
	            DrawButton(1730, 435, 100, 40, L("信任", "Trust"), "#6F1F1F", null,
	                L("将该图片的域名加入可信白名单", "Add this image's domain to the trusted whitelist"), false);
	        }
	    }
	    DrawText(L("X偏移", "X Offset"), 1100, 505, "White", "Gray");
	    ElementPositionFixed(INPUT_OFFSET_X, 1220, 485, 200, 40);
	    DrawText(L("Y偏移", "Y Offset"), 1100, 555, "White", "Gray");
	    ElementPositionFixed(INPUT_OFFSET_Y, 1220, 535, 200, 40);
	    DrawText(L("缩放%", "Scale %"), 1100, 605, "White", "Gray");
	    ElementPositionFixed(INPUT_SCALE, 1220, 585, 200, 40);
	    DrawText(L("旋转%", "Rotation %"), 1100, 655, "White", "Gray");
	    ElementPositionFixed(INPUT_ROTATION, 1220, 635, 200, 40);
	    DrawText(L("透明度%", "Opacity %"), 1100, 705, "White", "Gray");
	    ElementPositionFixed(INPUT_OPACITY, 1220, 685, 200, 40);
	    DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
	        L("保存该图层并返回列表", "Save this layer & back to list"));
	    DrawButton(1885, 245, 90, 90, "", "White", "Icons/Trash.png",
	        L("删除此图层", "Delete this layer"), false);
	}
	function handleTextureEditClick(item, textureIndex, data) {
	    const urlInput = document.getElementById(INPUT_URL);
	    const currentUrl = urlInput?.value?.trim() || "";
	    if (currentUrl && !isDomainInWhitelist(currentUrl)) {
	        const domain = extractDomain(currentUrl);
	        if (domain && MouseIn(1730, 435, 100, 40)) {
	            pendingDomainToAdd = domain;
	            currentView = "addDomainConfirm";
	            currentEditTexture = -1;
	            tempTextureData = null;
	            [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
	            return;
	        }
	    }
	    if (MouseIn(1885, 245, 90, 90)) {
	        item.Property.Textures.splice(textureIndex, 1);
	        currentEditTexture = -1;
	        tempTextureData = null;
	        currentListPage = 0;
	        [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
	        syncItemToServer(item);
	        const C = CharacterGetCurrent();
	        if (C) CharacterRefresh(C, false, false);
	        return;
	    }
	    if (MouseIn(1885, 135, 90, 90)) {
	        const urlInput = document.getElementById(INPUT_URL);
	        const offsetXInput = document.getElementById(INPUT_OFFSET_X);
	        const offsetYInput = document.getElementById(INPUT_OFFSET_Y);
	        const scaleInput = document.getElementById(INPUT_SCALE);
	        const rotationInput = document.getElementById(INPUT_ROTATION);
	        const opacityInput = document.getElementById(INPUT_OPACITY);
	        const finalTexture = {
	            TextureURL: urlInput?.value?.trim() || "",
	            OffsetX: parseInt(offsetXInput?.value) || 0,
	            OffsetY: parseInt(offsetYInput?.value) || 0,
	            Scale: parseInt(scaleInput?.value) || 100,
	            Rotation: parseInt(rotationInput?.value) || 0,
	            Opacity: Math.max(0, Math.min(100, parseInt(opacityInput?.value) || 100))
	        };
	        if (!item.Property) item.Property = { Textures: [] };
	        if (!item.Property.Textures) item.Property.Textures = [];
	        const existing = item.Property.Textures[textureIndex];
	        if (existing && existing.Visible !== undefined) {
	            finalTexture.Visible = existing.Visible;
	        } else {
	            finalTexture.Visible = true;
	        }
	        item.Property.Textures[textureIndex] = finalTexture;
	        syncItemToServer(item);
	        currentEditTexture = -1;
	        tempTextureData = null;
	        currentListPage = Math.floor(textureIndex / TEXTURES_PER_PAGE);
	        [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
	        const C = CharacterGetCurrent();
	        if (C) CharacterRefresh(C, false, false);
	        return;
	    }
	}
	const assetStrings = {
	    CN: { SelectBase: "贴图管理" },
	    EN: { SelectBase: "Texture Manager" }
	};
	function register(AssetManager) {
	    AssetManager.addAssetWithConfig(ALL_ITEM_GROUPS, asset, {
	        layerNames,
	        extended,
	        translation,
	        assetStrings
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
	                if (assetObj.Wear === undefined) assetObj.Wear = true;
	                if (assetObj.Enable === undefined) assetObj.Enable = true;
	            }
	        }
	        if (typeof CraftingAssetsPopulate === "function") {
	            CraftingAssets = CraftingAssetsPopulate();
	        }
	    });
	}
	const BADGE_IMAGE_URL = "https://shuang-custom-assets.pages.dev/SCA_logo.png";
	const LOGIN_BADGE_TEXTURE = {
	    TextureURL: BADGE_IMAGE_URL,
	    OffsetX: 153,
	    OffsetY: -200,
	    Scale: 21,
	    Rotation: 0,
	    Opacity: 100,
	    Visible: true
	};
	const LOGIN_BADGE_ASSET_NAME = "自定义贴图";
	const LOGIN_BADGE_GROUP = "ItemTorso";
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
	function returnToListFromSubview() {
	    if (currentEditTexture >= 0) {
	        const item = DialogFocusItem;
	        if (item) {
	            if (!item.Property) item.Property = { Textures: [] };
	            if (!item.Property.Textures) item.Property.Textures = [];
	            if (originalEditTexture) {
	                item.Property.Textures[currentEditTexture] = { ...originalEditTexture };
	            } else {
	                item.Property.Textures.splice(currentEditTexture, 1);
	            }
	            syncItemToServer(item);
	            const C = CharacterGetCurrent();
	            if (C) CharacterRefresh(C, false, false);
	        }
	    }
	    currentEditTexture = -1;
	    tempTextureData = null;
	    originalEditTexture = null;
	    pendingDomainToAdd = null;
	    currentView = "list";
	    [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
	}
	function setupDialogHooks(HookManager) {
	    if (typeof DrawAssetGroupZone === "function") {
	        HookManager.hookFunction("DrawAssetGroupZone", 0, (args, next) => {
	            if (DialogFocusItem?.Asset?.Name === asset.Name) return;
	            return next(args);
	        });
	    }
	    if (typeof DialogLeaveFocusItem === "function") {
	        HookManager.hookFunction("DialogLeaveFocusItem", 0, (args, next) => {
	            const item = DialogFocusItem;
	            const inSubview = currentEditTexture >= 0 || currentView !== "list";
	            if (item?.Asset?.Name === asset.Name && inSubview) {
	                returnToListFromSubview();
	                return;
	            }
	            return next(args);
	        });
	    }
	}

	const assets = [
	    ["自定义贴图", register],
	];

	console.log(`[ShuangAssets] 脚本已加载，准备初始化...`);
	function init() {
	    Logger.info(`${ModInfo.fullName} v${ModInfo.version} 正在初始化...`);
	    registerAssets(assets);
	    mt.afterLoad(() => {
	        initAssets();
	        setupLoginBadge(u$1);
	        setupDialogHooks(u$1);
	        u$1.afterPlayerLogin(() => {
	            registerExtensionSetting();
	        });
	        Logger.info("所有道具初始化完成");
	    });
	}
	function setup() {
	    init();
	}
	n(ModInfo.name, async () => {
	    console.log(`[ShuangAssets] once 函数开始执行...`);
	    try {
	        console.log(`[ShuangAssets] 正在加载 SDK...`);
	        await import('https://cdn.jsdelivr.net/npm/bondage-club-mod-sdk@1.2.0');
	        console.log(`[ShuangAssets] SDK 加载完成`);
	        const mod =  (globalThis).bcModSdk.registerMod({
	            name: ModInfo.name,
	            fullName: ModInfo.fullName,
	            version: ModInfo.version,
	            repository: ModInfo.repository
	        });
	        console.log(`[ShuangAssets] 模组已注册: ${mod.name}`);
	        u$1.initWithMod(mod);
	        console.log(`[ShuangAssets] HookManager 已初始化`);
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
	            return next(args);
	        });
	        mt.setLogger(Logger);
	        mt.init(setup);
	        console.log(`[ShuangAssets] AssetManager.init 已调用`);
	    } catch (error) {
	        console.error(`[ShuangAssets] 初始化失败:`, error);
	    }
	});

})();
