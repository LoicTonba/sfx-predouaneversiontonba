USE [SFX_PreDouane]

GO

/****** Object:  Table [dbo].[TUtilisateurs]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TUtilisateurs](

                [ID Utilisateur] [int] IDENTITY(1,1) NOT NULL,

                [Code Utilisateur] [nvarchar](10) NOT NULL,

                [Nom Utilisateur] [nvarchar](200) NOT NULL,

                [Entite] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TUtilisateurs$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Utilisateur] ASC

),

CONSTRAINT [UQ_TUtilisateurs$Code Utilisateur] UNIQUE NONCLUSTERED

(

                [Code Utilisateur] ASC

),

CONSTRAINT [UQ_TUtilisateurs$Nom Utilisateur] UNIQUE NONCLUSTERED

(

                [Nom Utilisateur] ASC

)

) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[TSessions]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TSessions](

                [ID Session] [int] IDENTITY(1,1) NOT NULL,

                [Utilisateur] [int] NOT NULL,

                [Debut Session] [datetime2](7) NOT NULL,

                [Fin Session] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TSessions$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Session] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VSessions]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VSessions]

AS

                SELECT A.[ID Session] AS [ID_Session]

                ,B.[ID Utilisateur] AS [ID_Utilisateur]

                ,B.[Nom Utilisateur] AS [Nom_Utilisateur]

                ,A.[Debut Session] AS [Debut_Session]

                ,A.[Fin Session] AS [Fin_Session]

                FROM dbo.TSessions A INNER JOIN dbo.TUtilisateurs B ON A.[Utilisateur]=B.[ID Utilisateur]

 

GO

/****** Object:  View [dbo].[VUtilisateurs]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VUtilisateurs]

AS

                SELECT A.[ID Utilisateur] AS [ID_Utilisateur]

                ,A.[Nom Utilisateur] AS [Nom_Utilisateur]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM dbo.TUtilisateurs A LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

                WHERE [ID Utilisateur]>0

GO

/****** Object:  Table [dbo].[TClients]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TClients](

                [ID Client] [int] IDENTITY(1,1) NOT NULL,

                [Nom Client] [nvarchar](200) NOT NULL,

                [Entite] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TClients$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Client] ASC

),

CONSTRAINT [UQ_TClients$Nom Client] UNIQUE NONCLUSTERED

(

                [Nom Client] ASC,

                [Entite] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VClients]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VClients]

AS

                SELECT A.[ID Client] AS [ID_Client]

                ,A.[Nom Client] AS [Nom_Client]

                ,A.[Entite] AS [ID_Entite]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM dbo.TClients A LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  Table [dbo].[TCodesEtapes]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TCodesEtapes](

                [ID Code Etape] [int] IDENTITY(1,1) NOT NULL,

                [Libelle Etape] [nvarchar](200) NOT NULL,

                [Suivi Duree] [bit] NOT NULL,

                [Delai Etape] [int] NOT NULL,

                [Circuit Etape] [nvarchar](200) NOT NULL,

                [Index Etape] [int] NOT NULL,

                [Entite] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TCodesEtapes$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Code Etape] ASC

),

CONSTRAINT [UQ_TCodesEtapes$Index Etape] UNIQUE NONCLUSTERED

(

                [Index Etape] ASC

),

CONSTRAINT [UQ_TCodesEtapes$Libelle Etape] UNIQUE NONCLUSTERED

(

                [Libelle Etape] ASC,

                [Entite] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VCodesEtapes]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VCodesEtapes]

AS

                SELECT A.[ID Code Etape] AS [ID_Code_Etape]

                ,A.[Libelle Etape] AS [Libelle_Etape]

                ,A.[Suivi Duree] AS [Suivi_Duree]

                ,A.[Circuit Etape] AS [Circuit_Etape]

                ,A.[Index Etape] AS [Index_Etape]

                ,A.[Entite] AS [ID_Entite]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM [dbo].TCodesEtapes A LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

                WHERE A.[ID Code Etape] NOT IN (0,1000000)

GO

/****** Object:  Table [dbo].[TConvertions]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TConvertions](

                [ID Convertion] [int] IDENTITY(1,1) NOT NULL,

                [Date Convertion] [datetime2](7) NOT NULL,

                [Entite] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TConvertions$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Convertion] ASC

),

CONSTRAINT [UQ_TConvertions$Date Convertion] UNIQUE NONCLUSTERED

(

                [Date Convertion] ASC,

                [Entite] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VConvertions]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VConvertions]

AS

                SELECT A.[ID Convertion] AS [ID_Convertion]

                  ,A.[Date Convertion] AS [Date_Convertion]

                  ,A.[Date Creation] AS [Date_Creation]

                  ,A.[Entite] AS [ID_Entite]

                  ,Z.Nom_Utilisateur AS [Nom_Creation]

FROM [dbo].TConvertions A LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  Table [dbo].[TGroupesEntites]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TGroupesEntites](

                [ID Groupe Entite] [int] IDENTITY(1,1) NOT NULL,

                [Nom Groupe Entite] [nvarchar](200) NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TGroupesEntites$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Groupe Entite] ASC

),

CONSTRAINT [UQ_TGroupesEntites$Nom Groupe Entite] UNIQUE NONCLUSTERED

(

                [Nom Groupe Entite] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VGroupesEntites]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VGroupesEntites]

AS

                SELECT A.[ID Groupe Entite] AS [ID_Groupe_Entite]

                  ,A.[Nom Groupe Entite] AS [Nom_Groupe_Entite]

                  ,A.[Date Creation] AS [Date_Creation]

                  ,Z.Nom_Utilisateur AS [Nom_Creation]

FROM [dbo].TGroupesEntites A LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  Table [dbo].[TDevises]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TDevises](

                [ID Devise] [int] IDENTITY(1,1) NOT NULL,

                [Code Devise] [nvarchar](5) NOT NULL,

                [Libelle Devise] [nvarchar](200) NOT NULL,

                [Decimales] [int] NOT NULL,

                [Devise Inactive] [bit] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TDevises$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Devise] ASC

),

CONSTRAINT [UQ_TDevises$Code Devise] UNIQUE NONCLUSTERED

(

                [Code Devise] ASC

),

CONSTRAINT [UQ_TDevises$Libelle Devise] UNIQUE NONCLUSTERED

(

                [Libelle Devise] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VDevises]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VDevises]

AS

                SELECT A.[ID Devise] AS [ID_Devise]

                  ,A.[Code Devise] AS [Code_Devise]

                  ,A.[Libelle Devise] AS [Libelle_Devise]

                  ,A.[Decimales] AS [Decimales]

                  ,A.[Date Creation] AS [Date_Creation]

                  ,Z.Nom_Utilisateur AS [Nom_Creation]

FROM [dbo].TDevises A LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

WHERE [Devise Inactive]=0

GO

/****** Object:  Table [dbo].[THSCodes]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[THSCodes](

                [ID HS Code] [int] IDENTITY(1,1) NOT NULL,

                [HS Code] [nvarchar](50) NOT NULL,

                [Libelle HS Code] [nvarchar](200) NOT NULL,

                [Entite] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [THSCodes$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID HS Code] ASC

),

CONSTRAINT [UQ_THSCodes$HS Code] UNIQUE NONCLUSTERED

(

                [HS Code] ASC,

                [Entite] ASC

)

) ON [PRIMARY]

GO

/****** Object:  UserDefinedFunction [dbo].[fx_IDs_HSCode]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

 

CREATE FUNCTION [dbo].[fx_IDs_HSCode](@TextJoin nvarchar(max), @Delimiter nvarchar(1)='|')

RETURNS TABLE

AS

RETURN

(

 

                WITH DISTINCT_LIST ([Value]) AS

                (

                               SELECT DISTINCT [value] FROM string_split(@TextJoin,@Delimiter)

                )

 

                SELECT B.[ID HS Code] AS [ID], B.[HS Code]AS [Name]

                FROM DISTINCT_LIST A LEFT JOIN dbo.THSCodes B ON A.[Value]=B.[HS Code]

)

GO

/****** Object:  UserDefinedFunction [dbo].[fx_IDs_Devises]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE FUNCTION [dbo].[fx_IDs_Devises](@TextJoin nvarchar(max), @Delimiter nvarchar(1)='|')

RETURNS TABLE

AS

RETURN

(

 

                WITH DISTINCT_LIST ([Value]) AS

                (

                               SELECT DISTINCT [value] FROM string_split(@TextJoin,@Delimiter)

                )

 

                SELECT B.[ID Devise] AS [ID], B.[Code Devise] AS [Name]

                FROM DISTINCT_LIST A LEFT JOIN dbo.TDevises B ON A.[Value]=B.[Code Devise]

)

GO

/****** Object:  Table [dbo].[TPays]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TPays](

                [ID Pays] [int] IDENTITY(1,1) NOT NULL,

                [Code Pays] [nvarchar](5) NOT NULL,

                [Libelle Pays] [nvarchar](200) NOT NULL,

                [Devise Locale] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TPays$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Pays] ASC

),

CONSTRAINT [UQ_TPays$Code Pays] UNIQUE NONCLUSTERED

(

                [Code Pays] ASC

),

CONSTRAINT [UQ_TPays$Libelle Pays] UNIQUE NONCLUSTERED

(

                [Libelle Pays] ASC

)

) ON [PRIMARY]

GO

/****** Object:  UserDefinedFunction [dbo].[fx_IDs_Pays]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE FUNCTION [dbo].[fx_IDs_Pays](@TextJoin nvarchar(max), @Delimiter nvarchar(1)='|')

RETURNS TABLE

AS

RETURN

(

 

                WITH DISTINCT_LIST ([Value]) AS

                (

                               SELECT DISTINCT [value] FROM string_split(@TextJoin,@Delimiter)

                )

 

                SELECT B.[ID Pays] AS [ID], B.[Code Pays] AS [Name]

                FROM DISTINCT_LIST A LEFT JOIN dbo.TPays B ON A.[Value]=B.[Code Pays]

)

GO

/****** Object:  Table [dbo].[TRegimesDeclarations]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TRegimesDeclarations](

                [ID Regime Declaration] [int] IDENTITY(1,1) NOT NULL,

                [Regime Douanier] [int] NOT NULL,

                [Libelle Regime Declaration] [nvarchar](200) NOT NULL,

                [Taux Regime] [numeric](24, 3) NOT NULL,

                [Entite] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TRegimesDeclarations$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Regime Declaration] ASC

),

CONSTRAINT [UQ_TRegimesDeclarations$Libelle Regime Declaration] UNIQUE NONCLUSTERED

(

                [Libelle Regime Declaration] ASC

),

CONSTRAINT [UQ_TRegimesDeclarations$Taux DC] UNIQUE NONCLUSTERED

(

                [Taux Regime] ASC,

                [Regime Douanier] ASC

),

CONSTRAINT [UQ_TRegimesDeclarations$Taux Regime] UNIQUE NONCLUSTERED

(

                [Taux Regime] ASC,

                [Regime Douanier] ASC

)

) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[TRegimesClients]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TRegimesClients](

                [ID Regime Client] [int] IDENTITY(1,1) NOT NULL,

                [Client] [int] NOT NULL,

                [Regime Declaration] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TRegimesClients$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Regime Client] ASC

)

) ON [PRIMARY]

GO

/****** Object:  UserDefinedFunction [dbo].[fx_IDs_RegimesDeclarations]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE FUNCTION [dbo].[fx_IDs_RegimesDeclarations]( @ID_Client int, @TextJoin nvarchar(max), @Delimiter nvarchar(1)='|', @ID_RegimeDouanier int =0)

RETURNS TABLE

AS

RETURN

(

 

                WITH DISTINCT_LIST ([Value]) AS

                (

                               SELECT DISTINCT CAST([value] as numeric (24,6))  FROM string_split(@TextJoin,@Delimiter)

                ),

                LIST_WITH_ID ([ID],[Taux Regime]) AS

                (

                               SELECT B.[ID Regime Declaration], B.[Taux Regime]

                               FROM DISTINCT_LIST A

                                               INNER JOIN dbo.TRegimesDeclarations B ON A.[Value]=B.[Taux Regime]

                                               INNER JOIN dbo.TRegimesClients C ON B.[ID Regime Declaration]=C.[Regime Declaration]

                               WHERE (C.[Client]=@ID_Client) AND (B.[Regime Douanier]= @ID_RegimeDouanier)

 

                )

 

                SELECT A.[Value] AS [ID], B.[Taux Regime] AS [Taux Regime]

                FROM DISTINCT_LIST A LEFT JOIN LIST_WITH_ID B ON A.[Value]=B.[Taux Regime]

)

GO

/****** Object:  Table [dbo].[TModesTransport]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TModesTransport](

                [ID Mode Transport] [nvarchar](1) NOT NULL,

                [Libelle Mode Transport] [nvarchar](200) NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TMoyensTransport$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Mode Transport] ASC

),

CONSTRAINT [UQ_TModesTransport$Libelle Mode Transport] UNIQUE NONCLUSTERED

(

                [Libelle Mode Transport] ASC

)

) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[TTypesDossiers]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TTypesDossiers](

                [ID Type Dossier] [int] IDENTITY(1,1) NOT NULL,

                [Libelle Type Dossier] [nvarchar](200) NOT NULL,

                [Sens Trafic] [nvarchar](1) NOT NULL,

                [Mode Transport] [nvarchar](1) NOT NULL,

                [Entite] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TTypesDossiers$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Type Dossier] ASC

),

CONSTRAINT [UQ_TTypes_Dossiers$Libelle Type Dossier] UNIQUE NONCLUSTERED

(

                [Libelle Type Dossier] ASC

)

) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[TSensTrafic]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TSensTrafic](

                [ID Sens Trafic] [nvarchar](1) NOT NULL,

                [Libelle Sens Trafic] [nvarchar](200) NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TSensTrafic$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Sens Trafic] ASC

),

CONSTRAINT [UQ_TSensTrafic$Libelle Sens Trafic] UNIQUE NONCLUSTERED

(

                [Libelle Sens Trafic] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VTypesDossiers]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VTypesDossiers]

AS

SELECT A.[ID Type Dossier] AS [ID_Type_Dossier]

                  ,A.[Libelle Type Dossier] AS [Libelle_Type_Dossier]

                  ,B.[ID Sens Trafic] AS [ID_Sens_Trafic]

                  ,B.[Libelle Sens Trafic] AS [Libelle_Sens_Trafic]

                  ,C.[ID Mode Transport] AS [ID_Mode_Transport]

                  ,C.[Libelle Mode Transport] AS [Libelle_Mode_Transport]

                  ,A.[Entite] AS [ID_Entite]

                  ,A.[Date Creation] AS [Date_Creation]

                  ,Z.Nom_Utilisateur AS [Nom_Creation]

  FROM dbo.TTypesDossiers A

                INNER JOIN dbo.TSensTrafic B ON A.[Sens Trafic]=B.[ID Sens Trafic]

                INNER JOIN dbo.TModesTransport C On A.[Mode Transport]=C.[ID Mode Transport]

                LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

 

GO

/****** Object:  Table [dbo].[TEntites]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TEntites](

                [ID Entite] [int] IDENTITY(1,1) NOT NULL,

                [Code Entite] [nvarchar](10) NOT NULL,

                [Nom Entite] [nvarchar](200) NOT NULL,

                [Groupe Entite] [int] NOT NULL,

                [Pays] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TEntites$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Entite] ASC

),

CONSTRAINT [UQ_TEntites$Nom Entite] UNIQUE NONCLUSTERED

(

                [Nom Entite] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VEntites]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VEntites]

AS

                SELECT A.[ID Entite] AS [ID_Entite]

                               ,A.[Nom Entite] AS [Nom_Entite]

                               ,B.[ID Groupe Entite] AS [ID_Groupe_Entite]

                  ,B.[Nom Groupe Entite] AS [Nom_Groupe_Entite]

                  ,C.[ID Pays] AS [ID_Pays]

                  ,C.[Libelle Pays] AS [Libelle_Pays]

                  ,D.[Code Devise] AS [Devise_Locale]

                  ,A.[Date Creation] AS [Date_Creation]

                  ,Z.Nom_Utilisateur AS [Nom_Creation]

FROM [dbo].TEntites A

                INNER JOIN dbo.TGroupesEntites B On A.[Groupe Entite]=B.[ID Groupe Entite]

                INNER JOIN dbo.TPays C ON A.[Pays]=C.[ID Pays]

                INNER JOIN dbo.TDevises D ON C.[Devise Locale]=D.[ID Devise]

                LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  Table [dbo].[TBranches]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TBranches](

                [ID Branche] [int] IDENTITY(1,1) NOT NULL,

                [Code Branche] [nvarchar](20) NOT NULL,

                [Nom Branche] [nvarchar](200) NOT NULL,

                [Entite] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TBranches$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Branche] ASC

),

CONSTRAINT [UQ__TBranche__0EF7E91810AAA27A] UNIQUE NONCLUSTERED

(

                [Code Branche] ASC

),

CONSTRAINT [UQ_TBranches$Nom Branche] UNIQUE NONCLUSTERED

(

                [Nom Branche] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VBranches]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VBranches]

AS

                SELECT A.[ID Branche] AS [ID_Branche]

                ,A.[Code Branche] AS [Code_Branche]

                ,A.[Nom Branche] AS [Nom_Branche]

                ,B.[ID_Entite]

                ,B.[Nom_Entite]

                ,B.[ID_Groupe_Entite]

                ,B.[ID_Pays]

                ,B.[Libelle_Pays]

                ,B.[Devise_Locale]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM dbo.TBranches A

                               INNER JOIN dbo.VEntites B ON A.[Entite]=B.[ID_Entite]

                               LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  Table [dbo].[TEtapesDossiers]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TEtapesDossiers](

                [ID Etape Dossier] [int] IDENTITY(1,1) NOT NULL,

                [Dossier] [int] NOT NULL,

                [Etape Dossier] [int] NOT NULL,

                [Date Debut] [datetime2](7) NOT NULL,

                [Date Fin] [datetime2](7) NULL,

                [Reference] [nvarchar](200) NULL,

                [Qte] [numeric](24, 6) NOT NULL,

                [Obs] [nvarchar](1000) NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TEtapesDossiers$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Etape Dossier] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VEtapesDossiers]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE   VIEW [dbo].[VEtapesDossiers]

AS

                SELECT A.[ID Etape Dossier] AS [ID_Etape_Dossier]

                ,A.Dossier AS [ID_Dossier]

                ,B.[ID Code Etape] AS [ID_Etape]

                  ,B.[Libelle Etape] AS [Libelle_Etape]

                  ,B.[Circuit Etape] AS [Circuit_Etape]

                  ,B.[Index Etape] AS [Index_Etape]

                  ,A.[Date Debut] AS [Date_Debut_Etape]

                  ,A.[Date Fin] AS [Date_Fin_Etape]

                  ,A.[Reference] AS [Reference_Etape]

                  ,A.[Qte]  AS [Qte_Etape]

                  ,A.[Obs]  AS [Obs_Etape]

                  ,IIF(B.[Suivi Duree]=1, DATEDIFF (DAY, A.[Date Debut],A.[Date Fin])-B.[Delai Etape],0) AS [Retard_Etape]

                  ,A.[Date Creation] AS [Date_Creation]

                  ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM dbo.TEtapesDossiers A

                               INNER JOIN dbo.TCodesEtapes B On A.[Etape Dossier]=B.[ID Code Etape]

                               LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  Table [dbo].[TStatutsDossier]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TStatutsDossier](

                [ID Statut Dossier] [int] NOT NULL,

                [Libelle Statut Dossier] [nvarchar](200) NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TStatutsDossier$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Statut Dossier] ASC

),

CONSTRAINT [UQ_TStatutsDossier$Libelle Statut Dossier] UNIQUE NONCLUSTERED

(

                [Libelle Statut Dossier] ASC

)

) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[TDossiers]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TDossiers](

                [ID Dossier] [int] IDENTITY(1,1) NOT NULL,

                [Branche] [int] NOT NULL,

                [Type Dossier] [int] NOT NULL,

                [Client] [int] NOT NULL,

                [Description Dossier] [nvarchar](1000) NOT NULL,

                [No OT] [nvarchar](100) NOT NULL,

                [No Dossier] [nvarchar](50) NOT NULL,

                [Nbre Paquetage Pesee] [int] NOT NULL,

                [Poids Brut Pesee] [numeric](24, 2) NOT NULL,

                [Poids Net Pesee] [numeric](24, 2) NOT NULL,

                [Volume Pesee] [numeric](24, 2) NOT NULL,

                [Responsable Dossier] [int] NOT NULL,

                [Convertion] [int] NULL,

                [Derniere Etape Dossier] [int] NULL,

                [Observation Dossier] [nvarchar](1000) NULL,

                [Statut Dossier] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TDossiers$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Dossier] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VDossiers]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE   VIEW [dbo].[VDossiers]

AS

SELECT A.[ID Dossier] AS [ID_Dossier]

                ,I.[ID_Branche]

                ,I.[Nom_Branche]

                ,I.[ID_Entite]

                ,I.[Nom_Entite]

                ,I.[ID_Groupe_Entite]

                ,I.[ID_Pays]

                ,I.[Libelle_Pays]

                ,I.[Devise_Locale]

      ,C.[ID_Type_Dossier]

                  ,C.[Libelle_Type_Dossier]

                  ,C.[ID_Sens_Trafic]

                  ,C.[Libelle_Sens_Trafic]

                  ,C.[ID_Mode_Transport]

                  ,C.[Libelle_Mode_Transport]

     ,B.[ID Client] AS [ID_Client]

                  ,B.[Nom Client] AS [Nom_Client]

      ,A.[Description Dossier] AS [Description_Dossier]

      ,A.[No OT] AS [No_OT]

      ,A.[No Dossier] AS [No_Dossier]

      ,A.[Nbre Paquetage Pesee] AS [Nbre_Paquetage_Pesee]

      ,A.[Poids Brut Pesee] AS [Poids_Brut_Pesee]

      ,A.[Poids Net Pesee] AS [Poids_Net_Pesee]

      ,A.[Volume Pesee] AS [Volume_Pesee]

      ,G.[ID Utilisateur] AS [Responsable_ID]

                  ,G.[Nom Utilisateur] AS [Nom_Responsable]

      ,P.[Date Convertion] AS [Date_Declaration]

      ,N.[ID_Etape_Dossier]  AS [ID_Etape_Actuelle]

                  ,N.[Libelle_Etape] AS [Libelle_Etape_Actuelle]

                  ,N.[Circuit_Etape] AS [Circuit_Etape_Actuelle]

                  ,N.[Index_Etape] AS [Index_Etape_Actuelle]

                  ,N.[Date_Debut_Etape] AS [Date_Debut_Etape_Actuelle]

                  ,N.[Date_Fin_Etape] AS [Date_Fin_Etape_Actuelle]

                  ,N.[Reference_Etape] AS [Reference_Etape_Actuelle]

                  ,N.[Qte_Etape]  AS [Qte_Etape_Actuelle]

                  ,N.[Obs_Etape]  AS [Obs_Etape_Actuelle]

                  ,N.Retard_Etape  AS [Retard_Etape_Actuelle]

                  ,X.[Date Debut] AS [Date_Ouverture_Dossier]

                  ,Y.[Date Debut] AS [Date_Cloture_Dossier]

      ,H.[ID Statut Dossier] AS [ID_Statut_Dossier]

                  ,H.[Libelle Statut Dossier] AS [Libelle_Statut_Dossier]

                  ,A.[Date Creation] AS [Date_Creation]

                  ,Z.Nom_Utilisateur AS [Nom_Creation]

  FROM [dbo].[TDossiers] A

                INNER JOIN dbo.TClients B On A.[Client]=B.[ID Client]

                INNER JOIN dbo.VTypesDossiers C ON A.[Type Dossier]=C.[ID_Type_Dossier]

                INNER JOIN dbo.TStatutsDossier F On A.[Statut Dossier]=F.[ID Statut Dossier]

                INNER JOIN dbo.TUtilisateurs G ON A.[Responsable Dossier]=G.[ID Utilisateur]

                INNER JOIN dbo.TStatutsDossier H ON A.[Statut Dossier]=H.[ID Statut Dossier]

                INNER JOIN dbo.VBranches I On A.[Branche]=I.[ID_Branche]

                LEFT JOIN dbo.[VEtapesDossiers] N ON A.[Derniere Etape Dossier]=N.[ID_Etape_Dossier]

                LEFT JOIN dbo.TConvertions P ON A.Convertion=P.[ID Convertion]

                LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

                LEFT JOIN (SELECT [Dossier], [Date Debut] FROM dbo.TEtapesDossiers WHERE [Etape Dossier]=0) X ON A.[ID Dossier]=X.Dossier

                LEFT JOIN (SELECT [Dossier], [Date Debut] FROM dbo.TEtapesDossiers WHERE [Etape Dossier]=1000000) Y ON A.[ID Dossier]=Y.Dossier

GO

/****** Object:  Table [dbo].[TRoles]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TRoles](

                [ID Role] [int] IDENTITY(1,1) NOT NULL,

                [Libelle Role] [nvarchar](200) NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TRoles$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Role] ASC

),

CONSTRAINT [UQ_TRoles$Libelle Role] UNIQUE NONCLUSTERED

(

                [Libelle Role] ASC

)

) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[TPermissonsRoles]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TPermissonsRoles](

                [ID Permission Role] [int] IDENTITY(1,1) NOT NULL,

                [Role] [int] NOT NULL,

                [Permission] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TPermissonsRoles$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Permission Role] ASC

)

) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[TPermissionsBase]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TPermissionsBase](

                [ID Permission Base] [int] NOT NULL,

                [Libelle Permission] [nvarchar](200) NOT NULL,

                [Permission Active] [bit] NOT NULL,

                [Date Activation] [datetime2](7) NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TPermissionsBase$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Permission Base] ASC

),

CONSTRAINT [UQ_TPermissionsBase$Libelle Permission] UNIQUE NONCLUSTERED

(

                [Libelle Permission] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VPermissonsRoles]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VPermissonsRoles]

AS

                SELECT A.[ID Permission Role] AS [ID_Permission_Role]

                               ,B.[ID Role] AS [ID_Role]

                               ,B.[Libelle Role] AS [Libelle_Role]

                               ,C.[ID Permission Base] AS [ID_Permission]

                               ,C.[Libelle Permission] AS [Libelle_Permission]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM [dbo].[TPermissonsRoles] A

                               INNER JOIN [dbo].[TRoles] B ON A.[Role]=B.[ID Role]

                               INNER JOIN [dbo].[TPermissionsBase] C ON A.[Permission]=C.[ID Permission Base]

                               LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

                WHERE C.[Permission Active]=1

GO

/****** Object:  View [dbo].[VHSCodes]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VHSCodes]

AS

                SELECT A.[ID HS Code] AS [ID_HS_Code]

                ,A.[HS Code] AS [HS_Code]

                ,A.[Libelle HS Code] AS [Libelle_HS_Code]

                ,A.[Entite] AS [ID_Entite]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM dbo.THSCodes A LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  Table [dbo].[TColisageDossiers]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TColisageDossiers](

                [ID Colisage Dossier] [int] IDENTITY(1,1) NOT NULL,

                [Dossier] [int] NOT NULL,

                [HS Code] [int] NULL,

                [Description Colis] [nvarchar](1000) NOT NULL,

                [No Commande] [nvarchar](50) NOT NULL,

                [Nom Fournisseur] [nvarchar](200) NOT NULL,

                [No Facture] [nvarchar](50) NOT NULL,

                [Item No] [nvarchar](50) NOT NULL,

                [Devise] [int] NOT NULL,

                [Qte Colis] [numeric](24, 6) NOT NULL,

                [Prix Unitaire Colis] [numeric](24, 6) NOT NULL,

                [Poids Brut] [numeric](24, 6) NOT NULL,

                [Poids Net] [numeric](24, 6) NOT NULL,

                [Volume] [numeric](24, 6) NOT NULL,

                [Ajustement Valeur] [numeric](24, 6) NOT NULL,

                [Pays Origine] [int] NOT NULL,

                [Regime Declaration] [int] NULL,

                [Regroupement Client] [nvarchar](200) NOT NULL,

                [UploadKey] [nvarchar](50) NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TColisageDossiers$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Colisage Dossier] ASC

)

) ON [PRIMARY]

GO

/****** Object:  UserDefinedFunction [dbo].[fx_CleColisageDossier]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE FUNCTION [dbo].[fx_CleColisageDossier](@Id_Dossier INT)

RETURNS TABLE

AS

RETURN

(

                SELECT [UploadKey] AS [Row_Key]

                FROM dbo.TColisageDossiers

                WHERE ([Dossier]=@Id_Dossier) AND (ISNULL([UploadKey],'')<>'')

)

GO

/****** Object:  Table [dbo].[TRolesUtilisateurs]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TRolesUtilisateurs](

                [ID Role Utilisateur] [int] IDENTITY(1,1) NOT NULL,

                [Role] [int] NOT NULL,

                [Utilisateur] [int] NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TRolesUtilisateurs$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Role Utilisateur] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VRolesUtilisateurs]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VRolesUtilisateurs]

AS

                SELECT A.[ID Role Utilisateur] AS [ID_Role_Utilisateur]

                               ,B.[ID Role] AS [ID_Role]

                               ,B.[Libelle Role] AS [Libelle_Role]

                               ,C.[ID Utilisateur] AS [ID_Utilisateur]

                               ,C.[Nom Utilisateur] AS [Nom_Utilisateur]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM [dbo].[TRolesUtilisateurs] A

                               INNER JOIN [dbo].[TRoles] B ON A.[Role]=B.[ID Role]

                               INNER JOIN [dbo].[TUtilisateurs] C ON A.[Utilisateur]=C.[ID Utilisateur]

                               LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  View [dbo].[VModesTransport]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE   VIEW [dbo].[VModesTransport]

AS

                SELECT A.[ID Mode Transport] AS [ID_Mode_Transport]

                ,A.[Libelle Mode Transport] AS [Libelle_Mode_Transport]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM dbo.TModesTransport A LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  View [dbo].[VPays]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VPays]

AS

                SELECT A.[ID Pays] AS [ID_Pays]

                ,A.[Code Pays] AS [Code_Pays]

                ,A.[Libelle Pays] AS [Libelle_Pays]

                ,B.[Code Devise] AS [Devise_Locale]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM dbo.TPays A

                               INNER JOIN dbo.TDevises B ON A.[Devise Locale]=B.[ID Devise]

                               LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  Table [dbo].[TRegimesDouaniers]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TRegimesDouaniers](

                [ID Regime Douanier] [int] IDENTITY(1,1) NOT NULL,

                [Code Regime Douanier] [nvarchar](10) NOT NULL,

                [Libelle Regime Douanier] [nvarchar](200) NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TRegimesDouaniers$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Regime Douanier] ASC

),

CONSTRAINT [UQ_TRegimesDouaniers$Code Regime Douanier] UNIQUE NONCLUSTERED

(

                [Code Regime Douanier] ASC

),

CONSTRAINT [UQ_TRegimesDouaniers$Libelle Regime Douanier] UNIQUE NONCLUSTERED

(

                [Libelle Regime Douanier] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VRegimesDouaniers]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE   VIEW [dbo].[VRegimesDouaniers]

AS

                SELECT A.[ID Regime Douanier] AS [ID_Regime_Douanier]

                ,A.[Libelle Regime Douanier] AS [Libelle_Regime_Douanier]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM dbo.TRegimesDouaniers A LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  View [dbo].[VSensTrafic]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE   VIEW [dbo].[VSensTrafic]

AS

                SELECT A.[ID Sens Trafic] AS [ID_Sens_Trafic]

                ,A.[Libelle Sens Trafic] AS [Libelle_Sens_Trafic]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM dbo.TSensTrafic A LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  View [dbo].[VRoles]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VRoles]

AS

                SELECT A.[ID Role] AS [ID_Role]

                               ,A.[Libelle Role] AS [Libelle_Role]

                               ,A.[Date Creation] AS [Date_Creation]

                  ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM [dbo].[TRoles] A LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  View [dbo].[VStatutsDossier]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VStatutsDossier]

AS

                SELECT [ID Statut Dossier] AS [ID_Statut_Dossier]

                ,[Libelle Statut Dossier] AS [Libelle_Statut_Dossier]

                FROM [dbo].[TStatutsDossier]

GO

/****** Object:  View [dbo].[VRegimesDeclarations]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VRegimesDeclarations]

AS

                SELECT A.[ID Regime Declaration] AS [ID_Regime_Declaration]

                ,B.[ID Regime Douanier] AS [ID_Regime_Douanier]

                ,B.[Libelle Regime Douanier] AS [Libelle_Regime_Douanier]

                ,A.[Libelle Regime Declaration] AS [Libelle_Regime_Declaration]

                ,CASE

                               WHEN A.[Taux Regime]=-2 THEN 'TTC'

                               WHEN A.[Taux Regime]=-1 THEN '100% TR'

                               WHEN A.[Taux Regime]=0 THEN 'EX0'

                               WHEN A.[Taux Regime]=1 THEN '100% DC'

                               ELSE FORMAT([Taux Regime], 'P')+ ' DC & ' + FORMAT(1-[Taux Regime], 'P') + ' TR'

                END AS [Regime_Code]

                ,CASE

                               WHEN A.[Taux Regime]=-2 THEN 0

                               WHEN A.[Taux Regime]=-1 THEN 0

                               WHEN A.[Taux Regime]=0 THEN 0

                               WHEN A.[Taux Regime]=1 THEN 1

                               ELSE[Taux Regime]

                END AS [Ratio_DC]

               

                ,CASE

                               WHEN A.[Taux Regime]=-2 THEN 0

                               WHEN A.[Taux Regime]=-1 THEN 1

                               WHEN A.[Taux Regime]=0 THEN 0

                               WHEN A.[Taux Regime]=1 THEN 0

                               ELSE 1-[Taux Regime]

                END AS [Ratio_TR]

 

                ,A.[Entite] AS [ID_Entite]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM dbo.TRegimesDeclarations A

                               INNER JOIN TRegimesDouaniers B On A.[Regime Douanier]=B.[ID Regime Douanier]

                               LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  View [dbo].[VRegimesClients]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VRegimesClients]

AS

                SELECT A.[ID Regime Client] AS [ID_Regime_Client]

                ,B.[ID Client] AS [ID_Client]

                ,B.[Nom Client] AS [Nom_Client]

                ,C.ID_Regime_Declaration

                ,C.[ID_Regime_Douanier]

                ,C.[Libelle_Regime_Douanier]

                ,C.[Libelle_Regime_Declaration]

                ,C.[Regime_Code]

                ,C.[Ratio_DC]

                ,C.[Ratio_TR]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM dbo.TRegimesClients A

                               INNER JOIN dbo.TClients B On A.[Client]=B.[ID Client]

                               INNER JOIN dbo.VRegimesDeclarations C ON A.[Regime Declaration]=C.ID_Regime_Declaration

                               LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  Table [dbo].[TTauxChange]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TTauxChange](

                [ID Taux Change] [int] IDENTITY(1,1) NOT NULL,

                [Convertion] [int] NOT NULL,

                [Devise] [int] NOT NULL,

                [Taux Change] [numeric](24, 6) NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TTauxChange$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Taux Change] ASC

),

CONSTRAINT [UQ_TTauxChange$Convertion$Devise] UNIQUE NONCLUSTERED

(

                [Convertion] ASC,

                [Devise] ASC

)

) ON [PRIMARY]

GO

/****** Object:  UserDefinedFunction [dbo].[fx_TauxChangeDossier]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE FUNCTION [dbo].[fx_TauxChangeDossier](@Id_Dossier INT, @DateDeclaration datetime2(7))

RETURNS TABLE

AS

RETURN

(

                               -- Recuperer les devises distinctes du dossier

                WITH DEVISES_DOSSIER ([ID Devise]) AS

                (

                               SELECT DISTINCT [Devise]

                               FROM [dbo].[TColisageDossiers]

                               WHERE [Dossier]=@Id_Dossier

                ),

                               -- Recuperer l'ID de l'entite et la devise locale

                ENTITE_DOSSIER([ID Entite],[ID Devise0]) AS

                (

                               SELECT C.[ID Entite], D.[Devise Locale]

                               FROM dbo.TDossiers A

                                               INNER JOIN dbo.TBranches B On A.[Branche]=B.[ID Branche]

                                               INNER JOIN dbo.TEntites C ON B.[Entite]=C.[ID Entite]

                                               INNER JOIN dbo.TPays D ON C.[Pays]=D.[ID Pays]

                               WHERE A.[ID Dossier]=@Id_Dossier

                ),                            

                               -- Recuperer les taux des devises a la date de la declaration de l'entite

                TAUXCHANGE_DOSSIER ([ID Convertion],[ID Devise], [Taux Change], [Convertion Date]) AS

                (

                               SELECT B.[ID Convertion], A.[Devise] ,A.[Taux Change], B.[Date Convertion]

                               FROM dbo.TTauxChange A

                                               INNER JOIN dbo.TConvertions B ON A.[Convertion]=B.[ID Convertion], ENTITE_DOSSIER C

                               WHERE (B.[Date Convertion]=@DateDeclaration) AND (B.[Entite]=C.[ID Entite])

                ),

                               -- Recuperer le coef du taux de change de la devise locale

                TAUX_DEVISE_LOCALE([Taux Change0]) AS

                (

                               SELECT A.[Taux Change]

                               FROM TAUXCHANGE_DOSSIER A INNER JOIN ENTITE_DOSSIER B ON A.[ID Devise]=B.[ID Devise0]

                )

               

 

                SELECT B.[ID Devise] AS [ID_Devise]

                               ,B.[Code Devise] AS [Code_Devise]

                               ,CAST( CASE

                                               WHEN A.[ID Devise]= X.[ID Devise0] THEN 1

                                               WHEN ISNULL(C.[Taux Change],0)=0 THEN NULL

                                               ELSE IIF (ISNULL(Y.[Taux Change0],0)=0,C.[Taux Change],  C.[Taux Change]/Y.[Taux Change0])

                                               END AS numeric(24,6)) AS [Taux_Change],

                               C.[ID Convertion] AS [ID_Convertion],

                               C.[Convertion Date]

                FROM DEVISES_DOSSIER A

                               INNER JOIN dbo.TDevises B ON A.[ID Devise]=B.[ID Devise]

                               LEFT JOIN TAUXCHANGE_DOSSIER C ON A.[ID Devise]=C.[ID Devise], ENTITE_DOSSIER X, TAUX_DEVISE_LOCALE Y

)

GO

/****** Object:  UserDefinedFunction [dbo].[fx_PermissionsUtilisateur]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE FUNCTION [dbo].[fx_PermissionsUtilisateur](@Id_Utilisateur INT)

RETURNS TABLE

AS

RETURN

(

                WITH ROLES_UTILISATEUR ([ID Role]) AS

                (

                               SELECT DISTINCT [Role]

                               FROM [dbo].[TRolesUtilisateurs]

                               WHERE [Utilisateur]=@Id_Utilisateur

                )

               

                SELECT DISTINCT B.[Permission] AS [ID_Permission]

                FROM ROLES_UTILISATEUR A INNER JOIN dbo.TPermissonsRoles B ON A.[ID Role]=B.[Role]

)

GO

/****** Object:  View [dbo].[VTauxChange]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE   VIEW [dbo].[VTauxChange]

AS

                SELECT A.[ID Taux Change] AS [ID_Taux_Change]

                ,A.[Convertion] AS [ID_Convertion]

                ,B.[Code Devise] AS [Devise]

                ,A.[Taux Change] AS [Taux_Change]

                ,A.[Date Creation] AS [Date_Creation]

                ,Z.Nom_Utilisateur AS [Nom_Creation]

                FROM dbo.TTauxChange A

                               INNER JOIN dbo.TDevises B On A.Devise=B.[ID Devise]

                               LEFT JOIN dbo.[VSessions] Z ON A.[Session]=Z.[ID_Session]

GO

/****** Object:  View [dbo].[VPermissionsBase]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

 

 

CREATE   VIEW [dbo].[VPermissionsBase]

AS

                SELECT [ID Permission Base] AS [ID_Permission_Base]

                ,[Libelle Permission] AS [Libelle_Permission]

                ,[Permission Active] AS [Permission_Active]

                ,[Date Activation] AS [Date_Activation]

                FROM dbo.TPermissionsBase

GO

/****** Object:  View [dbo].[VColisageDossiers]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE     VIEW [dbo].[VColisageDossiers]

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

                ,N.[Regime_Code]

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

/****** Object:  Table [dbo].[TNotesDetail]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TABLE [dbo].[TNotesDetail](

                [ID Note Detail] [int] IDENTITY(1,1) NOT NULL,

                [Colisage Dossier] [int] NOT NULL,

                [Regime] [nvarchar](10) NOT NULL,

                [Nbre Paquetage] [numeric](24, 2) NOT NULL,

                [Valeur] [numeric](24, 2) NOT NULL,

                [Base Poids Brut] [numeric](24, 2) NOT NULL,

                [Base Poids Net] [numeric](24, 2) NOT NULL,

                [Base Volume] [numeric](24, 2) NOT NULL,

                [Session] [int] NOT NULL,

                [Date Creation] [datetime2](7) NOT NULL,

                [RowVer] [timestamp] NOT NULL,

CONSTRAINT [TNotesDetail$PrimaryKey] PRIMARY KEY CLUSTERED

(

                [ID Note Detail] ASC

)

) ON [PRIMARY]

GO

/****** Object:  View [dbo].[VNotesDetail]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   VIEW [dbo].[VNotesDetail]

AS

                SELECT B.[ID_Dossier]

      ,B.[HS_Code]

      ,B.[Pays_Origine]

 

                ,B.ID_Regime_Declaration

                ,B.[ID_Regime_Douanier]

                ,B.[Libelle_Regime_Douanier]

                ,B.[Libelle_Regime_Declaration]

      ,B.[Regroupement_Client]

      ,A.[Regime] AS [Regime]

                  ,B.Code_Devise

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

    ,B.[Regroupement_Client]

     ,A.[Regime]

                  ,B.Code_Devise

GO

SET ANSI_PADDING ON

GO

/****** Object:  Index [UN_TColisageDossiers]    Script Date: 16/02/2026 16:52:13 ******/

