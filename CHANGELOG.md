# Changelog

Resumo da evolução do app desde a criação do repositório.

Observação: pelo histórico git, o primeiro commit registrado é de **4 de maio de 2026**.

## 2026-05-08

### Editor, toolbar e escrita
- Evoluída a integração do TipTap com extração do editor para superfícies/componentes dedicados e helpers reaproveitáveis.
- Refinada a barra do editor com nova ordenação dos grupos, estados de loading mais estáveis e padronização visual entre botões nativos e botões do kit do TipTap.
- Ajustados hover, active state, ícones e dropdowns de `heading`, `list`, `table`, `blockquote`, `link`, `highlight`, `undo/redo`, `image upload` e `code block`.
- Trocado o atalho/botão de `inline code` por `code block`, incluindo estado ativo, labels e ícones coerentes na toolbar e nas settings.
- Melhorados os menus do editor com traduções completas, width/spacing consistentes, hover temático, animação de saída e correções de alinhamento em ícones e labels.
- Corrigido o comportamento de ações de tabela, incluindo foco, abertura/fechamento do menu e manipulação sem perder contexto do editor.
- Adicionados alinhamento e resize de imagem com limites mínimo/máximo, visual temático e integração mais estável do menu de imagem.
- Ajustado o fluxo do título da nota: novas notas agora focam o título no editor, e `Enter` no título move o foco para o corpo da nota.
- Ligado `Ctrl+F` / `Cmd+F` à busca interna do app.

### Sidebar, notas e UX
- Melhorado o fluxo de criação de notas tanto no botão global quanto em `Nova nota` dentro de pasta, abrindo a nota e focando o título para edição imediata.
- Refinados estados de drag and drop entre pastas, padronizando o drop target com o hover neutro da sidebar.
- Corrigidos estados visuais de menus, tooltips e interações em sidebar, toolbar e cabeçalho da nota.
- Ajustado o layout de largura das notas (`Médio` e `Completo`) para aplicar de fato no CSS via `data-note-layout`.

### Tema, tradução e consistência visual
- Atualizado o tema padrão para `Cloudy Day`.
- Corrigidos textos com encoding quebrado e labels não traduzidos em partes do editor e menus.
- Padronizadas cores temáticas em seleção, hover, drag target, upload de imagem, toolbar e componentes derivados do kit do TipTap.

### Desenvolvimento e runtime
- Melhorado o fluxo de desenvolvimento com ambiente dedicado (`dist-dev` / `.electron-dev`) e isolamento do perfil local do Electron.
- Ajustado o boot do app para manter melhor separação entre app instalado, modo dev e dados locais migrados.
- Alinhado o diretório de dados do app para `lophos-notes`, com migração do perfil legado quando necessário.

### Microsoft Store e empacotamento
- Corrigido o empacotamento `appx` para uso na Microsoft Store com manifesto alinhado ao Partner Center.
- Atualizados `Identity Name`, `Publisher` e `PublisherDisplayName` para os valores exigidos na validação do pacote.
- Ajustado o fluxo de geração dos assets do AppX para produzir recursos consistentes a partir do branding atual do app.
- Adicionado script dedicado de build para gerar automaticamente assets do AppX antes do `electron-builder`.

### Ícones, tiles e taskbar
- Corrigida a reprovação de tiles padrão da Store substituindo assets de exemplo por assets reais do produto.
- Gerados assets `targetsize-*` com variantes `altform-unplated` e `altform-lightunplated`, corrigindo o backplate indevido do ícone na barra de tarefas.
- Regenerados os assets de ícone do Windows e o `icon.ico` multirresolução para melhorar o comportamento do shell.
- Validado localmente o comportamento final de ícone em instalador, Start e taskbar no pacote `0.2.4`.

### Inicialização e estabilidade do pacote
- Ajustada a janela principal do Electron para abrir com `show: false` e só aparecer quando o renderer estiver pronto.
- Adicionados handlers de diagnóstico para `did-fail-load`, `render-process-gone` e `unresponsive` no processo principal.
- Reduzida a percepção de tela branca na abertura do app empacotado.
- Revalidado o fluxo principal de criação de nota no app instalado via `appx`.

### Commits
- `423ab1f` - Polish editor UX and release workflow

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
