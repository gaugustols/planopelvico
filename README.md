# Plano Pélvico 7D

Projeto independente para o desenvolvimento de uma landing page de infoproduto.

Repositório: https://github.com/gaugustols/planopelvico

## Estado atual

A copy fornecida foi incluída em sete seções, mantendo sua ordem e seu texto.
O preço da oferta e do CTA de compra foi atualizado conforme a orientação posterior:
R$ 29,90 ou 6x de R$ 4,98. Os demais valores da copy foram preservados.

A estrutura visual é simples e responsiva, aguardando as referências de design.
Nenhuma imagem foi adicionada. Os rótulos editoriais, as instruções de layout e
a microcopy opcional de garantia de 30 dias não são exibidos como conteúdo da página.
A garantia de 7 dias do corpo principal da copy foi mantida.

## Estrutura

- `index.html`: entrada da página na raiz, com toda a copy.
- `assets/css/styles.css`: estilos responsivos provisórios.
- `assets/js/main.js`: configuração e ativação dos botões de checkout.
- `vercel.json`: configuração de hospedagem estática, sem build, com saída na raiz.

## Checkout

Os links de checkout ainda não foram definidos. Os botões de compra, incluindo
o botão fixo no celular, permanecem desativados. Os links entre seções funcionam
sem JavaScript. Quando o checkout for definido, preencher `CHECKOUT_URL` em
`assets/js/main.js` com a URL HTTPS aprovada.

## Desenvolvimento e publicação

Não há dependências para instalar nem etapa de build. Abra `index.html` no navegador
para visualizar a página.

O repositório mantém a conexão existente com a Vercel. O envio para `main` permite
que a integração existente publique a atualização em https://planopelvico.vercel.app.
A configuração de publicação foi criada para este projeto.

Mantenha credenciais e variáveis de ambiente em arquivos locais ignorados pelo Git.
Se necessário, versione apenas um `.env.example` com valores fictícios.
Revise os arquivos preparados para commit antes de cada envio.