CREATE UNIQUE NONCLUSTERED INDEX [UN_TColisageDossiers] ON [dbo].[TColisageDossiers]

(

                [No Facture] ASC,

                [Nom Fournisseur] ASC,

                [Item No] ASC,

                [No Commande] ASC

)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]

GO

SET ANSI_PADDING ON

GO

/****** Object:  Index [UQ_TColisageDossiers$UploadKey]    Script Date: 16/02/2026 16:52:13 ******/

CREATE UNIQUE NONCLUSTERED INDEX [UQ_TColisageDossiers$UploadKey] ON [dbo].[TColisageDossiers]

(

                [Dossier] ASC,

                [UploadKey] ASC

)

WHERE ([UploadKey]<>N'')

WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]

GO

SET ANSI_PADDING ON

GO

/****** Object:  Index [UQ_TDossiers$No Dossier]    Script Date: 16/02/2026 16:52:13 ******/

CREATE UNIQUE NONCLUSTERED INDEX [UQ_TDossiers$No Dossier] ON [dbo].[TDossiers]

(

                [No Dossier] ASC,

                [Branche] DESC

)

WHERE ([No Dossier]<>'')

WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]

GO

SET ANSI_PADDING ON

GO

/****** Object:  Index [UQ_TDossiers$No OT]    Script Date: 16/02/2026 16:52:13 ******/

