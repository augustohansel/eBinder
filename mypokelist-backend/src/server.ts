import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// 1. Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configuração do Multer (guarda a imagem na memória temporariamente)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ==========================================
// ROTA DE UPLOAD DE IMAGEM
// ==========================================
app.post('/upload', upload.single('image'), async (req, res): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    // Converte o arquivo da memória para o formato base64 que o Cloudinary aceita
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

    // Faz o upload para uma pasta chamada 'mypokelist' lá no Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'mypokelist',
    });

    // Devolve a URL final da imagem pronta para uso!
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no upload para o Cloudinary' });
  }
});

// ==========================================
// 1. ROTAS DE USUÁRIO
// ==========================================
app.post('/users', async (req, res) => {
  const { username, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: { username, email }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar usuário' });
  }
});

// NOVA ROTA DE LOGIN
app.post('/login', async (req, res): Promise<any> => {
  const { username } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado!' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ==========================================
// 2. ROTAS DE COLEÇÕES
// ==========================================

// Criar uma nova coleção para um usuário
app.post('/collections', async (req, res) => {
  const { userId, name, description, icon, accent, rows, cols } = req.body;

  try {
    const collection = await prisma.collection.create({
      data: { userId, name, description, icon, accent, rows: Number(rows), cols: Number(cols) }
    });
    res.status(201).json(collection);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar coleção' });
  }
});

// Buscar TODAS as coleções de um usuário (com as cartas incluídas!)
app.get('/users/:userId/collections', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const collections = await prisma.collection.findMany({
      where: { userId },
      include: {
        cards: {
          orderBy: { position: 'asc' } // Já traz ordenado para o drag-and-drop!
        }
      }
    });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar coleções' });
  }
});

// ==========================================
// NOVAS ROTAS DE COLEÇÕES (UPDATE E DELETE)
// ==========================================

// Editar Coleção
app.put('/collections/:id', async (req, res): Promise<any> => {
  const { id } = req.params;
  const { name, description, icon, accent, rows, cols } = req.body;
  try {
    const updated = await prisma.collection.update({
      where: { id },
      data: { name, description, icon, accent, rows: Number(rows), cols: Number(cols) }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

// Deletar Coleção
app.delete('/collections/:id', async (req, res): Promise<any> => {
  const { id } = req.params;
  try {
    // O Prisma deleta as cartas em cascata automaticamente se você configurou o onDelete no schema!
    await prisma.collection.delete({ where: { id } });
    res.json({ message: 'Coleção deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar coleção' });
  }
});

// ==========================================
// ROTAS DE CARTAS (UPDATE, DELETE E ORDEM)
// ==========================================

// 1. PRIMEIRO: Rota de Reordenar (Tem que vir antes do :id!)
app.put('/cards/reorder', async (req, res): Promise<any> => {
  const { updates } = req.body; 
  try {
    await prisma.$transaction(
      updates.map((update: any) => 
        prisma.card.update({
          where: { id: update.id },
          data: { position: update.position }
        })
      )
    );
    res.json({ message: 'Ordem salva com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao reordenar cartas' });
  }
});

// 2. DEPOIS: Rota de Editar uma carta específica (Curinga :id)
app.put('/cards/:id', async (req, res): Promise<any> => {
  const { id } = req.params;
  const { name, frontImage } = req.body;
  try {
    const updated = await prisma.card.update({
      where: { id },
      data: { name, frontImage }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar carta' });
  }
});

// 3. Deletar Carta
app.delete('/cards/:id', async (req, res): Promise<any> => {
  const { id } = req.params;
  try {
    await prisma.card.delete({ where: { id } });
    res.json({ message: 'Carta deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar carta' });
  }
});

// ==========================================
// 3. ROTAS DE CARTAS
// ==========================================

// Adicionar carta numa coleção
app.post('/cards', async (req, res): Promise<any> => {
  const { collectionId, pokemonCardId, name, type, rarity, frontImage, cardBack, position } = req.body;
  try {
    const card = await prisma.card.create({
      data: { collectionId, pokemonCardId, name, type, rarity, frontImage, cardBack, position }
    });
    res.status(201).json(card);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao adicionar carta' });
  }
});

// ==========================================
// ROTA PROXY PARA TEXTURAS 3D (CORS FIX)
// ==========================================
app.get('/proxy-image', async (req, res): Promise<any> => {
  const imageUrl = req.query.url as string;
  
  if (!imageUrl) {
    return res.status(400).json({ error: 'URL da imagem não fornecida' });
  }

  try {
    // O Node.js não tem regras de CORS, então ele baixa a imagem sem problemas
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error('Falha ao buscar imagem original');
    }

    // Transforma a imagem num buffer binário
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Manda a imagem para o frontend com a permissão mágica para o WebGL
    res.set('Content-Type', response.headers.get('content-type') || 'image/png');
    res.set('Access-Control-Allow-Origin', '*'); // 🔥 A permissão que o 3D exige 🔥
    
    res.send(buffer);
  } catch (error) {
    console.error('Erro no proxy de imagem:', error);
    res.status(500).json({ error: 'Erro ao processar imagem proxy' });
  }
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});