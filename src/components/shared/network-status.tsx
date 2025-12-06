"use client"
import React from 'react'

export function useNetworkStatus(){
  // Always start with true (online) for consistent SSR
  const [isOnline, setIsOnline] = React.useState(true)
  
  React.useEffect(()=>{
    // Set actual status after mount
    setIsOnline(navigator.onLine)
    
    function handleOnline(){ setIsOnline(true) }
    function handleOffline(){ setIsOnline(false) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return ()=>{ 
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline) 
    }
  }, [])
  return isOnline
}

export default function NetworkStatus(){
  const online = useNetworkStatus()
  if(online) return null
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-1 z-50">
      You are offline. Viewing cached data.
    </div>
  )
}
