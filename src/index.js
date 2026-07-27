const COOKIE_NAME = "room_session";
const SESSION_AGE = 60 * 60 * 24 * 7;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/login" && request.method === "POST") return login(request, env);
      if (url.pathname === "/api/logout" && request.method === "POST") {
        return json({ ok: true }, 200, {"Set-Cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`});
      }
      if (url.pathname === "/api/session" && request.method === "GET") return json({ ok: await authenticated(request, env) });

      if (url.pathname.startsWith("/api/")) {
        if (!(await authenticated(request, env))) return json({ ok:false, error:"Sesi tidak valid. Silakan login kembali." }, 401);
        if (url.pathname === "/api/health" && request.method === "GET") {
          await env.DB.prepare("SELECT 1").first();
          return json({ ok:true, database:"connected", auth:"protected" });
        }
        if (url.pathname === "/api/transactions" && request.method === "GET") {
          const result = await env.DB.prepare(`SELECT id,room,type,date,time,unit,duration,amount,description,created_at,updated_at FROM transactions ORDER BY date DESC,time DESC,id DESC`).all();
          return json({ ok:true, data:result.results || [] });
        }
        if (url.pathname === "/api/transactions" && request.method === "POST") {
          const d = validate(await request.json()); const now = new Date().toISOString();
          const result = await env.DB.prepare(`INSERT INTO transactions(room,type,date,time,unit,duration,amount,description,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)`)
            .bind(d.room,d.type,d.date,d.time,d.unit,d.duration,d.amount,d.description,now,now).run();
          return json({ ok:true, id:result.meta.last_row_id }, 201);
        }
        const m = url.pathname.match(/^\/api\/transactions\/(\d+)$/);
        if (m && request.method === "PUT") {
          const d = validate(await request.json());
          const r = await env.DB.prepare(`UPDATE transactions SET room=?,type=?,date=?,time=?,unit=?,duration=?,amount=?,description=?,updated_at=? WHERE id=?`)
            .bind(d.room,d.type,d.date,d.time,d.unit,d.duration,d.amount,d.description,new Date().toISOString(),Number(m[1])).run();
          if (!r.meta.changes) return json({ok:false,error:"Data tidak ditemukan."},404);
          return json({ok:true});
        }
        if (m && request.method === "DELETE") {
          const r = await env.DB.prepare("DELETE FROM transactions WHERE id=?").bind(Number(m[1])).run();
          if (!r.meta.changes) return json({ok:false,error:"Data tidak ditemukan."},404);
          return json({ok:true});
        }
        return json({ok:false,error:"Endpoint tidak ditemukan."},404);
      }
      return env.ASSETS.fetch(request);
    } catch (e) {
      console.error(e); return json({ok:false,error:e.message || "Terjadi kesalahan server."},e.status || 500);
    }
  }
};

function validate(b){
  const room=String(b.room||""), type=String(b.type||""), date=String(b.date||"").trim(), amount=Math.round(Number(b.amount));
  if(!["NikiRoom","VinzzRoom"].includes(room)) throw bad("Room tidak valid.");
  if(!["income","expense"].includes(type)) throw bad("Jenis transaksi tidak valid.");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw bad("Tanggal wajib diisi.");
  if(!Number.isFinite(amount)||amount<0) throw bad("Nominal tidak valid.");
  return {room,type,date,amount,time:clean(b.time,10),unit:clean(b.unit,80),duration:clean(b.duration,80),description:clean(b.description,500)};
}
async function login(request,env){
  if(!env.ADMIN_USERNAME||!env.ADMIN_PASSWORD||!env.SESSION_SECRET) return json({ok:false,error:"Secret login belum diatur."},500);
  const b=await request.json();
  if(!safeEqual(String(b.username||""),env.ADMIN_USERNAME)||!safeEqual(String(b.password||""),env.ADMIN_PASSWORD)) return json({ok:false,error:"Username atau password salah."},401);
  const exp=Math.floor(Date.now()/1000)+SESSION_AGE, payload=`${env.ADMIN_USERNAME}.${exp}`, sig=await sign(payload,env.SESSION_SECRET), token=`${b64(payload)}.${sig}`;
  return json({ok:true},200,{"Set-Cookie":`${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_AGE}`});
}
async function authenticated(request,env){
  if(!env.ADMIN_USERNAME||!env.SESSION_SECRET)return false;
  const cookie=request.headers.get("Cookie")||"";
  const token=cookie.split(";").map(v=>v.trim()).find(v=>v.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length+1);
  if(!token)return false; const [encoded,sig]=token.split("."); if(!encoded||!sig)return false;
  let payload; try{payload=ub64(encoded)}catch{return false}
  const dot=payload.lastIndexOf("."); if(dot<1)return false;
  const username=payload.slice(0,dot), exp=Number(payload.slice(dot+1));
  if(username!==env.ADMIN_USERNAME||!Number.isFinite(exp)||exp<Date.now()/1000)return false;
  return safeEqual(sig,await sign(payload,env.SESSION_SECRET));
}
async function sign(v,s){const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(s),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const x=new Uint8Array(await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(v)));return [...x].map(b=>b.toString(16).padStart(2,"0")).join("")}
function safeEqual(a,b){a=String(a);b=String(b);if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0}
function b64(s){return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function ub64(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return decodeURIComponent(escape(atob(s)))}
function clean(v,m){return String(v||"").trim().slice(0,m)}
function bad(m){const e=new Error(m);e.status=400;return e}
function json(d,s=200,h={}){return new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json; charset=UTF-8",...h}})}
