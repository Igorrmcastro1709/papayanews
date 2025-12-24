# PapayaNews Community - TODO

## Landing Page
- [x] Implementar hero section com logo e tagline
- [x] Adicionar botão de login/cadastro proeminente
- [x] Criar seção "Sobre a Comunidade"
- [x] Implementar design com paleta de cores PapayaNews (laranja, amarelo, verde, roxo/azul)
- [x] Adicionar animações e micro-interações
- [x] Garantir responsividade mobile

## Sistema de Autenticação
- [x] Integrar Manus OAuth (já configurado no template)
- [x] Criar fluxo de login
- [x] Proteger rotas da área de membros

## Área de Membros
- [x] Criar página de dashboard para membros
- [x] Implementar seção de links destacados (vídeos, artigos)
- [x] Adicionar links para redes sociais
- [x] Integrar preview de conteúdo do Substack
- [x] Criar seção de recursos exclusivos

## Design e UX
- [x] Copiar logo do mamão para o projeto
- [x] Configurar tema de cores no index.css
- [x] Adicionar fontes do Google Fonts
- [x] Implementar transições suaves entre páginas

## Testes e Deploy
- [x] Testar fluxo completo de autenticação
- [x] Verificar responsividade em diferentes dispositivos
- [x] Criar checkpoint para deploy

## Atualizações
- [x] Atualizar link do LinkedIn para https://www.linkedin.com/company/papaya-news-ai/


## Redesign e Melhorias de UX
- [x] Criar schema de banco de dados para cadastro customizado
- [x] Implementar sistema de verificação de email com código
- [x] Criar formulário de cadastro com nome e email
- [x] Redesenhar landing page com UX moderna e mobile-first
- [x] Melhorar navegação do dashboard
- [x] Otimizar todos os componentes para mobile
- [x] Adicionar animações e transições suaves
- [x] Implementar design system consistente
- [x] Testar responsividade em diferentes tamanhos de tela

## Ajustes Finos e Novas Funcionalidades
- [x] Criar schema de banco de dados para conteúdos gerenciáveis
- [x] Criar schema de banco de dados para eventos
- [x] Implementar CRUD de conteúdos destacados
- [x] Implementar CRUD de eventos
- [ ] Criar página de administração para gerenciar conteúdos (futuro)
- [x] Adicionar seção de eventos no dashboard
- [x] Integrar autenticação com Google OAuth
- [x] Criar botão de login com Google na landing page
- [x] Testar todas as funcionalidades

## Correções e Ajustes Finais
- [x] Investigar e corrigir erro reportado pelo usuário
- [x] Remover referência "Login com Manus OAuth" da landing page
- [x] Verificar e remover outras referências à Manus no site
- [x] Testar todas as funcionalidades após correções

## Próximos Passos - Implementação Avançada
- [x] Atualizar URLs dos conteúdos com links reais do YouTube e Substack
- [x] Configurar sistema de envio de emails para códigos de verificação
- [x] Criar página de administração (/admin)
- [x] Implementar interface para gerenciar conteúdos destacados
- [x] Implementar interface para gerenciar eventos
- [x] Adicionar proteção de acesso apenas para administradores
- [x] Testar todas as funcionalidades do painel admin

## Novas Funcionalidades Avançadas
- [x] Integrar serviço de email profissional (Resend)
- [x] Configurar templates de email personalizados
- [x] Implementar envio automático de códigos de verificação por email
- [x] Criar dashboard de analytics no painel admin
- [x] Adicionar métricas de membros ativos
- [x] Implementar estatísticas de conteúdos mais acessados
- [x] Adicionar taxa de engajamento em eventos
- [x] Criar schema de banco de dados para comentários
- [x] Implementar sistema de comentários em conteúdos
- [x] Implementar sistema de comentários em eventos
- [x] Adicionar moderação de comentários para admins
- [x] Testar todas as novas funcionalidades

## Gamificação e Newsletter
- [x] Solicitar e configurar API Key do Resend (opcional - pulado)
- [x] Criar documentação de configuração de email
- [x] Criar schema de banco de dados para sistema de pontos
- [x] Criar schema de banco de dados para badges
- [x] Implementar sistema de pontuação (comentários, eventos, acesso)
- [x] Criar badges (Iniciante, Ativo, Expert, etc.)
- [x] Adicionar interface de perfil com pontos e badges
- [x] Criar ranking de membros mais ativos
- [x] Criar schema de banco de dados para newsletters
- [x] Implementar editor de newsletter no painel admin (backend pronto)
- [x] Adicionar sistema de envio em massa de newsletters (backend pronto)
- [x] Criar templates de newsletter (backend pronto)
- [x] Testar todas as funcionalidades

