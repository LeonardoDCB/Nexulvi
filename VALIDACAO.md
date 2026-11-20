# Validação da reformulação

## Evidências locais

Validação local antes do envio para `main`; o workflow de Pages publica automaticamente após os testes.

### Build e regressões

- `npm run build`: concluído, artefato em `dist/`.
- `npm test`: 6 testes aprovados.
- Metadados, H1 único e canonical das páginas comerciais.
- JSON-LD parseável e sem avaliações inventadas.
- Existência de todos os recursos e links internos, inclusive âncoras, em todas as páginas geradas.
- Inventário dos cinco produtos e conteúdo pré-renderizado nas 16 variantes de idioma.
- Sitemap com URLs únicas, existentes e indexáveis.
- Contato alternativo real e número de WhatsApp informado configurado; links contextuais verificados sem enviar mensagens.
- Portfólio de Amanda Pet Sitter autorizado pelo responsável, com captura verdadeira, imagem local e sem métricas inventadas.
- Home reformulada com foco em sites profissionais, projeto autorizado na primeira dobra e CTA contextual para orçamento.
- Página de criação de sites com formatos de uma página e institucional, escopo, custos recorrentes e itens que o cliente pode preparar.
- Tipografia ampliada e paleta de maior contraste na home, catálogo, serviços e páginas compartilhadas dos aplicativos.
- Build e testes também executados com fixture reservada `https://nexulvi.test/`, na raiz, em uma pasta de teste separada. O domínio de produção permanece o GitHub Pages.
- `npm audit --omit=dev` e `npm audit --json`: nenhuma vulnerabilidade reportada na execução, incluindo ferramentas de desenvolvimento na segunda checagem.
- `git diff --check`: sem erros de whitespace.

### Navegador e acessibilidade

Chrome 157 instalado, controlado via Playwright; axe-core 4.14.0.

- Home em **360, 390, 768, 1024 e 1440 px**, temas claro e escuro.
- Nenhum overflow horizontal detectado nessas combinações.
- Nenhuma violação detectada pelo axe na home nessas combinações.
- Verificações axe adicionais em serviços, criação de sites, contato, privacidade, catálogo e cinco páginas de aplicativo, a 390 px.
- Menu abre/fecha, Escape retorna foco ao botão e links navegam.
- Tema persiste após recarregamento.
- FAQ nativo abre corretamente.
- Seletor leva ao catálogo em inglês e retorna ao catálogo em português.
- Rotas de 17 páginas verificadas no navegador, incluindo os cinco aplicativos e páginas localizadas.
- Home sem erros de console, erros JavaScript ou recursos HTTP ausentes durante o teste.
- Pular para conteúdo verificado por teclado.
- Sitemap aberto sem erro de parser XML.
- 404 aninhada mantém recursos e link de retorno válido.
- Conteúdo comercial e de produto verificado com JavaScript desabilitado.
- Capturas reais examinadas para desktop/mobile e temas.

Relatório completo: `test-results/browser-report.json`. Capturas: `test-results/home-*.png` e `hero-*.png`. Esses artefatos locais não são publicados nem versionados.

### Lighthouse — home mobile

Lighthouse **13.6.0**, Chrome headless 157, build local em:

`http://127.0.0.1:4173/Nexulvi/`

Configuração padrão mobile: 412×823, RTT simulado de 150 ms, throughput de 1638,4 Kbps e redução de CPU de 4×.

Medição após o aumento tipográfico e a paleta de maior contraste, em **2026-11-20T15:31:08Z**:

| Categoria | Pontuação |
|---|---:|
| Performance | **97** |
| Acessibilidade | **100** |
| Boas práticas | **100** |
| SEO | **100** |

FCP **1,4 s**, LCP **1,4 s**, TBT **180 ms**, CLS **0,013** e Speed Index **1,4 s**. Relatórios: `test-results/lighthouse-home-readable.report.html` e `.report.json`.

A página **`criacao-de-sites.html`** foi medida na mesma execução, em **2026-11-20T15:31:47Z**: **100/100/100/100**, LCP **1,2 s**, TBT **0 ms** e CLS **0,011**. Relatórios em `test-results/lighthouse-sites-readable.report.html` e `.report.json`.

O screenshot WebP local tem 38 KB; com `fetchpriority="high"`, é o elemento principal da primeira dobra. A primeira versão JPEG elevou o custo de carregamento; após redimensionamento e conversão, a pontuação real da home subiu para 97. Valores de Lighthouse variam e não representam garantia para todo dispositivo.

Reproduzir com preview aberto:

```powershell
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npx --no-install lighthouse http://127.0.0.1:4173/Nexulvi/ --quiet --chrome-flags="--headless --no-first-run" --only-categories=performance,accessibility,best-practices,seo --output=json --output=html --output-path=./test-results/lighthouse-home-mobile
```

## Limitações e pendências

- Não há dados de campo/CrUX nem INP real de visitantes. TBT não é INP.
- A pontuação acima é da **home local**, não da URL pública, nem uma pontuação atribuída a todas as páginas antigas.
- O preview usa `Cache-Control: no-store` e não comprime respostas; o Pages determina esses comportamentos em produção. Repetir testes após publicação.
- Testes de largura em Chrome não substituem testes físicos em iOS, Android e diferentes navegadores, nem uma auditoria manual completa com leitores de tela.
- JSON-LD foi validado sintaticamente e quanto à coerência dos dados; inspeção do Google, Schema Validator e testes públicos dependem da publicação. SEO 100 não garante indexação ou posicionamento.
- WhatsApp configurado com o número informado pelo responsável; nenhuma mensagem foi enviada.
- Amanda Pet Sitter autorizado pelo responsável para divulgação; captura real de 117 KB incorporada e testada no navegador.
- Novas páginas comerciais ainda não foram traduzidas; o catálogo traduzido anterior está preservado.
- Confirmar redes oficiais e, se desejado, o token público do Search Console.
- Política institucional deve ser revisada pelo responsável antes da publicação, especialmente quando a operação/analytics mudar. As políticas existentes dos apps não foram reescritas nem declaradas juridicamente validadas.
- A instalação inicial das ferramentas foi interrompida por falta temporária de espaço; a instalação posterior e os testes foram concluídos.
