# Spécifications de Sécurité Firebase - Quoto Connect

## Invariants de Données
1. Un utilisateur ne peut pas modifier son propre `role` ou `balance`.
2. Les citations et posts doivent être rattachés à un `creatorId` correspondant à l'utilisateur authentifié.
3. Seuls les admins (`developpeurhacker01@gmail.com` ou mail vérifié dans la liste admin) peuvent modifier la configuration globale `app_config`.
4. Les retraits ne sont possibles que si le solde est supérieur au seuil défini par `RemoteConfig`.

## Les "12 Payloads Toxiques" (Tests de Rejet)
1. **Privilege Escalation**: `PATCH /users/my_id { "role": "admin" }` -> DENY
2. **Identity Spoofing**: `POST /quotes { "text": "...", "creatorId": "someone_else_id" }` -> DENY
3. **Ghost Field Injection**: `POST /users/my_id { "isAdmin": true, "balance": 99999 }` -> DENY
4. **ID Poisoning**: `GET /users/very-long-garbage-string-exceeding-128-chars...` -> DENY
5. **System Field Hijack**: `PATCH /app_config/main_config { "maintenanceMode": false }` par un non-admin -> DENY
6. **Cross-User Edit**: `PATCH /users/other_user_id { "displayName": "Hacked" }` -> DENY
7. **Negative Balance**: `PATCH /users/my_id { "balance": -100 }` -> DENY
8. **Invalid Status**: `PATCH /users/my_id { "status": "GOD_MODE" }` -> DENY
9. **Timestamp Fraud**: `POST /posts { "createdAt": "2000-01-01" }` (doit être `request.time`) -> DENY
10. **Orphaned Post**: `POST /posts { "quoteId": "non_existent_id" }` -> DENY
11. **PII Leak**: `GET /users/private_data_of_another_user` -> DENY
12. **Mass Query Scraping**: `GET /users` (sans filtre `userId == auth.uid`) -> DENY
