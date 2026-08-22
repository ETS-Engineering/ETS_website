#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════
//  E.T.S. sas — Build Script (SEO + Sitemap + Robots)
//  Eseguito da Vercel ad ogni deploy.
//  1. Inietta meta SEO/GEO/AEO + Schema.org nell'index.html
//  2. Genera sitemap.xml
//  3. Genera robots.txt
// ════════════════════════════════════════════════════════════════
const fs   = require("fs");
const path = require("path");

const SITE_URL  = "https://ets.campania.it";
const OG_IMAGE  = `${SITE_URL}/common/og-image.jpg`; // crea 1200×630px

// ── Schema.org ───────────────────────────────────────────────────────────

const schemaOrg = {
	"@context": "https://schema.org",
	"@type": ["LocalBusiness", "ElectronicsStore"],
	"@id": `${SITE_URL}/#organization`,
	"name": "E.T.S. sas",
	"legalName": "E.T.S. di Arcangelo Rosolia & C. sas",
	"description": "Centro assistenza tecnico autorizzato per UPS e gruppi di continuità a Pagani (SA). Fornitura, installazione e manutenzione di sistemi UPS Astrid, Borri, GSC, Tecnoware per aziende in Campania dal 2006.",
	"url": SITE_URL,
	"logo": { "@type": "ImageObject", "url": `${SITE_URL}/common/logo.png` },
	"image": OG_IMAGE,
	"foundingDate": "2006",
	"founder": { "@type": "Person", "name": "Arcangelo Rosolia", "jobTitle": "Amministratore" },
	"vatID": "04251630655",
	"address": {
		"@type": "PostalAddress",
		"streetAddress": "Via Alcide De Gasperi, 41/B",
		"addressLocality": "Pagani",
		"addressRegion": "SA",
		"postalCode": "84016",
		"addressCountry": "IT",
	},
	"geo": { "@type": "GeoCoordinates", "latitude": "40.7458", "longitude": "14.6156" },
	"telephone": "+393404765994",
	"email": "info@ets.campania.it",
	"areaServed": [
		{ "@type": "AdministrativeArea", "name": "Campania" },
		{ "@type": "AdministrativeArea", "name": "Centro-Sud Italia" },
	],
	"openingHoursSpecification": [{
		"@type": "OpeningHoursSpecification",
		"dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
		"opens": "09:00",
		"closes": "18:00",
	}],
	"hasOfferCatalog": {
		"@type": "OfferCatalog",
		"name": "Prodotti e Servizi E.T.S. sas",
		"itemListElement": [
			{ "@type": "Offer", "itemOffered": { "@type": "Product", "name": "UPS Interattivi 500–3000 VA" } },
			{ "@type": "Offer", "itemOffered": { "@type": "Product", "name": "UPS Online Doppia Conversione 1–10 kVA" } },
			{ "@type": "Offer", "itemOffered": { "@type": "Product", "name": "UPS Trifase Industriale 10–400 kVA" } },
			{ "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Batterie CSB per UPS" } },
			{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Assistenza tecnica UPS Centro-Sud Italia" } },
			{ "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Sistema antintrusione Jablotron 100" } },
		],
	},
	"sameAs": [],
};

const schemaWebsite = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	"@id": `${SITE_URL}/#website`,
	"url": SITE_URL,
	"name": "E.T.S. sas",
	"publisher": { "@id": `${SITE_URL}/#organization` },
	"inLanguage": "it-IT",
};

// FAQ: le 4 domande già nel sito + 2 nuove ad alta frequenza di ricerca
const schemaFAQ = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	"mainEntity": [
		{
			"@type": "Question",
			"name": "Cos'è la sigla \"7Ah/20H\" sulle batterie UPS?",
			"acceptedAnswer": { "@type": "Answer", "text": "La capacità di 7Ah/20H significa che la batteria eroga 7 Ampere in 20 ore, ovvero 0,35A ogni ora. Con P=V×I, una singola batteria da 12V con carico di 4,2W garantisce 20 ore di autonomia. Non significa che eroga 7 Ampere all'ora." },
		},
		{
			"@type": "Question",
			"name": "Qual è la differenza tra UPS Online e UPS Interattivo?",
			"acceptedAnswer": { "@type": "Answer", "text": "L'UPS Online (doppia conversione) fornisce sempre corrente tramite le batterie: zero transfer time, uscita sinusoidale pura, protezione totale. L'UPS Interattivo è più economico ma ha un transfer time di 4–8ms e filtra solo i disturbi minori. Per server e carichi critici si raccomanda sempre il doppia conversione." },
		},
		{
			"@type": "Question",
			"name": "Con quale frequenza vanno sostituite le batterie degli UPS?",
			"acceptedAnswer": { "@type": "Answer", "text": "Le batterie AGM per UPS hanno una vita di 3–5 anni in standby. Si consiglia la sostituzione preventiva ogni 3–4 anni o quando l'autonomia scende sotto il 70% del valore nominale. Temperature elevate riducono significativamente la vita utile." },
		},
		{
			"@type": "Question",
			"name": "Perché l'UPS consigliato ha più potenza del mio carico?",
			"acceptedAnswer": { "@type": "Answer", "text": "Per garantire la corretta autonomia richiesta, l'UPS deve contenere un numero sufficiente di batterie. Un'autonomia di 1 ora su 100W richiede un UPS con almeno due batterie 7–9Ah. Il modello KK da 1000VA è ideale per questo caso." },
		},
		{
			"@type": "Question",
			"name": "Fate assistenza UPS in tutta la Campania?",
			"acceptedAnswer": { "@type": "Answer", "text": "Sì. E.T.S. sas è Centro Assistenza Tecnico Autorizzato per Astrid, Borri, GSC Elettronica, Tecnoware, Gtec e DKC, e opera in tutto il Centro-Sud Italia con base a Pagani (SA). Per urgenze: +39 340 47 65 994." },
		},
		{
			"@type": "Question",
			"name": "Installate sistemi di allarme Jablotron a Pagani e provincia di Salerno?",
			"acceptedAnswer": { "@type": "Answer", "text": "Sì. Installiamo e configuriamo sistemi Jablotron 100 in tutta la provincia di Salerno e Campania. Il sistema è wireless, include antintrusione, antincendio e domotica integrata. Contattateci per un sopralluogo." },
		},
	],
};

