import { useState, useEffect, useMemo } from 'react'
import { CardSlot } from './CardSlot'
import { AddCardModal } from './AddCardModal'
import { saveCardOrder, updateCollection, createCard, deleteCard } from '../api'
import styles from './BinderPage.module.css'

interface BinderPageProps {
  collection: any; 
  onBack: () => void; 
  onSelectCard: (c: any) => void; 
  onRefresh: () => void;
}

const GRID_OPTIONS = [
  { label: '2x2', r: 2, c: 2 },
  { label: '3x3', r: 3, c: 3 },
  { label: '4x4', r: 4, c: 4 }
];

export function BinderPage({ collection, onBack, onSelectCard, onRefresh }: BinderPageProps) {
  const [grid, setGrid] = useState({ r: collection.rows || 3, c: collection.cols || 3 });
  const SLOTS_PER_PAGE = grid.r * grid.c;

  const [cards, setCards] = useState<(any | null)[]>([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [spreadIndex, setSpreadIndex] = useState(0); 
  
  const totalCards = collection.cards?.length || 0;
  const maxPosition = Math.max(-1, ...(collection.cards || []).map((c: any) => c.position));
  
  const dbMaxSpread = maxPosition < SLOTS_PER_PAGE ? 0 : Math.floor((maxPosition - SLOTS_PER_PAGE) / (SLOTS_PER_PAGE * 2)) + 1;
  const totalPagesCount = dbMaxSpread === 0 ? 1 : dbMaxSpread * 2 + 1;
  const activeSpread = Math.max(spreadIndex, dbMaxSpread);

  const typeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    (collection.cards || []).forEach((c: any) => {
      const t = Array.isArray(c.types) ? c.types[0] : (c.type && c.type !== 'Desconhecido' ? c.type : 'Outros');
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [collection.cards]);

  const rarityStats = useMemo(() => {
    const counts: Record<string, number> = {};
    (collection.cards || []).forEach((c: any) => {
      const r = c.rarity && c.rarity !== 'Desconhecida' ? c.rarity : 'Sem Raridade';
      counts[r] = (counts[r] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [collection.cards]);

  useEffect(() => {
    const cardsInDb = collection.cards || [];
    const totalSlots = (activeSpread * 2 + 1) * SLOTS_PER_PAGE;
    const arr: (any | null)[] = Array(totalSlots).fill(null);
    cardsInDb.forEach((card: any) => { if (card.position < totalSlots) arr[card.position] = card; });
    setCards(arr);
  }, [collection.cards, SLOTS_PER_PAGE, activeSpread]);

  const leftPageStart = spreadIndex === 0 ? null : (spreadIndex * 2 - 1) * SLOTS_PER_PAGE;
  const rightPageStart = spreadIndex * 2 * SLOTS_PER_PAGE;

  const leftPageSlots = leftPageStart !== null ? cards.slice(leftPageStart, leftPageStart + SLOTS_PER_PAGE) : [];
  const rightPageSlots = cards.slice(rightPageStart, rightPageStart + SLOTS_PER_PAGE);

  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const handleGridChange = async (r: number, c: number) => {
    setGrid({ r, c });
    setSpreadIndex(0); 
    try {
      await updateCollection(collection.id, { ...collection, rows: r, cols: c });
      onRefresh();
    } catch (e) { console.error("Erro ao salvar grid", e) }
  }

  const handleAddCards = async (selectedCards: any[], currentOnly: boolean) => {
    const currentCardsInDb = [...(collection.cards || [])];
    const takenPositions = new Set(currentCardsInDb.map((c: any) => c.position));
    const availablePositions: number[] = [];
    
    const spreadStart = spreadIndex === 0 ? 0 : (leftPageStart as number);
    const spreadEnd = rightPageStart + SLOTS_PER_PAGE;
    
    for (let pos = spreadStart; pos < spreadEnd; pos++) {
      if (!takenPositions.has(pos)) {
        availablePositions.push(pos);
      }
    }
    
    let absoluteEndPosition = currentCardsInDb.length > 0 
      ? Math.max(...currentCardsInDb.map((c: any) => c.position)) + 1 
      : 0;

    if (absoluteEndPosition < spreadEnd) {
      absoluteEndPosition = spreadEnd;
    }

    try {
      await Promise.all(selectedCards.map(async (selectedCard) => {
        let targetPosition: number;
        
        if (availablePositions.length > 0) {
          targetPosition = availablePositions.shift()!;
        } else {
          targetPosition = absoluteEndPosition;
          absoluteEndPosition++;
        }

        return createCard({
          collectionId: collection.id,
          pokemonCardId: selectedCard.id, 
          name: selectedCard.name,
          type: selectedCard.types ? selectedCard.types[0] : "Normal", 
          rarity: selectedCard.rarity || "Comum", 
          frontImage: selectedCard.frontImage,
          cardBack: "pokemon",
          position: targetPosition
        });
      }));

      setShowAddCardModal(false);
      onRefresh(); 
    } catch (e) { console.error("Erro ao salvar novas cartas:", e); }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm("Tem certeza que deseja remover esta carta do fichário?")) return;
    try {
      await deleteCard(cardId);
      onRefresh(); 
    } catch (error) { console.error("Erro ao deletar carta:", error); }
  };

  const handleDrop = async (pageOffset: number, localIdx: number) => {
    const to = pageOffset + localIdx;
    if (dragFrom === null || dragFrom === to) { setDragFrom(null); setDragOverIdx(null); return; }
    
    const next = [...cards];
    [next[dragFrom], next[to]] = [next[to], next[dragFrom]];
    setCards(next); setDragFrom(null); setDragOverIdx(null);
    
    const updates = [];
    if (next[dragFrom]) updates.push({ id: next[dragFrom]!.id, position: dragFrom });
    if (next[to]) updates.push({ id: next[to]!.id, position: to });
    if (updates.length > 0) { await saveCardOrder(updates); onRefresh(); }
  }

  const canGoPrev = spreadIndex > 0;
  const nextSpread = () => setSpreadIndex(s => s + 1);
  const prevSpread = () => setSpreadIndex(s => Math.max(0, s - 1));

  return (
    <div className={styles.page}>
      
      <aside className={styles.floatingSidebar}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Voltar aos Fichários
        </button>

        <div className={styles.sidebarHeader}>
          <div className={styles.titleWrap}>
            <h2 className={styles.sidebarTitle}>{collection.name}</h2>
            <span className={styles.eBinderBrand}>eBinder Oficial</span>
          </div>
        </div>
        
        <div className={styles.sidebarContent}>
          <div className={styles.divider} />

          <div className={styles.sidebarSection}>
            <label className={styles.sidebarLabel}>Layout da Página</label>
            <div className={styles.layoutOptions}>
              {GRID_OPTIONS.map(opt => (
                <button 
                  key={opt.label} 
                  onClick={() => handleGridChange(opt.r, opt.c)} 
                  className={`${styles.layoutBtn} ${grid.r === opt.r && grid.c === opt.c ? styles.layoutBtnActive : ''}`} 
                  style={grid.r === opt.r && grid.c === opt.c ? { borderColor: collection.accent, color: collection.accent, background: `${collection.accent}15` } : {}}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          <button 
            className={styles.addCardSidebarBtn} 
            onClick={() => setShowAddCardModal(true)}
            style={{ backgroundColor: collection.accent }}
          >
            + Adicionar Carta
          </button>

          <div className={styles.sidebarSection}>
            <label className={styles.sidebarLabel}>Visão Geral</label>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{totalCards}</span>
                <span className={styles.statLabel}>Cartas</span>
              </div>
            </div>
          </div>

          <div className={styles.statsRowWrapper}>
            <div className={styles.sidebarSection} style={{ flex: 1 }}>
              <label className={styles.sidebarLabel}>Por Raridade</label>
              <div className={styles.statsList}>
                {rarityStats.map(([label, count]) => (
                  <div key={label} className={styles.statRow}>
                    <span className={styles.statRowLabel} title={label}>{label}</span>
                    <span className={styles.statRowValue}>{count}</span>
                  </div>
                ))}
                {rarityStats.length === 0 && <span className={styles.emptyStat}>Vazio</span>}
              </div>
            </div>

            <div className={styles.sidebarSection} style={{ flex: 1 }}>
              <label className={styles.sidebarLabel}>Por Tipo</label>
              <div className={styles.statsList}>
                {typeStats.map(([label, count]) => (
                  <div key={label} className={styles.statRow}>
                    <div className={styles.typeLabelGroup}>
                      <img src={`/types/${label.toLowerCase()}.png`} alt={label} className={styles.statTypeIcon} onError={(e) => e.currentTarget.style.display = 'none'} />
                      <span className={styles.statRowLabel} title={label}>{label}</span>
                    </div>
                    <span className={styles.statRowValue}>{count}</span>
                  </div>
                ))}
                {typeStats.length === 0 && <span className={styles.emptyStat}>Vazio</span>}
              </div>
            </div>
          </div>
          
        </div>
      </aside>

      <main className={styles.binderArea}>
        <button className={styles.sideNavBtn} onClick={prevSpread} disabled={!canGoPrev}>❮</button>

        <div className={styles.binderWrap}>
          {spreadIndex === 0 ? (
            <div className={styles.binder} style={{ backgroundColor: collection.accent, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: 'none', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: -100, right: -50, width: 300, height: 300, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '50%' }} />
              
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', color: '#fff', textAlign: 'center', marginBottom: '16px', padding: '0 20px', textShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 2 }}>{collection.name}</h1>
              <div style={{ width: '60px', height: '2px', backgroundColor: 'rgba(255,255,255,0.4)', margin: '12px 0', zIndex: 2 }} />
              <span style={{ color: '#fff', opacity: 0.9, letterSpacing: '5px', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 'bold', zIndex: 2 }}>eBinder</span>
            </div>
          ) : (
            <div className={styles.binder}>
              <div className={styles.binderHeader}>
                <span className={styles.binderTitle} style={{ color: collection.accent }}>{collection.name}</span>
                <span className={styles.binderPage} style={{ color: 'var(--ink-muted)' }}>pág. {spreadIndex * 2}</span>
              </div>
              <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${grid.c}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${grid.r}, minmax(0, 1fr))` }}>
                {leftPageSlots.map((card, i) => <CardSlot key={i} card={card} index={i} onSelectCard={onSelectCard} onDragStart={(idx: number) => setDragFrom((leftPageStart as number) + idx)} onDragOver={(_e: any, idx: number) => setDragOverIdx((leftPageStart as number) + idx)} onDrop={(idx: number) => handleDrop((leftPageStart as number), idx)} isDragOver={dragOverIdx === (leftPageStart as number) + i} onAddCard={() => setShowAddCardModal(true)} onDeleteCard={handleDeleteCard} />)}
              </div>
            </div>
          )}

          <div className={styles.binder}>
            <div className={styles.binderHeader}>
              <div /> 
              <span className={styles.binderPage} style={{ color: 'var(--ink-muted)' }}>pág. {spreadIndex * 2 + 1}</span>
            </div>
            <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${grid.c}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${grid.r}, minmax(0, 1fr))` }}>
              {rightPageSlots.map((card, i) => <CardSlot key={i} card={card} index={i} onSelectCard={onSelectCard} onDragStart={(idx: number) => setDragFrom(rightPageStart + idx)} onDragOver={(_e: any, idx: number) => setDragOverIdx(rightPageStart + idx)} onDrop={(idx: number) => handleDrop(rightPageStart, idx)} isDragOver={dragOverIdx === rightPageStart + i} onAddCard={() => setShowAddCardModal(true)} onDeleteCard={handleDeleteCard} />)}
            </div>
          </div>
        </div>

        <button className={styles.sideNavBtn} onClick={nextSpread}>❯</button>
      </main>

      {showAddCardModal && <AddCardModal onClose={() => setShowAddCardModal(false)} onAddCards={handleAddCards} />}
    </div>
  )
}