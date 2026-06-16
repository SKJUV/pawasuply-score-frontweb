# PawaSupply-Score — Documentation API pour le Dashboard Next.js

> Base URL : `http://localhost:3000`  
> Socket.io : `http://localhost:3000`  
> Toutes les dates sont en **UTC**. Afficher en `Africa/Douala` (UTC+1) côté client.

---

## Sommaire

1. [Configuration](#1-configuration)
2. [Socket.io — Temps réel](#2-socketio--temps-réel)
3. [Santé](#3-santé)
4. [Boutiquiers](#4-boutiquiers)
5. [Dépôts](#5-dépôts)
6. [Payouts (crédits stock)](#6-payouts-crédits-stock)
7. [Remboursements](#7-remboursements)
8. [Grossistes](#8-grossistes)
9. [Dashboard Banque](#9-dashboard-banque)
10. [Codes d'erreur](#10-codes-derreur)
11. [Référence des types](#11-référence-des-types)

---

## 1. Configuration

### Variables Next.js (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Client HTTP recommandé

```javascript
// lib/api.js
const BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error || 'API error'), { status: res.status, data: err });
  }
  return res.json();
}
```

---

## 2. Socket.io — Temps réel

### Installation

```bash
npm install socket.io-client
```

### Connexion (singleton)

```javascript
// lib/socket.js
import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ['websocket'],
    });
  }
  return socket;
}
```

### Événements disponibles

#### `score:updated` — Score d'un boutiquier mis à jour

Émis après chaque dépôt COMPLETED ou réconciliation.

```javascript
// S'abonner à la room d'un boutiquier
socket.emit('join:boutiquier', boutiquierId);

// Recevoir les mises à jour
socket.on('score:updated', (data) => {
  // data = {
  //   boutiquierId: "uuid",
  //   finalScore:   88.07,
  //   category:     "Platine",
  //   creditLimit:  250000
  // }
});
```

**Usage dashboard banque** : s'abonner aux rooms de tous les boutiquiers au montage de la page pour rafraîchir le tableau en temps réel.

```javascript
// app/bank/page.js
useEffect(() => {
  const socket = getSocket();
  boutiquiers.forEach(b => socket.emit('join:boutiquier', b.id));
  socket.on('score:updated', handleScoreUpdate);
  return () => socket.off('score:updated', handleScoreUpdate);
}, [boutiquiers]);
```

#### `payout:completed` — Nouveau crédit livré au grossiste

Émis quand un payout passe COMPLETED.

```javascript
socket.on('payout:completed', (data) => {
  // data = {
  //   payoutId:     "uuid",
  //   boutiquierId: "uuid"
  // }
  // → Recharger la liste des commandes du grossiste
});
```

**Usage dashboard grossiste** : afficher les nouvelles commandes en temps réel sans refresh.

---

## 3. Santé

### `GET /health`

Vérifie que le backend tourne et que la timezone est correcte.

**Réponse `200`**
```json
{
  "status": "ok",
  "tz": "UTC"
}
```

---

## 4. Boutiquiers

### `GET /boutiquiers/:id`

Retourne le profil complet d'un boutiquier + son crédit actif.  
`:id` peut être un **UUID** ou un **numéro de téléphone**.

**Réponse `200`**
```json
{
  "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "name": "Amadou Diallo",
  "phone_number": "237653456789",
  "category": "Platine",
  "credit_limit": "250000.00",
  "current_score": "88.07",
  "created_at": "2026-06-16T08:28:08.461Z",
  "updated_at": "2026-06-16T12:20:02.000Z",
  "activeCredit": {
    "id": "uuid-credit",
    "boutiquier_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "grossiste_id": "uuid-grossiste",
    "payout_transaction_id": "uuid-payout",
    "amount": "150000.00",
    "status": "ACTIVE",
    "due_date": "2026-06-30T09:54:03.983Z",
    "created_at": "...",
    "updated_at": "...",
    "grossiste_name": "Socada MTN"
  }
}
```

`activeCredit` est `null` si aucun crédit ACTIVE ou PENDING_DELIVERY.

**Erreurs**
| Code | Cas |
|------|-----|
| `404` | Boutiquier introuvable |

---

### `GET /boutiquiers/:id/score-history`

Historique des scores pour le graphique linéaire.

**Query params**
| Param | Type | Défaut | Description |
|-------|------|--------|-------------|
| `limit` | number | 90 | Nombre de points max (max 200) |

**Réponse `200`** — tableau trié par date ASC
```json
[
  {
    "score": "60.00",
    "category": "Or",
    "credit_limit": "100000.00",
    "recorded_at": "2026-03-18T08:28:08.461Z"
  },
  {
    "score": "85.50",
    "category": "Platine",
    "credit_limit": "250000.00",
    "recorded_at": "2026-06-16T08:28:08.461Z"
  }
]
```

**Usage graphique Chart.js**
```javascript
const labels = history.map(h =>
  new Date(h.recorded_at).toLocaleDateString('fr-FR', { timeZone: 'Africa/Douala' })
);
const data = history.map(h => parseFloat(h.score));
```

---

### `POST /boutiquiers`

Créer un nouveau boutiquier.

**Body**
```json
{
  "name": "Nouveau Boutiquier",
  "phone_number": "237699001122"
}
```

**Réponse `201`**
```json
{
  "id": "uuid-nouveau",
  "name": "Nouveau Boutiquier",
  "phone_number": "237699001122",
  "category": "Observation",
  "credit_limit": "0.00",
  "current_score": "0.00",
  "created_at": "...",
  "updated_at": "..."
}
```

**Erreurs**
| Code | Cas |
|------|-----|
| `400` | Champs manquants |
| `409` | Numéro de téléphone déjà enregistré |

---

## 5. Dépôts

### `POST /deposits`

Initier une collecte Mobile Money depuis le téléphone d'un boutiquier.

**Body**
```json
{
  "boutiquierId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "phoneRaw":     "237653456789",
  "amount":       10000,
  "currency":     "XAF"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `boutiquierId` | UUID | ✅ | ID du boutiquier |
| `phoneRaw` | string | ✅ | Numéro brut (chiffres uniquement, ex: `237653456789`) |
| `amount` | number | ✅ | Montant en XAF |
| `currency` | string | | Défaut : `XAF` |

**Réponse `202` — ACCEPTED**
```json
{
  "depositId": "uuid-deposit",
  "status":    "ACCEPTED",
  "nextStep":  "En attente de confirmation"
}
```

**Réponse `422` — REJECTED** (opérateur refuse)
```json
{
  "depositId": "uuid-deposit",
  "status":    "REJECTED",
  "reason":    "INSUFFICIENT_BALANCE",
  "message":   "The customer does not have enough funds..."
}
```

**Réponse `422` — opérateur inconnu**
```json
{
  "error": "predict-provider failed: ..."
}
```

> ⚠️ Le statut final (COMPLETED/FAILED) arrive via **webhook** pawaPay ou via le **cron de réconciliation** (< 15 min). Écouter l'événement Socket.io `score:updated` pour rafraîchir l'UI.

---

## 6. Payouts (crédits stock)

### `POST /payouts`

Envoyer un crédit stock au grossiste (payout vers son compte Mobile Money).

**Body**
```json
{
  "boutiquierId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "grossisteId":  "b0000000-0000-0000-0000-000000000001",
  "amount":       80000,
  "currency":     "XAF"
}
```

**Réponse `202` — ACCEPTED**
```json
{
  "payoutId": "uuid-payout",
  "status":   "ACCEPTED"
}
```

**Réponse `422` — contraintes métier**
```json
{ "error": "Montant 80000 XAF dépasse la limite de crédit 50000.00 XAF" }
{ "error": "Un crédit est déjà actif ou en cours pour ce boutiquier" }
{ "error": "Boutiquier introuvable" }
{ "error": "Grossiste introuvable" }
```

> Après ACCEPTED, un crédit est créé en statut `PENDING_DELIVERY`.  
> Il passe en `ACTIVE` (due_date = +14 jours) quand le webhook confirme COMPLETED.  
> En cas de `WALLET_LIMIT_REACHED`, le crédit passe en `CANCELLED` → afficher `WalletLimitAlert`.

---

## 7. Remboursements

### `POST /repayments`

Initier le remboursement d'un crédit ACTIVE par le boutiquier.

**Body**
```json
{
  "boutiquierId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "creditId":     "uuid-credit",
  "amount":       150000,
  "currency":     "XAF",
  "phoneRaw":     "237653456789"
}
```

**Réponse `202`**
```json
{
  "depositId": "uuid-deposit",
  "creditId":  "uuid-credit",
  "status":    "ACCEPTED",
  "nextStep":  "Validez le PIN sur votre téléphone pour confirmer le remboursement"
}
```

**Erreurs**
| Code | Cas |
|------|-----|
| `404` | Crédit introuvable |
| `422` | Crédit pas en statut ACTIVE |

> Quand le boutiquier valide son PIN, pawaPay envoie un webhook COMPLETED → le crédit passe en `REPAID` + score recalculé automatiquement.

---

## 8. Grossistes

### `GET /grossistes`

Liste tous les grossistes.

**Réponse `200`**
```json
[
  {
    "id":           "b0000000-0000-0000-0000-000000000001",
    "name":         "Socada MTN",
    "phone_number": "237670000001",
    "mmo_provider": "MTN_MOMO_CMR",
    "created_at":   "2026-06-16T08:28:08.461Z"
  },
  {
    "id":           "b0000000-0000-0000-0000-000000000002",
    "name":         "Congelcam Orange",
    "phone_number": "237690000001",
    "mmo_provider": "ORANGE_CMR",
    "created_at":   "2026-06-16T08:28:08.461Z"
  }
]
```

---

### `GET /grossistes/:id/orders`

Commandes PAYOUT COMPLETED des N derniers jours.

**Query params**
| Param | Type | Défaut | Description |
|-------|------|--------|-------------|
| `days` | number | 30 | Fenêtre temporelle (max 365) |

**Réponse `200`**
```json
[
  {
    "id":               "uuid-payout",
    "amount":           "150000.00",
    "currency":         "XAF",
    "provider":         "MTN_MOMO_CMR",
    "status":           "COMPLETED",
    "created_at":       "2026-06-11T08:28:08.461Z",
    "updated_at":       "2026-06-11T08:28:08.461Z",
    "boutiquier_name":  "Amadou Diallo",
    "boutiquier_phone": "237653456789"
  }
]
```

---

### `GET /grossistes/:id/pending`

Commandes en attente de livraison (PENDING_DELIVERY).

**Réponse `200`**
```json
[
  {
    "credit_id":       "uuid-credit",
    "amount":          "80000.00",
    "credit_status":   "PENDING_DELIVERY",
    "created_at":      "...",
    "boutiquier_name": "Marie Ngo",
    "phone_number":    "237653456700",
    "provider":        "ORANGE_CMR",
    "payout_id":       "uuid-payout"
  }
]
```

---

## 9. Dashboard Banque

### `GET /bank/dashboard`

Toutes les données pour la page `/bank` en un seul appel.

**Réponse `200`**
```json
{
  "metrics": {
    "credits_defaut":     0,
    "credits_actifs":     1,
    "credits_rembourses": 4,
    "credits_annules":    1,
    "total_credits":      6,
    "encours_total":      150000,
    "montant_defaut":     0,
    "montant_rembourse":  320000,
    "npl_rate":           0.0
  },
  "categories": [
    { "category": "Observation", "count": "1" },
    { "category": "Or",          "count": "1" },
    { "category": "Platine",     "count": "1" }
  ],
  "npl_evolution": [
    {
      "day":               "2026-06-16T00:00:00.000Z",
      "observation_count": "1",
      "total_count":       "5"
    }
  ],
  "boutiquiers": [
    {
      "id":                    "aaaaaaaa-...",
      "name":                  "Amadou Diallo",
      "phone_number":          "237653456789",
      "current_score":         "88.07",
      "category":              "Platine",
      "credit_limit":          "250000.00",
      "active_credits_count":  "1",
      "active_encours":        "150000.00"
    }
  ],
  "monthly": [
    {
      "month":            "Apr 2026",
      "total_accorde":    "130000.00",
      "total_rembourse":  "130000.00",
      "total_defaut":     "0"
    },
    {
      "month":            "Jun 2026",
      "total_accorde":    "180000.00",
      "total_rembourse":  "0",
      "total_defaut":     "0"
    }
  ]
}
```

**Usage par section UI**

| Champ | Composant |
|-------|-----------|
| `metrics.*` | 4 cartes KPI en haut |
| `categories` | Donut Chart — répartition boutiquiers |
| `monthly` | Barres groupées — accordé/remboursé/défaut |
| `npl_evolution` | Ligne — taux NPL sur 30 jours |
| `boutiquiers` | Tableau ScoreTable |

**Calcul NPL affiché**
```javascript
// npl_rate est déjà calculé côté backend
// = credits_defaut / (credits_actifs + credits_defaut) * 100
const npl = `${data.metrics.npl_rate.toFixed(1)}%`;
```

---

## 10. Codes d'erreur

| HTTP | Signification |
|------|--------------|
| `200` | Succès |
| `201` | Créé |
| `202` | Accepté (traitement asynchrone en cours) |
| `400` | Paramètres manquants ou invalides |
| `404` | Ressource introuvable |
| `409` | Conflit (doublon) |
| `422` | Règle métier violée |
| `500` | Erreur serveur |

Toutes les erreurs retournent `{ "error": "message lisible" }`.

---

## 11. Référence des types

### Catégories boutiquier

| Valeur | Couleur recommandée | Score | Limite |
|--------|---------------------|-------|--------|
| `Observation` | `#ef4444` (rouge) | < 25 | 0 XAF |
| `Standard` | `#f97316` (orange) | 25-49 | 50 000 XAF |
| `Or` | `#eab308` (jaune) | 50-74 | 100 000 XAF |
| `Platine` | `#22c55e` (vert) | ≥ 75 | 250 000 XAF |

### Statuts crédit

| Valeur | Description |
|--------|-------------|
| `PENDING_DELIVERY` | Payout accepté, en attente de confirmation opérateur |
| `ACTIVE` | Crédit actif, remboursement attendu avant `due_date` |
| `REPAID` | Remboursé intégralement |
| `DEFAULT` | Non remboursé après `due_date` (cron horaire) |
| `CANCELLED` | Annulé (payout échoué, ex: WALLET_LIMIT_REACHED) |

### Statuts transaction pawaPay

| Valeur | Description |
|--------|-------------|
| `PENDING` | En attente de traitement |
| `ACCEPTED` | Accepté par pawaPay |
| `PROCESSING` | En cours de traitement opérateur |
| `COMPLETED` | Validé avec succès |
| `FAILED` | Échoué |

### Codes d'échec importants

| Code | Impact scoring | Description |
|------|---------------|-------------|
| `INSUFFICIENT_BALANCE` | ✅ Pénalisé | Solde insuffisant |
| `PAYMENT_NOT_APPROVED` | ✅ Pénalisé | PIN non validé |
| `PAYER_LIMIT_REACHED` | ✅ Pénalisé | Limite Mobile Money atteinte |
| `PAYER_NOT_FOUND` | ✅ Pénalisé | Numéro inconnu |
| `WALLET_LIMIT_REACHED` | ❌ Non pénalisé | Limite portefeuille grossiste → afficher alerte |

### Providers Mobile Money

| Code | Opérateur | Pays |
|------|-----------|------|
| `MTN_MOMO_CMR` | MTN MoMo | Cameroun |
| `ORANGE_CMR` | Orange Money | Cameroun |

---

## Exemples d'usage par page

### Page `/bank`

```javascript
// Chargement initial
const dashboard = await apiFetch('/bank/dashboard');

// Refresh temps réel
const socket = getSocket();
dashboard.boutiquiers.forEach(b => socket.emit('join:boutiquier', b.id));
socket.on('score:updated', ({ boutiquierId, finalScore, category }) => {
  // Mettre à jour la ligne du tableau correspondante
});
```

### Page `/grossiste`

```javascript
// Commandes du jour
const orders = await apiFetch(`/grossistes/${grossisteId}/orders?days=1`);

// Commandes en attente
const pending = await apiFetch(`/grossistes/${grossisteId}/pending`);

// Temps réel — nouvelle commande livrée
socket.on('payout:completed', async ({ boutiquierId }) => {
  const updated = await apiFetch(`/grossistes/${grossisteId}/orders?days=1`);
  setOrders(updated);
});
```

### Page `/simulator`

```javascript
// Bouton "Dépôt réussi"
const res = await apiFetch('/deposits', {
  method: 'POST',
  body: JSON.stringify({
    boutiquierId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    phoneRaw: '237653456789',   // suffixe 789 → COMPLETED
    amount: 10000,
    currency: 'XAF',
  }),
});

// Bouton "Solde insuffisant"
// phoneRaw: '237653456049'  → suffixe 049 → INSUFFICIENT_BALANCE

// Bouton "Payout réussi"
const payout = await apiFetch('/payouts', {
  method: 'POST',
  body: JSON.stringify({
    boutiquierId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    grossisteId:  'b0000000-0000-0000-0000-000000000001',
    amount: 50000,
    currency: 'XAF',
  }),
});

// Bouton "Wallet limité"
// Utiliser un grossiste avec numéro suffixe 099
```
