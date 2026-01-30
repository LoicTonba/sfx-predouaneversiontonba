SELECT
  A.[ID Session] AS [ID_Session],
  B.[ID Utilisateur] AS [ID_Utilisateur],
  B.[Nom Utilisateur] AS [Nom_Utilisateur],
  A.[Debut Session] AS [Debut_Session],
  A.[Fin Session] AS [Fin_Session]
FROM
  dbo.TSessions AS A
  JOIN dbo.TUtilisateurs AS B ON A.[ID Session] = B.[Session];