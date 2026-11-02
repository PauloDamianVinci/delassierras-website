import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const STREAM_URL = 'https://server.streamcasthd.com/8682/stream';
const PLAYER_URL = 'https://argentinastream.com/delassierras/';
const METADATA_URL = 'https://server.streamcasthd.com/cp/get_info.php?p=8682';
const copy = {
  en: {
    navAbout: 'About', navListen: 'Listen', navLegal: 'Legal',
    kicker: 'YOUR SOUNDTRACK, EVERY DAY', title: 'Playing Good Music',
    intro: 'The music you love from the 80s, 90s and 2000s. Streaming 24/7.',
    live: 'LIVE RADIO',
    play: 'Play radio', stop: 'Stop radio', aboutTitle: 'About the station',
    about: 'De las Sierras is an online radio station featuring a carefully selected mix of pop, rock and timeless favorites from the 80s, 90s and 2000s. Music around the clock.',
    listenTitle: 'Listen wherever you are', listen: 'Enjoy our live broadcast directly from this website, on your favorite device.',
    openStream: 'Open direct stream', legalTitle: 'Copyright information',
    legal: '“De las Sierras - Playing Good Music” is an online radio station dedicated to sharing music for the personal enjoyment of its listeners. All music broadcast by the station is the property of its respective artists, composers, and record labels, who retain all rights to their recordings and compositions. This station does not intend to infringe upon any copyrights, but rather to support artists and promote their music. If you are a copyright holder and would like a particular song removed from our programming, please contact us. We will review and address your request as promptly as possible.',
    footer: 'Playing Good Music · 24/7', langLabel: 'Language', nowPlaying: 'NOW PLAYING', tracks: 'Tracks', metadataError: 'Track information unavailable', updating: 'Loading track information…'
  },
  es: {
    navAbout: 'Nosotros', navListen: 'Escuchar', navLegal: 'Legal',
    kicker: 'LA MÚSICA QUE TE ACOMPAÑA', title: 'Playing Good Music',
    intro: 'La música que te gusta de los 80, 90 y 2000. Transmitiendo las 24 horas.',
    live: 'RADIO EN VIVO',
    play: 'Reproducir radio', stop: 'Detener radio', aboutTitle: 'Sobre la emisora',
    about: 'De las Sierras es una radio en línea con una cuidada selección de pop, rock y clásicos de los años 80, 90 y 2000. Música las 24 horas.',
    listenTitle: 'Escucha desde donde estés', listen: 'Disfruta de nuestra transmisión en vivo directamente desde este sitio, en tu dispositivo favorito.',
    openStream: 'Abrir transmisión directa', legalTitle: 'Información sobre derechos de autor',
    legal: '“De las Sierras - Playing Good Music” es una emisora en línea dedicada a compartir música para el disfrute personal de los oyentes. Todo el contenido musical emitido es propiedad de sus respectivos autores y sellos discográficos, quienes conservan todos los derechos sobre las grabaciones y composiciones. Esta emisora no pretende infringir los derechos de autor, sino apoyar a los artistas y promover la difusión de sus obras. Si usted es titular de derechos de autor y desea que se retire alguna canción de nuestra programación, no dude en ponerse en contacto con nosotros; atenderemos su solicitud a la mayor brevedad.',
    footer: 'Playing Good Music · 24/7', langLabel: 'Idioma', nowPlaying: 'SONANDO AHORA', tracks: 'Canciones', metadataError: 'Información de canciones no disponible', updating: 'Cargando información…'
  }
};
function initialLanguage() {
  try {
    const saved = localStorage.getItem('dls-language');
    if (saved === 'en' || saved === 'es') return saved;
  } catch { /* storage may be disabled */ }
  return (navigator.languages || [navigator.language || 'en']).some((v) => v.toLowerCase().startsWith('es')) ? 'es' : 'en';
}
// The SonicPanel history endpoint returns strings; never insert them as HTML.
// Some responses include <br> separators; convert these to lines safely.
function normalizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap(value => {
    if (typeof value !== 'string') return [];
    return value.replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<\/p\s*>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
  });
}
function TrackHistory({ lang }) {
  const [tracks, setTracks] = useState([]);
  const [failed, setFailed] = useState(false);
  const t = copy[lang];
  useEffect(() => {
    let active = true;
    let busy = false;
    const controller = new AbortController();
    async function refresh() {
      if (busy) return;
      busy = true;
      try {
        const response = await fetch(METADATA_URL, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data.history)) throw new Error('Invalid history');
        if (active) { setTracks(normalizeHistory(data.history)); setFailed(false); }
      } catch (err) {
        if (active && err.name !== 'AbortError') setFailed(true);
      } finally { busy = false; }
    }
    refresh();
    const timer = setInterval(refresh, 15000);
    return () => { active = false; clearInterval(timer); controller.abort(); };
  }, []);
  return <div className="track-metadata" aria-live="off">
    <div className="history-panel">
      <h2 className="history-title">{t.tracks}</h2>
      {tracks.length ? <ol className="history-list">
        {tracks.map((item, index) => {
          const first = /^1\.\)/.test(item);
          const sweeper = /De las Sierras\s*-\s*Sweeper/i.test(item);
          return <li key={`${index}-${item}`} className={first ? 'first-item' : sweeper ? 'sweeper-item' : ''}>{item}</li>;
        })}
      </ol> : <p className="metadata-empty">{failed ? t.metadataError : t.updating}</p>}
    </div>
  </div>;
}
function App() {
  const [lang, setLang] = useState(initialLanguage);
  const t = copy[lang];
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = 'De las Sierras — Playing Good Music';
    try { localStorage.setItem('dls-language', lang); } catch { /* optional */ }
  }, [lang]);
  return <>
    <section className="hero" id="home">
      <div className="hero-overlay" />
      <header className="topbar content-width">
        <a className="brand" href="#home"><strong>DE LAS SIERRAS</strong><span>PLAYING GOOD MUSIC</span></a>
        <nav aria-label="Main navigation"><a href="#about">{t.navAbout}</a><a href="#listen">{t.navListen}</a><a href="#legal">{t.navLegal}</a></nav>
        <div className="language" aria-label={t.langLabel}><button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button><span>/</span><button type="button" aria-pressed={lang === 'es'} onClick={() => setLang('es')}>ES</button></div>
      </header>
      <main className="hero-main content-width">
        <div className="intro"><p className="eyebrow">{t.kicker}</p><h1>{t.title}</h1><p>{t.intro}</p></div>
        <div className="player-embed" id="player">
          <iframe
            src={PLAYER_URL}
            title="De las Sierras Radio — ArgentinaStream player"
            allow="autoplay; encrypted-media"
            loading="eager"
          />
        </div>
        <TrackHistory lang={lang} />
      </main>
      <a className="scroll-hint" href="#about" aria-label={t.navAbout}>⌄</a>
    </section>
    <section className="section content-width" id="about"><span className="section-label">01 / ABOUT</span><h2>{t.aboutTitle}</h2><p>{t.about}</p></section>
    <section className="section alternate" id="listen"><div className="content-width"><span className="section-label">02 / LISTEN</span><h2>{t.listenTitle}</h2><p>{t.listen}</p><a className="outline-link" href={STREAM_URL} target="_blank" rel="noopener noreferrer">{t.openStream} ↗</a></div></section>
    <section className="section content-width legal" id="legal"><span className="section-label">03 / LEGAL</span><h2>{t.legalTitle}</h2><p>{t.legal}</p></section>
    <footer><div className="content-width footer-inner"><span>© {new Date().getFullYear()} De las Sierras</span><span>{t.footer}</span></div></footer>
  </>;
}
createRoot(document.getElementById('root')).render(<App />);