const schemaBreadcrumb = {
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	"itemListElement": [
		{ "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
		{ "@type": "ListItem", "position": 2, "name": "Energia & UPS", "item": `${SITE_URL}/#energia` },
		{ "@type": "ListItem", "position": 3, "name": "Automazione Industriale", "item": `${SITE_URL}/#industria` },
		{ "@type": "ListItem", "position": 4, "name": "Service & Assistenza", "item": `${SITE_URL}/#service` },
		{ "@type": "ListItem", "position": 4, "name": "Contatti", "item": `${SITE_URL}/#contatti` },
	],
};

// ── Blocco meta da iniettare ─────────────────────────────────────────────
const TITLE      = "Assistenza UPS Campania, Salerno, Napoli | Automazioni per aziende | E.T.S. sas";
const DESC       = "E.T.S. sas — UPS, automazione industriale e assistenza tecnica in Campania. Soluzioni hardware e software per aziende nelle province di Salerno, Napoli, Caserta, Avellino e Benevento.";
const DESC_SHORT = "UPS e automazione industriale in Campania. Assistenza tecnica per aziende a Salerno, Napoli, Caserta, Avellino e Benevento.";

const META_BLOCK = `
	<!-- ═══ SEO — generato da build.js ═══ -->
	<title>${TITLE}</title>
	<meta name="description" content="${DESC}">
	<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
	<link rel="canonical" href="${SITE_URL}/">

	<!-- Open Graph -->
	<meta property="og:type" content="website">
	<meta property="og:site_name" content="E.T.S. sas">
	<meta property="og:title" content="${TITLE}">
	<meta property="og:description" content="${DESC}">
	<meta property="og:url" content="${SITE_URL}/">
	<meta property="og:image" content="${OG_IMAGE}">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta property="og:image:alt" content="E.T.S. sas — UPS e Automazione Industriale in Campania">
	<meta property="og:locale" content="it_IT">

	<!-- Twitter / WhatsApp card -->
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="${TITLE}">
	<meta name="twitter:description" content="${DESC_SHORT}">
	<meta name="twitter:image" content="${OG_IMAGE}">

	<!-- Geo / Local -->
	<meta name="geo.region" content="IT-SA">
	<meta name="geo.placename" content="Pagani">
	<meta name="geo.position" content="40.7458;14.6156">
	<meta name="ICBM" content="40.7458, 14.6156">

	<!-- Schema.org JSON-LD -->
	<script type="application/ld+json">${JSON.stringify(schemaOrg)}</script>
	<script type="application/ld+json">${JSON.stringify(schemaWebsite)}</script>
	<script type="application/ld+json">${JSON.stringify(schemaFAQ)}</script>
	<script type="application/ld+json">${JSON.stringify(schemaBreadcrumb)}</script>
	<!-- ═══ fine SEO ═══ -->`;


// ── Sitemap ──────────────────────────────────────────────────────────────
function generateSitemap() {
	const today = new Date().toISOString().split("T")[0];
	const pages = [
		{ loc: "/",             freq: "weekly",  pri: "1.0" },
		{ loc: "/#energia",     freq: "monthly", pri: "0.9" },
		{ loc: "/#service",     freq: "monthly", pri: "0.8" },
		{ loc: "/#industria",   freq: "monthly", pri: "0.7" },
		{ loc: "/#sicurezza",   freq: "monthly", pri: "0.7" },
		{ loc: "/#contatti",    freq: "monthly", pri: "0.6" },
		{ loc: "/blog/",        freq: "weekly",  pri: "0.8" },
	];
	const urls = pages.map(p => `
	<url>
		<loc>${SITE_URL}${p.loc}</loc>
		<lastmod>${today}</lastmod>
		<changefreq>${p.freq}</changefreq>
		<priority>${p.pri}</priority>
	</url>`).join("");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	${urls}
</urlset>`;
}

// ── robots.txt ───────────────────────────────────────────────────────────
function generateRobots() {
	return `User-agent: *
Allow: /
Allow: /blog/
Disallow: /node_modules/
Disallow: /.vercel/
Disallow: /build.js
Disallow: /package.json
Disallow: /package-lock.json

# Permetti esplicitamente i bot AI per GEO (Generative Engine Optimization)
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;
}

// ── Patch index.html ─────────────────────────────────────────────────────
function patchIndex(html) {
	// Rimuove il <title> esistente — verrà riscritto nel META_BLOCK
	html = html.replace(/<title>[^<]*<\/title>/, "");

	// Rimuove eventuali meta description/robots già presenti
	html = html.replace(/<meta\s+name="description"[^>]*\/?\s*>/gi, "");
	html = html.replace(/<meta\s+name="robots"[^>]*\/?\s*>/gi, "");

	// Inietta il blocco SEO completo immediatamente prima di </head>
	// In questo modo non interferisce con CSP, viewport o altri tag esistenti
	html = html.replace("\t</head>", META_BLOCK + "\n\t</head>");

	return html;
}

// (vecchio main rimosso — usa mainFull() in fondo al file)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  BLOG PAGES — 14 pagine statiche
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Dati delle 14 pagine ─────────────────────────────────────────────────
const BLOG_PAGES = [
  // ── GEOGRAFICHE ──────────────────────────────────────────────────────────
  {
    slug: "assistenza-ups-campania",
    title: "Assistenza UPS Campania | Centro Tecnico Autorizzato — E.T.S. sas",
    h1: "Assistenza UPS in Campania",
    desc: "Centro assistenza tecnico autorizzato per UPS e gruppi di continuità in tutta la Campania. Interventi rapidi, manutenzione preventiva e sostituzione batterie nelle province di Salerno, Napoli, Caserta, Avellino e Benevento.",
    intro: `E.T.S. sas è il centro di assistenza tecnica per <strong>UPS e gruppi di continuità</strong> di riferimento in <strong>Campania</strong>. 
Dal 2006 operiamo in tutte e cinque le province della regione — Salerno, Napoli, Caserta, Avellino e Benevento — garantendo interventi rapidi, manutenzione preventiva e sostituzione batterie per aziende di ogni dimensione.
Siamo Centro Assistenza Tecnico Autorizzato per i principali marchi italiani: Astrid, Borri, GSC Elettronica, Tecnoware, Gtec e DKC.`,
    sections: [
      { heading: "Cosa facciamo", body: `Offriamo un servizio completo per tutti i sistemi UPS: installazione e messa in servizio, manutenzione programmata, diagnosi guasti, sostituzione batterie AGM e gel, riparazione schede elettroniche e aggiornamento firmware. Interveniamo sia su impianti nuovi che su sistemi esistenti di qualsiasi marca.` },
      { heading: "Perché scegliere E.T.S. sas in Campania", body: `Con sede operativa a Pagani (SA) e la copertura dell'intera rete autostradale campana, siamo in grado di raggiungere qualsiasi azienda nella regione in tempi rapidi. Il nostro team tecnico è formato direttamente dai costruttori, garantendo interventi a norma e con ricambi originali.` },
      { heading: "Marchi supportati", body: `Borri, Astrid, GSC Elettronica, Tecnoware, Eaton, Riello, APC, Legrand, Vertiv. Per i marchi di cui siamo centro autorizzato (Borri, Astrid, GSC, Tecnoware) forniamo anche assistenza in garanzia.` },
    ],
    geo: "Campania",
    schema_area: "Campania",
    faq: [
      { q: "Coprite tutta la Campania?", a: "Sì. Operiamo in tutte e cinque le province: Salerno, Napoli, Caserta, Avellino e Benevento. Con base a Pagani (SA), raggiungiamo qualsiasi sede aziendale nella regione." },
      { q: "Quanto tempo impiegate per un intervento urgente?", a: "Per le province di Salerno e Napoli siamo in grado di intervenire in giornata. Per Caserta, Avellino e Benevento entro 24 ore in caso di urgenza." },
    ],
    related: ["assistenza-ups-salerno","assistenza-ups-napoli","manutenzione-ups","sostituzione-batterie-ups"],
  },
  {
    slug: "assistenza-ups-salerno",
    title: "Assistenza UPS Salerno e Provincia | E.T.S. sas — Centro Autorizzato",
    h1: "Assistenza UPS a Salerno e Provincia",
    desc: "Assistenza tecnica UPS a Salerno e in tutta la provincia. Centro autorizzato Borri, Astrid, GSC. Manutenzione, riparazione e sostituzione batterie. Intervento rapido.",
    intro: `E.T.S. sas fornisce assistenza tecnica specializzata per <strong>UPS e gruppi di continuità a Salerno</strong> e in tutta la provincia. 
La nostra sede operativa di Pagani (SA) ci permette di intervenire rapidamente in qualsiasi comune della provincia di Salerno: dal capoluogo ai comuni dell'Agro Nocerino-Sarnese, dalla Costiera Amalfitana al Cilento.`,
    sections: [
      { heading: "Servizi per la provincia di Salerno", body: `Installazione nuovi UPS, manutenzione preventiva programmata, sostituzione batterie AGM e gel, riparazione di UPS guasti, verifica dell'autonomia reale, bypass manuale e trasferimento del carico. Operiamo su impianti da 500 VA fino a 400 kVA trifase.` },
      { heading: "Zone di intervento in provincia", body: `Salerno, Pagani, Nocera Inferiore, Nocera Superiore, Scafati, Battipaglia, Pontecagnano, Eboli, Cava de' Tirreni, Vietri sul Mare, Amalfi, Agropoli, Sapri, Sala Consilina, Vallo della Lucania e tutti i comuni della provincia.` },
      { heading: "Tempi di intervento", body: `Per Salerno città e area metropolitana siamo disponibili in giornata. Per i comuni più distanti della provincia garantiamo intervento entro 24 ore, con possibilità di servizi urgenti h24 per contratti di assistenza.` },
    ],
    geo: "Salerno",
    schema_area: "Salerno",
    faq: [
      { q: "Intervenite anche nei comuni più piccoli della provincia di Salerno?", a: "Sì. Copriamo tutti i comuni della provincia di Salerno, incluse le aree più distanti come il Cilento e il Vallo di Diano." },
      { q: "Offrite contratti di manutenzione programmata a Salerno?", a: "Sì. Proponiamo contratti annuali con visite programmate, priorità di intervento e tariffe agevolate per le aziende della provincia di Salerno." },
    ],
    related: ["assistenza-ups-campania","manutenzione-ups","sostituzione-batterie-ups","riparazione-ups"],
  },
  {
    slug: "assistenza-ups-napoli",
    title: "Assistenza UPS Napoli e Area Metropolitana | E.T.S. sas",
    h1: "Assistenza UPS a Napoli e Area Metropolitana",
    desc: "Assistenza tecnica UPS a Napoli e nell'area metropolitana. Centro autorizzato per gruppi di continuità Borri, Astrid, GSC, Tecnoware. Manutenzione e riparazione rapida.",
    intro: `E.T.S. sas è il centro tecnico autorizzato per <strong>UPS e gruppi di continuità a Napoli</strong> e nell'intera area metropolitana. 
Serviamo aziende, data center, ospedali, studi professionali e industrie manifatturiere in tutta la provincia di Napoli, con interventi rapidi garantiti grazie alla vicinanza con la nostra sede di Pagani (SA).`,
    sections: [
      { heading: "Servizi a Napoli e Hinterland", body: `Forniamo e installiamo UPS di ogni potenza, dalla protezione di singoli PC fino a impianti trifase per data center e ambienti industriali. Effettuiamo manutenzione preventiva, verifica batterie con strumentazione professionale, sostituzione batterie esauste e riparazione guasti con ricambi originali.` },
      { heading: "Zone coperte", body: `Napoli città, Giugliano, Afragola, Acerra, Pomigliano d'Arco, Ercolano, Portici, Torre del Greco, Torre Annunziata, Castellammare di Stabia, Gragnano, Pompei, Sorrento e tutti i comuni della provincia di Napoli.` },
      { heading: "Settori serviti", body: `Industria alimentare, automotive, logistica, ospedali e cliniche private, studi notarili e legali, scuole e università, retail e GDO, data center e server room.` },
    ],
    geo: "Napoli",
    schema_area: "Napoli",
    faq: [
      { q: "Quanto dista la vostra sede da Napoli?", a: "La nostra sede di Pagani (SA) dista circa 35 km da Napoli, raggiungibile in 30-40 minuti tramite autostrada A3. Siamo in grado di intervenire a Napoli in poche ore." },
      { q: "Assistete anche i data center di Napoli?", a: "Sì. Abbiamo competenza specifica per UPS trifase ad alta potenza (10-400 kVA) utilizzati nei data center, con interventi programmabili anche in orari notturni per non interrompere le attività." },
    ],
    related: ["assistenza-ups-campania","assistenza-ups-salerno","manutenzione-ups","riparazione-ups"],
  },
  {
    slug: "assistenza-ups-caserta",
    title: "Assistenza UPS Caserta e Provincia | E.T.S. sas",
    h1: "Assistenza UPS a Caserta e Provincia",
    desc: "Assistenza tecnica UPS a Caserta e in tutta la provincia. Manutenzione, installazione e sostituzione batterie per aziende. Centro autorizzato Borri, Astrid, GSC.",
    intro: `E.T.S. sas opera nell'<strong>assistenza UPS a Caserta</strong> e in tutta la sua provincia, servendo le numerose aziende manifatturiere e del settore logistico presenti nell'area casertana. 
Grazie alla rete autostradale A1/A30, raggiungiamo Caserta e la sua provincia in tempi rapidi dalla nostra sede di Pagani (SA).`,
    sections: [
      { heading: "Servizi a Caserta", body: `Installazione e messa in servizio di UPS mono e trifase, manutenzione preventiva con verifica dell'autonomia reale, sostituzione batterie esauste, riparazione guasti elettronici, fornitura di UPS online e interattivi per ogni applicazione.` },
      { heading: "Zone di intervento", body: `Caserta, Aversa, Marcianise, Maddaloni, Santa Maria Capua Vetere, Capua, Sessa Aurunca, Teano, Piedimonte Matese e tutti i comuni della provincia di Caserta, incluso il distretto industriale di Casal di Principe.` },
      { heading: "Specializzazione industriale", body: `La provincia di Caserta ospita importanti realtà industriali nel settore alimentare, tessile e manifatturiero. Abbiamo esperienza specifica nella protezione di linee di produzione e sistemi SCADA con UPS industriali ad alta affidabilità.` },
    ],
    geo: "Caserta",
    schema_area: "Caserta",
    faq: [
      { q: "Quanto tempo ci vuole per raggiungere Caserta dalla vostra sede?", a: "Da Pagani (SA), Caserta è raggiungibile in circa 45-60 minuti via autostrada A30-A1. Per urgenze, possiamo intervenire in giornata." },
      { q: "Assistete impianti UPS industriali nel casertano?", a: "Sì. Abbiamo esperienza con UPS trifase per impianti industriali fino a 400 kVA, molto comuni nelle aziende manifatturiere della provincia di Caserta." },
    ],
    related: ["assistenza-ups-campania","manutenzione-ups","riparazione-ups"],
  },
  {
    slug: "assistenza-ups-avellino",
    title: "Assistenza UPS Avellino e Provincia | E.T.S. sas",
    h1: "Assistenza UPS a Avellino e Provincia",
    desc: "Assistenza tecnica UPS ad Avellino e in tutta la provincia. Manutenzione, riparazione e sostituzione batterie per aziende e industrie. Centro autorizzato.",
    intro: `E.T.S. sas fornisce <strong>assistenza UPS ad Avellino</strong> e in tutta l'Irpinia. Serviamo le aziende del distretto industriale di Nola-Acerra-Avellino e le realtà produttive della Valle del Sabato e dell'Alta Irpinia, garantendo continuità di energia ai processi critici.`,
    sections: [
      { heading: "Servizi per l'Irpinia", body: `Fornitura e installazione di gruppi di continuità, manutenzione preventiva su contratto, sostituzione batterie AGM, riparazione UPS guasti con ricambi originali, verifica dell'impianto di messa a terra e consulenza sulla protezione energetica.` },
      { heading: "Zone coperte in provincia", body: `Avellino, Atripalda, Mercato San Severino, Solofra, Montoro, Nusco, Calitri, Ariano Irpino, Grottaminarda, Mirabella Eclano, Lauro e tutti i comuni della provincia di Avellino.` },
      { heading: "Aziende dell'area conciaria di Solofra", body: `L'area di Solofra e Montoro è nota per il distretto conciario campano. Le aziende di questo settore richiedono UPS affidabili per proteggere i macchinari di controllo temperatura e i sistemi di monitoraggio delle vasche. Abbiamo esperienza specifica in questo settore.` },
    ],
    geo: "Avellino",
    schema_area: "Avellino",
    faq: [
      { q: "Raggiungete anche i comuni dell'Alta Irpinia?", a: "Sì. Copriamo tutta la provincia di Avellino, inclusi i comuni montani dell'Alta Irpinia come Nusco, Calitri e Lacedonia, con tempi di intervento adeguati alla distanza." },
      { q: "Assistete le aziende del distretto conciario di Solofra?", a: "Sì. Abbiamo esperienza nell'assistenza UPS per le aziende conciarie di Solofra e Montoro, che richiedono continuità di alimentazione per i sistemi di controllo dei processi industriali." },
    ],
    related: ["assistenza-ups-campania","manutenzione-ups","sostituzione-batterie-ups"],
  },
  {
    slug: "assistenza-ups-benevento",
    title: "Assistenza UPS Benevento e Provincia | E.T.S. sas",
    h1: "Assistenza UPS a Benevento e Provincia",
    desc: "Assistenza tecnica UPS a Benevento e in tutta la provincia. Manutenzione, installazione e sostituzione batterie. Centro autorizzato per i principali marchi UPS.",
    intro: `E.T.S. sas porta l'<strong>assistenza UPS a Benevento</strong> e in tutta la Sannio, area spesso penalizzata dalla distanza dai grandi centri di assistenza tecnica specializzata. 
Dal 2006 serviamo le aziende beneventane con la stessa qualità e rapidità garantita nelle province più vicine alla nostra sede.`,
    sections: [
      { heading: "Servizi nel Sannio", body: `Installazione UPS mono e trifase, manutenzione preventiva, sostituzione batterie, riparazione guasti, consulenza tecnica sulla protezione energetica degli impianti. Operiamo su tutti i marchi presenti sul mercato, con specializzazione su Borri, Astrid e Tecnoware.` },
      { heading: "Zone coperte", body: `Benevento, Montesarchio, Sant'Agata de' Goti, Telese Terme, Cerreto Sannita, San Bartolomeo in Galdo, Morcone e tutti i comuni della provincia di Benevento.` },
      { heading: "Continuità energetica per le aziende del Sannio", body: `Le aziende del Sannio, spesso lontane dalle grandi infrastrutture urbane, sono particolarmente esposte a interruzioni di rete e sbalzi di tensione. Un UPS affidabile e ben manutenuto è essenziale per proteggere server, macchinari e dati aziendali.` },
    ],
    geo: "Benevento",
    schema_area: "Benevento",
    faq: [
      { q: "Riuscite a intervenire a Benevento rapidamente?", a: "Sì. Benevento è raggiungibile da Pagani via A16 in circa un'ora. Per urgenze garantiamo intervento entro 24 ore; con contratto di assistenza priorità assoluta." },
      { q: "Fate installazioni di nuovi UPS anche a Benevento?", a: "Sì. Effettuiamo sopralluogi, progettazione e installazione di nuovi impianti UPS anche a Benevento e in tutta la provincia del Sannio." },
    ],
    related: ["assistenza-ups-campania","manutenzione-ups","riparazione-ups"],
  },

  // ── PER MARCHIO ──────────────────────────────────────────────────────────
  {
    slug: "assistenza-ups-borri",
    title: "Assistenza UPS Borri Campania | Centro Autorizzato E.T.S. sas",
    h1: "Assistenza Tecnica UPS Borri",
    desc: "Centro assistenza autorizzato UPS Borri in Campania. Manutenzione, riparazione, ricambi e batterie originali per tutti i modelli Borri: B-Box, E3SE, PowerWave. Dal 2006.",
    intro: `E.T.S. sas è <strong>Centro Assistenza Tecnico Autorizzato Borri</strong> in Campania. 
Borri è uno dei principali produttori italiani di UPS professionali e industriali. In qualità di centro autorizzato, disponiamo di ricambi originali, documentazione tecnica completa e personale formato direttamente da Borri per assistere tutti i modelli della gamma.`,
    sections: [
      { heading: "Modelli Borri supportati", body: `B-Box (da 400 VA a 3 kVA), E3SE (da 10 a 120 kVA trifase), PowerWave (UPS modulari ad alta potenza), Ups B-PRO, Beyond G2 e tutta la gamma professionale e industriale Borri. Interveniamo anche su modelli discontinui con ricambi compatibili certificati.` },
      { heading: "Servizi per UPS Borri", body: `Manutenzione preventiva annuale con verifica delle batterie, sostituzione batterie originali Borri, riparazione schede elettroniche, aggiornamento firmware, verifica e taratura del bypass statico, simulazione di mancanza rete per test dell'autonomia reale.` },
      { heading: "Garanzia e ricambi originali", body: `Come centro autorizzato, esieguiamo le riparazioni in garanzia per i prodotti Borri acquistati in Campania. Forniamo ricambi originali con certificazione Borri e rilasciamo documentazione di intervento conforme alle specifiche del costruttore.` },
    ],
    geo: "Campania",
    schema_area: "Campania",
    brand: "Borri",
    faq: [
      { q: "Assistete tutti i modelli Borri anche quelli vecchi?", a: "Sì. Abbiamo documentazione tecnica e ricambi per la maggior parte dei modelli Borri prodotti negli ultimi 20 anni. Per modelli molto datati valutiamo la disponibilità dei ricambi caso per caso." },
      { q: "Fate anche le riparazioni in garanzia Borri?", a: "Sì. In qualità di centro assistenza autorizzato Borri, siamo abilitati a eseguire riparazioni in garanzia per i prodotti acquistati presso rivenditori autorizzati in Campania." },
    ],
    related: ["assistenza-ups-campania","assistenza-ups-riello","manutenzione-ups","riparazione-ups"],
  },
  {
    slug: "assistenza-ups-eaton",
    title: "Assistenza UPS Eaton Campania | E.T.S. sas",
    h1: "Assistenza Tecnica UPS Eaton in Campania",
    desc: "Assistenza tecnica per UPS Eaton in Campania. Manutenzione, sostituzione batterie e riparazione per tutti i modelli Eaton: 5SC, 5PX, 9PX, 93PM. Intervento rapido.",
    intro: `E.T.S. sas offre <strong>assistenza tecnica specializzata per UPS Eaton</strong> in tutta la Campania. 
Eaton è uno dei brand più diffusi nel settore della protezione energetica professionale. Il nostro team tecnico conosce in profondità tutta la gamma Eaton, dai modelli per ufficio fino agli UPS trifase per data center e ambienti industriali.`,
    sections: [
      { heading: "Gamma Eaton supportata", body: `Eaton 5SC, 5PX, 9PX, 9SX, 93E, 93PM (modulare), EX RT, Ellipse PRO, 3S, 5E e tutta la gamma professionale e industriale. Supportiamo anche la configurazione del software di gestione Eaton Intelligent Power Manager (IPM).` },
      { heading: "Servizi per UPS Eaton", body: `Sostituzione batterie Eaton originali e compatibili certificate, manutenzione preventiva con test di autonomia, riparazione guasti elettronici, configurazione del software di spegnimento automatico, aggiornamento firmware e integrazione con sistemi di monitoraggio SNMP.` },
      { heading: "Integrazione con infrastrutture IT", body: `Gli UPS Eaton sono molto diffusi nelle infrastrutture IT aziendali grazie alle funzionalità di comunicazione avanzate (SNMP, USB, RS232). Abbiamo competenza nell'integrazione con sistemi VMware, Hyper-V e ambienti Linux per la gestione automatica dello spegnimento in caso di blackout prolungato.` },
    ],
    geo: "Campania",
    schema_area: "Campania",
    brand: "Eaton",
    faq: [
      { q: "Assistete gli UPS Eaton 93PM modulari?", a: "Sì. Abbiamo esperienza con la serie Eaton 93PM utilizzata nei data center, inclusa la gestione dei moduli ridondanti e la sostituzione a caldo delle batterie." },
      { q: "Installate anche il software Eaton IPM?", a: "Sì. Configuriamo il software Eaton Intelligent Power Manager per la gestione centralizzata di più UPS e per lo spegnimento automatico dei server in caso di mancanza rete prolungata." },
    ],
    related: ["assistenza-ups-campania","assistenza-ups-borri","manutenzione-ups","riparazione-ups"],
  },
  {
    slug: "assistenza-ups-riello",
    title: "Assistenza UPS Riello Campania | E.T.S. sas",
    h1: "Assistenza Tecnica UPS Riello in Campania",
    desc: "Assistenza tecnica per UPS Riello in Campania. Manutenzione, sostituzione batterie e riparazione per tutti i modelli Riello: iPlug, SDH, MHT, Multi Dialog. Intervento rapido.",
    intro: `E.T.S. sas fornisce <strong>assistenza tecnica per UPS Riello</strong> in tutta la Campania. 
Riello UPS è uno storico produttore italiano con sede a Verona, specializzato in soluzioni per ufficio, industria e grandi installazioni. Conosciamo in profondità la gamma Riello e disponiamo delle competenze per assistere tutti i modelli, dagli entry-level agli UPS trifase industriali.`,
    sections: [
      { heading: "Modelli Riello supportati", body: `iPlug, Protect+ HP, Sentinel Pro, SDH, MHT, Multi Dialog, Dialog Dual, Master HP, Master MHT, Vision Dual e tutta la gamma Riello UPS. Supportiamo anche i software di gestione Riello UPS View e PowerShield³.` },
      { heading: "Servizi per UPS Riello", body: `Manutenzione preventiva con verifica batterie tramite strumentazione professionale, sostituzione batterie Riello originali, riparazione schede di potenza e di controllo, test di autonomia reale sotto carico, verifica del bypass statico e configurazione SNMP per la gestione remota.` },
      { heading: "UPS Riello per applicazioni critiche", body: `La serie Multi Dialog e Master HP di Riello è progettata per applicazioni mission-critical dove un'interruzione di alimentazione non è accettabile. Abbiamo esperienza nell'installazione e manutenzione di questi sistemi in ospedali, banche e data center della Campania.` },
    ],
    geo: "Campania",
    schema_area: "Campania",
    brand: "Riello",
    faq: [
      { q: "Dove si trovano i centri Riello più vicini alla Campania?", a: "I centri assistenza ufficiali Riello sono prevalentemente al Nord. E.T.S. sas copre la Campania e il Centro-Sud come punto di riferimento tecnico per questi prodotti, riducendo i tempi di attesa tipici per le aziende del Sud Italia." },
      { q: "Assistete anche gli UPS Riello trifase?", a: "Sì. Abbiamo esperienza con tutta la gamma trifase Riello, inclusi i modelli Master MHT e Multi Dialog utilizzati in ambienti industriali e data center." },
    ],
    related: ["assistenza-ups-campania","assistenza-ups-eaton","manutenzione-ups","riparazione-ups"],
  },
  {
    slug: "assistenza-ups-tecnoware",
    title: "Assistenza UPS Tecnoware Campania | Centro Autorizzato E.T.S. sas",
    h1: "Assistenza Tecnica UPS Tecnoware",
    desc: "Centro assistenza autorizzato UPS Tecnoware in Campania. Manutenzione, riparazione e ricambi originali per tutti i modelli Tecnoware: ERA, FGCETTAPLUS, ERA LCD. Dal 2006.",
    intro: `E.T.S. sas è <strong>Centro Assistenza Tecnico Autorizzato Tecnoware</strong> in Campania. 
Tecnoware è un produttore italiano di UPS di qualità, con una gamma completa che va dalle protezioni per uso domestico fino agli UPS online trifase per applicazioni professionali. Come centro autorizzato, forniamo assistenza in garanzia e post-garanzia con ricambi originali certificati.`,
    sections: [
      { heading: "Gamma Tecnoware supportata", body: `ERA LCD, ERA PLUS, ERA XS, FGCETTAPLUS, UPS Line Interactive, UPS Online doppia conversione da 1 a 10 kVA e tutta la gamma Tecnoware professionale. Supportiamo anche il software WinPower per la gestione e il monitoraggio degli UPS Tecnoware.` },
      { heading: "Servizi per UPS Tecnoware", body: `Installazione e configurazione, manutenzione preventiva annuale, sostituzione batterie originali Tecnoware, riparazione guasti, test di autonomia, configurazione dell'interfaccia USB/RS232 e del software di gestione per lo spegnimento automatico dei sistemi protetti.` },
      { heading: "Garanzia Tecnoware", body: `In qualità di centro autorizzato, possiamo gestire le pratiche di garanzia Tecnoware, effettuare riparazioni coperte dalla garanzia del produttore e fornire la documentazione di intervento necessaria per il rispetto delle condizioni di garanzia.` },
    ],
    geo: "Campania",
    schema_area: "Campania",
    brand: "Tecnoware",
    faq: [
      { q: "Fate riparazioni in garanzia anche per Tecnoware?", a: "Sì. Come centro assistenza autorizzato Tecnoware in Campania, siamo abilitati a eseguire riparazioni e sostituzioni coperte dalla garanzia del produttore." },
      { q: "Installate anche il software WinPower di Tecnoware?", a: "Sì. Configuriamo il software WinPower per la gestione e il monitoraggio degli UPS Tecnoware, inclusa la funzione di spegnimento automatico in caso di blackout prolungato." },
    ],
    related: ["assistenza-ups-campania","assistenza-ups-borri","manutenzione-ups","riparazione-ups"],
  },

  // ── PER SERVIZIO ─────────────────────────────────────────────────────────
  {
    slug: "manutenzione-ups",
    title: "Manutenzione UPS Campania | Contratti Annuali — E.T.S. sas",
    h1: "Manutenzione UPS in Campania",
    desc: "Manutenzione preventiva UPS in Campania. Contratti annuali con verifica batterie, test autonomia e priorità di intervento. Centro autorizzato Borri, Astrid, GSC, Tecnoware.",
    intro: `La <strong>manutenzione preventiva degli UPS</strong> è l'investimento più efficace per garantire la continuità operativa della tua azienda. 
E.T.S. sas offre contratti di manutenzione annuale per tutti i marchi e modelli di UPS presenti sul mercato, con interventi programmati, verifica completa dello stato delle batterie e priorità assoluta in caso di guasto.`,
    sections: [
      { heading: "Cosa comprende la manutenzione preventiva", body: `Visita tecnica programmata con verifica visiva dell'impianto, misurazione della tensione e della capacità delle batterie con strumento di test professionale, verifica del corretto funzionamento del bypass statico e manuale, test di autonomia reale simulando una mancanza rete, pulizia dei filtri e verifica delle connessioni, report scritto dell'intervento.` },
      { heading: "Perché la manutenzione regolare è fondamentale", body: `Le batterie degli UPS hanno una vita utile di 3-5 anni. Senza manutenzione, un UPS apparentemente funzionante può avere batterie esaurite che non garantiscono più l'autonomia nominale. Scoprirlo durante un blackout reale significa rischiare la perdita di dati, il blocco della produzione o il danneggiamento dei macchinari.` },
      { heading: "Contratti di manutenzione disponibili", body: `Contratto Base: una visita annuale con report. Contratto Standard: due visite annuali con verifica batterie completa e sconto sui ricambi. Contratto Premium: visite semestrali, priorità di intervento h24, ricambi inclusi e sostituzione gratuita delle batterie a fine vita. Contattaci per un preventivo personalizzato.` },
    ],
    geo: "Campania",
    schema_area: "Campania",
    faq: [
      { q: "Con quale frequenza va fatta la manutenzione di un UPS?", a: "Per un UPS in ambiente normale si raccomanda almeno una visita annuale. Per impianti critici (server room, ospedali, industria) o in ambienti con temperature elevate, due visite annuali sono la prassi consigliata." },
      { q: "La manutenzione preventiva comprende anche la sostituzione delle batterie?", a: "La verifica delle batterie è sempre inclusa. La sostituzione è inclusa nei contratti Premium oppure viene offerta a prezzo agevolato nei contratti Base e Standard quando le batterie risultano esaurite al test." },
    ],
    related: ["sostituzione-batterie-ups","riparazione-ups","assistenza-ups-campania"],
  },
  {
    slug: "riparazione-ups",
    title: "Riparazione UPS Campania | Diagnosi e Intervento Rapido — E.T.S. sas",
    h1: "Riparazione UPS in Campania",
    desc: "Riparazione UPS guasti in Campania. Diagnosi rapida, ricambi originali, intervento in loco o presso il nostro laboratorio. Tutti i marchi: Borri, Eaton, Riello, APC, Tecnoware.",
    intro: `Il tuo UPS è guasto e hai bisogno di un intervento rapido? E.T.S. sas effettua <strong>riparazione di UPS</strong> in tutta la Campania, sia con intervento diretto presso la tua azienda che con ritiro e riparazione nel nostro laboratorio tecnico di Pagani (SA). 
Operiamo su tutti i marchi e modelli, con diagnosi precisa e ricambi originali o certificati.`,
    sections: [
      { heading: "Come funziona il processo di riparazione", body: `Primo contatto: descrici il guasto e il modello dell'UPS. Sopralluogo o ritiro: valutiamo se è più conveniente intervenire in loco o portare l'apparecchio in laboratorio. Diagnosi: individuiamo il componente guasto con strumentazione professionale. Preventivo: ti comunichiamo il costo prima di procedere. Riparazione e collaudo: sostituiamo il componente e testiamo l'UPS prima della riconsegna.` },
      { heading: "Guasti più comuni che ripariamo", body: `Sostituzione batterie esauste (il guasto più frequente), riparazione o sostituzione della scheda di controllo, sostituzione del trasformatore di isolamento, riparazione del bypass statico, sostituzione dei condensatori di filtro, riparazione o sostituzione del display e dell'interfaccia utente.` },
      { heading: "Marchi che ripariamo", body: `Borri, Astrid, GSC Elettronica, Tecnoware, Gtec, DKC, Eaton, Riello, APC (Schneider Electric), Legrand, Vertiv (ex Emerson), Socomec, Chloride e altri. Per i marchi di cui siamo centro autorizzato (Borri, Astrid, GSC, Tecnoware) disponiamo di ricambi originali in magazzino.` },
    ],
    geo: "Campania",
    schema_area: "Campania",
    faq: [
      { q: "Conviene riparare un UPS vecchio o comprarne uno nuovo?", a: "Dipende dall'età dell'UPS e dal costo della riparazione. Generalmente, se l'UPS ha meno di 8-10 anni e la riparazione non supera il 50-60% del valore di un UPS nuovo equivalente, la riparazione è conveniente. Ti forniamo sempre un preventivo prima di procedere." },
      { q: "Offrite un UPS sostitutivo durante la riparazione?", a: "Per i clienti con contratto di assistenza, offriamo la possibilità di un UPS in comodato durante il periodo di riparazione, per garantire la continuità operativa della tua azienda." },
    ],
    related: ["manutenzione-ups","sostituzione-batterie-ups","assistenza-ups-campania"],
  },
  {
    slug: "sostituzione-batterie-ups",
    title: "Sostituzione Batterie UPS Campania | E.T.S. sas",
    h1: "Sostituzione Batterie UPS in Campania",
    desc: "Sostituzione batterie UPS in Campania. Batterie AGM e gel originali e compatibili per tutti i marchi. Verifica gratuita dello stato delle batterie. Intervento rapido.",
    intro: `Le batterie sono il componente più critico di un UPS: quando si esauriscono, l'UPS non è più in grado di proteggere i tuoi apparecchi durante un blackout. 
E.T.S. sas effettua la <strong>sostituzione delle batterie UPS</strong> in tutta la Campania, con batterie originali del costruttore o batterie AGM di alta qualità certificate, compatibili con tutti i principali marchi e modelli.`,
    sections: [
      { heading: "Quando vanno sostituite le batterie", body: `Le batterie AGM per UPS hanno una vita utile di 3-5 anni in condizioni normali. Segnali che indicano la necessità di sostituzione: l'UPS emette segnali acustici frequenti, l'autonomia è drasticamente ridotta, la spia batteria è sempre accesa, il test automatico dell'UPS fallisce. Non aspettare il guasto completo: la sostituzione preventiva evita rischi ben più costosi.` },
      { heading: "Batterie che forniamo", body: `Batterie CSB (tra le migliori sul mercato per UPS), batterie originali Borri, Astrid, GSC, Tecnoware, Eaton e Riello. Forniamo batterie AGM VRLA sigillate, che non richiedono manutenzione e non emettono gas durante la ricarica normale. Tutte le batterie sono fornite con garanzia.` },
      { heading: "Come avviene la sostituzione", body: `Interveniamo presso la tua sede senza necessità di portare l'UPS in laboratorio. La sostituzione delle batterie di un UPS standard richiede 30-60 minuti. Per UPS con batterie esterne o impianti di grande potenza, pianifichiamo l'intervento in modo da minimizzare l'interruzione della protezione. Ritiriamo e smaltiamo le batterie esauste in modo conforme alla normativa vigente (rifiuti RAEE).` },
    ],
    geo: "Campania",
    schema_area: "Campania",
    faq: [
      { q: "Quanto durano le batterie di un UPS?", a: "In condizioni normali (temperatura ambiente 20-25°C), le batterie AGM per UPS durano 3-5 anni. Temperature elevate riducono significativamente la vita utile: a 30°C la vita si dimezza, a 40°C si riduce di tre quarti." },
      { q: "Smaltite anche le vecchie batterie?", a: "Sì. Ritiriamo e smaltiamo le batterie esauste in modo conforme alla normativa RAEE (Rifiuti di Apparecchiature Elettriche ed Elettroniche). Non devi preoccuparti dello smaltimento." },
    ],
    related: ["manutenzione-ups","riparazione-ups","assistenza-ups-campania"],
  },
];

// ── CSS condiviso per le pagine blog ─────────────────────────────────────
const BLOG_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
ul,ol{list-style:none}
:root{
  --bg:#0d0f12;--bg2:#13161b;--bg3:#1a1e25;--card:#1e232d;
  --border:#2a303d;--accent:#00c896;--accent2:#0084ff;
  --text:#e8eaf0;--text2:#8a9ab5;--text3:#4a566b;
  --red:#ff4d4d;--amber:#f59e0b;--r:10px;--r2:16px;
  --nav-h:64px;--max-w:1100px;
}
html{scroll-behavior:smooth}
body{font-family:"DM Sans",sans-serif;background:var(--bg);color:var(--text);min-height:100vh;line-height:1.7}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.container{max-width:var(--max-w);margin-inline:auto;padding-inline:2rem}

/* Nav */
.nav{position:fixed;inset-block-start:0;inset-inline:0;z-index:100;height:var(--nav-h);
  background:rgb(13 15 18/.92);backdrop-filter:blur(12px);
  border-bottom:1px solid var(--border);display:flex;align-items:center;
  padding-inline:2rem;gap:2rem}
.nav-logo{display:flex;align-items:center;gap:.6rem;font-weight:700;
  font-size:1rem;color:var(--text);text-decoration:none}
.nav-links{display:flex;gap:1.5rem;margin-left:auto}
.nav-links a{font-size:.875rem;font-weight:500;color:var(--text2);text-decoration:none;
  transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{margin-left:1rem;padding:.5rem 1.25rem;border-radius:var(--r);
  background:var(--accent);color:#000;font-weight:700;font-size:.875rem;
  text-decoration:none;transition:opacity .2s}
.nav-cta:hover{opacity:.85}
@media(max-width:768px){
  .nav-links{display:none}
  .nav-cta{font-size:.75rem;padding:.4rem .9rem}
}

/* Breadcrumb */
.breadcrumb{padding-top:calc(var(--nav-h) + 1.5rem);padding-bottom:.5rem}
.breadcrumb ol{display:flex;gap:.5rem;flex-wrap:wrap;font-size:.8rem;color:var(--text3)}
.breadcrumb li+li::before{content:"/";margin-right:.5rem}
.breadcrumb a{color:var(--text2);text-decoration:none}
.breadcrumb a:hover{color:var(--accent)}
.breadcrumb [aria-current]{color:var(--text2)}

/* Hero */
.blog-hero{padding-block:3rem 2rem}
.blog-tag{display:inline-flex;align-items:center;gap:.4rem;font-size:.7rem;
  font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);
  background:rgb(0 200 150/.1);border:1px solid rgb(0 200 150/.25);
  border-radius:20px;padding:.3rem .9rem;margin-bottom:1rem}
h1.blog-h1{font-size:clamp(1.6rem,4vw,2.4rem);font-weight:700;
  letter-spacing:-.03em;line-height:1.2;margin-bottom:1rem}
.blog-intro{font-size:1.05rem;color:var(--text2);max-width:720px;line-height:1.8}
.blog-intro strong{color:var(--text)}

/* Layout articolo */
.blog-layout{display:grid;grid-template-columns:1fr 300px;gap:3rem;
  padding-block:2rem 4rem;align-items:start}
@media(max-width:900px){.blog-layout{grid-template-columns:1fr}}

/* Contenuto */
.blog-body{min-width:0}
.blog-body h2{font-size:1.25rem;font-weight:700;color:var(--text);
  margin-top:2.5rem;margin-bottom:.75rem;letter-spacing:-.02em}
.blog-body p{color:var(--text2);margin-bottom:1rem}
.blog-divider{border:none;border-top:1px solid var(--border);margin-block:2rem}

/* FAQ */
.faq-block{margin-top:2.5rem}
.faq-block h2{font-size:1.25rem;font-weight:700;margin-bottom:1.25rem}
.faq-item{border:1px solid var(--border);border-radius:var(--r);
  padding:1.25rem;margin-bottom:.75rem;background:var(--bg2)}
.faq-q{font-weight:600;color:var(--text);margin-bottom:.5rem}
.faq-a{color:var(--text2);font-size:.9rem}

/* Sidebar */
.blog-sidebar{}
.sidebar-card{background:var(--card);border:1px solid var(--border);
  border-radius:var(--r2);padding:1.5rem;margin-bottom:1.5rem;position:sticky;top:calc(var(--nav-h)+1rem)}
.sidebar-card h3{font-size:.95rem;font-weight:700;margin-bottom:1rem;color:var(--text)}
.sidebar-cta{display:block;width:100%;padding:.85rem;border-radius:var(--r);
  background:var(--accent);color:#000;font-weight:700;text-align:center;
  text-decoration:none;font-size:.95rem;transition:opacity .2s;margin-bottom:.75rem}
.sidebar-cta:hover{opacity:.85;text-decoration:none}
.sidebar-tel{display:block;text-align:center;color:var(--text2);font-size:.85rem;
  margin-bottom:1.25rem}
.sidebar-list{display:flex;flex-direction:column;gap:.5rem}
.sidebar-list a{font-size:.85rem;color:var(--text2);padding:.4rem .5rem;
  border-radius:6px;transition:background .15s,color .15s;display:block}
.sidebar-list a:hover{background:var(--bg3);color:var(--text);text-decoration:none}

/* Related */
.related-section{padding-block:2.5rem;border-top:1px solid var(--border)}
.related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
  gap:1rem;margin-top:1.25rem}
