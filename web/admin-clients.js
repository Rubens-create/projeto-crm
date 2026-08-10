const clientForm = document.querySelector('#clientForm');
const clientList = document.querySelector('#clientList');
const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

if (clientForm) {
  clientForm.onsubmit = (e) => {
    e.preventDefault();
    const data = new FormData(clientForm);
    const name = data.get('name');
    const propertyName = data.get('propertyName');
    const address = data.get('address');
    const phone = data.get('phone');

    const newCard = document.createElement('article');
    newCard.className = 'client-card';
    newCard.innerHTML = `
      <div class="client-card-icon"><i data-lucide="home"></i></div>
      <div class="client-card-details">
        <h3>${name}</h3>
        <p>Proprietário(a): <strong>${propertyName}</strong></p>
        <small><i data-lucide="map-pin"></i> ${address}</small>
        <small><i data-lucide="phone"></i> ${phone}</small>
      </div>
      <div class="client-card-badge">
        <span class="badge-tag">Contrato Ativo</span>
      </div>
    `;

    clientList.prepend(newCard);
    clientForm.reset();
    if (window.lucide) lucide.createIcons();
    showToast('Proprietário cadastrado com sucesso!');
  };
}
