# Plano Pélvico 7D

Landing page estática e independente para o Plano Pélvico 7D.

- Repositório: https://github.com/gaugustols/planopelvico
- Publicação: https://planopelvico.vercel.app

## Estrutura e conteúdo

A composição segue as 15 seções da referência visual enviada, https://lymphura.com/,
adaptadas para a marca e a oferta Plano Pélvico 7D. Todos os 139 blocos da copy
aprovada foram preservados, reorganizados entre as seções. O preço permanece em
R$ 29,90 ou 6x de R$ 4,98, e a garantia permanece em 7 dias.

Foram acrescentados navegação, FAQ, informações de privacidade e responsabilidade,
rodapé, ícones e imagens ilustrativas próprias. Não foram copiados textos, marca,
fotos, vídeos, materiais ou scripts da referência. Não foram inventados novos
depoimentos, avaliações verificadas, credenciais, resultados ou meios de pagamento.

- `index.html`: conteúdo e estrutura das seções.
- `assets/css/styles.css`: estilos responsivos.
- `assets/js/main.js`: menu, barra de oferta, privacidade e checkout.
- `assets/images/`: imagens ilustrativas originais, ícones e favicon.
- `assets/fonts/`: fontes abertas locais e suas licenças.
- `tests/fixtures/approved-copy.json`: texto aprovado para verificação de integridade.
- `scripts/verify-site.cjs`: verificações estáticas de conteúdo e recursos.
- `docs/design-reference.md`: decisões de adaptação e prompts dos recursos visuais.

## Checkout

Os links de checkout ainda não foram definidos. Os botões de compra permanecem
desativados. Quando o destino for aprovado, preencher `CHECKOUT_URL` em
`assets/js/main.js` com uma URL HTTPS válida. Não há rastreamento publicitário,
formulários de cadastro nem chamadas para serviços de terceiros no navegador.

## Desenvolvimento e testes

Não há dependências para instalar nem etapa de build. O arquivo de entrada é
`index.html` na raiz. Abra o arquivo no navegador ou use um servidor HTTP estático
para testar fontes, ícones e imagens.

Com Node.js disponível:

    node --check assets/js/main.js
    node scripts/verify-site.cjs

A publicação mantém o vínculo GitHub/Vercel existente, com build desativado e saída
na raiz em `vercel.json`. Nenhuma configuração de outro projeto foi reutilizada.

Mantenha credenciais e variáveis de ambiente em arquivos locais ignorados pelo Git.
