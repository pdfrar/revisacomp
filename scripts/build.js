// Gera o site em dist/ a partir de conteudo/ e public/.
// Uso: node scripts/build.js          (gera o site)
//      node scripts/build.js --check  (só confere o conteúdo, sem gerar)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTEUDO = path.join(ROOT, "conteudo");
const DIST = path.join(ROOT, "dist");
const CHECK_ONLY = process.argv.includes("--check");

const erros = [];
const avisos = [];
const erro = (onde, msg) => erros.push(`✘ ${onde}: ${msg}`);
const aviso = (onde, msg) => avisos.push(`! ${onde}: ${msg}`);

/* ---------------- Markdown ---------------- */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const md = new Marked({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      const plain = lang && lang !== "python" && lang !== "py";
      return `<pre class="code"${plain ? ' data-hl="1"' : ""}>${esc(text)}</pre>\n`;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const ext = /^https?:\/\//.test(href);
      return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ""}${ext ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`;
    },
    table(token) {
      // embrulha tabelas para rolar no celular
      const head = token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join("");
      const body = token.rows.map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join("")}</tr>`).join("\n");
      return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>\n`;
    },
  },
});
const block = (s) => md.parse(String(s ?? ""));
const inline = (s) => md.parseInline(String(s ?? ""));

// Blocos especiais  :::nome Título opcional  …  :::
function directives(src) {
  const lines = src.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^:::\s*([a-zç]+)\s*(.*)$/.exec(lines[i]);
    if (!m) { out.push(lines[i]); continue; }
    const [, nome, arg] = m;
    const body = [];
    i++;
    while (i < lines.length && !/^:::\s*$/.test(lines[i])) body.push(lines[i++]);
    out.push("", renderDirective(nome, arg.trim(), body.join("\n")), "");
  }
  return out.join("\n");
}

function renderDirective(nome, arg, body) {
  switch (nome) {
    case "lembrar":
      return `<div class="remember"><b>${esc(arg || "Para lembrar")}</b>${block(body)}</div>`;
    case "atencao":
      return `<div class="warn"><b>${esc(arg || "Atenção")}</b>${block(body)}</div>`;
    case "pensar":
      return `<div class="pensar"><b>${esc(arg || "Para pensar")}</b>${block(body)}</div>`;
    case "extra":
      return `<div class="extra-box"><b>${esc(arg || "Treino extra")}</b>${block(body)}</div>`;
    case "console":
      return `<div class="console">${esc(body.replace(/^\n+|\s+$/g, ""))}</div>`;
    case "cards": {
      const parts = body.split(/^### /m).filter((p) => p.trim());
      const cards = parts.map((p) => {
        const [t, ...rest] = p.split("\n");
        return `<div class="card"><h4>${inline(t.trim())}</h4>${block(rest.join("\n"))}</div>`;
      });
      const cols = cards.length >= 4 ? "grid-4" : cards.length === 3 ? "grid-3" : "grid-2";
      return `<div class="grid ${cols} cards-grid">${cards.join("")}</div>`;
    }
    case "fluxo": {
      const steps = body.split("\n").filter((l) => l.trim()).map((l) => {
        const [tag, ...txt] = l.split("|");
        return `<div class="step"><span class="tag">${inline(tag.trim())}</span>${block(txt.join("|").trim())}</div>`;
      });
      return `<div class="flow">${steps.join('<div class="arrow" aria-hidden="true">➔</div>')}</div>`;
    }
    default:
      return `<div class="warn"><b>Bloco desconhecido: ${esc(nome)}</b>${block(body)}</div>`;
  }
}

function slugify(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function frontmatter(src, onde) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src);
  if (!m) { erro(onde, "falta o cabeçalho entre --- no início do arquivo"); return { meta: {}, body: src }; }
  const meta = {};
  m[1].split("\n").forEach((l) => {
    const k = /^([a-zA-Z_]+):\s*(.*)$/.exec(l);
    if (k) meta[k[1]] = k[2].trim();
  });
  return { meta, body: src.slice(m[0].length) };
}

// Divide a explicação em seções a partir dos títulos "## "
function sections(body) {
  const parts = body.split(/^## /m);
  const intro = parts.shift();
  return {
    intro: intro.trim() ? block(directives(intro)) : "",
    list: parts.map((p) => {
      const [title, ...rest] = p.split("\n");
      const t = title.trim();
      return { id: slugify(t), title: t, html: block(directives(rest.join("\n"))) };
    }),
  };
}

/* ---------------- Leitura do conteúdo ---------------- */
const readJSON = (f, onde) => {
  try { return JSON.parse(fs.readFileSync(f, "utf8")); }
  catch (e) { erro(onde, `JSON inválido (${e.message})`); return null; }
};

const series = readJSON(path.join(CONTEUDO, "series.json"), "conteudo/series.json") || [];
const serieById = Object.fromEntries(series.map((s) => [s.id, s]));

const INLINE_FIELDS = new Set(["titulo", "dica", "texto", "porque", "pergunta", "opcoes", "explicacao", "passos", "fim", "rotulo", "curto", "descricao", "nota", "notaErro", "selo", "rotulos", "rotuloResposta"]);
const BLOCK_FIELDS = new Set(["enunciado", "solucao"]);
function renderFields(x, key) {
  if (Array.isArray(x)) return x.map((v) => renderFields(v, key));
  if (x && typeof x === "object") {
    const o = {};
    for (const k of Object.keys(x)) o[k] = renderFields(x[k], k);
    return o;
  }
  if (typeof x === "string") {
    if (BLOCK_FIELDS.has(key)) return block(x);
    if (INLINE_FIELDS.has(key)) return inline(x);
  }
  return x;
}

const assuntos = [];
const dirAssuntos = path.join(CONTEUDO, "assuntos");
for (const serie of fs.existsSync(dirAssuntos) ? fs.readdirSync(dirAssuntos).sort() : []) {
  if (!serieById[serie]) { erro(`conteudo/assuntos/${serie}`, "série não está em series.json"); continue; }
  for (const slug of fs.readdirSync(path.join(dirAssuntos, serie)).sort()) {
    const dir = path.join(dirAssuntos, serie, slug);
    if (!fs.statSync(dir).isDirectory()) continue;
    const onde = `conteudo/assuntos/${serie}/${slug}`;
    const mdFile = path.join(dir, "assunto.md");
    if (!fs.existsSync(mdFile)) { erro(onde, "falta o arquivo assunto.md"); continue; }
    const { meta, body } = frontmatter(fs.readFileSync(mdFile, "utf8"), `${onde}/assunto.md`);
    if (!meta.titulo) erro(`${onde}/assunto.md`, "falta 'titulo:' no cabeçalho");
    if (meta.rascunho === "sim") { aviso(onde, "rascunho: não será publicado"); continue; }
    const atvFile = path.join(dir, "atividades.json");
    const bancoFile = path.join(dir, "banco.json");
    const atividades = fs.existsSync(atvFile) ? readJSON(atvFile, `${onde}/atividades.json`) || [] : [];
    const banco = fs.existsSync(bancoFile) ? readJSON(bancoFile, `${onde}/banco.json`) || [] : [];
    validarAtividades(atividades, `${onde}/atividades.json`);
    validarBanco(banco, `${onde}/banco.json`);
    assuntos.push({
      id: `${serie}/${slug}`, serie, slug, url: `/${serie}/${slug}`,
      meta, ordem: Number(meta.ordem || 99), body, atividades, banco,
    });
  }
}
assuntos.sort((a, b) => a.serie.localeCompare(b.serie) || a.ordem - b.ordem || a.slug.localeCompare(b.slug));
const assuntoById = Object.fromEntries(assuntos.map((a) => [a.id, a]));

const provas = [];
const dirProvas = path.join(CONTEUDO, "provas");
for (const serie of fs.existsSync(dirProvas) ? fs.readdirSync(dirProvas).sort() : []) {
  if (!serieById[serie]) { erro(`conteudo/provas/${serie}`, "série não está em series.json"); continue; }
  for (const f of fs.readdirSync(path.join(dirProvas, serie)).filter((f) => f.endsWith(".json")).sort()) {
    const slug = f.replace(/\.json$/, "");
    const onde = `conteudo/provas/${serie}/${f}`;
    const p = readJSON(path.join(dirProvas, serie, f), onde);
    if (!p) continue;
    if (!p.titulo) erro(onde, "falta \"titulo\"");
    if (p.data && !/^\d{4}-\d{2}-\d{2}$/.test(p.data)) erro(onde, "\"data\" deve ser no formato \"AAAA-MM-DD\" (ou null)");
    if (!Array.isArray(p.assuntos) || !p.assuntos.length) erro(onde, "\"assuntos\" deve ser uma lista com pelo menos um assunto");
    (p.assuntos || []).forEach((x) => {
      const a = assuntoById[x.id];
      if (!a) return erro(onde, `assunto "${x.id}" não existe (use "serie/pasta", ex.: "6ano/eps")`);
      if (!x.questoes || x.questoes < 1) erro(onde, `"questoes" de ${x.id} deve ser 1 ou mais`);
      else if (x.questoes > a.banco.length) aviso(onde, `${x.id} pede ${x.questoes} questões, mas o banco só tem ${a.banco.length}`);
    });
    if (assuntoById[`${serie}/${slug}`]) erro(onde, `já existe um assunto com o mesmo nome de pasta (${slug})`);
    provas.push({ ...p, id: `${serie}/${slug}`, serie, slug, url: `/${serie}/${slug}` });
  }
}

function validarBanco(banco, onde) {
  if (!Array.isArray(banco)) return erro(onde, "o banco deve ser uma lista [ ... ]");
  banco.forEach((q, i) => {
    if (!q.pergunta) erro(onde, `questão ${i + 1} sem "pergunta"`);
    if (!Array.isArray(q.opcoes) || q.opcoes.length < 2) erro(onde, `questão ${i + 1} precisa de pelo menos 2 "opcoes"`);
    else if (new Set(q.opcoes).size !== q.opcoes.length) erro(onde, `questão ${i + 1} tem opções repetidas`);
    if (!q.explicacao) aviso(onde, `questão ${i + 1} sem "explicacao"`);
  });
}
function validarAtividades(atvs, onde) {
  if (!Array.isArray(atvs)) return erro(onde, "as atividades devem ser uma lista [ ... ]");
  const tipos = ["classificar", "ordenar", "pacotes", "dns", "terminal", "tarefa", "quiz"];
  atvs.forEach((a, i) => {
    const w = `${onde} (atividade ${i + 1})`;
    if (!tipos.includes(a.tipo)) return erro(w, `tipo "${a.tipo}" não existe. Tipos: ${tipos.join(", ")}`);
    if (!a.titulo) erro(w, "falta \"titulo\"");
    if (a.tipo === "classificar") {
      const ids = new Set((a.categorias || []).map((c) => c.id));
      (a.itens || []).forEach((it, j) => { if (!ids.has(it.resposta)) erro(w, `item ${j + 1}: resposta "${it.resposta}" não é uma das categorias`); });
    }
    if (a.tipo === "ordenar") (a.cenarios || []).forEach((c, j) => {
      if (a.rotulos && a.rotulos.length !== c.passos.length) erro(w, `cenário ${j + 1}: número de passos diferente do número de rótulos`);
    });
    if (a.tipo === "quiz") validarBanco(a.questoes || [], w);
  });
}

/* ---------------- Layout ---------------- */
const seriesComConteudo = series.filter((s) => assuntos.some((a) => a.serie === s.id));
const DEFAULT_ACCENT = "#3d5a80";
const safeJSON = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

function layout({ title, description = "", accent = DEFAULT_ACCENT, active = "", body, data, icon = "📘" }) {
  const nav = [`<a href="/"${active === "" ? ' aria-current="page"' : ""}>Início</a>`]
    .concat(seriesComConteudo.map((s) => `<a href="/${s.id}"${active === s.id ? ' aria-current="page"' : ""}>${esc(s.curto || s.nome)}</a>`))
    .join("\n      ");
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">\n` : ""}<meta name="theme-color" content="${accent}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${icon}</text></svg>">
<link rel="stylesheet" href="/assets/style.css">
<script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body style="--accent:${accent}">
<header class="topbar">
  <div class="topbar-inner">
    <a class="brand" href="/">Revisa Comp</a>
    <nav>
      ${nav}
    </nav>
  </div>
