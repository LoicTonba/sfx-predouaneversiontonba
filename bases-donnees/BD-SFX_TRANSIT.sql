/*    ==Paramètres de script==

    Version du serveur source : SQL Server 2022 (16.0.1160)
    Édition du moteur de base de données source : Microsoft SQL Server Édition Entreprise
    Type du moteur de base de données source : SQL Server autonome

    Version du serveur cible : SQL Server 2022
    Édition du moteur de base de données cible : Microsoft SQL Server Édition Entreprise
    Type du moteur de base de données cible : SQL Server autonome
*/

USE [SFX_TRANSIT]
GO
/****** Object:  Schema [security]    Script Date: 20/11/2025 18:46:39 ******/
CREATE SCHEMA [security]
GO
/****** Object:  Schema [transit]    Script Date: 20/11/2025 18:46:39 ******/
CREATE SCHEMA [transit]
GO
/****** Object:  Table [security].[User]    Script Date: 20/11/2025 18:46:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [security].[User](
	[UserId] [uniqueidentifier] NOT NULL,
	[Username] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[DisplayName] [nvarchar](200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Email] [nvarchar](200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RoleUser] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
 CONSTRAINT [PK__User__1788CC4C625F847D] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ__User__536C85E42A912946] UNIQUE NONCLUSTERED 
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [transit].[Client]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[Client](
	[ClientId] [uniqueidentifier] NOT NULL,
	[Nom] [nvarchar](200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TaxId] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Pays] [char](2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Adresse] [nvarchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Telephone] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Email] [nvarchar](200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DateCreation] [datetime2](7) NOT NULL,
 CONSTRAINT [PK__Client__E67E1A24BAEA3BE6] PRIMARY KEY CLUSTERED 
(
	[ClientId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [transit].[Colisage]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[Colisage](
	[ColisageId] [uniqueidentifier] NOT NULL,
	[OrderTransitId] [uniqueidentifier] NOT NULL,
	[RegimeId] [uniqueidentifier] NULL,
	[HscodeId] [uniqueidentifier] NULL,
	[InvoiceNumber] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Division] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PoidsNet] [decimal](18, 3) NULL,
	[PoidsBrut] [decimal](18, 3) NULL,
	[PaysOrigine] [char](2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Quantite] [decimal](18, 3) NULL,
	[DeviseFacture] [nvarchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Montant] [decimal](18, 2) NOT NULL,
 CONSTRAINT [PK__Colisage__ABECD0BDC212AE87] PRIMARY KEY CLUSTERED 
(
	[ColisageId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [transit].[Declaration]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[Declaration](
	[DeclarationId] [uniqueidentifier] NOT NULL,
	[OrderTransitId] [uniqueidentifier] NOT NULL,
	[NumeroDeclaration] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[DateDeclaration] [datetime2](7) NOT NULL,
	[Statut] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
 CONSTRAINT [PK__Declarat__B4AA37DF53E6D0D1] PRIMARY KEY CLUSTERED 
(
	[DeclarationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [transit].[Devise]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[Devise](
	[DeviseId] [uniqueidentifier] NOT NULL,
	[Code] [nvarchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Nom] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Symbole] [nvarchar](5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
 CONSTRAINT [PK__Devise__4AC2DE4EC32433E8] PRIMARY KEY CLUSTERED 
(
	[DeviseId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ__Devise__A25C5AA7E54DB613] UNIQUE NONCLUSTERED 
(
	[Code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [transit].[Etape]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[Etape](
	[EtapeId] [uniqueidentifier] NOT NULL,
	[Code] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Libelle] [nvarchar](200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Ordre] [int] NOT NULL,
 CONSTRAINT [PK__Etape__41DF11E7EEBD5E0E] PRIMARY KEY CLUSTERED 
(
	[EtapeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ__Etape__A25C5AA705503F90] UNIQUE NONCLUSTERED 
(
	[Code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [transit].[Hscode]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[Hscode](
	[HscodeId] [uniqueidentifier] NOT NULL,
	[Code] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Libelle] [nvarchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
 CONSTRAINT [PK__Hscode__ECFCDC121AE1D570] PRIMARY KEY CLUSTERED 
(
	[HscodeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ__Hscode__A25C5AA7817B3775] UNIQUE NONCLUSTERED 
(
	[Code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [transit].[OrderTransit]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[OrderTransit](
	[OrderTransitId] [uniqueidentifier] NOT NULL,
	[ClientId] [uniqueidentifier] NOT NULL,
	[OrderReference] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[OperationType] [nvarchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CustomsRegime] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DescriptionOT] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[StatusOT] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CreatedBy] [uniqueidentifier] NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NULL,
	[LastEtapeId] [uniqueidentifier] NULL,
 CONSTRAINT [PK__OrderTra__E97BA62CC16A3CDA] PRIMARY KEY CLUSTERED 
(
	[OrderTransitId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [transit].[Regime]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[Regime](
	[RegimeId] [uniqueidentifier] NOT NULL,
	[Code] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Libelle] [nvarchar](200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PourcentageDC] [decimal](5, 2) NOT NULL,
	[PourcentageTR] [decimal](5, 2) NOT NULL,
 CONSTRAINT [PK__Regime__B8947F985D6613A3] PRIMARY KEY CLUSTERED 
(
	[RegimeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ__Regime__A25C5AA768EB929D] UNIQUE NONCLUSTERED 
(
	[Code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [transit].[RegimeClient]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[RegimeClient](
	[RegimeId] [uniqueidentifier] NOT NULL,
	[ClientId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK__RegimeCl__E6F39E3AE905E9FC] PRIMARY KEY CLUSTERED 
(
	[RegimeId] ASC,
	[ClientId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [transit].[RegimeColisage]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[RegimeColisage](
	[RegimeColisageId] [uniqueidentifier] NOT NULL,
	[ColisageId] [uniqueidentifier] NOT NULL,
	[PoidsNet] [decimal](18, 3) NULL,
	[PoidsBrut] [decimal](18, 3) NULL,
	[Montant] [decimal](18, 2) NULL,
	[Volume] [decimal](18, 3) NULL,
	[Quantite] [decimal](18, 3) NULL,
	[DeviseLocale] [nvarchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
 CONSTRAINT [PK__RegimeCo__72B6CA646EF94734] PRIMARY KEY CLUSTERED 
(
	[RegimeColisageId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [transit].[SuiviEtape]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[SuiviEtape](
	[SuiviId] [uniqueidentifier] NOT NULL,
	[OrderTransitId] [uniqueidentifier] NOT NULL,
	[EtapeId] [uniqueidentifier] NOT NULL,
	[DateDebut] [datetime2](7) NOT NULL,
	[DateFin] [datetime2](7) NULL,
	[Statut] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
 CONSTRAINT [PK__SuiviEta__E51F570433A5E746] PRIMARY KEY CLUSTERED 
(
	[SuiviId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [transit].[TauxEchange]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[TauxEchange](
	[TauxEchangeId] [uniqueidentifier] NOT NULL,
	[DeviseId] [uniqueidentifier] NOT NULL,
	[DateTaux] [date] NOT NULL,
	[Valeur] [decimal](18, 6) NOT NULL,
 CONSTRAINT [PK__TauxEcha__FDBA8B85B57C3C9E] PRIMARY KEY CLUSTERED 
(
	[TauxEchangeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [transit].[UserClient]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [transit].[UserClient](
	[UserId] [uniqueidentifier] NOT NULL,
	[ClientId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK__UserClie__49EF2DEE03A3C3EB] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC,
	[ClientId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [security].[User] ADD  CONSTRAINT [DF__User__UserId__403A8C7D]  DEFAULT (newid()) FOR [UserId]
GO
ALTER TABLE [security].[User] ADD  CONSTRAINT [DF__User__CreatedAt__412EB0B6]  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO
ALTER TABLE [transit].[Client] ADD  CONSTRAINT [DF__Client__ClientId__3B75D760]  DEFAULT (newid()) FOR [ClientId]
GO
ALTER TABLE [transit].[Client] ADD  CONSTRAINT [DF__Client__DateCrea__3C69FB99]  DEFAULT (sysutcdatetime()) FOR [DateCreation]
GO
ALTER TABLE [transit].[Colisage] ADD  CONSTRAINT [DF__Colisage__Colisa__6A30C649]  DEFAULT (newid()) FOR [ColisageId]
GO
ALTER TABLE [transit].[Colisage] ADD  CONSTRAINT [DF__Colisage__Montan__14270015]  DEFAULT ((0.00)) FOR [Montant]
GO
ALTER TABLE [transit].[Declaration] ADD  CONSTRAINT [DF__Declarati__Decla__76969D2E]  DEFAULT (newid()) FOR [DeclarationId]
GO
ALTER TABLE [transit].[Declaration] ADD  CONSTRAINT [DF__Declarati__DateD__778AC167]  DEFAULT (sysutcdatetime()) FOR [DateDeclaration]
GO
ALTER TABLE [transit].[Devise] ADD  CONSTRAINT [DF__Devise__DeviseId__7C4F7684]  DEFAULT (newid()) FOR [DeviseId]
GO
ALTER TABLE [transit].[Etape] ADD  CONSTRAINT [DF__Etape__EtapeId__60A75C0F]  DEFAULT (newid()) FOR [EtapeId]
GO
ALTER TABLE [transit].[Hscode] ADD  CONSTRAINT [DF__Hscode__HscodeId__73BA3083]  DEFAULT (newid()) FOR [HscodeId]
GO
ALTER TABLE [transit].[OrderTransit] ADD  CONSTRAINT [DF__OrderTran__Order__4E88ABD4]  DEFAULT (newid()) FOR [OrderTransitId]
GO
ALTER TABLE [transit].[OrderTransit] ADD  CONSTRAINT [DF__OrderTran__Statu__4F7CD00D]  DEFAULT ('En attente') FOR [StatusOT]
GO
ALTER TABLE [transit].[OrderTransit] ADD  CONSTRAINT [DF__OrderTran__Creat__5070F446]  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO
ALTER TABLE [transit].[Regime] ADD  CONSTRAINT [DF__Regime__RegimeId__5629CD9C]  DEFAULT (newid()) FOR [RegimeId]
GO
ALTER TABLE [transit].[RegimeColisage] ADD  CONSTRAINT [DF__RegimeCol__Regim__6EF57B66]  DEFAULT (newid()) FOR [RegimeColisageId]
GO
ALTER TABLE [transit].[SuiviEtape] ADD  CONSTRAINT [DF__SuiviEtap__Suivi__6383C8BA]  DEFAULT (newid()) FOR [SuiviId]
GO
ALTER TABLE [transit].[SuiviEtape] ADD  CONSTRAINT [DF__SuiviEtap__DateD__6477ECF3]  DEFAULT (sysutcdatetime()) FOR [DateDebut]
GO
ALTER TABLE [transit].[SuiviEtape] ADD  CONSTRAINT [DF__SuiviEtap__Statu__656C112C]  DEFAULT ('En cours') FOR [Statut]
GO
ALTER TABLE [transit].[TauxEchange] ADD  CONSTRAINT [DF__TauxEchan__TauxE__03F0984C]  DEFAULT (newid()) FOR [TauxEchangeId]
GO
ALTER TABLE [transit].[Colisage]  WITH CHECK ADD  CONSTRAINT [FK__Colisage__OrderT__6B24EA82] FOREIGN KEY([OrderTransitId])
REFERENCES [transit].[OrderTransit] ([OrderTransitId])
GO
ALTER TABLE [transit].[Colisage] CHECK CONSTRAINT [FK__Colisage__OrderT__6B24EA82]
GO
ALTER TABLE [transit].[Colisage]  WITH CHECK ADD  CONSTRAINT [FK__Colisage__Regime__6C190EBB] FOREIGN KEY([RegimeId])
REFERENCES [transit].[Regime] ([RegimeId])
GO
ALTER TABLE [transit].[Colisage] CHECK CONSTRAINT [FK__Colisage__Regime__6C190EBB]
GO
ALTER TABLE [transit].[Declaration]  WITH CHECK ADD  CONSTRAINT [FK__Declarati__Order__787EE5A0] FOREIGN KEY([OrderTransitId])
REFERENCES [transit].[OrderTransit] ([OrderTransitId])
GO
ALTER TABLE [transit].[Declaration] CHECK CONSTRAINT [FK__Declarati__Order__787EE5A0]
GO
ALTER TABLE [transit].[OrderTransit]  WITH CHECK ADD  CONSTRAINT [FK_OrderTransit_Client] FOREIGN KEY([ClientId])
REFERENCES [transit].[Client] ([ClientId])
GO
ALTER TABLE [transit].[OrderTransit] CHECK CONSTRAINT [FK_OrderTransit_Client]
GO
ALTER TABLE [transit].[OrderTransit]  WITH CHECK ADD  CONSTRAINT [FK_OrderTransit_User] FOREIGN KEY([CreatedBy])
REFERENCES [security].[User] ([UserId])
GO
ALTER TABLE [transit].[OrderTransit] CHECK CONSTRAINT [FK_OrderTransit_User]
GO
ALTER TABLE [transit].[RegimeClient]  WITH CHECK ADD  CONSTRAINT [FK__RegimeCli__Clien__5CD6CB2B] FOREIGN KEY([ClientId])
REFERENCES [transit].[Client] ([ClientId])
GO
ALTER TABLE [transit].[RegimeClient] CHECK CONSTRAINT [FK__RegimeCli__Clien__5CD6CB2B]
GO
ALTER TABLE [transit].[RegimeClient]  WITH CHECK ADD  CONSTRAINT [FK__RegimeCli__Regim__5BE2A6F2] FOREIGN KEY([RegimeId])
REFERENCES [transit].[Regime] ([RegimeId])
GO
ALTER TABLE [transit].[RegimeClient] CHECK CONSTRAINT [FK__RegimeCli__Regim__5BE2A6F2]
GO
ALTER TABLE [transit].[RegimeColisage]  WITH CHECK ADD  CONSTRAINT [FK__RegimeCol__Colis__6FE99F9F] FOREIGN KEY([ColisageId])
REFERENCES [transit].[Colisage] ([ColisageId])
GO
ALTER TABLE [transit].[RegimeColisage] CHECK CONSTRAINT [FK__RegimeCol__Colis__6FE99F9F]
GO
ALTER TABLE [transit].[SuiviEtape]  WITH CHECK ADD  CONSTRAINT [FK__SuiviEtap__Etape__6754599E] FOREIGN KEY([EtapeId])
REFERENCES [transit].[Etape] ([EtapeId])
GO
ALTER TABLE [transit].[SuiviEtape] CHECK CONSTRAINT [FK__SuiviEtap__Etape__6754599E]
GO
ALTER TABLE [transit].[SuiviEtape]  WITH CHECK ADD  CONSTRAINT [FK__SuiviEtap__Order__66603565] FOREIGN KEY([OrderTransitId])
REFERENCES [transit].[OrderTransit] ([OrderTransitId])
GO
ALTER TABLE [transit].[SuiviEtape] CHECK CONSTRAINT [FK__SuiviEtap__Order__66603565]
GO
ALTER TABLE [transit].[TauxEchange]  WITH CHECK ADD  CONSTRAINT [FK__TauxEchan__Devis__04E4BC85] FOREIGN KEY([DeviseId])
REFERENCES [transit].[Devise] ([DeviseId])
GO
ALTER TABLE [transit].[TauxEchange] CHECK CONSTRAINT [FK__TauxEchan__Devis__04E4BC85]
GO
ALTER TABLE [transit].[UserClient]  WITH CHECK ADD  CONSTRAINT [FK__UserClien__Clien__44FF419A] FOREIGN KEY([ClientId])
REFERENCES [transit].[Client] ([ClientId])
GO
ALTER TABLE [transit].[UserClient] CHECK CONSTRAINT [FK__UserClien__Clien__44FF419A]
GO
ALTER TABLE [transit].[UserClient]  WITH CHECK ADD  CONSTRAINT [FK__UserClien__UserI__440B1D61] FOREIGN KEY([UserId])
REFERENCES [security].[User] ([UserId])
GO
ALTER TABLE [transit].[UserClient] CHECK CONSTRAINT [FK__UserClien__UserI__440B1D61]
GO
ALTER TABLE [transit].[Regime]  WITH CHECK ADD  CONSTRAINT [CK__Regime__Pourcent__571DF1D5] CHECK  (([PourcentageDC]>=(0) AND [PourcentageDC]<=(1)))
GO
ALTER TABLE [transit].[Regime] CHECK CONSTRAINT [CK__Regime__Pourcent__571DF1D5]
GO
ALTER TABLE [transit].[Regime]  WITH CHECK ADD  CONSTRAINT [CK__Regime__Pourcent__5812160E] CHECK  (([PourcentageTR]>=(0) AND [PourcentageTR]<=(1)))
GO
ALTER TABLE [transit].[Regime] CHECK CONSTRAINT [CK__Regime__Pourcent__5812160E]
GO
ALTER TABLE [transit].[Regime]  WITH CHECK ADD  CONSTRAINT [CK_Regime_Total] CHECK  ((([PourcentageDC]+[PourcentageTR])=(1)))
GO
ALTER TABLE [transit].[Regime] CHECK CONSTRAINT [CK_Regime_Total]
GO
/****** Object:  Trigger [transit].[TR_UpdateLastEtape]    Script Date: 20/11/2025 18:46:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [transit].[TR_UpdateLastEtape]
ON [transit].[SuiviEtape]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE OT
    SET LastEtapeId = S.EtapeId
    FROM [transit].OrderTransit OT
    INNER JOIN (
        SELECT OrderTransitId, EtapeId
        FROM [transit].SuiviEtape S1
        WHERE DateDebut = (
            SELECT MAX(DateDebut)
            FROM [transit].SuiviEtape S2
            WHERE S2.OrderTransitId = S1.OrderTransitId
        )
    ) S
    ON OT.OrderTransitId = S.OrderTransitId;
END
GO
ALTER TABLE [transit].[SuiviEtape] ENABLE TRIGGER [TR_UpdateLastEtape]
GO
