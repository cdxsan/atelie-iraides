// ── SUPABASE ──

var supabase = window.__sb;

// ── DADOS DE EXEMPLO ──

const vestidos = [
  { id: 'v1', nome: 'Vestido Florido Azul', descricao: 'Curto, manga curta, tecido leve. Ideal para passeios diurnos de fim de semana.', preco: 8900, disponivel: true, cor: '#3a6b8c' },
  { id: 'v2', nome: 'Vestido Linho Bege', descricao: 'Midi, alça fina, tecido de linho. Fresco e elegante para dias quentes.', preco: 12000, disponivel: true, cor: '#c4a87c' },
  { id: 'v3', nome: 'Vestido Estampado Vermelho', descricao: 'Longo, estampa floral, decote V. Perfeito para eventos durante o dia.', preco: 9500, disponivel: true, cor: '#a83232' },
  { id: 'v4', nome: 'Vestido Midi Preto', descricao: 'Midi, gola redonda, tecido acetinado. Básico versátil do armário.', preco: 11000, disponivel: true, cor: '#2a2a2a' },
  { id: 'v5', nome: 'Vestido Cropped Verde', descricao: 'Curto, modelo cropped, tecido viscolycra. Moderno e confortável.', preco: 7500, disponivel: true, cor: '#4a7a4a' },
];

const pedidos = [
  {
    id: 'p1',
    cliente_nome: 'Ana Beatriz Silva',
    cliente_whatsapp: '(62) 99999-1001',
    cliente_endereco: 'Rua das Flores, 123, Centro, Aparecida de Goiânia - GO',
    frete_valor: 1200,
    total: 10100,
    status: 'pendente',
    created_at: '2026-07-22T14:30:00',
    itens: [
      { produto_nome: 'Vestido Florido Azul', quantidade: 1, preco_unitario: 8900 },
    ],
  },
  {
    id: 'p2',
    cliente_nome: 'Carla Mendes Rocha',
    cliente_whatsapp: '(62) 98888-2002',
    cliente_endereco: 'Av. Independência, 456, Jardim América, Aparecida de Goiânia - GO',
    frete_valor: 800,
    total: 12800,
    status: 'pago',
    created_at: '2026-07-21T10:15:00',
    itens: [
      { produto_nome: 'Vestido Linho Bege', quantidade: 1, preco_unitario: 12000 },
    ],
  },
  {
    id: 'p3',
    cliente_nome: 'Juliana Oliveira Santos',
    cliente_whatsapp: '(62) 97777-3003',
    cliente_endereco: 'Rua 7, Quadra 12, Casa 3, Setor Sul, Aparecida de Goiânia - GO',
    frete_valor: 1800,
    total: 21300,
    status: 'entregue',
    created_at: '2026-07-19T08:45:00',
    itens: [
      { produto_nome: 'Vestido Estampado Vermelho', quantidade: 1, preco_unitario: 9500 },
      { produto_nome: 'Vestido Midi Preto', quantidade: 1, preco_unitario: 11000 },
    ],
  },
  {
    id: 'p4',
    cliente_nome: 'Patrícia Alves Nogueira',
    cliente_whatsapp: '(62) 96666-4004',
    cliente_endereco: 'Rua das Acácias, 789, Bairro das Nações, Aparecida de Goiânia - GO',
    frete_valor: 1400,
    total: 13400,
    status: 'pendente',
    created_at: '2026-07-22T09:00:00',
    itens: [
      { produto_nome: 'Vestido Florido Azul', quantidade: 1, preco_unitario: 8900 },
      { produto_nome: 'Vestido Cropped Verde', quantidade: 2, preco_unitario: 7500 },
    ],
  },
  {
    id: 'p5',
    cliente_nome: 'Renata Costa Lima',
    cliente_whatsapp: '(62) 95555-5005',
    cliente_endereco: 'Rua da Paz, 321, Setor Central, Aparecida de Goiânia - GO',
    frete_valor: 1000,
    total: 22000,
    status: 'pago',
    created_at: '2026-07-20T16:20:00',
    itens: [
      { produto_nome: 'Vestido Midi Preto', quantidade: 2, preco_unitario: 11000 },
    ],
  },
];

// ── UTILITÁRIOS ──

function formatarCentavos(valor) {
  return 'R$ ' + (valor / 100).toFixed(2).replace('.', ',');
}