.related-card{background:var(--card);border:1px solid var(--border);
  border-radius:var(--r);padding:1rem 1.25rem;transition:border-color .2s}
.related-card:hover{border-color:var(--accent)}
.related-card a{color:var(--text);font-weight:600;font-size:.9rem;text-decoration:none;
  display:block;margin-bottom:.25rem}
.related-card p{color:var(--text3);font-size:.8rem}

/* Footer */
footer{background:var(--bg2);border-top:1px solid var(--border);
  padding-block:2rem;text-align:center;color:var(--text3);font-size:.8rem}
footer strong{color:var(--text2)}
`;

// ── Label leggibili per le pagine correlate ───────────────────────────────
const PAGE_LABELS = {
  "assistenza-ups-campania":   "Assistenza UPS Campania",
  "assistenza-ups-salerno":    "Assistenza UPS Salerno",
  "assistenza-ups-napoli":     "Assistenza UPS Napoli",
  "assistenza-ups-caserta":    "Assistenza UPS Caserta",
  "assistenza-ups-avellino":   "Assistenza UPS Avellino",
  "assistenza-ups-benevento":  "Assistenza UPS Benevento",
  "assistenza-ups-borri":      "Assistenza UPS Borri",
  "assistenza-ups-eaton":      "Assistenza UPS Eaton",
  "assistenza-ups-riello":     "Assistenza UPS Riello",
  "assistenza-ups-tecnoware":  "Assistenza UPS Tecnoware",
  "manutenzione-ups":          "Manutenzione UPS",
  "riparazione-ups":           "Riparazione UPS",
  "sostituzione-batterie-ups": "Sostituzione Batterie UPS",
};

// ── Template HTML per ogni pagina blog ───────────────────────────────────
function buildBlogPage(page) {
  const url = `${SITE_URL}/${page.slug}/`;

  // Schema LocalBusiness geolocalizzato
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": page.h1,
    "description": page.desc,
    "url": url,
    "provider": {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#organization`,
      "name": "E.T.S. sas",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Via Alcide De Gasperi, 41/B",
        "addressLocality": "Pagani",
        "addressRegion": "SA",
        "postalCode": "84016",
        "addressCountry": "IT",
      },
      "telephone": "+393404765994",
      "areaServed": { "@type": "AdministrativeArea", "name": page.schema_area },
    },
    "areaServed": { "@type": "AdministrativeArea", "name": page.schema_area },
  };

  const schemaFAQ = page.faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": page.faq.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  } : null;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Assistenza UPS", "item": `${SITE_URL}/ups/` },
      { "@type": "ListItem", "position": 3, "name": page.h1, "item": url },
    ],
  };

  const relatedCards = (page.related || []).map(slug => {
    const label = PAGE_LABELS[slug] || slug;
    const desc = slug.includes("assistenza") ? "Assistenza tecnica UPS"
      : slug.includes("manutenzione") ? "Manutenzione preventiva"
      : slug.includes("riparazione") ? "Riparazione guasti"
      : "Sostituzione batterie";
    return `<div class="related-card">
        <a href="${SITE_URL}/${slug}/">${label}</a>
        <p>${desc}</p>
      </div>`;
  }).join("\n");

  const sectionBlocks = page.sections.map(s =>
    `<h2>${s.heading}</h2><p>${s.body}</p>`
  ).join("\n<hr class=\"blog-divider\">\n");

  const faqBlocks = (page.faq || []).map(f =>
    `<div class="faq-item">
      <p class="faq-q">${f.q}</p>
      <p class="faq-a">${f.a}</p>
    </div>`
  ).join("\n");

  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${page.title}</title>
  <meta name="description" content="${page.desc}">
  <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
  <link rel="canonical" href="${SITE_URL}/${page.slug}/">
  <link rel="icon" href="${SITE_URL}/common/logo.png" type="image/x-icon">

  <meta property="og:type" content="article">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.desc}">
  <meta property="og:url" content="${SITE_URL}/${page.slug}/">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:locale" content="it_IT">
  <meta property="og:site_name" content="E.T.S. sas">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">

  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  ${schemaFAQ ? `<script type="application/ld+json">${JSON.stringify(schemaFAQ)}</script>` : ""}
  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>

  <style>${BLOG_CSS}</style>
