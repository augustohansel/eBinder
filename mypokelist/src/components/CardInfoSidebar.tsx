import { useState, useEffect } from 'react'
import styles from './CardInfoSidebar.module.css'

interface CardInfoSidebarProps {
  card: any;
  onClose?: () => void;
}

export function CardInfoSidebar({ card, onClose }: CardInfoSidebarProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const apiId = card.pokemonCardId || card.id;
        const response = await fetch(`https://api.pokemontcg.io/v2/cards/${apiId}`);
        const data = await response.json();
        setDetails(data.data);
      } catch (error) {
        console.error("Erro ao buscar detalhes da carta:", error);
      } finally {
        setLoading(false);
      }
    };

    if (card) fetchDetails();
  }, [card]);

  return (
    <aside className={styles.sidebar}>
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      )}

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Consultando banco de dados...</p>
        </div>
      ) : !details ? (
        <div className={styles.error}>Não foi possível carregar os dados.</div>
      ) : (
        <div className={styles.content}>
          
          <header className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.name}>{details.name}</h2>
              <span className={styles.supertype}>{details.supertype} {details.subtypes ? `- ${details.subtypes.join(', ')}` : ''}</span>
            </div>
            {details.hp && (
              <div className={styles.hpBox}>
                <span className={styles.hpLabel}>HP</span>
                <span className={styles.hpValue}>{details.hp}</span>
              </div>
            )}
          </header>

          <div className={styles.divider} />

          <section className={styles.section}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Coleção</span>
              <span className={styles.value}>{details.set?.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Raridade</span>
              <span className={styles.value}>{details.rarity || 'Normal'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Ilustrador</span>
              <span className={styles.value}>{details.artist || 'Desconhecido'}</span>
            </div>
            
            {details.tcgplayer?.prices && (
              <div className={styles.priceBox}>
                <span className={styles.priceTitle}>Preço de Mercado (USD)</span>
                <div className={styles.priceValues}>
                  {details.tcgplayer.prices.normal && (
                     <div className={styles.priceTag}>Normal: ${details.tcgplayer.prices.normal.market?.toFixed(2) || '--'}</div>
                  )}
                  {details.tcgplayer.prices.holofoil && (
                     <div className={styles.priceTag}>Holo: ${details.tcgplayer.prices.holofoil.market?.toFixed(2) || '--'}</div>
                  )}
                </div>
              </div>
            )}
          </section>

          {(details.abilities || details.attacks) && <div className={styles.divider} />}
          
          <section className={styles.section}>
            {details.abilities?.map((ability: any, idx: number) => (
              <div key={idx} className={styles.attackBlock}>
                <div className={styles.attackHeader}>
                  <span className={styles.abilityType}>{ability.type}</span>
                  <span className={styles.attackName}>{ability.name}</span>
                </div>
                <p className={styles.attackText}>{ability.text}</p>
              </div>
            ))}

            {details.attacks?.map((attack: any, idx: number) => (
              <div key={idx} className={styles.attackBlock}>
                <div className={styles.attackHeader}>
                  <div className={styles.costGrid}>
                    {attack.cost.map((cost: string, i: number) => (
                      <img key={i} src={`/types/${cost.toLowerCase()}.png`} alt={cost} className={styles.costIcon} onError={(e) => e.currentTarget.style.display='none'} />
                    ))}
                  </div>
                  <span className={styles.attackName}>{attack.name}</span>
                  <span className={styles.attackDamage}>{attack.damage}</span>
                </div>
                <p className={styles.attackText}>{attack.text}</p>
              </div>
            ))}
          </section>

          {details.flavorText && (
            <>
              <div className={styles.divider} />
              <section className={styles.flavorSection}>
                <p className={styles.flavorText}>"{details.flavorText}"</p>
              </section>
            </>
          )}

        </div>
      )}
    </aside>
  )
}