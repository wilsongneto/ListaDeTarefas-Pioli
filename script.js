const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const form = $("#form");
const input = $("#tarefa");
const erro = $("#erro");
const lista = $("#lista");
const tpl = $("#tplItem");
const btnLimparConcluidas = $("#btnLimparConcluidas");

const countTotal = $("#countTotal");
const countDone = $("#countDone");

const filtros = $$(".btn-filtro");
let filtroAtual = "todas";

// (Opcional) Persistência
const persistToggle = $("#persist");
const LS_KEY = "todo_basico_v1";

function getTarefas() {
  return $$("#lista .item").map(li => ({
    texto: li.querySelector(".texto").textContent,
    done: li.classList.contains("concluida")
  }));
}

function setErro(msg) { erro.textContent = msg || ""; }

function atualizarContadores() {
  const todos = getTarefas();
  const done = todos.filter(t => t.done).length;
  countTotal.textContent = todos.length;
  countDone.textContent = done;
}

function criarItem(texto, done=false) {
  const node = tpl.content.cloneNode(true);
  const li = node.querySelector("li");
  const span = node.querySelector(".texto");
  const chk = node.querySelector(".chk");
  span.textContent = texto;
  chk.checked = !!done;
  if (done) li.classList.add("concluida");
  lista.appendChild(node);
  aplicarFiltro();
  atualizarContadores();
  salvarSeAtivo();
}

function aplicarFiltro() {
  const items = $$("#lista .item");
  items.forEach(li => {
    const done = li.classList.contains("concluida");
    let mostra = true;
    if (filtroAtual === "ativas") mostra = !done;
    if (filtroAtual === "concluidas") mostra = done;
    li.style.display = mostra ? "" : "none";
  });
  filtros.forEach(b => b.classList.toggle("ativo", b.dataset.filtro === filtroAtual));
}

function limparConcluidas() {
  $$("#lista .item.concluida").forEach(li => li.remove());
  atualizarContadores();
  salvarSeAtivo();
}

function salvarSeAtivo() {
  if (!persistToggle.checked) return;
  const dados = getTarefas();
  localStorage.setItem(LS_KEY, JSON.stringify(dados));
}

function carregarSeAtivo() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return;
  try {
    const arr = JSON.parse(raw);
    arr.forEach(t => criarItem(t.texto, t.done));
  } catch(e) {}
}

// Eventos
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const txt = (input.value || "").trim();
  if (!txt) { setErro("Digite uma tarefa."); input.focus(); return; }
  setErro("");
  criarItem(txt, false);
  input.value = "";
  input.focus();
});

lista.addEventListener("click", (ev) => {
  const li = ev.target.closest(".item");
  if (!li) return;
  if (ev.target.classList.contains("chk")) {
    li.classList.toggle("concluida", ev.target.checked);
    atualizarContadores();
    salvarSeAtivo();
  }
  if (ev.target.classList.contains("btnDel")) {
    if (confirm("Excluir esta tarefa?")) {
      li.remove();
      atualizarContadores();
      salvarSeAtivo();
    }
  }
});

btnLimparConcluidas.addEventListener("click", limparConcluidas);

filtros.forEach(btn => {
  btn.addEventListener("click", () => {
    filtroAtual = btn.dataset.filtro;
    aplicarFiltro();
  });
});

persistToggle.addEventListener("change", () => {
  if (persistToggle.checked) {
    salvarSeAtivo();
  } else {
    localStorage.removeItem(LS_KEY);
  }
});

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem(LS_KEY)) {
    persistToggle.checked = true;
    carregarSeAtivo();
  }
  aplicarFiltro();
  atualizarContadores();
  input.focus();
});
