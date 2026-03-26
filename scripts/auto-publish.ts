/**
 * auto-publish.ts
 * Script de publicação automática do The Daily Compute
 * Uso: cd /home/ubuntu/daily-compute && npx tsx scripts/auto-publish.ts
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import * as db from "../server/db";

// ─── Conteúdo da edição ────────────────────────────────────────────────────

const EDITION_NUMBER = 42;
const EDITION_DATE = "26 de março de 2026";
const EDITION_TITLE = `The Daily Compute #${EDITION_NUMBER} — ${EDITION_DATE}`;
const EDITION_SUBJECT = `The Daily Compute #${EDITION_NUMBER} — ${EDITION_DATE}: TurboQuant, Sora encerrado e o primeiro robotaxi europeu`;

const EDITION_CONTENT = `# The Daily Compute #${EDITION_NUMBER} — ${EDITION_DATE}

**Manchete:** Google revoluciona compressão de LLMs, OpenAI encerra Sora e o primeiro robotaxi europeu.

---

## O Sinal no Ruído

A corrida pela inteligência artificial entrou em uma fase de pragmatismo brutal. O encerramento abrupto do Sora pela OpenAI — um modelo que há poucos meses era aclamado como o futuro de Hollywood — demonstra que o custo computacional e a busca por lucratividade pré-IPO falam mais alto que o hype. Enquanto isso, o Google apresenta o TurboQuant, um algoritmo que reduz o uso de memória de modelos de linguagem em seis vezes sem perda de qualidade, atacando diretamente o calcanhar de aquiles da indústria: o gargalo de hardware.

Essa tensão entre ambição e realidade material se reflete em toda a cadeia. A Nvidia continua a financiar desafiantes como a Reflection AI, enquanto as gigantes de hardware Intel e AMD preparam aumentos de preços diante da demanda insaciável por infraestrutura. Até mesmo no campo da mobilidade, o lançamento do primeiro serviço comercial de robotaxi na Europa pela parceria Uber, Pony.ai e Verne mostra que a IA está finalmente cruzando a ponte do laboratório para as ruas. A era da experimentação irrestrita está dando lugar à era da eficiência operacional e do impacto tangível.

---

## Top 10 Histórias

### 1. Google lança TurboQuant: compressão de memória de LLMs em 6x

**Impacto:** O novo algoritmo do Google Research promete reduzir drasticamente o custo e a necessidade de hardware para inferência de modelos de linguagem, permitindo contextos muito maiores com o mesmo equipamento. A inovação pode democratizar o acesso a modelos avançados e viabilizar IA poderosa em dispositivos móveis.

A equipe de pesquisa do Google revelou o TurboQuant, um algoritmo de compressão projetado para reduzir a pegada de memória de grandes modelos de linguagem (LLMs) enquanto aumenta a velocidade de processamento e mantém a precisão. O sistema ataca especificamente o cache de chave-valor (key-value cache), comprimindo-o para apenas 3 bits por valor, em contraste com o padrão de 16 bits. Isso resulta em uma redução de seis vezes no uso de memória sem sacrificar a qualidade das saídas do modelo.

O processo utiliza uma técnica chamada PolarQuant, que converte vetores de coordenadas cartesianas padrão para coordenadas polares, focando apenas no raio e na direção. Uma camada de correção de erros de 1 bit (Quantized Johnson-Lindenstrauss) garante a precisão do escore de atenção. Testes preliminares em aceleradores Nvidia H100 mostraram um aumento de performance de oito vezes. A capacidade de aplicar o TurboQuant a modelos existentes, como Gemma e Mistral, sem necessidade de retreinamento, sinaliza uma adoção rápida que pode aliviar a pressão atual sobre a infraestrutura global de chips.

**Score Editorial:** 48/50 | **Fontes:** Ars Technica, Bloomberg, TechCrunch

---

### 2. OpenAI encerra o Sora e foca em produtos corporativos

**Impacto:** O fim precoce da ferramenta de geração de vídeo sinaliza uma mudança drástica na estratégia da OpenAI, que agora prioriza a rentabilidade e o desenvolvimento de agentes de software para empresas em preparação para seu IPO.

A OpenAI anunciou o encerramento do Sora, seu aclamado aplicativo de inteligência artificial para geração de vídeo a partir de texto, apenas seis meses após seu lançamento. A decisão inclui o desligamento da API que permitia a desenvolvedores e estúdios de Hollywood acessar o modelo. O movimento surpreendente cancela planos ambiciosos, incluindo uma parceria avaliada em US$ 1 bilhão com a Disney, e reflete a pressão interna para conter a queima acelerada de caixa de projetos experimentais.

A popularidade do aplicativo já vinha em declínio, caindo de 3,3 milhões de downloads globais em novembro de 2025 para apenas 1,1 milhão em fevereiro de 2026. Com a empresa mirando uma oferta pública inicial (IPO), a liderança sob Sam Altman optou por concentrar recursos no desenvolvimento de assistentes de IA unificados e ferramentas de codificação voltadas para o mercado corporativo, onde o retorno sobre o investimento é mais claro e imediato.

**Score Editorial:** 45/50 | **Fontes:** Wired, Fortune, Vice

---

### 3. Tensão geopolítica trava liderança da Manus após aquisição pela Meta

**Impacto:** A intervenção do governo chinês na venda de uma startup de IA de ponta para uma big tech americana ilustra como o talento e a tecnologia de inteligência artificial se tornaram ativos de segurança nacional inegociáveis.

As autoridades chinesas proibiram os co-fundadores da startup de inteligência artificial Manus de deixar o país, em meio a uma rigorosa revisão regulatória de sua aquisição de US$ 2 bilhões pela Meta Platforms. A Manus, que desenvolve agentes de IA de propósito geral capazes de operar como funcionários digitais, tornou-se o centro de uma disputa geopolítica sobre o controle de tecnologias emergentes críticas.

A transação, anunciada no final do ano passado, está sob escrutínio do Ministério do Comércio da China. A retenção do CEO e do cientista-chefe da empresa em território chinês demonstra a determinação de Pequim em manter seu melhor talento em IA dentro de suas fronteiras, ao mesmo tempo em que aperta o cerco sobre o setor de tecnologia para evitar que inovações de alto nível fortaleçam a infraestrutura americana.

**Score Editorial:** 45/50 | **Fontes:** The Washington Post, The Wall Street Journal, Channel News Asia

---

### 4. Uber, Pony.ai e Verne lançam primeiro robotaxi comercial na Europa

**Impacto:** A parceria trilateral estabelece o primeiro serviço comercial de veículos autônomos no continente europeu, criando um precedente regulatório e operacional para a expansão da mobilidade autônoma global.

A Uber Technologies, a empresa de condução autônoma Pony.ai e a startup croata Verne anunciaram uma parceria estratégica para lançar o primeiro serviço comercial de robotáxis da Europa, com operações iniciais em Zagreb, Croácia. O serviço combinará o sistema de direção autônoma de sétima geração da Pony.ai com a plataforma global da Uber e a infraestrutura operacional da Verne.

Os testes em vias públicas já começaram na capital croata utilizando veículos Arcfox Alpha T5 equipados com a tecnologia da Pony.ai. A Verne lidera o processo de obtenção de aprovações regulatórias europeias, visando garantir que a transição de testes para um serviço comercial pago ocorra de forma segura. As empresas planejam escalar a frota para milhares de veículos nos próximos anos, expandindo para outras cidades europeias.

**Score Editorial:** 43/50 | **Fontes:** Reuters, Uber Investor Relations, Bloomberg

---

### 5. Reflection AI busca valuation de US$ 25 bilhões com apoio da Nvidia

**Impacto:** A captação massiva indica que investidores continuam dispostos a apostar alto em startups de IA de fronteira, buscando alternativas para equilibrar o domínio de gigantes estabelecidas e conter o avanço chinês.

A Reflection AI, uma startup de inteligência artificial apoiada pela Nvidia, está em negociações avançadas para levantar US$ 2,5 bilhões em uma nova rodada de financiamento. A operação avaliaria a empresa em US$ 25 bilhões antes mesmo da injeção de capital, posicionando-a como um dos unicórnios mais valiosos do setor de tecnologia global.

A rodada reflete o apetite contínuo do mercado por empresas capazes de desenvolver modelos fundacionais competitivos. O apoio da Nvidia não apenas fornece credibilidade, mas também garante acesso crucial ao hardware necessário para treinar modelos em larga escala. A movimentação é vista por analistas como parte de um esforço mais amplo para financiar campeões americanos capazes de fazer frente ao rápido avanço das empresas chinesas de IA.

**Score Editorial:** 42/50 | **Fontes:** Reuters, The Wall Street Journal, TipRanks

---

### 6. Intel e AMD preparam aumento de preços de CPUs em meio à escassez

**Impacto:** O encarecimento de componentes básicos de processamento pressionará as margens de fabricantes de servidores e PCs, refletindo o desequilíbrio na cadeia de suprimentos causado pela corrida da IA.

As fabricantes de chips Intel e AMD comunicaram a seus clientes planos para aumentar os preços de suas linhas de unidades centrais de processamento (CPUs) em 10% a 15% em média. A decisão responde a uma escassez global de componentes que estendeu os prazos de entrega de pedidos de meras duas semanas para até seis meses em alguns casos.

A demanda explosiva por infraestrutura de inteligência artificial tem consumido a capacidade produtiva das fundições, criando um efeito cascata que agora atinge processadores de uso geral. Fabricantes de servidores projetam que a demanda por CPUs convencionais pode crescer quase 15% em 2026, enquanto a capacidade de produção da Intel permanece restrita. O aumento de custos deve ser repassado aos consumidores finais, encarecendo PCs e serviços de computação em nuvem.

**Score Editorial:** 42/50 | **Fontes:** Nikkei Asia, PCMag, Tom's Hardware

---

### 7. Amazon planeja retorno ao mercado de smartphones com "Project Transformer"

**Impacto:** A tentativa de reinserção da Amazon no mercado mobile, impulsionada pela inteligência artificial, pode alterar a dinâmica competitiva atual dominada por Apple e Samsung.

Mais de uma década após o fracasso comercial do Fire Phone, a Amazon está desenvolvendo secretamente um novo smartphone focado em inteligência artificial, internamente apelidado de "Project Transformer". O dispositivo seria construído em torno de uma versão avançada de seu assistente de voz, o "Alexa+", colocando compras orientadas por IA e serviços do ecossistema Amazon no centro da experiência do usuário.

O projeto estaria sendo liderado por veteranos da indústria de hardware, buscando capitalizar a atual transição tecnológica onde agentes de IA substituem interfaces tradicionais baseadas em aplicativos. Embora o mercado global de smartphones enfrente projeções de declínio em 2026 devido aos altos custos de componentes de memória, a Amazon aposta que a integração profunda de capacidades generativas pode criar uma nova categoria de dispositivos centrados em tarefas automatizadas.

**Score Editorial:** 40/50 | **Fontes:** Reuters, The Irish Times, MSN

---

### 8. Casa Branca pressiona por lei federal de IA para evitar fragmentação

**Impacto:** A busca por um padrão regulatório nacional nos EUA definirá as regras do jogo para o desenvolvimento global de IA, impactando como empresas treinam e implantam seus modelos.

A Casa Branca divulgou um novo documento intitulado "Recomendações Legislativas para um Quadro Político Nacional de IA", instando o Congresso a aprovar a primeira grande lei federal sobre inteligência artificial ainda este ano. O conselheiro científico Michael Kratsios afirmou que a administração busca uma legislação com apoio bipartidário para estabelecer padrões claros de segurança e proteção de direitos.

O movimento visa preemptivamente impedir a criação de uma "colcha de retalhos fragmentada" de leis estaduais, que o governo argumenta ser onerosa para a inovação. O framework propõe diretrizes unificadas para o desenvolvimento de IA, equilibrando a mitigação de riscos com o incentivo à liderança tecnológica americana, em um momento em que a Europa já avança com o seu AI Act.

**Score Editorial:** 40/50 | **Fontes:** Reuters, The White House, Akin Gump

---

### 9. Cidadãos indiciados por contrabando de chips de IA para a China

**Impacto:** O caso evidencia as falhas e os desafios na aplicação dos controles de exportação americanos, destacando o mercado negro altamente lucrativo de hardware crítico para IA.

O Departamento de Justiça dos Estados Unidos anunciou o indiciamento de três indivíduos — um cidadão chinês de Hong Kong e dois cidadãos americanos — por conspiração para cometer contrabando e violações de controle de exportação. O grupo é acusado de tentar vender milhões de dólares em chips de computador de inteligência artificial fabricados nos EUA para compradores na China, utilizando a Tailândia como rota de trânsito.

O esquema visava contornar as rigorosas restrições impostas pelo governo americano à exportação de semicondutores avançados, projetadas para limitar as capacidades militares e tecnológicas chinesas. O caso ressalta a complexidade de policiar cadeias de suprimentos globais e a disposição de atores estatais e privados em pagar prêmios substanciais para acessar a infraestrutura fundamental que impulsiona o desenvolvimento de modelos de linguagem de ponta.

**Score Editorial:** 40/50 | **Fontes:** Department of Justice, South China Morning Post, FBI

---

### 10. Moonshot AI avalia IPO em Hong Kong mirando valuation de US$ 18 bi

**Impacto:** A potencial abertura de capital da criadora do modelo Kimi testa o apetite de investidores públicos pela nova geração de campeões de IA chineses, desafiando as restrições geopolíticas.

A Moonshot AI, startup chinesa apoiada pelo Alibaba e desenvolvedora do popular modelo de linguagem Kimi, está nos estágios iniciais de consideração de uma oferta pública inicial (IPO) em Hong Kong. As discussões preliminares sugerem que a empresa busca uma avaliação de mercado em torno de US$ 18 bilhões, o que representaria um aumento de mais de quatro vezes em relação à sua avaliação de janeiro de 2026.

A empresa ganhou destaque global por sua eficiência em modelos de contexto longo e sua capacidade de oferecer inferência a custos significativamente mais baixos que seus concorrentes ocidentais. O movimento em direção ao mercado de capitais visa capturar o crescente fascínio dos investidores por ações de inteligência artificial e garantir o capital necessário para sustentar a intensa guerra de preços e o desenvolvimento de infraestrutura na Ásia.

**Score Editorial:** 39/50 | **Fontes:** Bloomberg, Seeking Alpha, TechInAsia

---

## Deep Dive: A Matemática por trás do TurboQuant

O anúncio do TurboQuant pelo Google Research não é apenas mais uma otimização de software; é uma reformulação matemática fundamental de como os modelos de inteligência artificial lidam com a memória durante a inferência. Para entender a magnitude dessa inovação, precisamos olhar para o gargalo estrutural dos Grandes Modelos de Linguagem (LLMs): o cache de chave-valor (KV cache).

Durante a geração de texto, os LLMs armazenam representações vetoriais de tokens anteriores no KV cache para evitar recálculos computacionalmente caros. À medida que o contexto aumenta — pense em analisar um livro inteiro ou uma base de código complexa —, esse cache incha exponencialmente. Tradicionalmente, esses vetores são armazenados usando coordenadas cartesianas de 16 bits. O TurboQuant ataca esse problema em duas frentes inovadoras.

A primeira frente é o PolarQuant. Em vez de armazenar dados como coordenadas espaciais padrão (X, Y, Z), o algoritmo converte os vetores para coordenadas polares. Em um sistema polar, a informação é reduzida a um raio (a magnitude ou força do dado) e um ângulo (a direção ou significado semântico). Essa "taquigrafia" matemática elimina etapas custosas de normalização de dados e comprime a informação de forma altamente eficiente.

No entanto, a compressão extrema gera erros residuais que degradariam a qualidade da resposta da IA. É aqui que entra a segunda inovação: a técnica Quantized Johnson-Lindenstrauss (QJL). O QJL atua como uma camada de correção de erros de apenas 1 bit. Ele preserva as relações essenciais entre os vetores — a base do mecanismo de "atenção" que permite à rede neural decidir qual informação é relevante — reduzindo cada vetor a um simples valor de +1 ou -1.

O resultado final é um cache comprimido para apenas 3 bits por valor, uma redução de seis vezes no uso de memória em comparação com o padrão da indústria. Em hardware de ponta como o Nvidia H100, isso se traduz em cálculos de escore de atenção oito vezes mais rápidos. O aspecto mais crucial é que essa eficiência é alcançada sem necessidade de retreinar o modelo, permitindo que a tecnologia seja aplicada retroativamente a modelos de código aberto existentes. Na prática, o TurboQuant significa que o mesmo servidor que hoje sofre para processar um documento longo poderá, amanhã, lidar com seis documentos simultaneamente, mudando radicalmente a economia da IA em nuvem e abrindo portas para modelos robustos rodando localmente em smartphones.

---

## Radar de Mercado

**1. Infraestrutura em Alta:** As gigantes de tecnologia (Magnificent Seven) comprometeram impressionantes US$ 650 bilhões para gastos de capital em infraestrutura de IA em 2026, um aumento de 71% ano a ano, consolidando a tese de que a construção da infraestrutura básica ainda é a aposta mais segura do setor.

**2. Eficiência Energética no Edge:** A IBM Research revelou um avanço em chips analógicos de IA inspirados no cérebro humano, capazes de processar tarefas complexas de deep learning consumindo 70% menos energia, uma tecnologia promissora para dispositivos móveis e sensores de internet das coisas.

**3. M&A em Software:** A proliferação de ferramentas de IA está alterando a dinâmica de contratos de software corporativo, com empresas exigindo compromissos mais curtos e flexíveis para evitar aprisionamento tecnológico (vendor lock-in) em um mercado onde as capacidades mudam a cada poucos meses.
`;

// ─── Função principal de publicação ────────────────────────────────────────

async function publishEdition() {
  console.log(`\n📰 The Daily Compute — Auto-Publish Script`);
  console.log(`📅 Edição: #${EDITION_NUMBER} — ${EDITION_DATE}`);
  console.log(`─────────────────────────────────────────────`);

  // Verificar DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL não configurada. Publicação no banco de dados não disponível.");
    console.log("\n📄 Conteúdo da edição gerado com sucesso:");
    console.log(`   Título: ${EDITION_TITLE}`);
    console.log(`   Assunto: ${EDITION_SUBJECT}`);
    console.log(`   Caracteres: ${EDITION_CONTENT.length}`);
    console.log("\n✅ Script executado. Edição pronta para publicação manual.");
    
    // Salvar o conteúdo em arquivo para referência
    const outputPath = path.join(process.cwd(), "scripts", "last-edition.md");
    fs.writeFileSync(outputPath, EDITION_CONTENT, "utf-8");
    console.log(`\n💾 Edição salva em: ${outputPath}`);
    return;
  }

  try {
    console.log("🔌 Conectando ao banco de dados...");
    
    // Criar newsletter no banco de dados
    const newsletter = await db.createNewsletter({
      title: EDITION_TITLE,
      subject: EDITION_SUBJECT,
      content: EDITION_CONTENT,
      status: "sent",
      sentAt: new Date(),
      createdBy: 1, // Admin user ID
    });

    console.log(`✅ Newsletter criada com sucesso!`);
    console.log(`   ID: ${newsletter?.insertId || "N/A"}`);
    console.log(`   Título: ${EDITION_TITLE}`);
    console.log(`   Status: sent`);
    console.log(`   Data: ${new Date().toISOString()}`);
    
    // Salvar o conteúdo em arquivo para referência
    const outputPath = path.join(process.cwd(), "scripts", "last-edition.md");
    fs.writeFileSync(outputPath, EDITION_CONTENT, "utf-8");
    console.log(`\n💾 Edição salva em: ${outputPath}`);
    
    console.log("\n🎉 Publicação concluída com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro ao publicar no banco de dados:", error);
    
    // Fallback: salvar em arquivo
    const outputPath = path.join(process.cwd(), "scripts", "last-edition.md");
    fs.writeFileSync(outputPath, EDITION_CONTENT, "utf-8");
    console.log(`\n💾 Fallback: Edição salva em arquivo: ${outputPath}`);
    console.log("⚠️  Publicação no banco falhou, mas o conteúdo foi preservado.");
  }
}

// Executar
publishEdition().catch(console.error);