</header>
<main>
${body}
</main>
<footer>Revisa Comp · revisão de Computação para prova</footer>
${data ? `<script>window.PAGINA = ${safeJSON(data)};</script>\n` : ""}<script src="/assets/app.js"></script>
</body>
</html>
`;
}

const crumbs = (items) =>
  `<nav class="crumbs" aria-label="Você está em">${items.map(([t, u]) => (u ? `<a href="${u}">${esc(t)}</a>` : `<span>${esc(t)}</span>`)).join('<span aria-hidden="true">›</span>')}</nav>`;

function fmtData(d) {
  if (!d) return "Data a definir";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

function provaCard(p, destaque) {
  const n = p.assuntos.length;
  const q = p.assuntos.reduce((s, x) => s + (x.questoes || 0), 0);
  if (destaque) {
    return `<a class="prova-destaque" href="${p.url}" data-prova data-data="${p.data || ""}">
  <p class="kicker">Próxima prova · ${esc(fmtData(p.data))}</p>
  <h3>${esc(p.titulo)}</h3>
  <p>${n} assunto(s) · simulado com ${q} questões sorteadas</p>
  <span class="cta">Estudar para esta prova →</span>
</a>`;
  }
  return `<a class="item-card" href="${p.url}" data-prova data-data="${p.data || ""}">
  <h3>${esc(p.titulo)}</h3>
  <p>${esc(fmtData(p.data))} · ${n} assunto(s) · ${q} questões no simulado</p>
