#!/usr/bin/env node
// Generates en/index.html from index.html by applying the `translations`
// object embedded in the page. Run after every edit to index.html:
//   node scripts/build-en.js
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const block = src.match(/const translations = \{[\s\S]*?\n {6}\};/);
if (!block) throw new Error('translations object not found in index.html');
const translations = new Function(block[0] + '; return translations;')();

let out = src;
let applied = 0;
out = out.replace(/<(\w+)([^>]*\sdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g, (m, tag, attrs, key, inner) => {
  if (inner.includes('data-i18n=')) throw new Error(`nested data-i18n inside ${key}`);
  const t = translations[key];
  if (!t || !t.en) { console.warn(`no English text for ${key}`); return m; }
  applied++;
  return `<${tag}${attrs}>${t.en}</${tag}>`;
});
const expected = (src.match(/data-i18n="/g) || []).length;
if (applied !== expected) throw new Error(`applied ${applied} of ${expected} translations`);

function must(from, to) {
  if (!out.includes(from)) throw new Error(`not found: ${from.slice(0, 60)}`);
  out = out.split(from).join(to);
}

const DESC_EN = 'Abraham Calas Torres (Abraham Calas) - Software Architect, AI Engineer and innovation leader with 12+ years of experience. Development & Innovation Director at elTOQUE. Specialist in AI, NLP and scalable platforms. Madrid, Spain.';

must('<html lang="es">', '<html lang="en">');
must('<meta name="description" content="Abraham Calas Torres - Ingeniero de Software, Arquitecto de Sistemas y líder en innovación con +12 años de experiencia. Director de Desarrollo en elTOQUE. Especialista en IA, NLP y plataformas escalables. Madrid, España.">',
     `<meta name="description" content="${DESC_EN}">`);
must('<link rel="canonical" href="https://abrahamcalas.dev/">', '<link rel="canonical" href="https://abrahamcalas.dev/en/">');
must('<meta property="og:url" content="https://abrahamcalas.dev/">', '<meta property="og:url" content="https://abrahamcalas.dev/en/">');
must('<meta name="twitter:url" content="https://abrahamcalas.dev/">', '<meta name="twitter:url" content="https://abrahamcalas.dev/en/">');
must('<meta property="og:description" content="Ingeniero de Software con +12 años de experiencia construyendo plataformas que impactan a millones. Director de Desarrollo en elTOQUE. Especialista en IA, arquitectura de sistemas y liderazgo técnico.">',
     '<meta property="og:description" content="Software engineer with 12+ years of experience building platforms that impact millions. Development Director at elTOQUE. Specialist in AI, systems architecture and technical leadership.">');
must('<meta name="twitter:description" content="Ingeniero de Software con +12 años de experiencia construyendo plataformas que impactan a millones. Especialista en IA y arquitectura de sistemas.">',
     '<meta name="twitter:description" content="Software engineer with 12+ years of experience building platforms that impact millions. Specialist in AI and systems architecture.">');
must('<meta property="og:image:alt" content="Abraham Calas Torres, Software Architect y AI Engineer">',
     '<meta property="og:image:alt" content="Abraham Calas Torres, Software Architect and AI Engineer">');
must('<meta property="og:locale" content="es_ES">', '<meta property="og:locale" content="en_US">');
must('<meta property="og:locale:alternate" content="en_US">', '<meta property="og:locale:alternate" content="es_ES">');
must('<meta http-equiv="content-language" content="es">', '<meta http-equiv="content-language" content="en">');
must('"jobTitle": "Director de Desarrollo e Innovación"', '"jobTitle": "Development & Innovation Director"');
must('"description": "Ingeniero en Ciencias Informáticas con Título de Oro, MBA por ESDEN Business School. Director de Desarrollo e Innovación con más de 12 años de experiencia construyendo plataformas escalables que impactan a millones de personas."',
     '"description": "Computer Science Engineer (Gold Title), MBA from ESDEN Business School. Development & Innovation Director with over 12 years of experience building scalable platforms that impact millions of people."');
must('"description": "Portfolio profesional de Abraham Calas Torres, Software Architect y AI Engineer"',
     '"description": "Professional portfolio of Abraham Calas Torres, Software Architect and AI Engineer"');
must('<span class="lang-active" data-lang="es">ES</span><span style="opacity:0.3">|</span><span data-lang="en">EN</span>',
     '<span data-lang="es">ES</span><span style="opacity:0.3">|</span><span class="lang-active" data-lang="en">EN</span>');
// Relative asset paths must work from /en/
out = out.replace(/(src|href)="img\//g, '$1="/img/');

fs.mkdirSync(path.join(root, 'en'), { recursive: true });
fs.writeFileSync(path.join(root, 'en', 'index.html'), out);
console.log(`en/index.html written (${applied} strings translated)`);