</head>
<body>

<nav class="nav">
  <a class="nav-logo" href="${SITE_URL}">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <polygon points="10,2 18,7 18,13 10,18 2,13 2,7" stroke="#00c896" stroke-width="1.5" fill="none"/>
      <circle cx="10" cy="10" r="3" fill="#00c896"/>
    </svg>
    E.T.S. <b>sas</b>
  </a>
  <div class="nav-links">
    <a href="${SITE_URL}/#energia">Energia &amp; UPS</a>
    <a href="${SITE_URL}/#industria">Automazione Industriale</a>
    <a href="${SITE_URL}/#service">Service</a>
    <a href="${SITE_URL}/#contatti">Contatti</a>
  </div>
  <a class="nav-cta" href="${SITE_URL}/#contatti">Richiedi offerta →</a>
</nav>

<div class="container breadcrumb">
  <nav aria-label="Breadcrumb">
    <ol>
      <li><a href="${SITE_URL}">Home</a></li>
      <li><a href="${SITE_URL}/ups/">Blog</a></li>
      <li><span aria-current="page">${page.h1}</span></li>
    </ol>
  </nav>
</div>

<div class="container blog-hero">
  <span class="blog-tag">
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><circle cx="4" cy="4" r="3" fill="#00c896"/></svg>
    E.T.S. sas — Dal 2006
  </span>
  <h1 class="blog-h1">${page.h1}</h1>
  <p class="blog-intro">${page.intro.split("\n").filter(l=>l.trim()).join(" ")}</p>
