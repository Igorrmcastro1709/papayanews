# Investigação do Fluxo de Cadastro - PapayaNews

## Descobertas

### Dados do Banco de Dados
- **Total de usuários cadastrados**: 2 (Heitor e Igor)
- **Solicitações de cadastro**: 132 total
  - 70 não verificadas (verified=0)
  - 62 verificadas (verified=1)
- **Solicitações reais (não de teste)**: 0 encontradas

### Problema Identificado

O botão "Enviar Código" no formulário de cadastro **NÃO está funcionando como esperado**. 

Ao clicar em "Enviar Código", o usuário é redirecionado para a página de login OAuth do Manus (manus.im/app-auth) em vez de receber o código de verificação por email.

### Fluxo Atual (Problemático)
1. Usuário preenche nome e email
2. Clica em "Enviar Código"
3. É redirecionado para OAuth do Manus (Google, Microsoft, Apple)
4. O código de verificação por email NÃO é enviado

### Fluxo Esperado
1. Usuário preenche nome e email
2. Clica em "Enviar Código"
3. Recebe código de verificação no email
4. Digita o código para confirmar
5. Conta é criada

### Causa Provável
O botão "Continuar com Google" (índice 15) está sendo clicado em vez do botão "Enviar Código" (índice 14), ou há um problema no handler do botão "Enviar Código".

### Descoberta Adicional
O usuário Heitor está logado via cookie httpOnly (não pode ser limpo via JavaScript). O sistema de autenticação OAuth do Manus está funcionando corretamente.

### Análise do Fluxo de Cadastro
Revisando o código Home.tsx:
1. O formulário de cadastro tem dois passos: "form" e "verify"
2. O botão "Enviar Código" chama `handleRequestCode` que usa `trpc.signup.requestCode.useMutation()`
3. Após enviar, muda para step "verify" onde o usuário digita o código
4. Após verificar, redireciona para OAuth do Manus para completar o login

### Problema Real Identificado
O fluxo de cadastro está CORRETO no código. O problema pode ser:
1. **Emails não estão sendo enviados** - A API Resend pode não estar configurada
2. **Usuários não completam a verificação** - Desistem antes de inserir o código
3. **Confusão no fluxo** - Usuários clicam em "Continuar com Google" em vez de preencher o formulário

### Ação Necessária
1. Verificar se a API Resend está configurada corretamente
2. Verificar logs de erros no envio de emails
3. Considerar simplificar o fluxo removendo a verificação por código
