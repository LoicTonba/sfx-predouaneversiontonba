-- MODIFICATION ET AJUSTEMENTS DANS SFX_PreDouane  (TDossiers,VDossiers, 

USE SFX_PreDouane;
GO

--Ajout du champ [Nbre Paquetage Pesee]
ALTER TABLE dbo.TDossiers
ADD [Nbre Paquetage Pesee] INT NOT NULL
    CONSTRAINT DF_TDossiers_NbrePaquetagePesee DEFAULT (0);
GO

-- Suppression de la contrainte  [DF__TDossiers__Qte C__5EBF139D] dépend de colonne 'Qte Colis OT'
ALTER TABLE dbo.TDossiers
DROP CONSTRAINT [DF__TDossiers__Qte C__5EBF139D];
GO

-- Suppression de la contrainte  [DF__TDossiers__Poids__5FB337D6] dépend de colonne 'Poids Brut OT'
ALTER TABLE dbo.TDossiers
DROP CONSTRAINT [DF__TDossiers__Poids__5FB337D6];
GO

-- Suppression de la contrainte  [DF__TDossiers__Poids__60A75C0F] dépend de colonne 'Poids Net OT'
ALTER TABLE dbo.TDossiers
DROP CONSTRAINT [DF__TDossiers__Poids__60A75C0F];
GO

-- Suppression de la contrainte  [DF__TDossiers__Volum__619B8048] dépend de colonne 'Volume OT'
ALTER TABLE dbo.TDossiers
DROP CONSTRAINT [DF__TDossiers__Volum__619B8048];
GO

--Suppression des champs  [Qte Colis OT], [Poids Brut OT],[Poids Net OT],[Volume OT] dans la table TDossiers
ALTER TABLE dbo.TDossiers
DROP COLUMN
    [Qte Colis OT],
    [Poids Brut OT],
    [Poids Net OT],
    [Volume OT];
GO

-- Modification de la vue VDossiers
ALTER VIEW dbo.VDossiers
AS
SELECT 
    A.[ID Dossier] AS [ID_Dossier],

    I.[ID_Branche],
    I.[Nom_Branche],
    I.[ID_Entite],
    I.[Nom_Entite],
    I.[ID_Groupe_Entite],
    I.[ID_Pays],
    I.[Libelle_Pays],
    I.[Devise_Locale],

    C.[ID_Type_Dossier],
    C.[Libelle_Type_Dossier],
    C.[ID_Sens_Trafic],
    C.[Libelle_Sens_Trafic],
    C.[ID_Mode_Transport],
    C.[Libelle_Mode_Transport],

    B.[ID Client] AS [ID_Client],
    B.[Nom Client] AS [Nom_Client],

    A.[Description Dossier] AS [Description_Dossier],
    A.[No OT] AS [No_OT],
    A.[No Dossier] AS [No_Dossier],

    -- ?? CHANGEMENT CLÉ
    A.[Nbre Paquetage Pesee] AS [Nbre_Paquetage_Pesee],
    A.[Poids Brut Pesee] AS [Poids_Brut_Pesee],
    A.[Poids Net Pesee] AS [Poids_Net_Pesee],
    A.[Volume Pesee] AS [Volume_Pesee],

    G.[ID Utilisateur] AS [Responsable_ID],
    G.[Nom Utilisateur] AS [Nom_Responsable],

    P.[Date Convertion] AS [Date_Declaration],

    N.[ID_Etape_Dossier] AS [ID_Etape_Actuelle],
    N.[Libelle_Etape] AS [Libelle_Etape_Actuelle],
    N.[Circuit_Etape] AS [Circuit_Etape_Actuelle],
    N.[Index_Etape] AS [Index_Etape_Actuelle],
    N.[Date_Debut_Etape] AS [Date_Debut_Etape_Actuelle],
    N.[Date_Fin_Etape] AS [Date_Fin_Etape_Actuelle],
    N.[Reference_Etape] AS [Reference_Etape_Actuelle],
    N.[Qte_Etape] AS [Qte_Etape_Actuelle],
    N.[Obs_Etape] AS [Obs_Etape_Actuelle],
    N.[Retard_Etape] AS [Retard_Etape_Actuelle],

    X.[Date Debut] AS [Date_Ouverture_Dossier],
    Y.[Date Debut] AS [Date_Cloture_Dossier],

    H.[ID Statut Dossier] AS [ID_Statut_Dossier],
    H.[Libelle Statut Dossier] AS [Libelle_Statut_Dossier],

    A.[Date Creation] AS [Date_Creation],
    Z.Nom_Utilisateur AS [Nom_Creation]

FROM dbo.TDossiers A
INNER JOIN dbo.TClients B 
    ON A.[Client] = B.[ID Client]
INNER JOIN dbo.VTypesDossiers C 
    ON A.[Type Dossier] = C.[ID_Type_Dossier]
INNER JOIN dbo.TUtilisateurs G 
    ON A.[Responsable Dossier] = G.[ID Utilisateur]
INNER JOIN dbo.TStatutsDossier H 
    ON A.[Statut Dossier] = H.[ID Statut Dossier]
INNER JOIN dbo.VBranches I 
    ON A.[Branche] = I.[ID_Branche]
LEFT JOIN dbo.VEtapesDossiers N 
    ON A.[Derniere Etape Dossier] = N.[ID_Etape_Dossier]
LEFT JOIN dbo.TConvertions P 
    ON A.[Convertion] = P.[ID Convertion]
LEFT JOIN dbo.VSessions Z 
    ON A.[Session] = Z.[ID_Session]
LEFT JOIN (
    SELECT [Dossier], [Date Debut] 
    FROM dbo.TEtapesDossiers 
    WHERE [Etape Dossier] = 0
) X ON A.[ID Dossier] = X.[Dossier]
LEFT JOIN (
    SELECT [Dossier], [Date Debut] 
    FROM dbo.TEtapesDossiers 
    WHERE [Etape Dossier] = 1000000
) Y ON A.[ID Dossier] = Y.[Dossier];
GO

-- Renommer le champ [Prix Unitaire Facture] à [Prix Unitaire Colis] dans la table TColisageDossiers
EXEC sp_rename 
    'dbo.TColisageDossiers.[Prix Unitaire Facture]', 
    'Prix Unitaire Colis', 
    'COLUMN';
GO

-- Ajouter le champ [Ajustement Valeur] dans la table TColisageDossiers
ALTER TABLE dbo.TColisageDossiers
ADD [Ajustement Valeur] numeric(24,6) NOT NULL
    CONSTRAINT DF_TColisageDossiers_AjustementValeur DEFAULT (0);
GO

-- Vérification s'il y'a des valeurs NULL 
SELECT *
FROM dbo.TColisageDossiers
WHERE 
    [No Commande] IS NULL
    OR [Nom Fournisseur] IS NULL
    OR [No Facture] IS NULL;

-- Si le SELECT retourne des lignes, corrige-les d’abord
UPDATE dbo.TColisageDossiers
SET 
    [No Commande] = ISNULL([No Commande], ''),
    [Nom Fournisseur] = ISNULL([Nom Fournisseur], ''),
    [No Facture] = ISNULL([No Facture], '');
GO

-- Rendre NOT NULL les colonnes [No Commande], [Nom Fournisseur], [No Facture]
ALTER TABLE dbo.TColisageDossiers
ALTER COLUMN [No Commande] nvarchar(50) NOT NULL;
GO

ALTER TABLE dbo.TColisageDossiers
ALTER COLUMN [Nom Fournisseur] nvarchar(200) NOT NULL;
GO

ALTER TABLE dbo.TColisageDossiers
ALTER COLUMN [No Facture] nvarchar(50) NOT NULL;
GO

-- Modification de la vue VColisageDossiers
ALTER VIEW [dbo].[VColisageDossiers]
AS
SELECT
    A.[ID Colisage Dossier]        AS [ID_Colisage_Dossier],
    A.[Dossier]                   AS [ID_Dossier],

    M.[HS Code]                   AS [HS_Code],

    A.[Description Colis]         AS [Description_Colis],
    A.[No Commande]               AS [No_Commande],
    A.[Nom Fournisseur]           AS [Nom_Fournisseur],
    A.[No Facture]                AS [No_Facture],
    A.[Item No]                   AS [Item_No],

    B.[Code Devise]               AS [Code_Devise],

    A.[Qte Colis]                 AS [Qte_Colis],
    A.[Prix Unitaire Colis]       AS [Prix_Unitaire_Colis],

    -- ? Calcul métier IMPORTANT
    -- A.[Qte Colis] * A.[Prix Unitaire Colis] AS [Valeur_Colis],

    A.[Poids Brut]                AS [Poids_Brut],
    A.[Poids Net]                 AS [Poids_Net],
    A.[Volume]                    AS [Volume],

    C.[Libelle Pays]              AS [Pays_Origine],

    -- Régime de déclaration
    N.[ID_Regime_Declaration],
    N.[ID_Regime_Douanier],
    N.[Libelle_Regime_Douanier],
    N.[Libelle_Regime_Declaration],
    N.[Ratio_DC],
    N.[Ratio_TR],

    A.[Regroupement Client]       AS [Regroupement_Client],

    A.[Date Creation]             AS [Date_Creation],
    Z.[Nom_Utilisateur]           AS [Nom_Creation]

FROM dbo.TColisageDossiers A
INNER JOIN dbo.TDevises B
    ON A.[Devise] = B.[ID Devise]

INNER JOIN dbo.TPays C
    ON A.[Pays Origine] = C.[ID Pays]

LEFT JOIN dbo.THSCodes M
    ON A.[HS Code] = M.[ID HS Code]

LEFT JOIN dbo.VRegimesDeclarations N
    ON A.[Regime Declaration] = N.[ID_Regime_Declaration]

LEFT JOIN dbo.VSessions Z
    ON A.[Session] = Z.[ID_Session];
GO

-- Modifier la procédure stockée pSP_AjouterColisageDossier
ALTER PROCEDURE [dbo].[pSP_AjouterColisageDossier]
    @Id_Dossier int,
    @Row_Key nvarchar(50),
    @HS_Code nvarchar(50),
    @Descr nvarchar(1000),
    @Command_No nvarchar(50),
    @Supplier_Name nvarchar(200),
    @Invoice_No nvarchar(50),
    @Currency nvarchar(5),
    @Qty numeric(24,6),
    @Unit_Prize numeric(24,6),
    @Gross_Weight numeric(24,6),
    @Net_Weight numeric(24,6),
    @Volume numeric(24,6),
    @Country_Origin nvarchar(5),
    @Regime_Code nvarchar(10),
    @Regime_Ratio numeric(24,6),
    @Customer_Grouping nvarchar(200),
    @Session int = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Message nvarchar(max);

    /* ===============================
       1?. ENTITÉ + CLIENT DU DOSSIER
    =============================== */
    DECLARE @ID_Entite int = NULL, @ID_Client int = NULL;

    SELECT 
        @ID_Entite = B.[Entite],
        @ID_Client = A.[Client]
    FROM TDossiers A
    INNER JOIN TBranches B ON A.[Branche] = B.[ID Branche]
    WHERE A.[ID Dossier] = @Id_Dossier;

    IF (@ID_Entite IS NULL)
    BEGIN
        SET @Message = 'FILE ID ' + CAST(@Id_Dossier AS nvarchar) + ' NOT EXIST';
        RAISERROR (@Message, 16, 1);
        RETURN;
    END

    /* ===============================
       2?. HS CODE (CAS 0 AUTORISÉ)
    =============================== */
    DECLARE @ID_HSCode int = NULL;

    IF (@HS_Code = '0')
    BEGIN
        SET @ID_HSCode = 0;
        SET @Country_Origin = '';
        SET @Customer_Grouping = NULL;
        SET @Gross_Weight = 0;
        SET @Net_Weight = 0;
        SET @Volume = 0;
        SET @Regime_Code = '';
    END
    ELSE
    BEGIN
        SELECT @ID_HSCode = [ID HS Code]
        FROM THSCodes
        WHERE [Entite] = @ID_Entite
          AND [HS Code] = @HS_Code;

        IF (@ID_HSCode IS NULL)
        BEGIN
            SET @Message = 'HS CODE ' + @HS_Code + ' NOT EXIST';
            RAISERROR (@Message, 16, 1);
            RETURN;
        END
    END

    /* ===============================
       3?. DEVISE
    =============================== */
    DECLARE @ID_Devise int = NULL;

    SELECT @ID_Devise = [ID Devise]
    FROM TDevises
    WHERE [Code Devise] = @Currency;

    IF (@ID_Devise IS NULL)
    BEGIN
        SET @Message = 'CURRENCY ' + @Currency + ' NOT EXIST';
        RAISERROR (@Message, 16, 1);
        RETURN;
    END

    /* ===============================
       4?. PAYS D’ORIGINE
    =============================== */
    DECLARE @ID_Pays int = NULL;

    IF (@ID_HSCode = 0)
        SET @ID_Pays = 0;
    ELSE
    BEGIN
        SELECT @ID_Pays = [ID Pays]
        FROM TPays
        WHERE [Code Pays] = @Country_Origin;

        IF (@ID_Pays IS NULL)
        BEGIN
            SET @Message = 'COUNTRY CODE ' + @Country_Origin + ' NOT EXIST';
            RAISERROR (@Message, 16, 1);
            RETURN;
        END
    END

    /* ===============================
       5?. RÉGIME DÉCLARATION
    =============================== */
    DECLARE @ID_Regime_Declaration int = NULL;

    IF (@ID_HSCode = 0)
        SET @ID_Regime_Declaration = 0;
    ELSE
    BEGIN
        SELECT @ID_Regime_Declaration = B.[ID Regime Declaration]
        FROM TRegimesClients A
        INNER JOIN TRegimesDeclarations B ON A.[Regime Declaration] = B.[ID Regime Declaration]
        INNER JOIN TRegimesDouaniers C ON B.[Regime Douanier] = C.[ID Regime Douanier]
        WHERE A.[Client] = @ID_Client
          AND C.[Code Regime Douanier] = @Regime_Code
          AND B.[Taux DC] = @Regime_Ratio / 100;

        IF (@ID_Regime_Declaration IS NULL)
        BEGIN
            SET @Message = 'REGIME ' + @Regime_Code + ' (' + FORMAT(@Regime_Ratio / 100, 'P') + ') NOT EXIST';
            RAISERROR (@Message, 16, 1);
            RETURN;
        END
    END

    /* ===============================
       6?. INSERT OU UPDATE
    =============================== */
    DECLARE @ID_Colisage_Dossier int = NULL;

    IF (@Row_Key <> '')
        SELECT @ID_Colisage_Dossier = [ID Colisage Dossier]
        FROM TColisageDossiers
        WHERE [Dossier] = @ID_Client
          AND [UploadKey] = @Row_Key;

    IF (@ID_Colisage_Dossier IS NULL)
    BEGIN
        INSERT INTO TColisageDossiers (
            [Dossier],
            [HS Code],
            [Description Colis],
            [No Commande],
            [Nom Fournisseur],
            [No Facture],
            [Devise],
            [Qte Colis],
            [Prix Unitaire Colis],
            [Poids Brut],
            [Poids Net],
            [Volume],
            [Pays Origine],
            [Regime Declaration],
            [Regroupement Client],
            [UploadKey],
            [Session]
        )
        VALUES (
            @ID_Client,
            @ID_HSCode,
            @Descr,
            @Command_No,
            @Supplier_Name,
            @Invoice_No,
            @ID_Devise,
            @Qty,
            @Unit_Prize,
            @Gross_Weight,
            @Net_Weight,
            @Volume,
            @ID_Pays,
            @ID_Regime_Declaration,
            @Customer_Grouping,
            @Row_Key,
            @Session
        );
    END
    ELSE
    BEGIN
        UPDATE TColisageDossiers
        SET
            [HS Code] = @ID_HSCode,
            [Description Colis] = @Descr,
            [No Commande] = @Command_No,
            [Nom Fournisseur] = @Supplier_Name,
            [No Facture] = @Invoice_No,
            [Devise] = @ID_Devise,
            [Qte Colis] = @Qty,
            [Prix Unitaire Colis] = @Unit_Prize,
            [Poids Brut] = @Gross_Weight,
            [Poids Net] = @Net_Weight,
            [Volume] = @Volume,
            [Pays Origine] = @ID_Pays,
            [Regime Declaration] = @ID_Regime_Declaration,
            [Regroupement Client] = @Customer_Grouping,
            [UploadKey] = @Row_Key,
            [Session] = @Session
        WHERE [ID Colisage Dossier] = @ID_Colisage_Dossier;
    END
END;
GO


-- Modification de la vue VSessions

CREATE OR ALTER   VIEW [dbo].[VSessions]

AS

                SELECT A.[ID Session] AS [ID_Session]

                ,B.[ID Utilisateur] AS [ID_Utilisateur]

                ,B.[Nom Utilisateur] AS [Nom_Utilisateur]

                ,A.[Debut Session] AS [Debut_Session]

                ,A.[Fin Session] AS [Fin_Session]

                FROM dbo.TSessions A INNER JOIN dbo.TUtilisateurs B ON A.Utilisateur=B.[ID Utilisateur]

 

GO

-- Modification de la procédure pSP_AjouterColisageDossier

CREATE OR ALTER PROCEDURE [dbo].[pSP_AjouterColisageDossier]
    @Id_Dossier int,
    @Row_Key nvarchar(50),
    @HS_Code nvarchar(50),
    @Descr nvarchar(1000),
    @Command_No nvarchar(50),
    @Supplier_Name nvarchar(200),
    @Invoice_No nvarchar(50),
    @Item_No nvarchar(50) = '',
    @Currency nvarchar(5),
    @Qty numeric(24,6),
    @Unit_Prize numeric(24,6),
    @Gross_Weight numeric(24,6),
    @Net_Weight numeric(24,6),
    @Volume numeric(24,6),
    @Country_Origin nvarchar(5),
    @Regime_Code nvarchar(10),
    @Regime_Ratio numeric(24,6),
    @Customer_Grouping nvarchar(200),
    @Session int = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Message nvarchar(max);

    /* 1?. ENTITÉ + CLIENT */
    DECLARE @ID_Entite int = NULL, @ID_Client int = NULL;

    SELECT 
        @ID_Entite = B.[Entite],
        @ID_Client = A.[Client]
    FROM TDossiers A
    INNER JOIN TBranches B ON A.Branche = B.[ID Branche]
    WHERE A.[ID Dossier] = @Id_Dossier;

    IF (@ID_Entite IS NULL)
    BEGIN
        SET @Message = 'FILE ID ' + CAST(@Id_Dossier AS nvarchar) + ' NOT EXIST';
        RAISERROR (@Message, 16, 1);
        RETURN;
    END

    /* 2?. HS CODE */
    DECLARE @ID_HSCode int = NULL;

    IF (@HS_Code = '0')
    BEGIN
        SET @ID_HSCode = 0;
        SET @Country_Origin = '';
        SET @Customer_Grouping = '';
        SET @Gross_Weight = 0;
        SET @Net_Weight = 0;
        SET @Volume = 0;
        SET @Regime_Code = '';
    END
    ELSE
    BEGIN
        SELECT @ID_HSCode = [ID HS Code]
        FROM THSCodes
        WHERE [Entite] = @ID_Entite
          AND [HS Code] = @HS_Code;

        IF (@ID_HSCode IS NULL)
        BEGIN
            SET @Message = 'HS CODE ' + @HS_Code + ' NOT EXIST';
            RAISERROR (@Message, 16, 1);
            RETURN;
        END
    END

    /* 3?. DEVISE */
    DECLARE @ID_Devise int = NULL;

    SELECT @ID_Devise = [ID Devise]
    FROM TDevises
    WHERE [Code Devise] = @Currency;

    IF (@ID_Devise IS NULL)
    BEGIN
        SET @Message = 'CURRENCY ' + @Currency + ' NOT EXIST';
        RAISERROR (@Message, 16, 1);
        RETURN;
    END

    /* 4?. PAYS */
    DECLARE @ID_Pays int = NULL;

    IF (@ID_HSCode = 0)
        SET @ID_Pays = 0;
    ELSE
    BEGIN
        SELECT @ID_Pays = [ID Pays]
        FROM TPays
        WHERE [Code Pays] = @Country_Origin;

        IF (@ID_Pays IS NULL)
        BEGIN
            SET @Message = 'COUNTRY CODE ' + @Country_Origin + ' NOT EXIST';
            RAISERROR (@Message, 16, 1);
            RETURN;
        END
    END

    /* 5?. REGIME */
    DECLARE @ID_Regime_Declaration int = NULL;

    IF (@ID_HSCode = 0)
        SET @ID_Regime_Declaration = 0;
    ELSE
    BEGIN
        SELECT @ID_Regime_Declaration = B.[ID Regime Declaration]
        FROM TRegimesClients A
        INNER JOIN TRegimesDeclarations B ON A.[Regime Declaration] = B.[ID Regime Declaration]
        INNER JOIN TRegimesDouaniers C ON B.[Regime Douanier] = C.[ID Regime Douanier]
        WHERE A.[Client] = @ID_Client
          AND C.[Code Regime Douanier] = @Regime_Code
          AND B.[Taux DC] = @Regime_Ratio / 100;

        IF (@ID_Regime_Declaration IS NULL)
        BEGIN
            SET @Message = 'REGIME ' + @Regime_Code + ' (' + FORMAT(@Regime_Ratio / 100, 'P') + ') NOT EXIST';
            RAISERROR (@Message, 16, 1);
            RETURN;
        END
    END

    /* 6?. INSERT / UPDATE */
    DECLARE @ID_Colisage_Dossier int = NULL;

    SELECT @ID_Colisage_Dossier = [ID Colisage Dossier]
    FROM TColisageDossiers
    WHERE [Dossier] = @Id_Dossier
      AND [UploadKey] = @Row_Key;

    IF (@ID_Colisage_Dossier IS NULL)
    BEGIN
        INSERT INTO TColisageDossiers (
            [Dossier],[HS Code],[Description Colis],[No Commande],
            [Nom Fournisseur],[No Facture],[Item No],
            [Devise],[Qte Colis],[Prix Unitaire Colis],
            [Poids Brut],[Poids Net],[Volume],
            [Pays Origine],[Regime Declaration],
            [Regroupement Client],[UploadKey],[Session]
        )
        VALUES (
            @Id_Dossier,@ID_HSCode,@Descr,@Command_No,
            @Supplier_Name,@Invoice_No,@Item_No,
            @ID_Devise,@Qty,@Unit_Prize,
            @Gross_Weight,@Net_Weight,@Volume,
            @ID_Pays,@ID_Regime_Declaration,
            @Customer_Grouping,@Row_Key,@Session
        );
    END
    ELSE
    BEGIN
        UPDATE TColisageDossiers
        SET
            [HS Code] = @ID_HSCode,
            [Description Colis] = @Descr,
            [No Commande] = @Command_No,
            [Nom Fournisseur] = @Supplier_Name,
            [No Facture] = @Invoice_No,
            [Item No] = @Item_No,
            [Devise] = @ID_Devise,
            [Qte Colis] = @Qty,
            [Prix Unitaire Colis] = @Unit_Prize,
            [Poids Brut] = @Gross_Weight,
            [Poids Net] = @Net_Weight,
            [Volume] = @Volume,
            [Pays Origine] = @ID_Pays,
            [Regime Declaration] = @ID_Regime_Declaration,
            [Regroupement Client] = @Customer_Grouping,
            [UploadKey] = @Row_Key,
            [Session] = @Session
        WHERE [ID Colisage Dossier] = @ID_Colisage_Dossier;
    END
END;
GO

-- -- Modification 2 de la procédure pSP_AjouterColisageDossier
USE SFX_PreDouane
GO

CREATE OR ALTER PROCEDURE [dbo].[pSP_AjouterColisageDossier]
    @Id_Dossier int
    ,@Row_Key nvarchar(50)
    ,@HS_Code nvarchar(50)
    ,@Descr nvarchar(1000)
    ,@Command_No nvarchar(50)
    ,@Supplier_Name nvarchar(200)
    ,@Invoice_No nvarchar(50)
    ,@Item_No nvarchar(50) = ''
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
    ,@Session int = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Message nvarchar(max);

    /* ===============================
       1. ENTITÉ + CLIENT
       =============================== */
    DECLARE @ID_Entite int = NULL, @ID_Client int = NULL;

    SELECT 
        @ID_Entite = B.[Entite],
        @ID_Client = A.[Client]
    FROM TDossiers A
    INNER JOIN TBranches B ON A.Branche = B.[ID Branche]
    WHERE A.[ID Dossier] = @Id_Dossier;

    IF (@ID_Entite IS NULL)
    BEGIN
        SET @Message = 'FILE ID' + FORMAT(@Id_Dossier,'N') + ' NOT EXIST';
        RAISERROR (@Message, 16, 1);
        RETURN;
    END

    /* ===============================
       2. HS CODE
       =============================== */
    DECLARE @ID_HSCode int = NULL;

    IF (@HS_Code = '0')
    BEGIN
        SET @ID_HSCode = 0;

        IF (ISNULL(@Country_Origin,'') = '') SET @Country_Origin = '';
        IF (ISNULL(@Customer_Grouping,'') = '') SET @Customer_Grouping = '';
        IF (@Gross_Weight IS NULL) SET @Gross_Weight = 0;
        IF (@Net_Weight IS NULL) SET @Net_Weight = 0;
        IF (@Volume IS NULL) SET @Volume = 0;
        IF (ISNULL(@Regime_Code,'') = '') SET @Regime_Code = '';
    END
    ELSE
    BEGIN
        SELECT @ID_HSCode = [ID HS Code]
        FROM THSCodes
        WHERE [Entite] = @ID_Entite
          AND [HS Code] = @HS_Code;

        IF ((@ID_HSCode IS NULL) AND (ISNULL(@HS_Code,'') <> ''))
        BEGIN
            SET @Message = 'HS CODE ' + @HS_Code + ' NOT EXIST';
            RAISERROR (@Message, 16, 1);
            RETURN;
        END
    END

    /* ===============================
       3. DEVISE
       =============================== */
    DECLARE @ID_Devise int = NULL;

    SELECT @ID_Devise = [ID Devise]
    FROM TDevises
    WHERE [Code Devise] = @Currency;

    IF (@ID_Devise IS NULL)
    BEGIN
        SET @Message = 'CURRENCY ' + @Currency + ' NOT EXIST';
        RAISERROR (@Message, 16, 1);
        RETURN;
    END

    /* ===============================
       4. PAYS D’ORIGINE (LOGIQUE BOSS)
       =============================== */
    DECLARE @ID_Pays int = NULL;

    IF (@ID_HSCode = 0)
    BEGIN
        SET @ID_Pays = 0;
    END
    ELSE
    BEGIN
        IF (ISNULL(@Country_Origin,'') <> '')
            SELECT @ID_Pays = [ID Pays]
            FROM TPays
            WHERE [Code Pays] = @Country_Origin;

        IF (@ID_Pays IS NULL)
        BEGIN
            SET @Message = 'COUNTRY CODE ' + @Country_Origin + ' NOT EXIST';
            RAISERROR (@Message, 16, 1);
            RETURN;
        END
    END

    /* ===============================
       5. REGIME DE DECLARATION
       =============================== */
    DECLARE @ID_Regime_Declaration int = NULL;

    IF (@ID_HSCode = 0)
    BEGIN
        SET @ID_Regime_Declaration = 0;
    END
    ELSE
    BEGIN
        SELECT @ID_Regime_Declaration = B.[ID Regime Declaration]
        FROM TRegimesClients A
        INNER JOIN TRegimesDeclarations B ON A.[Regime Declaration] = B.[ID Regime Declaration]
        INNER JOIN TRegimesDouaniers C ON B.[Regime Douanier] = C.[ID Regime Douanier]
        WHERE A.[Client] = @ID_Client
          AND C.[Code Regime Douanier] = @Regime_Code
          AND B.[Taux DC] = @Regime_Ratio / 100;

        IF (@ID_Regime_Declaration IS NULL)
        BEGIN
            SET @Message = 'REGIME ' + @Regime_Code 
                         + ' (' + FORMAT(@Regime_Ratio / 100, 'P') + ') NOT EXIST';
            RAISERROR (@Message, 16, 1);
            RETURN;
        END
    END

    /* ===============================
       6. INSERT / UPDATE COLISAGE
       =============================== */
    DECLARE @ID_Colisage_Dossier int = NULL;

    IF (@Row_Key <> '')
        SELECT @ID_Colisage_Dossier = [ID Colisage Dossier]
        FROM TColisageDossiers
        WHERE [Dossier] = @Id_Dossier
          AND [UploadKey] = @Row_Key;

    IF (@ID_Colisage_Dossier IS NULL)
    BEGIN
        INSERT INTO TColisageDossiers (
            [Dossier],[HS Code],[Description Colis],[No Commande],
            [Nom Fournisseur],[No Facture],[Item No],
            [Devise],[Qte Colis],[Prix Unitaire Colis],
            [Poids Brut],[Poids Net],[Volume],
            [Pays Origine],[Regime Declaration],
            [Regroupement Client],[UploadKey],[Session]
        )
        VALUES (
            @Id_Dossier,@ID_HSCode,@Descr,@Command_No,
            @Supplier_Name,@Invoice_No,@Item_No,
            @ID_Devise,@Qty,@Unit_Prize,
            @Gross_Weight,@Net_Weight,@Volume,
            @ID_Pays,@ID_Regime_Declaration,
            @Customer_Grouping,@Row_Key,@Session
        );
    END
    ELSE
    BEGIN
        UPDATE TColisageDossiers
        SET
            [HS Code] = @ID_HSCode,
            [Description Colis] = @Descr,
            [No Commande] = @Command_No,
            [Nom Fournisseur] = @Supplier_Name,
            [No Facture] = @Invoice_No,
            [Item No] = @Item_No,
            [Devise] = @ID_Devise,
            [Qte Colis] = @Qty,
            [Prix Unitaire Colis] = @Unit_Prize,
            [Poids Brut] = @Gross_Weight,
            [Poids Net] = @Net_Weight,
            [Volume] = @Volume,
            [Pays Origine] = @ID_Pays,
            [Regime Declaration] = @ID_Regime_Declaration,
            [Regroupement Client] = @Customer_Grouping,
            [UploadKey] = @Row_Key,
            [Session] = @Session
        WHERE [ID Colisage Dossier] = @ID_Colisage_Dossier;
    END
END;
GO


-- Modification de la procédure pSP_CalculeAjustementValeurColisage

CREATE     PROCEDURE [dbo].[pSP_CalculeAjustementValeurColisage]

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

                WHERE ([Dossier]=@Id_Dossier) AND ([HS Code]=0)

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

-- Ajouter les colonnes Nbre Paquetage, Valeur dans TNotesDetail
ALTER TABLE dbo.TNotesDetail
ADD
    [Nbre Paquetage] numeric(24,6) NULL,
    [Valeur] numeric(24,6) NULL;
GO


-- Pour trouver les noms des contraintes par defaut dans la table TNotesDetail
SELECT
    dc.name AS Nom_Contrainte,
    t.name  AS Table_Name,
    c.name  AS Column_Name
FROM sys.default_constraints dc
INNER JOIN sys.tables t
    ON dc.parent_object_id = t.object_id
INNER JOIN sys.columns c
    ON dc.parent_object_id = c.object_id
   AND dc.parent_column_id = c.column_id
WHERE t.name = 'TNotesDetail';


-- Suppression de la contrainte  [DF__TNotesDet__Base __1CBC4616] dépend de colonne 'Qte Colis OT'
ALTER TABLE dbo.TNotesDetail
DROP CONSTRAINT [DF__TNotesDet__Base __1CBC4616];
GO

-- Suppression de la contrainte  [DF__TNotesDet__Base __1DB06A4F] dépend de colonne 'Qte Colis OT'
ALTER TABLE dbo.TNotesDetail
DROP CONSTRAINT [DF__TNotesDet__Base __1DB06A4F];
GO

-- Supprimer les colonnes Nbre Paquetage, Valeur dans TNotesDetail
ALTER TABLE dbo.TNotesDetail
DROP COLUMN
    [Base Qte],
    [Base Prix Unitaire];
GO



-- Modification de la procédure pSP_CreerNoteDetail

CREATE OR ALTER PROCEDURE [dbo].[pSP_CreerNoteDetail]
    @Id_Dossier int,
    @DateDeclaration datetime
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Values nvarchar(max), @Message nvarchar(max);

    DECLARE @TAUX_DEVISES TABLE (
        [ID_Devise] int PRIMARY KEY NOT NULL,
        [Code_Devise] nvarchar(5) NOT NULL,
        [Taux_Change] numeric(24,6),
        [ID_Convertion] int NOT NULL
    );

    DECLARE @ID_Convertion int;

    /* 1?. Dossier en cours */
    IF NOT EXISTS (
        SELECT 1 FROM TDossiers
        WHERE [ID Dossier] = @Id_Dossier
          AND [Statut Dossier] = 0
    )
    BEGIN
        RAISERROR ('FILE IS NOT IN PROGRESS', 16, 1);
        RETURN;
    END

    /* 2?. Taux de change */
    INSERT INTO @TAUX_DEVISES
    SELECT *
    FROM dbo.fx_TauxChangeDossier(@Id_Dossier, @DateDeclaration);

    SELECT TOP 1 @ID_Convertion = ID_Convertion FROM @TAUX_DEVISES;

    IF EXISTS (
        SELECT 1 FROM @TAUX_DEVISES
        WHERE ISNULL(Taux_Change,0) <= 0
    )
    BEGIN
        SET @Values = STUFF((
            SELECT DISTINCT ' ¤ ' + Code_Devise
            FROM @TAUX_DEVISES
            WHERE Taux_Change IS NULL
            FOR XML PATH('')
        ),1,3,'');

        SET @Message = 'MISSING OR WRONG EXCHANGE RATE FOR CURRENCIES {' + @Values + '}';
        RAISERROR (@Message, 16, 1);
        RETURN;
    END

    /* 3?. Infos dossier */
    DECLARE
        @NbrePaquetagePesee int,
        @PoidsBrutPesee numeric(24,6),
        @PoidsNetPesee numeric(24,6),
        @VolumePesee numeric(24,6);

    SELECT
        @NbrePaquetagePesee = [Nbre Paquetage Pesee],
        @PoidsBrutPesee = [Poids Brut Pesee],
        @PoidsNetPesee  = [Poids Net Pesee],
        @VolumePesee    = [Volume Pesee]
    FROM TDossiers
    WHERE [ID Dossier] = @Id_Dossier;

    IF (@NbrePaquetagePesee = 0 OR @PoidsBrutPesee = 0)
    BEGIN
        RAISERROR ('MISSING Gross Weight or Package number on File Header',16,1);
        RETURN;
    END

    /* 4?? Valeur colisage */
    DECLARE @ValeurTotaleColisage numeric(24,6);

    SELECT @ValeurTotaleColisage =
        SUM([Qte Colis]*[Prix Unitaire Colis] + [Ajustement Valeur])
    FROM TColisageDossiers
    WHERE [Dossier] = @Id_Dossier;

    IF ISNULL(@ValeurTotaleColisage,0) = 0
    BEGIN
        RAISERROR ('MISSING PACKING LIST ON FILE',16,1);
        RETURN;
    END

    /* 5?? HS Code & Régime obligatoires */
    IF EXISTS (
        SELECT 1 FROM TColisageDossiers
        WHERE [Dossier] = @Id_Dossier
          AND ([HS Code] IS NULL OR [Regime Declaration] IS NULL)
    )
    BEGIN
        SET @Values = STUFF((
            SELECT DISTINCT ' ¤ ' + [Description Colis]
            FROM TColisageDossiers
            WHERE [Dossier] = @Id_Dossier AND [HS Code] IS NULL
            FOR XML PATH('')
        ),1,3,'');

        SET @Message = 'MISSING HS CODE OR REGIME FOR LINES {' + @Values + '}';
        RAISERROR (@Message, 16, 1);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        EXEC dbo.pSP_CalculeAjustementValeurColisage @Id_Dossier;

        INSERT INTO dbo.[TNotesDetail]
        ([Colisage Dossier],[Regime],[Valeur],
         [Nbre Paquetage],[Base Poids Brut],[Base Poids Net],[Base Volume])
        SELECT
            A.[ID Colisage Dossier],
            CASE
                WHEN B.[Taux DC]=0 THEN ''
                WHEN B.[Taux DC]=1 THEN 'DC'
                WHEN B.[Taux DC] BETWEEN 0 AND 1 THEN 'DC'
            END,
            (A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])
                * CASE WHEN B.[Taux DC] BETWEEN 0 AND 1 THEN B.[Taux DC] ELSE 1 END,
            @NbrePaquetagePesee * (A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur]) / @ValeurTotaleColisage,
            @PoidsBrutPesee * (A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur]) / @ValeurTotaleColisage,
            @PoidsNetPesee  * (A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur]) / @ValeurTotaleColisage,
            @VolumePesee    * (A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur]) / @ValeurTotaleColisage
        FROM TColisageDossiers A
        INNER JOIN TRegimesDeclarations B ON A.[Regime Declaration]=B.[ID Regime Declaration]
        WHERE A.[Dossier]=@Id_Dossier AND A.[HS Code]<>0;

        UPDATE TDossiers SET [Statut Dossier] = -1 WHERE [ID Dossier] = @Id_Dossier;

        INSERT INTO TEtapesDossiers ([Dossier],[Etape Dossier],[Date Debut],[Date Fin])
        VALUES (@Id_Dossier,1,GETDATE(),GETDATE());

        EXEC dbo.pSP_RecalculeDerniereEtapeDossier @Id_Dossier;

        UPDATE TDossiers SET [Convertion]=@ID_Convertion WHERE [ID Dossier]=@Id_Dossier;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

        SET @Message = ERROR_MESSAGE();
        RAISERROR (@Message, 16, 1);
    END CATCH

