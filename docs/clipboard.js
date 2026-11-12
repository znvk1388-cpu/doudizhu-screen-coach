(function () {
  'use strict';
  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', async function () {
      var source = document.getElementById(button.dataset.copy), status = document.getElementById('copy-status');
      var text = source ? source.textContent.trim() : '';
      if (!text) { status.textContent = '没有可复制的内容。'; return; }
      var copied = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text); copied = true;
        }
      } catch (ignore) {}
      if (!copied) {
        var area = document.createElement('textarea');
        area.value = text; area.readOnly = true; area.setAttribute('aria-label','待复制的哈希');
        area.style.position = 'fixed'; area.style.left = '-9999px';
        document.body.appendChild(area); area.select();
        try { copied = document.execCommand('copy'); } catch (ignore) {}
        area.remove(); button.focus();
      }
      status.textContent = copied ? '已复制哈希。' : '复制失败，请长按或选中哈希手动复制。';
    });
  });
})();
