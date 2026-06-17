# Guide de Présentation — PawaSupply Score

> Document interne · Hackathon pawaPay Builders · Juin 2026

---

## Pitch en 30 secondes

> "PawaSupply Score est une plateforme de crédit stock fléché pour les petits commerçants camerounais.
> Le boutiquier achète son stock par Mobile Money — chaque transaction nourrit son score de crédit en temps réel.
> Quand sa trésorerie est à sec, il demande un crédit : l'argent part directement chez son grossiste via pawaPay,
> sans PIN, sans délai. Le score se met à jour instantanément sous les yeux du jury."

---

## Problème résolu

Les boutiquiers camerounais n'ont **pas accès au crédit bancaire traditionnel**.  
Ils paient leur stock en cash, sans historique financier traçable.  
Résultat : ruptures de stock fréquentes, perte de revenus, exclusion financière.

---

## Solution PawaSupply Score

```
Boutiquier achète stock (MTN MoMo / Orange Money)
         ↓
  Chaque dépôt = donnée de scoring
         ↓
  Score recalculé en temps réel après chaque webhook pawaPay
         ↓
  Crédit fléché accordé → argent envoyé directement au Grossiste
         ↓
  Grossiste prépare la commande → livraison confirmée
```

---

## Scénario de démo (ordre recommandé)

### Étape 1 — Dashboard Banque `/bank`
- Montrer les **4 KPIs** : crédits actifs, remboursés, défaut, taux NPL
- Montrer le **donut** de répartition catégories (Observation / Standard / Or / Platine)
- Montrer la **courbe NPL** sur 30 jours
- Cliquer sur **"Voir →"** d'Amadou Diallo → aller au profil

### Étape 2 — Profil Boutiquier `/boutiquier/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`
- Montrer le **ScoreRing animé** (score actuel, catégorie Platine)
- Montrer le **badge Live** et l'historique de score sur 90 jours
- Montrer le crédit actif en cours (ACTIVE / PENDING_DELIVERY)

### Étape 3 — Simulateur `/simulator` (moment clé du pitch)

**Scénario A — Dépôt réussi → score monte EN DIRECT**
1. Cliquer **"Dépôt réussi"** → réponse `ACCEPTED`
2. Revenir sur `/bank` ou `/boutiquier/:id` → le score monte automatiquement (Socket.io)
3. Dire : *"Le score se recalcule via webhook pawaPay, sans action manuelle"*

**Scénario B — Solde insuffisant → fréquence pénalisée**
1. Cliquer **"Solde insuffisant"** → réponse `REJECTED` + code `INSUFFICIENT_BALANCE`
2. Dire : *"Les échecs comportementaux (solde insuf, PIN refusé) pénalisent la fréquence. Les pannes opérateur (MTN/Orange down) sont ignorées pour ne pas punir injustement le boutiquier."*

**Scénario C — Crédit fléché → Grossiste reçoit directement**
1. Cliquer **"Payout MTN"** → `ACCEPTED`, crédit `PENDING_DELIVERY`
2. Aller sur `/grossiste` → la commande apparaît dans "En attente"
3. Dire : *"Le grossiste n'a rien à faire. L'argent arrive sur son Mobile Money Marchand automatiquement."*

**Scénario D — WALLET_LIMIT_REACHED (si le jury pose la question)**
1. Expliquer : *"Si le portefeuille du grossiste est plein, le crédit est annulé SANS pénalité pour le boutiquier. En production, le grossiste utilise un Merchant Wallet avec sweeping automatique vers son compte bancaire."*

### Étape 4 — Dashboard Grossiste `/grossiste`
- Montrer les commandes **livrées** et **en attente**
- Dire : *"Le grossiste voit ses commandes en temps réel via Socket.io, sans refresh."*

---

## Questions jury — Réponses préparées

**Q : Comment calculez-vous le score ?**
> Score = Volume × 40% + Fréquence × 60%.
> Volume = montant total des dépôts réussis sur 30 jours, plafonné à 1M XAF.
> Fréquence = ratio dépôts réussis / (réussis + échecs comportementaux).
> Les pannes opérateur ne comptent pas.

**Q : Que se passe-t-il si pawaPay est en panne ?**
> Toutes les transactions restent en PENDING.
> Un cron job tourne toutes les 5 minutes et interroge pawaPay via `GET /v2/deposits/:id`.
> Quand la réponse revient COMPLETED, le score est recalculé automatiquement.
> Aucune transaction n'est perdue.

