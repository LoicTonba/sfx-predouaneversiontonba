SELECT
  A.[ID Regime Declaration] AS [ID_Regime_Declaration],
  B.[ID Regime Douanier] AS [ID_Regime_Douanier],
  B.[Libelle Regime Douanier] AS [Libelle_Regime_Douanier],
  A.[Libelle Regime Declaration] AS [Libelle_Regime_Declaration],
  CASE
    WHEN A.[Taux Regime] = -2 THEN 'TTC'
    WHEN A.[Taux Regime] = -1 THEN '100% TR'
    WHEN A.[Taux Regime] = 0 THEN 'EX0'
    WHEN A.[Taux Regime] = 1 THEN '100% DC'
    ELSE FORMAT([Taux Regime], 'P') + ' DC & ' + FORMAT(1 - [Taux Regime], 'P') + ' TR'
  END AS [Regime_Code],
  CASE
    WHEN A.[Taux Regime] = -2 THEN 0
    WHEN A.[Taux Regime] = -1 THEN 0
    WHEN A.[Taux Regime] = 0 THEN 0
    WHEN A.[Taux Regime] = 1 THEN 1
    ELSE [Taux Regime]
  END AS [Ratio_DC],
  CASE
    WHEN A.[Taux Regime] = -2 THEN 0
    WHEN A.[Taux Regime] = -1 THEN 1
    WHEN A.[Taux Regime] = 0 THEN 0
    WHEN A.[Taux Regime] = 1 THEN 0
    ELSE 1 - [Taux Regime]
  END AS [Ratio_TR],
  A.[Entite] AS [ID_Entite],
  A.[Date Creation] AS [Date_Creation],
  Z.Nom_Utilisateur AS [Nom_Creation]
FROM
  dbo.TRegimesDeclarations AS A
  JOIN TRegimesDouaniers AS B ON A.[Regime Douanier] = B.[ID Regime Douanier]
  LEFT JOIN dbo.[VSessions] AS Z ON A.[Session] = Z.[ID_Session];