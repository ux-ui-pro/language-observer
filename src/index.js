class LanguageObserver {
  #lang;
  #observer;

  constructor() {
    this.#initializeObserver();
    this.#checkInitialLanguage();
  }

  static getNestedTranslation(obj, path) {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  #checkInitialLanguage() {
    const detectedLang = this.#detectLanguageFromClass();

    this.loadLanguage(detectedLang).then();
  }

  #detectLanguageFromClass() {
    const localeClass = Array.from(document.body.classList).find(cls => cls.startsWith('locale-'));
    const lang = localeClass ? localeClass.replace('locale-', '') : 'ru';

    return window.translations[lang] ? lang : 'ru';
  }

  async loadLanguage(lang) {
    if (window.translations[lang]) {
      this.#lang = lang;
    } else {
      this.#lang = 'ru';
    }

    await this.applyTranslations();
  }

  async applyTranslations() {
    const lang = this.#lang;
    const elements = document.querySelectorAll('[data-i18n], [data-i18n-attr]');

    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const attrKeys = el.getAttribute('data-i18n-attr');

      if (key) {
        const translation = LanguageObserver.getNestedTranslation(window.translations[lang], key);

        if (translation !== undefined) {
          this.#updateElementText(el, translation);
        }
      }

      if (attrKeys) {
        let attrMap;

        try {
          attrMap = JSON.parse(attrKeys);
        } catch {
          return;
        }

        Object.entries(attrMap).forEach(([attr, transKey]) => {
          const attrTranslation = LanguageObserver.getNestedTranslation(window.translations[lang], transKey);

          if (attrTranslation !== undefined) {
            el.setAttribute(attr, attrTranslation);
          }
        });
      }
    });
  }

  #updateElementText(el, translation) {
    if (el.childNodes.length) {
      el.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent = translation;
        }
      });
    } else {
      el.textContent = translation;
    }
  }

  #initializeObserver() {
    this.#observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const detectedLang = this.#detectLanguageFromClass();

          if (detectedLang !== this.#lang) {
            this.loadLanguage(detectedLang).then();
          }
        }
      });
    });

    this.#observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  init({ lang } = {}) {
    if (lang) this.loadLanguage(lang).then();
  }

  updateTranslations() {
    this.applyTranslations();
  }

  async loadTranslations(lang, translationLoader) {
    try {
      const translations = await translationLoader(lang);

      window.translations[lang] = translations;

      if (lang === this.#lang) {
        await this.applyTranslations();
      }
    } catch {

    }
  }
}

export default LanguageObserver;
