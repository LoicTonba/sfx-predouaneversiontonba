SELECT
  A.[ID Regime Client] AS [ID_Regime_Client],
  B.[ID Client] AS [ID_Client],
  B.[Nom Client] AS [Nom_Client],
  C.ID_Regime_Declaration,
  C.[ID_Regime_Douanier],
  C.[Libelle_Regime_Douanier],
  C.[Libelle_Regime_Declaration],
  C.[Regime_Code],
  C.[Ratio_DC],
  C.[Ratio_TR],
  A.[Date Creation] AS [Date_Creation],
  Z.Nom_Utilisateur AS [Nom_Creation]
FROM
  dbo.TRegimesClients AS A
  JOIN dbo.TClients AS B ON A.[Client] = B.[ID Client]
  JOIN dbo.VRegimesDeclarations AS C ON A.[Regime Declaration] = C.ID_Regime_Declaration
  LEFT JOIN dbo.[VSessions] AS Z ON A.[Session] = Z.[ID_Session];