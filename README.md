# eBinder - Pokémon TCG Virtual Collection

> Estante virtual para organizar, gerenciar e visualizar suas coleções de Pokémon TCG.

O **eBinder** é um aplicativo web desenvolvido para colecionadores que desejam replicar a experiência tátil de um fichário físico, mas com as vantagens do mundo digital. Com uma interface moderna e integração direta com a base de dados global do Pokémon TCG, você pode montar suas coleções exatas, folhear páginas e analisar estatísticas detalhadas do seu acervo.

---

## ✨ Principais Funcionalidades

* 📖 **Experiência Realista de Fichário:** Folheie páginas virtuais (esquerda/direita) assim como em um fichário real.
* 📏 **Layouts Customizáveis:** Escolha como quer exibir suas cartas com opções de grade em 2x2, 3x3 ou 4x4.
* 🔍 **Busca e Integração Global:** Adicione qualquer carta já impressa na história utilizando o poderoso motor de busca integrado à [Pokémon TCG API](https://pokemontcg.io/). Filtre por Coleção, Tipo ou Raridade.
* 📊 **Estatísticas em Tempo Real:** Uma barra lateral inteligente que calcula automaticamente a quantidade de cartas, páginas, e a distribuição exata por Tipos de Energia e Raridade.
* 🎨 **Coleções Personalizadas:** Crie diferentes pastas, definindo nomes exclusivos e cores de lombada personalizadas para organizar sua estante.
* 🖱️ **Drag and Drop (Arrastar e Soltar):** Organize a posição de cada carta livremente pelas páginas do seu fichário.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React, TypeScript
* **Estilização:** CSS Modules (com foco em variáveis de tema e `color-mix` nativo para efeitos de vidro)
* **Backend / Banco de Dados:** Node.js, Prisma ORM (Gerenciamento de posições e coleções no banco)
* **API de Terceiros:** [Pokémon TCG API](https://docs.pokemontcg.io/) (Para dados, preços e imagens em alta resolução das cartas)

---
## 📸 Capturas de Tela

<table>
  <tr>
    <td valign="top" width="50%">
      <b>Página home</b><br>
      <img src="https://github.com/user-attachments/assets/95679f42-26da-4e7d-8169-8a6bea15894a" width="100%" alt="Estatísticas" />
    </td>
    <td valign="top" width="50%">
      <b>Primeira Página do Fichário</b><br>
      <img src="https://github.com/user-attachments/assets/fe22c0bc-b8ee-4d41-9cef-f8514b4c6b3c" width="100%" alt="Fichário Aberto" />
    </td>
  </tr>
  <tr>
    <td valign="top" width="50%">
      <b>Adicionando cartas ao fichário</b><br>
      <img src="https://github.com/user-attachments/assets/13c6defe-4c47-4e05-b707-65b3a8ee4710" width="100%" alt="Layout das páginas" />
    </td>
    <td valign="top" width="50%">
      <b>Fichário aberto</b><br>
      <img src="https://github.com/user-attachments/assets/ae85c657-9fcc-4ba9-bd4e-f7e9c26ba5ca" width="100%" alt="Estante Virtual" />
    </td>
  </tr>
  <tr>
    <td valign="top" width="50%">
      <b>Visualizador de Cartas 3D</b><br>
      <img src="https://github.com/user-attachments/assets/e42196de-088d-46de-b422-f1e57a754ac0" width="100%" alt="Modal de Adicionar Cartas" />
    </td>
    <td valign="top" width="50%">
      <b>Visualizador de Cartas 3D</b><br>
      <img src="https://github.com/user-attachments/assets/1d371aa7-b415-44fe-8c5c-34f68a8bf26a" width="100%" alt="Card Viewer" />
    </td>
  </tr>
</table>