</div>

<div class="container blog-layout">
  <article class="blog-body">
    ${sectionBlocks}
    ${faqBlocks ? `<div class="faq-block"><h2>Domande frequenti</h2>${faqBlocks}</div>` : ""}
  </article>

  <aside class="blog-sidebar">
    <div class="sidebar-card">
      <h3>Richiedi assistenza</h3>
      <a class="sidebar-cta" href="${SITE_URL}/#contatti">Contattaci ora →</a>
      <a class="sidebar-tel" href="tel:+393404765994">+39 340 47 65 994</a>
      <div class="sidebar-list">
        <a href="${SITE_URL}/manutenzione-ups/">Manutenzione UPS</a>
        <a href="${SITE_URL}/riparazione-ups/">Riparazione UPS</a>
        <a href="${SITE_URL}/sostituzione-batterie-ups/">Sostituzione Batterie</a>
        <a href="${SITE_URL}/assistenza-ups-campania/">Tutta la Campania</a>
      </div>
    </div>
  </aside>
</div>

${relatedCards ? `<div class="container related-section">
  <h2>Approfondisci</h2>
  <div class="related-grid">${relatedCards}</div>
</div>` : ""}

<footer>
  <strong>E.T.S. di Arcangelo Rosolia &amp; C. sas</strong> — Via Alcide De Gasperi 41/B, 84016 Pagani (SA)<br>
  P.IVA 04251630655 · <a href="tel:+393404765994">+39 340 47 65 994</a> · <a href="mailto:info@ets.campania.it">info@ets.campania.it</a><br>
  © ${new Date().getFullYear()} E.T.S. sas — Tutti i diritti riservati