CREATE UNIQUE NONCLUSTERED INDEX [UQ_TDossiers$No OT] ON [dbo].[TDossiers]

(

                [No OT] ASC,

                [Client] DESC

)

WHERE ([No OT]<>'')

WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]

GO

ALTER TABLE [dbo].[TBranches] ADD  CONSTRAINT [DF_TBranches_Entite]  DEFAULT ((0)) FOR [Entite]

GO

ALTER TABLE [dbo].[TBranches] ADD  CONSTRAINT [DF__TBranches__Sessi__382F5661]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TBranches] ADD  CONSTRAINT [DF__TBranches__Date __39237A9A]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TClients] ADD  CONSTRAINT [DF_TClients_Entite]  DEFAULT ((0)) FOR [Entite]

GO

ALTER TABLE [dbo].[TClients] ADD  CONSTRAINT [DF__TClients__Sessio__47DBAE45]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TClients] ADD  CONSTRAINT [DF__TClients__Date C__48CFD27E]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TCodesEtapes] ADD  CONSTRAINT [DF__TCodesEta__Suivi__2645B050]  DEFAULT ((0)) FOR [Suivi Duree]

GO

ALTER TABLE [dbo].[TCodesEtapes] ADD  CONSTRAINT [DF__TCodesEta__Delai__2739D489]  DEFAULT ((0)) FOR [Delai Etape]