function formatarData(iso) {
  const d = new Date(iso);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  const horas = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} às ${horas}:${min}`;
}

function gerarImagemVestido(nome, cor) {
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="533" viewBox="0 0 400 533">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + cor + '"/><stop offset="100%" stop-color="' + escurecer(cor, 30) + '"/></linearGradient></defs>' +
    '<rect width="400" height="533" fill="url(#g)"/>' +
    '<g transform="translate(200,210)">' +
    // Hanger hook
    '<path d="M-8-85 Q0-105 8-85" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M-2-87 L-2-65" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>' +
    // Shoulders and bodice
    '<path d="M-60 10 Q-30-10 0-15 Q30-10 60 10 L70 60 Q60 75 45 80 Q20 90 0 95 Q-20 90-45 80 Q-60 75-70 60 Z" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>' +
    // Neckline
    '<path d="M-50 15 Q0 35 50 15" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>' +
    // Waist
    '<line x1="-55" y1="85" x2="55" y2="85" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>' +
    // Skirt - A-line
    '<path d="M-45 85 Q-60 120-80 180 Q-110 260-120 330 Q-80 345 0 350 Q80 345 120 330 Q110 260 80 180 Q60 120 45 85 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>' +
    // Center seam
    '<line x1="0" y1="15" x2="0" y2="340" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>' +
    // Sleeves
    '<path d="M-60 15 Q-85 30-90 55 Q-75 55-65 45 Q-55 35-50 25" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>' +
    '<path d="M60 15 Q85 30 90 55 Q75 55 65 45 Q55 35 50 25" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>' +
    '</g>' +
    '<text x="200" y="485" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-family="sans-serif" font-size="13">' + nome + '</text>' +
    '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function escurecer(cor, quantia) {
  var num = parseInt(cor.replace('#', ''), 16);
  var r = Math.max(0, (num >> 16) - quantia);
  var g = Math.max(0, ((num >> 8) & 0xFF) - quantia);
  var b = Math.max(0, (num & 0xFF) - quantia);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function statusLabel(s) {
  const map = { pendente: 'Pendente', pago: 'Pago', entregue: 'Entregue' };
  return map[s] || s;
}

// ── TOAST DE AVISO FUTURO ──

function mostrarAviso(dia) {
  const aviso = document.getElementById('aviso-futuro');
  if (aviso) {
    const msg = dia === 9
      ? 'Extrair pedido com IA estará disponível no dia 9.'
      : dia === 5
        ? 'Login real estará disponível no dia 5.'
        : `Disponível no dia ${dia}.`;
    aviso.textContent = msg;
    aviso.classList.add('visivel');
    setTimeout(() => aviso.classList.remove('visivel'), 4000);
  }
}

// ── NAVEGAÇÃO MOBILE ──

function toggleNav() {
  document.querySelector('.top-bar').classList.toggle('nav-aberto');
}

document.addEventListener('click', function(e) {
  var link = e.target.closest('.nav a');
  if (link) {
    var bar = document.querySelector('.top-bar');
    if (bar) bar.classList.remove('nav-aberto');
  }
});

// ── ADMIN ──

async function isAdmin() {
  var { data } = await supabase.auth.getSession();
  if (!data.session) return false;
  var { data: resultado } = await supabase.rpc('is_admin');
  return resultado === true;
}

// ── CARRINHO (localStorage) ──

function carrinhoGet() {
  try { return JSON.parse(localStorage.getItem('carrinho')) || []; } catch(e) { return []; }
}

function carrinhoSalvar(itens) {
  localStorage.setItem('carrinho', JSON.stringify(itens));
}

function carrinhoAdd(produto, tamanho, quantidade) {
  var itens = carrinhoGet();
  itens.push({
    produto_id: produto.id,
    nome: produto.nome,
    preco: produto.preco,
    tamanho: tamanho,
    quantidade: quantidade
  });
  carrinhoSalvar(itens);
}

function carrinhoRemover(index) {
  var itens = carrinhoGet();
  itens.splice(index, 1);
  carrinhoSalvar(itens);
}

function carrinhoLimpar() {
  localStorage.removeItem('carrinho');
}

function carrinhoContar() {
  return carrinhoGet().length;
}

// ── VALIDAÇÃO ──

function validarInteiroPositivo(valor, nomeCampo) {
  var num = parseInt(valor);
  if (isNaN(num) || num < 1) return nomeCampo + ' precisa ser um número inteiro maior que zero.';
  if (String(valor).includes('.') || String(valor).includes(',')) return nomeCampo + ' não pode ter vírgula ou ponto. Use número inteiro.';
  return null;
}

function validarPrecoCentavos(valor, nomeCampo) {
  var num = parseInt(valor);
  if (isNaN(num) || num < 1) return nomeCampo + ' precisa ser um valor maior que zero (em centavos).';
  return null;
}

function validarTextoPreenchido(valor, nomeCampo) {
  if (!valor || valor.trim().length === 0) return nomeCampo + ' não pode ficar vazio.';
  if (valor.trim().length > 500) return nomeCampo + ' está muito longo (máximo 500 caracteres).';
  return null;
}

// ── AUTH ──

function mostrarTab(tab) {
  document.getElementById('form-entrar').style.display = tab === 'entrar' ? 'block' : 'none';
  document.getElementById('form-cadastrar').style.display = tab === 'cadastrar' ? 'block' : 'none';
  document.getElementById('tab-entrar').classList.toggle('ativo', tab === 'entrar');
  document.getElementById('tab-cadastrar').classList.toggle('ativo', tab === 'cadastrar');
  var err = document.getElementById('login-erro');
  if (err) { err.textContent = ''; err.style.display = 'none'; }
}

function mostrarErroLogin(msg) {
  var el = document.getElementById('login-erro');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function traduzirErroAuth(msg) {
  var m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar. Olhe sua caixa de entrada.';
  if (m.includes('user already registered')) return 'Este e-mail já tem uma conta. Tente "Entrar" em vez de "Cadastrar".';
  if (m.includes('password should be at least 6')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (m.includes('rate limit') || m.includes('rate_limit')) return 'Você tentou muitas vezes. Espere um minuto e tente de novo.';
  return msg;
}

async function fazerLogin() {
  var email = document.getElementById('email').value.trim();
  var senha = document.getElementById('senha').value;
  if (!email || !senha) { mostrarErroLogin('Preencha o e-mail e a senha.'); return; }

  var btn = document.querySelector('#form-entrar .btn');
  btn.disabled = true;
  btn.textContent = 'Entrando…';

  var { error } = await supabase.auth.signInWithPassword({ email, password: senha }); // ← { error }

  btn.disabled = false;
  btn.textContent = 'Entrar';

  if (error) { mostrarErroLogin(traduzirErroAuth(error.message)); return; }

  carrinhoLimpar();

  var redirect = new URLSearchParams(window.location.search).get('redirect') || 'pedidos.html';
  window.location.href = redirect;
}

async function fazerCadastro() {
  var email = document.getElementById('email-cadastro').value.trim();
  var senha = document.getElementById('senha-cadastro').value;
  if (!email || !senha) { mostrarErroLogin('Preencha o e-mail e a senha.'); return; }
  if (senha.length < 6) { mostrarErroLogin('A senha precisa ter pelo menos 6 caracteres.'); return; }

  var btn = document.querySelector('#form-cadastrar .btn');
  btn.disabled = true;
  btn.textContent = 'Cadastrando…';

  var { error } = await supabase.auth.signUp({ email, password: senha }); // ← { error }

  btn.disabled = false;
  btn.textContent = 'Criar Conta';

  if (error) { mostrarErroLogin(traduzirErroAuth(error.message)); return; }

  mostrarErroLogin('Conta criada! Confira seu e-mail para confirmar. Depois faça login.');
}

async function estaLogado() {
  var { data } = await supabase.auth.getSession();
  return !!data.session;
}

async function fazerLogout() {
  carrinhoLimpar();
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}

// ── PROTEGER PÁGINA ──

var _protegendo = false;
// Mostra ou esconde o rotulo "Protegido" e os divisores do menu
// So aparecem quando Iraides (admin) esta logada
async function ajustarNav() {
  var admin = await isAdmin();
  if (admin) {
    document.body.classList.add('admin');
    document.querySelectorAll('.nav-carrinho').forEach(function(el) {
      el.style.display = 'none';
    });
  }
}

async function protegerPagina() {
  if (_protegendo) return;
  _protegendo = true;
  var logado = await estaLogado();
  if (!logado) {
    window.location.href = 'login.html?redirect=' + window.location.pathname;
    return;
  }
  _protegendo = false;
}
