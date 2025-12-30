/**
 * SnippetKit
 * Copyright (c) 2025, [Bilal Malik (Byllzz)]
 * All rights reserved.
 */

document.addEventListener('DOMContentLoaded', () => {
  //  config
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const ctx = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(ctx, args), wait);
    };
  }

  const DEBOUNCE_DELAY = 100;
  const DEBOUNCE_HIGHLIGHT = 35;

  // Font helpers
  let currentFont = null;
  let dynamicFontLink = document.getElementById('dynamic-font') || null;

  function ensureDynamicFontLink() {
    if (!dynamicFontLink) {
      dynamicFontLink = document.createElement('link');
      dynamicFontLink.id = 'dynamic-font';
      dynamicFontLink.rel = 'stylesheet';
      document.head.appendChild(dynamicFontLink);
    }
  }

  function buildGoogleFontsHref(fontName) {
    const encoded = encodeURIComponent(fontName).replace(/%20/g, '+');
    return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;700&display=swap`;
  }

  // Language helpers
  let currentLanguage = '';

  const prismLangMap = {
    bash: 'language-bash',
    c: 'language-c',
    'c++': 'language-cpp',
    'c#': 'language-csharp',
    clojure: 'language-clojure',
    crystal: 'language-crystal',
    css: 'language-css',
    diff: 'language-diff',
    docker: 'language-docker',
    elm: 'language-elm',
    elixir: 'language-elixir',
    exlang: 'language-erlang',
    graphql: 'language-graphql',
    go: 'language-go',
    haskell: 'language-haskell',
    html: 'language-html',
    java: 'language-java',
    js: 'language-javascript',
    json: 'language-json',
    kotlin: 'language-kotlin',
    lisp: 'language-lisp',
    markdown: 'language-markdown',
    lua: 'language-lua',
    matlab: 'language-matlab',
    pascal: 'language-pascal',
    powershell: 'language-powershell',
    plaintext: 'language-none',
    'objective c': 'language-objectivec',
    'objective-c': 'language-objectivec',
    php: 'language-php',
    python: 'language-python',
    ruby: 'language-ruby',
    rust: 'language-rust',
    scala: 'language-scala',
    scss: 'language-scss',
    sql: 'language-sql',
    swift: 'language-swift',
    toml: 'language-toml',
    typescript: 'language-typescript',
    xml: 'language-xml',
    yaml: 'language-yaml',
    ts: 'language-typescript',
    jsx: 'language-javascript',
    tsx: 'language-typescript',
    shell: 'language-bash',
    console: 'language-bash',
  };

  function detectLanguageFromText(text) {
    if (!text || !text.trim()) return '';
    const t = text.slice(0, 2000).toLowerCase();

    if (/^#!\/.*\b(node|bash|env)/.test(t)) return 'language-bash';
    if (/^<!doctype html\b|<html[\s>]/.test(t)) return 'language-html';
    if (/\b(function|const|let|=>|console\.log|var|module\.exports)\b/.test(t))
      return 'language-javascript';
    if (/\binterface\s+\w+|\btype\s+\w+|:\s*string\b|:\s*number\b/.test(t))
      return 'language-typescript';
    if (/\b(def\s+\w+\(|from\s+\w+|import\s+\w+|print\(|self\b)/.test(t)) return 'language-python';
    if (/\b(public\s+class|System\.out|println|package\s+[a-z0-9_.]+)\b/.test(t))
      return 'language-java';
    if (/\b#include\s+<|int\s+main\s*\(|std::\w+/.test(t)) return 'language-cpp';
    if (/\busing\s+system;|namespace\s+\w+;|Console\.WriteLine/.test(t)) return 'language-csharp';
    if (/\bfunc\s+\w+\(|package\s+\w+;/.test(t)) return 'language-go';
    if (/\b<\?php|echo\s+['"]/.test(t)) return 'language-php';
    if (/^\s*[{[]/.test(t)) return 'language-json';
    if (/\bselect\s+.+from\b|insert\s+into\b|create\s+table\b/.test(t)) return 'language-sql';
    if (/^#\s+\w+|\[(.*?)\]\((.*?)\)|^---\s*$/.test(text.split('\n', 6).join('\n')))
      return 'language-markdown';

    return '';
  }

  // elements used
  const exportOptions = document.querySelector('.export-options');
  const exportBtn = document.querySelector('.export-btn');
  const modeToggleInput = document.getElementById('mode-toggle');
  const backgroundToggle = document.getElementById('background-toggle');

  const panelScreen = document.querySelector('.panel-screen');
  const codePanel = document.querySelector('.code-panel'); // kept for compatibility
  const fontSizeInput = document.getElementById('the-font-size');
  const paddingInput = document.getElementById('padding');
  const borderRadiusInput = document.getElementById('borderRadius');

  if (!codePanel) {
    console.error('Missing .code-panel container in DOM.');
    return;
  }

  //  <pre class="the-code">
  let pre = codePanel.querySelector('pre.the-code');
  if (!pre) {
    pre = document.createElement('pre');
    pre.className = 'the-code';
    codePanel.appendChild(pre);
  }
  pre.style.pointerEvents = 'none';

  //  ensure <code>
  let codeBlock = pre.querySelector('code');
  if (!codeBlock) {
    codeBlock = document.createElement('code');
    pre.appendChild(codeBlock);
  }

  // <textarea class="editor-textarea">
  let editor = codePanel.querySelector('textarea.editor-textarea');
  if (!editor) {
    editor = document.createElement('textarea');
    editor.className = 'editor-textarea';
    codePanel.appendChild(editor);
  }

  if (getComputedStyle(codePanel).position === 'static') codePanel.style.position = 'relative';

  Object.assign(editor.style, {
    position: 'absolute',
    top: '45px',
    left: '15px',
    width: '100%',
    height: '100%',
    resize: 'none',
    zIndex: 2,
    boxSizing: 'border-box',
    border: 'none',
    outline: 'none',
    borderRadius: '0',
    backgroundColor: 'transparent',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    overflow: 'hidden',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  });

  // syncing area
  function copyComputedStylesToEditor() {
    if (!editor.dataset.editorAttrs) {
      editor.setAttribute('spellcheck', 'false');
      editor.setAttribute('autocorrect', 'off');
      editor.setAttribute('autocapitalize', 'off');
      editor.setAttribute('autocomplete', 'off');
      editor.dataset.editorAttrs = '1';
    }

    const cs = window.getComputedStyle(pre);
    const tabSize =
      cs.tabSize || cs.getPropertyValue('-moz-tab-size') || cs.getPropertyValue('tab-size') || '4';
    const caretColor = '#fff';

    // editor.style.fontSize = cs.fontSize;
    editor.style.lineHeight = cs.lineHeight;
    editor.style.letterSpacing = cs.letterSpacing;
    editor.style.padding = cs.padding;
    editor.style.border = cs.border;

    editor.style.whiteSpace = 'pre-wrap';
    editor.style.wordBreak = 'break-word';
    editor.style.tabSize = tabSize;
    editor.style.MozTabSize = tabSize;
    editor.style.caretColor = caretColor;
    editor.style.overflow = 'hidden';
  }
  const debouncedCopyComputedStyles = debounce(copyComputedStylesToEditor, DEBOUNCE_DELAY);

  // first I use just plain html to insert data like for (languages , fonts & thems)  but later I take help from chatgpt and then came up with json option to make my project to add more data just using JSON & keep clean..

  //  JSON data (themes, languages, fonts)
  async function loadData() {
    const [themesRes, languagesRes, fontsRes] = await Promise.all([
      fetch('./data/themes.json'),
      fetch('./data/languages.json'),
      fetch('./data/fonts.json'),
    ]);

    const [themes, languages, fonts] = await Promise.all([
      themesRes.json(),
      languagesRes.json(),
      fontsRes.json(),
    ]);

    return { themes, languages, fonts };
  }

  function populateSelects({ themes, languages, fonts }) {
    const themeSelect = document.querySelector(
      '.custom-select[data-name="themes"] .select-options',
    );
    const languageSelect = document.querySelector(
      '.custom-select[data-name="languages"] .select-options',
    );
    const fontSelect = document.querySelector('.custom-select[data-name="fonts"] .select-options');

    if (themeSelect) {
      themeSelect.innerHTML = themes
        .map(t => {
          const gradient = t.gradient || t.value || t.css || '';
          const icon = t.icon || t.img || '';
          return `<li role="option" data-value="${gradient}" aria-selected="false">
          <span class="option-label">

          ${icon ? `<img src="${icon}" class="theme-icon" alt="${t.label} loading="lazy"> ` : ''}${
            t.label
          }
  </span>
  <span class="option-tick" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>
  </span>
          </li>`;
        })
        .join('');
    }

    if (languageSelect) {
      languageSelect.innerHTML = languages
        .map(l => {
          const val = (l.prismClass || l.value || l.id || '').toString();
          const icon = l.icon || l.img || '';
          return `<li role="option" data-value="${val}" aria-selected="false">
         <span class="option-label">
          ${icon ? `<img src="${icon}" class="theme-icon" alt="${l.label}">` : ''}${l.label}
         </span>
          <span class="option-tick" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>
  </span>
          </li>`;
        })
        .join('');
    }

    if (fontSelect) {
      fontSelect.innerHTML = fonts
        .map(f => {
          const val = (f.name || f.id || f.value || '').toString();
          return `<li role="option" data-value="${val}" aria-selected="false">
            <span class="option-label">${f.name || f.id}</span>
            <span class="option-tick" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>
  </span>
          </li>`;
        })
        .join('');
    }

    Array.from(document.querySelectorAll('.custom-select')).forEach(initCustomSelect);
  }

  // Calling it...
  loadData()
    .then(data => {
      populateSelects(data);
    })
    .catch(err => {
      console.warn('Failed to load JSON data for selects:', err);
    });

  // applying things
  function applyLanguageClass(langOverride) {
    let cls = langOverride || (currentLanguage && currentLanguage.trim() ? currentLanguage : '');
    if (!cls && editor.value.trim()) {
      cls = detectLanguageFromText(editor.value);
    }
    codeBlock.className = cls.includes('language-') ? cls : cls ? `language-${cls}` : '';
  }

  function applyFontStyles() {
    if (currentFont) {
      ensureDynamicFontLink();
      dynamicFontLink.href = buildGoogleFontsHref(currentFont);
      codeBlock.style.setProperty('font-family', `${currentFont}, monospace`);
      editor.style.setProperty('font-family', `${currentFont}, monospace`);
      codePanel.style.setProperty('font-family', `${currentFont}, monospace`);
    } else {
      codeBlock.style.removeProperty('font-family');
      editor.style.removeProperty('font-family');
    }
    debouncedCopyComputedStyles();
  }

  // it's gona update
  function syncScroll() {
    pre.scrollTop = editor.scrollTop;
    pre.scrollLeft = editor.scrollLeft;
  }

  function updateCodeView(initial = false) {
    codeBlock.textContent = editor.value;
    applyLanguageClass();
    applyFontStyles();
    copyComputedStylesToEditor();

    if (window.Prism && typeof Prism.highlightElement === 'function') {
      setTimeout(
        () => {
          try {
            Prism.highlightElement(codeBlock);
          } catch (e) {}
        },
        initial ? 0 : DEBOUNCE_HIGHLIGHT,
      );
    }
    syncScroll();
  }

  // Public API for controls
  window.applyLanguage = input => {
    if (!input) return;
    let cls = '';
    if (typeof input === 'string') {
      if (input.startsWith('language-')) cls = input;
      else if (prismLangMap[input.toLowerCase()]) cls = prismLangMap[input.toLowerCase()];
      else {
        const foundKey = Object.keys(prismLangMap).find(
          k => k.toLowerCase() === input.toLowerCase(),
        );
        if (foundKey) cls = prismLangMap[foundKey];
      }
    }
    currentLanguage = cls || currentLanguage;
    updateCodeView();
  };

  window.loadSelectedFont = fontName => {
    if (!fontName) return;
    currentFont = fontName;
    updateCodeView();
    setTimeout(debouncedCopyComputedStyles, 300);
  };

  // making things Ok for editor
  editor.addEventListener('input', () => updateCodeView());
  editor.addEventListener('scroll', syncScroll);
  pre.addEventListener('click', () => editor.focus());

  editor.addEventListener('paste', e => {
    e.preventDefault();
    const clipboard = e.clipboardData || window.clipboardData;
    const text = (clipboard && clipboard.getData('text')) || '';
    const start = editor.selectionStart;
    editor.setRangeText(text, start, editor.selectionEnd, 'end');
    editor.selectionStart = editor.selectionEnd = start + text.length;
    updateCodeView();
  });

  // adding the export options to functional...
  exportBtn?.addEventListener('click', e => {
    e.stopPropagation();
    exportOptions?.classList.toggle('export-options-active');
  });

  document.addEventListener('click', e => {
    if (exportOptions && !exportOptions.contains(e.target) && e.target !== exportBtn) {
      exportOptions.classList.remove('export-options-active');
    }
  });

  exportBtn?.addEventListener('dblclick', () => {
    const text = editor.value;
    navigator.clipboard
      ?.writeText(text)
      .then(() => console.info('Copied'))
      .catch(() => console.warn('Copy failed'));
  });

  // --- UI control handlers (padding, radius, font size, toggles)
  paddingInput?.addEventListener('input', () => {
    if (panelScreen) {
      panelScreen.style.padding = `${paddingInput.value}px`;
      debouncedCopyComputedStyles();
    }
  });

  borderRadiusInput?.addEventListener('input', () => {
    if (panelScreen) panelScreen.style.borderRadius = `${borderRadiusInput.value}px`;
  });

  fontSizeInput?.addEventListener('input', () => {
    if (pre) pre.style.fontSize = `${fontSizeInput.value}px`;
    editor.style.fontSize = `${fontSizeInput.value}px`;
    codeBlock.style.fontSize = `${fontSizeInput.value}px`;
    debouncedCopyComputedStyles();
  });

  modeToggleInput?.addEventListener('change', () => {
    codePanel?.classList.toggle('code-panel-light');
    document.querySelector('.template-name')?.classList.toggle('template-name-active');

    codeBlock?.classList.toggle('the-code-light');
    if (typeof copyComputedStylesToEditor === 'function') {
      try {
        copyComputedStylesToEditor();
      } catch (e) {}
    }
  });

  backgroundToggle?.addEventListener('change', () => {
    panelScreen?.classList.toggle('panel-screen-noBG');
  });

  window.addEventListener('resize', debouncedCopyComputedStyles);

  // making here Custom select to look Ok.
  function hasClippingAncestor(el) {
    let curr = el.parentElement;
    while (curr && curr !== document.body) {
      const style = window.getComputedStyle(curr);
      const transform = style.transform && style.transform !== 'none';
      const willChange = (style.willChange || '').includes('transform');
      const overflow =
        style.overflow !== 'visible' ||
        style.overflowY !== 'visible' ||
        style.overflowX !== 'visible';
      if (transform || willChange || overflow) return true;
      curr = curr.parentElement;
    }
    return false;
  }

  function initCustomSelect(root) {
    if (!root) return;
    const trigger = root.querySelector('.select-trigger');
    const optionsList = root.querySelector('.select-options');
    if (!trigger || !optionsList) return;
    let options = Array.from(optionsList.querySelectorAll('li'));
    const valueDisplay = trigger.querySelector('.trigger-value') || trigger;
    const name = root.dataset.name || '';

    let isPortaled = false;
    const originalParent = optionsList.parentNode;
    const originalNextSibling = optionsList.nextSibling;
    let open = false;
    let focusedIndex = options.findIndex(o => o.getAttribute('aria-selected') === 'true');
    if (focusedIndex < 0) focusedIndex = 0;

    root._closeSelect = () => {
      if (open) closeSelect();
    };

    function positionMenu() {
      if (isPortaled) {
        const rootRect = root.getBoundingClientRect();
        const menuRect = optionsList.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rootRect.bottom;
        const spaceAbove = rootRect.top;
        const openUp = spaceBelow < menuRect.height && spaceAbove > menuRect.height;
        const left = Math.round(rootRect.left);
        optionsList.style.left = `${left}px`;
        if (!openUp) optionsList.style.top = `${Math.round(rootRect.bottom + 6)}px`;
        else optionsList.style.bottom = `${Math.round(window.innerHeight - rootRect.top + 6)}px`;
        optionsList.dataset.openDirection = openUp ? 'up' : 'down';
        optionsList.style.width = `${rootRect.width}px`;
      } else {
        const menuRect = optionsList.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rootRect.bottom;
        const spaceAbove = rootRect.top;
        if (spaceBelow < menuRect.height && spaceAbove > menuRect.height)
          optionsList.classList.add('up');
        else optionsList.classList.remove('up');
      }
    }

    function openSelect() {
      if (window.currentOpenRoot && window.currentOpenRoot !== root)
        window.currentOpenRoot._closeSelect();
      const needsPortal = hasClippingAncestor(root);
      if (needsPortal && !isPortaled) {
        document.body.appendChild(optionsList);
        optionsList.style.position = 'absolute';
        optionsList.style.zIndex = 9999;
        isPortaled = true;
      } else if (!needsPortal && isPortaled) {
        if (originalNextSibling) originalParent.insertBefore(optionsList, originalNextSibling);
        else originalParent.appendChild(optionsList);
        optionsList.style.position = '';
        optionsList.style.left = '';
        optionsList.style.top = '';
        optionsList.style.bottom = '';
        optionsList.style.width = '';
        isPortaled = false;
      }
      options = Array.from(optionsList.querySelectorAll('li')); // refresh after potential DOM moves
      optionsList.classList.add('show');
      trigger.setAttribute('aria-expanded', 'true');
      open = true;
      window.currentOpenRoot = root;
      window.requestAnimationFrame(() => positionMenu());
    }

    function closeSelect() {
      optionsList.classList.remove('show');
      optionsList.classList.remove('up');
      trigger.setAttribute('aria-expanded', 'false');
      open = false;
      if (isPortaled) {
        if (originalNextSibling) originalParent.insertBefore(optionsList, originalNextSibling);
        else originalParent.appendChild(optionsList);
        optionsList.style.position = '';
        optionsList.style.left = '';
        optionsList.style.top = '';
        optionsList.style.bottom = '';
        optionsList.style.width = '';
        optionsList.dataset.openDirection = '';
        isPortaled = false;
      }
      if (window.currentOpenRoot === root) window.currentOpenRoot = null;
    }

    function chooseOption(idx) {
      options.forEach((o, i) => o.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
      const selected = options[idx];
      if (!selected) return;
      const selectedValue = selected.dataset.value;
      const labelEl = selected.querySelector('.option-label');
      const selectedText = labelEl ? labelEl.textContent.trim() : selected.textContent.trim();
      // const selectedText = selected.textContent.trim();
      const img = selected.querySelector('img');
      if (img) {
        const thumbHTML = `<img class="trigger-thumb" src="${img.src}" alt="${selectedText}">`;
        valueDisplay.innerHTML = `${thumbHTML} ${selectedText}`;
      } else valueDisplay.textContent = selectedText;
      handleSelectChange(name, selectedValue, selectedText);
    }

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      open ? closeSelect() : openSelect();
    });

    options.forEach((opt, i) =>
      opt.addEventListener('click', e => {
        e.stopPropagation();
        chooseOption(i);
        closeSelect();
        trigger.focus();
      }),
    );

    // make options keyboard-focusable and add keyboard navigation
    options.forEach(o => o.setAttribute('tabindex', '-1'));

    trigger.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        openSelect();
        const opts = optionsList.querySelectorAll('li');
        (opts[focusedIndex] || opts[0])?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        openSelect();
        const opts = optionsList.querySelectorAll('li');
        (opts[focusedIndex] || opts[opts.length - 1])?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open ? closeSelect() : openSelect();
      } else if (e.key === 'Escape') {
        if (open) closeSelect();
      }
    });

    options.forEach((opt, i) =>
      opt.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          chooseOption(i);
          closeSelect();
          trigger.focus();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = options[(i + 1) % options.length];
          next?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = options[(i - 1 + options.length) % options.length];
          prev?.focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          options[0]?.focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          options[options.length - 1]?.focus();
        }
      }),
    );

    window.addEventListener('resize', () => {
      if (open) positionMenu();
    });
    window.addEventListener(
      'scroll',
      () => {
        if (open) positionMenu();
      },
      true,
    );

    chooseOption(focusedIndex);
  }

  function handleSelectChange(name, value, text) {
    if (name === 'themes' && panelScreen) {
      panelScreen.style.background = value;
    } else if (name === 'fonts') {
      const font = value || text;
      window.loadSelectedFont(font);
    } else if (name === 'languages') {
      if (value && value.startsWith('language-')) window.applyLanguage(value);
      else window.applyLanguage(text || value);
    }
  }

  // making the range updates live...
  function updateRangeVisual(r) {
    if (!r) return;
    const min = parseFloat(r.min) || 0;
    const max = parseFloat(r.max) || 100;
    const val = parseFloat(r.value);
    const denom = max - min || 1;
    const pct = Math.max(0, Math.min(100, ((val - min) / denom) * 100));
    const fillColor =
      r.dataset.fillColor || getComputedStyle(r).getPropertyValue('--fill-color') || '#ddd';
    const trackColor =
      r.dataset.trackColor || getComputedStyle(r).getPropertyValue('--track-color') || '#000';
    r.style.background = `linear-gradient(90deg, ${fillColor} ${pct}%, ${trackColor} ${pct}%)`;
    r.style.setProperty('--range-percent', pct + '%');
  }

  const debouncedUpdateRangeVisuals = debounce(() => {
    Array.from(document.querySelectorAll('input[type="range"].custom-range')).forEach(
      updateRangeVisual,
    );
  }, DEBOUNCE_DELAY);

  function initCustomRange(rangeEl) {
    if (!rangeEl) return;
    updateRangeVisual(rangeEl);
    rangeEl.addEventListener('input', () => updateRangeVisual(rangeEl));
    window.addEventListener('resize', debouncedUpdateRangeVisuals);
  }

  Array.from(document.querySelectorAll('input[type="range"].custom-range')).forEach(
    initCustomRange,
  );

  // code snippets for initial load of code templete >> note: I get all of these from chatgpt & I never check them ...... <?>
  const initialSnippets = [
    `import java.util.stream.IntStream;\n\nclass StreamExample {\n \tpublic static void main(String[] args) {\n \t \tIntStream.rangeClosed(1, 5).forEach(System.out::println);\n \t}\n}`,
    `public class HelloWorld {\n \tpublic static void main(String[] args) {\n \t \tSystem.out.println("Hello, World!");\n \t}\n}`,
    `class Fibonacci {\n \tpublic static int fib(int n) {\n \t \tif(n <= 1) return n;\n \t \treturn fib(n-1) + fib(n-2);\n \t}\n}`,
    `class SumExample {\n \tpublic static void main(String[] args) {\n \t \tint sum = 0;\n \t \tfor(int i=1;i<=10;i++){ sum += i; }\n \t \tSystem.out.println(sum);\n \t}\n}`,
    `using System;\nusing System.Linq;\n\nclass LINQExample {\n\tstatic void Main() {\n\t\tint[] numbers = { 3, 9, 2, 8, 6 };\n\t\tvar evenNumbers = numbers.Where(n => n % 2 == 0);\n\t\tforeach (var num in evenNumbers) {\n\t\t\tConsole.WriteLine(num);\n\t\t}\n\t}\n}`,
  ];
  const initialText =
    (codeBlock.textContent && codeBlock.textContent.trim()) ||
    codePanel.dataset.initial ||
    initialSnippets[Math.floor(Math.random() * initialSnippets.length)];

  editor.value = initialText;

  // boot sync
  updateCodeView(true);
  copyComputedStylesToEditor();

  // expose essentials
  window.updateCodeView = updateCodeView;
  window.editorElement = editor;
  window.currentOpenRoot = null;

  // global click handler to close any open custom-select
  document.addEventListener('click', e => {
    if (window.currentOpenRoot && !window.currentOpenRoot.contains(e.target)) {
      if (typeof window.currentOpenRoot._closeSelect === 'function')
        window.currentOpenRoot._closeSelect();
    }
  });
});

// this is all logics I write but I want to add more things. And writing these logics I spent almost 12 hours >>>
// Hope you like my efforts and if you want to add more things please I am very greatfull...
//For exporting logic I made a separate file to make it clear and later I update it if I ever learn <backend>