GO

ALTER TABLE [dbo].[TCodesEtapes] ADD  CONSTRAINT [DF__TCodesEta__Circu__282DF8C2]  DEFAULT ('-') FOR [Circuit Etape]

GO

ALTER TABLE [dbo].[TCodesEtapes] ADD  CONSTRAINT [DF__TCodesEta__Index__29221CFB]  DEFAULT ((0)) FOR [Index Etape]

GO

ALTER TABLE [dbo].[TCodesEtapes] ADD  CONSTRAINT [DF_TCodesEtapes_Entite]  DEFAULT ((0)) FOR [Entite]

GO

ALTER TABLE [dbo].[TCodesEtapes] ADD  CONSTRAINT [DF__TCodesEta__Sessi__2A164134]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TCodesEtapes] ADD  CONSTRAINT [DF__TCodesEta__Date __2B0A656D]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF_TColisageDossiers_No Commande]  DEFAULT (N'') FOR [No Commande]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF_TColisageDossiers_Nom Fournisseur]  DEFAULT (N'') FOR [Nom Fournisseur]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF_TColisageDossiers_No Facture]  DEFAULT (N'') FOR [No Facture]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF_TColisageDossiers_Item_No]  DEFAULT (N'') FOR [Item No]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF__TColisage__Qte C__123EB7A3]  DEFAULT ((1)) FOR [Qte Colis]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF__TColisage__Prix __1332DBDC]  DEFAULT ((0)) FOR [Prix Unitaire Colis]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF__TColisage__Poids__14270015]  DEFAULT ((0)) FOR [Poids Brut]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF__TColisage__Poids__151B244E]  DEFAULT ((0)) FOR [Poids Net]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF__TColisage__Volum__160F4887]  DEFAULT ((0)) FOR [Volume]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF_TColisageDossiers_Ajustement Valeur]  DEFAULT ((0)) FOR [Ajustement Valeur]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF__TColisage__Regro__17036CC0]  DEFAULT ('') FOR [Regroupement Client]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF_TColisageDossiers_UploadKey]  DEFAULT (N'') FOR [UploadKey]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF__TColisage__Sessi__17F790F9]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TColisageDossiers] ADD  CONSTRAINT [DF__TColisage__Date __18EBB532]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TConvertions] ADD  CONSTRAINT [DF_TConvertions_Entite]  DEFAULT ((0)) FOR [Entite]

GO

ALTER TABLE [dbo].[TConvertions] ADD  CONSTRAINT [DF__TConverti__Sessi__76969D2E]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TConvertions] ADD  CONSTRAINT [DF__TConverti__Date __778AC167]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TDevises] ADD  CONSTRAINT [DF_TDevises_Decimales]  DEFAULT ((2)) FOR [Decimales]

GO

ALTER TABLE [dbo].[TDevises] ADD  CONSTRAINT [DF_TDevises_Devise Inactive]  DEFAULT ((1)) FOR [Devise Inactive]

GO

ALTER TABLE [dbo].[TDevises] ADD  CONSTRAINT [DF__TDevises__Sessio__71D1E811]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TDevises] ADD  CONSTRAINT [DF__TDevises__Date C__72C60C4A]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TDossiers] ADD  CONSTRAINT [DF_TDossiers_Branche]  DEFAULT ((0)) FOR [Branche]

GO

ALTER TABLE [dbo].[TDossiers] ADD  CONSTRAINT [DF_TDossiers_Description Dossier]  DEFAULT (N'') FOR [Description Dossier]

GO

ALTER TABLE [dbo].[TDossiers] ADD  CONSTRAINT [DF_TDossiers_No OT]  DEFAULT ('') FOR [No OT]

GO

ALTER TABLE [dbo].[TDossiers] ADD  CONSTRAINT [DF_TDossiers_No Dossier]  DEFAULT ('') FOR [No Dossier]

GO

ALTER TABLE [dbo].[TDossiers] ADD  CONSTRAINT [DF_TDossiers_Nbre Paquetage]  DEFAULT ((0)) FOR [Nbre Paquetage Pesee]

GO

ALTER TABLE [dbo].[TDossiers] ADD  CONSTRAINT [DF__TDossiers__Poids__628FA481]  DEFAULT ((0)) FOR [Poids Brut Pesee]

GO

ALTER TABLE [dbo].[TDossiers] ADD  CONSTRAINT [DF__TDossiers__Poids__6383C8BA]  DEFAULT ((0)) FOR [Poids Net Pesee]

GO

ALTER TABLE [dbo].[TDossiers] ADD  CONSTRAINT [DF__TDossiers__Volum__6477ECF3]  DEFAULT ((0)) FOR [Volume Pesee]

GO

ALTER TABLE [dbo].[TDossiers] ADD  CONSTRAINT [DF_TDossiers_Responsable Dossier]  DEFAULT ((0)) FOR [Responsable Dossier]

GO

ALTER TABLE [dbo].[TDossiers] ADD  CONSTRAINT [DF__TDossiers__Statu__656C112C]  DEFAULT ((0)) FOR [Statut Dossier]

GO

ALTER TABLE [dbo].[TDossiers] ADD  CONSTRAINT [DF__TDossiers__Sessi__66603565]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TDossiers] ADD  CONSTRAINT [DF__TDossiers__Date __6754599E]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TEntites] ADD  CONSTRAINT [DF__TEntites__Code E__3CF40B7E]  DEFAULT ('-') FOR [Code Entite]

GO

ALTER TABLE [dbo].[TEntites] ADD  CONSTRAINT [DF_TEntites_Groupe Entite]  DEFAULT ((0)) FOR [Groupe Entite]

GO

ALTER TABLE [dbo].[TEntites] ADD  CONSTRAINT [DF_TEntites_Pays]  DEFAULT ((0)) FOR [Pays]

GO

ALTER TABLE [dbo].[TEntites] ADD  CONSTRAINT [DF__TEntites__Sessio__3DE82FB7]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TEntites] ADD  CONSTRAINT [DF__TEntites__Date C__3EDC53F0]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TEtapesDossiers] ADD  CONSTRAINT [DF__TEtapesDoss__Qte__2DE6D218]  DEFAULT ((0)) FOR [Qte]

GO

ALTER TABLE [dbo].[TEtapesDossiers] ADD  CONSTRAINT [DF__TEtapesDo__Sessi__2EDAF651]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TEtapesDossiers] ADD  CONSTRAINT [DF__TEtapesDo__Date __2FCF1A8A]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TGroupesEntites] ADD  CONSTRAINT [DF__TGroupesE__Sessi__09746778]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TGroupesEntites] ADD  CONSTRAINT [DF__TGroupesE__Date __0A688BB1]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[THSCodes] ADD  CONSTRAINT [DF__THSCodes__Libell__6B24EA82]  DEFAULT ('-') FOR [Libelle HS Code]

GO

ALTER TABLE [dbo].[THSCodes] ADD  CONSTRAINT [DF_THSCodes_Entite]  DEFAULT ((0)) FOR [Entite]

GO

ALTER TABLE [dbo].[THSCodes] ADD  CONSTRAINT [DF__THSCodes__Sessio__6C190EBB]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[THSCodes] ADD  CONSTRAINT [DF__THSCodes__Date C__6D0D32F4]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TModesTransport] ADD  CONSTRAINT [DF__TModesTra__Sessi__5629CD9C]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TModesTransport] ADD  CONSTRAINT [DF__TModesTra__Date __571DF1D5]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TNotesDetail] ADD  CONSTRAINT [DF_TNotesDetail_Regime]  DEFAULT (N'') FOR [Regime]

GO

ALTER TABLE [dbo].[TNotesDetail] ADD  CONSTRAINT [DF_TNotesDetail_Nbre Paquetage]  DEFAULT ((0)) FOR [Nbre Paquetage]

GO

ALTER TABLE [dbo].[TNotesDetail] ADD  CONSTRAINT [DF__TNotesDet__Base __1DB06A4F]  DEFAULT ((0)) FOR [Valeur]

GO

ALTER TABLE [dbo].[TNotesDetail] ADD  CONSTRAINT [DF__TNotesDet__Base __1EA48E88]  DEFAULT ((0)) FOR [Base Poids Brut]

GO

ALTER TABLE [dbo].[TNotesDetail] ADD  CONSTRAINT [DF__TNotesDet__Base __1F98B2C1]  DEFAULT ((0)) FOR [Base Poids Net]

GO

ALTER TABLE [dbo].[TNotesDetail] ADD  CONSTRAINT [DF__TNotesDet__Base __208CD6FA]  DEFAULT ((0)) FOR [Base Volume]

GO

ALTER TABLE [dbo].[TNotesDetail] ADD  CONSTRAINT [DF__TNotesDet__Sessi__2180FB33]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TNotesDetail] ADD  CONSTRAINT [DF__TNotesDet__Date __22751F6C]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TPays] ADD  CONSTRAINT [DF__TPays__Session__7F2BE32F]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TPays] ADD  CONSTRAINT [DF__TPays__Date Crea__00200768]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TPermissionsBase] ADD  CONSTRAINT [DF__TPermissionsBas__Permission __398D8EEE]  DEFAULT ((0)) FOR [Permission Active]

GO

ALTER TABLE [dbo].[TPermissionsBase] ADD  CONSTRAINT [DF__TPermissionsBas__Date __3A81B327]  DEFAULT (getdate()) FOR [Date Activation]

GO

ALTER TABLE [dbo].[TPermissonsRoles] ADD  CONSTRAINT [DF_TPermissonsRoles_Session]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TPermissonsRoles] ADD  CONSTRAINT [DF_TPermissonsRoles_Date Creation]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TRegimesClients] ADD  CONSTRAINT [DF__TRegimesC__Sessi__0E6E26BF]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TRegimesClients] ADD  CONSTRAINT [DF__TRegimesC__Date __0F624AF8]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TRegimesDeclarations] ADD  CONSTRAINT [DF_TRegimesDeclarations_Regime Douanier]  DEFAULT ((0)) FOR [Regime Douanier]

GO

ALTER TABLE [dbo].[TRegimesDeclarations] ADD  CONSTRAINT [DF_TRegimesDeclarations_Entite]  DEFAULT ((0)) FOR [Entite]

GO

ALTER TABLE [dbo].[TRegimesDeclarations] ADD  CONSTRAINT [DF__TRegimesD__Sessi__0A9D95DB]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TRegimesDeclarations] ADD  CONSTRAINT [DF__TRegimesD__Date __0B91BA14]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TRegimesDouaniers] ADD  CONSTRAINT [DF__TRegimesD__Sessi__04E4BC85]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TRegimesDouaniers] ADD  CONSTRAINT [DF__TRegimesD__Date __05D8E0BE]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TRoles] ADD  CONSTRAINT [DF_TRoles_Session]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TRoles] ADD  CONSTRAINT [DF_TRoles_Date Creation]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TRolesUtilisateurs] ADD  CONSTRAINT [DF_TRolesUtilisateurs_Session]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TRolesUtilisateurs] ADD  CONSTRAINT [DF_TRolesUtilisateurs_Date Creation]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TSensTrafic] ADD  CONSTRAINT [DF__TSensTraf__Sessi__5165187F]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TSensTrafic] ADD  CONSTRAINT [DF__TSensTraf__Date __52593CB8]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TSessions] ADD  CONSTRAINT [DF__TSessions__Debut__4316F928]  DEFAULT (getdate()) FOR [Debut Session]

GO

ALTER TABLE [dbo].[TSessions] ADD  CONSTRAINT [DF__TSessions__Fin S__440B1D61]  DEFAULT (getdate()) FOR [Fin Session]

GO

ALTER TABLE [dbo].[TStatutsDossier] ADD  CONSTRAINT [DF__TStatutsD__Sessi__4CA06362]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TStatutsDossier] ADD  CONSTRAINT [DF__TStatutsD__Date __4D94879B]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TTauxChange] ADD  CONSTRAINT [DF_TTauxChange_Session]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TTauxChange] ADD  CONSTRAINT [DF_TTauxChange_Date Creation]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TTypesDossiers] ADD  CONSTRAINT [DF_TTypesDossiers_Entite]  DEFAULT ((0)) FOR [Entite]

GO

ALTER TABLE [dbo].[TTypesDossiers] ADD  CONSTRAINT [DF__TTypes_Do__Sessi__5AEE82B9]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TTypesDossiers] ADD  CONSTRAINT [DF__TTypes_Do__Date __5BE2A6F2]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TUtilisateurs] ADD  CONSTRAINT [DF_TUtilisateurs_Entite]  DEFAULT ((0)) FOR [Entite]

GO

ALTER TABLE [dbo].[TUtilisateurs] ADD  CONSTRAINT [DF__TUtilisat__Sessi__3F466844]  DEFAULT ((0)) FOR [Session]

GO

ALTER TABLE [dbo].[TUtilisateurs] ADD  CONSTRAINT [DF__TUtilisat__Date __403A8C7D]  DEFAULT (getdate()) FOR [Date Creation]

GO

ALTER TABLE [dbo].[TBranches]  WITH CHECK ADD  CONSTRAINT [FK_TBranches_TEntites] FOREIGN KEY([Entite])

REFERENCES [dbo].[TEntites] ([ID Entite])

GO

ALTER TABLE [dbo].[TBranches] CHECK CONSTRAINT [FK_TBranches_TEntites]

GO

ALTER TABLE [dbo].[TClients]  WITH CHECK ADD  CONSTRAINT [FK_TClients_TEntites] FOREIGN KEY([Entite])

REFERENCES [dbo].[TEntites] ([ID Entite])

GO

ALTER TABLE [dbo].[TClients] CHECK CONSTRAINT [FK_TClients_TEntites]

GO

ALTER TABLE [dbo].[TColisageDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TColisageDossiers_TDevises] FOREIGN KEY([Devise])

REFERENCES [dbo].[TDevises] ([ID Devise])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TColisageDossiers] CHECK CONSTRAINT [FK_TColisageDossiers_TDevises]

GO

ALTER TABLE [dbo].[TColisageDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TColisageDossiers_TDossiers] FOREIGN KEY([Dossier])

REFERENCES [dbo].[TDossiers] ([ID Dossier])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TColisageDossiers] CHECK CONSTRAINT [FK_TColisageDossiers_TDossiers]

GO

ALTER TABLE [dbo].[TColisageDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TColisageDossiers_THSCodes] FOREIGN KEY([HS Code])

REFERENCES [dbo].[THSCodes] ([ID HS Code])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TColisageDossiers] CHECK CONSTRAINT [FK_TColisageDossiers_THSCodes]

GO

ALTER TABLE [dbo].[TColisageDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TColisageDossiers_TPays] FOREIGN KEY([Pays Origine])

REFERENCES [dbo].[TPays] ([ID Pays])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TColisageDossiers] CHECK CONSTRAINT [FK_TColisageDossiers_TPays]

GO

