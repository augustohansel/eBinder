import { useState, useEffect } from 'react'
import type { Card } from '../data/collections'
import styles from './AddCardModal.module.css'

interface AddCardModalProps {
  onClose: () => void; 
  onAddCards: (cards: Card[], addToCurrentPage: boolean) => void;
}

const POKEMON_TYPES = ['Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting', 'Fire', 'Grass', 'Lightning', 'Metal', 'Psychic', 'Water'];
const POKEMON_RARITIES = [
  'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Ultra', 
  'Rare Secret', 'Rare Rainbow', 'Illustration Rare', 'Special Illustration Rare', 'Promo'
];

export function AddCardModal({ onClose, onAddCards }: AddCardModalProps) {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [rarityFilter, setRarityFilter] = useState<string>('');
  
  const [setFilter, setSetFilter] = useState<string>('');
  const [availableSets, setAvailableSets] = useState<{id: string, name: string}[]>([]);

  const [searchResults, setSearchResults] = useState<Partial<Card>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch('https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate');
        const data = await response.json();
        const formattedSets = data.data.map((set: any) => ({
          id: set.id,
          name: set.name
        }));
        setAvailableSets(formattedSets);
      } catch (error) {
        console.error("Erro ao buscar a lista de coleções:", error);
      }
    };
    fetchSets();
  }, []);

  const buildSearchQuery = (term: string, type: string, rarity: string, setId: string) => {
    const queryParams = [];

    if (term.trim()) {
      const parts = term.trim().split(/\s+/);
      const nameParts: string[] = [];
      let numberPart: string | null = null;

      parts.forEach(part => {
        const cleanPart = part.replace(/[()]/g, '');
        const match = cleanPart.match(/^#?(\d+)(?:\/\d+)?$/);
        if (match) numberPart = match[1]; 
        else nameParts.push(cleanPart); 
      });

      if (nameParts.length > 0) queryParams.push(nameParts.map(word => `name:*${word}*`).join(' '));
      if (numberPart) queryParams.push(`number:${numberPart}`);
    }

    if (type) queryParams.push(`types:"${type}"`);
    if (rarity) queryParams.push(`rarity:"${rarity}"`);
    
    if (setId) queryParams.push(`set.id:"${setId}"`);

    if (queryParams.length === 0) return 'set.id:base1 rarity:"Rare Holo"';
    
    return queryParams.join(' ');
  };

  useEffect(() => {
    const query = buildSearchQuery(searchTerm, typeFilter, rarityFilter, setFilter);

    setIsSearching(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=${query}&page=1&pageSize=250`);
        const data = await response.json();
        
        const mappedCards = data.data.map((apiCard: any) => ({
          id: apiCard.id,
          name: `${apiCard.name} #${apiCard.number}${apiCard.set?.printedTotal ? `/${apiCard.set.printedTotal}` : ''}`,
          frontImage: apiCard.images.large || apiCard.images.small,
          rarity: apiCard.rarity || 'Desconhecida',
          types: apiCard.types || ['Normal']
        }));
        
        setSearchResults(mappedCards);
        setTotalCount(data.totalCount || 0); 
        setPage(1); 
      } catch (error) {
        console.error("Erro ao buscar cartas da API:", error);
        setSearchResults([]); 
        setTotalCount(0);
      } finally {
        setIsSearching(false);
      }
    }, searchTerm.trim() ? 500 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, typeFilter, rarityFilter, setFilter]);

  const loadMoreCards = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const query = buildSearchQuery(searchTerm, typeFilter, rarityFilter, setFilter);

    try {
      const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=${query}&page=${nextPage}&pageSize=250`);
      const data = await response.json();
      
      const mappedCards = data.data.map((apiCard: any) => ({
        id: apiCard.id,
        name: `${apiCard.name} #${apiCard.number}${apiCard.set?.printedTotal ? `/${apiCard.set.printedTotal}` : ''}`,
        frontImage: apiCard.images.large || apiCard.images.small,
        rarity: apiCard.rarity || 'Desconhecida',
        types: apiCard.types || ['Normal']
      }));
      
      setSearchResults(prev => [...prev, ...mappedCards]);
      setPage(nextPage);
    } catch (error) {
      console.error("Erro ao carregar mais cartas:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }

  const toggleSelectCard = (card: Card) => {
    if (selectedCards.find(c => c.id === card.id)) {
      setSelectedCards(prev => prev.filter(c => c.id !== card.id));
    } else {
      setSelectedCards(prev => [...prev, card]);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <header className={styles.header}>
          <h2 className={styles.title}>Adicionar Cartas</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </header>

        <div className={styles.content}>
          
          <div className={styles.searchBar}>
            <input 
              placeholder="Ex: Pikachu, Charizard, Psyduck #175/165..." 
              className={styles.searchInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {!isSearching && totalCount > 0 && (
              <span className={styles.resultsCount}>
                Mostrando {searchResults.length} de {totalCount}
              </span>
            )}
          </div>

          <div className={styles.mainLayout}>
            
            <aside className={styles.filtersPanel}>
              
              <div className={styles.filterGroup}>
                <div className={styles.filterHeader}>
                  <label className={styles.filterTitle}>Coleção</label>
                  {setFilter && <button className={styles.clearFilterBtn} onClick={() => setSetFilter('')}>Limpar</button>}
                </div>
                <select 
                  className={styles.filterSelect}
                  value={setFilter}
                  onChange={(e) => setSetFilter(e.target.value)}
                  disabled={availableSets.length === 0} 
                >
                  <option value="">Todas as Coleções</option>
                  {availableSets.map(set => (
                    <option key={set.id} value={set.id}>{set.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.divider} />

              <div className={styles.filterGroup}>
                <div className={styles.filterHeader}>
                  <label className={styles.filterTitle}>Tipo de Energia</label>
                  {typeFilter && <button className={styles.clearFilterBtn} onClick={() => setTypeFilter('')}>Limpar</button>}
                </div>
                <div className={styles.typeGrid}>
                  {POKEMON_TYPES.map(type => (
                    <button 
                      key={type} 
                      className={`${styles.typeBtn} ${typeFilter === type ? styles.typeBtnActive : ''}`}
                      onClick={() => setTypeFilter(type === typeFilter ? '' : type)}
                      title={type}
                    >
                      <img src={`/types/${type.toLowerCase()}.png`} alt={type} className={styles.typeIcon} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = type[0]; }} />
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.filterGroup}>
                <div className={styles.filterHeader}>
                  <label className={styles.filterTitle}>Raridade</label>
                  {rarityFilter && <button className={styles.clearFilterBtn} onClick={() => setRarityFilter('')}>Limpar</button>}
                </div>
                <select 
                  className={styles.filterSelect}
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                >
                  <option value="">Todas as Raridades</option>
                  {POKEMON_RARITIES.map(rarity => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>
              </div>
            </aside>

            <main className={styles.cardsGridWrap}>
              <div className={styles.cardsGrid}>
                {isSearching ? (
                  <div style={{ padding: '20px', color: 'var(--ink-muted)' }}>Consultando a Pokédex... 🔍</div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '20px', color: 'var(--ink-muted)' }}>Nenhuma carta encontrada.</div>
                ) : (
                  searchResults.map((card) => {
                    const isSelected = selectedCards.find(c => c.id === card.id);
                    return (
                      <div key={card.id} className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`} onClick={() => toggleSelectCard(card as Card)}>
                        <img 
                          src={card.frontImage} 
                          alt={card.name} 
                          className={styles.cardImg} 
                          loading="lazy" 
                          onError={(e) => {
                            if (e.currentTarget.src.includes('_hires.png')) {
                              e.currentTarget.src = e.currentTarget.src.replace('_hires.png', '.png');
                            }
                          }}
                        />
                      </div>
                    )
                  })
                )}
              </div>

              {!isSearching && searchResults.length > 0 && searchResults.length < totalCount && (
                <div className={styles.loadMoreWrap}>
                  <button className={styles.loadMoreBtn} onClick={loadMoreCards} disabled={isLoadingMore}>
                    {isLoadingMore ? 'Carregando...' : 'Carregar Mais Cartas ↓'}
                  </button>
                </div>
              )}
            </main>

            <aside className={styles.selectedPanel}>
              <h3 className={styles.selectedTitle}>Selecionadas ({selectedCards.length})</h3>
              <div className={styles.selectedArea}>
                {selectedCards.length === 0 ? (
                  <div className={styles.emptySelected}>
                    <span className={styles.selectedIcon}>🃏</span>
                    As cartas selecionadas aparecerão aqui
                  </div>
                ) : (
                  <div className={styles.selectedList}>
                    {selectedCards.map(card => (
                      <div key={card.id} className={styles.selectedItem}>
                        <div className={styles.selectedItemInfo}>
                          <img 
                            src={card.frontImage} 
                            alt={card.name} 
                            className={styles.selectedImg} 
                            onError={(e) => {
                              if (e.currentTarget.src.includes('_hires.png')) {
                                e.currentTarget.src = e.currentTarget.src.replace('_hires.png', '.png');
                              }
                            }}
                          />
                          <strong>{card.name}</strong>
                        </div>
                        <button 
                          className={styles.removeSelectedBtn} 
                          onClick={() => toggleSelectCard(card as Card)}
                          title="Remover das selecionadas"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                className={styles.addCardsBtn} 
                onClick={() => { onAddCards(selectedCards, true); }} 
                disabled={selectedCards.length === 0}
              >
                + Adicionar {selectedCards.length} cartas
              </button>
              
            </aside>

          </div>
        </div>
      </div>
    </div>
  )
}