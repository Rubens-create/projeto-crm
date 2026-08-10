const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

const btnCSV = document.querySelector('#btnExportCSVPage');
if (btnCSV) {
  btnCSV.onclick = () => showToast('Download do relatório em CSV iniciado...');
}

const btnPDF = document.querySelector('#btnExportPDFPage');
if (btnPDF) {
  btnPDF.onclick = () => showToast('Gerando demonstrativo em PDF...');
}
