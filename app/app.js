"use strict";

(() => {
  const data = window.PELVICO_DATA;
  const main = document.getElementById("main");
  const storageKey = "planopelvico.member-preview.v1";
  const missing = data.missing;
  const navigation = [
    { route: "inicio", label: "Início", icon: "home" },
    { route: "guia", label: "Meu guia", icon: "book" },
    { route: "bonus", label: "Bônus", icon: "gift" },
    { route: "ajuda", label: "Ajuda", icon: "help" }
  ];
  const shapes = {
    home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
    book: '<path d="M12 5C9 2 5 2 2 4v15c4-2 7-2 10 0 3-2 6-2 10 0V4c-3-2-7-2-10 1ZM12 5v14"/>',
    gift: '<path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 8a2.7 2.7 0 0 1 5 1.5c0 2-2.5 2-2.5 4M12 17h.01"/>',
    arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>',
    download: '<path d="M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
    flower: '<path d="M12 19c-7 0-9-5-8-8 4-1 7 0 8 4 1-4 4-5 8-4 1 3-1 8-8 8ZM12 16c-4-4-4-9 0-13 4 4 4 9 0 13ZM12 19v3"/>',
    breath: '<path d="M8 4v7c-3-4-6-1-6 3 0 5 5 6 8 3V8M16 4v7c3-4 6-1 6 3 0 5-5 6-8 3V8M8 4l4 4 4-4"/>',
    drop: '<path d="M12 2C9 7 5 10 5 15a7 7 0 0 0 14 0c0-5-4-8-7-13ZM8 15a4 4 0 0 0 4 4"/>',
    leaf: '<path d="M21 3C10 1 1 7 5 15s16 1 16-12ZM4 21 17 8M9 16v-5M13 12h5"/>',
    heart: '<path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    chat: '<path d="M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-6 2 2-6a9 9 0 1 1 17-4ZM7 8h10M7 12h7"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    external: '<path d="M14 3h7v7M21 3 10 14M10 3H3v18h18v-7"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>'
  };
  const icon = name => '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + (shapes[name] || shapes.book) + "</svg>";
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  let storageAvailable = true;
  let toastTimer;
  let currentRoute = "";
  const blankState = () => ({ version: 1, read: [], favorites: [], last: null, welcomeSeen: false });
  let state = blankState();
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (stored && stored.version === 1) {
      const valid = value => Array.isArray(value) ? [...new Set(value.filter(id => Number.isInteger(id) && id >= 1 && id <= 6))] : [];
      state = { version: 1, read: valid(stored.read), favorites: valid(stored.favorites), last: Number.isInteger(stored.last) && stored.last >= 1 && stored.last <= 6 ? stored.last : null, welcomeSeen: stored.welcomeSeen === true };
    }
    const probe = storageKey + ".check";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
  } catch { storageAvailable = false; }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); return true; }
    catch {
      storageAvailable = false;
      toast("O navegador não permitiu salvar. Seus marcadores ficam nesta sessão.");
      return false;
    }
  }
  function toast(message) {
    const target = document.getElementById("toast");
    clearTimeout(toastTimer);
    target.textContent = message;
    target.classList.add("visible");
    toastTimer = setTimeout(() => target.classList.remove("visible"), 3500);
  }
  // Apenas caminhos locais ou HTTPS. Nenhum link vazio causa navegação para "#".
  function safeUrl(value) {
    const raw = String(value || "").trim();
    if (!raw || /[\u0000-\u0020\\]/.test(raw) || raw.startsWith("//") || /^[#?]/.test(raw)) return "";
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed.href : "";
      } catch { return ""; }
    }
    return raw;
  }
  function whatsappUrl() {
    const url = safeUrl(data.bonuses.whatsappUrl);
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && ["chat.whatsapp.com", "wa.me", "api.whatsapp.com"].includes(parsed.hostname) && !parsed.username && !parsed.password ? url : "";
    } catch { return ""; }
  }
  const tile = (name, tone = "") => '<span class="icon-tile ' + tone + '">' + icon(name) + "</span>";
  const arrow = () => icon("arrow");
  function intro(kicker, title, description, badge = "") {
    return '<div class="page-intro"><div><p class="eyebrow">' + esc(kicker) + '</p><h1>' + esc(title) + '</h1><p>' + esc(description) + '</p></div>' + (badge ? '<span class="date-chip">' + esc(badge) + "</span>" : "") + "</div>";
  }
  function previewNote() {
    return '<aside class="preview-note">' + icon("info") + '<p><strong>Você está na prévia do aplicativo.</strong> O conteúdo integral, os arquivos e os canais de acesso ainda serão adicionados. Os marcadores registram somente sua leitura neste aparelho.</p></aside>';
  }
  function missingBox(title, description) {
    return '<!-- TROCAR: ' + esc(title) + ' — preencher com o material real. --><div class="missing-box">' + icon("book") + '<h3>' + esc(title) + '</h3><span class="missing-label">' + esc(missing) + '</span><p>' + esc(description) + "</p></div>";
  }
  function progressPanel() {
    const count = state.read.length;
    return '<div class="progress-panel"><div class="progress-ring" aria-hidden="true"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26"/><circle cx="30" cy="30" r="26" style="stroke-dashoffset:' + (163.363 * (1 - count / 6)) + '"/></svg><span>' + count + '/6</span></div><div class="progress-copy"><h3>Seu percurso de leitura</h3><p>' + count + ' de 6 apresentações marcadas como lidas.</p><div class="phase-dots" aria-hidden="true">' + data.phases.map(p => '<span class="' + (state.read.includes(p.id) ? "read" : "") + '"></span>').join("") + '</div></div><a class="text-link" href="#guia">Ver meu guia ' + arrow() + "</a></div>";
  }
  function phaseCard(phase) {
    const read = state.read.includes(phase.id);
    return '<a class="phase-card" href="#fase/' + phase.id + '"><div class="phase-top">' + tile(phase.icon, phase.id % 3 === 2 ? "blue" : phase.id % 3 === 0 ? "gold" : "") + '<span class="phase-number">0' + phase.id + '</span></div><p class="card-eyebrow">FASE ' + phase.id + '</p><h3>' + esc(phase.title) + '</h3><p>' + esc(phase.short) + '</p><div class="card-bottom"><span class="status-label">' + (read ? icon("check") + "Apresentação lida" : "Conhecer esta fase") + "</span>" + arrow() + "</div></a>";
  }
  function phaseGrid(phases = data.phases) { return '<div class="phase-grid">' + phases.map(phaseCard).join("") + "</div>"; }
  function quickCard(route, name, title, description, tone = "") {
    return '<a class="quick-card" href="#' + route + '">' + tile(name, tone) + '<div><h3>' + esc(title) + '</h3><p>' + esc(description) + "</p></div></a>";
  }
  function home() {
    const phase = data.phases.find(p => p.id === state.last);
    return intro("SEU ESPAÇO DE CUIDADO", "Bem-vinda ao Plano Pélvico 7D.", "Seu guia está organizado em seis fases para você conhecer os cuidados com o assoalho pélvico e acompanhar cada orientação com clareza, no conforto de casa.", "UM GUIA · SEIS FASES") +
      '<section class="home-hero" aria-labelledby="start-title"><div class="home-hero-copy"><p class="eyebrow">COMECE POR AQUI</p><h2 id="start-title">Um caminho claro.<br>Um passo de cada vez.</h2><p>Conheça a organização do seu guia e encontre cada fase, seus materiais e os dois bônus em um só lugar.</p><a class="button" href="#' + (phase ? "fase/" + phase.id : "comece") + '">' + (phase ? "Continuar de onde parei" : "Começar meu guia") + arrow() + '</a></div><div class="home-hero-art"><!-- TROCAR: imagem de apresentação em data.js, campo cover. Mockup ilustrativo. --><img src="' + esc(data.cover) + '" alt="Apresentação ilustrativa do guia Plano Pélvico 7D em seis fases" width="1254" height="1254"></div></section>' +
      progressPanel() +
      '<section aria-labelledby="home-guide"><div class="section-title"><h2 id="home-guide">Meu guia em seis fases</h2><a class="text-link" href="#guia">Explorar o guia ' + arrow() + "</a></div>" + phaseGrid() + "</section>" +
      '<section aria-labelledby="home-extras"><div class="section-title"><h2 id="home-extras">Tudo no seu lugar</h2><p>Para acompanhar seu guia.</p></div><div class="quick-grid">' +
      quickCard("bonus", "gift", "Seus dois bônus", "O Guia com Verdades e Mentiras e o acesso ao grupo exclusivo.") +
      quickCard("downloads", "download", "Materiais para baixar", "Encontre os arquivos do guia e do material complementar.", "blue") +
      quickCard("ajuda", "help", "Precisa de ajuda?", "Orientações sobre acesso, materiais e suporte.", "gold") +
      "</div></section>" + previewNote();
  }
  function guide() {
    return intro("MEU GUIA", "As seis fases, em uma sequência.", "Explore os temas do Plano Pélvico 7D. Você pode voltar a cada fase sempre que precisar.", "6 FASES") +
      progressPanel() + phaseGrid() +
      '<div class="section-title"><h2>Seu guia completo</h2><a class="text-link" href="#favoritos">' + icon("bookmark") + "Meus favoritos</a></div>" +
      materialCard("guide") + '<p class="quiet-warning">Não há um calendário diário definido no material disponível. A ordem acima acompanha a estrutura anunciada do guia.</p>' + previewNote();
  }
  function back(route, label) { return '<a class="back-link" href="#' + route + '">' + arrow() + esc(label) + "</a>"; }
  function contentBlocks(blocks) {
    return blocks.map(block => (block.title ? "<h3>" + esc(block.title) + "</h3>" : "") + (Array.isArray(block.paragraphs) ? block.paragraphs.map(p => "<p>" + esc(p) + "</p>").join("") : "")).join("");
  }
  function phaseDetail(phase) {
    const read = state.read.includes(phase.id);
    const favorite = state.favorites.includes(phase.id);
    const hasContent = Array.isArray(phase.content) && phase.content.length > 0;
    const mini = data.phases.map(p => '<a class="mini-phase" href="#fase/' + p.id + '"' + (p.id === phase.id ? ' aria-current="page"' : "") + '><span>' + (state.read.includes(p.id) ? icon("check") : p.id) + '</span>' + esc(p.title) + "</a>").join("");
    return back("guia", "Voltar ao meu guia") + '<div class="detail-layout"><div class="detail-main"><header class="phase-banner">' + tile(phase.icon) + '<p class="eyebrow">FASE 0' + phase.id + ' DE 06</p><h1>' + esc(phase.title) + '</h1><p>' + esc(phase.description) + '</p></header><div class="reading-tools"><p>Apresentação da fase ' + phase.id + '</p><button class="bookmark-button" type="button" data-favorite="' + phase.id + '" aria-pressed="' + favorite + '">' + icon("bookmark") + (favorite ? "Salvo nos favoritos" : "Salvar fase") + '</button></div><article class="reading-card"><h2>O que você encontra nesta fase</h2><p>' + esc(phase.description) + "</p>" +
      (hasContent ? contentBlocks(phase.content) : missingBox("Conteúdo integral da fase " + phase.id, "O material completo desta fase ainda não foi disponibilizado. Exercícios específicos, séries, duração, frequência e progressão dependem do entregável real.")) +
      '<div class="completion"><p>Este marcador registra apenas a leitura da apresentação. Não representa a realização de exercícios nem um resultado de saúde.</p><button class="button ' + (read ? "is-set" : "secondary") + '" type="button" data-read="' + phase.id + '" aria-pressed="' + read + '">' + icon("check") + (read ? "Apresentação lida" : "Marcar apresentação como lida") + '</button></div></article><nav class="phase-pagination" aria-label="Navegação entre fases">' +
      (phase.id > 1 ? '<a href="#fase/' + (phase.id - 1) + '"><span>← FASE ANTERIOR</span><strong>' + esc(data.phases[phase.id - 2].title) + "</strong></a>" : '<a href="#guia"><span>← MEU GUIA</span><strong>Ver as seis fases</strong></a>') +
      (phase.id < 6 ? '<a href="#fase/' + (phase.id + 1) + '"><span>PRÓXIMA FASE →</span><strong>' + esc(data.phases[phase.id].title) + "</strong></a>" : '<a href="#bonus"><span>SEUS EXTRAS →</span><strong>Conhecer os dois bônus</strong></a>') +
      '</nav><div class="section-title"><h2>Material do guia</h2></div>' + materialCard("guide") + '</div><aside class="aside-panel"><h2>SEU GUIA EM SEIS FASES</h2><nav class="mini-phase-list" aria-label="Todas as fases">' + mini + '</nav><p class="aside-tip">Seu percurso é de leitura. Os marcadores ficam salvos neste aparelho, quando permitido pelo navegador.</p><a class="text-link" href="#comece">Como usar este espaço ' + arrow() + "</a></aside></div>" + previewNote();
  }
  function materialCard(key) {
    const material = data.materials[key];
    const url = safeUrl(material.url);
    const meta = [material.format, material.size].filter(Boolean).map(esc).join(" · ");
    // COLAR LINK REAL AQUI: data.js > materials.[guide|truths].url.
    // Botão desativado, sem href fictício, até existir um destino válido.
    const button = url ? '<a class="button" href="' + esc(url) + '" download' + (material.filename ? '="' + esc(material.filename) + '"' : "") + (/^https:/i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : "") + ' data-arquivo="' + key + '">' + icon("download") + "Baixar material</a>" :
      '<!-- COLAR LINK REAL AQUI: materials.' + key + '.url em data.js --><button class="button" type="button" disabled data-arquivo="' + key + '" aria-describedby="missing-' + key + '">' + icon("download") + "Arquivo não disponibilizado</button>";
    return '<div class="material-card">' + tile("download", key === "truths" ? "blue" : "") + '<div class="material-content"><p class="card-eyebrow">' + esc(material.section) + '</p><h3>' + esc(material.title) + '</h3><p>' + esc(material.description) + '</p>' + (url ? '<span class="card-eyebrow">' + (meta || "MATERIAL PARA CONSULTA") + "</span>" : '<span class="missing-label" id="missing-' + key + '">Arquivo e formato: ' + esc(missing) + "</span>") + "</div>" + button + "</div>";
  }
  function bonuses() {
    return intro("PARA ACOMPANHAR O SEU GUIA", "Seus dois bônus.", "Conteúdos e acesso complementar, reunidos no mesmo lugar.", "2 BÔNUS") +
      '<div class="bonus-grid"><article class="bonus-card"><div class="bonus-cover" aria-hidden="true"><span class="cover-icon">' + icon("book") + '</span></div><div class="bonus-body"><p class="card-eyebrow">BÔNUS 01 · MATERIAL COMPLEMENTAR</p><h2>Guia com Verdades e Mentiras sobre Incontinência Urinária</h2><p>Encontre aqui o material complementar anunciado na sua oferta.</p><a class="button secondary" href="#bonus/verdades-e-mentiras">Conhecer o material ' + arrow() + '</a></div></article><article class="bonus-card"><div class="bonus-cover chat-cover" aria-hidden="true"><span class="cover-icon">' + icon("chat") + '</span></div><div class="bonus-body"><p class="card-eyebrow">BÔNUS 02 · ACESSO EXTERNO</p><h2>Grupo exclusivo no WhatsApp</h2><p>Dicas de saúde da mulher e suporte contínuo, conforme anunciado na oferta.</p><a class="button secondary" href="#bonus/whatsapp">Ver acesso ao grupo ' + arrow() + "</a></div></article></div>" + previewNote();
  }
  function truths() {
    const blocks = data.bonuses.truthsContent;
    return back("bonus", "Voltar aos bônus") +
      intro("BÔNUS 01", data.materials.truths.title, "Seu material complementar sobre incontinência urinária.") +
      '<div class="content-width"><article class="reading-card"><h2>Verdades e Mentiras</h2>' +
      (Array.isArray(blocks) && blocks.length ? contentBlocks(blocks) : missingBox("Conteúdo integral do guia bônus", "O texto completo deste material ainda não foi disponibilizado. As informações serão incluídas a partir do arquivo real.")) +
      '</article><div class="section-title"><h2>Seu material para baixar</h2></div>' + materialCard("truths") + "</div>" + previewNote();
  }
  function whatsapp() {
    const url = whatsappUrl();
    return back("bonus", "Voltar aos bônus") + intro("BÔNUS 02", "Grupo exclusivo no WhatsApp", "Dicas de saúde da mulher e suporte contínuo, conforme anunciado na oferta.") +
      '<div class="content-width"><article class="reading-card"><h2>Um acesso para acompanhar seu guia</h2><p>O grupo é um espaço externo no WhatsApp. Ele não é um chat dentro deste aplicativo.</p>' +
      (url ? '<div class="start-actions"><a class="button" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + icon("external") + "Acessar grupo no WhatsApp</a></div>" : missingBox("Link de acesso ao grupo", "O convite do grupo ainda não foi disponibilizado.") + '<div class="start-actions"><!-- COLAR LINK REAL AQUI: bonuses.whatsappUrl em data.js --><button class="button" type="button" disabled>' + icon("chat") + "Link do grupo não disponibilizado</button></div>") +
      '<h3>Funcionamento do suporte</h3><p>Responsáveis, regras, horários e duração operacional: <span class="missing-label">' + esc(missing) + '</span></p><p>O bônus não confirma consulta clínica nem atendimento individual.</p></article></div>' + previewNote();
  }
  function downloads() {
    return back("inicio", "Voltar ao início") + intro("SEUS MATERIAIS", "Para baixar e consultar.", "Os materiais do guia e do bônus, organizados por seção.") +
      '<div class="material-list">' + materialCard("guide") + materialCard("truths") + '</div><p class="quiet-warning">Arquivos separados por fase: <span class="missing-label">' + esc(missing) + "</span>As imagens de apresentação são ilustrativas e não são entregáveis educativos. O grupo no WhatsApp tem acesso pela seção Bônus.</p>" + previewNote();
  }
  function start() {
    return back("inicio", "Voltar ao início") + intro("COMECE POR AQUI", "Seu guia, sem complicação.", "Conheça a organização do seu espaço e encontre o que precisa com clareza.") +
      '<div class="content-width"><article class="reading-card"><h2>Um passo de cada vez.</h2><ol class="start-steps"><li><div><h3>Conheça as seis fases</h3><p>Comece por Meu guia. Cada card apresenta um tema, na ordem anunciada do Plano Pélvico 7D.</p></div></li><li><div><h3>Continue de onde parou</h3><p>A última fase aberta pode ser retomada pela tela inicial. Marque as apresentações como lidas e salve as fases que quiser consultar novamente.</p></div></li><li><div><h3>Encontre seus materiais e bônus</h3><p>Use Materiais para baixar para consultar os arquivos, e Bônus para acessar o material complementar e o grupo no WhatsApp, quando disponibilizados.</p></div></li></ol><div class="start-actions"><a class="button" href="#fase/1">Conhecer a primeira fase ' + arrow() + '</a><a class="button secondary" href="#guia">Ver as seis fases</a></div></article>' +
      '<div class="info-card" style="margin-top:22px"><h2>Sobre o conteúdo</h2><p>O conteúdo é educativo e não substitui avaliação ou orientação individual de um profissional de saúde. As experiências e os resultados podem variar.</p><h3>Calendário e orientações específicas</h3><p>Significado de “7D”, cronograma, duração, frequência das práticas e critérios de indicação:</p><span class="missing-label">' + esc(missing) + '</span><p class="quiet-warning">Não há um calendário de sete dias definido no material disponível.</p></div></div>' + previewNote();
  }
  function favorites() {
    const phases = data.phases.filter(p => state.favorites.includes(p.id));
    return back("inicio", "Voltar ao início") + intro("PARA CONSULTAR NOVAMENTE", "Seus favoritos.", "As fases que você salvou ficam reunidas aqui, neste aparelho.") +
      (phases.length ? phaseGrid(phases) : '<div class="empty-state">' + tile("bookmark") + '<h2>Guarde o que quer revisitar.</h2><p>Abra uma fase e toque em “Salvar fase”. Ela aparecerá aqui para você encontrar com facilidade.</p><a class="button secondary" href="#guia">Explorar meu guia ' + arrow() + "</a></div>");
  }
  function help() {
    const email = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.support.email) ? data.support.email : "";
    const support = email ? '<a class="text-link" href="mailto:' + esc(email) + '">' + esc(email) + "</a>" : '<!-- TROCAR: support.email em data.js --><span class="missing-label">' + esc(missing) + "</span>";
    const faq = [
      ["Por onde eu começo?", '<p>Abra <a class="text-link" href="#comece">Comece por aqui</a> e depois conheça as seis fases em Meu guia.</p>'],
      ["Por que alguns materiais ainda não podem ser baixados?", "<p>Esta é uma prévia. Os arquivos do guia e do bônus ainda não foram disponibilizados. Quando forem adicionados, os botões correspondentes permitirão baixar ou abrir o material.</p>"],
      ["O que os marcadores de leitura significam?", "<p>Indicam apenas quais apresentações você marcou como lidas. Não significam que exercícios foram realizados nem representam melhora clínica.</p>"],
      ["Meu progresso aparece em outro aparelho?", "<p>Nesta prévia, a última fase, os favoritos e os marcadores ficam no navegador deste aparelho, quando o armazenamento está disponível. Não há sincronização entre dispositivos.</p>"],
      ["Como entro no grupo do WhatsApp?", '<p>Abra <a class="text-link" href="#bonus/whatsapp">Bônus → Grupo exclusivo no WhatsApp</a>. O convite ainda precisa ser disponibilizado.</p>'],
      ["Como funciona a garantia?", "<p>A oferta informa garantia incondicional de sete dias e solicitação de devolução por e-mail ao suporte. O canal operacional de suporte ainda precisa ser definido.</p>"],
      ["O material substitui uma avaliação profissional?", "<p>Não. O conteúdo é educativo e não substitui avaliação, diagnóstico ou acompanhamento de um profissional de saúde. Resultados individuais podem variar.</p>"],
      ["Como meus dados ficam salvos?", '<p>A prévia usa apenas armazenamento local para última fase, favoritos, marcadores de leitura e boas-vindas. Não há formulário de saúde, rastreamento ou envio desses marcadores a um servidor.</p><p>Apagar os dados do navegador também pode remover esses registros.</p><button class="button secondary" type="button" data-reset>Limpar meus marcadores deste aparelho</button>']
    ];
    return intro("AJUDA", "Vamos facilitar seu caminho.", "Orientações sobre seu espaço, os materiais e os próximos passos.") +
      '<div class="help-grid"><div class="help-list">' + faq.map(item => "<details><summary>" + item[0] + '</summary><div class="help-answer">' + item[1] + "</div></details>").join("") +
      '</div><div class="help-side"><section class="info-card"><h2>Fale com o suporte</h2><p>Canal de contato:</p>' + support + '<h3>Horários de atendimento</h3><p>' + (data.support.hours ? esc(data.support.hours) : '<!-- TROCAR: support.hours em data.js --><span class="missing-label">' + esc(missing) + "</span>") + '</p><a class="text-link" href="#bonus/whatsapp" style="margin-top:18px">Ver grupo no WhatsApp ' + arrow() +
      '</a></section><section class="info-card"><h2>Sua oferta</h2><dl><div><dt>Produto</dt><dd>Plano Pélvico 7D</dd></div><div><dt>Preço anunciado</dt><dd>R$ 29,90<br>ou 6x de R$ 4,98</dd></div><div><dt>Pagamento</dt><dd>Único, sem assinatura</dd></div><div><dt>Garantia</dt><dd>7 dias</dd></div><div><dt>Conteúdo</dt><dd>6 fases e 2 bônus</dd></div></dl><p class="quiet-warning">O mockup anuncia acesso vitalício para baixar e usar. As regras operacionais de acesso e atualizações ainda precisam ser definidas.</p></section><section class="info-card"><h2>Sobre esta prévia</h2><p>Autenticação, liberação de compra, autoria, responsável técnico e referências:</p><span class="missing-label">' + esc(missing) + "</span></section></div></div>" + previewNote();
  }
  function routeFromHash() { return window.location.hash.slice(1).replace(/\/+$/, "") || "inicio"; }
  function activeArea(route) {
    if (route === "guia" || route.startsWith("fase/")) return "guia";
    if (route.startsWith("bonus")) return "bonus";
    if (route === "ajuda") return "ajuda";
    return "inicio";
  }
  function render(focus = true) {
    currentRoute = routeFromHash();
    const route = currentRoute;
    let page;
    let title;
    const phaseMatch = /^fase\/([1-6])$/.exec(route);
    if (phaseMatch) {
      const phase = data.phases[Number(phaseMatch[1]) - 1];
      if (state.last !== phase.id) { state.last = phase.id; save(); }
      title = phase.title; page = phaseDetail(phase);
    } else {
      const screens = {
        inicio: ["Início", home], guia: ["Meu guia", guide], bonus: ["Bônus", bonuses],
        "bonus/verdades-e-mentiras": ["Guia bônus", truths], "bonus/whatsapp": ["Grupo no WhatsApp", whatsapp],
        ajuda: ["Ajuda", help], comece: ["Comece por aqui", start], downloads: ["Materiais para baixar", downloads],
        favoritos: ["Favoritos", favorites]
      };
      if (Object.hasOwn(screens, route)) { title = screens[route][0]; page = screens[route][1](); }
      else { title = "Página não encontrada"; page = intro("MEU ESPAÇO", "Vamos voltar ao seu guia?", "Essa tela não foi encontrada.") + '<a class="button" href="#inicio">Voltar ao início ' + arrow() + "</a>"; }
    }
    main.innerHTML = (!storageAvailable ? '<p class="storage-message" role="status">O navegador não permite salvar neste aparelho. Favoritos e marcadores ficam disponíveis apenas nesta sessão.</p>' : "") + page;
    document.title = title + " · Plano Pélvico 7D";
    document.getElementById("breadcrumb").innerHTML = '<a href="#inicio">Meu espaço</a> <span aria-hidden="true">/</span> ' + esc(title);
    document.querySelectorAll("[data-navigation]").forEach(nav => {
      nav.innerHTML = navigation.map(item => '<a class="nav-item" href="#' + item.route + '"' + (activeArea(route) === item.route ? ' aria-current="page"' : "") + ">" + icon(item.icon) + "<span>" + item.label + "</span></a>").join("");
    });
    if (focus) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
  }
  document.querySelector("[data-favorites-link]").innerHTML = icon("bookmark");
  document.addEventListener("click", event => {
    // O link de acessibilidade deve focar o conteúdo sem criar uma rota "#main".
    if (event.target.closest(".skip-link")) {
      event.preventDefault();
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
      return;
    }
    const read = event.target.closest("[data-read]");
    const favorite = event.target.closest("[data-favorite]");
    if (read) {
      const id = Number(read.dataset.read);
      const wasRead = state.read.includes(id);
      state.read = wasRead ? state.read.filter(item => item !== id) : [...state.read, id];
      save();
      render(false);
      main.querySelector("[data-read]").focus({ preventScroll: true });
      toast(wasRead ? "Marcador de leitura removido." : "Apresentação marcada como lida.");
    }
    if (favorite) {
      const id = Number(favorite.dataset.favorite);
      const wasFavorite = state.favorites.includes(id);
      state.favorites = wasFavorite ? state.favorites.filter(item => item !== id) : [...state.favorites, id];
      save();
      render(false);
      main.querySelector("[data-favorite]").focus({ preventScroll: true });
      toast(wasFavorite ? "Fase removida dos favoritos." : "Fase salva nos favoritos.");
    }
    if (event.target.closest("[data-reset]")) {
      if (window.confirm("Limpar os favoritos, os marcadores e a última fase deste aparelho?")) {
        state = blankState(); state.welcomeSeen = true; save(); render(false); toast("Seus marcadores foram limpos.");
      }
    }
  });
  const welcome = document.getElementById("welcome-dialog");
  function closeWelcome() { welcome.close(); state.welcomeSeen = true; save(); }
  document.querySelectorAll("[data-close-welcome]").forEach(button => button.addEventListener("click", closeWelcome));
  welcome.addEventListener("cancel", () => { state.welcomeSeen = true; save(); });
  window.addEventListener("hashchange", () => render(true));
  render(false);
  if (!state.welcomeSeen && !window.location.hash && typeof welcome.showModal === "function") welcome.showModal();
})();
