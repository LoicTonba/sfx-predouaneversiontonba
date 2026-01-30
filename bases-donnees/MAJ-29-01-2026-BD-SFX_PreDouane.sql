ALTER PROCEDURE [dbo].[pSP_CreerNoteDetail]

       @Id_Dossier int

       ,@DateDeclaration datetime

AS

BEGIN

       SET NOCOUNT ON;

       DECLARE @Values nvarchar(max), @Message nvarchar(max)

       DECLARE @TAUX_DEVISES TABLE ([ID_Devise] int PRIMARY KEY NOT NULL,  [Code_Devise] nvarchar(5)  NOT NULL, [Taux_Change] numeric(24,6), [ID_Convertion] int NOT NULL)

       DECLARE @ID_Convertion int

 

       --Verifier que le dossier est en cours

       IF NOT EXISTS(SELECT TOP 1 [ID Dossier] FROM TDossiers WHERE ([ID Dossier]=@Id_Dossier) AND ([Statut Dossier]=0))

       BEGIN

              SET @Message='FILE IS NOT IN PROGRESS'

              RAISERROR (@Message, 16, 1) WITH LOG;

              RETURN

       END

 

       -- Verifier taux de change

       INSERT INTO @TAUX_DEVISES([ID_Devise],[Code_Devise],[Taux_Change], [ID_Convertion])

       SELECT [ID_Devise],[Code_Devise],[Taux_Change], [ID_Convertion]

       FROM [dbo].[fx_TauxChangeDossier](@Id_Dossier,@DateDeclaration)

 

       SELECT TOP 1 @ID_Convertion=[ID_Convertion] FROM @TAUX_DEVISES

 

       IF EXISTS(SELECT TOP 1 [ID_Devise] FROM @TAUX_DEVISES WHERE ISNULL([Taux_Change],0)<=0)

       BEGIN

              SET @Values=STUFF((SELECT DISTINCT ' ¤ '+[Code_Devise] AS [text()]

              FROM @TAUX_DEVISES

              WHERE [Taux_Change] IS NULL

              FOR XML PATH('') ),1,3,'')

              SET @Message='MISSING OR WRONG EXCHANGE RATE FOR CURRENCIES {' + @Values +'}'

              RAISERROR (@Message, 16, 1) WITH LOG;

              RETURN

       END

 

       --Verifier information de la pesee et du paquetage du dossier

       Declare @NbrePaquetagePesee int, @PoidsBrutPesee numeric (24,2), @PoidsNetPesee numeric (24,2), @VolumePesee numeric (24,2)

       SELECT @NbrePaquetagePesee=[Nbre Paquetage Pesee], @PoidsBrutPesee=[Poids Brut Pesee], @PoidsNetPesee=[Poids Net Pesee], @VolumePesee=[Volume Pesee]

       FROM TDossiers

       WHERE [ID Dossier]=@Id_Dossier

 

       IF (@NbrePaquetagePesee=0) OR (@PoidsBrutPesee=0)

       BEGIN

              SET @Message='MISSING Gross Weight or Package number on File Header'

              RAISERROR (@Message, 16, 1) WITH LOG;

              RETURN

       END

 

       --Verifier existence Colisage

       Declare @ValeurTotaleColisage numeric (24,2)=0

       SELECT @ValeurTotaleColisage =SUM ([Qte Colis]*[Prix Unitaire Colis]) FROM TColisageDossiers WHERE [Dossier]=@Id_Dossier

       IF @ValeurTotaleColisage=0

       BEGIN

              SET @Message='MISSING PACKING LIST ON FILE'

              RAISERROR (@Message, 16, 1) WITH LOG;

              RETURN

       END

 

 

       -- Verifier HS Code et regime obligatoire sur toutes les lignes

       IF EXISTS(SELECT TOP 1 [ID Colisage Dossier] FROM TColisageDossiers WHERE ([Dossier]=@Id_Dossier) AND (([HS Code] IS NULL) OR ([Regime Declaration] IS NULL)))

       BEGIN

              SET @Values=STUFF((SELECT DISTINCT ' ¤ '+[Description Colis] AS [text()]

              FROM TColisageDossiers

              WHERE ([Dossier]=@Id_Dossier) AND ([HS Code] IS NULL)

              FOR XML PATH('') ),1,3,'')

              SET @Message='MISSING HS CODE OR REGIME FOR LINES {' + @Values +'}'

              RAISERROR (@Message, 16, 1) WITH LOG;

              RETURN

       END

 

       BEGIN TRY

       BEGIN TRANSACTION;

                   

              -- Calcule ajustement Valeur

              EXEC [dbo].[pSP_CalculeAjustementValeurColisage] @Id_Dossier

                   

                    -- Ajout de lignes des notes de detail

                    --Traitement DC=0%

              INSERT INTO [dbo].[TNotesDetail]

                                  ([Colisage Dossier]

                                  ,[Regime]

                                  ,[Valeur]

                                  ,[Nbre Paquetage]

                                  ,[Base Poids Brut]

                                  ,[Base Poids Net]

                                  ,[Base Volume])

              SELECT A.[ID Colisage Dossier]

                    ,N''

                    ,(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur]) * C.[Taux_Change]                   -- La valeur doit integrer l'ajustement, mais ne s'annule pas en cas d'EXO

                     ,@NbrePaquetagePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                    ,@PoidsBrutPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                    ,@PoidsNetPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                    ,@VolumePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

              FROM [dbo].[TColisageDossiers] A

                    INNER JOIN dbo.TRegimesDeclarations B ON A.[Regime Declaration]=B.[ID Regime Declaration]

                    INNER JOIN @TAUX_DEVISES C ON A.Devise=C.ID_Devise

              WHERE ([Dossier]=@Id_Dossier) AND (A.[HS Code]<>0) AND (B.[Taux DC]=0)

                    --Traitement DC=100%

              UNION ALL

              SELECT A.[ID Colisage Dossier]

                    ,N'DC'

                    ,(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur]) * C.[Taux_Change]                   -- La valeur doit integrer l'ajustement

                     ,@NbrePaquetagePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                    ,@PoidsBrutPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                    ,@PoidsNetPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                    ,@VolumePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

              FROM [dbo].[TColisageDossiers] A

                    INNER JOIN dbo.TRegimesDeclarations B ON A.[Regime Declaration]=B.[ID Regime Declaration]

                    INNER JOIN @TAUX_DEVISES C ON A.Devise=C.ID_Devise

              WHERE ([Dossier]=@Id_Dossier) AND (A.[HS Code]<>0) AND (B.[Taux DC]=1)

                    --Traitement DC=x% x in ]0%,100%[

                           -- Cas DC

             UNION ALL

              SELECT A.[ID Colisage Dossier]

                    ,N'DC'

                    ,(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*B.[Taux DC] * C.[Taux_Change]         -- La valeur doit integrer l'ajustement

                     ,@NbrePaquetagePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*B.[Taux DC]/@ValeurTotaleColisage

                    ,@PoidsBrutPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*B.[Taux DC]/@ValeurTotaleColisage

                    ,@PoidsNetPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*B.[Taux DC]/@ValeurTotaleColisage

                    ,@VolumePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*B.[Taux DC]/@ValeurTotaleColisage

              FROM [dbo].[TColisageDossiers] A

                    INNER JOIN dbo.TRegimesDeclarations B ON A.[Regime Declaration]=B.[ID Regime Declaration]

                    INNER JOIN @TAUX_DEVISES C ON A.Devise=C.ID_Devise

              WHERE ([Dossier]=@Id_Dossier) AND (A.[HS Code]<>0) AND (B.[Taux DC] NOT IN (0,1))

                           -- Cas TR

              UNION ALL

              SELECT A.[ID Colisage Dossier]

                    ,N'TR'

                    ,(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*(1-B.[Taux DC]) * C.[Taux_Change]          -- La valeur doit integrer l'ajustement

                     ,@NbrePaquetagePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*(1-B.[Taux DC])/@ValeurTotaleColisage

                    ,@PoidsBrutPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*(1-B.[Taux DC])/@ValeurTotaleColisage

                    ,@PoidsNetPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*(1-B.[Taux DC])/@ValeurTotaleColisage

                    ,@VolumePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*(1-B.[Taux DC])/@ValeurTotaleColisage

              FROM [dbo].[TColisageDossiers] A

                    INNER JOIN dbo.TRegimesDeclarations B ON A.[Regime Declaration]=B.[ID Regime Declaration]

                    INNER JOIN @TAUX_DEVISES C ON A.Devise=C.ID_Devise

              WHERE ([Dossier]=@Id_Dossier) AND (A.[HS Code]<>0) AND (B.[Taux DC] NOT IN (0,1))

 

              -- AJUSTEMENT DES VALEURS SUR LES TOTAUX

              declare @TotalRowsPaquetage numeric(24,2),@TotalRowsPoidsBrut numeric(24,2),@TotalRowsPoidsNet numeric(24,2),@TotalRowsVolume numeric(24,2)

              declare @NoteDetailId int

              SELECT  @TotalRowsPaquetage=SUM([Nbre Paquetage])

                     ,@TotalRowsPoidsBrut=SUM([Base Poids Brut])

                     ,@TotalRowsPoidsNet=SUM([Base Poids Net])

                     ,@TotalRowsVolume=SUM([Base Volume])

              FROM TNotesDetail A INNER JOIN TColisageDossiers B ON A.[Colisage Dossier]=B.[ID Colisage Dossier]

              WHERE B.Dossier=@Id_Dossier

                    --Ajustement [Nbre Paquetage]

              if (@NbrePaquetagePesee<>@TotalRowsPaquetage)

              BEGIN

                    SELECT TOP 1 @NoteDetailId=A.[ID Note Detail]

                    FROM TNotesDetail A INNER JOIN TColisageDossiers B ON A.[Colisage Dossier]=B.[ID Colisage Dossier]

                    WHERE B.Dossier=@Id_Dossier

                    ORDER BY [Nbre Paquetage] DESC;

 

                    UPDATE TNotesDetail SET [Nbre Paquetage]=[Nbre Paquetage] + @NbrePaquetagePesee - @TotalRowsPaquetage WHERE [ID Note Detail]=@NoteDetailId

              END

                    --Ajustement [Base Poids Brut]

              if (@PoidsBrutPesee<>@TotalRowsPoidsBrut)

              BEGIN

                    SELECT TOP 1 @NoteDetailId=A.[ID Note Detail]

                    FROM TNotesDetail A INNER JOIN TColisageDossiers B ON A.[Colisage Dossier]=B.[ID Colisage Dossier]

                    WHERE B.Dossier=@Id_Dossier

                    ORDER BY [Base Poids Brut] DESC;

 

                    UPDATE TNotesDetail SET [Base Poids Brut]=[Base Poids Brut] + @PoidsBrutPesee - @TotalRowsPoidsBrut WHERE [ID Note Detail]=@NoteDetailId

              END

                    --Ajustement [Base Poids Net]

              if (@PoidsNetPesee<>@TotalRowsPoidsNet)

              BEGIN

                    SELECT TOP 1 @NoteDetailId=A.[ID Note Detail]

                    FROM TNotesDetail A INNER JOIN TColisageDossiers B ON A.[Colisage Dossier]=B.[ID Colisage Dossier]

                    WHERE B.Dossier=@Id_Dossier

                    ORDER BY [Base Poids Net] DESC;

 

                    UPDATE TNotesDetail SET [Base Poids Net]=[Base Poids Net] + @PoidsNetPesee - @TotalRowsPoidsNet WHERE [ID Note Detail]=@NoteDetailId

              END

                    --Ajustement [Base Volume]

              if (@VolumePesee<>@TotalRowsVolume)

              BEGIN

                    SELECT TOP 1 @NoteDetailId=A.[ID Note Detail]

                    FROM TNotesDetail A INNER JOIN TColisageDossiers B ON A.[Colisage Dossier]=B.[ID Colisage Dossier]

                    WHERE B.Dossier=@Id_Dossier

                    ORDER BY [Base Volume] DESC;

 

                    UPDATE TNotesDetail SET [Base Volume]=[Base Volume] + @VolumePesee - @TotalRowsVolume WHERE [ID Note Detail]=@NoteDetailId

              END

 

              -- MISE A JOUR DU STATUT DU DOSSIER

              UPDATE dbo.TDossiers SET [Statut Dossier]=-1 WHERE [ID Dossier]=@Id_Dossier

 

              -- CREATION DE L'ETAPE DE CLOTURE

              INSERT INTO dbo.TEtapesDossiers ([Dossier], [Etape Dossier],[Date Debut], [Date Fin])

              VALUES (@Id_Dossier, 1, GETDATE() , GETDATE() )

 

              -- MISE A JOUR DE LA DERNIERE ETAPE DU DOSSIER

              EXEC [dbo].[pSP_RecalculeDerniereEtapeDossier] @Id_Dossier

 

 

              -- MISE A JOUR DU LIEN DE LA CONVERTION AVEC LE DOSSIER

              UPDATE dbo.TDossiers SET [Convertion]=@ID_Convertion WHERE [ID Dossier] =@Id_Dossier

 

       COMMIT TRANSACTION;

       END TRY

       BEGIN CATCH

              -- Rollback if transaction is active

              IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;

 

              SET @Message=ERROR_MESSAGE()

              RAISERROR (@Message, 16, 1) WITH LOG;

              RETURN

       END CATCH;

END

--MISE A JOUR DE LA VUE VColisageDossiers
ALTER     VIEW [dbo].[VColisageDossiers]

AS

SELECT A.[ID Colisage Dossier] AS [ID_Colisage_Dossier]

      ,A.[Dossier] AS [ID_Dossier]

      ,M.[HS Code] AS [HS_Code]

      ,A.[Description Colis] AS [Description_Colis]

      ,A.[No Commande] AS [No_Commande]

      ,A.[Nom Fournisseur] AS [Nom_Fournisseur]

      ,A.[No Facture] AS [No_Facture]

         ,A.[Item No] AS [Item_No]

      ,B.[Code Devise] AS [Code_Devise]

      ,A.[Qte Colis] AS [Qte_Colis]

      ,A.[Prix Unitaire Colis] AS [Prix_Unitaire_Colis]

         ,A.[Qte Colis]*A.[Prix Unitaire Colis] AS [Valeur_Colis]

         ,A.[Ajustement Valeur] AS [Ajustement_Valeur]

      ,A.[Poids Brut] AS [Poids_Brut]

      ,A.[Poids Net] AS [Poids_Net]

      ,A.[Volume] AS [Volume]

      ,C.[Libelle Pays] AS [Pays_Origine]

 

       ,N.ID_Regime_Declaration

       ,N.[ID_Regime_Douanier]

       ,N.[Libelle_Regime_Douanier]

       ,N.[Libelle_Regime_Declaration]

       ,N.[Ratio_DC]

       ,N.[Ratio_TR]

 

      ,A.[Regroupement Client] AS [Regroupement_Client]

         ,A.[Date Creation] AS [Date_Creation]

         ,Z.Nom_Utilisateur AS [Nom_Creation]

  FROM [dbo].[TColisageDossiers] A

       INNER JOIN [dbo].TDevises B ON A.[Devise]=B.[ID Devise]

       INNER JOIN [dbo].TPays C ON A.[Pays Origine]=C.[ID Pays]

       LEFT JOIN [dbo].THSCodes M ON A.[HS Code]=M.[ID HS Code]

       LEFT JOIN [dbo].VRegimesDeclarations N ON A.[Regime Declaration]=N.[ID_Regime_Declaration]

       LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

 

 
--MISE A JOUR DE LA VUE VNotesDetail_Devises
ALTER   VIEW [dbo].[VNotesDetail_Devises]

AS

       SELECT B.[ID_Dossier]

      ,B.[HS_Code]

      ,B.[Pays_Origine]

 

       ,B.ID_Regime_Declaration

       ,B.[ID_Regime_Douanier]

       ,B.[Libelle_Regime_Douanier]

       ,B.[Libelle_Regime_Declaration]

      ,A.[Regime] AS [Regime]

      ,B.[Regroupement_Client]

         ,B.Code_Devise

         ,SUM(CASE

                    WHEN B.[Ratio_DC] IN (0,1) THEN B.[Valeur_Colis]             -- EXO ou 100%DC

                    WHEN A.[Regime]='DC' THEN B.[Valeur_Colis]* B.[Ratio_DC]

                    WHEN A.[Regime]='TR' THEN B.[Valeur_Colis]* B.[Ratio_TR]

                    END

          ) AS [Valeur_Devise]     

          ,SUM(CASE

                    WHEN B.[Ratio_DC] IN (0,1) THEN B.[Ajustement_Valeur]        -- EXO ou 100%DC

                    WHEN A.[Regime]='DC' THEN B.[Ajustement_Valeur]* B.[Ratio_DC]

                    WHEN A.[Regime]='TR' THEN B.[Ajustement_Valeur]* B.[Ratio_TR]

                    END

          ) AS [Ajustement_Devise]      

         ,SUM(A.[Nbre Paquetage]) AS [Nbre_Paquetage]

      ,SUM(A.[Valeur]) AS [Valeur]

 

      ,SUM(A.[Base Poids Brut]) AS [Base_Poids_Brut]

      ,SUM(A.[Base Poids Net]) AS [Base_Poids_Net]

      ,SUM(A.[Base Volume]) AS [Base_Volume]

  FROM [dbo].[TNotesDetail] A

       INNER JOIN [dbo].[VColisageDossiers] B On A.[Colisage Dossier]=B.ID_Colisage_Dossier

       GROUP BY B.[ID_Dossier]

      ,B.[HS_Code]

      ,B.[Pays_Origine]

 

       ,B.ID_Regime_Declaration

       ,B.[ID_Regime_Douanier]

       ,B.[Libelle_Regime_Douanier]

       ,B.[Libelle_Regime_Declaration]

      ,A.[Regime]

      ,B.[Regroupement_Client]

         ,B.Code_Devise

GO

-- MISE A JOUR  DE LA VUE VSessions
ALTER   VIEW [dbo].[VSessions]

AS

       SELECT A.[ID Session] AS [ID_Session]

       ,B.[ID Utilisateur] AS [ID_Utilisateur]

       ,B.[Nom Utilisateur] AS [Nom_Utilisateur]

       ,A.[Debut Session] AS [Debut_Session]

       ,A.[Fin Session] AS [Fin_Session]

       FROM dbo.TSessions A INNER JOIN dbo.TUtilisateurs B ON A.[Utilisateur]=B.[ID Utilisateur]

 

GO