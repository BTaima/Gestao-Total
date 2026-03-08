

## Plano: Criar Tabelas Faltantes no Supabase

### Analise do Estado Atual

**Tabelas que ja existem:**
- `profiles` - dados do usuario
- `user_roles` - roles (admin/profissional/cliente)
- `estabelecimentos` - com codigo_acesso
- `profissionais` - com comissao, horario_trabalho
- `clientes` - dados completos
- `servicos` - catalogo de servicos
- `agendamentos` - com status, valor, duracao
- `transacoes` - receitas e despesas
- `lembretes` - sistema de lembretes
- `bloqueios` - bloqueios de horario
- `lista_espera` - fila de espera
- `avaliacoes` - notas e comentarios
- `notificacoes` - sistema de notificacoes
- `vinculos_cliente` - vinculo cliente-estabelecimento

**Tabelas que faltam para o sistema completo:**

1. **`mensagens`** - Sistema de chat entre cliente e profissional
2. **`cupons`** - Cupons de desconto enviados aos clientes
3. **`convites`** - Codigos de convite para profissionais se vincularem
4. **`comissoes_servico`** - Configuracao de % comissao por profissional/servico
5. **`politicas_cancelamento`** - Regras de cancelamento por estabelecimento
6. **`solicitacoes_agendamento`** - Sugestoes de horario do cliente (3 opcoes)
7. **`servico_fotos`** - Fotos adicionais dos servicos (catalogo estilo iFood)

### Migration SQL

Uma unica migration criara todas as 7 tabelas com:

**1. `mensagens`**
- id, remetente_id (user), destinatario_id (user), estabelecimento_id, conteudo, lida, created_at
- RLS: usuario so ve mensagens onde e remetente ou destinatario

**2. `cupons`**
- id, estabelecimento_id, codigo, descricao, tipo_desconto (percentual/fixo), valor_desconto, validade, ativo, uso_maximo, uso_atual, created_at
- RLS: admin do estabelecimento gerencia, clientes vinculados podem ver ativos

**3. `convites`**
- id, estabelecimento_id, codigo, tipo (profissional/cliente), usado_por (user_id nullable), usado_em, expira_em, ativo, created_at
- RLS: admin cria, qualquer autenticado pode ler para validar

**4. `comissoes_servico`**
- id, estabelecimento_id, profissional_id, servico_id, percentual_comissao, valor_fixo (nullable), created_at
- RLS: admin do estabelecimento gerencia

**5. `politicas_cancelamento`**
- id, estabelecimento_id, horas_minimas_antecedencia, valor_multa, percentual_multa, mensagem_aviso, ativa, created_at
- RLS: admin gerencia, clientes vinculados podem ler

**6. `solicitacoes_agendamento`**
- id, cliente_user_id, estabelecimento_id, servico_id, profissional_id (nullable), opcao_horario_1, opcao_horario_2, opcao_horario_3, horario_aceito, status (pendente/aceito/rejeitado), observacoes, created_at
- RLS: cliente cria, profissional/admin do estabelecimento gerencia

**7. `servico_fotos`**
- id, servico_id, url, ordem, descricao, created_at
- RLS: segue permissoes do servico

### Alteracoes em Tabelas Existentes

- **`servicos`**: adicionar colunas `foto_principal TEXT`, `destaque BOOLEAN DEFAULT false`, `visivel BOOLEAN DEFAULT true`, `custo_operacional NUMERIC DEFAULT 0`, `aprovado BOOLEAN DEFAULT true`
- **`profissionais`**: adicionar `codigo_convite_usado TEXT` para rastrear qual convite usou

### RLS Policies

Todas as tabelas terao RLS habilitado usando a funcao `has_role()` ja existente para verificar permissoes. Policies baseadas em:
- Admin: acesso total ao seu estabelecimento
- Profissional: acesso aos proprios dados dentro do estabelecimento
- Cliente: acesso de leitura a servicos/politicas, escrita em solicitacoes/mensagens

### Atualizacao do Codigo

Apos a migration:
1. Adicionar tipos TypeScript em `src/types/index.ts` para as novas tabelas
2. Adicionar funcoes CRUD no `AppContext.tsx` para mensagens, cupons, convites, solicitacoes
3. As paginas de UI ja existentes poderao consumir os novos dados

### Ordem de Execucao

1. Executar migration SQL (uma unica migration com todas as tabelas + RLS)
2. Atualizar tipos TypeScript
3. Adicionar funcoes no contexto para as novas entidades

