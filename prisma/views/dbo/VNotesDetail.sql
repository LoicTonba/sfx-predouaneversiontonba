SELECT
  B.[ID_Dossier],
  B.[HS_Code],
  B.[Pays_Origine],
  B.[ID_Regime_Declaration],
  B.[ID_Regime_Douanier],
  B.[Libelle_Regime_Douanier],
  B.[Libelle_Regime_Declaration],
  A.[Regime] AS [Regime],
  B.[Regroupement_Client],
  SUM(A.[Nbre Paquetage]) AS [Nbre_Paquetage],
  SUM(A.[Valeur]) AS [Valeur],
  SUM(A.[Base Poids Brut]) AS [Base_Poids_Brut],
  SUM(A.[Base Poids Net]) AS [Base_Poids_Net],
  SUM(A.[Base Volume]) AS [Base_Volume]
FROM
  dbo.TNotesDetail AS A
  JOIN dbo.VColisageDossiers AS B ON A.[Colisage Dossier] = B.ID_Colisage_Dossier
GROUP BY
  B.[ID_Dossier],
  B.[HS_Code],
  B.[Pays_Origine],
  B.[ID_Regime_Declaration],
  B.[ID_Regime_Douanier],
  B.[Libelle_Regime_Douanier],
  B.[Libelle_Regime_Declaration],
  A.[Regime],
  B.[Regroupement_Client];