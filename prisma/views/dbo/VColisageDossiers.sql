SELECT
  A.[ID Colisage Dossier] AS [ID_Colisage_Dossier],
  A.[Dossier] AS [ID_Dossier],
  M.[HS Code] AS [HS_Code],
  A.[Description Colis] AS [Description_Colis],
  A.[No Commande] AS [No_Commande],
  A.[Nom Fournisseur] AS [Nom_Fournisseur],
  A.[No Facture] AS [No_Facture],
  A.[Item No] AS [Item_No],
  B.[Code Devise] AS [Code_Devise],
  A.[Qte Colis] AS [Qte_Colis],
  A.[Prix Unitaire Colis] AS [Prix_Unitaire_Colis],
  A.[Qte Colis] * A.[Prix Unitaire Colis] AS [Valeur_Colis],
  A.[Ajustement Valeur] AS [Ajustement_Valeur],
  A.[Poids Brut] AS [Poids_Brut],
  A.[Poids Net] AS [Poids_Net],
  A.[Volume] AS [Volume],
  C.[Libelle Pays] AS [Pays_Origine],
  N.ID_Regime_Declaration,
  N.[ID_Regime_Douanier],
  N.[Libelle_Regime_Douanier],
  N.[Libelle_Regime_Declaration],
  N.[Regime_Code],
  N.[Ratio_DC],
  N.[Ratio_TR],
  A.[Regroupement Client] AS [Regroupement_Client],
  A.[Date Creation] AS [Date_Creation],
  Z.Nom_Utilisateur AS [Nom_Creation]
FROM
  [dbo].[TColisageDossiers] AS A
  JOIN [dbo].TDevises AS B ON A.[Devise] = B.[ID Devise]
  JOIN [dbo].TPays AS C ON A.[Pays Origine] = C.[ID Pays]
  LEFT JOIN [dbo].THSCodes AS M ON A.[HS Code] = M.[ID HS Code]
  LEFT JOIN [dbo].VRegimesDeclarations AS N ON A.[Regime Declaration] = N.[ID_Regime_Declaration]
  LEFT JOIN dbo.[VSessions] AS Z ON A.[Session] = Z.[ID_Session];