'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  // Р•СЃР»Рё СѓР¶Рµ Р°РІС‚РѕСЂРёР·РѕРІР°РЅС‹, РјРѕР¶РЅРѕ СЃСЂР°Р·Сѓ СѓР№С‚Рё РЅР° /dashboard
  useEffect(()=>{(async()=>{
    const { data:{ user } } = await supabase.auth.getUser()
    if(user) window.location.href = '/dashboard'
  })()},[])

  async function sendLink(){
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if(!error) setSent(true); else alert(error.message)
  }

  return (
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:16}}>
      <div style={{maxWidth:360,width:'100%',border:'1px solid #ddd',borderRadius:12,padding:20}}>
        <h1 style={{fontSize:22,marginBottom:12}}>Р’С…РѕРґ РїРѕ e-mail</h1>
        <input
          style={{width:'100%',padding:10,border:'1px solid #ccc',borderRadius:8,marginBottom:12}}
          placeholder="you@example.com"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />
        <button
          onClick={sendLink}
          disabled={!email}
          style={{width:'100%',padding:10,border:'none',borderRadius:8,background:'#111',color:'#fff'}}
        >
          РћС‚РїСЂР°РІРёС‚СЊ СЃСЃС‹Р»РєСѓ
        </button>
        {sent && <p style={{marginTop:10}}>РЎСЃС‹Р»РєР° РѕС‚РїСЂР°РІР»РµРЅР°. РџСЂРѕРІРµСЂСЊ РїРѕС‡С‚Сѓ.</p>}
      </div>
    </div>
  )
}

