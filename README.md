# PawaSupply Score — Dashboard Next.js

Plateforme de scoring crédit Mobile Money pour les boutiquiers camerounais.  
Intégrée à la **pawaPay Merchant API v2** — MTN MoMo & Orange Money.

**Repo :** [github.com/SKJUV/pawasuply-score-frontweb](https://github.com/SKJUV/pawasuply-score-frontweb)

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Graphiques | Chart.js + react-chartjs-2 |
| Temps réel | Socket.io client |
| Langage | TypeScript strict |
| Backend | Node.js / Express (repo séparé) |
| Base de données | PostgreSQL |

---

## Prérequis

- Node.js 20+
- Backend PawaSupply-Score démarré sur `localhost:3000`
- Tunnel ngrok actif pointant sur le backend

---

## Installation

```bash
git clone https://github.com/SKJUV/pawasuply-score-frontweb.git
cd pawasuply-score-frontweb
npm install
```

Créer `.env.local` :

```env
# En local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Avec ngrok (pour la démo)
NEXT_PUBLIC_API_URL=https://structure-relic-affidavit.ngrok-free.dev
NEXT_PUBLIC_SOCKET_URL=https://structure-relic-affidavit.ngrok-free.dev

# Clé accès page logs développeur
NEXT_PUBLIC_DEV_KEY=pawasupply-dev
```

Lancer le serveur de développement :

```bash
npm run dev
# → http://localhost:3001
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Accueil — navigation, recherche rapide, grille catégories |
| `/bank` | Dashboard banque — KPIs, NPL, graphiques, tableau boutiquiers |
| `/grossiste` | Dashboard grossiste — commandes livrées + en attente |
| `/simulator` | Simulateur sandbox pawaPay |
| `/boutiquier` | Recherche boutiquier par UUID ou téléphone |
| `/boutiquier/[id]` | Profil détaillé + score live + historique |
| `/logs` | Journal API (accès développeur — clé requise) |

---

## Moteur de scoring

```
Score = (Volume × 0.4) + (Fréquence × 0.6)

Volume    = min(1, dépôts_COMPLETED_30j / 1 000 000 XAF)
Fréquence = COMPLETED / (COMPLETED + FAILED_comportementaux)
```

| Catégorie | Score | Limite crédit |
|-----------|-------|---------------|
| Observation | < 25 | 0 XAF |
| Standard | 25–49 | 50 000 XAF |
| Or | 50–74 | 100 000 XAF |
| Platine | ≥ 75 | 250 000 XAF |

---

## Flux temps réel

```
pawaPay → POST /pawapay/webhook
              ↓
         Backend recalcule le score
              ↓
         Socket.io score:updated
              ↓
         Dashboard se met à jour instantanément
```

---

## Structure du projet

```
app/
  page.tsx              Accueil
  bank/page.tsx         Dashboard banque
  grossiste/page.tsx    Dashboard grossiste
  simulator/page.tsx    Simulateur sandbox
  boutiquier/page.tsx   Recherche
  boutiquier/[id]/      Profil live
  logs/page.tsx         Journal développeur
components/
  icons.tsx             18 icônes SVG custom
  Navbar.tsx            Navigation responsive
  ScoreTable.tsx        Tableau boutiquiers
  charts/               DonutChart, MonthlyBar, NplLine, ScoreLine
lib/
  api.ts                apiFetch + store logs in-memory
  socket.ts             Singleton Socket.io
  types.ts              Types TypeScript complets
  format.ts             Formatage dates, montants, catégories
```

---

## Accès page logs (développeurs)

Naviguer vers `/logs` et saisir la clé `pawasupply-dev` (configurable via `NEXT_PUBLIC_DEV_KEY`).  
La page n'apparaît pas dans la navigation publique.
