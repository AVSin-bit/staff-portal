'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  // Если уже авторизованы, можно сразу уйти на /dashboard
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
        <h1 style={{fontSize:22,marginBottom:12}}>Вход по e-mail</h1>
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
          Отправить ссылку
        </button>
        {sent && <p style={{marginTop:10}}>Ссылка отправлена. Проверь почту.</p>}
      </div>
    </div>
  )
}
