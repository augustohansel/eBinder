export interface Card {
  id: string
  pokemonCardId: string
  name: string
  type: string
  rarity: 'common' | 'uncommon' | 'rare' | 'holo' | 'ultra' | string
  frontImage: string 
  position: number
  collectionId: string
}

export interface Collection {
  id: string
  name: string
  description: string
  icon: string 
  accent: string 
  cardBack: string 
  userId: string
  cards?: Card[] 
}

export const rarityLabel: Record<string, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Rara',
  holo: 'Holográfica',
  ultra: 'Ultra Rara',
}

export const rarityColor: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#34d399',
  rare: '#60a5fa',
  holo: '#f472b6',
  ultra: '#fbbf24',
}