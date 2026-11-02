import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const STREAM_URL = 'https://server.streamcasthd.com/8682/stream';
const copy = {
  en: {
    navAbout: 'About', navListen: 'Listen', navLegal: 'Legal',
    kicker: 'YOUR SOUNDTRACK, EVERY DAY', title: 'Playing Good Music',
    intro: 'The music you love from the 80s, 90s and 2000s. Streaming 24/7.',
    live: 'LIVE RADIO', ready: 'Ready to listen', connecting: 'Connecting…', playing: 'On air', error: 'Connection unavailable. Please try again.',
    play: 'Play radio', stop: 'Stop radio', aboutTitle: 'About the station',
    about: 'De las Sierras is an online radio station featuring a carefully selected mix of pop, rock and timeless favorites from the 80s, 90s and 2000s. Music around the clock.',
    listenTitle: 'Listen wherever you are', listen: 'Enjoy our live broadcast directly from this website, on your favorite device.',
    openStream: 'Open direct stream', legalTitle: 'Copyright information',
    legal: '“De las Sierras - Playing Good Music” is an online radio station dedicated to sharing music for the personal enjoyment of its listeners. All music broadcast by the station is the property of its respective artists, composers, and record labels, who retain all rights to their recordings and compositions. This station does not intend to infringe upon any copyrights, but rather to support artists and promote their music. If you are a copyright holder and would like a particular song removed from our programming, please contact us. We will review and address your request as promptly as possible.',
    footer: 'Playing Good Music · 24/7', langLabel: 'Language'
  },
  es: {
    navAbout: 'Nosotros', navListen: 'Escuchar', navLegal: 'Legal',
    kicker: 'LA MÚSICA QUE TE ACOMPAÑA', title: 'Playing Good Music',
    intro: 'La música que te gusta de los 80, 90 y 2000. Transmitiendo las 24 horas.',
    live: 'RADIO EN VIVO', ready: 'Lista para escuchar', connecting: 'Conectando…', playing: 'En vivo', error: 'No se pudo conectar. Inténtalo nuevamente.',
    play: 'Reproducir radio', stop: 'Detener radio', aboutTitle: 'Sobre la emisora',
    about: 'De las Sierras es una radio en línea con una cuidada selección de pop, rock y clásicos de los años 80, 90 y 2000. Música las 24 horas.',
    listenTitle: 'Escucha desde donde estés', listen: 'Disfruta de nuestra transmisión en vivo directamente desde este sitio, en tu dispositivo favorito.',
    openStream: 'Abrir transmisión directa', legalTitle: 'Información sobre derechos de autor',
    legal: '“De las Sierras - Playing Good Music” es una emisora en línea dedicada a compartir música para el disfrute personal de los oyentes. Todo el contenido musical emitido es propiedad de sus respectivos autores y sellos discográficos, quienes conservan todos los derechos sobre las grabaciones y composiciones. Esta emisora no pretende infringir los derechos de autor, sino apoyar a los artistas y promover la difusión de sus obras. Si usted es titular de derechos de autor y desea que se retire alguna canción de nuestra programación, no dude en ponerse en contacto con nosotros; atenderemos su solicitud a la mayor brevedad.',
    footer: 'Playing Good Music · 24/7', langLabel: 'Idioma'
  }
};
function initialLanguage() {
  try {
    const saved = localStorage.getItem('dls-language');
    if (saved === 'en' || saved === 'es') return saved;
  } catch { /* storage may be disabled */ }
  return (navigator.languages || [navigator.language || 'en']).some((v) => v.toLowerCase().startsWith('es')) ? 'es' : 'en';
}
function App() {
  const [lang, setLang] = useState(initialLanguage);
  const [status, setStatus] = useState('ready');
  const audio = useRef(null);
  const t = copy[lang];
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = 'De las Sierras — Playing Good Music';
    try { localStorage.setItem('dls-language', lang); } catch { /* optional */ }
  }, [lang]);
  useEffect(() => {
    const el = audio.current;
    const onPlaying = () => setStatus('playing');
    const onWaiting = () => setStatus((s) => s === 'ready' ? s : 'connecting');
    const onError = () => setStatus('error');
    el.addEventListener('playing', onPlaying);
    el.addEventListener('waiting', onWaiting);
    el.addEventListener('error', onError);
    return () => { el.pause(); el.removeEventListener('playing', onPlaying); el.removeEventListener('waiting', onWaiting); el.removeEventListener('error', onError); };
  }, []);
  async function toggleAudio() {
    const el = audio.current;
    if (status === 'playing' || status === 'connecting') {
      el.pause(); el.removeAttribute('src'); el.load(); setStatus('ready'); return;
    }
    setStatus('connecting');
    el.src = STREAM_URL;
    try { await el.play(); } catch { setStatus('error'); }
  }
  return <>
    <audio ref={audio} preload="none" />
    <section className="hero" id="home">
      <div className="hero-overlay" />
      <header className="topbar content-width">
        <a className="brand" href="#home"><strong>DE LAS SIERRAS</strong><span>PLAYING GOOD MUSIC</span></a>
        <nav aria-label="Main navigation"><a href="#about">{t.navAbout}</a><a href="#listen">{t.navListen}</a><a href="#legal">{t.navLegal}</a></nav>
        <div className="language" aria-label={t.langLabel}><button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button><span>/</span><button type="button" aria-pressed={lang === 'es'} onClick={() => setLang('es')}>ES</button></div>
      </header>
      <main className="hero-main content-width">
        <div className="intro"><p className="eyebrow">{t.kicker}</p><h1>{t.title}</h1><p>{t.intro}</p></div>
        <div className="player" id="player"><div className="player-copy"><span className="live-label"><span className="live-dot" />{t.live}</span><strong>De las Sierras Radio</strong><span className="status" role="status">{t[status]}</span></div><button className="play-button" type="button" onClick={toggleAudio} aria-label={status === 'playing' || status === 'connecting' ? t.stop : t.play}>{status === 'playing' || status === 'connecting' ? '■' : '▶'}</button></div>
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
