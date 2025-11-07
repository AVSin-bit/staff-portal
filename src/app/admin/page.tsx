'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage(){
  const [employees,setEmployees]=useState<any[]>([])
  const [employeeId,setEmployeeId]=useState('')
  const [delta,setDelta]=useState(3)
  const [note,setNote]=useState('Фото работы принято')
  const [me,setMe]=useState<any>(null)

  useEffect(()=>{(async()=>{
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){ window.location.href='/login'; return }

    const { data: actor } = await supabase
      .from('employees').select('*').eq('user_id', user.id).single()
    setMe(actor)

    // пока без RLS — показываем всех; позже ограничим по salon_id
    const { data } = await supabase
      .from('employees').select('id, full_name').order('full_name')
    setEmployees(data||[])
  })()},[])

  async function add(){
    if(!employeeId) return alert('Выбери сотрудника')
    const { error } = await supabase.from('points_ledger')
      .insert({ employee_id: employeeId, delta, created_by: me?.id, note })
    if(error) alert(error.message); else alert('Готово')
  }

  return (
    <div style={{padding:20, display:'grid', gap:10, maxWidth:520}}>
      <h1>Начислить/Списать баллы</h1>
      <select style={{border:'1px solid #ccc', padding:8, borderRadius:8}}
              value={employeeId} onChange={e=>setEmployeeId(e.target.value)}>
        <option value="">Выберите сотрудника</option>
        {employees.map(e=> <option key={e.id} value={e.id}>{e.full_name}</option>)}
      </select>
      <input style={{border:'1px solid #ccc', padding:8, borderRadius:8}}
             type="number" value={delta} onChange={e=>setDelta(parseInt(e.target.value||'0'))} />
      <input style={{border:'1px solid #ccc', padding:8, borderRadius:8}}
             placeholder="Комментарий" value={note} onChange={e=>setNote(e.target.value)} />
      <button onClick={add}
              style={{padding:10, border:'none', borderRadius:8, background:'#111', color:'#fff'}}>
        Записать операцию
      </button>
    </div>
  )
}
