import { useState, useEffect } from 'react'
import type { Collection, Card } from './data/collections'
import { HomePage } from './components/HomePage'
import { BinderPage } from './components/BinderPage'
import { InspectPage } from './components/InspectPage'
import { LoginPage } from './components/LoginPage'
import { getUserCollections } from './api'

type View =
  | { screen: 'home' }
  | { screen: 'collection'; collection: Collection }
  | { screen: 'inspect'; card: Card; collection: Collection }

export default function App() {
  const [loggedUserId, setLoggedUserId] = useState<string | null>(localStorage.getItem('pokelist_user_id'));
  
  const [view, setView] = useState<View>({ screen: 'home' })
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    if (!loggedUserId) return; 
    
    setLoading(true)
    try {
      const data = await getUserCollections(loggedUserId)
      setCollections(data)
      
      if (view.screen === 'collection' || view.screen === 'inspect') {
         const updatedCollection = data.find(c => c.id === view.collection.id)
         if (updatedCollection && view.screen === 'collection') {
             setView({ screen: 'collection', collection: updatedCollection })
         }
      }
    } catch (error) {
      console.error("Erro ao carregar dados", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [loggedUserId])

  const handleLogout = () => {
    localStorage.removeItem('pokelist_user_id');
    setLoggedUserId(null);
    setCollections([]);
    setView({ screen: 'home' });
  }

  if (!loggedUserId) {
    return <LoginPage onLogin={(id) => setLoggedUserId(id)} />
  }

  if (loading && collections.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>Carregando seu binder...</div>
  }

  if (view.screen === 'home') {
    return (
      <HomePage
        userId={loggedUserId} 
        collections={collections}
        onSelectCollection={(col) => setView({ screen: 'collection', collection: col })}
        onRefresh={loadData}
        onLogout={handleLogout}
      />
    )
  }

  if (view.screen === 'collection') {
    return (
      <BinderPage
        key={view.collection.id}
        collection={view.collection}
        onBack={() => setView({ screen: 'home' })}
        onSelectCard={(card) =>
          setView({ screen: 'inspect', card, collection: view.collection })
        }
        onRefresh={loadData}
      />
    )
  }

  if (view.screen === 'inspect') {
    return (
      <InspectPage
        card={view.card}
        collection={view.collection}
        onBack={() => setView({ screen: 'collection', collection: view.collection })}
      />
    )
  }

  return null
}