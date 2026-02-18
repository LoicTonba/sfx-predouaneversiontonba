import { z } from 'zod';

// ============ CLIENT VALIDATIONS ============

export const ClientCreateSchema = z.object({
    nom: z.string().min(1, "Le nom du client est requis").max(200, "Le nom ne doit pas dépasser 200 caractères"),
    pays: z.string().max(100, "Le pays ne doit pas dépasser 100 caractères").optional(),
    adresse: z.string().max(500, "L'adresse ne doit pas dépasser 500 caractères").optional(),
    telephone: z.string().max(50, "Le téléphone ne doit pas dépasser 50 caractères").optional(),
    email: z.string().email("L'email doit être valide").max(200, "L'email ne doit pas dépasser 200 caractères").optional(),
});

export const ClientUpdateSchema = ClientCreateSchema.partial();

// ============ ORDER TRANSIT VALIDATIONS ============

export const OrderTransitCreateSchema = z.object({
    clientId: z.string().min(1, "Le client est requis").uuid("L'ID client doit être un UUID valide"),
    typeDossierId: z.string().uuid("L'ID type dossier doit être un UUID valide").optional().or(z.literal("")),
    orderReference: z.string().min(1, "La référence de l'ordre de transit est requise").max(100, "La référence ne doit pas dépasser 100 caractères"),
    description: z.string().max(1000, "La description ne doit pas dépasser 1000 caractères").optional().or(z.literal("")),
    numeroOT: z.string().min(1, "Le numéro OT est requis").max(100, "Le numéro OT ne doit pas dépasser 100 caractères"),
    nbrePaquetageOT: z.number().nonnegative("Le nombre de paquetage doit être positif").optional(),
    poidsBrutOT: z.number().nonnegative("Le poids brut doit être positif").optional(),
    poidsNetOT: z.number().nonnegative("Le poids net doit être positif").optional(),
    volumeOT: z.number().nonnegative("Le volume doit être positif").optional(),
    observation: z.string().max(1000, "L'observation ne doit pas dépasser 1000 caractères").optional().or(z.literal("")),
    statut: z.string().max(50, "Le statut ne doit pas dépasser 50 caractères").optional().or(z.literal("")),
});

export const OrderTransitUpdateSchema = OrderTransitCreateSchema.partial();

// ============ COLISAGE VALIDATIONS ============

export const ColisageCreateSchema = z.object({
    orderTransitId: z.string().uuid("L'ID commande doit être un UUID valide"),
    rowKey: z.string().max(100, "La clé de ligne ne doit pas dépasser 100 caractères").optional(),
    hscodeId: z.string().uuid("L'ID HS code doit être un UUID valide"),
    description: z.string().min(1, "La description est requise").max(1000, "La description ne doit pas dépasser 1000 caractères"),
    numeroCommande: z.string().max(50, "Le numéro de commande ne doit pas dépasser 50 caractères").optional(),
    nomFournisseur: z.string().max(200, "Le nom du fournisseur ne doit pas dépasser 200 caractères").optional(),
    numeroFacture: z.string().max(50, "Le numéro de facture ne doit pas dépasser 50 caractères").optional(),
    itemNo: z.string().max(50, "Le numéro de ligne ne doit pas dépasser 50 caractères").optional(),
    deviseId: z.string().uuid("L'ID devise doit être un UUID valide"),
    quantite: z.number().positive("La quantité doit être positive").optional(),
    prixUnitaireColis: z.number().nonnegative("Le prix unitaire doit être positif").optional(),
    poidsBrut: z.number().nonnegative("Le poids brut doit être positif").optional(),
    poidsNet: z.number().nonnegative("Le poids net doit être positif").optional(),
    volume: z.number().nonnegative("Le volume doit être positif").optional(),
    paysOrigineId: z.string().uuid("L'ID pays doit être un UUID valide"),
    regimeDeclarationId: z.string().uuid("L'ID régime déclaration doit être un UUID valide").optional(),
    regroupementClient: z.string().max(200, "Le regroupement client ne doit pas dépasser 200 caractères").optional(),
});

