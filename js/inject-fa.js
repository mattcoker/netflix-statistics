var fa = document.createElement('style');
    fa.type = 'text/css';
    fa.textContent = '@font-face { font-family: FontAwesome; src: url("'
        + chrome.extension.getURL('/assets/fonts/fontawesome-webfont.woff')
        + '"); }';

document.head.appendChild(fa);