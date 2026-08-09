(function() {
  // ===== MENU =====
  const menuBtn = document.getElementById('menuBtn');
  const sidepanel = document.getElementById('sidepanel');
  const navItems = document.querySelectorAll('.nav-item');
  const pages = {
    page1: document.getElementById('page1'),
    page2: document.getElementById('page2'),
    page3: document.getElementById('page3'),
    page4: document.getElementById('page4')
  };

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sidepanel.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!sidepanel.contains(e.target) && e.target !== menuBtn && !menuBtn.contains(e.target)) {
      sidepanel.classList.remove('open');
    }
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.dataset.page;
      if (!pageId) return;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      Object.keys(pages).forEach(key => {
        pages[key].classList.toggle('active', key === pageId);
      });
      sidepanel.classList.remove('open');
      if (pageId === 'page2') {
        const qrContainer = document.getElementById('qrcode');
        if (qrContainer.children.length === 0) generateQR();
      }
    });
  });

  // ===== QR KOD =====
  const typeBtns = document.querySelectorAll('.qr-type-btn');
  const fieldText = document.getElementById('field-text');
  const fieldWifi = document.getElementById('field-wifi');
  const fieldContact = document.getElementById('field-contact');

  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.type;
      fieldText.style.display = (type === 'text') ? 'block' : 'none';
      fieldWifi.style.display = (type === 'wifi') ? 'block' : 'none';
      fieldContact.style.display = (type === 'contact') ? 'block' : 'none';
      generateQR();
    });
  });

  let qrCodeInstance = null;
  const qrContainer = document.getElementById('qrcode');
  const qrSize = document.getElementById('qrSize');
  const qrColorDark = document.getElementById('qrColorDark');

  const qrText = document.getElementById('qrText');
  const wifiSsid = document.getElementById('wifiSsid');
  const wifiPassword = document.getElementById('wifiPassword');
  const wifiEncryption = document.getElementById('wifiEncryption');
  const contactName = document.getElementById('contactName');
  const contactPhone = document.getElementById('contactPhone');
  const contactEmail = document.getElementById('contactEmail');

  function getQRContent() {
    const activeType = document.querySelector('.qr-type-btn.active');
    const type = activeType ? activeType.dataset.type : 'text';
    if (type === 'wifi') {
      const ssid = wifiSsid.value.trim() || 'WiFi';
      const pass = wifiPassword.value.trim() || '';
      const enc = wifiEncryption.value;
      if (enc === 'nopass') return `WIFI:T:nopass;S:${ssid};;`;
      else return `WIFI:T:${enc};S:${ssid};P:${pass};;`;
    } else if (type === 'contact') {
      const name = contactName.value.trim() || 'Kişi';
      const phone = contactPhone.value.trim() || '';
      const email = contactEmail.value.trim() || '';
      let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\n`;
      if (phone) vcard += `TEL:${phone}\n`;
      if (email) vcard += `EMAIL:${email}\n`;
      vcard += `END:VCARD`;
      return vcard;
    } else {
      return qrText.value.trim() || 'https://zeld.com';
    }
  }

  function generateQR() {
    const text = getQRContent();
    const size = parseInt(qrSize.value, 10) || 200;
    const dark = qrColorDark.value || '#00f3ff';
    const light = '#ffffff';
    qrContainer.innerHTML = '';
    try {
      qrCodeInstance = new QRCode(qrContainer, {
        text: text,
        width: size,
        height: size,
        colorDark: dark,
        colorLight: light,
        correctLevel: QRCode.CorrectLevel.H
      });
    } catch (e) {
      try {
        qrCodeInstance = new QRCode(qrContainer, {
          text: text || ' ',
          width: size,
          height: size,
          colorDark: dark,
          colorLight: light,
          correctLevel: QRCode.CorrectLevel.H
        });
      } catch (e2) {
        qrContainer.innerHTML = '<canvas></canvas>';
        const canvas = qrContainer.querySelector('canvas');
        if (canvas) {
          canvas.width = size; canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = dark; ctx.font = '14px sans-serif';
          ctx.textAlign = 'center'; ctx.fillText('QR', size/2, size/2+5);
        }
      }
    }
  }

  setTimeout(generateQR, 100);

  document.getElementById('generateQRBtn').addEventListener('click', generateQR);

  const qrInputs = [qrText, wifiSsid, wifiPassword, wifiEncryption, contactName, contactPhone, contactEmail, qrSize, qrColorDark];
  qrInputs.forEach(el => {
    if (el) {
      el.addEventListener('input', generateQR);
      el.addEventListener('change', generateQR);
    }
  });

  document.getElementById('downloadQRBtn').addEventListener('click', () => {
    const canvas = qrContainer.querySelector('canvas');
    if (!canvas) { alert('Önce QR oluşturun!'); return; }
    const link = document.createElement('a');
    link.download = 'qr-kod.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // ===== PIXEL ART MAKER =====
  const gridCols = document.getElementById('gridCols');
  const gridRows = document.getElementById('gridRows');
  const pixelColor = document.getElementById('pixelColor');
  const pixelGrid = document.getElementById('pixelGrid');
  const createGridBtn = document.getElementById('createGridBtn');
  const clearGridBtn = document.getElementById('clearGridBtn');
  const downloadPixelBtn = document.getElementById('downloadPixelBtn');
  const exportPixelBtn = document.getElementById('exportPixelBtn');
  const pixelCount = document.getElementById('pixelCount');
  const presets = document.querySelectorAll('.preset');
  const paintModeBtn = document.getElementById('paintModeBtn');
  const eraseModeBtn = document.getElementById('eraseModeBtn');

  let isDrawing = false;
  let isEraseMode = false;
  let currentColor = '#00f3ff';
  let gridData = [];

  paintModeBtn.addEventListener('click', () => {
    paintModeBtn.classList.add('active');
    eraseModeBtn.classList.remove('active');
    isEraseMode = false;
  });

  eraseModeBtn.addEventListener('click', () => {
    eraseModeBtn.classList.add('active');
    paintModeBtn.classList.remove('active');
    isEraseMode = true;
  });

  presets.forEach(preset => {
    preset.addEventListener('click', () => {
      presets.forEach(p => p.classList.remove('active'));
      preset.classList.add('active');
      currentColor = preset.dataset.color;
      pixelColor.value = currentColor;
    });
  });

  pixelColor.addEventListener('input', () => {
    currentColor = pixelColor.value;
    presets.forEach(p => p.classList.remove('active'));
    presets.forEach(p => {
      if (p.dataset.color.toLowerCase() === currentColor.toLowerCase()) {
        p.classList.add('active');
      }
    });
  });

  function createGrid() {
    const cols = parseInt(gridCols.value) || 16;
    const rows = parseInt(gridRows.value) || 16;
    const clampedCols = Math.min(Math.max(cols, 4), 50);
    const clampedRows = Math.min(Math.max(rows, 4), 50);
    gridCols.value = clampedCols;
    gridRows.value = clampedRows;

    pixelGrid.style.gridTemplateColumns = `repeat(${clampedCols}, 1fr)`;
    pixelGrid.innerHTML = '';
    gridData = [];

    for (let r = 0; r < clampedRows; r++) {
      gridData[r] = [];
      for (let c = 0; c < clampedCols; c++) {
        gridData[r][c] = null;
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.style.background = '#1a1f2b';

        cell.addEventListener('mousedown', (e) => {
          e.preventDefault();
          if (e.button === 0) {
            isDrawing = true;
            paintCell(cell);
          }
        });

        cell.addEventListener('mouseenter', (e) => {
          if (isDrawing && e.buttons === 1) {
            paintCell(cell);
          }
        });

        cell.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          const row = parseInt(cell.dataset.row);
          const col = parseInt(cell.dataset.col);
          gridData[row][col] = null;
          cell.style.background = '#1a1f2b';
          updatePixelCount();
        });

        let longPressTimer = null;
        let isLongPress = false;

        cell.addEventListener('touchstart', (e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const target = document.elementFromPoint(touch.clientX, touch.clientY);
          
          longPressTimer = setTimeout(() => {
            isLongPress = true;
            if (target && target.classList.contains('cell')) {
              paintCell(target);
            }
          }, 300);
        }, { passive: false });

        cell.addEventListener('touchmove', (e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const target = document.elementFromPoint(touch.clientX, touch.clientY);
          
          if (isLongPress && target && target.classList.contains('cell')) {
            paintCell(target);
          }
        }, { passive: false });

        cell.addEventListener('touchend', (e) => {
          e.preventDefault();
          clearTimeout(longPressTimer);
          if (!isLongPress) {
            const touch = e.changedTouches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            if (target && target.classList.contains('cell')) {
              paintCell(target);
            }
          }
          isLongPress = false;
        }, { passive: false });

        cell.addEventListener('touchcancel', () => {
          clearTimeout(longPressTimer);
          isLongPress = false;
        });

        pixelGrid.appendChild(cell);
      }
    }
    updatePixelCount();
  }

  function paintCell(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    if (isEraseMode) {
      gridData[row][col] = null;
      cell.style.background = '#1a1f2b';
    } else {
      gridData[row][col] = currentColor;
      cell.style.background = currentColor;
    }
    updatePixelCount();
  }

  function updatePixelCount() {
    let count = 0;
    for (let r = 0; r < gridData.length; r++) {
      for (let c = 0; c < gridData[r].length; c++) {
        if (gridData[r][c] !== null) count++;
      }
    }
    pixelCount.textContent = count;
  }

  document.addEventListener('mouseup', () => {
    isDrawing = false;
  });

  createGridBtn.addEventListener('click', createGrid);

  clearGridBtn.addEventListener('click', () => {
    for (let r = 0; r < gridData.length; r++) {
      for (let c = 0; c < gridData[r].length; c++) {
        gridData[r][c] = null;
        const cells = pixelGrid.children;
        const idx = r * gridData[0].length + c;
        if (cells[idx]) {
          cells[idx].style.background = '#1a1f2b';
        }
      }
    }
    updatePixelCount();
  });

  downloadPixelBtn.addEventListener('click', () => {
    const cols = gridData[0]?.length || 16;
    const rows = gridData.length || 16;
    const totalSize = 20 * Math.max(cols, rows);

    const canvas = document.createElement('canvas');
    canvas.width = totalSize;
    canvas.height = totalSize;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, totalSize, totalSize);

    const scale = totalSize / Math.max(cols, rows);
    const size = scale * 0.9;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const color = gridData[r]?.[c];
        if (color) {
          ctx.fillStyle = color;
          const x = c * scale + (scale - size) / 2;
          const y = r * scale + (scale - size) / 2;
          ctx.fillRect(x, y, size, size);
        }
      }
    }

    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  exportPixelBtn.addEventListener('click', () => {
    const data = {
      cols: gridData[0]?.length || 16,
      rows: gridData.length || 16,
      pixels: gridData
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'pixel-art.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  });

  createGrid();

  // ===== RESİM AYARLARI =====
  const uploadArea = document.getElementById('uploadArea');
  const imageInput = document.getElementById('imageInput');
  const previewArea = document.getElementById('previewArea');
  const previewImage = document.getElementById('previewImage');
  const changeImageBtn = document.getElementById('changeImageBtn');
  const outputFormat = document.getElementById('outputFormat');
  const qualityRange = document.getElementById('qualityRange');
  const qualityValue = document.getElementById('qualityValue');
  const resizeWidth = document.getElementById('resizeWidth');
  const resizeHeight = document.getElementById('resizeHeight');
  const keepAspect = document.getElementById('keepAspect');
  const imageFilter = document.getElementById('imageFilter');
  const imageRotate = document.getElementById('imageRotate');
  const imageFlip = document.getElementById('imageFlip');
  const applySettingsBtn = document.getElementById('applySettingsBtn');
  const resetImageBtn = document.getElementById('resetImageBtn');

  let originalImageData = null;
  let currentImageData = null;
  let originalWidth = 0;
  let originalHeight = 0;

  qualityRange.addEventListener('input', () => {
    qualityValue.textContent = qualityRange.value + '%';
  });

  function loadImage(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        originalWidth = img.width;
        originalHeight = img.height;
        originalImageData = img;
        currentImageData = img;
        previewImage.src = event.target.result;
        previewArea.classList.add('show');
        uploadArea.style.display = 'none';
        resizeWidth.placeholder = originalWidth;
        resizeHeight.placeholder = originalHeight;
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  uploadArea.addEventListener('click', () => imageInput.click());

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadImage(file);
  });

  changeImageBtn.addEventListener('click', () => {
    imageInput.click();
  });

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--accent)';
    uploadArea.style.background = 'var(--accent-soft)';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--border)';
    uploadArea.style.background = 'transparent';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--border)';
    uploadArea.style.background = 'transparent';
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  });

  resizeWidth.addEventListener('input', () => {
    if (keepAspect.checked && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      const w = parseInt(resizeWidth.value) || 0;
      if (w > 0) {
        resizeHeight.value = Math.round(w * ratio);
      }
    }
  });

  resizeHeight.addEventListener('input', () => {
    if (keepAspect.checked && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      const h = parseInt(resizeHeight.value) || 0;
      if (h > 0) {
        resizeWidth.value = Math.round(h * ratio);
      }
    }
  });

  applySettingsBtn.addEventListener('click', () => {
    if (!originalImageData) {
      alert('Lütfen önce bir resim yükleyin!');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let width = parseInt(resizeWidth.value) || originalWidth;
    let height = parseInt(resizeHeight.value) || originalHeight;

    if (keepAspect.checked) {
      const ratio = originalWidth / originalHeight;
      if (resizeWidth.value && !resizeHeight.value) {
        height = Math.round(width / ratio);
      } else if (!resizeWidth.value && resizeHeight.value) {
        width = Math.round(height * ratio);
      }
    }

    canvas.width = width;
    canvas.height = height;

    const filter = imageFilter.value;
    if (filter !== 'none') {
      ctx.filter = filter;
    }

    const rotate = parseInt(imageRotate.value);
    if (rotate > 0) {
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);
    }

    const flip = imageFlip.value;
    if (flip === 'horizontal') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    } else if (flip === 'vertical') {
      ctx.translate(0, height);
      ctx.scale(1, -1);
    }

    ctx.drawImage(originalImageData, 0, 0, width, height);

    const format = outputFormat.value;
    const quality = parseInt(qualityRange.value) / 100;

    const link = document.createElement('a');
    const ext = format.split('/')[1];
    link.download = `donusturulmus.${ext === 'jpeg' ? 'jpg' : ext}`;
    link.href = canvas.toDataURL(format, quality);
    link.click();
  });

  resetImageBtn.addEventListener('click', () => {
    if (originalImageData) {
      previewImage.src = originalImageData.src;
      currentImageData = originalImageData;
      resizeWidth.value = '';
      resizeHeight.value = '';
      resizeWidth.placeholder = originalWidth;
      resizeHeight.placeholder = originalHeight;
      imageFilter.value = 'none';
      imageRotate.value = '0';
      imageFlip.value = 'none';
      qualityRange.value = '92';
      qualityValue.textContent = '92%';
      outputFormat.value = 'image/png';
    }
  });

  // ===== KIRPICI =====
  const fileInput = document.getElementById('file-input');
  const uploadUi = document.getElementById('upload-ui');
  const cropWrapper = document.getElementById('crop-wrapper');
  const sourceImg = document.getElementById('source-image');
  const cropBox = document.getElementById('crop-box');
  const previewCanvas = document.getElementById('preview-canvas');
  const downloadBtn = document.getElementById('download-btn');
  const resetBtn = document.getElementById('reset-btn');
  const shapeButtons = document.querySelectorAll('.shape-btn');

  let currentAction = null;
  let activeHandle = null;
  let startX, startY, startLeft, startTop, startWidth, startHeight;
  let activeRatio = 0;
  let activeShape = 'free';

  function clientPos(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      sourceImg.src = e.target.result;
      sourceImg.onload = () => {
        uploadUi.style.display = 'none';
        cropWrapper.style.display = 'block';
        const w = sourceImg.clientWidth;
        const h = sourceImg.clientHeight;
        const size = Math.min(w, h) * 0.6;
        cropBox.style.width = size + 'px';
        cropBox.style.height = size + 'px';
        cropBox.style.left = ((w - size) / 2) + 'px';
        cropBox.style.top = ((h - size) / 2) + 'px';
        downloadBtn.disabled = false;
        updatePreview();
      };
    };
    reader.readAsDataURL(file);
  });

  shapeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      shapeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeShape = btn.dataset.shape;
      activeRatio = parseFloat(btn.dataset.ratio);
      cropBox.classList.toggle('round', activeShape === 'circle');
      if (activeRatio > 0 && sourceImg.clientWidth) {
        const maxW = cropWrapper.clientWidth;
        const maxH = sourceImg.clientHeight;
        let newW = cropBox.offsetWidth;
        let newH = newW / activeRatio;
        if (newH > maxH) { newH = maxH; newW = newH * activeRatio; }
        if (newW > maxW) { newW = maxW; newH = newW / activeRatio; }
        let left = cropBox.offsetLeft;
        let top = cropBox.offsetTop;
        if (left + newW > maxW) left = Math.max(0, maxW - newW);
        if (top + newH > maxH) top = Math.max(0, maxH - newH);
        cropBox.style.width = newW + 'px';
        cropBox.style.height = newH + 'px';
        cropBox.style.left = left + 'px';
        cropBox.style.top = top + 'px';
      }
      updatePreview();
    });
  });

  cropBox.addEventListener('pointerdown', startAction);

  function startAction(e) {
    e.preventDefault();
    const pos = clientPos(e);
    cropBox.setPointerCapture && e.pointerId !== undefined && cropBox.setPointerCapture(e.pointerId);
    startX = pos.x;
    startY = pos.y;
    startLeft = cropBox.offsetLeft;
    startTop = cropBox.offsetTop;
    startWidth = cropBox.offsetWidth;
    startHeight = cropBox.offsetHeight;
    if (e.target.classList.contains('handle')) {
      currentAction = 'resize';
      activeHandle = e.target.getAttribute('data-handle');
    } else {
      currentAction = 'move';
    }
    document.addEventListener('pointermove', doAction);
    document.addEventListener('pointerup', endAction);
    document.addEventListener('pointercancel', endAction);
  }

  function doAction(e) {
    if (!currentAction) return;
    e.preventDefault();
    const pos = clientPos(e);
    const dx = pos.x - startX;
    const dy = pos.y - startY;
    const maxW = cropWrapper.clientWidth;
    const maxH = sourceImg.clientHeight || cropWrapper.clientHeight;

    if (currentAction === 'move') {
      let newLeft = Math.max(0, Math.min(startLeft + dx, maxW - startWidth));
      let newTop = Math.max(0, Math.min(startTop + dy, maxH - startHeight));
      cropBox.style.left = newLeft + 'px';
      cropBox.style.top = newTop + 'px';
    } else if (currentAction === 'resize') {
      let newLeft = startLeft, newTop = startTop, newWidth = startWidth, newHeight = startHeight;
      if (activeRatio > 0) {
        const dir = (activeHandle === 'tl' || activeHandle === 'bl') ? -1 : 1;
        let delta = dx * dir;
        newWidth = Math.max(40, startWidth + delta);
        newHeight = newWidth / activeRatio;
        if (activeHandle.includes('l')) newLeft = startLeft + (startWidth - newWidth);
        if (activeHandle.includes('t')) newTop = startTop + (startHeight - newHeight);
        if (newLeft < 0) { newWidth += newLeft; newHeight = newWidth / activeRatio; newLeft = 0; if(activeHandle.includes('t')) newTop = startTop + (startHeight - newHeight); }
        if (newTop < 0) { newHeight += newTop; newWidth = newHeight * activeRatio; newTop = 0; if(activeHandle.includes('l')) newLeft = startLeft + (startWidth - newWidth); }
        if (newLeft + newWidth > maxW) { newWidth = maxW - newLeft; newHeight = newWidth / activeRatio; }
        if (newTop + newHeight > maxH) { newHeight = maxH - newTop; newWidth = newHeight * activeRatio; }
      } else {
        if (activeHandle.includes('r')) newWidth = Math.max(40, Math.min(startWidth + dx, maxW - startLeft));
        if (activeHandle.includes('b')) newHeight = Math.max(40, Math.min(startHeight + dy, maxH - startTop));
        if (activeHandle.includes('l')) { let potentialWidth = startWidth - dx; if (potentialWidth >= 40 && startLeft + dx >= 0) { newLeft = startLeft + dx; newWidth = potentialWidth; } }
        if (activeHandle.includes('t')) { let potentialHeight = startHeight - dy; if (potentialHeight >= 40 && startTop + dy >= 0) { newTop = startTop + dy; newHeight = potentialHeight; } }
      }
      cropBox.style.left = newLeft + 'px';
      cropBox.style.top = newTop + 'px';
      cropBox.style.width = newWidth + 'px';
      cropBox.style.height = newHeight + 'px';
    }
    updatePreview();
  }

  function endAction(e) {
    currentAction = null;
    activeHandle = null;
    document.removeEventListener('pointermove', doAction);
    document.removeEventListener('pointerup', endAction);
    document.removeEventListener('pointercancel', endAction);
  }

  function updatePreview() {
    if (!sourceImg.naturalWidth) return;
    const ctx = previewCanvas.getContext('2d');
    const scaleX = sourceImg.naturalWidth / sourceImg.clientWidth;
    const scaleY = sourceImg.naturalHeight / sourceImg.clientHeight;
    const cropX = cropBox.offsetLeft * scaleX;
    const cropY = cropBox.offsetTop * scaleY;
    const cropW = cropBox.offsetWidth * scaleX;
    const cropH = cropBox.offsetHeight * scaleY;
    previewCanvas.width = cropW;
    previewCanvas.height = cropH;
    ctx.clearRect(0, 0, cropW, cropH);
    if (activeShape === 'circle') {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cropW / 2, cropH / 2, cropW / 2, cropH / 2, 0, 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.drawImage(sourceImg, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    if (activeShape === 'circle') ctx.restore();
    previewCanvas.classList.toggle('round-preview', activeShape === 'circle');
  }

  window.addEventListener('resize', updatePreview);

  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'kirpilmis-gorsel.png';
    link.href = previewCanvas.toDataURL('image/png');
    link.click();
  });

  resetBtn.addEventListener('click', () => { location.reload(); });

})();
