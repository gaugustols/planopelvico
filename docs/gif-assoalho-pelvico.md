# GIF ilustrativo do assoalho pélvico

## Arquivos

- assets/images/assoalho-pelvico-base.png: imagem-base original em alta resolução.
- assets/images/assoalho-pelvico-pulsante.gif: animação otimizada de 720 × 720 px.
- assets/images/assoalho-pelvico-poster.jpg: imagem estática para uso alternativo e movimento reduzido.
- scripts/create-pelvic-gif.cjs: gerador reproduzível da animação.

A imagem-base foi gerada com image_gen integrado, sem CLI de geração de imagens.
A animação foi criada com Node.js, @napi-rs/canvas 1.1.0 e gifenc 1.0.3, em uma pasta
de ferramentas isolada e ignorada pelo Git. Nenhuma dependência foi adicionada à landing page.

## Animação e verificação

- 40 quadros com 80 ms por quadro: ciclo de 3,2 segundos, em repetição contínua.
- Paleta global de até 256 cores e difusão de erro na fotografia para reduzir faixas de cor.
- Somente a luminosidade do destaque pélvico varia; a anatomia e a forma muscular não se movem.
- A imagem é conceitual e não demonstra uma contração, exercício, diagnóstico ou efeito de tratamento.
- Os quadros foram decodificados para conferir o ciclo, o número de quadros e a estabilidade da imagem fora da região destacada.
- A animação não foi inserida no HTML; o layout e a copy atuais permanecem iguais.

Referências anatômicas consultadas para orientar o posicionamento do destaque:
[NIDDK — Kegel Exercises](https://www.niddk.nih.gov/health-information/urologic-diseases/kegel-exercises) e
[NICHD — About Pelvic Floor Disorders](https://www.nichd.nih.gov/health/topics/pelvicfloor/conditioninfo/Pages/default.aspx).

## Reproduzir

Instalar apenas as ferramentas isoladas:

    npm.cmd install --prefix .pelvic-gif.tmp --cache .pelvic-gif.tmp/npm-cache --no-audit --no-fund --ignore-scripts @napi-rs/canvas@1.1.0 gifenc@1.0.3
    node scripts/create-pelvic-gif.cjs

## Prompt da imagem-base

Use case: photorealistic-natural with a conceptual educational overlay.
Create a NEW square wellness image for the Plano Pélvico 7D project. The supplied picture is a STYLE REFERENCE ONLY: match its calm warm cream room, soft morning window light from the left, muted sage botanicals, natural editorial photography, comfortable woman, and understated thin mint-teal graphic overlay. Do NOT copy the reference woman's identity or neck-massage pose. Change the focus from the neck/lymphatic system to the PELVIC FLOOR.

Subject: a natural-looking Brazilian woman approximately 40–50 years old, comfortably seated upright on a pale upholstered chair, eyes gently closed, relaxed face, shoulders neutral. Wear a modest sage sleeveless top and opaque high-waisted muted sage leggings; fully clothed, not sexualized. Hands rest gently and naturally at the OUTER sides of her hips or upper thighs, never pressing the neck or abdomen. Show her from the top of her head through her knees so the lower pelvis is clearly visible, with the full head safely inside the square frame. Frontal or very slight three-quarter view, centered woman, relaxed grounded posture. Cream plaster wall, softly blurred plant, sunlight and subtle linen textures, tasteful and realistic.

Graphic: a delicate SEMITRANSPARENT CONCEPTUAL outline of the pelvic basin over the clothing, matching the woman's proportions. Highlight a small curved sling/bowl of pelvic-floor muscle at the LOWEST BASE of the pelvis, inside the ring of the pelvis, between the sit-bone region and beneath the pelvic organs. The pelvic floor is NOT the belly, abdominal muscles, waist, bladder itself, hips, groin skin or a network of lymph vessels. Use a thin mint-teal outline and a softly filled muted turquoise sling, without a bright glow yet. No anatomical gore, exposed skin in the pelvic region, genitals, organs, X-ray realism or invasive cutaway. The overlay should be symbolic, anatomically situated and understated. No exercise instructions and no arrows implying a massage technique.

Composition intended for a later subtle pulsing highlight: keep the conceptual pelvic-floor sling unobscured by the hands, visible in the lower-middle of the image, centered horizontally. All other parts of the image should be calm and stationary. Do not animate or draw motion blur.
No words, labels, numbers, logos, captions, prices, claims, before/after effect or watermarks. Do not imply visible contraction, treatment or guaranteed results. Produce one clean high-quality square image, natural texture and realistic hands.