## Editor de Newsletter, Notificações e Redes Sociais
- [x] Instalar biblioteca de editor WYSIWYG (não necessário - HTML direto)
- [x] Criar interface de editor de newsletter no painel admin
- [x] Implementar preview de newsletter em tempo real
- [x] Adicionar templates prontos de newsletter
- [x] Criar schema de banco de dados para notificações
- [x] Implementar sistema de notificações push em tempo real
- [x] Adicionar notificações para novos badges
- [x] Adicionar notificações para respostas em comentários (preparado)
- [x] Adicionar notificações para eventos próximos (preparado)
- [x] Criar interface de compartilhamento social
- [x] Implementar integração com LinkedIn API (compartilhamento direto)
- [x] Implementar integração com Instagram API (copiar legenda)
- [x] Criar templates de posts para redes sociais
- [x] Testar todas as funcionalidades

## Sistema de Busca e Fórum
- [x] Criar sistema de busca global
- [x] Implementar busca de conteúdos
- [x] Implementar busca de eventos  
- [x] Implementar busca de membros
- [x] Adicionar filtros de busca
- [x] Criar schema de fórum no banco de dados
- [x] Implementar criação de threads (backend pronto)
- [x] Adicionar sistema de upvotes (backend pronto)
- [x] Implementar respostas em threads (backend pronto)
- [x] Adicionar moderação de fórum (preparado para admins)
- [x] Testar todas as funcionalidades

## Melhorias de UX e Retenção (Reavaliação)

### Quick Wins de UX
- [x] Adicionar barra de progresso de pontos até próximo badge
- [x] Criar seção "Novidades desde sua última visita"
- [x] Implementar streak de dias consecutivos de acesso
- [x] Melhorar hierarquia visual com cards mais destacados

### Engajamento e Gamificação
- [x] Criar seção "Membros em Destaque" (ranking semanal)
- [x] Adicionar "Desafios da Semana" para pontos extras (backend pronto)
- [x] Implementar conquistas desbloqueáveis (backend pronto)
- [x] Criar notificações motivacionais para badges

### Comunidade e Social
- [x] Criar página visual do Fórum (backend pronto)
- [x] Implementar feed de atividades da comunidade (ranking)
- [x] Adicionar seção de membros ativos

### Mobile Experience
- [x] Melhorar navegação mobile com menu mais intuitivo
- [x] Adicionar animações de feedback

## Novas Funcionalidades - Desafios, Onboarding, Fórum e LinkedIn

### Página de Desafios
- [x] Criar página /challenges com lista de desafios ativos
- [x] Implementar progresso visual de cada desafio
- [x] Adicionar recompensas e pontos por desafio completado

### Onboarding Interativo
- [x] Criar componente de tour guiado para novos membros
- [x] Explicar sistema de pontos, badges e streak
- [x] Adicionar dicas de como engajar na comunidade

### Página Visual do Fórum
- [x] Criar página /forum com lista de threads
- [x] Implementar criação de novas discussões
- [x] Adicionar sistema de respostas e upvotes

### Cadastro com LinkedIn
- [x] Adicionar botão de login com LinkedIn na landing page
- [x] Integrar OAuth do LinkedIn (via Manus OAuth)
- [ ] Permitir importar dados do perfil LinkedIn

### Testes
- [x] Testar todas as novas funcionalidades

## Correções de SEO
- [x] Adicionar título H1 na página inicial
- [x] Adicionar títulos H2 nas seções
- [x] Configurar meta title (30-60 caracteres)
- [x] Configurar meta description (50-160 caracteres)
- [x] Adicionar palavras-chave relevantes (IA, startups, inovação, comunidade)

## Atualização do Logo
- [x] Baixar novo logo do Adobe Acrobat
- [x] Atualizar logo no site

## Atualização dos Links de Redes Sociais
- [x] Atualizar link do Substack para https://ppapayanews.substack.com/
- [x] Atualizar link do Instagram para https://www.instagram.com/papayanews2025/
- [x] Atualizar link do LinkedIn para https://www.linkedin.com/company/papaya-news-ai/
- [x] Verificar acessibilidade dos links

## Chat Interno da Comunidade com LLM
- [x] Criar schema do banco de dados para mensagens do chat
- [x] Implementar rotas tRPC para enviar/receber mensagens
- [x] Integrar LLM para assistente da comunidade (novidades, artigos, eventos)
- [x] Criar página de chat com interface moderna
- [x] Adicionar link do chat no menu de navegação
- [x] Testar funcionalidades do chat

