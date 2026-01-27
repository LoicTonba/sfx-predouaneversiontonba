CREATE OR ALTER     PROCEDURE [dbo].[pSP_CalculeAjustementValeurColisage]

       @Id_Dossier int=0

AS

BEGIN

       SET NOCOUNT ON;

 

       -- Reinitialisation de l'ajustement

       UPDATE TColisageDossiers

       SET [Ajustement Valeur]=0

       WHERE ([Dossier]=@Id_Dossier) AND ([Ajustement Valeur]<>0)

 

       Declare @Factures TABLE (ID int IDENTITY (1,1), [No Commande] nvarchar(50) NOT NULL, [Nom Fournisseur] nvarchar(200) NOT NULL, [No Facture] nvarchar(50) NOT NULL, [Total Ajustement] numeric(24,6) NOT NULL, [Total Facture] numeric(24,6) NOT NULL)

       Declare @i int =1, @imax int=0

       Declare @NoCommande nvarchar(50), @NomFournisseur nvarchar(200), @NoFacture nvarchar(50) , @TotalAjustement numeric(24,6) , @TotalFacture numeric(24,6)

 

             -- Recupere les montants des ajustements par facture ([No Facture], [Nom Fournisseur], [No Commande])

       INSERT INTO @Factures ([No Commande],[Nom Fournisseur],[No Facture],[Total Ajustement],[Total Facture] )

       SELECT [No Commande], [Nom Fournisseur], [No Facture], SUM (IIF([HS Code]=0,  [Qte Colis]*[Prix Unitaire Colis],0)), SUM (IIF([HS Code]<>0,  [Qte Colis]*[Prix Unitaire Colis],0))

       FROM TColisageDossiers

       WHERE ([Dossier]=@Id_Dossier)

       GROUP BY [No Commande], [Nom Fournisseur], [No Facture]

       SELECT @imax=COUNT (*) FROM @Factures

 

       WHILE (@i<=@imax)

       BEGIN

             SELECT  @NoCommande =[No Commande], @NomFournisseur =[Nom Fournisseur], @NoFacture =[No Facture], @TotalAjustement=[Total Ajustement], @TotalFacture=[Total Facture] FROM @Factures WHERE ID=@i

 

             IF ((@TotalAjustement<>0) AND (@TotalFacture<>0))

             BEGIN

                    UPDATE TColisageDossiers

                    SET [Ajustement Valeur]=@TotalAjustement*[Qte Colis]*[Prix Unitaire Colis]/@TotalFacture

                    WHERE ([Dossier]=@Id_Dossier) AND ([No Commande]=@NoCommande) AND ([Nom Fournisseur]=@NomFournisseur) AND ([No Facture]=@NoFacture) AND ([HS Code]<>0)

             END

 

             SET @i=@i+1

       END

 

END

GO

 

CREATE OR ALTER PROCEDURE [dbo].[pSP_AjouterColisageDossier]

       @Id_Dossier int

       ,@Upload_Key nvarchar(50)

       ,@HS_Code nvarchar(50)

       ,@Descr nvarchar(1000)

       ,@Command_No nvarchar(50)

       ,@Supplier_Name nvarchar(200)

       ,@Invoice_No nvarchar(50)

       ,@Item_No nvarchar(50)

       ,@Currency nvarchar(5)

       ,@Qty numeric(24,6)

       ,@Unit_Prize numeric(24,6)

       ,@Gross_Weight numeric(24,6)

       ,@Net_Weight numeric(24,6)

       ,@Volume numeric(24,6)

       ,@Country_Origin nvarchar(5)

       ,@Regime_Code nvarchar(10)

       ,@Regime_Ratio numeric(24,6)

       ,@Customer_Grouping nvarchar(200)

       ,@Session int=0

AS