</footer>

</body>
</html>`;
}

// ── Sitemap aggiornata con le 14 pagine blog ──────────────────────────────
function generateSitemapFull() {
	const today = new Date().toISOString().split("T")[0];

	const mainPages = [
		{ loc: "/",           freq: "weekly",  pri: "1.0" },
		{ loc: "/#energia",   freq: "monthly", pri: "0.9" },
		{ loc: "/#service",   freq: "monthly", pri: "0.8" },
		{ loc: "/#industria", freq: "monthly", pri: "0.7" },
		{ loc: "/#sicurezza", freq: "monthly", pri: "0.7" },
		{ loc: "/#contatti",  freq: "monthly", pri: "0.6" },
		{ loc: "/ups/",       freq: "weekly",  pri: "0.8" },
	];

	const blogUrls = BLOG_PAGES.map(p => ({
		loc: `/${p.slug}/`,
		freq: "monthly",
		pri: "0.8",
	}));

	const allPages = [...mainPages, ...blogUrls];

	const urls = allPages.map(p => `
	<url>
		<loc>${SITE_URL}${p.loc}</loc>
		<lastmod>${today}</lastmod>
		<changefreq>${p.freq}</changefreq>
		<priority>${p.pri}</priority>
	</url>`).join("");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// ── Pagina index del blog (/blog/index.html) ─────────────────────────────
function buildBlogIndex() {
	const today = new Date().toLocaleDateString("it-IT", { day:"2-digit", month:"long", year:"numeric" });

	const cards = BLOG_PAGES.map(p => `
		<a class="blog-index-card" href="${SITE_URL}/${p.slug}/">
			<span class="bic-tag">${p.geo || "Campania"}</span>
			<h2>${p.h1}</h2>
			<p>${p.desc.substring(0, 110)}…</p>
			<span class="bic-link">Leggi →</span>
		</a>`).join("\n");

	const schema = {
		"@context": "https://schema.org",
		"@type": "Blog",
		"name": "Blog E.T.S. sas — UPS e Automazione",
		"description": "Guide tecniche, assistenza UPS per provincia e per marchio in Campania.",
		"url": `${SITE_URL}/ups/`,
		"publisher": { "@type": "Organization", "name": "E.T.S. sas", "url": SITE_URL },
		"blogPost": BLOG_PAGES.map(p => ({
			"@type": "BlogPosting",
			"headline": p.h1,
			"description": p.desc,
			"url": `${SITE_URL}/${p.slug}/`,
		})),
	};

	return `<!doctype html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Blog UPS e Automazione Industriale Campania — E.T.S. sas</title>
  <meta name="description" content="Guide tecniche, assistenza UPS per provincia e per marchio in Campania. Borri, Eaton, Riello, Tecnoware. Manutenzione, riparazione e sostituzione batterie.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${SITE_URL}/ups/">
  <link rel="icon" href="${SITE_URL}/common/logo.png" type="image/x-icon">
  <meta property="og:title" content="Blog UPS Campania — E.T.S. sas">
  <meta property="og:description" content="Guide tecniche su UPS, assistenza per provincia e per marchio in Campania.">
  <meta property="og:url" content="${SITE_URL}/ups/">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  <style>
    ${BLOG_CSS}
    .blog-index-hero{padding-top:calc(var(--nav-h) + 3rem);padding-bottom:2rem}
    .blog-index-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
      gap:1.25rem;padding-block:1rem 4rem}
    .blog-index-card{display:flex;flex-direction:column;gap:.5rem;
      background:var(--card);border:1px solid var(--border);border-radius:var(--r2);
      padding:1.5rem;text-decoration:none;transition:border-color .2s,transform .2s}
    .blog-index-card:hover{border-color:var(--accent);transform:translateY(-2px)}
    .bic-tag{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
      color:var(--accent);background:rgb(0 200 150/.1);border:1px solid rgb(0 200 150/.2);
      border-radius:20px;padding:.2rem .7rem;width:fit-content}
    .blog-index-card h2{font-size:1rem;font-weight:700;color:var(--text);line-height:1.3}
    .blog-index-card p{font-size:.85rem;color:var(--text2);flex:1}
    .bic-link{font-size:.85rem;font-weight:700;color:var(--accent);margin-top:.25rem}
  </style>
