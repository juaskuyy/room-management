const out=(data,status=200)=>Response.json(data,{status});
const valid=b=>!['nikiroom','vinzzroom'].includes(b.agent)?'Agen tidak valid.':!b.date?'Tanggal wajib diisi.':!String(b.unit||'').trim()?'Unit wajib diisi.':null;
export async function onRequestPut({request,env,params}){
  try {
    const b=await request.json(), err=valid(b); if(err) return out({error:err},400);
    const r=await env.DB.prepare(`UPDATE transactions SET agent=?,date=?,check_in_time=?,unit=?,rental_duration=?,income=?,expense=?,description=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(
      b.agent,b.date,b.check_in_time||null,String(b.unit).trim(),b.rental_duration||null,Number(b.income||0),Number(b.expense||0),b.description||null,Number(params.id)
    ).run();
    return r.meta.changes?out({ok:true}):out({error:'Transaksi tidak ditemukan.'},404);
  } catch(e){ return out({error:'Gagal memperbarui transaksi.',detail:e.message},500); }
}
export async function onRequestDelete({env,params}){
  try { const r=await env.DB.prepare('DELETE FROM transactions WHERE id=?').bind(Number(params.id)).run(); return r.meta.changes?out({ok:true}):out({error:'Transaksi tidak ditemukan.'},404); }
  catch(e){ return out({error:'Gagal menghapus transaksi.',detail:e.message},500); }
}