</a>`;
}

function assuntoCard(a) {
  return `<a class="item-card" href="${a.url}">
  <h3>${esc(a.meta.icone ? a.meta.icone + " " : "")}${esc(a.meta.titulo)}</h3>
  ${a.meta.resumo ? `<p>${esc(a.meta.resumo)}</p>` : ""}
  <span class="prog" data-progresso="${a.id}"></span>
</a>`;
}

// As provas são reorganizadas no navegador (próxima × anteriores) pela data de hoje.
const PROVAS_SCRIPT = `<script>
(function () {
  var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  var prox = document.getElementById("provas-proximas"), ant = document.getElementById("provas-anteriores");
  if (!prox) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll("#provas-todas [data-prova]"));
  function quando(c) { var d = c.getAttribute("data-data"); if (!d) return null; var p = d.split("-"); return new Date(+p[0], p[1] - 1, +p[2]); }
  var futuras = cards.filter(function (c) { var d = quando(c); return !d || d >= hoje; });
  var passadas = cards.filter(function (c) { var d = quando(c); return d && d < hoje; });
  futuras.sort(function (a, b) { var x = quando(a), y = quando(b); return (x ? x : 9e15) - (y ? y : 9e15); });
  passadas.sort(function (a, b) { return quando(b) - quando(a); });
  function simples(c, cls) {
    c.className = cls;
    var k = c.querySelector(".kicker"); if (k) k.textContent = k.textContent.replace("Próxima prova · ", "");
    var cta = c.querySelector(".cta"); if (cta) cta.remove();
  }
  futuras.forEach(function (c, i) { if (i > 0) simples(c, "item-card"); prox.appendChild(c); });
  passadas.forEach(function (c) { simples(c, "item-card past"); ant.appendChild(c); });
  document.getElementById("bloco-proximas").hidden = !futuras.length;
  document.getElementById("bloco-anteriores").hidden = !passadas.length;
})();
</script>`;

/* ---------------- Páginas ---------------- */
const pages = {};

// Início
{
  const cards = seriesComConteudo.map((s) => {
    const n = assuntos.filter((a) => a.serie === s.id).length;
    const np = provas.filter((p) => p.serie === s.id).length;
    return `<a class="topic serie-card" href="/${s.id}" style="--sc:${s.cor}">
  <p class="kicker">${esc(s.etapa || "")}</p>
  <h2>${esc(s.nome)}</h2>
  <p>${n} assunto(s)${np ? ` · ${np} prova(s)` : ""}</p>
