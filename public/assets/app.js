/* Revisa Comp: componentes das atividades.
   Os dados de cada página chegam em window.PAGINA (gerado pelo build). */
(function () {
  "use strict";

  /* ================= Utilidades ================= */
  var STORE = "revisacomp:v1";

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }
  function save(assunto, key, score, total) {
    var d = load();
    var prev = d[key];
    if (!prev || score / total >= prev.score / prev.total) d[key] = { assunto: assunto, score: score, total: total };
    try { localStorage.setItem(STORE, JSON.stringify(d)); } catch (e) { /* modo anônimo */ }
  }
  function progress(assunto) {
    var d = load(), n = 0, sum = 0;
    Object.keys(d).forEach(function (k) {
      if (d[k].assunto === assunto) { n++; sum += d[k].score / d[k].total; }
    });
    return { done: n, pct: n ? Math.round((sum / n) * 100) : 0 };
  }
  function resetProgress() { try { localStorage.removeItem(STORE); } catch (e) {} }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function h(tag, attrs, html) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") el.className = attrs[k];
      else if (k === "text") el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    if (html != null) el.innerHTML = html;
    return el;
  }
  function bump(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

  /* ================= Destaque de código Python ================= */
  var TOKEN = /(#.*$)|("[^"\n]*"|'[^'\n]*')|\b(print|input|int|float|str|bool|True|False)\b|\b(\d+(?:\.\d+)?)\b/gm;
  function highlight(src) {
    var out = "", last = 0, m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(src))) {
      out += esc(src.slice(last, m.index));
      var cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "k" : "n";
      out += '<span class="' + cls + '">' + esc(m[0]) + "</span>";
      last = TOKEN.lastIndex;
    }
    return out + esc(src.slice(last));
  }
  function codeBlock(src) { return '<pre class="code">' + highlight(src) + "</pre>"; }
  function highlightAll(root) {
    (root || document).querySelectorAll("pre.code:not([data-hl])").forEach(function (pre) {
      pre.innerHTML = highlight(pre.textContent.replace(/\s+$/, ""));
      pre.setAttribute("data-hl", "1");
    });
  }

  function header(el, title, hint) {
    el.classList.add("activity");
    el.innerHTML = "";
    var head = h("div", { class: "activity-head" });
    head.appendChild(h("h3", null, title));
    var score = h("span", { class: "score", "aria-live": "polite" });
    head.appendChild(score);
    el.appendChild(head);
    if (hint) el.appendChild(h("p", { class: "hint" }, hint));
    return score;
  }

  /* ================= Quiz (a 1ª opção é sempre a certa no arquivo) ================= */
  function quiz(el, cfg) {
    function render() {
      var scoreEl = header(el, cfg.titulo, cfg.dica);
      var qs = cfg.embaralhar === false ? cfg.questoes.slice() : shuffle(cfg.questoes);
      var answered = 0, right = 0;
      function upd() { scoreEl.textContent = right + " de " + qs.length + " acertos"; }
      upd();

      qs.forEach(function (q, qi) {
        var box = h("div", { class: "q" });
        box.appendChild(h("div", { class: "q-title" }, '<span class="q-num">' + (qi + 1) + ".</span>" + q.pergunta));
        if (q.codigo) box.insertAdjacentHTML("beforeend", codeBlock(q.codigo));
        var opts = h("div", { class: "opts", role: "group" });
        var order = shuffle(q.opcoes.map(function (o, i) { return { text: o, ok: i === 0 }; }));
        var buttons = order.map(function (o) {
          var b = h("button", { type: "button" }, o.text);
          b.addEventListener("click", function () {
            buttons.forEach(function (x, i) {
              x.disabled = true;
              if (order[i].ok) x.classList.add("right");
              else if (x !== b) x.classList.add("dim");
            });
            if (!o.ok) b.classList.add("wrong");
            answered++;
            if (o.ok) right++;
            box.appendChild(h("div", { class: "explain " + (o.ok ? "ok" : "no") },
              "<b>" + (o.ok ? "Isso mesmo!" : "Ainda não.") + "</b>" + (q.explicacao || "")));
            upd();
            if (cfg.onAnswer) cfg.onAnswer(q, o.ok);
            if (answered === qs.length) finish();
          });
          opts.appendChild(b);
          return b;
        });
        box.appendChild(opts);
        el.appendChild(box);
      });

      var res = h("div", { class: "result" });
      el.appendChild(res);
      var again = h("button", { type: "button", class: "btn-ghost", style: "margin-top:12px" }, "↺ Refazer do começo");
      again.addEventListener("click", function () {
        if (cfg.onRestart) cfg.onRestart(); else render();
        el.scrollIntoView({ behavior: "smooth" });
      });
      el.appendChild(again);

      function finish() {
        if (cfg.key) save(cfg.assunto, cfg.key, right, qs.length);
        var pct = right / qs.length;
        res.className = "result " + (pct >= 0.7 ? "ok" : "no");
        res.textContent = pct === 1 ? "Gabaritou! " + right + " de " + qs.length + "."
          : pct >= 0.7 ? "Muito bem: " + right + " de " + qs.length + ". Releia as explicações das que errou."
          : right + " de " + qs.length + ". Volte na explicação lá em cima e tente de novo.";
        if (cfg.onFinish) cfg.onFinish(right, qs.length);
      }
    }
    render();
  }

  /* ================= Classificar ================= */
  function classificar(el, cfg) {
    function render() {
      var scoreEl = header(el, cfg.titulo, cfg.dica);
      var items = shuffle(cfg.itens);
      var done = 0, right = 0;
      function upd() { scoreEl.textContent = right + " de " + items.length + " acertos"; }
      upd();
      var res = h("div", { class: "result" });

      items.forEach(function (it) {
        var row = h("div", { class: "sort-item" });
        row.appendChild(h("div", { class: "txt" }, it.texto));
        var ch = h("div", { class: "choices" });
        var fb = h("div", { class: "fb" });
        var btns = cfg.categorias.map(function (c) {
          var b = h("button", { type: "button", title: c.rotulo }, c.curto || c.rotulo);
          b.addEventListener("click", function () {
            btns.forEach(function (x, i) {
              x.disabled = true;
              if (cfg.categorias[i].id === it.resposta) x.classList.add("right");
            });
            var ok = c.id === it.resposta;
            if (!ok) b.classList.add("wrong");
            done++; if (ok) right++;
            var cat = cfg.categorias.filter(function (k) { return k.id === it.resposta; })[0];
            fb.innerHTML = (ok ? "✔ " : "✘ É <b>" + esc(cat ? cat.rotulo : it.resposta) + "</b>. ") + (it.porque || "");
            upd();
            if (done === items.length) {
              save(cfg.assunto, cfg.key, right, items.length);
              res.className = "result " + (right / items.length >= 0.7 ? "ok" : "no");
              res.textContent = "Resultado: " + right + " de " + items.length + ".";
            }
          });
          ch.appendChild(b);
          return b;
        });
        row.appendChild(ch);
        row.appendChild(fb);
        el.appendChild(row);
      });
      el.appendChild(res);
      var again = h("button", { type: "button", class: "btn-ghost", style: "margin-top:12px" }, "↺ Refazer");
      again.addEventListener("click", render);
      el.appendChild(again);
    }
    render();
  }

  /* ================= Colocar em ordem ================= */
  function ordenar(el, cfg) {
    var idx = 0, totalErrors = 0;
    function render() {
      var sc = cfg.cenarios[idx];
      var scoreEl = header(el, cfg.titulo, cfg.dica);
      scoreEl.textContent = "Cenário " + (idx + 1) + " de " + cfg.cenarios.length;
      el.appendChild(h("p", null, "<b>" + sc.titulo + "</b>" + (sc.texto ? " " + sc.texto : "")));
      var slots = h("div", { class: "slots" });
      var slotEls = sc.passos.map(function (s, i) {
        var lbl = cfg.rotulos ? cfg.rotulos[i] : "";
        var sl = h("div", { class: "slot" }, (lbl ? '<span class="slot-label">' + esc(lbl) + "</span>" : "") + '<span class="slot-text">&nbsp;</span>');
        slots.appendChild(sl);
        return sl;
      });
      el.appendChild(slots);
      var chips = h("div", { class: "chips" });
      var next = 0, errors = 0;
      var res = h("div", { class: "result" });
      shuffle(sc.passos.map(function (s, i) { return { s: s, i: i }; })).forEach(function (o) {
        var b = h("button", { type: "button" }, o.s);
        b.addEventListener("click", function () {
          if (o.i === next) {
            slotEls[next].querySelector(".slot-text").innerHTML = o.s;
            slotEls[next].classList.add("filled");
            b.remove();
            next++;
            res.className = "result"; res.textContent = "";
            if (next === sc.passos.length) finishScenario();
          } else {
            errors++; totalErrors++;
            bump(b);
            res.className = "result no";
            res.textContent = "Esse não vai na posição " + (next + 1) + (cfg.rotulos ? " (" + cfg.rotulos[next] + ")" : "") + ". Tente outro.";
          }
        });
        chips.appendChild(b);
      });
      el.appendChild(chips);
      el.appendChild(res);

      function finishScenario() {
        res.className = "result ok";
        res.innerHTML = (errors === 0 ? "Perfeito, sem erros! " : "Completo! ") + (sc.fim || "");
        var row = h("div", { class: "row", style: "margin-top:12px" });
        if (idx < cfg.cenarios.length - 1) {
          var nb = h("button", { type: "button", class: "btn-primary" }, "Próximo cenário →");
          nb.addEventListener("click", function () { idx++; render(); });
          row.appendChild(nb);
        } else {
          var n = cfg.cenarios.length;
          save(cfg.assunto, cfg.key, Math.max(0, n - Math.ceil(totalErrors / 2)), n);
          res.innerHTML += "<br>Você terminou todos os cenários" + (totalErrors ? " com " + totalErrors + " tentativa(s) errada(s)." : " sem nenhum erro!");
          var rb = h("button", { type: "button", class: "btn-ghost" }, "↺ Refazer todos");
          rb.addEventListener("click", function () { idx = 0; totalErrors = 0; render(); });
          row.appendChild(rb);
        }
        el.appendChild(row);
      }
    }
    render();
  }

  /* ================= Correio de pacotes ================= */
  function pacotes(el, cfg) {
    var mi = Math.floor(Math.random() * cfg.mensagens.length);
    function render() {
      var msg = cfg.mensagens[mi % cfg.mensagens.length];
      var N = 6;
      var parts = [];
      for (var i = 0; i < N; i++) parts.push(msg.slice(Math.round(i * msg.length / N), Math.round((i + 1) * msg.length / N)));
      var missing = Math.floor(Math.random() * N);
      var next = 0, arrived = false, wrongs = 0;
      var scoreEl = header(el, cfg.titulo, cfg.dica);
      scoreEl.textContent = N + " pacotes enviados";

      el.appendChild(h("p", { style: "margin-bottom:4px" }, "<b>Pacotes que chegaram</b> (fora de ordem):"));
      var grid = h("div", { class: "packets" });
      el.appendChild(grid);
      el.appendChild(h("p", { style: "margin:14px 0 4px" }, "<b>Mensagem montada no destino:</b>"));
      var asm = h("div", { class: "assembled", "aria-live": "polite" });
      el.appendChild(asm);
      var res = h("div", { class: "result" });

      var resendRow = h("div", { class: "row", style: "margin-top:10px" });
      resendRow.appendChild(h("span", null, "Está faltando um pacote? Peça o reenvio do número:"));
      var resendBtns = [];
      for (var r = 0; r < N; r++) (function (r) {
        var b = h("button", { type: "button", style: "min-width:48px" }, String(r + 1));
        b.addEventListener("click", function () {
          if (arrived) return;
          if (r === missing) {
            arrived = true;
            resendBtns.forEach(function (x) { x.disabled = true; });
            b.classList.add("btn-primary");
            addPacket(missing, true);
            res.className = "result ok";
            res.textContent = "Pedido de reenvio atendido: o pacote " + (r + 1) + " chegou. Continue montando.";
          } else {
            res.className = "result no";
            res.textContent = "O pacote " + (r + 1) + " já chegou. Olhe os números no cabeçalho: qual falta?";
          }
        });
        resendBtns.push(b);
        resendRow.appendChild(b);
      })(r);
      el.appendChild(resendRow);
      el.appendChild(res);

      function addPacket(i, isNew) {
        var b = h("button", { type: "button", class: "packet" + (isNew ? " shake" : "") },
          '<div class="ph"><span>De: ' + esc(cfg.de) + "</span><span>Para: " + esc(cfg.para) + "</span><span><b>Nº " + (i + 1) + " de " + N + "</b></span></div>" +
          '<div class="pc">' + esc(parts[i].replace(/ /g, "·")) + "</div>");
        b.addEventListener("click", function () {
          if (i === next) {
            b.classList.add("used");
            asm.appendChild(h("span", { text: parts[i] }));
            next++;
            if (next === N) {
              res.className = "result ok";
              res.innerHTML = "Mensagem completa: “" + esc(msg) + "”. Os números do cabeçalho permitiram montar tudo na ordem certa, mesmo com os pacotes chegando embaralhados e um deles se perdendo no caminho.";
              save(cfg.assunto, cfg.key, wrongs === 0 ? 1 : 0.5, 1);
              var again = h("button", { type: "button", class: "btn-primary", style: "margin-top:12px" }, "Outra mensagem →");
              again.addEventListener("click", function () { mi++; render(); });
              el.appendChild(again);
            }
          } else {
            wrongs++;
            bump(b);
            res.className = "result no";
            res.textContent = next === missing && !arrived
              ? "Você precisa do pacote " + (next + 1) + ", mas ele não chegou. Peça o reenvio!"
              : "Ainda não. Agora você precisa do pacote número " + (next + 1) + ".";
          }
        });
        grid.appendChild(b);
      }
      shuffle(parts.map(function (_, i) { return i; })).forEach(function (i) { if (i !== missing) addPacket(i); });
    }
    render();
  }

  /* ================= Simulador de DNS ================= */
  function dns(el, cfg) {
    var scoreEl = header(el, cfg.titulo, cfg.dica);
    scoreEl.textContent = "Simulador";
    var table = h("div", { class: "table-wrap" });
    table.innerHTML = "<table><thead><tr><th>Lista do DNS: nome do site</th><th>Endereço IP</th></tr></thead><tbody>" +
      Object.keys(cfg.lista).map(function (k) { return "<tr><td>" + esc(k) + "</td><td><code>" + esc(cfg.lista[k]) + "</code></td></tr>"; }).join("") +
      "</tbody></table>";
    el.appendChild(table);
    var row = h("div", { class: "row" });
    var input = h("input", { type: "text", placeholder: "digite um site", "aria-label": "Nome do site", autocapitalize: "off", autocomplete: "off", spellcheck: "false" });
    var go = h("button", { type: "button", class: "btn-primary" }, "Abrir site");
    row.appendChild(input); row.appendChild(go);
    el.appendChild(row);
    var quick = h("div", { class: "row", style: "margin-top:8px" });
    quick.appendChild(h("span", { class: "hint", style: "margin:0" }, "Ou teste:"));
    (cfg.exemplos || []).forEach(function (ex) {
      var b = h("button", { type: "button", class: "btn-ghost btn-small" }, esc(ex));
      b.addEventListener("click", function () { input.value = ex; run(); });
      quick.appendChild(b);
    });
    el.appendChild(quick);
    var log = h("ol", { class: "dns-log", "aria-live": "polite" });
    el.appendChild(log);
    var timers = [];
    function step(delay, text, cls) {
      timers.push(setTimeout(function () { log.appendChild(h("li", cls ? { class: cls } : null, text)); }, delay));
    }
    function run() {
      timers.forEach(clearTimeout); timers = [];
      log.innerHTML = "";
      var name = input.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
      if (!name) { input.focus(); return; }
      var ip = cfg.lista[name];
      step(0, "📱 O celular pergunta ao <b>DNS</b>: “Qual é o endereço IP de <b>" + esc(name) + "</b>?”");
      if (!ip) {
        step(900, "📖 O DNS procura na lista… e <b>não encontra</b> esse nome.", "err");
        step(1800, "❌ Sem o endereço IP, o pacote não tem destino. O navegador mostra: <b>“Não foi possível encontrar o site”</b>. Confira se o nome foi digitado certinho.", "err");
        return;
      }
      step(900, "📖 O DNS procura na lista e responde: “É <code>" + esc(ip) + "</code>”.");
      step(1800, "📨 O celular envia um pacote com o pedido da página para o destino <code>" + esc(ip) + "</code>. Os roteadores leem esse número e encaminham o pacote.");
      step(2700, "🖥️ O servidor do site responde enviando a página, dividida em vários pacotes numerados.");
      step(3600, "✅ O celular monta os pacotes na ordem e a página aparece na tela!", "ok");
      save(cfg.assunto, cfg.key, 1, 1);
    }
    go.addEventListener("click", run);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
  }

  /* ================= Mini Python (subconjunto) =================
     Suporta: atribuição, print, input, int, float, str, + - * /, parênteses,
     textos, números, True/False, comentários. Erros no formato do Python. */
  var Py = (function () {
    function PyErr(type, msg, line) { this.type = type; this.msg = msg; this.line = line; }
    var NONE = { t: "none" };
    function I(v) { return { t: "int", v: v }; }
    function F(v) { return { t: "float", v: v }; }
    function S(v) { return { t: "str", v: v }; }
    function B(v) { return { t: "bool", v: v }; }
    function fmtFloat(v) {
      if (!isFinite(v)) return v > 0 ? "inf" : v < 0 ? "-inf" : "nan";
      return Number.isInteger(v) && Math.abs(v) < 1e16 ? v.toFixed(1) : String(v);
    }
    function repr(x) {
      if (x.t === "str") return x.v.indexOf("'") >= 0 && x.v.indexOf('"') < 0 ? '"' + x.v + '"' : "'" + x.v.replace(/'/g, "\\'") + "'";
      return toStr(x);
    }
    function toStr(x) {
      switch (x.t) {
        case "int": return String(x.v);
        case "float": return fmtFloat(x.v);
        case "str": return x.v;
        case "bool": return x.v ? "True" : "False";
        case "tuple": return "(" + x.v.map(repr).join(", ") + (x.v.length === 1 ? ",)" : ")");
        default: return "None";
      }
    }
    function tname(x) { return x.t === "none" ? "NoneType" : x.t; }
    function isNum(x) { return x.t === "int" || x.t === "float" || x.t === "bool"; }
    function num(x) { return x.t === "bool" ? (x.v ? 1 : 0) : x.v; }

    function tokenize(line, ln) {
      var toks = [], i = 0;
      while (i < line.length) {
        var c = line[i];
        if (c === " " || c === "\t") { i++; continue; }
        if (c === "#") break;
        if (c === '"' || c === "'") {
          var j = line.indexOf(c, i + 1);
          if (j < 0) throw new PyErr("SyntaxError", "unterminated string literal (detected at line " + ln + ")", ln);
          toks.push({ k: "str", v: line.slice(i + 1, j) }); i = j + 1; continue;
        }
        var m = /^\d+(\.\d+)?/.exec(line.slice(i));
        if (m) { toks.push({ k: "num", v: m[0] }); i += m[0].length; continue; }
        m = /^[A-Za-z_À-ÿ][A-Za-z0-9_À-ÿ]*/.exec(line.slice(i));
        if (m) { toks.push({ k: "name", v: m[0] }); i += m[0].length; continue; }
        if ("+-*/(),=".indexOf(c) >= 0) { toks.push({ k: "op", v: c }); i++; continue; }
        throw new PyErr("SyntaxError", "invalid character '" + c + "'", ln);
      }
      return toks;
    }

    // Parser -> árvore
    function parseLine(toks, ln) {
      var p = 0;
      function peek(v) { return toks[p] && toks[p].k === "op" && toks[p].v === v; }
      function eat(v) {
        if (!peek(v)) {
          if (v === ")") throw new PyErr("SyntaxError", "'(' was never closed", ln);
          throw new PyErr("SyntaxError", "invalid syntax", ln);
        }
        p++;
      }
      function primary() {
        var t = toks[p];
        if (!t) throw new PyErr("SyntaxError", "invalid syntax", ln);
        if (t.k === "num") { p++; return { n: "lit", v: t.v.indexOf(".") >= 0 ? F(parseFloat(t.v)) : I(parseInt(t.v, 10)) }; }
        if (t.k === "str") { p++; return { n: "lit", v: S(t.v) }; }
        if (t.k === "name") {
          p++;
          if (t.v === "True") return { n: "lit", v: B(true) };
          if (t.v === "False") return { n: "lit", v: B(false) };
          if (toks[p] && toks[p].k === "name") throw new PyErr("SyntaxError", "invalid syntax", ln);
          if (peek("(")) {
            p++;
            var args = [];
            if (!peek(")")) {
              args.push(expr());
              while (peek(",")) { p++; if (peek(")")) break; args.push(expr()); }
            }
            eat(")");
            return { n: "call", f: t.v, args: args };
          }
          return { n: "name", v: t.v };
        }
        if (peek("(")) { p++; var e = expr(); eat(")"); return e; }
        throw new PyErr("SyntaxError", "invalid syntax", ln);
      }
      function unary() {
        if (peek("-")) { p++; return { n: "neg", e: unary() }; }
        if (peek("+")) { p++; return unary(); }
        return primary();
      }
      function term() {
        var l = unary();
        while (peek("*") || peek("/")) { var op = toks[p++].v; l = { n: "bin", op: op, l: l, r: unary() }; }
        return l;
      }
      function expr() {
        var l = term();
        while (peek("+") || peek("-")) { var op = toks[p++].v; l = { n: "bin", op: op, l: l, r: term() }; }
        return l;
      }
      function tupleExpr() {
        var first = expr();
        if (!peek(",")) return first;
        var items = [first];
        while (peek(",")) { p++; if (!toks[p]) break; items.push(expr()); }
        return { n: "tuple", items: items };
      }
      var stmt;
      if (toks.length >= 2 && toks[0].k === "name" && toks[1].k === "op" && toks[1].v === "=") {
        p = 2;
        if (!toks[p]) throw new PyErr("SyntaxError", "invalid syntax", ln);
        stmt = { n: "assign", name: toks[0].v, e: tupleExpr() };
      } else {
        if (toks[0] && toks[0].k === "name" && toks[1] && toks[1].k === "name")
          throw new PyErr("SyntaxError", "invalid syntax", ln);
        stmt = { n: "expr", e: tupleExpr() };
      }
      if (p < toks.length) {
        if (peek("=")) throw new PyErr("SyntaxError", "cannot assign to expression here. Maybe you meant '==' instead of '='?", ln);
        throw new PyErr("SyntaxError", "invalid syntax", ln);
      }
      return stmt;
    }

    function compile(src) {
      var lines = src.split("\n"), prog = [];
      lines.forEach(function (line, i) {
        var toks = tokenize(line, i + 1);
        if (toks.length) prog.push({ ln: i + 1, s: parseLine(toks, i + 1) });
      });
      return prog;
    }

    function binop(op, a, b, ln) {
      function bad() {
        if (op === "+" && a.t === "str") throw new PyErr("TypeError", 'can only concatenate str (not "' + tname(b) + '") to str', ln);
        throw new PyErr("TypeError", "unsupported operand type(s) for " + op + ": '" + tname(a) + "' and '" + tname(b) + "'", ln);
      }
      if (isNum(a) && isNum(b)) {
        var x = num(a), y = num(b), fl = a.t === "float" || b.t === "float";
        if (op === "/") {
          if (y === 0) throw new PyErr("ZeroDivisionError", "division by zero", ln);
          return F(x / y);
        }
        var r = op === "+" ? x + y : op === "-" ? x - y : x * y;
        return fl ? F(r) : I(r);
      }
      if (op === "+" && a.t === "str" && b.t === "str") return S(a.v + b.v);
      if (op === "*" && a.t === "str" && (b.t === "int" || b.t === "bool")) return S(a.v.repeat(Math.max(0, num(b))));
      if (op === "*" && b.t === "str" && (a.t === "int" || a.t === "bool")) return S(b.v.repeat(Math.max(0, num(a))));
      bad();
    }

    async function run(src, io) {
      var prog = compile(src); // erros de sintaxe aparecem antes de executar
      var vars = {};
      async function ev(e, ln) {
        switch (e.n) {
          case "lit": return e.v;
          case "name":
            if (!(e.v in vars)) throw new PyErr("NameError", "name '" + e.v + "' is not defined", ln);
            return vars[e.v];
          case "neg": {
            var v = await ev(e.e, ln);
            if (!isNum(v)) throw new PyErr("TypeError", "bad operand type for unary -: '" + tname(v) + "'", ln);
            return v.t === "float" ? F(-v.v) : I(-num(v));
          }
          case "bin": return binop(e.op, await ev(e.l, ln), await ev(e.r, ln), ln);
          case "tuple": {
            var items = [];
            for (var i = 0; i < e.items.length; i++) items.push(await ev(e.items[i], ln));
            return { t: "tuple", v: items };
          }
          case "call": {
            var args = [];
            for (var j = 0; j < e.args.length; j++) args.push(await ev(e.args[j], ln));
            return call(e.f, args, ln);
          }
        }
      }
      async function call(f, args, ln) {
        if (f === "print") { io.out(args.map(toStr).join(" ")); return NONE; }
        if (f === "input") { var ans = await io.input(args.length ? toStr(args[0]) : ""); return S(ans); }
        if (f === "int") {
          var a = args[0];
          if (!a) return I(0);
          if (a.t === "str") {
            if (!/^\s*[+-]?\d+\s*$/.test(a.v)) throw new PyErr("ValueError", "invalid literal for int() with base 10: " + repr(a), ln);
            return I(parseInt(a.v, 10));
          }
          if (isNum(a)) return I(Math.trunc(num(a)));
          throw new PyErr("TypeError", "int() argument must be a string or a number, not '" + tname(a) + "'", ln);
        }
        if (f === "float") {
          var b = args[0];
          if (!b) return F(0);
          if (b.t === "str") {
            if (!/^\s*[+-]?(\d+(\.\d*)?|\.\d+)\s*$/.test(b.v)) throw new PyErr("ValueError", "could not convert string to float: " + repr(b), ln);
            return F(parseFloat(b.v));
          }
          if (isNum(b)) return F(num(b));
          throw new PyErr("TypeError", "float() argument must be a string or a real number, not '" + tname(b) + "'", ln);
        }
        if (f === "str") return S(args[0] ? toStr(args[0]) : "");
        if (f === "type") return S("<class '" + tname(args[0]) + "'>");
        throw new PyErr("NameError", "name '" + f + "' is not defined", ln);
      }
      for (var k = 0; k < prog.length; k++) {
        var st = prog[k];
        if (st.s.n === "assign") vars[st.s.name] = await ev(st.s.e, st.ln);
        else await ev(st.s.e, st.ln);
      }
    }
    return { run: run, PyErr: PyErr };
  })();

  var ERR_HELP = {
    TypeError: "<b>TypeError:</b> o Python tentou fazer uma operação com tipos que não combinam. O caso mais comum: somar um <b>texto</b> (que veio do <code>input()</code>) com um <b>número</b>. Faltou o <code>int()</code>?",
    ValueError: "<b>ValueError:</b> o <code>int()</code> só converte texto formado por algarismos. Palavras como “doze” ou números com vírgula não funcionam.",
    NameError: "<b>NameError:</b> o Python não conhece esse nome. Esqueceu as aspas num texto? Escreveu <code>true</code> com minúscula? Ou usou uma variável antes de criar?",
    SyntaxError: "<b>SyntaxError:</b> erro de escrita. Confira parênteses, aspas e se o nome da variável tem espaço.",
    ZeroDivisionError: "<b>ZeroDivisionError:</b> não dá para dividir por zero."
  };

  function terminal(el, cfg) {
    var scoreEl = header(el, cfg.titulo, cfg.dica);
    scoreEl.textContent = "Simulador";
    var progIdx = 0, editing = false, runId = 0;
    var tabs = h("div", { class: "row", style: "margin-bottom:8px" });
    var desc = h("p", { class: "hint", style: "margin:4px 0" });
    var codeHost = h("div");
    var tools = h("div", { class: "row" });
    var consoleEl = h("div", { class: "console", "aria-live": "polite" });
    var form = h("div", { class: "row" });
    var note = h("div", { class: "hint", style: "margin-top:8px" });
    var codes = cfg.programas.map(function (p) { return p.codigo; });

    cfg.programas.forEach(function (p, i) {
      var b = h("button", { type: "button" }, p.nome);
      b.addEventListener("click", function () { progIdx = i; editing = false; setup(); });
      tabs.appendChild(b);
    });
    [tabs, desc, codeHost, tools, consoleEl, form, note].forEach(function (x) { el.appendChild(x); });

    function setup() {
      runId++;
      Array.prototype.forEach.call(tabs.children, function (b, i) { b.className = i === progIdx ? "btn-primary" : ""; });
      if (cfg.programas.length < 2) tabs.hidden = true;
      var p = cfg.programas[progIdx];
      desc.innerHTML = p.descricao || "";
      drawCode();
      consoleEl.innerHTML = '<span class="muted">Clique em ▶ Executar.</span>';
      note.innerHTML = "";
      form.innerHTML = "";
      var run = h("button", { type: "button", class: "btn-primary" }, "▶ Executar");
      run.addEventListener("click", start);
      form.appendChild(run);
    }
    function drawCode() {
      codeHost.innerHTML = "";
      tools.innerHTML = "";
      if (editing) {
        var ta = h("textarea", { class: "code-edit", spellcheck: "false", autocapitalize: "off", "aria-label": "Código" });
        ta.value = codes[progIdx];
        ta.rows = Math.max(4, codes[progIdx].split("\n").length + 1);
        ta.addEventListener("input", function () { codes[progIdx] = ta.value; });
        codeHost.appendChild(ta);
      } else {
        codeHost.innerHTML = codeBlock(codes[progIdx]);
      }
      var eb = h("button", { type: "button", class: "btn-ghost btn-small" }, editing ? "✔ Terminar edição" : "✏️ Editar o código");
      eb.addEventListener("click", function () { editing = !editing; drawCode(); });
      tools.appendChild(eb);
      if (codes[progIdx] !== cfg.programas[progIdx].codigo) {
        var rb = h("button", { type: "button", class: "btn-ghost btn-small" }, "↺ Voltar ao original");
        rb.addEventListener("click", function () { codes[progIdx] = cfg.programas[progIdx].codigo; editing = false; drawCode(); });
        tools.appendChild(rb);
      }
    }
    function start() {
      var my = ++runId;
      var p = cfg.programas[progIdx];
      var out = "";
      note.innerHTML = "";
      consoleEl.innerHTML = "";
      function paint(extra) { consoleEl.innerHTML = out + (extra || ""); }
      var io = {
        out: function (s) { out += esc(s) + "\n"; paint(); },
        input: function (prompt) {
          return new Promise(function (resolve, reject) {
            if (my !== runId) return reject("cancel");
            paint(esc(prompt) + '<span class="in">▌</span>');
            form.innerHTML = "";
            var input = h("input", { type: "text", "aria-label": prompt || "Entrada", autocomplete: "off", autocapitalize: "off" });
            var ok = h("button", { type: "button", class: "btn-primary" }, "Enter ↵");
            function send() {
              if (my !== runId) return;
              out += esc(prompt) + '<span class="in">' + esc(input.value) + "</span>\n";
              paint();
              form.innerHTML = "";
              resolve(input.value);
            }
            ok.addEventListener("click", send);
            input.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });
            form.appendChild(input); form.appendChild(ok);
            input.focus({ preventScroll: true });
          });
        }
      };
      Py.run(codes[progIdx], io).then(function () {
        if (my !== runId) return;
        if (!out) paint('<span class="muted">(o programa terminou sem mostrar nada)</span>');
        done(p.nota);
      }, function (err) {
        if (my !== runId || err === "cancel") return;
        if (err instanceof Py.PyErr) {
          out += '<span class="err">Traceback (most recent call last):\n  File "main.py", line ' + err.line + ', in &lt;module&gt;\n' + esc(err.type + ": " + err.msg) + "</span>";
          paint();
          done((ERR_HELP[err.type] || "") + (p.notaErro ? " " + p.notaErro : ""));
        } else {
          paint('<span class="err">Erro inesperado no simulador.</span>');
          if (window.console) console.error(err);
        }
      });
    }
    function done(n) {
      note.innerHTML = n || "";
      form.innerHTML = "";
      var again = h("button", { type: "button" }, "▶ Executar de novo");
      again.addEventListener("click", start);
      form.appendChild(again);
      save(cfg.assunto, cfg.key, 1, 1);
    }
    setup();
  }

  /* ================= Tarefa (sem correção automática) ================= */
  function tarefa(el, cfg) {
    el.classList.add("activity");
    el.innerHTML = '<div class="activity-head"><h3>' + cfg.titulo + '</h3><span class="score">' + (cfg.selo || "Para fazer") + "</span></div>" +
      '<div class="md">' + cfg.enunciado + "</div>" +
      (cfg.resposta ? '<details class="reveal"><summary>' + (cfg.rotuloResposta || "Ver uma resposta possível (tente antes!)") + '</summary><div class="md">' + cfg.resposta + "</div></details>" : "");
    highlightAll(el);
  }

  /* ================= Montagem da página ================= */
  var COMPONENTES = { quiz: quiz, classificar: classificar, ordenar: ordenar, pacotes: pacotes, dns: dns, terminal: terminal, tarefa: tarefa };

  function montarAtividades(P) {
    (P.atividades || []).forEach(function (a, i) {
      var el = document.getElementById("atv-" + i);
      var fn = COMPONENTES[a.tipo];
      if (!el || !fn) return;
      a.assunto = P.id; a.key = P.id + "#" + (a.id || i);
      try { fn(el, a); } catch (e) { el.textContent = "Erro ao montar esta atividade."; if (window.console) console.error(e); }
    });
    var qel = document.getElementById("banco");
    if (qel && P.banco && P.banco.length) {
      quiz(qel, { titulo: "Quiz do assunto", dica: "Todas as questões deste assunto. No simulado da prova, algumas delas são sorteadas.", questoes: P.banco, assunto: P.id, key: P.id + "#banco" });
    }
  }

  /* Simulado da prova */
  function montarSimulado(P) {
    var startBox = document.getElementById("sim-start");
    var sim = document.getElementById("sim");
    var cert = document.getElementById("cert");
    if (!startBox) return;
    var nome = "", turma = "";
    document.getElementById("sim-go").addEventListener("click", function () {
      nome = document.getElementById("sim-nome").value.trim();
      turma = document.getElementById("sim-turma").value.trim();
      startBox.hidden = true;
      begin();
    });
    function begin() {
      var per = {}, qs = [];
      P.assuntos.forEach(function (a) {
        per[a.id] = { titulo: a.titulo, url: a.url, ok: 0, n: 0 };
        shuffle(a.banco).slice(0, a.questoes).forEach(function (q) {
          var c = Object.assign({}, q); c._a = a.id; qs.push(c);
        });
      });
      sim.hidden = false; cert.hidden = true; cert.innerHTML = "";
      quiz(sim, {
        titulo: "Simulado · " + qs.length + " questões",
        dica: "Cada tentativa sorteia questões diferentes. Leia a explicação depois de cada resposta.",
        questoes: qs,
        onAnswer: function (q, ok) { per[q._a].n++; if (ok) per[q._a].ok++; },
        onFinish: function (right, total) {
          save(P.id, P.id + "#simulado", right, total);
          showCert(right, total, per);
        },
        onRestart: begin
      });
      sim.scrollIntoView({ behavior: "smooth" });
    }
    function showCert(right, total, per) {
      var pct = Math.round(right / total * 100);
      var now = new Date();
      var keys = Object.keys(per);
      var weak = keys.filter(function (k) { return per[k].n && per[k].ok / per[k].n < 0.7; });
      var bars = keys.map(function (k) {
        var p = per[k].n ? Math.round(per[k].ok / per[k].n * 100) : 0;
        return '<div class="bar-row"><span>' + esc(per[k].titulo) + '</span><span class="bar"><i style="width:' + p + '%"></i></span><b>' + per[k].ok + "/" + per[k].n + "</b></div>";
      }).join("");
      cert.innerHTML =
        '<div class="certificate">' +
          '<p class="kicker">Resultado do simulado · ' + esc(P.titulo) + " · " + esc(P.serieNome) + "</p>" +
          (nome ? '<div class="who">' + esc(nome) + (turma ? " · " + esc(turma) : "") + "</div>" : "") +
          '<div class="big-score">' + right + "/" + total + "</div>" +
          "<p><b>" + pct + "% de acertos</b> · " + now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + "</p>" +
          '<div class="bars">' + bars + "</div>" +
        "</div>" +
        (weak.length
          ? '<div class="remember"><b>O que revisar</b>Você ficou abaixo de 70% em: ' + weak.map(function (k) { return '<a href="' + per[k].url + '">' + esc(per[k].titulo) + "</a>"; }).join(", ") + ". Releia a explicação e refaça as atividades desse assunto.</div>"
          : '<div class="remember"><b>Mandou bem!</b>Você passou de 70% em todos os assuntos. Refaça o simulado: as questões sorteadas mudam a cada tentativa.</div>');
      cert.hidden = false;
      cert.scrollIntoView({ behavior: "smooth" });
    }
  }

  /* Progresso nas listas de assuntos */
  function pintarProgresso() {
    document.querySelectorAll("[data-progresso]").forEach(function (el) {
      var p = progress(el.getAttribute("data-progresso"));
      el.textContent = p.done ? "✔ " + p.done + " atividade(s) feita(s) · " + p.pct + "% de acertos" : "Ainda não começou";
      if (p.done) el.classList.add("started");
    });
    var reset = document.getElementById("reset-progresso");
    if (reset && !reset.dataset.on) {
      reset.dataset.on = "1";
      reset.addEventListener("click", function () {
        if (confirm("Apagar o progresso salvo neste aparelho?")) { resetProgress(); pintarProgresso(); }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    highlightAll();
    var P = window.PAGINA || {};
    if (P.tipo === "assunto") montarAtividades(P);
    if (P.tipo === "prova") montarSimulado(P);
    pintarProgresso();
  });

  window.RevisaComp = { Py: Py, highlight: highlight, progress: progress, load: load };
})();
