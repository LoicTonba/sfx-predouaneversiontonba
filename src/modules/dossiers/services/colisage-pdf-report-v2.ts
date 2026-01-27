// ============================================================================
// MODULE COLISAGE-PDF-REPORT-V2.TS - GÉNÉRATION RAPPORTS PDF COLISAGES V2
// ============================================================================
// Rôle global : Ce fichier contient la classe ColisagePDFReportV2 pour générer
// des rapports PDF améliorés des colisages. Version V2 avec format paysage,
// logo dynamique, regroupement par facture et style professionnel avancé.
//
// Architecture V2 :
// - Format A4 paysage pour plus d'espace horizontal
// - Intégration de logo dynamique (logo.png)
// - Regroupement par fournisseur puis par numéro de facture
// - Style moderne avec couleurs cohérentes et tableaux détaillés
// - Support asynchrone pour le chargement du logo
// ============================================================================

// Import des bibliothèques nécessaires
import { jsPDF } from 'jspdf';  // Bibliothèque principale pour la génération PDF
import autoTable from 'jspdf-autotable';  // Plugin pour les tableaux (import ES6)

// ============================================================================
// INTERFACES DE DONNÉES
// ============================================================================

/**
 * Interface pour les données de colisage
 * Définit la structure des données utilisées dans les tableaux PDF V2
 */
interface ColisageData {
  ID_Colisage_Dossier: number;        // ID unique du colisage
  HS_Code?: string;                   // Code HS douanier
  Description_Colis?: string;          // Description du colis
  No_Commande?: string;               // Numéro de commande
  Nom_Fournisseur?: string;            // Nom du fournisseur
  No_Facture?: string;                 // Numéro de facture
  Item_No?: string;                    // Numéro d'item
  Code_Devise?: string;                // Code de la devise
  Qte_Colis?: number;                  // Quantité de colis
  Prix_Unitaire_Colis?: number;        // Prix unitaire des colis
  Poids_Brut?: number;                 // Poids brut
  Poids_Net?: number;                  // Poids net
  Volume?: number;                     // Volume
  Pays_Origine?: string;               // Pays d'origine
  Libelle_Regime_Douanier?: string;    // Libellé du régime douanier
  Regroupement_Client?: string;        // Regroupement client
  UploadKey?: string;                  // Clé d'upload
  Date_Creation?: string;              // Date de création
}

/**
 * Interface pour les informations du dossier
 * Définit la structure des informations du dossier affichées en en-tête V2
 */
interface DossierInfo {
  id: number;                          // ID du dossier
  noDossier?: string;                  // Numéro de dossier
  noOT?: string;                       // Numéro d'OT
  nomClient?: string;                  // Nom du client
  descriptionDossier?: string;         // Description du dossier
}

// ============================================================================
// CLASSE : ColisagePDFReportV2
// ============================================================================
// Rôle global : Classe améliorée pour la génération de rapports PDF de colisages.
// Version V2 avec format paysage, logo dynamique et regroupement par facture.
// 
// Architecture V2 :
// - Format A4 paysage (297×210mm) pour plus d'espace horizontal
// - Marges réduites (15mm) pour optimiser l'espace
// - Support asynchrone pour le chargement du logo
// - Regroupement par fournisseur puis par numéro de facture
// - Style professionnel avec couleurs cohérentes
// ============================================================================
export class ColisagePDFReportV2 {
  private doc: jsPDF;           // Instance jsPDF pour la génération PDF
  private pageHeight: number;   // Hauteur de la page en mm (210mm en paysage)
  private pageWidth: number;    // Largeur de la page en mm (297mm en paysage)
  private currentY: number;     // Position Y actuelle pour le contenu
  private margin: number = 15;  // Marges réduites à 15mm pour plus d'espace
  private usableWidth: number;  // Largeur utilisable (pageWidth - 2×margin)