// ============ COLISAGE IMPORT VALIDATIONS ============

export const ColisageImportRowSchema = z.object({
    rowKey: z.string().max(100, "La clé de ligne ne doit pas dépasser 100 caractères").optional(),
    hscode: z.string().optional(),
    description: z.string().min(1, "La description est requise").max(1000, "La description ne doit pas dépasser 1000 caractères"),
    numeroCommande: z.string().max(50, "Le numéro de commande ne doit pas dépasser 50 caractères").optional(),
    nomFournisseur: z.string().max(200, "Le nom du fournisseur ne doit pas dépasser 200 caractères").optional(),
    numeroFacture: z.string().max(50, "Le numéro de facture ne doit pas dépasser 50 caractères").optional(),
    itemNo: z.string().max(50, "Le numéro de ligne ne doit pas dépasser 50 caractères").optional(),
    devise: z.string().min(1, "Code devise requis"),
    quantite: z.number().positive("La quantité doit être positive").optional(),
    prixUnitaireColis: z.number().nonnegative("Le prix unitaire doit être positif").optional(),
    poidsBrut: z.number().nonnegative("Le poids brut doit être positif").optional(),
    poidsNet: z.number().nonnegative("Le poids net doit être positif").optional(),
    volume: z.number().nonnegative("Le volume doit être positif").optional(),
    paysOrigine: z.string().min(1, "Code pays requis"),
    regimeCode: z.string().optional(),
    regimeRatio: z.union([z.number(), z.string()]).optional(),
    regroupementClient: z.string().max(200, "Le regroupement client ne doit pas dépasser 200 caractères").optional(),
});

export type ColisageImportRow = z.infer<typeof ColisageImportRowSchema>;

export const ColisageImportSchema = z.object({
    orderReference: z.string().min(1, "Référence de commande requise"),
    description: z.string().min(1, "La description est requise").max(1000, "La description ne doit pas dépasser 1000 caractères"),
    numeroCommande: z.string().max(50, "Le numéro de commande ne doit pas dépasser 50 caractères").optional(),
    nomFournisseur: z.string().max(200, "Le nom du fournisseur ne doit pas dépasser 200 caractères").optional(),
    deviseCode: z.string().min(1, "Code devise requis"),
    paysCode: z.string().min(1, "Code pays requis"),
    hscodeCode: z.string().optional(),
    regimeLibelle: z.string().optional(),
    quantite: z.number().positive("La quantité doit être positive").optional(),
    prixUnitaireColis: z.number().nonnegative("Le prix unitaire doit être positif").optional(),
    poidsBrut: z.number().nonnegative("Le poids brut doit être positif").optional(),
    poidsNet: z.number().nonnegative("Le poids net doit être positif").optional(),
    volume: z.number().nonnegative("Le volume doit être positif").optional(),
});

export type ColisageImport = z.infer<typeof ColisageImportSchema>;

export const ColisageUpdateSchema = ColisageCreateSchema.partial();

// ============ DECLARATION VALIDATIONS ============

export const DeclarationCreateSchema = z.object({
    orderTransitId: z.string().uuid("L'ID commande doit être un UUID valide"),
    numeroDeclaration: z.string().min(1, "Le numéro de déclaration est requis").max(100, "Le numéro ne doit pas dépasser 100 caractères"),
    statut: z.string().max(50, "Le statut ne doit pas dépasser 50 caractères").optional(),
});

export const DeclarationUpdateSchema = DeclarationCreateSchema.partial();

// ============ HSCODE VALIDATIONS ============

export const HscodeCreateSchema = z.object({
    code: z.string().min(6, "Le code doit avoir au moins 6 caractères").max(15, "Le code ne doit pas dépasser 15 caractères"),
    libelle: z.string().min(1, "Le libellé est requis").max(100, "Le libellé ne doit pas dépasser 100 caractères"),
});

export const HscodeUpdateSchema = HscodeCreateSchema.partial();

// ============ TPAYS VALIDATIONS ============