</a>`;
  }).join("\n");
  pages["index.html"] = layout({
    title: "Revisa Comp · revisão de Computação para prova",
    description: "Biblioteca de revisão de Computação: explicações curtas, atividades interativas e simulados para estudar para a prova.",
    body: `<div class="hero">
  <p class="kicker">Computação</p>
  <h1>Revisa Comp</h1>
  <p class="lead">Explicações curtas, atividades para treinar e simulados para chegar na prova sabendo. Escolha a sua série.</p>
</div>
<div class="topics">
${cards}
</div>
<h2>Como estudar</h2>
<ol class="steps-list">
  <li>Entre na sua série e abra a <b>próxima prova</b>. Lá estão os assuntos que vão cair.</li>
  <li>Em cada assunto, <b>leia a explicação</b> e faça as <b>atividades</b>. Quando errar, leia a explicação da resposta.</li>
  <li>Faça o <b>simulado</b> da prova. Se ficar abaixo de 70% em algum assunto, volte nele.</li>
  <li>Seu progresso fica salvo <b>neste aparelho</b>. Pode parar e continuar depois.</li>
</ol>
<p style="margin-top:28px"><button type="button" class="btn-ghost" id="reset-progresso">Apagar meu progresso</button></p>`,
  });
}

// Séries
for (const s of seriesComConteudo) {
  const as = assuntos.filter((a) => a.serie === s.id);
  const ps = provas.filter((p) => p.serie === s.id);
  const provasHtml = ps.map((p) => provaCard(p, true)).join("\n");
  pages[`${s.id}.html`] = layout({
    title: `${s.nome} · Revisa Comp`,
    description: `Revisão de Computação do ${s.nome}: assuntos, atividades e simulados.`,
    accent: s.cor, active: s.id,
    body: `${crumbs([["Início", "/"], [s.nome]])}
