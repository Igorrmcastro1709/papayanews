/**
 * auto-publish-44.ts
 * Script de publicação automática do The Daily Compute — Edição #44
 * Uso: cd /home/ubuntu/papayanews && npx tsx scripts/auto-publish-44.ts
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import * as db from "../server/db";

// ─── Conteúdo da edição ────────────────────────────────────────────────────
const EDITION_NUMBER = 44;
const EDITION_DATE = "31 de março de 2026";
const EDITION_TITLE = `The Daily Compute #${EDITION_NUMBER} — ${EDITION_DATE}`;
const EDITION_SUBJECT = `The Daily Compute #${EDITION_NUMBER} — ${EDITION_DATE}: Axios comprometido no NPM, Google lança TurboQuant e Newsom assina executive order de IA`;
const EDITION_CONTENT = `# The Daily Compute #${EDITION_NUMBER} — ${EDITION_DATE}

**Manchete:** Ataque massivo à cadeia de suprimentos compromete Axios no NPM, enquanto Google apresenta algoritmo revolucionário que reduz em seis vezes o consumo de memória de IA.

---

## O Sinal no Ruído

A segurança da infraestrutura de software e os limites físicos da inteligência artificial colidiram nas últimas vinte e quatro horas, desenhando um cenário de extrema cautela para desenvolvedores e líderes de tecnologia. O comprometimento do pacote Axios no NPM, uma biblioteca com mais de oitenta e três milhões de downloads semanais, expõe a fragilidade inerente aos ecossistemas de código aberto. A injeção de um cavalo de troia multiplataforma através de uma dependência fantasma demonstra um nível de sofisticação e planejamento que ultrapassa o vandalismo digital comum, visando diretamente a exfiltração de dados corporativos e credenciais em larga escala.

Paralelamente, a barreira do hardware na inteligência artificial ganhou dois novos contornos. A revelação do TurboQuant pelo Google oferece uma solução matemática elegante para o gargalo da memória em modelos de linguagem, prometendo viabilizar inferências complexas em dispositivos com recursos limitados. No entanto, a projeção de que as grandes empresas de tecnologia gastarão seiscentos e trinta e cinco bilhões de dólares em infraestrutura de IA este ano esbarra em uma realidade implacável: a crise global de energia e as restrições na cadeia de suprimentos de materiais críticos, como o hélio. A inovação algorítmica acelera, mas a infraestrutura física e a segurança fundamental do código continuam sendo os verdadeiros limitadores do progresso tecnológico em escala.

---

## Top 10 Histórias

### 1. Ataque à cadeia de suprimentos compromete pacote Axios no NPM

**Resumo de Impacto:** Um ataque sofisticado comprometeu o pacote Axios no NPM, injetando um cavalo de troia de acesso remoto multiplataforma. Desenvolvedores que utilizam as versões afetadas devem rotacionar credenciais imediatamente e reverter para versões seguras para evitar o comprometimento de seus sistemas.

A popular biblioteca de requisições HTTP Axios foi alvo de um ataque crítico à cadeia de suprimentos após a conta de seu principal mantenedor no NPM ser comprometida. Os invasores publicaram as versões maliciosas 1.14.1 e 0.30.4, que injetavam silenciosamente uma dependência falsa chamada plain-crypto-js. Esta dependência atuava como um instalador de um cavalo de troia de acesso remoto (RAT) projetado para infectar sistemas macOS, Windows e Linux, sem alterar uma única linha do código-fonte original do Axios.

O nível de sofisticação do ataque impressionou pesquisadores de segurança. A carga maliciosa foi preparada dezoito horas antes do ataque e desenhada para se autodestruir após a execução, apagando seus rastros forenses e substituindo seus próprios arquivos de manifesto por versões limpas. O malware entrava em contato com um servidor de comando e controle para baixar binários específicos para o sistema operacional da vítima, permitindo a execução remota de comandos e a exfiltração de dados sensíveis diretamente das máquinas dos desenvolvedores e servidores de integração contínua.

Especialistas recomendam que qualquer equipe de engenharia que tenha baixado as versões comprometidas assuma que suas credenciais foram expostas. A mitigação exige o rebaixamento imediato para as versões 1.14.0 ou 0.30.3 do Axios, a remoção completa da dependência maliciosa dos diretórios locais e a rotação compulsória de todas as chaves de API, tokens de acesso e senhas presentes nos ambientes afetados.

**Score:** 47/50 | **Fontes:** The Hacker News, StepSecurity, Socket

---

### 2. Google revela TurboQuant e revoluciona compressão de memória para IA

**Resumo de Impacto:** O Google apresentou um novo algoritmo de compressão que reduz a necessidade de memória de modelos de linguagem em até seis vezes sem perda de precisão. A tecnologia promete baratear drasticamente os custos de inferência e viabilizar a execução de modelos avançados em dispositivos móveis.

Pesquisadores do Google apresentaram o TurboQuant durante a conferência ICLR 2026, revelando uma solução matemática rigorosa para um dos maiores gargalos da inteligência artificial moderna: o consumo excessivo de memória pelos caches de chave-valor. O novo algoritmo de quantização vetorial consegue comprimir as estruturas de memória necessárias para a geração de texto de forma altamente eficiente, resultando em uma redução de seis vezes na pegada de memória e um aumento de até oito vezes na velocidade de processamento da atenção dos modelos.

Diferente de técnicas anteriores de compressão que exigiam retreinamento custoso ou ajustes finos complexos, o TurboQuant pode ser aplicado diretamente a modelos existentes. Esta característica facilita enormemente sua adoção imediata pela indústria. A inovação permite que empresas executem inferências complexas utilizando uma fração do hardware que seria normalmente exigido, alterando a economia fundamental da implantação de inteligência artificial em larga escala.

A tecnologia não apenas alivia a pressão sobre os data centers superlotados, mas também abre caminho para que modelos de linguagem de fronteira sejam executados localmente em smartphones e laptops. O mercado reagiu rapidamente à notícia, com as ações de fabricantes de memória registrando quedas significativas diante da perspectiva de que a demanda por chips de RAM de altíssimo custo possa ser mitigada pela eficiência algorítmica do Google.

**Score:** 45/50 | **Fontes:** Cybernews, The Register, Yahoo Finance

---

### 3. Califórnia impõe proteções rigorosas de IA em contratos estaduais

**Resumo de Impacto:** O governador da Califórnia assinou uma ordem executiva pioneira que exige garantias de segurança e privacidade de empresas de IA que buscam contratos com o estado. A medida estabelece um novo padrão regulatório que deve influenciar o mercado global de tecnologia.

O governador Gavin Newsom emitiu uma ordem executiva determinando que o governo da Califórnia reestruture seus processos de aquisição de tecnologia para exigir salvaguardas estritas das empresas de inteligência artificial. A diretriz obriga os fornecedores a atestarem e explicarem detalhadamente como suas tecnologias previnem a exploração de conteúdo ilegal, mitigam vieses algorítmicos e protegem os direitos civis e a liberdade de expressão dos usuários.

A medida posiciona a Califórnia, a quarta maior economia do mundo e berço das principais empresas de tecnologia, em rota de colisão direta com as políticas de desregulamentação do governo federal americano. Ao utilizar o imenso poder de compra do estado como alavanca regulatória, Newsom estabelece um padrão de fato para a indústria, uma vez que poucas empresas de tecnologia estariam dispostas a desenvolver versões separadas de seus produtos apenas para atender aos requisitos californianos.

Além das exigências para contratação, a ordem executiva também orienta o Departamento de Tecnologia do estado a criar as primeiras recomendações nacionais para a marcação d'água de imagens e vídeos gerados por inteligência artificial. A iniciativa busca combater a desinformação e garantir a transparência na comunicação pública, sinalizando uma abordagem proativa na governança de tecnologias emergentes.

**Score:** 42/50 | **Fontes:** gov.ca.gov, Reuters

---

### 4. Gastos de Big Tech com IA esbarram em crise global de energia

**Resumo de Impacto:** Microsoft, Amazon, Alphabet e Meta planejam investir seiscentos e trinta e cinco bilhões de dólares em infraestrutura de IA este ano. No entanto, gargalos no fornecimento de energia e materiais essenciais ameaçam a expansão contínua dos data centers.

Uma nova análise da S&P Global Visible Alpha revelou que os gastos combinados de capital das quatro maiores empresas de tecnologia do mundo devem atingir a marca de seiscentos e trinta e cinco bilhões de dólares em 2026, impulsionados quase inteiramente pela corrida da inteligência artificial. Este volume de investimento, que se aproxima do Produto Interno Bruto de países inteiros, destina-se à construção de data centers massivos e à aquisição de aceleradores de processamento.

Contudo, a execução destes planos trilionários está colidindo com as limitações físicas da infraestrutura global. A demanda de energia dos novos centros de processamento de IA superou a capacidade de geração e transmissão de diversas redes elétricas ao redor do mundo. As gigantes da tecnologia estão sendo forçadas a assumir diretamente os custos de infraestrutura elétrica para garantir a viabilidade de suas operações, alterando a dinâmica de seus investimentos de capital.

A situação é agravada por tensões geopolíticas recentes, incluindo conflitos no Oriente Médio, que interromperam cadeias de suprimentos de materiais críticos como o hélio, essencial para a fabricação de semicondutores. Esta convergência de restrições de energia e escassez de materiais sugere que a expansão da inteligência artificial pode enfrentar seu primeiro grande teto de crescimento físico, forçando a indústria a buscar inovações em eficiência em vez de apenas escalar a força bruta computacional.

**Score:** 42/50 | **Fontes:** Reuters, S&P Global, Finimize

---

### 5. Startup sul-coreana Rebellions capta US$ 400 milhões para desafiar Nvidia

**Resumo de Impacto:** A fabricante de chips Rebellions levantou quatrocentos milhões de dólares em uma rodada pré-IPO e lançou novos produtos de infraestrutura. A empresa foca exclusivamente em chips de inferência, buscando capturar o mercado de implantação de IA em larga escala.

A Rebellions, uma startup sul-coreana especializada no design de chips para inteligência artificial, garantiu um aporte de quatrocentos milhões de dólares em sua rodada de financiamento pré-IPO, elevando sua avaliação de mercado para mais de dois bilhões de dólares. O investimento foi liderado pelo Mirae Asset Financial Group e pelo Korea National Growth Fund, marcando um esforço agressivo da Coreia do Sul para estabelecer uma presença dominante no setor de hardware para inteligência artificial.

A empresa foca estrategicamente na etapa de inferência da inteligência artificial, que é o processamento necessário para que os modelos respondam às consultas dos usuários, em oposição à fase de treinamento intensivo dominada pela Nvidia. Com o amadurecimento dos grandes modelos de linguagem e sua transição para implantações comerciais diárias, o mercado de inferência tornou-se o novo campo de batalha econômico da tecnologia, exigindo soluções que operem sob rigorosas restrições de energia e custo.

Junto com o anúncio financeiro, a Rebellions revelou duas novas plataformas de infraestrutura prontas para produção, denominadas RebelRack e RebelPOD. Os produtos visam facilitar a implantação de clusters escaláveis para data centers e provedores de nuvem. A startup também confirmou sua expansão global, estabelecendo operações nos Estados Unidos, Japão, Arábia Saudita e Taiwan, preparando o terreno para sua oferta pública inicial planejada para o final deste ano.

**Score:** 41/50 | **Fontes:** TechCrunch, Reuters

---

### 6. Google lança modelo de séries temporais de código aberto com 200M de parâmetros

**Resumo de Impacto:** Um novo modelo fundacional focado exclusivamente em dados temporais foi disponibilizado pelo Google Research. A ferramenta oferece uma janela de contexto extensa e promete revolucionar a análise preditiva em finanças, clima e operações.

A divisão de pesquisa do Google publicou silenciosamente um novo modelo fundacional de duzentos milhões de parâmetros focado especificamente na análise de séries temporais. Disponibilizado em repositório de código aberto, o modelo destaca-se por suportar uma janela de contexto de dezesseis mil tokens, permitindo a ingestão e o processamento de sequências históricas longas e complexas sem a necessidade de fragmentação dos dados.

A arquitetura foi otimizada para identificar padrões sutis e dependências de longo prazo em dados sequenciais, superando abordagens estatísticas tradicionais e redes neurais recorrentes mais antigas. A capacidade de processar grandes blocos de contexto temporal de uma só vez melhora drasticamente a precisão das previsões em cenários onde eventos distantes no passado influenciam resultados futuros de maneira não linear.

O lançamento representa um avanço significativo para engenheiros de dados e pesquisadores quantitativos que lidam com previsões meteorológicas, análises financeiras de alta frequência, telemetria industrial e monitoramento de infraestrutura. A decisão de manter o modelo com um número relativamente baixo de parâmetros garante que ele possa ser executado eficientemente em hardware padrão, democratizando o acesso a capacidades avançadas de previsão baseadas em inteligência artificial.

**Score:** 38/50 | **Fontes:** GitHub Google Research, Hacker News

---

### 7. GitHub recua e remove anúncios de ferramentas em pull requests

**Resumo de Impacto:** Após forte reação negativa da comunidade de desenvolvedores, o GitHub desativou um recurso do Copilot que inseria sugestões não solicitadas diretamente no código de pull requests. O episódio destaca a tensão entre monetização e a confiança dos usuários.

O GitHub foi forçado a reverter rapidamente uma atualização do seu assistente de programação Copilot após uma onda de críticas intensas por parte da comunidade de engenharia de software. A plataforma havia introduzido um recurso que permitia ao agente de inteligência artificial inserir dicas e sugestões de código diretamente nos pull requests de outros desenvolvedores, o que foi amplamente interpretado pelos usuários como uma forma intrusiva de publicidade do produto e uma violação da etiqueta de revisão de código.

A funcionalidade alterava a dinâmica de colaboração fundamental da plataforma, injetando comentários automatizados em espaços tradicionalmente reservados para o escrutínio humano crítico. Desenvolvedores argumentaram que a inserção de sugestões geradas por inteligência artificial em processos de revisão de segurança e arquitetura adicionava ruído desnecessário e minava a confiança na integridade do código que estava sendo avaliado para produção.

Gerentes de produto do GitHub reconheceram publicamente que permitir que o Copilot alterasse ou comentasse proativamente nos pull requests de terceiros foi um erro de julgamento. A rápida desativação do recurso ilustra o delicado equilíbrio que as empresas de ferramentas para desenvolvedores devem manter ao integrar agentes autônomos em fluxos de trabalho estabelecidos, onde a autonomia excessiva da máquina pode ser vista como uma quebra de protocolo profissional.

**Score:** 37/50 | **Fontes:** The Register, Hacker News

---

### 8. Starcloud atinge avaliação de US$ 1,1 bilhão para computação em órbita

**Resumo de Impacto:** A startup de infraestrutura espacial Starcloud captou cento e setenta milhões de dólares para construir data centers na órbita terrestre. A iniciativa busca resolver os problemas de energia e refrigeração que limitam a inteligência artificial na Terra.

A Starcloud, uma startup focada em estabelecer infraestrutura de computação fora da atmosfera terrestre, alcançou o status de unicórnio após levantar cento e setenta milhões de dólares em sua mais recente rodada de investimentos. A avaliação de pouco mais de um bilhão de dólares reflete o crescente interesse do capital de risco em soluções radicais para os limites físicos enfrentados pela indústria de inteligência artificial, posicionando a empresa como uma concorrente direta das iniciativas espaciais de Elon Musk.

O modelo de negócios da empresa propõe a construção de constelações de satélites equipados com hardware de processamento de alto desempenho. Esta abordagem visa contornar dois dos maiores desafios dos data centers tradicionais: o custo da energia elétrica e a necessidade de refrigeração massiva. No espaço, os servidores podem aproveitar a energia solar ininterrupta e dissipar o calor no vácuo espacial de forma passiva, reduzindo drasticamente os custos operacionais associados ao treinamento e à inferência de modelos pesados.

Embora a latência da transmissão de dados entre a órbita e a superfície terrestre continue sendo um obstáculo técnico para aplicações em tempo real, a infraestrutura orbital apresenta-se como uma solução viável para o treinamento assíncrono de modelos fundacionais e processamento em lote. O financiamento acelerará o lançamento dos primeiros protótipos funcionais da empresa, marcando o início de uma nova fronteira para a expansão da capacidade computacional global.

**Score:** 37/50 | **Fontes:** Reuters

---

### 9. OpenAI descontinua gerador de vídeos Sora devido a custos operacionais

**Resumo de Impacto:** A OpenAI confirmou o encerramento do seu aclamado gerador de vídeos Sora, que estava gerando perdas de um milhão de dólares por dia. O movimento indica uma priorização rigorosa de recursos computacionais antes da aguardada oferta pública inicial da empresa.

A OpenAI anunciou o encerramento oficial do Sora, sua plataforma de geração de vídeos baseada em inteligência artificial, pouco mais de um ano após seu lançamento viral. O aplicativo será desativado em abril, com o suporte à interface de programação de aplicações (API) sendo encerrado em setembro. A decisão abrupta chocou criadores de conteúdo e desenvolvedores que haviam integrado a ferramenta em seus fluxos de trabalho de produção audiovisual.

O motivo central para o desligamento reside nos custos operacionais insustentáveis da tecnologia. Relatórios indicam que a manutenção da infraestrutura necessária para gerar os vídeos de alta fidelidade estava custando à OpenAI cerca de um milhão de dólares diariamente. A arquitetura de difusão de vídeo provou ser ordens de magnitude mais exigente em termos de processamento do que a geração de texto, criando um modelo de negócios que não conseguia se sustentar apenas com as assinaturas dos usuários.

Analistas de mercado interpretam o movimento não como um fracasso tecnológico, mas como um recuo estratégico e disciplinado. À medida que a OpenAI se prepara para uma potencial oferta pública inicial no segundo semestre de 2026, a empresa está sendo forçada a demonstrar viabilidade financeira e a realocar sua preciosa capacidade de processamento para produtos mais rentáveis e para o treinamento de sua próxima geração de modelos fundacionais, provisoriamente conhecida como Spud.

**Score:** 37/50 | **Fontes:** Medium, KuCoin News

---

### 10. Maioria dos americanos teme impactos negativos da inteligência artificial

**Resumo de Impacto:** Uma nova pesquisa revela que cinquenta e cinco por cento dos cidadãos dos Estados Unidos acreditam que a inteligência artificial causará mais danos do que benefícios. O aumento do ceticismo público pode acelerar pressões por regulamentações mais duras.

A desconfiança pública em relação à inteligência artificial atingiu um novo patamar nos Estados Unidos, de acordo com uma pesquisa recente que aponta uma mudança significativa no sentimento nacional. Cinquenta e cinco por cento dos americanos agora afirmam que a tecnologia fará mais mal do que bem em suas vidas cotidianas, representando um aumento acentuado de onze pontos percentuais em relação às medições realizadas no ano anterior.

Os dados indicam que o deslumbramento inicial com as capacidades generativas está sendo rapidamente substituído por preocupações pragmáticas. Os entrevistados expressaram temores profundos em relação à transparência das empresas de tecnologia, à falta de regulamentação governamental eficaz e às implicações mais amplas para a segurança no emprego e a privacidade pessoal. A percepção de que a tecnologia está avançando sem os devidos freios e contrapesos sociais tornou-se o consenso majoritário.

Curiosamente, o mesmo conjunto de dados revelou que a adoção de ferramentas de inteligência artificial no ambiente de trabalho continua a crescer, evidenciando um paradoxo onde os usuários dependem de tecnologias nas quais fundamentalmente não confiam. Esta dissonância cognitiva em larga escala cria um ambiente volátil para as empresas do setor, sugerindo que a aceitação do consumidor é frágil e que incidentes de segurança ou falhas éticas podem desencadear reações políticas e regulatórias severas e imediatas.

**Score:** 37/50 | **Fontes:** Straits Times, TechCrunch

---

## Deep Dive Técnico: A Anatomia do Ataque à Cadeia de Suprimentos do Axios

O comprometimento do pacote Axios no NPM representa um marco preocupante na evolução dos ataques à cadeia de suprimentos de software. A operação não dependeu da exploração de vulnerabilidades no código do Axios, mas sim do sequestro da identidade de seu mantenedor principal e do abuso engenhoso dos mecanismos de resolução de dependências do ecossistema Node.js. O vetor de ataque demonstra um entendimento profundo de como contornar processos modernos de revisão de código e integração contínua.

O ataque começou com a tomada de controle da conta NPM do mantenedor, permitindo que os agentes de ameaça contornassem as verificações rigorosas de segurança configuradas no repositório GitHub do projeto. Ao publicar as versões 1.14.1 e 0.30.4 diretamente no registro do NPM, os atacantes garantiram que o código malicioso nunca aparecesse no histórico de commits público, tornando a revisão baseada em diferenças completamente inútil. O código-fonte do Axios permaneceu intocado; a única alteração foi a adição de uma linha no arquivo package.json exigindo a dependência fabricada plain-crypto-js.

A genialidade maliciosa do ataque reside na execução do plain-crypto-js. Este pacote foi projetado unicamente para explorar o ciclo de vida de instalação do NPM através de um script postinstall. Quando um desenvolvedor ou servidor de CI instalava o Axios comprometido, o gerenciador de pacotes baixava a dependência falsa e executava automaticamente o script em segundo plano. Este script continha um instalador ofuscado em Node.js que identificava o sistema operacional hospedeiro e entrava em contato com um servidor de comando e controle específico para baixar a carga útil apropriada.

A carga útil em si era um Cavalo de Troia de Acesso Remoto (RAT) altamente especializado. No macOS, ele utilizava AppleScript para baixar um binário C++, disfarçá-lo como um processo do sistema e executá-lo silenciosamente. No Windows, o instalador localizava o PowerShell, criava uma cópia disfarçada como o Windows Terminal e utilizava VBScript para iniciar a infecção. Em sistemas Linux, comandos de shell simples via execSync baixavam e executavam um script Python. Em todos os cenários, o RAT estabelecia comunicação constante com o servidor dos atacantes, aguardando comandos para exfiltrar variáveis de ambiente, chaves de acesso e código-fonte.

Para garantir a evasão forense, o malware realizava uma rotina de limpeza agressiva imediatamente após a infecção inicial. Ele deletava o script postinstall, removia as referências maliciosas do arquivo de manifesto e renomeava um arquivo de backup limpo para substituir o package.json original. Esta técnica de autodestruição garantia que, se um desenvolvedor inspecionasse a pasta node_modules após a instalação, encontraria apenas arquivos de configuração de aparência benigna, dificultando imensamente a detecção do comprometimento e sublinhando a urgência de ferramentas de segurança focadas em análise de comportamento em tempo de execução.

---

## Radar de Mercado

**O gargalo da verificação de código:** A Qodo captou setenta milhões de dólares para resolver o novo grande problema da engenharia de software: verificar e validar os bilhões de linhas de código que estão sendo geradas mensalmente por ferramentas de inteligência artificial, garantindo que o software funcione conforme o planejado e sem vulnerabilidades ocultas.

**Automação de infraestrutura em alta:** A ScaleOps levantou cento e trinta milhões de dólares em uma rodada Série C para sua plataforma que utiliza inteligência artificial para automatizar a gestão de clusters Kubernetes em tempo real, prometendo reduzir drasticamente os custos de nuvem em um momento de escassez global de GPUs.

**Soberania em semicondutores avança:** Fabricantes de chips na China estabeleceram uma meta agressiva de atingir oitenta por cento de autossuficiência na produção de semicondutores até o início da próxima década, uma resposta direta às sanções de exportação que está reconfigurando as cadeias de suprimentos globais de hardware para inteligência artificial.
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
    console.log(`   ID: ${(newsletter as any)?.insertId || "N/A"}`);
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
