type Language = string;
type TranslationLoader = (lang: Language) => Promise<Record<string, unknown>>;

interface InitOptions {
  lang?: string;
}

declare global {
  var translations: {
    [lang: string]: Record<string, unknown>;
  };
}

class LanguageObserver {
  private lang: Language = 'ru';
  private observer: MutationObserver | null = null;

  constructor() {
    this.initializeObserver();
    this.checkInitialLanguage();
  }

  static getNestedTranslation(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part: string) => {
      if (acc && typeof acc === 'object' && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }

      return undefined;
    }, obj);
  }

  private checkInitialLanguage(): void {
    const detectedLang = this.detectLanguageFromClass();

    void this.loadLanguage(detectedLang);
  }

  private detectLanguageFromClass(): Language {
    const localeClass = Array.from(document.body.classList).find((cls) =>
      cls.startsWith('locale-'),
    );

    const lang = localeClass ? localeClass.replace('locale-', '') : 'ru';
    const map = globalThis.translations;

    return map[lang] ? lang : 'ru';
  }

  public loadLanguage(lang: Language): Promise<void> {
    return new Promise<void>((resolve) => {
      const map = globalThis.translations;

      if (map[lang]) {
        this.lang = lang;
      } else {
        this.lang = 'ru';
      }

      this.applyTranslations();

      resolve();
    });
  }

  public applyTranslations(): void {
    const map = globalThis.translations;
    const langData = map[this.lang];

    if (!langData) return;

    const elements = document.querySelectorAll('[data-i18n], [data-i18n-attr]');

    elements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const attrKeys = el.getAttribute('data-i18n-attr');

      if (key) {
        const translation = LanguageObserver.getNestedTranslation(langData, key);

        if (typeof translation === 'string') {
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

        Object.entries(attrMap).forEach(([attr, transKey]) => {
          const attrTranslation = LanguageObserver.getNestedTranslation(langData, transKey);

          if (typeof attrTranslation === 'string') {
            el.setAttribute(attr, attrTranslation);
          }
        });
      }
    });
  }

  private updateElementText(el: Element, translation: string): void {
    if (el.childNodes.length) {
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
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const detectedLang = this.detectLanguageFromClass();

          if (detectedLang !== this.lang) {
            void this.loadLanguage(detectedLang);
          }
        }
      });
    });

    this.observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  public init(options: InitOptions = {}): void {
    const { lang } = options;

    if (lang) {
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
    globalThis.translations[lang] = await translationLoader(lang);

    if (lang === this.lang) {
      this.applyTranslations();
    }
  }
}

export default LanguageObserver;
