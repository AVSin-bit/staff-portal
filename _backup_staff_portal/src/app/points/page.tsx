'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Row = { created_at: string; delta: number; note: string }

export default function PointsPage(){
  const [rows,setRows]=useState<Row[]>([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{(async()=>{
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){ window.location.href='/login'; return }
    const { data: emp } = await supabase.from('employees').select('id')
      .eq('user_id', user.id).single()
    const { data } = await supabase.from('points_ledger')
      .select('created_at, delta, note')
      .eq('employee_id', emp!.id)
      .order('created_at', { ascending:false })
      .limit(50)
    setRows(data||[])
    setLoading(false)
  })()},[])

  if(loading) return <div style={{padding:20}}>Р—Р°РіСЂСѓР·РєР°вЂ¦</div>

  return (
    <div style={{padding:20}}>
      <h1>РњРѕРё РѕРїРµСЂР°С†РёРё РїРѕ Р±Р°Р»Р»Р°Рј</h1>
      <table style={{width:'100%', marginTop:12, borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:8}}>Р”Р°С‚Р°</th>
            <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:8}}>РР·Рј.</th>
            <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:8}}>РљРѕРјРјРµРЅС‚Р°СЂРёР№</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i}>
              <td style={{padding:8}}>{new Date(r.created_at).toLocaleString()}</td>
              <td style={{padding:8, color: r.delta>=0?'green':'crimson'}}>{r.delta>0?`+${r.delta}`:r.delta}</td>
              <td style={{padding:8}}>{r.note||''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