ALTER TABLE [dbo].[TColisageDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TColisageDossiers_TRegimesDeclarations] FOREIGN KEY([Regime Declaration])

REFERENCES [dbo].[TRegimesDeclarations] ([ID Regime Declaration])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TColisageDossiers] CHECK CONSTRAINT [FK_TColisageDossiers_TRegimesDeclarations]

GO

ALTER TABLE [dbo].[TDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TDossiers_TBranches] FOREIGN KEY([Branche])

REFERENCES [dbo].[TBranches] ([ID Branche])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TDossiers] CHECK CONSTRAINT [FK_TDossiers_TBranches]

GO

ALTER TABLE [dbo].[TDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TDossiers_TClients] FOREIGN KEY([Client])

REFERENCES [dbo].[TClients] ([ID Client])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TDossiers] CHECK CONSTRAINT [FK_TDossiers_TClients]

GO

ALTER TABLE [dbo].[TDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TDossiers_TConvertions] FOREIGN KEY([Convertion])

REFERENCES [dbo].[TConvertions] ([ID Convertion])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TDossiers] CHECK CONSTRAINT [FK_TDossiers_TConvertions]

GO

ALTER TABLE [dbo].[TDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TDossiers_TStatutsDossier] FOREIGN KEY([Statut Dossier])

REFERENCES [dbo].[TStatutsDossier] ([ID Statut Dossier])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TDossiers] CHECK CONSTRAINT [FK_TDossiers_TStatutsDossier]

GO

ALTER TABLE [dbo].[TDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TDossiers_TTypes_Dossiers] FOREIGN KEY([Type Dossier])

REFERENCES [dbo].[TTypesDossiers] ([ID Type Dossier])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TDossiers] CHECK CONSTRAINT [FK_TDossiers_TTypes_Dossiers]

GO

ALTER TABLE [dbo].[TDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TDossiers_TUtilisateurs] FOREIGN KEY([Responsable Dossier])

REFERENCES [dbo].[TUtilisateurs] ([ID Utilisateur])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TDossiers] CHECK CONSTRAINT [FK_TDossiers_TUtilisateurs]

GO

ALTER TABLE [dbo].[TEntites]  WITH CHECK ADD  CONSTRAINT [FK_TEntites_TGroupesEntites] FOREIGN KEY([Groupe Entite])

REFERENCES [dbo].[TGroupesEntites] ([ID Groupe Entite])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TEntites] CHECK CONSTRAINT [FK_TEntites_TGroupesEntites]

GO

ALTER TABLE [dbo].[TEntites]  WITH CHECK ADD  CONSTRAINT [FK_TEntites_TPays] FOREIGN KEY([Pays])

REFERENCES [dbo].[TPays] ([ID Pays])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TEntites] CHECK CONSTRAINT [FK_TEntites_TPays]

GO

ALTER TABLE [dbo].[TEtapesDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TEtapesDossiers_TCodesEtapes] FOREIGN KEY([Etape Dossier])

REFERENCES [dbo].[TCodesEtapes] ([ID Code Etape])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TEtapesDossiers] CHECK CONSTRAINT [FK_TEtapesDossiers_TCodesEtapes]

GO

ALTER TABLE [dbo].[TEtapesDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TEtapesDossiers_TDossiers] FOREIGN KEY([Dossier])

REFERENCES [dbo].[TDossiers] ([ID Dossier])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TEtapesDossiers] CHECK CONSTRAINT [FK_TEtapesDossiers_TDossiers]

GO

ALTER TABLE [dbo].[TNotesDetail]  WITH CHECK ADD  CONSTRAINT [FK_TNotesDetail_TColisageDossiers] FOREIGN KEY([Colisage Dossier])

REFERENCES [dbo].[TColisageDossiers] ([ID Colisage Dossier])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TNotesDetail] CHECK CONSTRAINT [FK_TNotesDetail_TColisageDossiers]

GO

ALTER TABLE [dbo].[TPays]  WITH CHECK ADD  CONSTRAINT [FK_TPays_TDevises] FOREIGN KEY([Devise Locale])

REFERENCES [dbo].[TDevises] ([ID Devise])

GO

ALTER TABLE [dbo].[TPays] CHECK CONSTRAINT [FK_TPays_TDevises]

GO

ALTER TABLE [dbo].[TPermissonsRoles]  WITH CHECK ADD  CONSTRAINT [FK_TPermissonsRoles_TPermissionsBase] FOREIGN KEY([Permission])

REFERENCES [dbo].[TPermissionsBase] ([ID Permission Base])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TPermissonsRoles] CHECK CONSTRAINT [FK_TPermissonsRoles_TPermissionsBase]

GO

ALTER TABLE [dbo].[TPermissonsRoles]  WITH CHECK ADD  CONSTRAINT [FK_TPermissonsRoles_TPermissonsRoles] FOREIGN KEY([Role])

REFERENCES [dbo].[TRoles] ([ID Role])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TPermissonsRoles] CHECK CONSTRAINT [FK_TPermissonsRoles_TPermissonsRoles]

GO

ALTER TABLE [dbo].[TRegimesClients]  WITH CHECK ADD  CONSTRAINT [FK_TRegimesClients_TClients] FOREIGN KEY([Client])

REFERENCES [dbo].[TClients] ([ID Client])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TRegimesClients] CHECK CONSTRAINT [FK_TRegimesClients_TClients]

GO

ALTER TABLE [dbo].[TRegimesClients]  WITH CHECK ADD  CONSTRAINT [FK_TRegimesClients_TRegimesDeclarations] FOREIGN KEY([Regime Declaration])

REFERENCES [dbo].[TRegimesDeclarations] ([ID Regime Declaration])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TRegimesClients] CHECK CONSTRAINT [FK_TRegimesClients_TRegimesDeclarations]

GO

ALTER TABLE [dbo].[TRegimesDeclarations]  WITH CHECK ADD  CONSTRAINT [FK_TRegimesDeclarations_TRegimesDouaniers] FOREIGN KEY([Regime Douanier])

REFERENCES [dbo].[TRegimesDouaniers] ([ID Regime Douanier])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TRegimesDeclarations] CHECK CONSTRAINT [FK_TRegimesDeclarations_TRegimesDouaniers]

GO

ALTER TABLE [dbo].[TRolesUtilisateurs]  WITH CHECK ADD  CONSTRAINT [FK_TRolesUtilisateurs_TRoles] FOREIGN KEY([Role])

REFERENCES [dbo].[TRoles] ([ID Role])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TRolesUtilisateurs] CHECK CONSTRAINT [FK_TRolesUtilisateurs_TRoles]

GO

ALTER TABLE [dbo].[TRolesUtilisateurs]  WITH CHECK ADD  CONSTRAINT [FK_TRolesUtilisateurs_TUtilisateurs] FOREIGN KEY([Utilisateur])

REFERENCES [dbo].[TUtilisateurs] ([ID Utilisateur])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TRolesUtilisateurs] CHECK CONSTRAINT [FK_TRolesUtilisateurs_TUtilisateurs]

GO

ALTER TABLE [dbo].[TSessions]  WITH CHECK ADD  CONSTRAINT [FK_TSessions_TUtilisateurs] FOREIGN KEY([Utilisateur])

REFERENCES [dbo].[TUtilisateurs] ([ID Utilisateur])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TSessions] CHECK CONSTRAINT [FK_TSessions_TUtilisateurs]

GO

ALTER TABLE [dbo].[TTauxChange]  WITH CHECK ADD  CONSTRAINT [FK_TTauxChange_TConvertions] FOREIGN KEY([Convertion])

REFERENCES [dbo].[TConvertions] ([ID Convertion])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TTauxChange] CHECK CONSTRAINT [FK_TTauxChange_TConvertions]

GO

ALTER TABLE [dbo].[TTauxChange]  WITH CHECK ADD  CONSTRAINT [FK_TTauxChange_TDevises] FOREIGN KEY([Devise])

REFERENCES [dbo].[TDevises] ([ID Devise])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TTauxChange] CHECK CONSTRAINT [FK_TTauxChange_TDevises]

GO

ALTER TABLE [dbo].[TTypesDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TTypes_Dossiers_TModesTransport] FOREIGN KEY([Mode Transport])

REFERENCES [dbo].[TModesTransport] ([ID Mode Transport])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TTypesDossiers] CHECK CONSTRAINT [FK_TTypes_Dossiers_TModesTransport]

GO

ALTER TABLE [dbo].[TTypesDossiers]  WITH CHECK ADD  CONSTRAINT [FK_TTypes_Dossiers_TSensTrafic] FOREIGN KEY([Sens Trafic])

REFERENCES [dbo].[TSensTrafic] ([ID Sens Trafic])

ON UPDATE CASCADE

GO

ALTER TABLE [dbo].[TTypesDossiers] CHECK CONSTRAINT [FK_TTypes_Dossiers_TSensTrafic]

GO

ALTER TABLE [dbo].[TEtapesDossiers]  WITH CHECK ADD  CONSTRAINT [CK_TEtapesDossiers$Dates] CHECK  (([Date Fin]>=[Date Debut]))

GO

ALTER TABLE [dbo].[TEtapesDossiers] CHECK CONSTRAINT [CK_TEtapesDossiers$Dates]

GO

ALTER TABLE [dbo].[TPermissionsBase]  WITH CHECK ADD  CONSTRAINT [CK__TPermissionsBas__ID Ro__38996AB5] CHECK  (([ID Permission Base]>=(0) AND [ID Permission Base]<=(62)))

GO

ALTER TABLE [dbo].[TPermissionsBase] CHECK CONSTRAINT [CK__TPermissionsBas__ID Ro__38996AB5]

GO

ALTER TABLE [dbo].[TRegimesDeclarations]  WITH CHECK ADD  CONSTRAINT [CK_TRegimesDeclaration$Taux Regime] CHECK  (([Taux Regime]=(-2) OR [Taux Regime]=(-1) OR [Taux Regime]>=(0) AND [Taux Regime]<=(1)))

GO

ALTER TABLE [dbo].[TRegimesDeclarations] CHECK CONSTRAINT [CK_TRegimesDeclaration$Taux Regime]

GO

