"use strict";

// Edite este arquivo para preencher o conteúdo real. Não há busca em servidor:
// os scripts clássicos também funcionam ao abrir index.html por file://.
window.PELVICO_DATA = {
  name: "Plano Pélvico 7D",
  missing: "NÃO IDENTIFICADO — definir manualmente.",
  // TROCAR: imagem ilustrativa de apresentação. Não é um material do produto.
  cover: "../assets/images/plano-pelvico-bundle-v3.jpg",
  phases: [
    { id: 1, title: "Fortalecimento pélvico", icon: "flower", short: "Exercícios para o assoalho pélvico.", description: "Exercícios exclusivos para fortalecer o assoalho pélvico e recuperar o controle do xixi.", content: null },
    { id: 2, title: "Postura e respiração", icon: "breath", short: "Postura e respiração com o diafragma.", description: "Exercícios em casa para ajustar a postura e a respiração com o diafragma, reduzindo a pressão sobre a bexiga.", content: null },
    { id: 3, title: "Controle da bexiga", icon: "drop", short: "Treinamento de controle da bexiga.", description: "Treinamento de controle da bexiga para resistir mais tempo e não correr ao banheiro a todo instante.", content: null },
    { id: 4, title: "Alimentação estratégica", icon: "leaf", short: "Alimentação e cuidados pélvicos.", description: "Alimentação relacionada a peso, prisão de ventre e pressão sobre a bexiga.", content: null },
    { id: 5, title: "Saúde da bexiga e uretra", icon: "heart", short: "Alimentação e cuidados desta fase.", description: "Alimentação e cuidados descritos nessa fase.", content: null },
    { id: 6, title: "Hábitos do dia a dia", icon: "sun", short: "Cuidados que acompanham sua rotina.", description: "Técnicas práticas do dia a dia para reduzir a frequência urinária e recuperar o controle.", content: null }
  ],
  // TROCAR em CADA fase: content: null por uma lista de blocos reais:
  // content: [{ title: "Título real", paragraphs: ["Texto integral aprovado."] }]
  // Conteúdo integral, exercícios específicos, séries, duração, frequência,
  // progressão, vídeos, áudios e arquivos separados por fase:
  // NÃO IDENTIFICADO — definir manualmente. Não criar prescrições por suposição.
  materials: {
    guide: { title: "Guia principal do Plano Pélvico 7D", section: "Meu guia", description: "O guia completo, organizado em seis fases.", url: "", filename: "", format: "", size: "" },
    truths: { title: "Guia com Verdades e Mentiras sobre Incontinência Urinária", section: "Bônus", description: "Seu material complementar sobre incontinência urinária.", url: "", filename: "", format: "", size: "" }
  },
  // COLAR LINKS REAIS ACIMA: materials.guide.url e materials.truths.url.
  // Aceita https:// ou caminho local relativo a app/index.html.
  // TROCAR também filename, format e size quando os arquivos forem recebidos.
  // Não colocar arquivos privados nesta pasta pública antes de definir autenticação.
  bonuses: {
    // TROCAR: texto integral real do guia bônus, com o mesmo formato de blocos.
    truthsContent: null,
    // COLAR LINK REAL AQUI: URL HTTPS do grupo exclusivo no WhatsApp.
    whatsappUrl: ""
  },
  // TROCAR: contato operacional e horários. NÃO IDENTIFICADO — definir manualmente.
  support: { email: "", hours: "" }
};
