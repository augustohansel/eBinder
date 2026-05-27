import React from 'react'
import styles from './CardSlot.module.css'

interface CardSlotProps {
  card: any;
  index: number;
  onSelectCard: (c: any) => void;
  onDragStart: (idx: number) => void;
  onDragOver: (e: any, idx: number) => void;
  onDrop: (idx: number) => void;
  isDragOver: boolean;
  onAddCard: () => void;
  onDeleteCard?: (id: string) => void; 
}

export function CardSlot({ card, index, onSelectCard, onDragStart, onDragOver, onDrop, isDragOver, onAddCard, onDeleteCard }: CardSlotProps) {
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(e, index);
  }

  if (!card) {
    return (
      <div 
        className={`${styles.slot} ${styles.emptySlot} ${isDragOver ? styles.dragOver : ''}`}
        onClick={onAddCard}
        onDragOver={handleDragOver}
        onDrop={() => onDrop(index)}
      >
        <span className={styles.plusIcon}>+</span>
      </div>
    )
  }

  return (
    <div 
      className={`${styles.slot} ${styles.filledSlot} ${isDragOver ? styles.dragOver : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={handleDragOver}
      onDrop={() => onDrop(index)}
      onClick={() => onSelectCard(card)}
    >
      <img 
        src={card.frontImage} 
        alt={card.name} 
        className={styles.cardImage} 
        loading="lazy" 
        onError={(e) => {
          if (e.currentTarget.src.includes('_hires.png')) {
            e.currentTarget.src = e.currentTarget.src.replace('_hires.png', '.png');
          }
        }}
      />
      
      {onDeleteCard && (
        <button 
          className={styles.actionBtn} 
          onClick={(e) => {
            e.stopPropagation(); 
            onDeleteCard(card.id);
          }}
          title="Remover carta do fichário"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      )}
    </div>
  )
}