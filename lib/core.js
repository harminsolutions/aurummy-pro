'use strict';
const OZ=31.1034768;
const PURITIES=[['999.9',.9999,'24K'],['999',.999,'24K'],['958',.958,'23K'],['916',.916,'22K'],['875',.875,'21K'],['835',.835,'20K'],['750',.750,'18K'],['585',.585,'14K'],['417',.417,'10K'],['375',.375,'9K']];
const isPrice=n=>Number.isFinite(n)&&n>0&&n<1e7;
function spotPerGram(xau,fx,purity=1){if(!isPrice(xau)||!isPrice(fx)||!(purity>0&&purity<=1))return null;return xau*fx/OZ*purity}
function nextPrice(today,worldReturn,fxReturn){if(!isPrice(today)||![worldReturn,fxReturn].every(Number.isFinite))return null;return today*(1+worldReturn)*(1+fxReturn)}
function parseNumber(x){if(typeof x==='number')return x;if(typeof x!=='string')return NaN;return Number(x.replace(/,/g,''))}
function strip(s){return String(s).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|amp);|&#160;/gi,' ').replace(/\s+/g,' ').trim()}
function parseTaukemas(html){
 const t=strip(html);const ret=t.search(/Live Gold Price/i),buy=t.search(/Live Buy Back Gold Price/i);
 if(ret<0)return null;
 const a=t.slice(ret,buy>ret?buy:ret+1600),b=buy>ret?t.slice(buy,buy+1800):'';
 const aliases={'999.9':/(?:24K\s*[-–( ]*\s*(?:999(?:\.9)?|Wafer)\s*\)?)/i,'916':/22K\s*[-–( ]*\s*916\s*\)?/i,'750':/18K\s*[-–( ]*\s*750\s*\)?/i,'585':/14K\s*[-–( ]*\s*585\s*\)?/i,'375':/9K\s*[-–( ]*\s*375\s*\)?/i};
 function extract(s){let out={};for(const [p,re] of Object.entries(aliases)){const m=re.exec(s);if(!m)continue;const after=s.slice(m.index+m[0].length,m.index+m[0].length+55);const n=after.match(/(?:RM\s*)?([\d,]+(?:\.\d{1,2})?)\s*(?:\/\s*g|\b)/i);if(n){const v=parseNumber(n[1]);if(v>20&&v<10000)out[p]=v}}return out}
 const retail=extract(a),buyback=extract(b);
 return Object.keys(retail).length?{retail,buyback,source:'TAUKEMAS',url:'https://taukemas.com/',checkedAt:new Date().toISOString(),publishedAt:null}:null;
}
function parseOneGold(html){const t=strip(html),out={}; const r=t.match(/Gold Prices\s*\(Updated\s*([^)]*)\)([^\n]{0,350})/i); if(!r)return null; const a=r[2].match(/916-N\s*RM\s*([\d,.]+)/i); const b=r[2].match(/999\s*RM\s*([\d,.]+)/i);if(a)out['916']=parseNumber(a[1]);if(b)out['999']=parseNumber(b[1]);if(!Object.keys(out).length)return null;return {retail:out,buyback:{},source:'One Gold Jewellery',url:'https://onegold.com.my/',checkedAt:new Date().toISOString(),publishedAt:r[1]};}
function seriesFromYahoo(j){const r=j?.chart?.result?.[0]; if(!r||!Array.isArray(r.timestamp))return [];const closes=r.indicators?.quote?.[0]?.close||[];return r.timestamp.map((ts,i)=>({day:new Date(ts*1000).toISOString().slice(0,10),value:Number(closes[i])})).filter(p=>isPrice(p.value));}
function forecast(world,fx,window=12){const join=[];const mx=new Map(fx.map(x=>[x.day,x.value]));for(const w of world){const rate=mx.get(w.day);if(isPrice(w.value)&&isPrice(rate))join.push({day:w.day,value:w.value*rate});}join.sort((a,b)=>a.day.localeCompare(b.day));const change=[];for(let i=1;i<join.length;i++)change.push(join[i].value/join[i-1].value-1);if(change.length<20)return {ready:false,reason:'Fewer than 20 matched historical trading-day observations',sample:change.length,delta:0,range:null,mae:null,directional:null,backtests:0,history:join};
 const estimate=seq=>{const last=seq.slice(-window),mean=last.reduce((a,b)=>a+b,0)/last.length;const short=seq.slice(-3).reduce((a,b)=>a+b,0)/3;return Math.max(-.012,Math.min(.012,mean*.16+short*.12))};
 const delta=estimate(change);const recent=change.slice(-45);const dev=Math.sqrt(recent.reduce((a,b)=>a+(b-delta)**2,0)/recent.length);const range=Math.max(.003,Math.min(.08,1.28*dev));
 const errors=[];let match=0;for(let i=20;i<change.length;i++){const est=estimate(change.slice(0,i)),actual=change[i];errors.push(Math.abs(est-actual));if(Math.sign(est)===Math.sign(actual))match++}
 return {ready:true,reason:'Experimental rolling momentum forecast, not a promise of future accuracy',sample:change.length,delta,range,mae:errors.reduce((a,b)=>a+b,0)/errors.length,directional:match/errors.length,backtests:errors.length,history:join};
}
module.exports={OZ,PURITIES,isPrice,spotPerGram,nextPrice,strip,parseTaukemas,parseOneGold,seriesFromYahoo,forecast};