</head>
<body>

<nav class="nav">
  <a class="nav-logo" href="${SITE_URL}">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <polygon points="10,2 18,7 18,13 10,18 2,13 2,7" stroke="#00c896" stroke-width="1.5" fill="none"/>
      <circle cx="10" cy="10" r="3" fill="#00c896"/>
    </svg>
    E.T.S. <b>sas</b>
  </a>
  <div class="nav-links">
    <a href="${SITE_URL}/#energia">Energia &amp; UPS</a>
    <a href="${SITE_URL}/#industria">Automazione Industriale</a>
    <a href="${SITE_URL}/#service">Service</a>
    <a href="${SITE_URL}/#contatti">Contatti</a>
  </div>
  <a class="nav-cta" href="${SITE_URL}/#contatti">Richiedi offerta →</a>
</nav>

<div class="container blog-index-hero">
  <p class="blog-tag">
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><circle cx="4" cy="4" r="3" fill="#00c896"/></svg>
    E.T.S. sas — Guide tecniche
  </p>
  <h1 style="font-size:clamp(1.6rem,4vw,2.2rem);font-weight:700;letter-spacing:-.03em;margin-bottom:.75rem">
    UPS e Automazione Industriale in Campania
  </h1>
  <p style="color:var(--text2);max-width:600px">
    Guide tecniche, assistenza per provincia e per marchio. Dal 2006 siamo il punto di riferimento
    per UPS e continuità energetica in tutta la Campania.
  </p>
