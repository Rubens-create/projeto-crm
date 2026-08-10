const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const initials = name => name.split(' ').map(part => part[0]).slice(0, 2).join('');

const proForm = document.querySelector('#proForm');
const proList = document.querySelector('#proList');
const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

if (proForm) {
  proForm.onsubmit = (e) => {
    e.preventDefault();
    const data = new FormData(proForm);
    const name = data.get('name');
    const specialty = data.get('specialty');
    const phone = data.get('phone');
    const rate = parseFloat(data.get('rate'));

    const newCard = document.createElement('article');
    newCard.className = 'pro-detail-card';
    newCard.innerHTML = `
      <span class="avatar big">${initials(name)}</span>
      <div class="pro-detail-info">
        <h3>${name}</h3>
        <p>${specialty}</p>
        <div class="pro-meta-badges">
          <span><i data-lucide="phone"></i> ${phone}</span>
          <span><i data-lucide="star"></i> ⭐ Novo Profissional</span>
        </div>
      </div>
      <div class="pro-detail-rate">
        <strong>${money(rate)}</strong>
        <small>/ hora</small>
        <span class="status-pill active"><i data-lucide="check"></i> Ativo</span>
      </div>
    `;

    proList.prepend(newCard);
    proForm.reset();
    if (window.lucide) lucide.createIcons();
    showToast('Profissional cadastrado com sucesso!');
  };
}