export const TPaysCreateSchema = z.object({
    code: z.string().min(1, "Le code pays est requis").max(5, "Le code ne doit pas dépasser 5 caractères"),
    libelle: z.string().min(1, "Le libellé pays est requis").max(200, "Le libellé ne doit pas dépasser 200 caractères"),
});

export const TPaysUpdateSchema = TPaysCreateSchema.partial();

// ============ TREGIME DOUANIER VALIDATIONS ============

export const TRegimeDouanierCreateSchema = z.object({
    code: z.string().min(1, "Le code régime est requis").max(10, "Le code ne doit pas dépasser 10 caractères"),
    libelle: z.string().min(1, "Le libellé est requis").max(200, "Le libellé ne doit pas dépasser 200 caractères"),
});

export const TRegimeDouanierUpdateSchema = TRegimeDouanierCreateSchema.partial();

// ============ TREGIME DECLARATION VALIDATIONS ============

export const TRegimeDeclarationCreateSchema = z.object({
    regimeDouanierId: z.string().min(1, "L'ID régime douanier est requis"),
    libelle: z.string().min(1, "Le libellé est requis").max(200, "Le libellé ne doit pas dépasser 200 caractères"),
    tauxRegime: z.number()
        .refine((val) => val === -2 || val === -1 || (val >= 0 && val <= 1), {
            message: "Le taux régime doit être -2 (TTC), -1 (100% TR), 0 (EXO), 1 (100% DC) ou entre 0 et 1 (DC RATIO)"
        }),
});

export const TRegimeDeclarationUpdateSchema = TRegimeDeclarationCreateSchema.partial();

// ============ TREGIME CLIENT VALIDATIONS ============

export const TRegimeClientCreateSchema = z.object({
    regimeDeclarationId: z.string().uuid("L'ID régime déclaration doit être un UUID valide"),
    clientId: z.string().uuid("L'ID client doit être un UUID valide"),
});

// ============ TNOTE DETAIL VALIDATIONS ============

export const TNoteDetailCreateSchema = z.object({
    colisageId: z.string().uuid("L'ID colisage doit être un UUID valide"),
    regime: z.string().max(2, "Le régime ne doit pas dépasser 2 caractères").optional(),
    baseQuantite: z.number().positive("La quantité doit être positive").optional(),
    basePrixUnitaire: z.number().nonnegative("Le prix unitaire doit être positif").optional(),
    basePoidsBrut: z.number().nonnegative("Le poids brut doit être positif").optional(),
    basePoidsNet: z.number().nonnegative("Le poids net doit être positif").optional(),
    baseVolume: z.number().nonnegative("Le volume doit être positif").optional(),
});

export const TNoteDetailUpdateSchema = TNoteDetailCreateSchema.partial();

// ============ SUIVI ETAPE VALIDATIONS ============

export const SuiviEtapeCreateSchema = z.object({
    orderTransitId: z.string().uuid("L'ID commande doit être un UUID valide"),
    etapeId: z.string().uuid("L'ID étape doit être un UUID valide"),
    reference: z.string().max(200, "La référence ne doit pas dépasser 200 caractères").optional(),
    quantite: z.number().nonnegative("La quantité doit être positive").optional(),
    observation: z.string().max(1000, "L'observation ne doit pas dépasser 1000 caractères").optional(),
    statut: z.string().max(50, "Le statut ne doit pas dépasser 50 caractères").optional(),
});

export const SuiviEtapeUpdateSchema = SuiviEtapeCreateSchema.partial();

// ============ ETAPE VALIDATIONS ============

export const EtapeCreateSchema = z.object({
    code: z.string().min(1, "Le code étape est requis").max(10, "Le code ne doit pas dépasser 10 caractères"),
    libelle: z.string().min(1, "Le libellé est requis").max(200, "Le libellé ne doit pas dépasser 200 caractères"),
    ordre: z.number().int("L'ordre doit être un nombre entier").positive("L'ordre doit être positif"),
    suiviDuree: z.boolean().optional(),
    delai: z.number().int("Le délai doit être un nombre entier").nonnegative("Le délai doit être positif").optional(),
    circuit: z.string().max(200, "Le circuit ne doit pas dépasser 200 caractères").optional(),
});