/****** Object:  StoredProcedure [dbo].[pSP_AjouterColisageDossier]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE PROCEDURE [dbo].[pSP_AjouterColisageDossier]

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

                               WHERE (A.[Client]=@ID_Client) AND (C.[Code Regime Douanier]=ISNULL(@Regime_Code,'')) AND (B.[Taux Regime]=@Regime_Ratio)

 

                               IF (@ID_Regime_Declaration is null)

                               BEGIN

                                               SET @Message='REGIME RATIO ' + FORMAT(@Regime_Ratio,'P') + ') NOT EXIST FOR THIS CUSTOMER.

                                                               -2                           ==> TTC

                                                               -1                           ==> 100% TR

                                                               0                            ==> EXO

                                                               1                            ==> 100% DC

                                                               ]0..1[     ==> DC RATIO'

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

                               VALUES (@Id_Dossier

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

/****** Object:  StoredProcedure [dbo].[pSP_AnnulerDossier]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE PROCEDURE [dbo].[pSP_AnnulerDossier]

                @Id_Dossier int=0

AS

BEGIN

                SET NOCOUNT ON;

                DECLARE @Values nvarchar(max), @Message nvarchar(max)

 

                --Verifier que le dossier est en cours

                IF NOT EXISTS(SELECT TOP 1 [ID Dossier] FROM TDossiers WHERE ([ID Dossier]=@Id_Dossier) AND ([Statut Dossier]=0))

                BEGIN

                               SET @Message='FILE IS NOT IN PROGRESS'

                               RAISERROR (@Message, 16, 1) WITH LOG;

                               RETURN

                END

 

                UPDATE dbo.TDossiers SET [Statut Dossier]=-2 WHERE [ID Dossier]=@Id_Dossier

END

 

GO

/****** Object:  StoredProcedure [dbo].[pSP_CalculeAjustementValeurColisage]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE       PROCEDURE [dbo].[pSP_CalculeAjustementValeurColisage]

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

/****** Object:  StoredProcedure [dbo].[pSP_CreerNoteDetail]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE PROCEDURE [dbo].[pSP_CreerNoteDetail]

                @Id_Dossier int

                ,@DateDeclaration datetime2(7)

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

 

                IF (@ID_Convertion IS NULL)

                BEGIN

                               SET @Message='MISSING EXCHANGE RATE AT ' + FORMAT(@DateDeclaration,'dd-MMM-yy') + ' FOR THIS ENTITY'

                               RAISERROR (@Message, 16, 1) WITH LOG;

                               RETURN

                END

 

 

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

                                               --Traitement [Taux Regime]=-2 ==> TTC

                               INSERT INTO [dbo].[TNotesDetail]

                                                                               ([Colisage Dossier]

                                                                               ,[Regime]

                                                                               ,[Valeur]

                                                                               ,[Nbre Paquetage]

                                                                               ,[Base Poids Brut]

                                                                               ,[Base Poids Net]

                                                                               ,[Base Volume])

                               SELECT A.[ID Colisage Dossier]

                                               ,N'TTC'

                                               ,(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])    

                                               ,@NbrePaquetagePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                                               ,@PoidsBrutPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                                               ,@PoidsNetPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                                               ,@VolumePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                               FROM [dbo].[TColisageDossiers] A

                                               INNER JOIN dbo.TRegimesDeclarations B ON A.[Regime Declaration]=B.[ID Regime Declaration]

                               WHERE ([Dossier]=@Id_Dossier) AND (A.[HS Code]<>0) AND (B.[Taux Regime]=-2)

 

                                               --Traitement [Taux Regime]=-1 ==> 100% TR

                               INSERT INTO [dbo].[TNotesDetail]

                                                                               ([Colisage Dossier]

                                                                               ,[Regime]

                                                                               ,[Valeur]

                                                                               ,[Nbre Paquetage]

                                                                               ,[Base Poids Brut]

                                                                               ,[Base Poids Net]

                                                                               ,[Base Volume])

                               SELECT A.[ID Colisage Dossier]

                                               ,N'100% TR'

                                               ,(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])    

                                               ,@NbrePaquetagePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                                               ,@PoidsBrutPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                                               ,@PoidsNetPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                                               ,@VolumePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                               FROM [dbo].[TColisageDossiers] A

                                               INNER JOIN dbo.TRegimesDeclarations B ON A.[Regime Declaration]=B.[ID Regime Declaration]

                               WHERE ([Dossier]=@Id_Dossier) AND (A.[HS Code]<>0) AND (B.[Taux Regime]=-1)

 

                                               --Traitement [Taux Regime]=0 ==> EXO

                               INSERT INTO [dbo].[TNotesDetail]

                                                                               ([Colisage Dossier]

                                                                               ,[Regime]

                                                                               ,[Valeur]

                                                                               ,[Nbre Paquetage]

                                                                               ,[Base Poids Brut]

                                                                               ,[Base Poids Net]

                                                                               ,[Base Volume])

                               SELECT A.[ID Colisage Dossier]

                                               ,N'EXO'

                                               ,(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])    

                                               ,@NbrePaquetagePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                                               ,@PoidsBrutPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                                               ,@PoidsNetPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                                               ,@VolumePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                               FROM [dbo].[TColisageDossiers] A

                                               INNER JOIN dbo.TRegimesDeclarations B ON A.[Regime Declaration]=B.[ID Regime Declaration]

                               WHERE ([Dossier]=@Id_Dossier) AND (A.[HS Code]<>0) AND (B.[Taux Regime]=0)

 

                               --Traitement [Taux Regime]=1 ==> 100% DC

                               INSERT INTO [dbo].[TNotesDetail]

                                                                               ([Colisage Dossier]

                                                                               ,[Regime]

                                                                               ,[Valeur]

                                                                               ,[Nbre Paquetage]

                                                                               ,[Base Poids Brut]

                                                                               ,[Base Poids Net]

                                                                               ,[Base Volume])

                               SELECT A.[ID Colisage Dossier]

                                               ,N'100% DC'

                                               ,(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])    

                                               ,@NbrePaquetagePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                                               ,@PoidsBrutPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                                               ,@PoidsNetPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                                               ,@VolumePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])/@ValeurTotaleColisage

                               FROM [dbo].[TColisageDossiers] A

                                               INNER JOIN dbo.TRegimesDeclarations B ON A.[Regime Declaration]=B.[ID Regime Declaration]

                               WHERE ([Dossier]=@Id_Dossier) AND (A.[HS Code]<>0) AND (B.[Taux Regime]=1)

 

 

                                               --Traitement DC=x% x in ]0%,100%[ ==> DC RATIO

                              UNION ALL

                               SELECT A.[ID Colisage Dossier]

                                               ,FORMAT(B.[Taux Regime],'P') + N' DC'

                                               ,(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*B.[Taux Regime]                         -- La valeur doit integrer l'ajustement

                                               ,@NbrePaquetagePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*B.[Taux Regime]/@ValeurTotaleColisage

                                               ,@PoidsBrutPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*B.[Taux Regime]/@ValeurTotaleColisage

                                               ,@PoidsNetPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*B.[Taux Regime]/@ValeurTotaleColisage

                                               ,@VolumePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*B.[Taux Regime]/@ValeurTotaleColisage

                               FROM [dbo].[TColisageDossiers] A

                                               INNER JOIN dbo.TRegimesDeclarations B ON A.[Regime Declaration]=B.[ID Regime Declaration]

                               WHERE ([Dossier]=@Id_Dossier) AND (A.[HS Code]<>0) AND (B.[Taux Regime]>0 AND B.[Taux Regime]<1)

                                                               -- Cas TR

                               UNION ALL

                               SELECT A.[ID Colisage Dossier]

                                               ,FORMAT(1-B.[Taux Regime],'P')  + N'TR'

                                               ,(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*(1-B.[Taux Regime])                 -- La valeur doit integrer l'ajustement

                                               ,@NbrePaquetagePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*(1-B.[Taux Regime])/@ValeurTotaleColisage

                                               ,@PoidsBrutPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*(1-B.[Taux Regime])/@ValeurTotaleColisage

                                               ,@PoidsNetPesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*(1-B.[Taux Regime])/@ValeurTotaleColisage

                                               ,@VolumePesee*(A.[Qte Colis]*A.[Prix Unitaire Colis] + A.[Ajustement Valeur])*(1-B.[Taux Regime])/@ValeurTotaleColisage

                               FROM [dbo].[TColisageDossiers] A

                                               INNER JOIN dbo.TRegimesDeclarations B ON A.[Regime Declaration]=B.[ID Regime Declaration]

                               WHERE ([Dossier]=@Id_Dossier) AND (A.[HS Code]<>0) AND (B.[Taux Regime]>0 AND B.[Taux Regime]<1)

 

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

 

GO

/****** Object:  StoredProcedure [dbo].[pSP_RecalculeDerniereEtapeDossier]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   PROCEDURE [dbo].[pSP_RecalculeDerniereEtapeDossier]

                @Id_Dossier int=0

AS

BEGIN

                SET NOCOUNT ON;

 

                IF @Id_Dossier>0

                BEGIN

                                               UPDATE A

                                               SET [Derniere Etape Dossier]=B.[ID Etape Dossier]

                                               FROM TDossiers A

                                                               OUTER APPLY

                                                               (

                                                                               SELECT TOP 1 M.[ID Etape Dossier]

                                                                               FROM TEtapesDossiers M INNER JOIN TCodesEtapes N ON M.[Etape Dossier] = N.[ID Code Etape]

                                                                               WHERE (M.[Dossier] = A.[ID Dossier])

                                                                               ORDER BY ISNULL(M.[Date Fin], M.[Date Debut]) DESC, N.[Index Etape] DESC

                                                               ) B

                                               WHERE (A.[ID Dossier]=@Id_Dossier) AND (ISNULL(A.[Derniere Etape Dossier],0) <>ISNULL(B.[ID Etape Dossier],0))

                END ELSE

                BEGIN

                                               UPDATE A

                                               SET [Derniere Etape Dossier]=B.[ID Etape Dossier]

                                               FROM TDossiers A

                                                               OUTER APPLY

                                                               (

                                                                               SELECT TOP 1 M.[ID Etape Dossier]

                                                                               FROM TEtapesDossiers M INNER JOIN TCodesEtapes N ON M.[Etape Dossier] = N.[ID Code Etape]

                                                                               WHERE (M.[Dossier] = A.[ID Dossier])

                                                                               ORDER BY ISNULL(M.[Date Fin], M.[Date Debut]) DESC, N.[Index Etape] DESC

                                                               ) B

                                               WHERE ISNULL(A.[Derniere Etape Dossier],0) <>ISNULL(B.[ID Etape Dossier],0)

                END

 

END

 

GO

/****** Object:  StoredProcedure [dbo].[pSP_SupprimerNoteDetail]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE PROCEDURE [dbo].[pSP_SupprimerNoteDetail]

                @Id_Dossier int=0

AS

BEGIN

                SET NOCOUNT ON;

                DECLARE @Values nvarchar(max), @Message nvarchar(max)

 

                --Verifier que le dossier est en cours

                IF NOT EXISTS(SELECT TOP 1 [ID Dossier] FROM TDossiers WHERE ([ID Dossier]=@Id_Dossier) AND ([Statut Dossier]=-1))

                BEGIN

                               SET @Message='FILE WAS NOT COMPLETED'

                               RAISERROR (@Message, 16, 1) WITH LOG;

                               RETURN

                END

 

                BEGIN TRY

                BEGIN TRANSACTION;

                               -- Effacement des ajustements du colisage base sur HS Code = '0'

                               UPDATE TColisageDossiers

                               SET [Ajustement Valeur]=0

                               WHERE [Dossier]=@Id_Dossier

 

                               --Suppression lignes de note de detail

                               DELETE A

                               FROM [dbo].[TNotesDetail] A INNER JOIN [dbo].[TColisageDossiers] B ON A.[Colisage Dossier]=B.[ID Colisage Dossier]

                               WHERE B.Dossier=@Id_Dossier

                              

                               -- SUPPRESSION de l'etape 1=> Operations Completed et recalcule de la derniere etape

                               DELETE dbo.TEtapesDossiers WHERE ([Dossier]=@Id_Dossier) AND ([Etape Dossier]=1)

                               EXEC [dbo].[pSP_RecalculeDerniereEtapeDossier] @Id_Dossier

 

                               -- SUPPRESSION DU LIEN DE LA CONVERTION AVEC LE DOSSIER ET RAMENER LE STATUT A EN COURS

                               UPDATE dbo.TDossiers SET [Convertion]=null, [Statut Dossier]=0 WHERE [ID Dossier] =@Id_Dossier

 

 

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

GO

/****** Object:  Trigger [dbo].[INSERT_TClients]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TRIGGER [dbo].[INSERT_TClients]

                ON [dbo].[TClients] AFTER INSERT

                AS

                               SET NOCOUNT ON;

 

                               INSERT INTO dbo.TRegimesClients ([Client]

           ,[Regime Declaration]

           ,[Session]

           ,[Date Creation])

                               SELECT A.[ID Client]

           ,B.[ID Regime Declaration]

           ,A.Session

           ,GETDATE()

                               FROM INSERTED A,

                                               (

                                                               SELECT [ID Regime Declaration]

                                                               FROM dbo.TRegimesDeclarations

                                                               WHERE ([Regime Douanier]=0) AND ([Taux Regime] IN (0,1,-1,-2))

                                               ) B

GO

ALTER TABLE [dbo].[TClients] ENABLE TRIGGER [INSERT_TClients]

GO

/****** Object:  Trigger [dbo].[INSERT_TClients$Entite_IF_ON_TEntites$ID Entite]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE TRIGGER [dbo].[INSERT_TClients$Entite_IF_ON_TEntites$ID Entite]

                ON [dbo].[TClients] FOR INSERT

                AS

                               SET NOCOUNT ON;

                               DECLARE @Values nvarchar(max), @Message nvarchar(max)

                               IF EXISTS(SELECT TOP 1 I.[Entite]

                                               FROM INSERTED I LEFT JOIN [TEntites] T

                                                               ON I.[Entite]=T.[ID Entite]

                                               WHERE (I.[Entite] IS NOT NULL) AND (T.[ID Entite] IS NULL))

                               BEGIN

                                               SET @Values=STUFF((SELECT DISTINCT ' ¤ '+[Entite] AS [text()]

                                               FROM INSERTED

                                               FOR XML PATH('') ),1,3,'')

                                               SET @Message='ERROR ON TRIGGER [INSERT_TClients$Entite_IF_ON_TEntites$ID Entite] Values:{' + @Values +'}'

                                               RAISERROR (@Message, 16, 1) WITH LOG;

                                               ROLLBACK TRANSACTION;

                                               RETURN

                               END

GO

ALTER TABLE [dbo].[TClients] ENABLE TRIGGER [INSERT_TClients$Entite_IF_ON_TEntites$ID Entite]

GO

/****** Object:  Trigger [dbo].[UPDATE_TClients$Entite_IF_ON_TEntites$ID Entite]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE TRIGGER [dbo].[UPDATE_TClients$Entite_IF_ON_TEntites$ID Entite]

                ON [dbo].[TClients] FOR UPDATE

                AS

                               SET NOCOUNT ON;

                               DECLARE @Values nvarchar(max), @Message nvarchar(max)

                               IF UPDATE ([Entite])

                                               AND EXISTS(SELECT TOP 1 I.[Entite]

                                                               FROM INSERTED I LEFT JOIN [TEntites] T

                                                                               ON I.[Entite]=T.[ID Entite]

                                                               WHERE (I.[Entite] IS NOT NULL) AND (T.[ID Entite] IS NULL))

                               BEGIN

                                               SET @Values=STUFF((SELECT DISTINCT ' ¤ '+[Entite] AS [text()]

                                               FROM INSERTED

                                               FOR XML PATH('') ),1,3,'')

                                               SET @Message='ERROR ON TRIGGER [UPDATE_TClients$Entite_IF_ON_TEntites$ID Entite] Values:{' + @Values +'}'

                                               RAISERROR (@Message, 16, 1) WITH LOG;

                                               ROLLBACK TRANSACTION;

                                               RETURN

                               END

GO

ALTER TABLE [dbo].[TClients] ENABLE TRIGGER [UPDATE_TClients$Entite_IF_ON_TEntites$ID Entite]

GO

/****** Object:  Trigger [dbo].[INSERT_TConvertions$Entite_IF_ON_TEntites$ID Entite]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE TRIGGER [dbo].[INSERT_TConvertions$Entite_IF_ON_TEntites$ID Entite]

                ON [dbo].[TConvertions] FOR INSERT

                AS

                               SET NOCOUNT ON;

                               DECLARE @Values nvarchar(max), @Message nvarchar(max)

                               IF EXISTS(SELECT TOP 1 I.[Entite]

                                               FROM INSERTED I LEFT JOIN [TEntites] T

                                                               ON I.[Entite]=T.[ID Entite]

                                               WHERE (I.[Entite] IS NOT NULL) AND (T.[ID Entite] IS NULL))

                               BEGIN

                                               SET @Values=STUFF((SELECT DISTINCT ' ¤ '+[Entite] AS [text()]

                                               FROM INSERTED

                                               FOR XML PATH('') ),1,3,'')

                                               SET @Message='ERROR ON TRIGGER [INSERT_TConvertions$Entite_IF_ON_TEntites$ID Entite] Values:{' + @Values +'}'

                                               RAISERROR (@Message, 16, 1) WITH LOG;

                                               ROLLBACK TRANSACTION;

                                               RETURN

                               END

GO

ALTER TABLE [dbo].[TConvertions] ENABLE TRIGGER [INSERT_TConvertions$Entite_IF_ON_TEntites$ID Entite]

GO

/****** Object:  Trigger [dbo].[UPDATE_TConvertions$Entite_IF_ON_TEntites$ID Entite]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE TRIGGER [dbo].[UPDATE_TConvertions$Entite_IF_ON_TEntites$ID Entite]

                ON [dbo].[TConvertions] FOR UPDATE

                AS

                               SET NOCOUNT ON;

                               DECLARE @Values nvarchar(max), @Message nvarchar(max)

                               IF UPDATE ([Entite])

                                               AND EXISTS(SELECT TOP 1 I.[Entite]

                                                               FROM INSERTED I LEFT JOIN [TEntites] T

                                                                               ON I.[Entite]=T.[ID Entite]

                                                               WHERE (I.[Entite] IS NOT NULL) AND (T.[ID Entite] IS NULL))

                               BEGIN

                                               SET @Values=STUFF((SELECT DISTINCT ' ¤ '+[Entite] AS [text()]

                                               FROM INSERTED

                                               FOR XML PATH('') ),1,3,'')

                                               SET @Message='ERROR ON TRIGGER [UPDATE_TConvertions$Entite_IF_ON_TEntites$ID Entite] Values:{' + @Values +'}'

                                               RAISERROR (@Message, 16, 1) WITH LOG;

                                               ROLLBACK TRANSACTION;

                                               RETURN

                               END

GO

ALTER TABLE [dbo].[TConvertions] ENABLE TRIGGER [UPDATE_TConvertions$Entite_IF_ON_TEntites$ID Entite]

GO

/****** Object:  Trigger [dbo].[INSERT_TDossiers]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE   TRIGGER [dbo].[INSERT_TDossiers]

ON [dbo].[TDossiers] AFTER INSERT

AS

                SET NOCOUNT ON;

 

                INSERT INTO dbo.TEtapesDossiers ([Dossier], [Etape Dossier], [Date Debut], [Date Fin])

                SELECT A.[ID Dossier], 0, cast(GETDATE() as date),  cast(GETDATE() as date)

                FROM INSERTED A

 

                Declare @i int =1

                Declare @imax int =0

                SELECT @imax=count(*) FROM INSERTED

                Declare @Dossier int

 

                WHILE (@i<=@imax)

                BEGIN

                               SELECT @Dossier=[ID Dossier] FROM INSERTED WHERE [ID Dossier]=@i

                               EXEC pSP_RecalculeDerniereEtapeDossier @Dossier

 

                               SET @i=@i+1

                END

GO

ALTER TABLE [dbo].[TDossiers] ENABLE TRIGGER [INSERT_TDossiers]

GO

/****** Object:  Trigger [dbo].[DELETE_TEntites$ID Entite_IF_NOT_IN_TClients$Entite]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TRIGGER [dbo].[DELETE_TEntites$ID Entite_IF_NOT_IN_TClients$Entite]

                ON [dbo].[TEntites] FOR DELETE

                AS

                               SET NOCOUNT ON;

                               DECLARE @Values nvarchar(max), @Message nvarchar(max)

                               IF EXISTS(SELECT TOP 1 T.[Entite]

                                               FROM DELETED D INNER JOIN [TClients] T

                                                               ON D.[ID Entite]=T.[Entite]

                                               WHERE D.[ID Entite] IS NOT NULL)

                               BEGIN

                                               SET @Values=STUFF((SELECT DISTINCT ' ¤ '+[ID Entite] AS [text()]

                                                               FROM DELETED

                                                               FOR XML PATH('') ),1,3,'')

                                                               SET @Message='ERROR ON TRIGGER [DELETE_TEntites$ID Entite_IF_NOT_IN_TClients$Entite] Values:{' + @Values +'}'

                                                               RAISERROR (@Message, 16, 1) WITH LOG;

                                               ROLLBACK TRANSACTION;

                                               RETURN

                               END

GO

ALTER TABLE [dbo].[TEntites] ENABLE TRIGGER [DELETE_TEntites$ID Entite_IF_NOT_IN_TClients$Entite]

GO

/****** Object:  Trigger [dbo].[DELETE_TEntites$ID Entite_IF_NOT_IN_TConvertions$Entite]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

CREATE TRIGGER [dbo].[DELETE_TEntites$ID Entite_IF_NOT_IN_TConvertions$Entite]

                ON [dbo].[TEntites] FOR DELETE

                AS

                               SET NOCOUNT ON;

                               DECLARE @Values nvarchar(max), @Message nvarchar(max)

                               IF EXISTS(SELECT TOP 1 T.[Entite]

                                               FROM DELETED D INNER JOIN [TConvertions] T

                                                               ON D.[ID Entite]=T.[Entite]

                                               WHERE D.[ID Entite] IS NOT NULL)

                               BEGIN

                                               SET @Values=STUFF((SELECT DISTINCT ' ¤ '+[ID Entite] AS [text()]

                                                               FROM DELETED

                                                               FOR XML PATH('') ),1,3,'')

                                                               SET @Message='ERROR ON TRIGGER [DELETE_TEntites$ID Entite_IF_NOT_IN_TConvertions$Entite] Values:{' + @Values +'}'

                                                               RAISERROR (@Message, 16, 1) WITH LOG;

                                               ROLLBACK TRANSACTION;

                                               RETURN

                               END

GO

ALTER TABLE [dbo].[TEntites] ENABLE TRIGGER [DELETE_TEntites$ID Entite_IF_NOT_IN_TConvertions$Entite]

GO

/****** Object:  Trigger [dbo].[UPDATE_TEntites$ID Entite_ON_TClients$Entite]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE TRIGGER [dbo].[UPDATE_TEntites$ID Entite_ON_TClients$Entite]

                ON [dbo].[TEntites] AFTER UPDATE

                AS

                               SET NOCOUNT ON;

                               IF UPDATE ([ID Entite])

                               BEGIN

                                               DECLARE @TmpInserted TABLE ([ID] int IDENTITY PRIMARY KEY, [Value] [nvarchar](10))

                                               INSERT INTO @TmpInserted ([Value]) SELECT [ID Entite] FROM INSERTED

                                              

                                               DECLARE @TmpDeleted TABLE ([ID] int IDENTITY PRIMARY KEY, [Value] [nvarchar](10))

                                               INSERT INTO @TmpDeleted ([Value]) SELECT [ID Entite] FROM DELETED

                                              

                                               DECLARE @Values nvarchar(max), @Message nvarchar(max)

 

                                               BEGIN TRY

                                                               UPDATE [TClients]

                                                               SET [Entite]=I.[Value]

                                                               FROM @TmpInserted I INNER JOIN @TmpDeleted D

                                                                               ON I.[ID]=D.[ID]

                                                               INNER JOIN [TClients] T

                                                                               ON D.[Value]=T.[Entite]

                                               END TRY

                                               BEGIN CATCH

                                                               SET @Values=STUFF((SELECT DISTINCT ' ¤ '+[ID Entite] AS [text()]

                                                               FROM INSERTED

                                                               FOR XML PATH('') ),1,3,'')

                                                               SET @Message='ERROR ON TRIGGER [UPDATE_TEntites$ID Entite_ON_TClients$Entite] Values:{' + @Values +'}'

                                                               RAISERROR (@Message, 16, 1) WITH LOG;

                                                               -- ERROR_MESSAGE() - ERROR_SEVERITY() - ERROR_STATE ()

                                                               ROLLBACK TRANSACTION;

                                                               RETURN

                                               END CATCH

                               END

GO

ALTER TABLE [dbo].[TEntites] ENABLE TRIGGER [UPDATE_TEntites$ID Entite_ON_TClients$Entite]

GO

/****** Object:  Trigger [dbo].[UPDATE_TEntites$ID Entite_ON_TConvertions$Entite]    Script Date: 16/02/2026 16:52:13 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE TRIGGER [dbo].[UPDATE_TEntites$ID Entite_ON_TConvertions$Entite]

                ON [dbo].[TEntites] AFTER UPDATE

                AS

                               SET NOCOUNT ON;

                               IF UPDATE ([ID Entite])

                               BEGIN

                                               DECLARE @TmpInserted TABLE ([ID] int IDENTITY PRIMARY KEY, [Value] [nvarchar](10))

                                               INSERT INTO @TmpInserted ([Value]) SELECT [ID Entite] FROM INSERTED

                                              

                                               DECLARE @TmpDeleted TABLE ([ID] int IDENTITY PRIMARY KEY, [Value] [nvarchar](10))

                                               INSERT INTO @TmpDeleted ([Value]) SELECT [ID Entite] FROM DELETED

                                              

                                               DECLARE @Values nvarchar(max), @Message nvarchar(max)

 

                                               BEGIN TRY

                                                               UPDATE [TConvertions]

                                                               SET [Entite]=I.[Value]

                                                               FROM @TmpInserted I INNER JOIN @TmpDeleted D

                                                                               ON I.[ID]=D.[ID]

                                                               INNER JOIN [TConvertions] T

                                                                               ON D.[Value]=T.[Entite]

                                               END TRY

                                               BEGIN CATCH

                                                               SET @Values=STUFF((SELECT DISTINCT ' ¤ '+[ID Entite] AS [text()]

                                                               FROM INSERTED

                                                               FOR XML PATH('') ),1,3,'')

                                                               SET @Message='ERROR ON TRIGGER [UPDATE_TEntites$ID Entite_ON_TConvertions$Entite] Values:{' + @Values +'}'

                                                               RAISERROR (@Message, 16, 1) WITH LOG;

                                                               -- ERROR_MESSAGE() - ERROR_SEVERITY() - ERROR_STATE ()

                                                               ROLLBACK TRANSACTION;

                                                               RETURN

                                               END CATCH

                               END

GO

ALTER TABLE [dbo].[TEntites] ENABLE TRIGGER [UPDATE_TEntites$ID Entite_ON_TConvertions$Entite]

GO

/****** Object:  Trigger [dbo].[DELETE_TEtapesDossiers]    Script Date: 16/02/2026 16:52:14 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE   TRIGGER [dbo].[DELETE_TEtapesDossiers]

                ON [dbo].[TEtapesDossiers] AFTER DELETE

                AS

                               SET NOCOUNT ON;

 

                DECLARE @Dossiers TABLE (ID int Identity (1,1), [Dossier] int NOT NULL PRIMARY KEY)

                INSERT INTO @Dossiers ([Dossier])

                SELECT DISTINCT [Dossier] FROM DELETED

 

                Declare @i int =1

                Declare @imax int =0

                SELECT @imax=count(*) FROM @Dossiers

                Declare @Dossier int

 

                WHILE (@i<=@imax)

                BEGIN

                               SELECT @Dossier=[Dossier] FROM @Dossiers WHERE ID=@i

                               EXEC pSP_RecalculeDerniereEtapeDossier @Dossier

 

                               SET @i=@i+1

                END

GO

ALTER TABLE [dbo].[TEtapesDossiers] ENABLE TRIGGER [DELETE_TEtapesDossiers]

GO

/****** Object:  Trigger [dbo].[INSERT_TEtapesDossiers]    Script Date: 16/02/2026 16:52:14 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE   TRIGGER [dbo].[INSERT_TEtapesDossiers]

ON [dbo].[TEtapesDossiers] AFTER INSERT

AS

                SET NOCOUNT ON;

 

                DECLARE @Dossiers TABLE (ID int Identity (1,1), [Dossier] int NOT NULL PRIMARY KEY)

                INSERT INTO @Dossiers ([Dossier])

                SELECT DISTINCT [Dossier] FROM INSERTED

 

                Declare @i int =1

                Declare @imax int =0

                SELECT @imax=count(*) FROM @Dossiers

                Declare @Dossier int

 

                WHILE (@i<=@imax)

                BEGIN

                               SELECT @Dossier=[Dossier] FROM @Dossiers WHERE ID=@i

                               EXEC pSP_RecalculeDerniereEtapeDossier @Dossier

 

                               SET @i=@i+1

                END

GO

ALTER TABLE [dbo].[TEtapesDossiers] ENABLE TRIGGER [INSERT_TEtapesDossiers]

GO

/****** Object:  Trigger [dbo].[UPDATE_TEtapesDossiers]    Script Date: 16/02/2026 16:52:14 ******/

