document.addEventListener("DOMContentLoaded", () => {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const content = lb.querySelector(".lightbox-content");
  const closeBtn = lb.querySelector(".lightbox-close");

  function buildYouTubeEmbed(src) {
    try {
      const url = new URL(src);
      const host = url.hostname.replace('www.', '');

      if (host.includes('youtube.com')) {
        // If it's already an /embed/ URL, just ensure autoplay
        if (url.pathname.startsWith('/embed/')) {
          url.searchParams.set('autoplay', '1');
          return url.toString();
        }
        // standard watch?v=ID
        const id = url.searchParams.get('v');
        url.searchParams.delete('v');
        const extra = url.searchParams.toString();
        return 'https://www.youtube.com/embed/' + id + (extra ? '?' + extra + '&autoplay=1' : '?autoplay=1');
      }

      if (host === 'youtu.be') {
        const id = url.pathname.replace(/^\//, '');
        const extra = url.searchParams.toString();
        return 'https://www.youtube.com/embed/' + id + (extra ? '?' + extra + '&autoplay=1' : '?autoplay=1');
      }

      // fallback: if contains watch?v= pattern
      if (src.includes('watch?v=')) {
        let s = src.replace('watch?v=', 'embed/');
        return s + (s.includes('?') ? '&autoplay=1' : '?autoplay=1');
      }

      return src;
    } catch (e) {
      if (!src) return src;
      if (src.includes('watch?v=')) {
        src = src.replace('watch?v=', 'embed/');
        return src + (src.includes('?') ? '&autoplay=1' : '?autoplay=1');
      }
      return src;
    }
  }

  document.querySelectorAll('.lb-trigger').forEach(el => {
    el.addEventListener('click', (e) => {
      const type = el.dataset.type;
      let src = el.dataset.src;

      // If this is an anchor without a data-src/type, allow default navigation
      if (el.tagName.toLowerCase() === 'a' && !type && !src) return;

      // prevent navigation for triggers that provide a source
      if (el.tagName.toLowerCase() === 'a' || el.tagName.toLowerCase() === 'button') {
        e.preventDefault();
      }

      content.innerHTML = '';

      if (type === 'youtube' && src) {
        const embed = buildYouTubeEmbed(src);
        // keep original watch URL for fallback
        let original = src;
        try {
          const u = new URL(src);
          if (u.hostname.includes('youtu.be')) {
            const id = u.pathname.replace(/^\//, '');
            original = 'https://www.youtube.com/watch?v=' + id;
          } else if (u.hostname.includes('youtube.com') && !u.searchParams.get('v')) {
            // if it's already an embed URL, try to reconstruct watch URL
            const parts = u.pathname.split('/');
            const idx = parts.indexOf('embed');
            if (idx >= 0 && parts[idx+1]) original = 'https://www.youtube.com/watch?v=' + parts[idx+1];
          }
        } catch (e) {}

        content.innerHTML = `
          <div class="lb-video-wrap">
            <iframe src="${embed}"
              frameborder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowfullscreen></iframe>
            <div class="lightbox-actions">
              <a class="open-original" href="${original}" target="_blank" rel="noopener noreferrer">Άνοιγμα στο YouTube</a>
            </div>
          </div>`;
      }

      if (type === 'image' && src) {
        content.innerHTML = `<img src="${src}" alt="">`;
      }

      if (type === 'pdf' && src) {
        content.innerHTML = `<iframe src="${src}"></iframe>`;
      }

      lb.classList.add('active');
    });
  });

  const close = () => {
    lb.classList.remove('active');
    content.innerHTML = '';
  };

  if (closeBtn) closeBtn.onclick = close;
  lb.onclick = e => e.target === lb && close();
});