  /**
   * ============================================================================
   * CONSTRUCTEUR
   * ============================================================================
   * Rôle : Initialise une nouvelle instance du générateur de rapport PDF V2.
   * Configure le document en format paysage A4 pour plus d'espace horizontal.
   * ============================================================================
   */
  constructor() {
    this.doc = new jsPDF('landscape', 'mm', 'a4');  // Crée un document PDF en format paysage A4
    this.pageHeight = this.doc.internal.pageSize.height;  // Récupère la hauteur (210mm en paysage)
    this.pageWidth = this.doc.internal.pageSize.width;   // Récupère la largeur (297mm en paysage)
    this.usableWidth = this.pageWidth - (this.margin * 2);  // Calcule la largeur utilisable (267mm)
    this.currentY = this.margin;  // Initialise la position Y à la première marge
  }

  /**
   * ============================================================================
   * MÉTHODE : formatNumber
   * ============================================================================
   * Rôle : Formate un nombre en chaîne avec 2 décimales pour l'affichage.
   * Gère les valeurs null/undefined et les erreurs de conversion.
   * 
   * Paramètre : @param value - Valeur à formater (number, string ou any)
   * Retour : Chaîne formatée avec 2 décimales ou "0.00" si invalide
   * ============================================================================
   */
  private formatNumber(value: any): string {
    const num = Number(value);  // Convertit la valeur en nombre
    return isNaN(num) ? "0.00" : num.toFixed(2);  // Retourne "0.00" si NaN, sinon 2 décimales
  }

  /**
   * ============================================================================
   * MÉTHODE : formatDate
   * ============================================================================
   * Rôle : Formate une date en chaîne lisible (format français).
   * Gère les valeurs null/undefined et les erreurs de parsing.
   * 
   * Paramètre : @param date - Date à formater (Date, string ou any)
   * Retour : Chaîne formatée ou "-" si invalide
   * ============================================================================
   */
  private formatDate(date: any): string {
    if (!date) return "-";  // Retourne "-" si la date est null/undefined
    try {
      return new Date(date).toLocaleDateString("fr-FR");  // Format français JJ/MM/AAAA
    } catch {
      return "-";  // Retourne "-" en cas d'erreur de parsing
    }
  }

  /**
   * ============================================================================
   * MÉTHODE : addLogoFallback
   * ============================================================================
   * Rôle : Ajoute un logo de secours si le logo réel ne peut pas être chargé.
   * Affiche un rectangle gris avec le texte "LOGO" et "SFX Pre-Douane".
   * 
   * Paramètres :
   * @param width - Largeur du logo à afficher
   * @param height - Hauteur du logo à afficher
   * ============================================================================
   */
  private addLogoFallback(width: number, height: number) {
    // --------------------------------------------------------------------
    // 1️⃣ RECTANGLE DE FOND
    // --------------------------------------------------------------------
    this.doc.setFillColor(240, 240, 240);  // Couleur gris clair pour le fond
    this.doc.rect(this.margin + 5, this.currentY + 3, width, height, 'F');  // Rectangle rempli
    
    // Texte "LOGO"
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("LOGO", this.margin + 5 + width/2 - 15, this.currentY + 3 + height/2);
    
    // Texte "SFX Pre-Douane"
    this.doc.setFontSize(8);
    this.doc.text("SFX Pre-Douane", this.margin + 5 + width/2 - 25, this.currentY + 3 + height/2 + 5);
  }

