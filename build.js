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

// ── Main ─────────────────────────────────────────────────────────────────
function main() {
	console.log("🔨  Build E.T.S. sas...");
	const root = __dirname;

	// index.html
	const indexPath = path.join(root, "index.html");
	if (fs.existsSync(indexPath)) {
		let html = fs.readFileSync(indexPath, "utf-8");
		html = patchIndex(html);
		fs.writeFileSync(indexPath, html, "utf-8");
		console.log("✅  index.html — title, meta SEO, Open Graph, 4× Schema.org JSON-LD iniettati");
	} else {
		console.error("❌  index.html non trovato — deploy in corso senza patch SEO");
		process.exit(1);
	}

	// sitemap.xml
	fs.writeFileSync(path.join(root, "sitemap.xml"), generateSitemap(), "utf-8");
	console.log("✅  sitemap.xml generata (7 URL)");

	// robots.txt
	fs.writeFileSync(path.join(root, "robots.txt"), generateRobots(), "utf-8");
	console.log("✅  robots.txt generato (GPTBot, PerplexityBot, Google-Extended autorizzati)");

	console.log("\n🚀  Build completato");
}

main();
