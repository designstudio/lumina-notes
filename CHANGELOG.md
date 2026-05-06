# Changelog

Resumo da evolução do app desde a criação do repositório.

Observação: pelo histórico git, o primeiro commit registrado é de **4 de maio de 2026**.

## 2026-05-06

### Produto e interface
- Consolidado o rebranding de `Lumina Notes` para `Lophos Notes` em interface, assets e conteúdo padrão.
- Evoluída a internacionalização em `pt-BR` e `en-US`, cobrindo settings, menus, tooltips, confirmações e conteúdo inicial.
- Atualizada a nota padrão de onboarding para `Boas-vindas`, com tratamento de variantes legadas sem sobrescrever conteúdo editado pelo usuário.
- Refinados dark mode, titlebar custom, branding e consistência visual geral do app.

### Settings e personalização
- Reestruturada a tela de `Configurações` com layout dedicado, header sticky e organização full-width.
- Adicionados controles de idioma, aparência, temas, localização das notas, dados, versão e barra do editor.
- Implementado sistema de temas visuais com múltiplas paletas e aplicação expandida em estados ativos, blockquotes, toolbar e checklist.
- Adicionado ajuste de largura das notas com modos `Medium` e `Full`.

### Editor e escrita
- Adicionado suporte a tabelas com `TableKit`, incluindo inserção e ações de manipulação.
- Tornada a barra do editor configurável via `Settings`.
- Restaurado o funcionamento correto de `Task List`, `undo/redo` por nota e controles de `Separator` e `Text align`.
- Corrigido o sync de draft durante digitação, eliminando falhas como perda de espaços e atualizações fora de hora.
- Extraída a área do editor para um componente dedicado (`NoteEditorPane`).

### Navegação, menus e modais
- Refinada a sidebar em alinhamento, spacing, estados recolhidos e navegação.
- Melhorada a busca com modal dedicada, foco automático e revisão de layout.
- Implementado menu `Mais` no cabeçalho da nota com exportação, pin, mover e exclusão.
- Substituídas caixas nativas do sistema por modais internas para exclusão de pasta e nota.
- Refinadas animações e comportamento dos menus contextuais e overlays.

### Dados, exportação e segurança
- Adicionados `Export data` e `Clear data` em `Settings`.
- Implementada exportação para Markdown com conversão real do HTML do editor.
- Implementada exportação para PDF com fluxo dedicado no Electron.
- Endurecida a exportação para PDF com sanitização explícita de HTML, restrição de protocolos e bloqueio de atributos perigosos.
- Revisado o tratamento de imagens para manter casos válidos sem reabrir a superfície de risco anterior.

### Performance, arquitetura e estabilidade
- Refatorado o renderer para dividir `App.tsx` em componentes dedicados para editor, sidebar, settings e modais.
- Separado o modelo compartilhado em módulos focados (`app-defaults.ts`, `app-types.ts`, `note-utils.ts`).
- Melhorada a estrutura de chunks do renderer.
- Reduzidas recomputações globais em busca e sidebar.
- Melhorado o fluxo de persistência com draft local e autosave com debounce.
- Corrigidas regressões de tela branca, imports ausentes, referências quebradas e estados intermediários instáveis.
- Ajustada a restauração da última nota e pasta abertas no reload do app.

### Commits
- `d289aa9` - Polish note layout and settings UI
- `979393c` - Split app model into focused modules
- `a28628b` - Extract shared app model helpers
- `3f3d95c` - Refactor renderer structure and stabilize app

## 2026-05-05

### Estrutura e base do projeto
- Limpos artefatos locais do repositório.
- Adicionadas bases de internacionalização em `pt-BR` e `en-US`.
- Expandida a identidade visual e os assets do app para Windows, macOS e Linux.
- Adicionado suporte a extensões do editor, incluindo `callout`.
- Evoluída de forma ampla a interface, os estilos e a estrutura do app.

### Commit
- `719cfe9` - Remove local artifacts from repository

## 2026-05-04

### Fundação do app
- Criado o app com Electron, React e Vite.
- Estruturados build, preload, ambiente de desenvolvimento e dados demo iniciais.
- Publicado o projeto no GitHub em `designstudio/lumina-notes`.

### Layout e navegação
- Refeito o layout principal com sidebar fixa, header fixo e área de nota centralizada.
- Implementados toggle de sidebar, disclosure sections e navegação inicial de notas.
- Refinados alinhamentos, truncamento, hover states e comportamento de scroll.

### Interações e organização de notas
- Integrada a biblioteca `@untitledui/icons`.
- Implementados menu contextual das notas, submenu `Mover para` e fluxo de fixar nota.
- Adicionado gerenciamento de pastas e reorganização visual das listas.

### Editor e runtime
- Implementado editor rico para notas.
- Evoluído o armazenamento local e a integração entre renderer e processo principal.
- Corrigidos problemas iniciais de tela branca, paths de assets e carregamento do renderer no Electron.
- Validado o empacotamento Windows e preparada a base distribuível.

### Commits
- `86e9843` - Implement rich text notes editor and folder management
- `987bb98` - Initial Lumina Notes app