<div class="hero">
  <p class="kicker">${esc(s.etapa || "Computação")}</p>
  <h1>${esc(s.nome)}</h1>
  <p class="lead">Escolha a prova que vem aí ou estude um assunto.</p>
</div>
<div id="provas-todas" hidden>${provasHtml}</div>
<section id="bloco-proximas" hidden>
  <h2>Provas</h2>
  <div id="provas-proximas" class="list-cards"></div>
</section>
<section>
  <h2>Assuntos</h2>
  <div class="list-cards">
${as.map(assuntoCard).join("\n")}
  </div>
</section>
<section id="bloco-anteriores" hidden>
  <h2>Provas anteriores</h2>
  <div id="provas-anteriores" class="list-cards"></div>
</section>
${PROVAS_SCRIPT}`,
  });
}

// Assuntos
for (const a of assuntos) {
  const s = serieById[a.serie];
  const sec = sections(a.body);
  const atividades = renderFields(a.atividades);
  const banco = renderFields(a.banco);
  const usadoEm = provas.filter((p) => p.assuntos.some((x) => x.id === a.id));
  const irmaos = assuntos.filter((x) => x.serie === a.serie);
  const i = irmaos.indexOf(a);
  const prev = irmaos[i - 1], next = irmaos[i + 1];
  const temPratica = atividades.length || banco.length;
  const toc = sec.list.map((x) => `<li><a href="#${x.id}">${esc(x.title)}</a></li>`).join("")
    + (temPratica ? '<li><a href="#praticar">Atividades</a></li>' : "");
  const pills = [`<span class="tag-pill accent">${esc(s.nome)}</span>`]
    .concat(a.meta.bncc ? a.meta.bncc.split(",").map((b) => `<span class="tag-pill">BNCC ${esc(b.trim())}</span>`) : []);

  pages[`${a.serie}/${a.slug}.html`] = layout({
    title: `${a.meta.titulo} · ${s.nome} · Revisa Comp`,
    description: a.meta.resumo || "",
    accent: s.cor, active: a.serie, icon: a.meta.icone || "📘",
    data: { tipo: "assunto", id: a.id, atividades, banco },
    body: `${crumbs([["Início", "/"], [s.nome, `/${s.id}`], [a.meta.titulo]])}
<div class="hero">
  <p class="kicker">Assunto · ${esc(s.nome)}</p>
  <h1>${esc(a.meta.titulo)}</h1>
  ${a.meta.resumo ? `<p class="lead">${inline(a.meta.resumo)}</p>` : ""}
  <div class="meta-row">${pills.join("")}</div>
  ${sec.intro ? `<div style="margin-top:18px">${sec.intro}</div>` : ""}
  ${toc ? `<nav class="toc" aria-label="Nesta página"><strong>Nesta página</strong><ol>${toc}</ol></nav>` : ""}