SET ANSI_NULLS ON

GO

SET QUOTED_IDENTIFIER ON

GO

 

CREATE   TRIGGER [dbo].[UPDATE_TEtapesDossiers]

ON [dbo].[TEtapesDossiers] AFTER UPDATE

AS

                SET NOCOUNT ON;

 

                IF UPDATE ([Date Debut]) OR UPDATE ([Date Fin])

                BEGIN

 

                               DECLARE @Dossiers TABLE (ID int Identity (1,1), [Dossier] int NOT NULL PRIMARY KEY)

                               INSERT INTO @Dossiers ([Dossier])

                               SELECT DISTINCT [Dossier] FROM INSERTED

 

                               Declare @i int =1

                               Declare @imax int =0

                               SELECT @imax=count(*) FROM @Dossiers

                               Declare @Dossier int

 

                               WHILE (@i<=@imax)

                               BEGIN

                                               SELECT @Dossier=[Dossier] FROM @Dossiers WHERE ID=@i

                                               EXEC pSP_RecalculeDerniereEtapeDossier @Dossier

 

                                               SET @i=@i+1

                               END

                END

GO

ALTER TABLE [dbo].[TEtapesDossiers] ENABLE TRIGGER [UPDATE_TEtapesDossiers]

GO

-- INITIALISATION

Use SFX_PreDouane

GO

 

-- Devises

SET IDENTITY_INSERT TDevises ON;

INSERT INTO TDevises([ID Devise], [Code Devise], [Libelle Devise], [Decimales], [Devise Inactive])

VALUES (0,'','LOCAL CURRENCY',2, 0)

