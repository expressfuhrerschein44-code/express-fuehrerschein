# Express-Führerschein

Plateforme digitale premium dédiée à la préparation et à l’accompagnement au permis de conduire.

## Marché principal

- Deutschland

## Pays prévus

- Deutschland
- Österreich
- Schweiz
- Belgien
- Spanien

## Langues prévues

- Deutsch (`de`) — langue principale et fallback
- Français (`fr`)
- Nederlands (`nl`)
- Español (`es`)
- Italiano (`it`)
- English (`en`)

> Le pays de formation et la langue de l’interface sont deux paramètres indépendants.

---

## Stack de cette base

- Next.js
- React
- TypeScript strict
- Tailwind CSS
- PostCSS
- ESLint

Cette base est volontairement configurée de manière simple et stable afin de construire la Home groupe par groupe sans mélanger les responsabilités.

---

## Installation

À la racine du projet :

```bash
npm install
```

Puis :

```bash
npm run dev
```

Ouvrir :

```text
http://localhost:3000
```

---

## Vérifications

TypeScript :

```bash
npm run typecheck
```

ESLint :

```bash
npm run lint
```

Build production :

```bash
npm run build
```

Tout contrôler :

```bash
npm run check
```

---

## Variables d’environnement

Créer :

```text
.env.local
```

à partir de :

```text
.env.example
```

Exemple :

```bash
cp .env.example .env.local
```

Sur Windows PowerShell :

```powershell
Copy-Item .env.example .env.local
```

Ne jamais commiter `.env.local`.

---

## Assets Home

Les assets de la Home sont placés sous :

```text
public/
└── images/
    └── home/
        ├── hero/
        ├── license-classes/
        └── partners/
```

Logo officiel :

```text
public/logos/logo.png
```

Icône officielle :

```text
public/icons/icon.png
```

Hero :

```text
public/images/home/hero/hero-car-berlin.webp
public/images/home/hero/hero-car-berlin-mobile.webp
```

---

## Architecture Home retenue

```text
Header
Hero
Trust Bar
Stats
Führerscheinklassen
Vorteile
21-Tage-Programm
So funktioniert’s
Sicherheit
Bewertungen
Länder
FAQ
Final CTA
Footer
```

La Home doit rester directe, premium et orientée conversion.

---

## Internationalisation

Le middleware détecte la langue du navigateur si aucune préférence n’est déjà enregistrée.

Ordre logique :

1. préférence enregistrée (`ef_locale`) ;
2. langue du navigateur ;
3. fallback allemand (`de`).

Cette détection concerne uniquement la langue de l’interface.

Les règles, catégories et contenus réglementaires seront déterminés séparément par le pays de formation sélectionné.

---

## Qualité

Avant chaque groupe fonctionnel :

1. coder ;
2. vérifier desktop ;
3. vérifier tablette ;
4. vérifier mobile ;
5. lancer `npm run typecheck` ;
6. lancer `npm run lint` ;
7. vérifier qu’aucune régression n’est introduite.

---

## Git

Premier contrôle :

```bash
git status
```

Après validation d’un groupe :

```bash
git add .
git commit -m "feat: complete home foundation"
```

Ne pas commiter :

- `.env.local`
- `node_modules`
- `.next`
- fichiers temporaires
- secrets
