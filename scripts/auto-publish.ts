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

const EDITION_NUMBER = 43;
const EDITION_DATE = "30 de março de 2026";
const EDITION_TITLE = `The Daily Compute #${EDITION_NUMBER} — ${EDITION_DATE}`;
const EDITION_SUBJECT = `The Daily Compute #${EDITION_NUMBER} — ${EDITION_DATE}: OpenAI encerra Sora, Eli Lilly fecha deal de US$2,75B com IA e Jensen Huang declara AGI alcançada`;

const EDITION_CONTENT = `# The Daily Compute #${EDITION_NUMBER} — ${EDITION_DATE}

**Manchete:** O fim precoce do Sora: OpenAI encerra gerador de vídeos por custos insustentáveis e redireciona estratégia.

---

## O Sinal no Ruído

A decisão da OpenAI de encerrar o Sora após apenas seis meses no mercado revela uma verdade inconveniente sobre a atual fase da inteligência artificial: a economia unitária importa mais do que a demonstração de capacidades impressionantes. Enquanto o público se deslumbrava com vídeos hiper-realistas gerados a partir de texto, os custos de inferência se acumulavam em um ritmo insustentável, queimando cerca de um milhão de dólares diariamente para uma base de usuários em declínio. O encerramento do Sora não representa um retrocesso tecnológico, mas sim um ajuste pragmático de rota em direção à sustentabilidade financeira e ao foco em produtos que geram receita recorrente, como modelos de raciocínio e agentes de código.

Paralelamente, observamos movimentos que consolidam a IA em aplicações práticas e altamente rentáveis. O acordo multibilionário entre a gigante farmacêutica Eli Lilly e a Insilico Medicine demonstra que o verdadeiro valor transformacional da IA generativa pode residir na descoberta de novos fármacos, não apenas na criação de mídia sintética. Ao mesmo tempo, a declaração enfática de Jensen Huang sobre o suposto alcance da AGI adiciona combustível às expectativas do mercado, contrastando fortemente com os desafios práticos enfrentados por empresas como a Waymo nas ruas de Austin. O setor está amadurecendo rapidamente, e a distinção entre pesquisa fascinante e produto comercialmente viável nunca esteve tão clara. O capital continua fluindo de forma abundante, como comprova a expressiva captação de dívida da Mistral na Europa, mas a tolerância para modelos de negócios não comprovados está visivelmente diminuindo.

---

## Top 10 Histórias

### 1. OpenAI encerra o Sora após seis meses de operação

**Impacto:** A descontinuação do modelo de geração de vídeo mais comentado do mercado sinaliza uma mudança drástica na estratégia de alocação de recursos da OpenAI. A decisão expõe os desafios econômicos da inferência de vídeo em larga escala e resulta na perda de parcerias bilionárias, como o acordo com a Disney.

A OpenAI tomou a decisão abrupta de encerrar o Sora, sua ferramenta de geração de vídeos por inteligência artificial, apenas seis meses após o lançamento público. Segundo investigações recentes, o produto tornou-se um ralo financeiro, consumindo aproximadamente um milhão de dólares por dia em poder computacional, enquanto a base de usuários ativos despencou de um milhão para menos de quinhentos mil. A alta demanda por chips de IA para manter o serviço estava prejudicando outras frentes mais lucrativas da empresa.

Internamente, a liderança optou por redirecionar os escassos recursos de computação para o desenvolvimento de agentes e ferramentas de codificação, áreas onde a concorrência com a Anthropic tem se acirrado. A decisão foi tão repentina que parceiros estratégicos foram pegos de surpresa. A Disney, que havia comprometido um bilhão de dólares em uma parceria focada no Sora, foi informada do encerramento menos de uma hora antes do anúncio público, resultando no cancelamento imediato do acordo.

**Score:** 45/50 | **Fontes:** Wall Street Journal, TechCrunch, The Verge

---

### 2. Eli Lilly e Insilico Medicine fecham acordo de US$ 2,75 bilhões

**Impacto:** O acordo monumental valida a aplicação de inteligência artificial generativa na indústria farmacêutica. A parceria pode acelerar drasticamente o tempo de desenvolvimento de novos medicamentos orais, reduzindo custos e aumentando as taxas de sucesso clínico.

A gigante farmacêutica norte-americana Eli Lilly firmou uma parceria estratégica com a Insilico Medicine, empresa de biotecnologia sediada em Hong Kong e focada em descoberta de medicamentos impulsionada por inteligência artificial. O acordo, avaliado em até 2,75 bilhões de dólares, inclui um pagamento inicial de 115 milhões de dólares e visa o co-desenvolvimento de terapias orais para diversas indicações médicas.

A Insilico Medicine tem se destacado no uso de IA generativa para identificar novos alvos biológicos e desenhar moléculas com propriedades otimizadas. Esta colaboração representa um dos maiores compromissos financeiros já feitos por uma farmacêutica tradicional em tecnologias de IA, sinalizando uma transição da fase experimental para a integração profunda de algoritmos no pipeline principal de pesquisa e desenvolvimento de medicamentos em escala global.

**Score:** 44/50 | **Fontes:** Reuters, CNBC, STAT News

---

### 3. Jensen Huang declara que a AGI já foi alcançada

**Impacto:** A afirmação do CEO da empresa de semicondutores mais valiosa do mundo reacende o debate sobre os marcos de avaliação da inteligência artificial. A declaração influencia a percepção de investidores e reguladores sobre a velocidade do avanço tecnológico.

Durante uma entrevista recente, o CEO e fundador da Nvidia, Jensen Huang, declarou de forma contundente que a Inteligência Artificial Geral (AGI) já foi alcançada. A afirmação ocorreu em resposta a um critério específico proposto durante a conversa: a capacidade de uma IA iniciar e expandir um negócio de tecnologia até atingir a avaliação de um bilhão de dólares. Huang argumentou que, sob essa métrica, o marco já é uma realidade no presente, descartando a necessidade de esperar de cinco a vinte anos.

A declaração gerou reações mistas na comunidade de pesquisa, que continua dividida sobre a definição exata e as métricas de avaliação da AGI. Enquanto pesquisadores do Google DeepMind propõem frameworks cognitivos rigorosos baseados no desempenho humano mediano em diversas tarefas, a visão pragmática e voltada para resultados de negócios de Huang reflete o otimismo agressivo do Vale do Silício. O episódio evidencia a ausência de um consenso científico sobre quando as máquinas efetivamente igualarão a inteligência humana em sua totalidade.

**Score:** 42/50 | **Fontes:** Fortune, Bloomberg

---

### 4. Mistral levanta US$ 830 milhões em dívida para infraestrutura

**Impacto:** O financiamento massivo fortalece a posição da Europa na corrida global da inteligência artificial, garantindo independência computacional. O movimento permite à Mistral escalar sua infraestrutura sem diluir excessivamente o capital dos fundadores.

A startup francesa de inteligência artificial Mistral garantiu 830 milhões de dólares em financiamento de dívida, marcando sua primeira operação financeira desse tipo. Os recursos serão destinados exclusivamente à aquisição de infraestrutura computacional, especificamente a compra de 13.800 aceleradores da Nvidia para equipar um novo e massivo data center localizado nas proximidades de Paris. Este movimento faz parte de um plano mais amplo da empresa de investir cerca de 4 bilhões de euros em capacidade de processamento.

A decisão de captar recursos via dívida em vez de equity demonstra o amadurecimento financeiro da startup, permitindo a expansão agressiva de sua capacidade de treinamento e inferência de modelos fundacionais sem ceder mais controle acionário. A iniciativa também reflete o crescente desejo europeu por alternativas locais e soberanas aos gigantes tecnológicos americanos, assegurando que o processamento de dados críticos permaneça dentro das fronteiras e regulamentações do continente.

**Score:** 42/50 | **Fontes:** Financial Times, Reuters, CNBC

---

### 5. DeepSeek sofre apagão histórico de mais de sete horas

**Impacto:** A interrupção prolongada do principal chatbot da China expõe vulnerabilidades na infraestrutura de serviços de IA de alto tráfego. O incidente afeta milhões de usuários e levanta questões sobre a resiliência de plataformas alternativas aos modelos ocidentais.

O chatbot da DeepSeek, uma das plataformas de inteligência artificial mais populares e utilizadas globalmente desde sua ascensão meteórica no início de 2025, sofreu uma interrupção massiva que durou sete horas e treze minutos. O apagão ocorreu durante a madrugada e a manhã na China, impedindo que milhões de usuários acessassem a interface de conversação e a API do serviço. Este foi o maior tempo de inatividade registrado pela empresa desde o seu lançamento oficial.

A equipe de engenharia da DeepSeek foi forçada a implementar múltiplas atualizações emergenciais para restaurar a estabilidade do sistema. Embora o serviço tenha retornado à normalidade, as causas técnicas específicas da falha não foram detalhadas publicamente pela empresa. O incidente serve como um lembrete contundente dos imensos desafios de engenharia envolvidos na manutenção de sistemas de inferência em larga escala, especialmente para provedores que operam com margens de custo extremamente otimizadas.

**Score:** 42/50 | **Fontes:** Bloomberg, Reuters

---

### 6. Waymo enfrenta dificuldades com ônibus escolares em Austin

**Impacto:** Os incidentes evidenciam as limitações contínuas do aprendizado de máquina em cenários complexos do mundo real. As falhas podem resultar em maior escrutínio regulatório e atrasar a expansão de serviços de robotáxis em novas cidades.

Documentos internos, e-mails e relatórios do Conselho Nacional de Segurança em Transportes (NTSB) revelaram que os veículos autônomos da Waymo têm falhado repetidamente em reconhecer e parar adequadamente para ônibus escolares na cidade de Austin, Texas. A legislação local exige parada obrigatória quando os ônibus acionam suas luzes intermitentes e placas de pare. No entanto, o distrito escolar de Austin registrou pelo menos dezenove instâncias em que os robotáxis ultrapassaram os ônibus de forma ilegal e perigosa.

Apesar de meses de colaboração entre a Waymo e as autoridades escolares locais para treinar os sistemas de inteligência artificial usando dados específicos dessas interações, os veículos continuaram a apresentar comportamentos imprevisíveis. A incapacidade do sistema de generalizar o aprendizado e adaptar-se consistentemente a essas situações críticas de trânsito resultou em um recall recente de três mil veículos da frota. O caso ilustra a distância que ainda existe entre a autonomia demonstrada em ambientes controlados e a segurança absoluta exigida nas vias públicas.

**Score:** 40/50 | **Fontes:** Wired

---

### 7. Bluesky lança Attie, aplicativo social baseado em agentes

**Impacto:** O lançamento introduz um novo paradigma de consumo de mídia social, onde algoritmos são moldados ativamente pelo usuário através de linguagem natural. A inovação desafia o modelo tradicional de feeds opacos e controlados centralmente por grandes corporações.

A equipe responsável pelo protocolo descentralizado Bluesky anunciou o lançamento do Attie, um novo aplicativo social classificado como agêntico e construído sobre o AT Protocol. Diferente das redes sociais convencionais, o Attie funciona primariamente como um assistente de inteligência artificial, alimentado pelo modelo Claude da Anthropic, que permite aos usuários criar e refinar seus próprios feeds de conteúdo e algoritmos de recomendação utilizando apenas comandos em linguagem natural.

A iniciativa visa democratizar a curadoria de conteúdo, entregando o controle diretamente nas mãos dos usuários. Ao invés de depender de algoritmos de engajamento predefinidos, os participantes podem instruir o agente de IA a filtrar, organizar e priorizar postagens com base em interesses altamente específicos e dinâmicos. O Attie representa um experimento ambicioso para tornar a construção sobre o AT Protocol mais acessível e pode ditar as tendências futuras de personalização em plataformas sociais.

**Score:** 40/50 | **Fontes:** TechCrunch, The Verge

---

### 8. Google apresenta TurboQuant para compressão extrema de modelos

**Impacto:** A nova técnica de compressão pode reduzir drasticamente os custos operacionais de empresas que dependem de grandes modelos de linguagem. A otimização permite rodar modelos complexos em hardware menos potente, democratizando o acesso à inferência avançada.

Pesquisadores do Google publicaram um artigo técnico detalhando o TurboQuant, um novo algoritmo projetado para comprimir a memória cache de chaves e valores (KV cache) em grandes modelos de linguagem. A inovação promete reduzir o consumo de memória em até seis vezes sem comprometer a precisão das respostas geradas pela inteligência artificial. Além da economia de memória, o método proporciona ganhos de velocidade significativos durante a fase de inferência.

O gerenciamento do KV cache tem sido um dos principais gargalos técnicos e financeiros na operação de LLMs em escala, exigindo vastas quantidades de memória VRAM em GPUs caras. Ao otimizar radicalmente esse componente através de técnicas avançadas de quantização, o TurboQuant tem o potencial de alterar a economia da inteligência artificial. A descoberta pode viabilizar a execução de modelos de fronteira em dispositivos com restrições de hardware e reduzir a dependência exclusiva de clusters massivos de processamento.

**Score:** 40/50 | **Fontes:** The Lec, arXiv

---

### 9. App Store enfrenta atrasos severos devido ao "vibe coding"

**Impacto:** O congestionamento no processo de revisão afeta o ecossistema de desenvolvimento iOS, atrasando lançamentos legítimos e atualizações críticas. O fenômeno expõe a necessidade de a Apple repensar seus mecanismos de moderação frente à automação da programação.

Desenvolvedores do ecossistema iOS estão relatando atrasos sem precedentes no processo de revisão da App Store da Apple, com tempos de espera que saltaram de poucas horas para até quarenta e cinco dias em alguns casos. A causa principal desse colapso logístico é atribuída ao fenômeno do "vibe coding", uma prática onde indivíduos com pouco ou nenhum conhecimento técnico utilizam ferramentas de inteligência artificial generativa para criar e submeter aplicativos em massa.

Essa facilidade de geração de código resultou em um aumento estimado de vinte e quatro por cento nas submissões mensais de novos aplicativos, inundando as equipes de moderação da Apple com softwares frequentemente genéricos ou de baixa qualidade. A crise está prejudicando estúdios de desenvolvimento estabelecidos, que dependem de aprovações rápidas para manter seus ciclos de negócios. A situação pressiona a Apple a implementar filtros automatizados mais rigorosos para separar aplicações genuínas do volume gerado indiscriminadamente por IA.

**Score:** 39/50 | **Fontes:** Business Insider, 9to5Mac

---

### 10. Amazon adquire startup de robótica humanoide Fauna

**Impacto:** A aquisição intensifica a corrida corporativa pelo domínio da robótica de propósito geral. O movimento posiciona a Amazon em rota de colisão direta com iniciativas similares de empresas como Tesla e Boston Dynamics.

A Amazon concluiu a aquisição da Fauna Robotics, uma startup emergente no setor de robótica, menos de dois meses após a empresa apresentar o seu robô humanoide chamado Sprout. O dispositivo, que possui cerca de um metro de altura e pesa pouco mais de vinte quilos, foi projetado originalmente como um robô social e utilitário, capaz de interagir em ambientes domésticos, caminhar e realizar tarefas simples como recolher objetos.

O movimento estratégico reforça as ambições da Amazon em integrar robótica avançada não apenas em seus massivos centros de distribuição e logística, mas potencialmente no mercado consumidor residencial. A absorção do talento e da propriedade intelectual da Fauna Robotics indica que a gigante do varejo não pretende ficar para trás na transição de robôs industriais de função única para plataformas humanoides versáteis, um setor que tem atraído bilhões em investimentos de risco nos últimos trimestres.

**Score:** 40/50 | **Fontes:** Fortune, Reuters

---

## Deep Dive: A Falha do Sora e a Economia Unitária da Geração de Vídeo

O encerramento abrupto do Sora pela OpenAI, apenas seis meses após seu lançamento público, é um dos eventos mais sintomáticos da atual fase da inteligência artificial. Longe de ser um problema puramente técnico, o fracasso do produto ilustra a brutal realidade da economia unitária na inferência de modelos multimodais de fronteira. A geração de vídeo sintético de alta fidelidade exige uma quantidade massiva de cálculos computacionais, traduzindo-se em custos operacionais que rapidamente se mostraram incompatíveis com a disposição a pagar do mercado consumidor.

A equação financeira do Sora era insustentável desde o princípio. Com um custo diário de operação estimado em um milhão de dólares e uma base de usuários que rapidamente retraiu de um milhão para menos de meio milhão, a OpenAI encontrou-se subsidiando um produto de nicho com o hardware que poderia ser alocado para frentes muito mais lucrativas. Cada requisição de vídeo consumia ciclos preciosos de GPUs que a empresa precisava desesperadamente para treinar a próxima geração de modelos de linguagem e sustentar serviços corporativos críticos.

Mais do que um problema de custo, o episódio revela uma falha de product-market fit. Enquanto ferramentas de geração de texto e código encontraram adoção imediata e profunda em fluxos de trabalho corporativos, o vídeo gerado por IA permaneceu amplamente confinado ao uso recreativo e experimental. Profissionais de marketing e criadores de conteúdo descobriram que a falta de controle granular sobre o resultado final tornava a ferramenta inadequada para produções comerciais rigorosas. O encerramento de parcerias de alto perfil, como o acordo de um bilhão de dólares com a Disney, sublinha a incapacidade do Sora de atender aos exigentes padrões da indústria do entretenimento.

A decisão de Sam Altman de descontinuar o projeto reflete um pragmatismo necessário. Ao redirecionar os recursos computacionais do Sora para o desenvolvimento de agentes autônomos e ferramentas de codificação, a OpenAI reconhece que a verdadeira captura de valor na IA atual está na automação de processos de software e raciocínio lógico, não na geração de pixels. Este movimento serve como um alerta para toda a indústria: a capacidade de construir demonstrações tecnológicas deslumbrantes não garante, por si só, a viabilidade de um modelo de negócios escalável.

---

## Radar de Mercado

**1. Soberania Computacional Europeia:** A captação de oitocentos e trinta milhões de dólares em dívida pela Mistral para a construção de data centers equipados com chips Nvidia na França destaca o esforço do continente europeu para não depender exclusivamente da infraestrutura em nuvem norte-americana para processamento de IA.

**2. IA no Core Business Farmacêutico:** O acordo de quase três bilhões de dólares entre Eli Lilly e Insilico Medicine consolida a transição da inteligência artificial de uma ferramenta experimental para o motor principal de descoberta de medicamentos, prometendo alterar a estrutura de custos da pesquisa biomédica global.

**3. O Paradoxo da Produtividade na App Store:** A inundação de aplicativos gerados por "vibe coding" que elevou o tempo de revisão da Apple para até quarenta e cinco dias ilustra como a extrema facilidade de criação de software via IA pode colapsar infraestruturas de moderação e curadoria projetadas para o ritmo humano.
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