SET IDENTITY_INSERT TDevises OFF;

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AED','United Arab Emirates dirham',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AFN','Afghan afghani',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ALL','Albanian lek',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AMD','Armenian dram',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ANG','Netherlands Antillean guilder',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AOA','Angolan kwanza',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ARS','Argentine peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AUD','Australian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AWG','Aruban florin',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('AZN','Azerbaijani manat',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BAM','Bosnia and Herzegovina convertible mark',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BBD','Barbadian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BDT','Bangladeshi taka',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BGN','Bulgarian lev',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BHD','Bahraini dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BIF','Burundian franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BMD','Bermudian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BND','Brunei dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BOB','Bolivian boliviano',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BRL','Brazilian real',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BSD','Bahamian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BTN','Bhutanese ngultrum',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BWP','Botswana pula',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BYR','Belarusian ruble',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('BZD','Belize dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CAD','Canadian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CDF','Congolese franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CHF','Swiss franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CLP','Chilean peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CNY','Chinese yuan',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('COP','Colombian peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CRC','Costa Rican colón',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CUC','Cuban convertible peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CUP','Cuban peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CVE','Cape Verdean escudo',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('CZK','Czech koruna',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('DJF','Djiboutian franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('DKK','Danish krone',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('DOP','Dominican peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('DZD','Algerian dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('EGP','Egyptian pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ERN','Eritrean nakfa',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ETB','Ethiopian birr',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('EUR','Euro',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('FJD','Fijian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('FKP','Falkland Islands pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GBP','British pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GEL','Georgian lari',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GGP','Guernsey pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GHS','Ghana cedi',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GIP','Gibraltar pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GMD','Gambian dalasi',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GNF','Guinean franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GTQ','Guatemalan quetzal',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('GYD','Guyanese dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('HKD','Hong Kong dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('HNL','Honduran lempira',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('HRK','Croatian kuna',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('HTG','Haitian gourde',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('HUF','Hungarian forint',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('IDR','Indonesian rupiah',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ILS','Israeli new shekel',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('INR','Indian rupee',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('IQD','Iraqi dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('IRR','Iranian rial',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ISK','Icelandic króna',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('JMD','Jamaican dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('JOD','Jordanian dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('JPY','Japanese yen',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KES','Kenyan shilling',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KGS','Kyrgyzstani som',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KHR','Cambodian riel',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KMF','Comorian franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KPW','North Korean won',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KRW','South Korean won',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KWD','Kuwaiti dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KYD','Cayman Islands dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('KZT','Kazakhstani tenge',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('LAK','Lao kip',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('LBP','Lebanese pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('LKR','Sri Lankan rupee',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('LRD','Liberian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('LSL','Lesotho loti',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('LYD','Libyan dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MAD','Moroccan dirham',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MDL','Moldovan leu',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MGA','Malagasy ariary',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MKD','Macedonian denar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MMK','Burmese kyat',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MNT','Mongolian tögrög',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MOP','Macanese pataca',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MRO','Mauritanian ouguiya',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MUR','Mauritian rupee',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MVR','Maldivian rufiyaa',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MWK','Malawian kwacha',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MXN','Mexican peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MYR','Malaysian ringgit',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('MZN','Mozambican metical',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('NAD','Namibian dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('NGN','Nigerian naira',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('NIO','Nicaraguan córdoba',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('NOK','Norwegian krone',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('none','Abkhazian apsar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('NPR','Nepalese rupee',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('NZD','New Zealand dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('OMR','Omani rial',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PAB','Panamanian balboa',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PEN','Peruvian nuevo sol',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PGK','Papua New Guinean kina',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PHP','Philippine peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PKR','Pakistani rupee',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PLN','Polish złoty',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('PYG','Paraguayan guaraní',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('QAR','Qatari riyal',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('RON','Romanian leu',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('RSD','Serbian dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('RUB','Russian ruble',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('RWF','Rwandan franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SAR','Saudi riyal',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SBD','Solomon Islands dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SCR','Seychellois rupee',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SDG','Sudanese pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SEK','Swedish krona',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SGD','Singapore dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SHP','Saint Helena pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SLL','Sierra Leonean leone',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SOS','Somali shilling',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SRD','Surinamese dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SSP','South Sudanese pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('STD','São Tomé and Príncipe dobra',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SYP','Syrian pound',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('SZL','Swazi lilangeni',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('THB','Thai baht',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TJS','Tajikistani somoni',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TMT','Turkmenistan manat',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TND','Tunisian dinar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TOP','Tongan paʻanga',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TRY','Turkish lira',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TTD','Trinidad and Tobago dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TWD','New Taiwan dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('TZS','Tanzanian shilling',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('UAH','Ukrainian hryvnia',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('UGX','Ugandan shilling',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('USD','United States dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('UYU','Uruguayan peso',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('UZS','Uzbekistani som',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('VEF','Venezuelan bolívar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('VND','Vietnamese đồng',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('VUV','Vanuatu vatu',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('WST','Samoan tālā',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('XAF','Central African CFA franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('XCD','East Caribbean dollar',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('XOF','West African CFA franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('XPF','CFP franc',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('YER','Yemeni rial',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ZAR','South African rand',2)

INSERT INTO TDevises([Code Devise], [Libelle Devise], [Decimales]) VALUES ('ZMW','Zambian kwacha',2)

 

-- Pays

SET IDENTITY_INSERT TPays ON;

INSERT INTO TPays([ID Pays], [Code Pays] ,[Libelle Pays], [Devise Locale])

VALUES (0,'', 'DEFAULT COUNTRY',0)

SET IDENTITY_INSERT TPays OFF;

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AD','Andorra',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AE','United Arab Emirates',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AG','Antigua',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AI','Anguilla',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AL','Albania',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AM','Armenia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AN','Netherlands Antilles',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AO','Angola',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AR','Argentina',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AS','American Samoa',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AT','Austria',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AU','Australia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AW','Aruba',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('AZ','Azerbaijan',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BB','Barbados',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BD','Bangladesh',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BE','Belgium',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BF','Burkino Faso',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BG','Bulgaria',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BH','Bahrain',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BI','Burundi',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BJ','Benin',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BM','Bermuda',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BN','Brunei',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BO','Bolivia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BR','Brazil',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BS','Bahamas',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BT','Bhutan',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BW','Botswana',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BY','Belarus',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('BZ','Belize',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CA','Canada',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CD','Congo, The Republic of',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CF','Central African',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CG','Congo',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CH','Switzerland',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CI','Ivory Coast',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CK','Cook Islands',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CL','Chile',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CM','Cameroon',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CN','China',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CO','Colombia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CR','Costa Rica',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CV','Cape Verde',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CY','Cyprus',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('CZ','Czech Republic',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('DE','Germany',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('DJ','Djibouti',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('DK','Denmark',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('DM','Dominica',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('DO','Dominican Republic',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('DZ','Algeria',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('EC','Ecuador',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('EE','Estonia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('EG','Egypt',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('ER','Eritrea',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('ES','Spain',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('ET','Ethiopia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('FI','Finland',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('FJ','Fiji',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('FM','Micronesia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('FO','Faeroe Islands',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('FR','France',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GA','Gabon',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GB','United Kingdom',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GD','Grenada',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GE','Georgia, Republic of',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GF','French Guiana',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GH','Ghana',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GI','Gibraltar',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GL','Greenland',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GM','Gambia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GN','Guinea',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GP','Guadeloupe',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GQ','Equatorial Guinea',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GR','Greece',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GT','Guatemala',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GU','Guam',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GW','Guinea-Bissau',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('GY','Guyana',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('HK','Hong Kong',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('HN','Honduras',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('HR','Croatia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('HT','Haiti',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('HU','Hungary',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('ID','Indonesia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('IE','Ireland',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('IL','Israel',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('IN','India',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('IS','Iceland',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('IT','Italy',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('JM','Jamaica',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('JO','Jordan',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('JP','Japan',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('KE','Kenya',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('KG','Kyrgyzstan',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('KH','Cambodia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('KN','St. Kitts & Nevis',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('KR','South Korea',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('KW','Kuwait',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('KY','Cayman Islands',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('KZ','Kazakhstan',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('LB','Lebanon',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('LC','St. Lucia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('LI','Liechtenstein',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('LK','Sri Lanka',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('LS','Lesotho',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('LT','Lithuania',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('LU','Luxembourg',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('LV','Latvia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MA','Morocco',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MC','Monaco',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MD','Moldova',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MG','Madagascar',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MH','Marshall Islands',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MK','Macedonia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('ML','Mali',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MM','Burma (Myanmar)',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MN','Mongolia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MO','Macau',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MP','Saipan',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MQ','Martinique',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MR','Mauritania',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MS','Montserrat',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MT','Malta',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MU','Mauritius',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MV','Maldives',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MW','Malawi',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MX','Mexico',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MY','Malaysia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('MZ','Mozambique',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('NA','Namibia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('NC','New Caledonia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('NE','Niger',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('NG','Nigeria',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('NI','Nicaragua',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('NL','Netherlands',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('NO','Norway',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('NP','Nepal',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('NZ','New Zealand',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('OM','Oman',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('PA','Panama',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('PE','Peru',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('PF','French Polynesia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('PG','Papua New Guinea',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('PH','Philippines',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('PK','Pakistan',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('PL','Poland',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('PR','Puerto Rico',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('PT','Portugal',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('PW','Palau',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('PY','Paraguay',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('QA','Qatar',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('RE','Reunion Island',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('RO','Romania',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('RU','Russia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('RW','Rwanda',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SA','Saudi Arabia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SC','Seychelles',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SE','Sweden',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SG','Singapore',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SI','Slovenia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SK','Slovak Republic',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SL','Sierra Leone',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SM','San Marino',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SN','Senegal',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SR','Suriname',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SV','El Salvador',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SY','Syria',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('SZ','Swaziland',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('TC','Turks & Caicos Is.',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('TD','Chad',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('TG','Togo',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('TH','Thailand',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('TM','Turkmenistan, Republic of',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('TN','Tunisia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('TR','Turkey',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('TT','Trinidad & Tobago',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('TW','Taiwan',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('TZ','Tanzania',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('UA','Ukraine',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('UG','Uganda',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('UM','United States Minor Outlying Islands',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('US','U.S.A.',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('UY','Uruguay',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('UZ','Uzbekistan',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('VA','Vatican City',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('VC','St. Vincent',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('VE','Venezuela',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('VG','British Virgin Is.',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('VI','U.S. Virgin Islands',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('VN','Vietnam',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('VU','Vanuatu',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('WF','Wallis & Futuna Islands',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('YE','Yemen',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('ZA','South Africa',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('ZM','Zambia',0)

INSERT INTO TPays ([Code Pays], [Libelle Pays],[Devise Locale]) VALUES ('ZW','Zimbabwe',0)

 

 

-- Groupes Entites

SET IDENTITY_INSERT TGroupesEntites ON;

INSERT INTO TGroupesEntites([ID Groupe Entite], [Nom Groupe Entite])

VALUES (0,'DEFAULT GROUP')

SET IDENTITY_INSERT TGroupesEntites OFF;

 

-- Entites

SET IDENTITY_INSERT TEntites ON;

INSERT INTO TEntites([ID Entite], [Code Entite] , [Nom Entite], [Groupe Entite], [Pays])

VALUES (0,'','DEFAULT ENTITY', 0,0)

SET IDENTITY_INSERT TEntites OFF;

 

-- Branches

SET IDENTITY_INSERT TBranches ON;

INSERT INTO TBranches([ID Branche], [Code Branche] , [Nom Branche], [Entite])

VALUES (0,'','DEFAULT BRANCH', 0)

SET IDENTITY_INSERT TBranches OFF;

 

 

 

-- Modes Transport

INSERT INTO TModesTransport([ID Mode Transport], [Libelle Mode Transport])

VALUES (1,'Sea')

                ,(2,'Air')

                ,(3,'Road')

                ,(9,'Other')

 

-- Sens Trafic

INSERT INTO TSensTrafic([ID Sens Trafic], [Libelle Sens Trafic])

VALUES (1,'Import')

                ,(2,'Export')

 

-- Types Dossiers

INSERT INTO TTypesDossiers([Libelle Type Dossier], [Mode Transport], [Sens Trafic])

VALUES ('Sea Import',1,1)

                ,('Sea Export',1,2)

                ,('Air Import',2,1)

                ,('Air Export',2,2)

                ,('Road Import',3,1)

                ,('Road Export',3,2)

 

--Regimes Douaniers

SET IDENTITY_INSERT TRegimesDouaniers ON;

INSERT INTO TRegimesDouaniers([ID Regime Douanier], [Code Regime Douanier] ,[Libelle Regime Douanier])

VALUES (0,'', '-')

SET IDENTITY_INSERT TRegimesDouaniers OFF;

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM4','Mise à la consommation')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('DS1','Déclaration Simplifiée à l''Exportation')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('DS4','Déclaration Simplifiée à  l''Importation')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX1','Exportation définitive ou en simple sortie')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX2','Exportation temporaire')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX3','Réexportation')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX7','Mise en entrepôt d''une marchandise nationale à exporter')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX8','Transit national ou communautaire d''une marchandise à exporter')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX9','Autres procédures (avitaillement, comptoirs de vente,...)')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('EX-9','Avitaillement')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM0','Mise en libre pratique')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM5','Admission et Importation temporaires')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM6','Réimportation')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM7','Mise en entrepôt d''une marchandise importée')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM8','Transit national, communautaire ou international et transbordement ')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('IM9','Autres procédures (admission temporaire pour transformation sous douane,...)')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('LO1','Liquidation d''Office à  l''Exportation')

INSERT INTO TRegimesDouaniers ([Code Regime Douanier], [Libelle Regime Douanier]) VALUES ('LO4','Liquidation d''Office à l''Importation')

 

 

-- Regimes declarations

SET IDENTITY_INSERT TRegimesDeclarations ON;

INSERT INTO TRegimesDeclarations([ID Regime Declaration], [Regime Douanier] ,[Libelle Regime Declaration], [Taux Regime])

VALUES (0,0, 'EXO',0)

SET IDENTITY_INSERT TRegimesDeclarations OFF;

INSERT INTO TRegimesDeclarations([Regime Douanier] ,[Libelle Regime Declaration], [Taux Regime])

VALUES (0, '100% DC',1)

SET IDENTITY_INSERT TRegimesDeclarations OFF;

INSERT INTO TRegimesDeclarations([Regime Douanier] ,[Libelle Regime Declaration], [Taux Regime])

VALUES (0, '100% TR',-1)

SET IDENTITY_INSERT TRegimesDeclarations OFF;

INSERT INTO TRegimesDeclarations([Regime Douanier] ,[Libelle Regime Declaration], [Taux Regime])

VALUES (0, 'TTC',-2)

 

 

-- HS Codes

SET IDENTITY_INSERT THSCodes ON;

INSERT INTO THSCodes([ID HS Code], [HS Code] , [Libelle HS Code])

VALUES (0,'0','NO HS CODE')

SET IDENTITY_INSERT THSCodes OFF;

 

 

-- Codes etapes

SET IDENTITY_INSERT TCodesEtapes ON;

INSERT INTO TCodesEtapes ([ID Code Etape], [Libelle Etape], [Circuit Etape],[Suivi Duree], [Index Etape])

VALUES (0,'File Opening','',0,0)

SET IDENTITY_INSERT TCodesEtapes OFF;

INSERT INTO TCodesEtapes ([Libelle Etape], [Circuit Etape],[Suivi Duree], [Index Etape])

VALUES ('Operations Completed','',0,1000000)

 

--Utilisateurs

SET IDENTITY_INSERT TUtilisateurs ON;

INSERT INTO TUtilisateurs ([ID Utilisateur], [Code Utilisateur],[Nom Utilisateur])

VALUES (0,'','SYSTEM')

SET IDENTITY_INSERT TUtilisateurs OFF;

 

--Sessions

SET IDENTITY_INSERT TSessions ON;

INSERT INTO TSessions ([ID Session], [Utilisateur])

VALUES (0,0)

SET IDENTITY_INSERT TSessions OFF;

 

-- Permissions Base

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (0,'Permission 0',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (1,'Permission 1',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (2,'Permission 2',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (3,'Permission 3',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (4,'Permission 4',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (5,'Permission 5',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (6,'Permission 6',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (7,'Permission 7',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (8,'Permission 8',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (9,'Permission 9',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (10,'Permission 10',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (11,'Permission 11',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (12,'Permission 12',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (13,'Permission 13',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (14,'Permission 14',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (15,'Permission 15',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (16,'Permission 16',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (17,'Permission 17',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (18,'Permission 18',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (19,'Permission 19',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (20,'Permission 20',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (21,'Permission 21',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (22,'Permission 22',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (23,'Permission 23',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (24,'Permission 24',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (25,'Permission 25',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (26,'Permission 26',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (27,'Permission 27',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (28,'Permission 28',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (29,'Permission 29',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (30,'Permission 30',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (31,'Permission 31',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (32,'Permission 32',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (33,'Permission 33',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (34,'Permission 34',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (35,'Permission 35',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (36,'Permission 36',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (37,'Permission 37',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (38,'Permission 38',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (39,'Permission 39',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (40,'Permission 40',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (41,'Permission 41',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (42,'Permission 42',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (43,'Permission 43',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (44,'Permission 44',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (45,'Permission 45',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (46,'Permission 46',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (47,'Permission 47',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (48,'Permission 48',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (49,'Permission 49',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (50,'Permission 50',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (51,'Permission 51',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (52,'Permission 52',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (53,'Permission 53',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (54,'Permission 54',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (55,'Permission 55',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (56,'Permission 56',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (57,'Permission 57',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (58,'Permission 58',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (59,'Permission 59',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (60,'Permission 60',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (61,'Permission 61',0)

INSERT INTO TPermissionsBase ([ID Permission Base], [Libelle Permission], [Permission Active]) VALUES (62,'Permission 62',0)

 

-- Roles

SET IDENTITY_INSERT TRoles ON;

INSERT INTO TRoles([ID Role], [Libelle Role])

VALUES (0,'SYSTEM')

SET IDENTITY_INSERT TRoles OFF;

 

-- Permissions Roles

INSERT INTO TPermissonsRoles ([Role], [Permission])

SELECT 0, [ID Permission Base]

FROM TPermissionsBase

 

-- Roles Utilisateur

INSERT INTO TRolesUtilisateurs ([Utilisateur], [Role])

VALUES (0,0)

 

INSERT INTO TStatutsDossier ([ID Statut Dossier],[Libelle Statut Dossier])

VALUES (0,'Operations in progress')

                ,(-1,'Operations completed')

                ,(-2,'File Cancelled')