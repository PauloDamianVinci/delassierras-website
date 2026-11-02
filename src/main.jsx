import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const PLAYER_URL = 'https://argentinastream.com/delassierras/';
const METADATA_URL = 'https://server.streamcasthd.com/cp/get_info.php?p=8682';
const copy = {
  en: {
    navAbout: 'The Station', navListen: 'Listen Anywhere', navLegal: 'Legal',
    tagline: 'Commercial-free • Broadcasting 24/7', decades: '80s • 90s • 2000s',
    live: 'LIVE RADIO',
    play: 'Play radio', stop: 'Stop radio', aboutTitle: 'The Station',
    about: 'De las Sierras - Playing Good Music is an online radio station featuring a carefully selected mix of pop, rock and timeless favorites from the 80s, 90s and 2000s. Music around the clock.',
    legalTitle: 'Copyright information',
    legal: '“De las Sierras - Playing Good Music” is an online radio station dedicated to sharing music for the personal enjoyment of its listeners. All music broadcast by the station is the property of its respective artists, composers, and record labels, who retain all rights to their recordings and compositions. This station does not intend to infringe upon any copyrights, but rather to support artists and promote their music. If you are a copyright holder and would like a particular song removed from our programming, please contact us. We will review and address your request as promptly as possible.',
    waysTitle: 'More ways to tune in', waysText: 'Find us on your favorite radio directories.', playersTitle: 'Listen with your favorite player', playersText: 'Open our live stream in a compatible player for an alternative listening experience.', androidTitle: 'Android app', androidText: 'Download our free Android app (APK from GitHub).', spotifyTitle: 'Our 80s • 90s • 2000s playlist', supportTitle: 'Support us', supportText: 'Enjoy the music? You can support the station on Ko-fi.', supportLink: 'Visit Ko-fi',
    footer: 'Playing Good Music · 24/7', langLabel: 'Language', nowPlaying: 'NOW PLAYING', tracks: 'Recently Played', metadataError: 'Track information unavailable', updating: 'Loading track information…'
  },
  es: {
    navAbout: 'La radio', navListen: 'Escucha desde cualquier lugar', navLegal: 'Legal',
    tagline: 'Sin publicidad • Transmitiendo las 24 horas', decades: '80s • 90s • 2000s',
    live: 'RADIO EN VIVO',
    play: 'Reproducir radio', stop: 'Detener radio', aboutTitle: 'La radio',
    about: 'De las Sierras - Playing Good Music es una radio en línea con una cuidada selección de pop, rock y clásicos de los años 80, 90 y 2000. Música las 24 horas.',
    legalTitle: 'Información sobre derechos de autor',
    legal: '“De las Sierras - Playing Good Music” es una emisora en línea dedicada a compartir música para el disfrute personal de los oyentes. Todo el contenido musical emitido es propiedad de sus respectivos autores y sellos discográficos, quienes conservan todos los derechos sobre las grabaciones y composiciones. Esta emisora no pretende infringir los derechos de autor, sino apoyar a los artistas y promover la difusión de sus obras. Si usted es titular de derechos de autor y desea que se retire alguna canción de nuestra programación, no dude en ponerse en contacto con nosotros; atenderemos su solicitud a la mayor brevedad.',
    waysTitle: 'Más formas de escucharnos', waysText: 'Encuéntranos en tus directorios de radio favoritos.', playersTitle: 'Escuchar con tu reproductor favorito', playersText: 'Abre la transmisión en un reproductor compatible como alternativa para escuchar la radio.', androidTitle: 'Aplicación Android', androidText: 'Descarga nuestra aplicación gratuita para Android (APK desde GitHub).', spotifyTitle: 'Nuestra playlist de los 80 • 90 • 2000', supportTitle: 'Apoya la radio', supportText: 'Si disfrutas de la música, puedes apoyar a la emisora en Ko-fi.', supportLink: 'Visitar Ko-fi',
    footer: 'Playing Good Music · 24/7', langLabel: 'Idioma', nowPlaying: 'SONANDO AHORA', tracks: 'Últimas canciones', metadataError: 'Información de canciones no disponible', updating: 'Cargando información…'
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

const directories = [
  { name: 'TuneIn', url: 'https://tunein.com/radio/De-Las-Sierras--Playing-Good-Music-s336109/', image: 'https://res.cloudinary.com/ddlwjsfml/image/upload/v1735231032/Radio/TuneIn_py6uby.png' },
  { name: 'Online Radio Box', url: 'https://onlineradiobox.com/ar/delassierras/', image: 'https://cdn.onlineradiobox.com/img/b/88x31.png' },
  { name: 'radio.net', url: 'https://www.radio.net/s/delassierrasradio/', image: 'https://res.cloudinary.com/ddlwjsfml/image/upload/v1733425961/Radio/radio-netsmall_ukpwki.png' },
  { name: 'Live Online Radio', url: 'https://liveonlineradio.net/es/de-las-sierras', image: 'https://res.cloudinary.com/ddlwjsfml/image/upload/v1735903771/Radio/logo_byqjcj.png' }
];
const externalPlayers = [
  { name: 'Winamp', format: 'pls', image: 'https://server.streamcasthd.com/cp/inc/images/players/winamp2.png' },
  { name: 'VLC', format: 'pls', image: 'https://server.streamcasthd.com/cp/inc/images/players/vlc.png' },
  { name: 'Windows Media', format: 'asx', image: 'https://server.streamcasthd.com/cp/inc/images/players/mediaplayer.png' },
  { name: 'Apple Music', format: 'pls', image: 'https://server.streamcasthd.com/cp/inc/images/players/itunes.png' }
];
const androidApk = 'https://github.com/PauloDamianVinci/DeLasSierrasRadio-Android/releases/download/v1.0.0/DeLasSierrasRadio-v1.0.0.apk';
const spotifyPlaylist = 'https://open.spotify.com/playlist/1z5gkk6jZkD07qpwLbglhj?si=7wnmV7jST6GG50reqrgOAA';
const kofiUrl = 'https://ko-fi.com/delassierrasplayinggoodmusic';
function DirectoryLinks() {
  return <div className="directory-grid">{directories.map(item =>
    <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer" title={`Listen on ${item.name}`} aria-label={`Listen on ${item.name}`}>
      <img src={item.image} alt={item.name} loading="lazy" />
    </a>
  )}</div>;
}
function PlayerLinks() {
  return <div className="external-player-grid">{externalPlayers.map(item =>
    <a className="external-player" key={item.name} href={`https://server.streamcasthd.com/cp/links.php?p=8682&m=${item.format}`} target="_blank" rel="noopener noreferrer" title={`Listen with ${item.name}`}>
      <span className="external-player-icon"><img src={item.image} alt="" loading="lazy" /></span>
      <span>{item.name}</span>
    </a>
  )}</div>;
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
        <a className="brand" href="#home"><strong>DE LAS SIERRAS</strong><span>PLAYING GOOD MUSIC</span><small>{t.tagline}</small><small>{t.decades}</small></a>
        <nav aria-label="Main navigation"><a href="#about">{t.navAbout}</a><a href="#listen">{t.navListen}</a><a href="#legal">{t.navLegal}</a></nav>
        <div className="language" aria-label={t.langLabel}><button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button><span>/</span><button type="button" aria-pressed={lang === 'es'} onClick={() => setLang('es')}>ES</button></div>
      </header>
      <main className="hero-main content-width">
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
    <section className="section content-width" id="about">
      <span className="section-label">{t.navAbout}</span><h2>{t.aboutTitle}</h2><p>{t.about}</p>
      <div className="support-block"><div><h3>{t.supportTitle}</h3><p>{t.supportText}</p><a className="outline-link" href={kofiUrl} target="_blank" rel="noopener noreferrer">{t.supportLink} ↗</a></div>
        <a className="kofi-qr" href={kofiUrl} target="_blank" rel="noopener noreferrer" aria-label={t.supportLink}><img src="/kofi-qr.png" alt="Ko-fi QR code" loading="lazy" /></a>
      </div>
    </section>
    <section className="section alternate" id="listen"><div className="content-width">
      <span className="section-label">{t.navListen}</span>
      <div className="listen-subsection"><h3>{t.playersTitle}</h3><p>{t.playersText}</p><PlayerLinks /></div>
      <div className="android-block"><div><h3>{t.androidTitle}</h3><p>{t.androidText}</p></div><a className="outline-link" href={androidApk} target="_blank" rel="noopener noreferrer" download>{lang === 'es' ? 'Descargar APK para Android' : 'Download Android APK'} ↗</a></div>
    </div></section>
    <section className="section content-width" id="directories"><span className="section-label">03 / DIRECTORIES</span><h2>{t.waysTitle}</h2><p>{t.waysText}</p><DirectoryLinks /></section>
    <section className="section alternate" id="spotify"><div className="content-width spotify-section"><span className="section-label">04 / PLAYLIST</span><h2>{t.spotifyTitle}</h2>
      <a href={spotifyPlaylist} target="_blank" rel="noopener noreferrer" title="Listen to our playlist on Spotify" aria-label="Listen to our playlist on Spotify">
        <img src="https://res.cloudinary.com/ddlwjsfml/image/upload/v1790267401/Radio/Spoty_algizh.png" alt="Listen on Spotify" loading="lazy" />
      </a>
    </div></section>
    <section className="section content-width legal" id="legal"><span className="section-label">05 / LEGAL</span><h2>{t.legalTitle}</h2><p>{t.legal}</p></section>
    <footer><div className="content-width footer-inner"><span>© {new Date().getFullYear()} De las Sierras</span><span>{t.footer}</span></div></footer>
  </>;
}
createRoot(document.getElementById('root')).render(<App />);
