import type { Collection } from './data/collections'

const API_URL = 'http://localhost:3333'

export async function loginUser(username: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  if (!response.ok) throw new Error('Usuário não encontrado');
  return response.json(); 
}

export async function getUserCollections(userId: string): Promise<Collection[]> {
  const response = await fetch(`${API_URL}/users/${userId}/collections`)
  if (!response.ok) throw new Error('Falha ao buscar coleções')
  return response.json()
}

export async function createCollection(collectionData: { userId: string, name: string, description: string, icon: string, accent: string, rows: number, cols: number }) {
  const response = await fetch(`${API_URL}/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(collectionData),
  });
  if (!response.ok) throw new Error('Falha ao criar');
  return response.json();
}

export async function updateCollection(id: string, data: { name: string, description: string, icon: string, accent: string, rows: number, cols: number }) {
  const response = await fetch(`${API_URL}/collections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Falha ao atualizar');
  return response.json();
}

export async function deleteCollection(id: string) {
  const response = await fetch(`${API_URL}/collections/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Falha ao deletar');
  return response.json();
}

export async function createCard(cardData: { collectionId: string, pokemonCardId: string, name: string, type: string, rarity: string, frontImage: string, cardBack: string, position: number }) {
  const response = await fetch(`${API_URL}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  if (!response.ok) throw new Error('Falha ao adicionar');
  return response.json();
}

export async function deleteCard(id: string) {
  const response = await fetch(`${API_URL}/cards/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Falha ao deletar carta');
  return response.json();
}

export async function saveCardOrder(updates: { id: string, position: number }[]) {
  const response = await fetch(`${API_URL}/cards/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });
  if (!response.ok) throw new Error('Falha ao reordenar');
  return response.json();
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
  if (!response.ok) throw new Error('Falha no upload');
  const data = await response.json();
  return data.url; 
}