**Q : Comment gérez-vous la sécurité des webhooks ?**
> En production : validation de signature RFC 9421 (ECDSA P-256).
> En développement/sandbox : désactivée pour faciliter les tests.
> Le backend répond toujours 200 à pawaPay pour éviter les retransmissions inutiles.

**Q : Le boutiquier peut-il dépasser sa limite ?**
> Non. Le backend vérifie avant chaque payout que `amount ≤ credit_limit`.
> Si un crédit est déjà actif, un nouveau payout est refusé immédiatement.

**Q : Pourquoi l'argent va directement au grossiste ?**
> C'est un crédit **fléché** — le boutiquier ne peut pas utiliser l'argent à autre chose.
> Ça réduit le risque de défaut et fidélise le grossiste à la plateforme.

**Q : Que se passe-t-il en cas de non-remboursement ?**
> Un cron horaire passe les crédits dont `due_date < NOW()` en statut DEFAULT.
> Le score chute drastiquement, la limite crédit tombe à 0.
> La banque peut voir les NPL en temps réel dans le dashboard.

---

## Chiffres à retenir

| Métrique | Valeur |
|----------|--------|
| Catégories de crédit | 4 (Observation, Standard, Or, Platine) |
| Opérateurs Mobile Money | 2 (MTN MoMo CMR, Orange CMR) |
| Limite max crédit | 250 000 XAF (Platine) |
| Fenêtre de scoring | 30 jours glissants |
| Échéance crédit | J+14 après payout COMPLETED |
| Cron réconciliation | Toutes les 5 minutes |
| Cron détection défauts | Toutes les heures |

---

## Architecture en 1 slide

```
┌─────────────────────────────────────────────┐
│              BOUTIQUIER (App Mobile)         │
│  Achète stock → MTN MoMo / Orange Money     │
└────────────────────┬────────────────────────┘
                     │ POST /deposits
                     ▼
┌─────────────────────────────────────────────┐
│         BACKEND Express.js + PostgreSQL      │
│  • Initie dépôt pawaPay                     │
│  • Reçoit webhook → recalcule score         │
│  • Émet Socket.io → dashboard temps réel    │
└──────┬──────────────────────────┬───────────┘
       │                          │
       │ POST /v2/deposits         │ Socket.io
       │ POST /v2/payouts          │ score:updated
       ▼                          ▼
┌─────────────┐    ┌──────────────────────────┐
│   pawaPay   │    │  DASHBOARD Next.js        │
│  Sandbox    │    │  /bank · /grossiste       │
│  API v2     │    │  /simulator · /boutiquier │
└──────┬──────┘    └──────────────────────────┘
       │
       │ Webhook COMPLETED
       │ → Score recalculé
       │ → Socket.io émis
       ▼
┌─────────────────────────────────────────────┐
│              GROSSISTE (Dashboard)           │
│  Voit commandes en temps réel               │
│  Reçoit Mobile Money directement            │
└─────────────────────────────────────────────┘
```

---

## Checklist avant la démo

- [ ] Backend démarré : `http://localhost:3000/health` → `{"status":"ok"}`
- [ ] ngrok actif : `https://structure-relic-affidavit.ngrok-free.dev/health` → OK
- [ ] Frontend démarré : `http://localhost:3001`
- [ ] `.env.local` pointe sur ngrok (`NEXT_PUBLIC_API_URL`)
- [ ] Données de seed présentes (4 boutiquiers minimum)
- [ ] Ouvrir `/bank` → le dashboard se charge
- [ ] Ouvrir `/simulator` → les boutons répondent
- [ ] Test rapide : cliquer "Dépôt réussi" → vérifier score monte sur `/bank`

---

## Commandes utiles le jour J

```bash
# Démarrer le backend
cd ~/Documents/hack/pawasupply-score/backend
npm start

# Démarrer ngrok
ngrok http 3000 --url=structure-relic-affidavit.ngrok-free.dev

# Démarrer le frontend
cd ~/Documents/hack/pawasuply-score-frontweb
npm run dev

# Vérifier que tout est OK
curl https://structure-relic-affidavit.ngrok-free.dev/health
```

---

## Repo GitHub

[github.com/SKJUV/pawasuply-score-frontweb](https://github.com/SKJUV/pawasuply-score-frontweb)
