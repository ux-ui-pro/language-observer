<div align="center">
<br>

<h1>language-observer</h1>

<p><sup>LanguageObserver is a lightweight and flexible class designed to simplify internationalization in your web application. It automatically applies translations to elements on your page and supports dynamic content updates. By observing language changes via <body> class modifications, it ensures seamless integration of nested translation structures and attribute-based localization.</sup></p>

[![npm](https://img.shields.io/npm/v/language-observer.svg?colorB=brightgreen)](https://www.npmjs.com/package/language-observer)
[![GitHub package version](https://img.shields.io/github/package-json/v/ux-ui-pro/language-observer.svg)](https://github.com/ux-ui-pro/language-observer)
[![NPM Downloads](https://img.shields.io/npm/dm/language-observer.svg?style=flat)](https://www.npmjs.org/package/language-observer)

<sup>1.2kB gzipped</sup>

<a href="https://codepen.io/ux-ui/pen/RwXOJJx">Demo</a>

</div>
<br>

&#10148; **Install**
```console
$ yarn add language-observer
```
<br>

&#10148; **Import**
```javascript
import LanguageObserver from 'language-observer';
```
<br>

&#10148; **Usage**
```javascript
const languageObserver = new LanguageObserver();

languageObserver.init({ lang: 'eu' });
```
<sub>translations.js</sub>
```javascript
globalThis.translations = globalThis.translations || {};

globalThis.translations['en'] = {
  app: {
    title: {
      main: "Application",
      settings: "Settings",
    },
    menu: {
      profile: "Profile",
    },
  },
  buttons: {
    save: "Save",
  },
};

globalThis.translations['es'] = {
  app: {
    title: {
      main: "Aplicación",
      settings: "Configuraciones",
    },
    menu: {
      profile: "Perfil",
    },
  },
  buttons: {
    save: "Guardar",
  },
};
```
<sub>Switching</sub>
```javascript
document.querySelector('#change-lang-to-es')?.addEventListener('click', () => {
  languageObserver.loadLanguage('es');
});
```
<sub>HTML example</sub>
```html
<p data-i18n="title.welcome"></p>

<img data-i18n-attr='{"alt": "image.altText"}' src="image.jpg" alt="Default Alt Text">
```
<br>

&#10148; **Options**

| Option |   Type   | Default | Description                                                                                                                   |
|:------:|:--------:|:-------:|:------------------------------------------------------------------------------------------------------------------------------|
| `lang` | `string` | `'en'`  | (Optional) The language code to initialize with. If not provided, the language is detected from the `<body>` element's class. |
<br>

&#10148; **Methods**

| Method                                            |                   Parameters                   |  Returns  | Description                                                                                                                                                                           |
|:--------------------------------------------------|:----------------------------------------------:|:---------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `init(options?)`                                  |         `options`: `{ lang?: string }`         |  `void`   | Initializes the observer. If a `lang` is provided in options, it loads and applies that language's translations.             |
| `loadLanguage(lang)`                              |                `lang`: `string`                | `Promise` | Loads and applies translations for the specified language. If translations are not found, falls back to the default language.           |
| `applyTranslations()`                             |                     `none`                     | `Promise` | Applies the current translations to all elements with `data-i18n` and `data-i18n-attr` attributes on the page. Useful for updating translations after dynamic content changes.     |
| `updateTranslations()`                            |                     `none`                     |  `void`   | Manually updates translations on the page. Call this method after adding new translations to `globalThis.translations` to apply them without changing the language or reloading the page. |
| `loadTranslations(lang, loader)`                  | `lang`: `string` `loader`: `(lang) => Promise` | `Promise` | Asynchronously loads translations for the specified language using the provided `loader` function, then applies them if the language matches the current language.        |
| `getNestedTranslation(obj, path)` (static method) |        `obj`: `object` `path`: `string`        |   `any`   | Retrieves a nested translation value from an object using a dot-separated key path. Returns `undefined` if the key does not exist.                    |
<br>

&#10148; **Example of using methods**

<sub>Using the `loadTranslations` method</sub>

```javascript
async function fetchTranslations(lang) {
  const response = await fetch(`/locales/${lang}.json`);

  return response.json();
}

languageObserver.loadTranslations('fr', fetchTranslations);
```

<sub>Using the `getNestedTranslation` method</sub>
```javascript
const nestedValue = LanguageObserver.getNestedTranslation(
  globalThis.translations['en'],
  'app.menu.profile'
);

console.log(nestedValue);
```
<br>

&#10148; **License**

language-observer is released under MIT license
