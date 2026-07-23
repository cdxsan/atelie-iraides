// ── DADOS DE EXEMPLO ──

const vestidos = [
  { id: 'v1', nome: 'Vestido Florido Azul', descricao: 'Curto, manga curta, tecido leve. Ideal para passeios diurnos de fim de semana.', preco: 8900, disponivel: true },
  { id: 'v2', nome: 'Vestido Linho Bege', descricao: 'Midi, alça fina, tecido de linho. Fresco e elegante para dias quentes.', preco: 12000, disponivel: true },
  { id: 'v3', nome: 'Vestido Estampado Vermelho', descricao: 'Longo, estampa floral, decote V. Perfeito para eventos durante o dia.', preco: 9500, disponivel: true },
  { id: 'v4', nome: 'Vestido Midi Preto', descricao: 'Midi, gola redonda, tecido acetinado. Básico versátil do armário.', preco: 11000, disponivel: true },
  { id: 'v5', nome: 'Vestido Cropped Verde', descricao: 'Curto, modelo cropped, tecido viscolycra. Moderno e confortável.', preco: 7500, disponivel: false },
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

// ── SIMULAÇÃO DE LOGIN ──

function simularLogin() {
  localStorage.setItem('logado', 'true');
  window.location.href = 'pedidos.html';
}

function simularLogout() {
  localStorage.removeItem('logado');
  window.location.href = 'index.html';
}

function estaLogado() {
  return localStorage.getItem('logado') === 'true';
}

// ── PROTEGER PÁGINA ──

function protegerPagina() {
  if (!estaLogado()) {
    window.location.href = 'login.html?redirect=' + window.location.pathname;
  }
}
