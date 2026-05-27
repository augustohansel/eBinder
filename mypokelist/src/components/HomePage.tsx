import { useState, useEffect } from 'react'
import type { Collection } from '../data/collections'
import { createCollection, deleteCollection } from '../api'
import styles from './HomePage.module.css'

interface HomePageProps {
  userId: string; 
  collections: Collection[]; 
  onSelectCollection: (c: Collection) => void; 
  onRefresh: () => void; 
  onLogout: () => void;
}

export function HomePage({ userId, collections, onSelectCollection, onRefresh, onLogout }: HomePageProps) {
  const [theme, setTheme] = useState(localStorage.getItem('ebinder_theme') || 'light')
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ebinder_theme', theme)
  }, [theme])

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [accent, setAccent] = useState('#3b82f6')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsSubmitting(true);
    try {
      // Cria a coleção passando o ícone vazio, já que não usamos mais
      await createCollection({ userId, name, description: '', icon: '', accent, rows: 3, cols: 3 })
      setShowForm(false); 
      onRefresh();
      setName('');
    } catch (err) { 
      alert("Erro ao salvar!") 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (!window.confirm("Deletar binder e todas as cartas permanentemente?")) return;
    await deleteCollection(id); 
    onRefresh();
  }

  return (
    <div className={styles.page}>
      
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <span className={styles.brandMy}>e</span><span className={styles.brandPoke}>Binder</span>
        </div>
        <div className={styles.navActions}>
          <button className={styles.themeBtn} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
          </button>
          <button className={styles.logoutBtn} onClick={onLogout}>Sair</button>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Sua Estante Virtual</p>
          <h1 className={styles.heroTitle}>Coleções <br /><em>Universais</em></h1>
        </div>
      </section>

      <main className={styles.main}>
        <div className={styles.grid}>
          {collections.map((col: any) => (
            <div key={col.id} className={styles.binderCard} onClick={() => onSelectCollection(col)}>
              
              <div className={styles.binderSpine} style={{ backgroundColor: col.accent }} />
              
              <div className={styles.binderContent}>
                <div className={styles.binderHeader}>
                  <button className={styles.deleteBtn} onClick={(e) => handleDelete(e, col.id)} title="Excluir Coleção">
                    ✕
                  </button>
                </div>
                <div className={styles.binderBody}>
                  <strong className={styles.binderName}>{col.name}</strong>
                  <span className={styles.binderCount}>{col.cards?.length || 0} Cartas</span>
                </div>
              </div>

            </div>
          ))}

          <div className={styles.addBinderCard} onClick={() => setShowForm(true)}>
            <span className={styles.addBinderIcon}>+</span>
            <span className={styles.addBinderText}>Criar Coleção</span>
          </div>
        </div>
      </main>

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            
            <header className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Novo Fichário</h2>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>✕</button>
            </header>

            <form onSubmit={handleSave} className={styles.form}>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Nome da Coleção e Cor</label>
                <div className={styles.nameRow}>
                  <input 
                    required 
                    placeholder="Ex: Base Set 1999" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className={styles.input} 
                    autoFocus
                  />
                  <input 
                    type="color" 
                    value={accent} 
                    onChange={e => setAccent(e.target.value)} 
                    className={styles.colorPicker} 
                    title="Cor do Fichário"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !name.trim()} 
                className={styles.submitBtn}
                style={{ backgroundColor: accent }}
              >
                {isSubmitting ? 'Montando Fichário...' : 'Criar Fichário'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}