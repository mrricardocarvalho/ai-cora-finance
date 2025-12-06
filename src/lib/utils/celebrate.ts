let _lastFired = 0
export async function celebrate(){
  try{
    const now = Date.now()
    if(now - _lastFired < 2000) return
    _lastFired = now
    const { default: confetti } = await import('canvas-confetti')
    try{
      confetti({
        particleCount: 160,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0D9488', '#10B981', '#F59E0B', '#ffffff']
      })
    }catch(e){ /* confetti failed, ignore */ }
    if(typeof window !== 'undefined'){
      try{ window.dispatchEvent(new CustomEvent('cora:celebrate')) }catch(e){}
    }
  }catch(e){ console.warn('celebrate failed', e) }
}

export default celebrate
