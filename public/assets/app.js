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
        if (q.blocos) box.insertAdjacentHTML("beforeend", '<div class="q-blocos">' + q.blocos + "</div>");
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
      if (!cfg.compacto) {
        var again = h("button", { type: "button", class: "btn-ghost", style: "margin-top:12px" }, "↺ Refazer do começo");
        again.addEventListener("click", function () {
          if (cfg.onRestart) cfg.onRestart(); else render();
          el.scrollIntoView({ behavior: "smooth" });
        });
        el.appendChild(again);
      }

      function finish() {
        if (cfg.key) save(cfg.assunto, cfg.key, right, qs.length);
        var pct = right / qs.length;
        if (cfg.compacto) { if (cfg.onFinish) cfg.onFinish(right, qs.length); return; }
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

  // Mesma regra do build.js: a cor do bloco vem do começo do texto
  function categoriaBloco(t) {
    if (/^quando\b/i.test(t)) return "evento";
    if (/^(definir função|função)/i.test(t)) return "funcao";
    if (/^(repetir|repita|enquanto|para cada|para sempre)/i.test(t)) return "laco";
    if (/^(se|senão)\s/i.test(t)) return "logica";
    if (/^chamar/i.test(t) || /\(\)\s*$/.test(t)) return "chamada";
    return "acao";
  }

  /* ================= Colocar em ordem (arrastar) =================
     Os cartões aparecem embaralhados. O aluno arrasta para a ordem certa
     (no celular, segurando a alça ⠿) e toca em "Conferir". */
  function ordenar(el, cfg) {
    var idx = 0, totalErrors = 0;
    function render() {
      var sc = cfg.cenarios[idx];
      var scoreEl = header(el, cfg.titulo, cfg.dica);
      scoreEl.textContent = cfg.cenarios.length > 1 ? "Cenário " + (idx + 1) + " de " + cfg.cenarios.length : "Arraste";
      el.appendChild(h("p", { class: "ord-titulo" }, "<b>" + sc.titulo + "</b>" + (sc.texto ? " " + sc.texto : "")));
      var wrap = h("div", { class: "ord-wrap" + (cfg.rotulos ? " com-rotulos" : "") });
      if (cfg.rotulos) {
        var rot = h("ol", { class: "ord-rotulos", "aria-hidden": "true" });
        cfg.rotulos.forEach(function (r) { rot.appendChild(h("li", null, esc(r))); });
        wrap.appendChild(rot);
      }
      var list = h("ol", { class: "ord-lista" + (cfg.blocos ? " ord-blocos" : "") });
      var ordem = sc.passos.map(function (s, i) { return i; });
      do { ordem = shuffle(ordem); } while (sc.passos.length > 1 && ordem.every(function (v, i) { return v === i; }));
      ordem.forEach(function (i) { list.appendChild(card(i)); });
      wrap.appendChild(list);
      el.appendChild(wrap);
      var row = h("div", { class: "row", style: "margin-top:12px" });
      var check = h("button", { type: "button", class: "btn-primary" }, "✔ Conferir a ordem");
      row.appendChild(check);
      el.appendChild(row);
      var res = h("div", { class: "result", "aria-live": "polite" });
      el.appendChild(res);
      var errors = 0, solved = false;

      function card(i) {
        var li = h("li", { class: "ord-item", "data-i": String(i) });
        var handle = h("span", { class: "ord-alca", "aria-hidden": "true" }, "⠿");
        var txt = h("span", { class: "ord-txt" }, cfg.blocos ? '<span class="blk blk-' + categoriaBloco(sc.passos[i].replace(/<[^>]+>/g, "")) + '">' + sc.passos[i] + "</span>" : sc.passos[i]);
        var setas = h("span", { class: "ord-setas" });
        var up = h("button", { type: "button", class: "ord-seta", "aria-label": "Subir" }, "▲");
        var dn = h("button", { type: "button", class: "ord-seta", "aria-label": "Descer" }, "▼");
        up.addEventListener("click", function () { if (li.previousElementSibling) { list.insertBefore(li, li.previousElementSibling); mexeu(); } });
        dn.addEventListener("click", function () { if (li.nextElementSibling) { list.insertBefore(li.nextElementSibling, li); mexeu(); } });
        setas.appendChild(up); setas.appendChild(dn);
        li.appendChild(handle); li.appendChild(txt); li.appendChild(setas);
        arrastavel(li, handle);
        return li;
      }
      function mexeu() {
        if (solved) return;
        res.className = "result"; res.textContent = "";
        Array.prototype.forEach.call(list.children, function (c) { c.classList.remove("certo", "errado"); });
      }
      function arrastavel(li, handle) {
        li.addEventListener("pointerdown", function (e) {
          if (solved || e.button > 0) return;
          if (e.target.closest(".ord-seta")) return;
          if (e.pointerType !== "mouse" && e.target !== handle) return; // no toque, só pela alça (para a página continuar rolando)
          e.preventDefault();
          var r = li.getBoundingClientRect();
          var dy = e.clientY - r.top;
          var ph = h("li", { class: "ord-vaga" });
          ph.style.height = r.height + "px";
          list.insertBefore(ph, li);
          li.classList.add("arrastando");
          li.style.width = r.width + "px";
          li.style.left = r.left + "px";
          li.style.top = r.top + "px";
          document.body.appendChild(li);
          var lastY = e.clientY, raf = 0;
          function move(ev) {
            lastY = ev.clientY;
            li.style.top = (ev.clientY - dy) + "px";
            var sib = Array.prototype.filter.call(list.children, function (c) { return c !== ph; });
            var depois = null;
            for (var k = 0; k < sib.length; k++) {
              var b = sib[k].getBoundingClientRect();
              if (ev.clientY < b.top + b.height / 2) { depois = sib[k]; break; }
            }
            list.insertBefore(ph, depois);
            if (!raf) raf = requestAnimationFrame(rolar);
          }
          function rolar() {
            raf = 0;
            var m = 70, v = 0;
            if (lastY < m) v = -10; else if (lastY > window.innerHeight - m) v = 10;
            if (v) { window.scrollBy(0, v); raf = requestAnimationFrame(rolar); }
          }
          function up() {
            document.removeEventListener("pointermove", move);
            document.removeEventListener("pointerup", up);
            document.removeEventListener("pointercancel", up);
            if (raf) cancelAnimationFrame(raf);
            li.classList.remove("arrastando");
            li.style.width = li.style.left = li.style.top = "";
            list.insertBefore(li, ph);
            ph.remove();
            mexeu();
          }
          document.addEventListener("pointermove", move);
          document.addEventListener("pointerup", up);
          document.addEventListener("pointercancel", up);
        });
      }
      check.addEventListener("click", function () {
        if (solved) return;
        var itens = Array.prototype.slice.call(list.children);
        var certos = 0;
        itens.forEach(function (c, pos) {
          var ok = +c.getAttribute("data-i") === pos;
          c.classList.toggle("certo", ok); c.classList.toggle("errado", !ok);
          if (ok) certos++;
        });
        if (certos === itens.length) {
          solved = true;
          list.classList.add("resolvida");
          res.className = "result ok";
          res.innerHTML = (errors === 0 ? "Perfeito, de primeira! " : "Agora sim! ") + (sc.fim || "");
          finishScenario();
        } else {
          errors++; totalErrors++;
          bump(list);
          res.className = "result no";
          res.textContent = certos + " de " + itens.length + " no lugar certo (em verde). Mude os vermelhos e confira de novo.";
        }
      });

      function finishScenario() {
        check.remove();
        if (idx < cfg.cenarios.length - 1) {
          var nb = h("button", { type: "button", class: "btn-primary" }, "Próximo cenário →");
          nb.addEventListener("click", function () { idx++; render(); });
          row.appendChild(nb);
        } else {
          var n = cfg.cenarios.length;
          save(cfg.assunto, cfg.key, Math.max(0, n - Math.ceil(totalErrors / 2)), n);
          if (n > 1) res.innerHTML += "<br>Você terminou todos os cenários" + (totalErrors ? " com " + totalErrors + " conferência(s) errada(s)." : " sem nenhum erro!");
          var rb = h("button", { type: "button", class: "btn-ghost" }, "↺ Refazer");
          rb.addEventListener("click", function () { idx = 0; totalErrors = 0; render(); });
          row.appendChild(rb);
        }
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

  /* ================= Questões abertas =================
     O aluno escreve, vê a resposta esperada e se corrige (certo / em parte / errado).
     Para ligar uma IA no futuro: defina window.RevisaComp.corretor = async function (q, texto) {
       return { nota: 1 | 0.5 | 0, comentario: "..." };   // ou null para cair na autocorreção
     } */
  var NOTAS = [{ v: 1, t: "✔ Acertei", c: "right" }, { v: 0.5, t: "◐ Em parte", c: "half" }, { v: 0, t: "✘ Errei", c: "wrong" }];
  function questaoAberta(box, q, num, onNota) {
    box.classList.add("q", "q-aberta");
    box.appendChild(h("div", { class: "q-title" }, '<span class="q-num">' + num + '.</span><span class="tag-aberta">aberta</span> ' + q.pergunta));
    if (q.codigo) box.insertAdjacentHTML("beforeend", codeBlock(q.codigo));
    if (q.blocos) box.insertAdjacentHTML("beforeend", '<div class="q-blocos">' + q.blocos + "</div>");
    var ta = h("textarea", { class: "resp-aberta", rows: "3", placeholder: "Escreva sua resposta com suas palavras…", "aria-label": "Sua resposta" });
    var enviar = h("button", { type: "button", class: "btn-primary" }, "Enviar resposta");
    var aviso = h("p", { class: "hint", style: "margin:6px 0 0" });
    box.appendChild(ta);
    var row = h("div", { class: "row", style: "margin-top:8px" }); row.appendChild(enviar); box.appendChild(row);
    box.appendChild(aviso);
    enviar.addEventListener("click", function () {
      var texto = ta.value.trim();
      if (texto.length < 3) { aviso.textContent = "✍️ Escreva algo antes de enviar."; ta.focus(); return; }
      aviso.textContent = "";
      ta.readOnly = true; enviar.remove();
      var corretor = window.RevisaComp && window.RevisaComp.corretor;
      if (corretor) {
        aviso.textContent = "Corrigindo…";
        Promise.resolve(corretor(q, texto)).then(function (r) {
          aviso.textContent = "";
          if (r && typeof r.nota === "number") mostrar(r); else autocorrecao();
        }, function () { aviso.textContent = ""; autocorrecao(); });
      } else autocorrecao();
    });
    function gabarito() {
      return '<div class="gabarito"><b>Resposta esperada</b>' + q.gabarito +
        (q.criterios && q.criterios.length ? '<p class="crit-t">Sua resposta precisa ter:</p><ul class="criterios">' + q.criterios.map(function (c) { return "<li>" + c + "</li>"; }).join("") + "</ul>" : "") + "</div>";
    }
    function mostrar(r) {
      var n = NOTAS.filter(function (x) { return x.v === r.nota; })[0] || NOTAS[2];
      box.insertAdjacentHTML("beforeend", gabarito() + '<div class="explain ' + (r.nota >= 1 ? "ok" : "no") + '"><b>' + n.t + "</b>" + esc(r.comentario || "") + "</div>");
      onNota(r.nota);
    }
    function autocorrecao() {
      box.insertAdjacentHTML("beforeend", gabarito());
      highlightAll(box);
      box.appendChild(h("p", { class: "auto-t" }, "Compare com a sua. Seja honesto: como foi?"));
      var opts = h("div", { class: "auto-opts" });
      var bs = NOTAS.map(function (n) {
        var b = h("button", { type: "button" }, n.t);
        b.addEventListener("click", function () {
          bs.forEach(function (x) { x.disabled = true; x.classList.add("dim"); });
          b.classList.remove("dim"); b.classList.add(n.c);
          onNota(n.v);
        });
        opts.appendChild(b);
        return b;
      });
      box.appendChild(opts);
    }
  }

  function abertas(el, cfg) {
    var scoreEl = header(el, cfg.titulo || "Perguntas abertas", cfg.dica || "Na prova, 3 questões são assim. ✍️ Escreva, depois confira.");
    var qs = cfg.questoes, pts = 0, feitas = 0;
    scoreEl.textContent = "✍️ " + qs.length + " perguntas";
    qs.forEach(function (q, i) {
      var box = h("div");
      el.appendChild(box);
      questaoAberta(box, q, i + 1, function (n) {
        pts += n; feitas++;
        scoreEl.textContent = (pts % 1 ? pts.toFixed(1).replace(".", ",") : pts) + " de " + feitas + " pontos";
        if (feitas === qs.length) save(cfg.assunto, cfg.key, pts, qs.length);
      });
    });
  }

  /* ================= Colorir o grafo ================= */
  var CORES = ["#ffffff", "#4b4ded", "#ffb020", "#14b88f", "#e0457b"];
  function grafoBase(cfg) {
    var V = cfg.vertices, byName = {};
    V.forEach(function (v) { byName[v.nome] = v; });
    function larg(v) { return Math.max(36, v.nome.length * 8.4 + 24); }
    var xs = [], ys = [];
    V.forEach(function (v) { xs.push(v.x - larg(v) / 2, v.x + larg(v) / 2); ys.push(v.y - 18, v.y + 18); });
    var x0 = Math.min.apply(null, xs) - 6, y0 = Math.min.apply(null, ys) - 6;
    var w = Math.max.apply(null, xs) - x0 + 6, hh = Math.max.apply(null, ys) - y0 + 6;
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", x0 + " " + y0 + " " + w + " " + hh);
    svg.setAttribute("class", "grafo grafo-int");
    var lines = cfg.arestas.map(function (e) {
      var a = byName[e[0]], b = byName[e[1]];
      var l = document.createElementNS(NS, "line");
      l.setAttribute("x1", a.x); l.setAttribute("y1", a.y); l.setAttribute("x2", b.x); l.setAttribute("y2", b.y);
      l.setAttribute("class", "g-aresta");
      svg.appendChild(l);
      return { el: l, a: e[0], b: e[1] };
    });
    var nodes = V.map(function (v) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "g-v g-click");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", v.nome);
      var r = document.createElementNS(NS, "rect");
      r.setAttribute("x", v.x - larg(v) / 2); r.setAttribute("y", v.y - 17); r.setAttribute("width", larg(v)); r.setAttribute("height", 34); r.setAttribute("rx", 17);
      var t = document.createElementNS(NS, "text");
      t.setAttribute("x", v.x); t.setAttribute("y", v.y + 5); t.textContent = v.nome;
      g.appendChild(r); g.appendChild(t); svg.appendChild(g);
      return { v: v, g: g, r: r, t: t };
    });
    return { svg: svg, lines: lines, nodes: nodes };
  }

  function colorir(el, cfg) {
    var scoreEl = header(el, cfg.titulo, cfg.dica);
    var max = cfg.cores || 4;
    var base = grafoBase(cfg);
    var cor = {};
    var leg = h("div", { class: "cores-leg" });
    for (var c = 1; c <= max; c++) leg.appendChild(h("span", null, '<i style="background:' + CORES[c] + '"></i>' + esc((cfg.rotulosCores || [])[c - 1] || "Cor " + c)));
    el.appendChild(leg);
    var holder = h("div", { class: "grafo-holder" });
    holder.appendChild(base.svg);
    el.appendChild(holder);
    var res = h("div", { class: "result", "aria-live": "polite" });
    var row = h("div", { class: "row" });
    var limpar = h("button", { type: "button", class: "btn-ghost btn-small" }, "↺ Limpar");
    row.appendChild(limpar);
    el.appendChild(row);
    el.appendChild(res);
    var feito = false;
    base.nodes.forEach(function (n) {
      function trocar() { cor[n.v.nome] = ((cor[n.v.nome] || 0) + 1) % (max + 1); pintar(); }
      n.g.addEventListener("click", trocar);
      n.g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); trocar(); } });
    });
    limpar.addEventListener("click", function () { cor = {}; pintar(); });
    function pintar() {
      var usadas = {}, semCor = 0, conflitos = 0;
      base.nodes.forEach(function (n) {
        var k = cor[n.v.nome] || 0;
        n.r.style.fill = CORES[k];
        n.r.style.stroke = k ? CORES[k] : "";
        n.t.style.fill = k === 2 ? "#141b34" : k ? "#fff" : "";
        if (k) usadas[k] = 1; else semCor++;
      });
      base.lines.forEach(function (l) {
        var bad = cor[l.a] && cor[l.a] === cor[l.b];
        l.el.classList.toggle("conflito", !!bad);
        if (bad) conflitos++;
      });
      var nu = Object.keys(usadas).length;
      scoreEl.textContent = nu + " cor(es) · " + conflitos + " conflito(s)";
      if (conflitos) { res.className = "result no"; res.textContent = "⚠️ Vértices ligados com a mesma cor (linha vermelha). Troque uma das cores."; }
      else if (semCor) { res.className = "result"; res.textContent = ""; }
      else if (cfg.minimo && nu > cfg.minimo) { res.className = "result no"; res.textContent = "Sem conflitos, mas com " + nu + " cores. Dá para usar menos!"; }
      else {
        res.className = "result ok";
        res.innerHTML = "🎉 Isso! " + nu + " cores, sem conflito." + (cfg.fim ? " " + cfg.fim : "");
        if (!feito) { feito = true; save(cfg.assunto, cfg.key, 1, 1); }
      }
    }
    pintar();
  }

  /* ================= Cifra de César ================= */
  var ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function semAcento(s) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(); }
  function cesarCifra(s, k) {
    k = ((k % 26) + 26) % 26;
    return semAcento(s).replace(/[A-Z]/g, function (c) { return ABC[(ABC.indexOf(c) + k) % 26]; });
  }
  function cesar(el, cfg) {
    var scoreEl = header(el, cfg.titulo || "Máquina de César", cfg.dica);
    scoreEl.textContent = "🔐";
    var chave = cfg.chave || 3, modo = "cifrar";
    var modos = h("div", { class: "seg" });
    var bC = h("button", { type: "button", class: "on" }, "🔒 Cifrar");
    var bD = h("button", { type: "button" }, "🔓 Decifrar");
    modos.appendChild(bC); modos.appendChild(bD);
    el.appendChild(modos);
    var input = h("input", { type: "text", value: cfg.exemplo || "NOS VEMOS NA FEIRA", "aria-label": "Texto", autocomplete: "off", autocapitalize: "characters", spellcheck: "false", class: "cesar-in" });
    el.appendChild(input);
    var kRow = h("div", { class: "cesar-chave" });
    var menos = h("button", { type: "button", "aria-label": "Diminuir chave" }, "−");
    var kVal = h("span", { class: "k-val", "aria-live": "polite" });
    var mais = h("button", { type: "button", "aria-label": "Aumentar chave" }, "+");
    kRow.appendChild(h("span", null, "Chave"));
    kRow.appendChild(menos); kRow.appendChild(kVal); kRow.appendChild(mais);
    el.appendChild(kRow);
    var tira = h("div", { class: "cesar-tira", "aria-hidden": "true" });
    el.appendChild(tira);
    var out = h("div", { class: "cesar-out", "aria-live": "polite" });
    el.appendChild(out);
    function upd() {
      kVal.textContent = chave;
      var k = modo === "cifrar" ? chave : -chave;
      tira.innerHTML = ABC.split("").map(function (c) {
        return "<span><b>" + c + "</b><i>" + cesarCifra(c, k) + "</i></span>";
      }).join("");
      out.textContent = cesarCifra(input.value, k) || " ";
    }
    function setModo(m) { modo = m; bC.classList.toggle("on", m === "cifrar"); bD.classList.toggle("on", m === "decifrar"); upd(); }
    bC.addEventListener("click", function () { setModo("cifrar"); });
    bD.addEventListener("click", function () { setModo("decifrar"); });
    menos.addEventListener("click", function () { chave = chave <= 1 ? 25 : chave - 1; upd(); });
    mais.addEventListener("click", function () { chave = chave >= 25 ? 1 : chave + 1; upd(); });
    input.addEventListener("input", upd);
    upd();

    if (cfg.desafios && cfg.desafios.length) {
      el.appendChild(h("h4", { class: "cesar-h" }, "🕵️ Desafios"));
      var feitos = 0;
      cfg.desafios.forEach(function (d, i) {
        var box = h("div", { class: "q" });
        box.appendChild(h("div", { class: "q-title" }, '<span class="q-num">' + (i + 1) + ".</span>" + (d.enunciado || (d.chave ? "Decifre (chave " + d.chave + "):" : "Decifre sem saber a chave:"))));
        box.appendChild(h("div", { class: "cesar-msg" }, esc(d.cifrado)));
        var r = h("div", { class: "row" });
        var inp = h("input", { type: "text", "aria-label": "Sua resposta", autocomplete: "off", autocapitalize: "characters", spellcheck: "false" });
        var ok = h("button", { type: "button", class: "btn-primary" }, "Conferir");
        r.appendChild(inp); r.appendChild(ok); box.appendChild(r);
        var fb = h("div", { class: "result" });
        box.appendChild(fb);
        var acertou = false;
        function conferir() {
          if (acertou) return;
          var limpa = function (s) { return semAcento(s).replace(/[^A-Z]/g, ""); };
          if (limpa(inp.value) === limpa(d.resposta)) {
            acertou = true; feitos++;
            fb.className = "result ok"; fb.innerHTML = "🔓 Decifrado! " + (d.explicacao || "");
            inp.readOnly = true; ok.disabled = true;
            if (feitos === cfg.desafios.length) save(cfg.assunto, cfg.key, 1, 1);
          } else {
            fb.className = "result no"; fb.textContent = "Ainda não. Use a máquina acima no modo 🔓 Decifrar" + (d.chave ? " com a chave " + d.chave + "." : " e teste chaves até formar palavras.");
          }
        }
        ok.addEventListener("click", conferir);
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") conferir(); });
        el.appendChild(box);
      });
    }
  }

  /* ================= Montagem da página ================= */
  var COMPONENTES = { quiz: quiz, classificar: classificar, ordenar: ordenar, pacotes: pacotes, dns: dns, terminal: terminal, tarefa: tarefa, abertas: abertas, colorir: colorir, cesar: cesar };
  function eAberta(q) { return q.tipo === "aberta"; }

  function montarAtividades(P) {
    (P.atividades || []).forEach(function (a, i) {
      var el = document.getElementById("atv-" + i);
      var fn = COMPONENTES[a.tipo];
      if (!el || !fn) return;
      a.assunto = P.id; a.key = P.id + "#" + (a.id || i);
      try { fn(el, a); } catch (e) { el.textContent = "Erro ao montar esta atividade."; if (window.console) console.error(e); }
    });
    var qel = document.getElementById("banco");
    var fech = (P.banco || []).filter(function (q) { return !eAberta(q); });
    var abs = (P.banco || []).filter(eAberta);
    if (qel && fech.length) {
      quiz(qel, { titulo: "Quiz do assunto", dica: "🎯 Questões fechadas, como as da prova.", questoes: fech, assunto: P.id, key: P.id + "#banco" });
    }
    if (qel && abs.length) {
      var ael = h("div");
      qel.parentNode.insertBefore(ael, qel.nextSibling);
      abertas(ael, { titulo: "Perguntas abertas", questoes: abs, assunto: P.id, key: P.id + "#abertas" });
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
    // Sorteia n questões, revezando entre os assuntos para todos aparecerem
    function sortear(filtro, n) {
      var pools = shuffle(P.assuntos).map(function (a) {
        return shuffle(a.banco.filter(filtro)).map(function (q) { var c = Object.assign({}, q); c._a = a.id; return c; });
      });
      var out = [];
      while (out.length < n && pools.some(function (p) { return p.length; })) {
        pools.forEach(function (p) { if (out.length < n && p.length) out.push(p.shift()); });
      }
      return out;
    }
    function begin() {
      var per = {};
      P.assuntos.forEach(function (a) { per[a.id] = { titulo: a.titulo, url: a.url, ok: 0, n: 0 }; });
      var fech = sortear(function (q) { return !eAberta(q); }, P.fechadas);
      var abs = sortear(eAberta, P.abertas);
      var total = fech.length + abs.length;
      var pontosF = 0, pontosA = 0, abertasFeitas = 0;
      sim.hidden = false; cert.hidden = true; cert.innerHTML = "";
      sim.innerHTML = "";
      sim.className = "";
      var parte1 = h("div"), parte2 = h("div", { class: "activity", hidden: "" });
      sim.appendChild(parte1); sim.appendChild(parte2);
      quiz(parte1, {
        titulo: "Parte 1 · " + fech.length + " fechadas",
        dica: "Toque na alternativa certa.",
        questoes: fech,
        embaralhar: false,
        compacto: true,
        onAnswer: function (q, ok) { per[q._a].n++; if (ok) { per[q._a].ok++; pontosF++; } },
        onFinish: function () {
          if (!abs.length) return fim();
          parte2.hidden = false;
          parte2.scrollIntoView({ behavior: "smooth" });
        }
      });
      var head = h("div", { class: "activity-head" }, "<h3>Parte 2 · " + abs.length + " abertas</h3>");
      var sc2 = h("span", { class: "score" }, "✍️ escreva");
      head.appendChild(sc2);
      parte2.appendChild(head);
      parte2.appendChild(h("p", { class: "hint" }, "Escreva com suas palavras. Depois compare com a resposta esperada."));
      abs.forEach(function (q, i) {
        var box = h("div");
        parte2.appendChild(box);
        questaoAberta(box, q, fech.length + i + 1, function (nota) {
          per[q._a].n++; per[q._a].ok += nota; pontosA += nota; abertasFeitas++;
          if (abertasFeitas === abs.length) fim();
        });
      });
      function fim() {
        var right = pontosF + pontosA;
        save(P.id, P.id + "#simulado", right, total);
        showCert(right, total, per, pontosF, fech.length, pontosA, abs.length);
      }
      var again = h("button", { type: "button", class: "btn-ghost", style: "margin-top:14px" }, "↺ Sortear outro simulado");
      again.addEventListener("click", function () { begin(); });
      sim.appendChild(again);
      sim.scrollIntoView({ behavior: "smooth" });
    }
    function fmtN(x) { return (Math.round(x * 10) / 10).toString().replace(".", ","); }
    function showCert(right, total, per, pf, nf, pa, na) {
      var pct = Math.round(right / total * 100);
      var now = new Date();
      var keys = Object.keys(per);
      var weak = keys.filter(function (k) { return per[k].n && per[k].ok / per[k].n < 0.7; });
      var bars = keys.map(function (k) {
        var p = per[k].n ? Math.round(per[k].ok / per[k].n * 100) : 0;
        return '<div class="bar-row"><span>' + esc(per[k].titulo) + '</span><span class="bar"><i style="width:' + p + '%"></i></span><b>' + fmtN(per[k].ok) + "/" + per[k].n + "</b></div>";
      }).join("");
      cert.innerHTML =
        '<div class="certificate">' +
          '<p class="kicker">Resultado do simulado · ' + esc(P.titulo) + " · " + esc(P.serieNome) + "</p>" +
          (nome ? '<div class="who">' + esc(nome) + (turma ? " · " + esc(turma) : "") + "</div>" : "") +
          '<div class="big-score">' + fmtN(right) + "<small>/" + total + "</small></div>" +
          '<p class="cert-partes">Fechadas <b>' + fmtN(pf) + "/" + nf + "</b> · Abertas <b>" + fmtN(pa) + "/" + na + "</b></p>" +
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
