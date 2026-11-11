# Aplicativo do Plano Pélvico 7D

SPA estática em HTML, CSS e JavaScript. A página de vendas na raiz foi preservada.

## Abrir

- Na publicação atual: /app/.
- Offline: abra app/index.html no navegador, mantendo a pasta assets/ na pasta superior.
- Não há build, CDN, instalação de dependências, serviço externo ou servidor necessário para renderizar.
- A versão hospedada precisa de rede no primeiro carregamento. Não há service worker nem promessa de instalação PWA.

## Estrutura

- index.html: estrutura, marca, navegação e boas-vindas.
- styles.css: identidade visual, layout responsivo, foco e movimento reduzido.
- data.js: conteúdo editável, arquivos e links pendentes.
- app.js: telas, navegação por hash, favoritos, retomada e marcadores locais.
- ../assets/fonts/: fontes Inter e DM Serif Display, com licenças existentes.
- ../assets/images/: favicon e mockup ilustrativo existente.

## O que preencher antes da entrega para compradoras

Em data.js, os comentários TROCAR e COLAR LINK REAL AQUI marcam os pontos.

1. phases[n].content: conteúdo integral real de cada fase.
   Formato suportado:

       content: [
         {
           title: "Título real recebido",
           paragraphs: ["Primeiro parágrafo real.", "Outro parágrafo real."]
         }
       ]

   Os textos são escapados e exibidos como texto, sem executar HTML.
   Se o produto exigir vídeo, áudio ou atividades, esses formatos e conteúdos
   ainda precisam ser fornecidos e implementados. Nenhum foi inventado.

2. materials.guide: url, filename, format, size do guia completo.
3. materials.truths: os mesmos campos do guia bônus.
4. bonuses.truthsContent: texto integral do bônus, se houver leitura dentro do app.
5. bonuses.whatsappUrl: convite HTTPS real do WhatsApp.
6. support.email e support.hours: contato e horário reais.
7. Confirmar significado de “7D”, cronograma, autoria, responsável técnico,
   referências, regras de acesso vitalício e atualizações. Os locais correspondentes
   nas telas Comece por aqui, Ajuda e Bônus apresentam as lacunas explicitamente.
8. Definir autenticação e liberação de compra. Não existe login ou proteção por
   pagamento nesta prévia estática; noindex não restringe acesso.

Não é necessário trocar imagens para o app renderizar: marca, ícones, fontes e
mockup já estão locais. A imagem é ilustrativa e pode ser trocada em cover.

## Downloads

Sem URL válida, o botão fica desativado e mostra o material ausente.
Ao fornecer uma URL HTTPS ou caminho relativo válido, o botão é habilitado.
Exemplo de caminho local: ./materiais/guia.pdf (o arquivo deve existir).

O navegador pode abrir um PDF em vez de salvar diretamente, sobretudo em links
externos. O atributo download é uma indicação; o servidor de origem também define
o comportamento. Offline, somente arquivos incluídos localmente estarão disponíveis.

Não incluir arquivos comerciais privados nesta publicação pública sem antes
implementar controle de acesso no servidor ou na plataforma de membros escolhida.
Credenciais e segredos não pertencem ao JavaScript do navegador.

## Leitura, favoritos e privacidade

O armazenamento local guarda somente IDs de fases lidas/salvas, última fase e
exibição das boas-vindas, na chave planopelvico.member-preview.v1.
Não há dados clínicos, cadastro, rastreamento ou sincronização entre dispositivos.
O progresso significa leitura das apresentações, sem avaliar saúde ou exercícios.
Se o navegador bloquear armazenamento, o app continua funcionando na sessão e avisa.
É possível limpar os marcadores pela seção Ajuda, com confirmação.

## Verificação

Na raiz do projeto:

    node --check app/data.js
    node --check app/app.js
    node scripts/verify-member-app.cjs
    node scripts/verify-site.cjs
    git diff --check

O teste do app cobre rotas, conteúdo ausente, botões sem arquivo, configuração de
download, URLs rejeitadas, escape de conteúdo, persistência e armazenamento bloqueado.
O teste da página de vendas verifica a integridade da copy e da oferta existentes.

Conferência no navegador: larguras de 320, 390, 768 e 1440 pixels sem rolagem
horizontal nem imagens quebradas; navegação das seis fases e dos dois bônus;
marcar leitura, salvar favorito, recarregar e recuperar os marcadores; FAQ expansível.
A abertura literal por file:// não pôde ser testada no navegador integrado:
a política desse navegador permite apenas HTTP/HTTPS. O contrato de recursos locais
e a renderização sem servidor foram conferidos pelo teste automatizado.

## Publicação

A configuração estática existente da Vercel serve a nova pasta em /app/, sem
alterar a entrada da landing page e sem mudar vercel.json.
Esta entrega pode ser publicada como prévia. A área de membros comercial depende
dos conteúdos e das decisões de acesso listados acima.
