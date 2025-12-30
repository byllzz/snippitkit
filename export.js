// export logic
const node = document.getElementById('panel-to-export');
const copyBtn = document.getElementById('copy');
const copyLinkBtn = document.getElementById('copy-link');
const downloadAsPNG = document.getElementById('download-as-png');
const downloadAsSVG = document.getElementById('download-as-svg');

const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const toastIcon = document.getElementById('toastIcon');

// Utility: show toast message
let toastTimer = null;
function showToast({ text = 'Copied', success = true, ms = 2200 } = {}) {
  if (!toast) return;
  // update visuals
  toastMsg.textContent = text;
  toastIcon.textContent = success ? '✓' : '!';
  toast.classList.add('show');
  toast.style.borderColor = success ? 'rgba(34,197,94,0.18)' : 'rgba(255,68,68,0.16)';
  // clear previous timeout
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, ms);
}

// download helper
const downloadUrl = (url, filename) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// save as PNG
downloadAsPNG?.addEventListener('click', async e => {
  e.preventDefault();
  try {
    const dataUrl = await domtoimage.toPng(node, { cacheBust: true });
    const name = document.querySelector('.the-code-title')?.value || 'panel.png';
    downloadUrl(dataUrl, name);
    showToast({ text: 'Exported Successfully !', ms: 2200, success: true });
  } catch (err) {
    alert('PNG export failed: ' + err);
  }
});

// save as SVG
downloadAsSVG?.addEventListener('click', async e => {
  e.preventDefault();
  try {
    let svgStr = await domtoimage.toSvg(node, { cacheBust: true });

    if (!svgStr.startsWith('<?xml')) {
      svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgStr;
    }

    //  blob
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const name = document.querySelector('.the-code-title')?.value || 'panel.svg';
    downloadUrl(url, name);

    setTimeout(() => URL.revokeObjectURL(url), 10000);
    showToast({ text: 'Exported Successfully !', ms: 2200, success: true });
  } catch (err) {
    alert('SVG export failed: ' + err);
  }
});

// copy image to clipboard (PNG)
copyBtn?.addEventListener('click', async e => {
  e.preventDefault();
  try {
    const blob = await domtoimage.toBlob(node, { cacheBust: true });

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showToast({ text: 'Image Copied !', ms: 2200, success: true });
  } catch (err) {
    alert(
      'Copy failed. Clipboard image write requires HTTPS and is not supported in all browsers. Error: ' +
        err,
    );
  }
});

// copy PNG data URL as text
copyLinkBtn?.addEventListener('click', async e => {
  e.preventDefault();
  try {
    const dataUrl = await domtoimage.toPng(node, { cacheBust: true });
    await navigator.clipboard.writeText(dataUrl);
    showToast({ text: 'Link Copied !', ms: 2200, success: true });
  } catch (err) {
    alert('Copy link failed: ' + err);
  }
});