BEGIN

       SET NOCOUNT ON;

 

       DECLARE @Message nvarchar(max)

 

       -- Recuperer l'ID de l'entite du dossier et l'ID du client du dossier

       Declare @ID_Entite int=null,@ID_Client int=null

       SELECT @ID_Entite=B.[Entite] , @ID_Client=[Client]

       FROM TDossiers A INNER JOIN TBranches B ON A.Branche=B.[ID Branche]

       WHERE [ID Dossier]=@Id_Dossier

 

       IF (@ID_Entite is null)

       BEGIN

             SET @Message='FILE ID' + FORMAT(@Id_Dossier,'N' ) + ' NOT EXIST'

             RAISERROR (@Message, 16, 1) WITH LOG;

             RETURN

       END

 

 

       -- recuperer l'ID du HS Code

       Declare @ID_HSCode int=null

       IF (@HS_Code='0')

       BEGIN

             SET @ID_HSCode=0

             SET @Country_Origin=''

             SET @Customer_Grouping=''

             SET @Gross_Weight=0

             SET @Net_Weight=0

             SET @Volume=0

             SET @Regime_Code=''

       END ELSE

       BEGIN

             SELECT @ID_HSCode=[ID HS Code] FROM THSCodes WHERE ([Entite]=@ID_Entite) AND ([HS Code]=@HS_Code)

      

             IF ((@ID_HSCode is null) AND (ISNULL(@HS_Code,'')<>''))

             BEGIN

                    SET @Message='HS CODE ' + @HS_Code + ' NOT EXIST'

                    RAISERROR (@Message, 16, 1) WITH LOG;

                    RETURN

             END

       END

 

       -- Recuperer l'ID de la devise

       Declare @ID_Devise int=null

       SELECT @ID_Devise=[ID Devise] FROM TDevises WHERE [Code Devise]=@Currency

 

       IF (@ID_Devise is null)

       BEGIN

             SET @Message='CURRENCY ' + @Currency + ' NOT EXIST'

             RAISERROR (@Message, 16, 1) WITH LOG;

             RETURN

       END

 

       --Recuperer le pays d'origine

       Declare @ID_Pays int=null

       IF (@ID_HSCode=0)

       BEGIN

             SET @ID_Pays=0

       END ELSE

       BEGIN

             -- Le pays d'origine doit etre implicitement specifie si @HS_Code<>'0'

             IF (ISNULL(@Country_Origin,'')<>'') SELECT @ID_Pays=[ID Pays] FROM TPays WHERE [Code Pays]=@Country_Origin

 

             IF (@ID_Pays is null)

             BEGIN

                    SET @Message='COUNTRY CODE ' + @Country_Origin + ' NOT EXIST'

                    RAISERROR (@Message, 16, 1) WITH LOG;

                    RETURN

             END

       END

 

       -- Recuperer le regime declaration

       Declare @ID_Regime_Declaration int=null

       IF (@ID_HSCode=0)

       BEGIN

             SET @ID_Regime_Declaration=0

       END ELSE

       BEGIN

             SELECT @ID_Regime_Declaration=B.[ID Regime Declaration]

             FROM TRegimesClients A

                    INNER JOIN TRegimesDeclarations B ON A.[Regime Declaration]=B.[ID Regime Declaration]

                    INNER JOIN TRegimesDouaniers C ON B.[Regime Douanier]=C.[ID Regime Douanier]

             WHERE (A.[Client]=@ID_Client) AND (C.[Code Regime Douanier]=ISNULL(@Regime_Code,'')) AND (B.[Taux DC]=@Regime_Ratio/100)

 

             IF (@ID_Regime_Declaration is null)

             BEGIN

                    SET @Message='REGIME ' + @Regime_Code + ' (' + FORMAT(@Regime_Ratio/100,'P') + ') NOT EXIST'

                    RAISERROR (@Message, 16, 1) WITH LOG;

                    RETURN

             END

       END

 

       -- Recuperer l'ID de la ligne de la colisage suivant Row_Key

       Declare @ID_Colisage_Dossier int=null

       IF (ISNULL(@Upload_Key,'')<>'')

       SELECT @ID_Colisage_Dossier=[ID Colisage Dossier] FROM TColisageDossiers WHERE ([Dossier]=@Id_Dossier) AND ([UploadKey]=@Upload_Key)

 

       IF(@ID_Colisage_Dossier is null)

       BEGIN

             -- CAS DE INSERT

             INSERT INTO [dbo].[TColisageDossiers]

           ([Dossier]

           ,[HS Code]

           ,[Description Colis]

           ,[No Commande]

           ,[Nom Fournisseur]

           ,[No Facture]

                ,[Item No]

           ,[Devise]

           ,[Qte Colis]

           ,[Prix Unitaire Colis]

           ,[Poids Brut]

           ,[Poids Net]

           ,[Volume]

           ,[Pays Origine]

           ,[Regime Declaration]

           ,[Regroupement Client]

           ,[UploadKey]

           ,[Session])

             VALUES (@ID_Client

           ,@ID_HSCode

           ,@Descr

           ,ISNULL(@Command_No,'')

           ,ISNULL(@Supplier_Name,'')

           ,ISNULL(@Invoice_No,'')

                ,ISNULL(@Item_No,'')

           ,@ID_Devise

           ,@Qty

           ,@Unit_Prize

           ,@Gross_Weight

           ,@Net_Weight

           ,@Volume

           ,@ID_Pays

           ,@ID_Regime_Declaration

           ,ISNULL(@Customer_Grouping,'')

           ,ISNULL(@Upload_Key,'')

           ,@Session)

       END ELSE

       BEGIN

             -- CAS DE UPDATE

             UPDATE [dbo].[TColisageDossiers]

          SET [HS Code] = @ID_HSCode

               ,[Description Colis] = @Descr

               ,[No Commande] = ISNULL(@Command_No,'')

               ,[Nom Fournisseur] = ISNULL(@Supplier_Name,'')

               ,[No Facture] = ISNULL(@Invoice_No,'')

               ,[Item No] = ISNULL(@Item_No,'')

               ,[Devise] = @ID_Devise

               ,[Qte Colis] = @Qty

               ,[Prix Unitaire Colis] = @Unit_Prize

               ,[Poids Brut] = @Gross_Weight

               ,[Poids Net] = @Net_Weight

               ,[Volume] = @Volume

               ,[Pays Origine] = @ID_Pays

               ,[Regime Declaration] =@ID_Regime_Declaration

               ,[Regroupement Client] = ISNULL(@Customer_Grouping,'')

               ,[UploadKey] = ISNULL(@Upload_Key,'')

               ,[Session] = @session

       WHERE [ID Colisage Dossier]=@ID_Colisage_Dossier

       END

 

END

 

GO