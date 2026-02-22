/**
 * Instagram Feed Widget
 * =====================
 * Uses the Instagram Basic Display API to fetch and render your latest posts.
 *
 * SETUP
 * -----
 * 1. Go to https://developers.facebook.com/ and create a Meta app.
 * 2. Add the "Instagram Basic Display" product to your app.
 * 3. Under Instagram Basic Display → Instagram Testers, add your account.
 * 4. Accept the tester invitation on your Instagram account.
 * 5. Generate a User Token (short-lived), then exchange it for a
 *    Long-Lived Token (valid 60 days, refreshable).
 * 6. Paste the long-lived token below.
 *
 * REFRESH
 * -------
 * Long-lived tokens expire after 60 days. Refresh them with:
 *   GET https://graph.instagram.com/refresh_access_token
 *       ?grant_type=ig_refresh_token
 *       &access_token=<your-token>
 *
 * Or use a scheduled GitHub Action / Netlify function to auto-refresh.
 */

// ─── Configuration ───────────────────────────────────────────────────────────
const INSTAGRAM_CONFIG = {
  /** Paste your long-lived Instagram Basic Display access token here */
  token: '',

  /** Number of posts to display (max 20 per API call) */
  count: 9,

  /** Instagram username shown as fallback link */
  username: 'keagr',
};
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const feedEl   = document.getElementById('instagramFeed');
  const setupEl  = document.getElementById('instagramSetup');

  if (!feedEl) return;

  /** Render a single Instagram media item */
  function createItem(post) {
    const a = document.createElement('a');
    a.href        = post.permalink;
    a.target      = '_blank';
    a.rel         = 'noopener noreferrer';
    a.className   = 'insta-item';
    a.setAttribute('aria-label', `Instagram post: ${post.caption ? post.caption.slice(0, 80) : 'View on Instagram'}`);

    const imgSrc = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;

    a.innerHTML = `
      <img src="${escapeAttr(imgSrc)}" alt="${escapeAttr(post.caption ? post.caption.slice(0, 120) : 'Instagram photo')}" loading="lazy" />
      <div class="insta-overlay">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
        </svg>
        <span>View on Instagram</span>
      </div>
    `;
    return a;
  }

  /** Render skeleton placeholders while loading */
  function showSkeleton() {
    feedEl.innerHTML = '';
    feedEl.className = 'insta-skeleton';
    for (let i = 0; i < INSTAGRAM_CONFIG.count; i++) {
      const div = document.createElement('div');
      div.className = 'insta-skeleton-item';
      feedEl.appendChild(div);
    }
  }

  /** Render the fetched posts */
  function renderFeed(posts) {
    feedEl.innerHTML = '';
    feedEl.className = 'instagram-feed';
    posts.forEach(function (post) {
      feedEl.appendChild(createItem(post));
    });
  }

  /** Show the setup instructions card */
  function showSetup() {
    feedEl.remove();
    if (setupEl) setupEl.hidden = false;
  }

  /** Fetch media from the Instagram Basic Display API */
  function fetchFeed(token, count) {
    const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';
    const url    = `https://graph.instagram.com/me/media?fields=${fields}&limit=${count}&access_token=${encodeURIComponent(token)}`;

    showSkeleton();

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('API error: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data.data || data.data.length === 0) {
          showSetup();
          return;
        }
        renderFeed(data.data);
      })
      .catch(function (err) {
        console.warn('[Instagram Widget] Failed to fetch feed:', err.message);
        showSetup();
      });
  }

  /** Minimal HTML attribute escaping */
  function escapeAttr(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ── Entry point ─────────────────────────────────────────────────────────────
  if (INSTAGRAM_CONFIG.token && INSTAGRAM_CONFIG.token.trim() !== '') {
    fetchFeed(INSTAGRAM_CONFIG.token.trim(), INSTAGRAM_CONFIG.count);
  } else {
    // No token configured — show setup guide
    showSetup();
  }

})();