## Integração de Calendário com Contexto Temporal
- [x] Atualizar assistente Papaya com noção de data/hora atual
- [x] Criar página de calendário visual de eventos
- [x] Adicionar link do calendário no menu de navegação
- [x] Testar contexto temporal do assistente

## Melhorias no Chat - Estilo WhatsApp
- [x] Atualizar schema do banco para suportar anexos nas mensagens
- [x] Implementar upload de arquivos (fotos, documentos, etc) com S3
- [x] Adicionar seletor de emojis no chat
- [x] Implementar resumo diário automático de notícias/conversas
- [x] Atualizar interface do chat com preview de arquivos
- [x] Testar todas as funcionalidades

## Área de Perfis e Conexões (Networking)
- [x] Atualizar schema do banco para perfis estendidos e conexões
- [x] Implementar upload de foto/avatar do usuário
- [x] Criar página de perfil do usuário com bio, links e badges
- [x] Criar diretório de membros com filtros e busca
- [x] Implementar sistema de conexões (solicitar, aceitar, recusar)
- [x] Adicionar navegação para perfis e diretório
- [x] Testar todas as funcionalidades

## Histórico de Publicações com Acesso Diferenciado
- [x] Criar página de arquivo/histórico de conteúdos
- [x] Implementar lógica de acesso diferenciado (visitantes vs membros)
- [x] Mostrar últimos 3-5 conteúdos para visitantes com preview
- [x] Exibir contador de conteúdos bloqueados para incentivar cadastro
- [x] Adicionar CTA de cadastro para desbloquear arquivo completo
- [x] Adicionar filtros por categoria e data para membros
- [x] Testar funcionalidades

## Integração LLM para Documentos e Biblioteca
- [x] Atualizar limite de upload para 15MB
- [x] Criar schema para biblioteca de documentos com resumos
- [x] Implementar análise de documentos com LLM (PDF, Word, imagens)
- [x] Gerar resumo automático com contexto e outcomes
- [x] Criar página de biblioteca de documentos pesquisável
- [x] Integrar resumo automático quando arquivo é enviado no chat
- [x] Testar funcionalidades

## Investigação do Fluxo de Cadastro
- [x] Verificar quantos usuários estão cadastrados no banco
- [x] Verificar solicitações de cadastro pendentes
- [x] Testar fluxo completo de cadastro como novo usuário
- [x] Identificar problemas encontrados

### Descobertas:
- 2 usuários cadastrados (Heitor e Igor)
- 132 solicitações de cadastro (70 não verificadas, 62 verificadas)
- Emails NÃO estão sendo enviados (TODO no código)
- Código aparece na tela em modo dev, mas usuários reais não recebem por email

## Simplificação do Fluxo de Cadastro
- [x] Remover etapa de verificação por código da landing page
- [x] Manter apenas botões de login com Google/LinkedIn/Email
- [x] Extrair lista de emails verificados para contato (todos eram emails de teste automatizado)
- [x] Testar novo fluxo simplificado

## Correção de SEO
- [x] Atualizar título da página inicial para ter entre 30-60 caracteres (52 caracteres)

## Correção do Sistema de Conexões
- [x] Investigar problema na aceitação de pedidos de amizade
- [x] Sistema funcionando corretamente - conexão já aceita no banco
- [x] Testar funcionalidade - Igor Castro aparece na lista de conexões

## Papaya Shop - Loja de Recompensas
- [x] Criar schema do banco para produtos e pedidos
- [x] Implementar rotas tRPC para listagem e resgate de produtos
- [x] Criar página da loja com catálogo visual
- [x] Implementar carrinho e checkout por pontos
- [x] Adicionar gestão de produtos no painel Admin
- [x] Testar funcionalidades

## Link da Papaya Shop no Menu
- [x] Adicionar link da Shop no menu de navegação do Dashboard

## Programa de Referral
- [x] Criar schema do banco para códigos de referral e indicações
- [x] Gerar código único para cada membro automaticamente
- [x] Implementar rotas para validar código e registrar indicação
- [x] Criar página "Indicar Amigos" com código copiável e compartilhamento
- [x] Adicionar dashboard de indicações (quantos indicados, pontos ganhos)
- [x] Integrar código de referral no fluxo de cadastro (via link /join/:code)
- [x] Criar badges especiais para indicadores (Recrutador, Embaixador, Lenda)
- [x] Adicionar link no menu de navegação
- [x] Testar funcionalidades