  private addSummary(colisages: ColisageData[]) {
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("RÉSUMÉ GÉNÉRAL", this.margin, this.currentY);
    this.currentY += 10;

    // Calculs des totaux
    const totalColisages = colisages.length;
    const totalQuantite = colisages.reduce((sum, c) => sum + Number(c.Qte_Colis || 0), 0);
    const totalPoidsBrut = colisages.reduce((sum, c) => sum + Number(c.Poids_Brut || 0), 0);
    const totalPoidsNet = colisages.reduce((sum, c) => sum + Number(c.Poids_Net || 0), 0);
    const totalVolume = colisages.reduce((sum, c) => sum + Number(c.Volume || 0), 0);

    // Regroupement par devise pour la valeur totale
    const valeurParDevise = colisages.reduce((acc, c) => {
      const devise = c.Code_Devise || 'N/A';
      const valeur = Number(c.Qte_Colis || 0) * Number(c.Prix_Unitaire_Colis || 0);
      acc[devise] = (acc[devise] || 0) + valeur;
      return acc;
    }, {} as Record<string, number>);

    // Statistiques par fournisseur
    const fournisseurs = Array.from(new Set(colisages.map(c => c.Nom_Fournisseur || 'Non spécifié')));
    const totalFournisseurs = fournisseurs.length;

    // Statistiques par HS Code
    const hsCodes = Array.from(new Set(colisages.map(c => c.HS_Code || 'N/A')));
    const totalHSCodes = hsCodes.length;

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    // Tableau de résumé
    const summaryData = [
      ['Nombre total de colisages', totalColisages.toString()],
      ['Nombre de fournisseurs', totalFournisseurs.toString()],
      ['Nombre de codes HS différents', totalHSCodes.toString()],
      ['Quantité totale', this.formatNumber(totalQuantite)],
      ['Poids brut total (kg)', this.formatNumber(totalPoidsBrut)],
      ['Poids net total (kg)', this.formatNumber(totalPoidsNet)],
      ['Volume total (m³)', this.formatNumber(totalVolume)],
    ];

    // Ajouter les valeurs par devise
    Object.entries(valeurParDevise).forEach(([devise, valeur]) => {
      if (valeur > 0) {
        summaryData.push([`Valeur totale (${devise})`, this.formatNumber(valeur)]);
      }
    });

    // Utiliser autoTable avec la nouvelle syntaxe
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Indicateur', 'Valeur']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addColisagesByGroup(colisages: ColisageData[]) {
    // Regrouper par FOURNISSEUR, puis par NUMÉRO DE FACTURE
    const groupedData = colisages.reduce((acc, colisage) => {
      const fournisseur = colisage.Nom_Fournisseur || 'Fournisseur non spécifié';
      const numeroFacture = colisage.No_Facture || 'Sans numéro de facture';
      
      if (!acc[fournisseur]) {
        acc[fournisseur] = {};
      }
      if (!acc[fournisseur][numeroFacture]) {
        acc[fournisseur][numeroFacture] = [];
      }
      
      acc[fournisseur][numeroFacture].push(colisage);
      return acc;
    }, {} as Record<string, Record<string, ColisageData[]>>);

    Object.entries(groupedData).forEach(([fournisseur, factures]) => {
      // Vérifier si on a assez de place pour le groupe
      if (this.currentY > this.pageHeight - 100) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      // Titre du FOURNISSEUR (niveau 1)
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(41, 128, 185);
      this.doc.text(`FOURNISSEUR: ${fournisseur.toUpperCase()}`, this.margin, this.currentY);
      this.currentY += 10;

      Object.entries(factures).forEach(([numeroFacture, colisagesGroup]) => {
        // Sous-titre du NUMÉRO DE FACTURE (niveau 2)
        this.doc.setFontSize(10);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(`Facture N°: ${numeroFacture}`, this.margin + 5, this.currentY);
        this.currentY += 8;

        // Préparer les données du tableau avec l'ordre demandé
        const tableData = colisagesGroup.map(colisage => [
        colisage.No_Commande || '-',           // N° Commande
        colisage.Item_No || '-',               // Item No
        (colisage.Description_Colis || '').substring(0, 35), // Description
        colisage.HS_Code || '-',               // HS Code
        this.formatNumber(colisage.Qte_Colis), // Quantité
        `${this.formatNumber(colisage.Prix_Unitaire_Colis)} ${colisage.Code_Devise || ''}`, // Prix Unitaire
        this.formatNumber(colisage.Volume),    // Volume
        colisage.Regroupement_Client || '-',   // Site
        colisage.Pays_Origine || '-',          // Pays d'Origine
      ]);

        // Calculer les totaux du groupe
        const totalQte = colisagesGroup.reduce((sum, c) => sum + Number(c.Qte_Colis || 0), 0);
        const totalVolume = colisagesGroup.reduce((sum, c) => sum + Number(c.Volume || 0), 0);
        
        // Calculer la valeur totale par devise
        const valeurParDevise = colisagesGroup.reduce((acc, c) => {
          const devise = c.Code_Devise || 'N/A';
          const valeur = Number(c.Qte_Colis || 0) * Number(c.Prix_Unitaire_Colis || 0);
          acc[devise] = (acc[devise] || 0) + valeur;
          return acc;
        }, {} as Record<string, number>);
        
        // Formater la valeur totale (prendre la première devise ou la plus importante)
        const devisesPrincipales = Object.entries(valeurParDevise).sort(([,a], [,b]) => b - a);
        const totalValeur = devisesPrincipales.length > 0 
          ? `${this.formatNumber(devisesPrincipales[0][1])} ${devisesPrincipales[0][0]}`
          : '-';

        // Ajouter ligne de total
        tableData.push([
        'TOTAL',
        '',
        '',
        '',
        this.formatNumber(totalQte),
        totalValeur,
        this.formatNumber(totalVolume),
        '',
        ''
        ]);

        autoTable(this.doc, {
          startY: this.currentY,
          head: [[
            'N° Commande',
            'Item No',
            'Description',
            'HS Code',
            'Quantité',
            'Prix Unit.',
            'Volume',
            'Site',
            'Pays d\'Origine'
          ]],
          body: tableData,
          theme: 'grid',
          headStyles: { 
            fillColor: [52, 152, 219], 
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle'
          },
          bodyStyles: {
            fontSize: 8,
            cellPadding: 2,
            halign: 'center',
            valign: 'middle'
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          columnStyles: {
            0: { cellWidth: 28, halign: 'center' }, // N° Commande
            1: { cellWidth: 22, halign: 'center' }, // Item No
            2: { cellWidth: 60, halign: 'left' },   // Description
            3: { cellWidth: 28, halign: 'center' }, // HS Code
            4: { cellWidth: 22, halign: 'right' },  // Quantité
            5: { cellWidth: 30, halign: 'right' },  // Prix Unitaire
            6: { cellWidth: 22, halign: 'right' },  // Volume
            7: { cellWidth: 27, halign: 'center' }, // Site
            8: { cellWidth: 28, halign: 'center' }, // Pays d'Origine
          },
          margin: { left: this.margin, right: this.margin },
          tableWidth: this.usableWidth,
          pageBreak: 'auto',
          didParseCell: (data: any) => {
            // Mettre en évidence la ligne de total
            if (data.row.index === tableData.length - 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [255, 235, 59];
              data.cell.styles.textColor = [0, 0, 0];
            }
          }
        });

        this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
      });

      this.currentY += 5;
    });
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Ligne de séparation élégante
      this.doc.setDrawColor(52, 152, 219);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);
      
      // Pied de page avec style
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(100, 100, 100);
      
      // Informations à gauche
      this.doc.text(
        `Généré le ${this.formatDate(new Date())} - Rapport de colisages`,
        this.margin,
        this.pageHeight - 12
      );
      
      // Numéro de page à droite
      this.doc.text(
        `Page ${i} sur ${pageCount}`,
        this.pageWidth - this.margin - 20,
        this.pageHeight - 12
      );
    }
  }

  /**
   * ============================================================================
   * MÉTHODE : loadLogoAsBase64
   * ============================================================================
   * Rôle : Charge le logo depuis le système et le convertit en base64.
   * Utilise le logo.png par défaut dans le dossier public.
   * 
   * Retour : Promise<string> - Logo en base64 ou null si erreur
   * ============================================================================
   */
  private async loadLogoAsBase64(): Promise<string | null> {
    try {
      // Essayer de charger le logo depuis le dossier public
      const response = await fetch('/logo.png');
      if (!response.ok) {
        console.warn('Logo non trouvé, utilisation du fallback');
        return null;
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Erreur lors du chargement du logo:', error);
      return null;
    }
  }

  /**
   * ============================================================================
   * MÉTHODE : addHeaderWithLogo
   * ============================================================================
   * Rôle : Ajoute l'en-tête du rapport avec logo et informations du dossier.
   * Version V2 avec logo dynamique et mise en page améliorée.
   * 
   * Paramètre : @param dossierInfo - Informations du dossier à afficher
   * ============================================================================
   */
  private async addHeaderWithLogo(dossierInfo: DossierInfo): Promise<void> {
    // --------------------------------------------------------------------
    // 1️⃣ BANDEAU TITRE
    // --------------------------------------------------------------------
    this.doc.setFillColor(41, 128, 185);  // Bleu SFX
    this.doc.rect(this.margin, this.currentY, this.usableWidth, 12, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("RAPPORT DE COLISAGES", this.margin + 5, this.currentY + 8);
    
    // Date de génération à droite
    this.doc.setFontSize(10);
    this.doc.text(`Généré le ${this.formatDate(new Date())}`, this.pageWidth - this.margin - 40, this.currentY + 8);
    
    this.currentY += 20;
    
    // --------------------------------------------------------------------
    // 2️⃣ CADRE AVEC LOGO ET INFORMATIONS
    // --------------------------------------------------------------------
    const frameHeight = 30;
    this.doc.setTextColor(0, 0, 0);
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(this.margin, this.currentY, this.usableWidth, frameHeight);
    
    // GAUCHE : Logo réel (logo.jpeg)
    const logoWidth = 40;
    const logoHeight = frameHeight - 6;
    
    // Charger le logo en base64
    const logoBase64 = await this.loadLogoAsBase64();
    
    if (logoBase64) {
      try {
        this.doc.addImage(logoBase64, 'JPEG', this.margin + 5, this.currentY + 3, logoWidth, logoHeight);
      } catch (error) {
        console.warn('Erreur lors de l\'ajout du logo:', error);
        this.addLogoFallback(logoWidth, logoHeight);
      }
    } else {
      this.addLogoFallback(logoWidth, logoHeight);
    }
    
    // DROITE : Informations du dossier (justify-end dans le cadre)
    const rightStartX = this.pageWidth - this.margin - 120;
    
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    const dossierRef = dossierInfo.noDossier || dossierInfo.noOT || `Dossier: ${dossierInfo.id}`;
    this.doc.text(`${dossierRef}`, rightStartX, this.currentY + 8);
    
    if (dossierInfo.nomClient) {
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(`Client: ${dossierInfo.nomClient}`, rightStartX, this.currentY + 15);
    }
    
    if (dossierInfo.descriptionDossier) {
      this.doc.setFontSize(9);
      this.doc.text(`Description: ${dossierInfo.descriptionDossier}`, rightStartX, this.currentY + 22);
    }
    
    this.currentY += frameHeight + 15;
  }

  public async generateReport(dossierInfo: DossierInfo, colisages: ColisageData[]): Promise<void> {
    try {
      // Validation des données
      if (!colisages || colisages.length === 0) {
        throw new Error('Aucun colisage à inclure dans le rapport');
      }

      // En-tête avec logo
      await this.addHeaderWithLogo(dossierInfo);
      
      // Résumé
      this.addSummary(colisages);
      
      // Détail par groupes
      this.addColisagesByGroup(colisages);
      
      // Pied de page
      this.addFooter();
      
      // Télécharger le PDF
      const fileName = `Rapport_Colisages_${dossierInfo.noDossier || dossierInfo.noOT || dossierInfo.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(fileName);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  }
}