</div>
${sec.list.map((x) => `<section class="block" id="${x.id}">
  <span class="section-label label-explica">${/^resumo/i.test(x.title) ? "Resumo" : "Explicação"}</span>
  <h2>${inline(x.title)}</h2>
  ${x.html}
</section>`).join("\n")}
${temPratica ? `<section class="block" id="praticar">
  <span class="section-label label-pratica">Atividades</span>
  <h2>Hora de praticar</h2>
  ${atividades.map((_, k) => `<div id="atv-${k}"></div>`).join("\n  ")}
  ${banco.length ? '<div id="banco"></div>' : ""}
</section>` : ""}
${usadoEm.length ? `<section class="block"><h2>Provas com este assunto</h2><div class="list-cards">${usadoEm.map((p) => provaCard(p, false)).join("")}</div></section>` : ""}
<div class="next-page">
  ${prev ? `<a href="${prev.url}">← ${esc(prev.meta.titulo)}</a>` : `<a href="/${s.id}">← ${esc(s.nome)}</a>`}
  ${next ? `<a href="${next.url}"><b>${esc(next.meta.titulo)} →</b></a>` : `<a href="/${s.id}"><b>Voltar para o ${esc(s.nome)} →</b></a>`}
</div>`,
  });
}

// Provas
for (const p of provas) {
  const s = serieById[p.serie];
  const itens = p.assuntos.filter((x) => assuntoById[x.id]).map((x) => ({ ...x, a: assuntoById[x.id] }));
  const total = itens.reduce((n, x) => n + Math.min(x.questoes || 0, x.a.banco.length), 0);
  pages[`${p.serie}/${p.slug}.html`] = layout({
    title: `${p.titulo} · ${s.nome} · Revisa Comp`,
    description: `Revisão para a ${p.titulo} do ${s.nome}.`,
    accent: s.cor, active: p.serie, icon: "📝",
    data: {
      tipo: "prova", id: p.id, titulo: p.titulo, serieNome: s.nome,
      assuntos: itens.map((x) => ({ id: x.a.id, titulo: x.a.meta.titulo, url: x.a.url, questoes: x.questoes, banco: renderFields(x.a.banco) })),
    },
    body: `${crumbs([["Início", "/"], [s.nome, `/${s.id}`], [p.titulo]])}
<div class="hero">
  <p class="kicker">Prova · ${esc(s.nome)}</p>
  <h1>${esc(p.titulo)}</h1>
  <p class="lead">${esc(fmtData(p.data))}</p>
  ${p.observacao ? `<div class="remember"><b>Recado do professor</b>${block(p.observacao)}</div>` : ""}
</div>
<section>
  <h2>O que vai cair</h2>
  <p>Estude cada assunto: leia a explicação e faça as atividades. Depois, faça o simulado no fim desta página.</p>
  <div class="list-cards">
${itens.map((x) => assuntoCard(x.a)).join("\n")}
  </div>
</section>
<section class="block">
  <span class="section-label label-pratica">Simulado</span>
  <h2>Simulado da prova</h2>
  <p>${total} questões sorteadas dos assuntos acima. Cada vez que você refaz, as questões mudam. Cada questão só pode ser respondida uma vez, então pense antes de tocar.</p>
  <div id="sim-start" class="activity">
    <div class="activity-head"><h3>Antes de começar</h3></div>
    <p class="hint">Seu nome e turma aparecem no resultado final, caso o professor peça um print. Nada é enviado para ninguém.</p>
    <div class="grid grid-2" style="margin:0 0 12px">
      <label>Nome<br><input type="text" id="sim-nome" autocomplete="name" placeholder="Seu nome"></label>
      <label>Turma<br><input type="text" id="sim-turma" placeholder="Ex.: ${esc(s.nome)} A"></label>
    </div>
    <button type="button" class="btn-primary" id="sim-go">Começar o simulado →</button>
  </div>
  <div id="sim" hidden></div>
  <div id="cert" hidden></div>
</section>`,
  });
}

/* ---------------- Saída ---------------- */
avisos.forEach((a) => console.log(a));
if (erros.length) {
  erros.forEach((e) => console.error(e));
  console.error(`\n${erros.length} erro(s) no conteúdo. Nada foi gerado.`);
  process.exit(1);
}
if (CHECK_ONLY) {
  console.log(`✔ Conteúdo ok: ${assuntos.length} assunto(s), ${provas.length} prova(s).`);
  process.exit(0);
}
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, "public"), DIST, { recursive: true });
for (const [rel, html] of Object.entries(pages)) {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
}
console.log(`✔ Site gerado em dist/: ${Object.keys(pages).length} página(s), ${assuntos.length} assunto(s), ${provas.length} prova(s).`);