END;
GO

-- Modification de la vue VNotesDetail

CREATE OR ALTER VIEW [dbo].[VNotesDetail]
AS
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

    SUM(A.[Nbre Paquetage])     AS [Nbre_Paquetage],
    SUM(A.[Valeur])             AS [Valeur],
    SUM(A.[Base Poids Brut])    AS [Base_Poids_Brut],
    SUM(A.[Base Poids Net])     AS [Base_Poids_Net],
    SUM(A.[Base Volume])        AS [Base_Volume]

FROM dbo.TNotesDetail A
INNER JOIN dbo.VColisageDossiers B
    ON A.[Colisage Dossier] = B.ID_Colisage_Dossier

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
GO


-- Modification de la procédure pSP_SupprimerNoteDetail

CREATE OR ALTER PROCEDURE [dbo].[pSP_SupprimerNoteDetail]
    @Id_Dossier int = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Message nvarchar(max);

    -- Vérifier que le dossier est bien clôturé
    IF NOT EXISTS (
        SELECT 1
        FROM TDossiers
        WHERE [ID Dossier] = @Id_Dossier
          AND [Statut Dossier] = -1
    )
    BEGIN
        SET @Message = 'FILE WAS NOT COMPLETED';
        RAISERROR (@Message, 16, 1) WITH LOG;
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

            -- 1?. Réinitialiser les ajustements de valeur
            UPDATE TColisageDossiers
            SET [Ajustement Valeur] = 0
            WHERE [Dossier] = @Id_Dossier;

            -- 2?. Supprimer les notes de détail
            DELETE A
            FROM dbo.TNotesDetail A
            INNER JOIN dbo.TColisageDossiers B
                ON A.[Colisage Dossier] = B.[ID Colisage Dossier]
            WHERE B.[Dossier] = @Id_Dossier;

            -- 3?. Supprimer l’étape "Opérations complétées"
            DELETE dbo.TEtapesDossiers
            WHERE [Dossier] = @Id_Dossier
              AND [Etape Dossier] = 1;

            -- 4?. Recalculer la dernière étape
            EXEC dbo.pSP_RecalculeDerniereEtapeDossier @Id_Dossier;

            -- 5?. Réinitialiser le dossier
            UPDATE dbo.TDossiers
            SET [Convertion] = NULL,
                [Statut Dossier] = 0
            WHERE [ID Dossier] = @Id_Dossier;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;

        SET @Message = ERROR_MESSAGE();
        RAISERROR (@Message, 16, 1) WITH LOG;
        RETURN;
    END CATCH;
END;
GO