</div>

<div class="container blog-index-grid">
  ${cards}
</div>

<footer>
  <strong>E.T.S. di Arcangelo Rosolia &amp; C. sas</strong> — Via Alcide De Gasperi 41/B, 84016 Pagani (SA)<br>
  P.IVA 04251630655 · <a href="tel:+393404765994">+39 340 47 65 994</a> · <a href="mailto:info@ets.campania.it">info@ets.campania.it</a><br>
  © ${new Date().getFullYear()} E.T.S. sas — Tutti i diritti riservati
</footer>

</body>
</html>`;
}

// ── Main esteso ───────────────────────────────────────────────────────────
function mainFull() {
	console.log("🔨  Build E.T.S. sas...");
	const root = __dirname;

	// 1. Patch index.html (homepage)
	const indexPath = path.join(root, "index.html");
	if (fs.existsSync(indexPath)) {
		let html = fs.readFileSync(indexPath, "utf-8");
		html = patchIndex(html);
		fs.writeFileSync(indexPath, html, "utf-8");
		console.log("✅  index.html — meta SEO + schema.org iniettati");
	} else {
		console.error("❌  index.html non trovato");
		process.exit(1);
	}

	// 2. Genera le 14 pagine blog
	const pagesDir = path.join(root, "pages"); // cartella temporanea di build — Vercel serve da root
	fs.mkdirSync(pagesDir, { recursive: true });

	// Pagina indice del blog
	// Indice /ups/
	const upsDir = path.join(root, "ups");
	fs.mkdirSync(upsDir, { recursive: true });
	fs.writeFileSync(path.join(upsDir, "index.html"), buildBlogIndex(), "utf-8");
	console.log("✅  ups/index.html — indice pagine");

	// Le 14 pagine singole
	for (const page of BLOG_PAGES) {
		const dir = path.join(root, page.slug);
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, "index.html"), buildBlogPage(page), "utf-8");
		console.log(`✅  ${page.slug}/index.html`);
	}

	// 3. Sitemap completa (homepage + sezioni + 15 pagine blog)
	fs.writeFileSync(path.join(root, "sitemap.xml"), generateSitemapFull(), "utf-8");
	console.log(`✅  sitemap.xml — ${6 + BLOG_PAGES.length + 2} URL totali`);

	// 4. robots.txt
	fs.writeFileSync(path.join(root, "robots.txt"), generateRobots(), "utf-8");
	console.log("✅  robots.txt");

	console.log(`\n🚀  Build completato — ${BLOG_PAGES.length} pagine generate sotto root`);
}

// Sostituisce il vecchio main()
mainFull();
