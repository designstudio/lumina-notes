# Lumina Notes

App desktop de notas inspirado no Apple Notes e no Soba, com foco em uma interface elegante e pronta para distribuição na Microsoft Store.

## Stack

- Electron
- React
- TypeScript
- Vite
- electron-builder com alvo `appx`

## Rodando localmente

```bash
cmd /c npm install
cmd /c npm run dev
```

## Build para Windows Store

```bash
cmd /c npm run build
```

O `electron-builder` está configurado para gerar pacote `appx`, que é uma das rotas aceitas pela Microsoft Store para apps desktop Win32.

## Próximos passos recomendados

1. Persistir notas em arquivos locais ou SQLite.
2. Adicionar anexos, imagens e markdown rico.
3. Trocar dados demo por criação/edição completa de pastas e notas.
4. Criar ícones e assets da Store.
5. Ajustar identidade/publisher no `build.appx` antes da publicação.
