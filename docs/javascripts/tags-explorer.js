/**
 * Explorateur de tags — nuage à facettes + filtrage multi-tags.
 *
 * Monté sur <div id="tags-explorer" data-src="assets/tags.json">.
 * Aucune dépendance. Compatible navigation instantanée (document$).
 *
 * Accessibilité :
 *   - les tags sont de vrais <button aria-pressed>, atteignables au clavier
 *   - la taille de police n'est jamais le seul porteur d'information
 *     (le compteur est écrit en toutes lettres dans le label accessible)
 *   - le nombre de résultats est annoncé via une région aria-live
 *   - prefers-reduced-motion coupe les transitions
 */
(function () {
  'use strict';

  var CACHE = null;

  var ICONS = {
    server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
    network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    atom: '<circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>',
    house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    plug: '<path d="M12 22v-5M9 8V2M15 8V2M18 8v4a6 6 0 0 1-12 0V8Z"/>',
    layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m6.08 10.37-3.5 1.59a1 1 0 0 0 0 1.83l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.6"/>',
    terminal: '<path d="m4 17 6-6-6-6M12 19h8"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    tag: '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.41l8.7 8.71a2.43 2.43 0 0 0 3.42 0l6.58-6.59a2.43 2.43 0 0 0 0-3.41z"/><circle cx="7.5" cy="7.5" r="1"/>'
  };

  function icon(name) {
    var d = ICONS[name] || ICONS.tag;
    return '<svg class="tx-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fold(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // ── État ──────────────────────────────────────────────────────────────────

  function readState() {
    var params = new URLSearchParams(location.search);
    var tags = (params.get('tags') || '').split(/[,+ ]/).filter(Boolean);
    if (!tags.length && location.hash.length > 1) {
      tags = [decodeURIComponent(location.hash.slice(1))];
    }
    return {
      tags: tags,
      mode: params.get('mode') === 'or' ? 'or' : 'and',
      q: params.get('q') || ''
    };
  }

  function writeState(state) {
    var params = new URLSearchParams();
    if (state.tags.length) params.set('tags', state.tags.join(','));
    if (state.mode === 'or') params.set('mode', 'or');
    if (state.q) params.set('q', state.q);
    var qs = params.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }

  // ── Filtrage ──────────────────────────────────────────────────────────────

  function matchQuery(page, needle) {
    if (!needle) return true;
    return fold(page.t + ' ' + page.e + ' ' + page.s + ' ' + page.g.join(' ')).indexOf(needle) !== -1;
  }

  function matchTags(page, tags, mode) {
    if (!tags.length) return true;
    if (mode === 'or') {
      return tags.some(function (t) { return page.g.indexOf(t) !== -1; });
    }
    return tags.every(function (t) { return page.g.indexOf(t) !== -1; });
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────

  function weightOf(n, max) {
    if (max <= 1) return 3;
    return Math.min(5, 1 + Math.round((n / max) * 4));
  }

  function render(root, data, state) {
    var maxCount = 0;
    data.facets.forEach(function (f) {
      f.tags.forEach(function (t) { if (t.n > maxCount) maxCount = t.n; });
    });

    var needle = fold(state.q.trim());
    var base = data.pages.filter(function (p) { return matchQuery(p, needle); });
    var results = base.filter(function (p) { return matchTags(p, state.tags, state.mode); });

    // Compteur par tag : combien de résultats si on ajoutait ce tag
    function projected(slug) {
      if (state.tags.indexOf(slug) !== -1) {
        return results.length;
      }
      var next = state.tags.concat([slug]);
      return base.filter(function (p) { return matchTags(p, next, state.mode); }).length;
    }

    var html = [];

    // Barre de commande
    html.push('<div class="tx-bar">');
    html.push('<div class="tx-search">');
    html.push('<span class="tx-prompt" aria-hidden="true">&rsaquo;</span>');
    html.push('<label class="tx-sr" for="tx-q">Rechercher dans les pages</label>');
    html.push('<input id="tx-q" type="search" autocomplete="off" spellcheck="false" ' +
      'placeholder="grep -i \u2026 titre, description ou tag" value="' + esc(state.q) + '">');
    html.push('</div>');
    html.push('<div class="tx-mode" role="group" aria-label="Mode de combinaison des tags">');
    html.push('<button type="button" class="tx-modebtn" data-mode="and" aria-pressed="' +
      (state.mode === 'and') + '">ET</button>');
    html.push('<button type="button" class="tx-modebtn" data-mode="or" aria-pressed="' +
      (state.mode === 'or') + '">OU</button>');
    html.push('</div>');
    html.push('<button type="button" class="tx-reset"' +
      (state.tags.length || state.q ? '' : ' hidden') + '>Réinitialiser</button>');
    html.push('</div>');

    // Facettes
    data.facets.forEach(function (facet) {
      html.push('<section class="tx-facet" aria-labelledby="tx-f-' + esc(facet.id) + '">');
      html.push('<h2 class="tx-facet-title" id="tx-f-' + esc(facet.id) + '">' +
        esc(facet.label) + ' <span class="tx-facet-hint">' + esc(facet.hint) + '</span></h2>');
      html.push('<div class="tx-cloud">');
      facet.tags.forEach(function (t) {
        var on = state.tags.indexOf(t.s) !== -1;
        var n = projected(t.s);
        var dead = n === 0 && !on;
        html.push(
          '<button type="button" class="tx-tag' + (dead ? ' is-dead' : '') + '" ' +
          'data-tag="' + esc(t.s) + '" data-weight="' + weightOf(t.n, maxCount) + '" ' +
          'aria-pressed="' + on + '" ' +
          'aria-label="' + esc(t.l) + ', ' + n + ' page' + (n > 1 ? 's' : '') +
          (on ? ', filtre actif' : '') + '">' +
          icon(t.i) + '<span class="tx-tag-label">' + esc(t.l) + '</span>' +
          '<span class="tx-tag-count" aria-hidden="true">' + n + '</span>' +
          '</button>'
        );
      });
      html.push('</div></section>');
    });

    // Résultats
    var label = results.length + ' page' + (results.length > 1 ? 's' : '');
    if (state.tags.length) {
      label += ' · ' + state.tags.length + ' tag' + (state.tags.length > 1 ? 's' : '') +
        ' (' + (state.mode === 'and' ? 'ET' : 'OU') + ')';
    }
    html.push('<div class="tx-count" role="status" aria-live="polite">' + esc(label) + '</div>');

    if (!results.length) {
      html.push('<p class="tx-empty">Aucune page ne combine ces critères. ' +
        'Essayez le mode <strong>OU</strong> ou retirez un tag.</p>');
    } else {
      html.push('<ul class="tx-results">');
      results.forEach(function (p) {
        html.push('<li class="tx-card">');
        if (p.s) html.push('<span class="tx-card-section">' + esc(p.s) + '</span>');
        html.push('<h3 class="tx-card-title"><a href="' + esc(p.u) + '">' + esc(p.t) + '</a></h3>');
        if (p.e) html.push('<p class="tx-card-excerpt">' + esc(p.e) + '</p>');
        html.push('<p class="tx-card-tags">');
        p.g.forEach(function (slug) {
          var on = state.tags.indexOf(slug) !== -1;
          html.push('<button type="button" class="tx-chip" data-tag="' + esc(slug) + '" ' +
            'aria-pressed="' + on + '">' + esc(data.labels[slug] || slug) + '</button>');
        });
        html.push('</p></li>');
      });
      html.push('</ul>');
    }

    root.innerHTML = html.join('');
  }

  // ── Montage ───────────────────────────────────────────────────────────────

  function mount(root, data) {
    var state = readState();
    // Ne garder que les tags qui existent réellement
    var valid = {};
    data.facets.forEach(function (f) {
      f.tags.forEach(function (t) { valid[t.s] = true; });
    });
    state.tags = state.tags.filter(function (t) { return valid[t]; });

    function update(keepFocus) {
      writeState(state);
      render(root, data, state);
      if (keepFocus) {
        var el = root.querySelector('[data-tag="' + keepFocus + '"]');
        if (el) el.focus();
      }
    }

    root.addEventListener('click', function (ev) {
      var tagBtn = ev.target.closest('[data-tag]');
      if (tagBtn) {
        var slug = tagBtn.getAttribute('data-tag');
        var i = state.tags.indexOf(slug);
        if (i === -1) state.tags.push(slug); else state.tags.splice(i, 1);
        update(tagBtn.classList.contains('tx-tag') ? slug : null);
        return;
      }
      var modeBtn = ev.target.closest('[data-mode]');
      if (modeBtn) {
        state.mode = modeBtn.getAttribute('data-mode');
        update();
        root.querySelector('[data-mode="' + state.mode + '"]').focus();
        return;
      }
      if (ev.target.closest('.tx-reset')) {
        state.tags = [];
        state.q = '';
        update();
        var q = root.querySelector('#tx-q');
        if (q) q.focus();
      }
    });

    var timer = null;
    root.addEventListener('input', function (ev) {
      if (ev.target.id !== 'tx-q') return;
      var value = ev.target.value;
      var caret = ev.target.selectionStart;
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.q = value;
        update();
        var q = root.querySelector('#tx-q');
        if (q) { q.focus(); q.setSelectionRange(caret, caret); }
      }, 160);
    });

    render(root, data, state);
  }

  function init() {
    var root = document.getElementById('tags-explorer');
    if (!root || root.dataset.ready === '1') return;
    root.dataset.ready = '1';
    root.setAttribute('aria-busy', 'true');

    var src = new URL(root.dataset.src || 'assets/tags.json', document.baseURI).href;
    var load = CACHE ? Promise.resolve(CACHE) : fetch(src).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (d) { CACHE = d; return d; });

    load.then(function (data) {
      root.removeAttribute('aria-busy');
      mount(root, data);
    }).catch(function () {
      root.removeAttribute('aria-busy');
      root.innerHTML = '<p class="tx-empty">Index des tags indisponible. ' +
        'Les pages par tag restent accessibles depuis <a href="tags/">/tags/</a>.</p>';
    });
  }

  if (typeof document$ !== 'undefined') {
    document$.subscribe(init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();

