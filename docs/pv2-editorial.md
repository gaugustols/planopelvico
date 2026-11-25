# PV2 — redesign Cinematic Editorial

Escopo: apenas a apresentação da variante /pv2, conforme o prompt enviado.
A página principal, o aplicativo e as configurações da Vercel foram preservados.

## Aplicação do estilo

- Fundo matte #181818, texto #EBDCC4, apoio #B6A596, acento #DC9F85,
  bordas #66473B e detalhes #35211A.
- Clash Grotesk 700 e General Sans 400/500/600, em arquivos WOFF2 locais.
- Caixa alta por CSS e entrelinha .85 nos títulos; na hero móvel, 1.02 no
  destaque e 1.12 na continuação, conforme ajuste posterior de legibilidade.
- Nos demais títulos móveis, h2 usa clamp(2rem, 8.5vw, 3rem) com entrelinha 1.1;
  h3 usa clamp(1.25rem, 5.6vw, 1.5rem) com entrelinha 1.15, letras e palavras
  mais espaçadas. As exceções da oferta e da demonstração seguem a mesma escala.
- Destaque principal em 11.5vw no desktop e clamp(2.5rem, 13vw, 3.5rem) no celular. A continuação
  da headline usa uma escala menor para acomodar a copy longa sem alterá-la.
- Contorno de 1px deslocado 4px atrás do título, com alternativa textual vazia.
- Textura SVG fractal fixa, não interativa, com opacidade .03.
- Grade de 12 colunas na hero e na oferta; componentes com bordas de 1px
  e cantos de no máximo 4px. Sem gradientes ou sombras.
- Selo circular decorativo de 64px com a garantia de 30 dias já existente.
  Rotação de 12 segundos, desativada com preferência por movimento reduzido.

## Adaptações para preservar a oferta

O conteúdo de exemplo “INVITE ONLY”, “WAITING LIST”, “Batch 003” e o formulário
de captura de e-mail não foram acrescentados. A grade inferior usa a oferta
e o CTA existentes. O selo decorativo repete somente a garantia vigente.

O texto integral continua no HTML. O teste de copy permite apenas essa
repetição decorativa, que é aria-hidden, e ignora mudanças de marcação.
O script pv2.js foi mantido byte a byte. Checklist, calculadora, navegação,
acordeões, preço, garantia e checkout desativado mantêm os contratos anteriores.

## Verificação

    node --check pv2/pv2.js
    node scripts/verify-pv2.cjs
    node scripts/verify-site.cjs
    git diff --check

As fixtures da PV2 foram capturadas da versão anterior ao redesign.

Conferência visual em 320, 390, 768, 1024 e 1440 pixels: sem rolagem horizontal
e sem componentes ultrapassando a tela. O checklist revelou a continuação com
três itens marcados; a calculadora retornou R$ 4.320,00 para R$ 60 por seis anos;
o FAQ expandiu corretamente. O CTA levou à oferta, e a barra móvel ficou
oculta durante a oferta, com botão de checkout de 52px e estado desativado.
Ruído .03 e rotação de 12s foram conferidos nos estilos calculados.
