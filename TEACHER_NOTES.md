# Notas do professor — Performance Lab

> Não entregue este arquivo aos alunos antes da atividade.

## Comportamentos intencionais

### 1. Feedback inicial atrasado
Após clicar em **Aplicar filtros**, o loading só aparece depois de ~650 ms.

**Objetivo:** discutir responsividade percebida e feedback da interface.

### 2. Trabalho síncrono na main thread antes da requisição
A função `busyMainThread()` bloqueia a thread por aproximadamente 320 ms antes do `fetch()`.

**Onde investigar:** Performance + Network.

**Objetivo:** mostrar que uma requisição que começa tarde não prova que a rede ou o servidor são responsáveis.

### 3. Atraso após a resposta
Depois do `fetch()`, existe uma espera adicional antes da renderização dos resultados.

**Objetivo:** separar tempo de rede de tempo até resultados utilizáveis.

### 4. Imagens iniciadas de forma escalonada
Os `src` das imagens são atribuídos depois da renderização.

**Objetivo:** observar waterfall e carregamento progressivo.

### 5. Banner inserido tardiamente
Um banner é inserido acima dos resultados após ~2,4 s, causando deslocamento da página.

**Objetivo:** discutir estabilidade visual e CLS.

### 6. Marcações de performance
O fluxo cria `performance.mark()` e `performance.measure()` para:

- `tempo-ate-feedback`
- `tempo-antes-request`
- `tempo-request`
- `tempo-ate-resultados`

Os alunos podem consultar no Console:

```js
performance.getEntriesByType('measure')
```

## Possíveis intervenções

Não aplique todas de uma vez se a intenção for comparar efeitos.

- mostrar feedback imediatamente;
- remover ou dividir o trabalho síncrono;
- iniciar a requisição antes;
- reservar espaço para conteúdo tardio;
- eliminar atraso artificial após a resposta;
- carregar imagens com estratégia coerente com prioridade;
- comparar baseline e versão modificada nas mesmas condições.