export const EtapeUpdateSchema = EtapeCreateSchema.partial();

// ============ TDEVISES VALIDATIONS ============

export const TDevisesCreateSchema = z.object({
    code: z.string().min(1, "Le code devise est requis").max(5, "Le code ne doit pas dépasser 5 caractères"),
    libelle: z.string().min(1, "Le libellé est requis").max(200, "Le libellé ne doit pas dépasser 200 caractères"),
    decimal: z.number().int("Le nombre de décimales doit être un nombre entier").nonnegative("Le nombre de décimales doit être positif").optional(),
});

export const TDevisesUpdateSchema = TDevisesCreateSchema.partial();

// ============ TSENS TRAFIC VALIDATIONS ============

export const TSensTraficCreateSchema = z.object({
    libelle: z.string().min(1, "Le libellé est requis").max(200, "Le libellé ne doit pas dépasser 200 caractères"),
});

export const TSensTraficUpdateSchema = TSensTraficCreateSchema.partial();

// ============ TMODES TRANSPORT VALIDATIONS ============

export const TModesTransportCreateSchema = z.object({
    libelle: z.string().min(1, "Le libellé est requis").max(200, "Le libellé ne doit pas dépasser 200 caractères"),
});

export const TModesTransportUpdateSchema = TModesTransportCreateSchema.partial();

// ============ TYPE EXPORTS ============

export type ClientCreate = z.infer<typeof ClientCreateSchema>;
export type ClientUpdate = z.infer<typeof ClientUpdateSchema>;

export type OrderTransitCreate = z.infer<typeof OrderTransitCreateSchema>;
export type OrderTransitUpdate = z.infer<typeof OrderTransitUpdateSchema>;

export type ColisageCreate = z.infer<typeof ColisageCreateSchema>;
export type ColisageUpdate = z.infer<typeof ColisageUpdateSchema>;

export type DeclarationCreate = z.infer<typeof DeclarationCreateSchema>;
export type DeclarationUpdate = z.infer<typeof DeclarationUpdateSchema>;

export type HscodeCreate = z.infer<typeof HscodeCreateSchema>;
export type HscodeUpdate = z.infer<typeof HscodeUpdateSchema>;

export type TPaysCreate = z.infer<typeof TPaysCreateSchema>;
export type TPaysUpdate = z.infer<typeof TPaysUpdateSchema>;

export type TRegimeDouanierCreate = z.infer<typeof TRegimeDouanierCreateSchema>;
export type TRegimeDouanierUpdate = z.infer<typeof TRegimeDouanierUpdateSchema>;

export type TRegimeDeclarationCreate = z.infer<typeof TRegimeDeclarationCreateSchema>;
export type TRegimeDeclarationUpdate = z.infer<typeof TRegimeDeclarationUpdateSchema>;

export type TRegimeClientCreate = z.infer<typeof TRegimeClientCreateSchema>;

export type TNoteDetailCreate = z.infer<typeof TNoteDetailCreateSchema>;
export type TNoteDetailUpdate = z.infer<typeof TNoteDetailUpdateSchema>;

export type SuiviEtapeCreate = z.infer<typeof SuiviEtapeCreateSchema>;
export type SuiviEtapeUpdate = z.infer<typeof SuiviEtapeUpdateSchema>;

export type EtapeCreate = z.infer<typeof EtapeCreateSchema>;
export type EtapeUpdate = z.infer<typeof EtapeUpdateSchema>;

export type TDevisesCreate = z.infer<typeof TDevisesCreateSchema>;
export type TDevisesUpdate = z.infer<typeof TDevisesUpdateSchema>;

export type TSensTraficCreate = z.infer<typeof TSensTraficCreateSchema>;
export type TSensTraficUpdate = z.infer<typeof TSensTraficUpdateSchema>;

export type TModesTransportCreate = z.infer<typeof TModesTransportCreateSchema>;
export type TModesTransportUpdate = z.infer<typeof TModesTransportUpdateSchema>;
