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