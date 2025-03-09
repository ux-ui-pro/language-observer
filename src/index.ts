type TranslationDictionary = Record<string, unknown>;
type TranslationsMap = Record<string, TranslationDictionary | undefined>;
type Language = string;
type TranslationLoader = (lang: Language) => Promise<TranslationDictionary>;

interface InitOptions {
  lang?: string;
}

declare global {
  var translations: TranslationsMap;
}

class LanguageObserver {
  private lang: Language = 'ru';
  private observer: MutationObserver | null = null;

  constructor() {
    this.initializeObserver();
    this.checkInitialLanguage();
  }

  public static getNestedTranslation(obj: TranslationDictionary, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object' && part in acc) {
        return (acc as TranslationDictionary)[part];
      }

      return undefined;
    }, obj);
  }

  private safeGetTranslation(
    data: TranslationDictionary | undefined,
    key: string,
  ): string | undefined {
    if (!data) return undefined;

    const result = LanguageObserver.getNestedTranslation(data, key);

    return typeof result === 'string' ? result : undefined;
  }

  private checkInitialLanguage(): void {
    const paramLang = this.detectLanguageFromParams();

    if (paramLang) {
      void this.loadLanguage(paramLang);
    } else {
      const detectedLang = this.detectLanguageFromClass();

      void this.loadLanguage(detectedLang);
    }
  }

  private detectLanguageFromParams(): Language | null {
    if (typeof window === 'undefined') return null;

    const urlParams = new URLSearchParams(window.location.search);
    const paramLang = urlParams.get('land-geo');

    if (paramLang && globalThis.translations[paramLang]) {
      this.updateBodyClass(paramLang);

      return paramLang;
    }

    return null;
  }

  private detectLanguageFromClass(): Language {
    const localeClass = Array.from(document.body.classList).find((cls) =>
      cls.startsWith('locale-'),
    );

    const lang = localeClass ? localeClass.replace('locale-', '') : 'ru';

    return globalThis.translations[lang] ? lang : 'ru';
  }

  private updateBodyClass(lang: Language): void {
    document.body.classList.forEach((cls) => {
      if (cls.startsWith('locale-')) {
        document.body.classList.remove(cls);
      }
    });

    document.body.classList.add(`locale-${lang}`);
  }

  public loadLanguage(lang: Language): void {
    const map: TranslationsMap = globalThis.translations;

    this.lang = map[lang] ? lang : 'ru';
    this.applyTranslations();
  }

  public applyTranslations(): void {
    const map: TranslationsMap = globalThis.translations;
    const langData = map[this.lang];
    const defaultLangData = map['ru'];

    if (!langData) return;

    const elements = document.querySelectorAll('[data-i18n], [data-i18n-attr]');

    elements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const attrKeys = el.getAttribute('data-i18n-attr');

      if (key) {
        let translation = this.safeGetTranslation(langData, key);

        if (!translation && defaultLangData) {
          translation = this.safeGetTranslation(defaultLangData, key);
        }

        if (translation) {
          this.updateElementText(el, translation);
        }
      }

      if (attrKeys) {
        let attrMap: Record<string, string>;

        try {
          attrMap = JSON.parse(attrKeys) as Record<string, string>;
        } catch {
          return;
        }

        Object.entries(attrMap).forEach(([attrName, transKey]) => {
          let attrTranslation = this.safeGetTranslation(langData, transKey);

          if (!attrTranslation && defaultLangData) {
            attrTranslation = this.safeGetTranslation(defaultLangData, transKey);
          }

          if (attrTranslation) {
            el.setAttribute(attrName, attrTranslation);
          }
        });
      }
    });
  }

  private updateElementText(el: Element, translation: string): void {
    if (el.hasChildNodes()) {
      el.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent = translation;
        }
      });
    } else {
      el.textContent = translation;
    }
  }

  private initializeObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const detectedLang = this.detectLanguageFromClass();

          if (detectedLang !== this.lang) {
            void this.loadLanguage(detectedLang);
          }
        }
      }
    });

    this.observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  public init(options: InitOptions = {}): void {
    const { lang } = options;

    if (lang) {
      this.updateBodyClass(lang);

      void this.loadLanguage(lang);
    }
  }

  public updateTranslations(): void {
    this.applyTranslations();
  }

  public async loadTranslations(
    lang: Language,
    translationLoader: TranslationLoader,
  ): Promise<void> {
    const loadedTranslations = await translationLoader(lang);
    const map: TranslationsMap = globalThis.translations;

    map[lang] = loadedTranslations;

    if (lang === this.lang) {
      this.applyTranslations();
    }
  }
}

export default LanguageObserver;
