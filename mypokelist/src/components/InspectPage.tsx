import { CardViewer } from './CardViewer'
import { deleteCard } from '../api'
import styles from './InspectPage.module.css'

export function InspectPage({ card, onBack }: any) {
  
  const handleDelete = async () => {
    if (!window.confirm(`Deseja deletar "${card.name}"?`)) return;
    try { await deleteCard(card.id); window.location.reload(); } catch (err) { alert("Erro ao deletar"); }
  }

  return (
    <div className={styles.page}>
      {/* Controles Flutuantes */}
      <div className={styles.floatingControls}>
        <button className={styles.actionBtn} onClick={onBack}>← Voltar</button>
      </div>

      {/* Visualizador Ocupando Toda a Tela */}
      <div className={styles.viewerWrap}>
        <CardViewer card={card} />
        <div className={styles.hint}>Arraste para girar a carta livremente</div>
      </div>
    </div>
  )
}