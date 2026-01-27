// ============================================================================
// MODULE COLISAGE-PDF-REPORT.TS - GÉNÉRATION RAPPORTS PDF COLISAGES
// ============================================================================
// Rôle global : Ce fichier contient la classe ColisagePDFReport pour générer des
// rapports PDF détaillés des colisages d'un dossier. Il utilise jsPDF et autoTable
// pour créer des tableaux professionnels avec en-têtes, résumés et détails groupés.
//
// Architecture :
// - Format portrait A4 standard
// - Regroupement par fournisseur puis par regroupement client
// - Inclusion de résumés statistiques et de tableaux détaillés
// - Gestion automatique des sauts de page et pieds de page
// ============================================================================

// Import des bibliothèques nécessaires
import jsPDF from 'jspdf';  // Bibliothèque principale pour la génération PDF

// Import direct pour s'assurer que autoTable est disponible
if (typeof window !== 'undefined') {
  require('jspdf-autotable');  // Plugin pour les tableaux dans jsPDF
}

// Étendre le type jsPDF pour inclure autoTable (déclaration de type)
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// ============================================================================
// INTERFACES DE DONNÉES
// ============================================================================

/**
 * Interface pour les données de colisage
 * Définit la structure des données utilisées dans les tableaux PDF
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
  Prix_Unitaire_Colis?: number;      // Prix unitaire Colis
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
 * Définit la structure des informations du dossier affichées en en-tête
 */
interface DossierInfo {
  id: number;                          // ID du dossier
  noDossier?: string;                  // Numéro de dossier
  noOT?: string;                       // Numéro d'OT
  nomClient?: string;                  // Nom du client
  descriptionDossier?: string;         // Description du dossier
}

/**
 * ============================================================================
 * CLASSE : ColisagePDFReport
 * ============================================================================
 * Rôle global : Classe principale pour la génération de rapports PDF de colisages.
 * Gère la mise en page, le formatage des données et l'organisation du contenu.
 * 
 * Architecture :
 * - Format portrait A4 standard
 * - Marges de 20mm pour une bonne lisibilité
 * - Gestion automatique des sauts de page
 * - Style professionnel avec couleurs cohérentes
 * ============================================================================
 */
export class ColisagePDFReport {
  private doc: jsPDF;           // Instance jsPDF pour la génération PDF
  private pageHeight: number;   // Hauteur de la page en points
  private currentY: number;     // Position Y actuelle pour le contenu
  private margin: number = 20;  // Marges uniformes de 20mm

  /**
   * ============================================================================
   * CONSTRUCTEUR
   * ============================================================================
   * Rôle : Initialise une nouvelle instance du générateur de rapport PDF.
   * Configure le document en format portrait A4 standard.
   * ============================================================================
   */
  constructor() {
    this.doc = new jsPDF();  // Crée un nouveau document PDF en portrait A4
    this.pageHeight = this.doc.internal.pageSize.height;  // Récupère la hauteur de la page
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
   * MÉTHODE : addHeader
   * ============================================================================
   * Rôle : Ajoute l'en-tête du rapport avec titre et informations du dossier.
   * Affiche le titre principal, les détails du dossier et la date de génération.
   * 
   * Paramètre : @param dossierInfo - Informations du dossier à afficher
   * ============================================================================
   */
  private addHeader(dossierInfo: DossierInfo) {
    // --------------------------------------------------------------------
    // 1️⃣ TITRE PRINCIPAL
    // --------------------------------------------------------------------
    this.doc.setFontSize(20);  // Police de grande taille pour le titre
    this.doc.setFont("helvetica", "bold");  // Style gras pour le titre
    this.doc.text("RAPPORT DE COLISAGES", this.margin, this.currentY);  // Titre centré à gauche
    
    this.currentY += 15;  // Espacement après le titre
    
    // --------------------------------------------------------------------
    // 2️⃣ INFORMATIONS DU DOSSIER
    // --------------------------------------------------------------------
    this.doc.setFontSize(12);  // Police standard pour les informations
    this.doc.setFont("helvetica", "normal");  // Style normal
    
    // Détermine la référence du dossier (noDossier > noOT > ID)
    const dossierRef = dossierInfo.noDossier || dossierInfo.noOT || `Dossier #${dossierInfo.id}`;
    this.doc.text(`Dossier: ${dossierRef}`, this.margin, this.currentY);
    
    // Ajoute le nom du client si disponible
    if (dossierInfo.nomClient) {
      this.currentY += 7;  // Espacement entre lignes
      this.doc.text(`Client: ${dossierInfo.nomClient}`, this.margin, this.currentY);
    }
    
    // Ajoute la description si disponible
    if (dossierInfo.descriptionDossier) {
      this.currentY += 7;  // Espacement entre lignes
      this.doc.text(`Description: ${dossierInfo.descriptionDossier}`, this.margin, this.currentY);
    }
    
    // Ajoute la date de génération
    this.currentY += 7;
    this.doc.text(`Date de génération: ${this.formatDate(new Date())}`, this.margin, this.currentY);
    
    this.currentY += 15;  // Espacement avant la ligne de séparation
    
    // --------------------------------------------------------------------
    // 3️⃣ LIGNE DE SÉPARATION
    // --------------------------------------------------------------------
    this.doc.setDrawColor(200, 200, 200);  // Couleur grise claire
    this.doc.line(this.margin, this.currentY, this.doc.internal.pageSize.width - this.margin, this.currentY);
    this.currentY += 10;  // Espacement après la ligne
  }

  /**
   * ============================================================================
   * MÉTHODE : addSummary
   * ============================================================================
   * Rôle : Ajoute une section de résumé avec les statistiques générales des colisages.
   * Calcule et affiche les totaux, les dénombrements et les valeurs par devise.
   * 
   * Paramètre : @param colisages - Tableau des colisages à analyser
   * ============================================================================
   */
  private addSummary(colisages: ColisageData[]) {
    // --------------------------------------------------------------------
    // 1️⃣ TITRE DE LA SECTION
    // --------------------------------------------------------------------
    this.doc.setFontSize(14);  // Police de taille moyenne pour le titre
    this.doc.setFont("helvetica", "bold");  // Style gras
    this.doc.text("RÉSUMÉ GÉNÉRAL", this.margin, this.currentY);
    this.currentY += 10;  // Espacement après le titre

    // --------------------------------------------------------------------
    // 2️⃣ CALCUL DES STATISTIQUES
    // --------------------------------------------------------------------
    const totalColisages = colisages.length;  // Nombre total de colisages
    const totalQuantite = colisages.reduce((sum, c) => sum + Number(c.Qte_Colis || 0), 0);  // Somme des quantités
    const totalPoidsBrut = colisages.reduce((sum, c) => sum + Number(c.Poids_Brut || 0), 0);  // Somme poids brut
    const totalPoidsNet = colisages.reduce((sum, c) => sum + Number(c.Poids_Net || 0), 0);  // Somme poids net
    const totalVolume = colisages.reduce((sum, c) => sum + Number(c.Volume || 0), 0);  // Somme volumes

    // Regroupement par devise pour calculer les valeurs totales
    const valeurParDevise = colisages.reduce((acc, c) => {
      const devise = c.Code_Devise || 'N/A';  // Code devise ou N/A par défaut
      const valeur = Number(c.Qte_Colis || 0) * Number(c.Prix_Unitaire_Colis || 0);  // Quantité × Prix
      acc[devise] = (acc[devise] || 0) + valeur;  // Additionne à l'accumulateur
      return acc;
    }, {} as Record<string, number>);

    // Statistiques par fournisseur
    const fournisseurs = [...new Set(colisages.map(c => c.Nom_Fournisseur || 'Non spécifié'))];  // Fournisseurs uniques
    const totalFournisseurs = fournisseurs.length;  // Nombre de fournisseurs

    // Statistiques par HS Code
    const hsCodes = [...new Set(colisages.map(c => c.HS_Code || 'N/A'))];  // HS codes uniques
    const totalHSCodes = hsCodes.length;  // Nombre de HS codes

    // --------------------------------------------------------------------
    // 3️⃣ PRÉPARATION DES DONNÉES DU TABLEAU
    // --------------------------------------------------------------------
    this.doc.setFontSize(10);  // Police standard pour le tableau
    this.doc.setFont("helvetica", "normal");

    // Données du tableau de résumé
    const summaryData = [
      ['Nombre total de colisages', totalColisages.toString()],
      ['Nombre de fournisseurs', totalFournisseurs.toString()],
      ['Nombre de codes HS différents', totalHSCodes.toString()],
      ['Quantité totale', this.formatNumber(totalQuantite)],
      ['Poids brut total (kg)', this.formatNumber(totalPoidsBrut)],
      ['Poids net total (kg)', this.formatNumber(totalPoidsNet)],
      ['Volume total (m³)', this.formatNumber(totalVolume)],
    ];

    // Ajoute les valeurs totales par devise
    Object.entries(valeurParDevise).forEach(([devise, valeur]) => {
      if (valeur > 0) {
        summaryData.push([`Valeur totale (${devise})`, this.formatNumber(valeur)]);
      }
    });

    // --------------------------------------------------------------------
    // 4️⃣ GÉNÉRATION DU TABLEAU
    // --------------------------------------------------------------------
    this.doc.autoTable({
      startY: this.currentY,  // Position Y de départ
      head: [['Indicateur', 'Valeur']],  // En-têtes du tableau
      body: summaryData,  // Données du tableau
      theme: 'grid',  // Style avec grille
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },  // Style en-tête
      styles: { fontSize: 9 },  // Style général
      margin: { left: this.margin, right: this.margin },  // Marges
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;  // Position après le tableau
  }

  private addColisagesByGroup(colisages: ColisageData[]) {
    // Regrouper par fournisseur, puis par regroupement client
    const groupedData = colisages.reduce((acc, colisage) => {
      const fournisseur = colisage.Nom_Fournisseur || 'Fournisseur non spécifié';
      const regroupement = colisage.Regroupement_Client || 'Sans regroupement';
      
      if (!acc[fournisseur]) {
        acc[fournisseur] = {};
      }
      if (!acc[fournisseur][regroupement]) {
        acc[fournisseur][regroupement] = [];
      }
      
      acc[fournisseur][regroupement].push(colisage);
      return acc;
    }, {} as Record<string, Record<string, ColisageData[]>>);

    Object.entries(groupedData).forEach(([fournisseur, regroupements]) => {
      // Vérifier si on a assez de place pour le groupe
      if (this.currentY > this.pageHeight - 100) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      // Titre du fournisseur
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(41, 128, 185);
      this.doc.text(`FOURNISSEUR: ${fournisseur.toUpperCase()}`, this.margin, this.currentY);
      this.currentY += 10;

      Object.entries(regroupements).forEach(([regroupement, colisagesGroup]) => {
        // Sous-titre du regroupement
        this.doc.setFontSize(10);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(`Regroupement: ${regroupement}`, this.margin + 5, this.currentY);
        this.currentY += 8;

        // Préparer les données du tableau
        const tableData = colisagesGroup.map(colisage => [
          colisage.UploadKey || '-',
          colisage.HS_Code || '-',
          (colisage.Description_Colis || '').substring(0, 30) + (colisage.Description_Colis && colisage.Description_Colis.length > 30 ? '...' : ''),
          colisage.No_Commande || '-',
          colisage.No_Facture || '-',
          colisage.Item_No || '-',
          this.formatNumber(colisage.Qte_Colis),
          `${this.formatNumber(colisage.Prix_Unitaire_Colis)} ${colisage.Code_Devise || ''}`,
          this.formatNumber(colisage.Poids_Brut),
          this.formatNumber(colisage.Poids_Net),
          this.formatNumber(colisage.Volume),
          colisage.Pays_Origine || '-',
        ]);

        // Calculer les totaux du groupe
        const totalQte = colisagesGroup.reduce((sum, c) => sum + Number(c.Qte_Colis || 0), 0);
        const totalPoidsBrut = colisagesGroup.reduce((sum, c) => sum + Number(c.Poids_Brut || 0), 0);
        const totalPoidsNet = colisagesGroup.reduce((sum, c) => sum + Number(c.Poids_Net || 0), 0);
        const totalVolume = colisagesGroup.reduce((sum, c) => sum + Number(c.Volume || 0), 0);

        // Ajouter ligne de total
        tableData.push([
          'TOTAL',
          '',
          '',
          '',
          '',
          '',
          this.formatNumber(totalQte),
          '',
          this.formatNumber(totalPoidsBrut),
          this.formatNumber(totalPoidsNet),
          this.formatNumber(totalVolume),
          ''
        ]);

        this.doc.autoTable({
          startY: this.currentY,
          head: [[
            'Row Key',
            'HS Code',
            'Description',
            'N° Cmd',
            'N° Facture',
            'N° Item',
            'Qté',
            'Prix Unit.',
            'Poids Brut',
            'Poids Net',
            'Volume',
            'Pays'
          ]],
          body: tableData,
          theme: 'striped',
          headStyles: { 
            fillColor: [52, 152, 219], 
            textColor: 255,
            fontSize: 8,
            fontStyle: 'bold'
          },
          styles: { 
            fontSize: 7,
            cellPadding: 2
          },
          columnStyles: {
            0: { cellWidth: 15 }, // Row Key
            1: { cellWidth: 15 }, // HS Code
            2: { cellWidth: 25 }, // Description
            3: { cellWidth: 12 }, // N° Cmd
            4: { cellWidth: 12 }, // N° Facture
            5: { cellWidth: 12 }, // N° Item
            6: { cellWidth: 10, halign: 'right' }, // Qté
            7: { cellWidth: 15, halign: 'right' }, // Prix
            8: { cellWidth: 12, halign: 'right' }, // Poids Brut
            9: { cellWidth: 12, halign: 'right' }, // Poids Net
            10: { cellWidth: 12, halign: 'right' }, // Volume
            11: { cellWidth: 15 }, // Pays
          },
          margin: { left: this.margin + 5, right: this.margin },
          didParseCell: (data: any) => {
            // Mettre en évidence la ligne de total
            if (data.row.index === tableData.length - 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [241, 196, 15];
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
      
      // Ligne de séparation
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.pageHeight - 25, this.doc.internal.pageSize.width - this.margin, this.pageHeight - 25);
      
      // Numéro de page
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(128, 128, 128);
      this.doc.text(
        `Page ${i} sur ${pageCount}`,
        this.doc.internal.pageSize.width - this.margin - 20,
        this.pageHeight - 15
      );
      
      // Informations de génération
      this.doc.text(
        `Généré le ${this.formatDate(new Date())} - Rapport de colisages`,
        this.margin,
        this.pageHeight - 15
      );
    }
  }

  public generateReport(dossierInfo: DossierInfo, colisages: ColisageData[]): void {
    try {
      // Validation des données
      if (!colisages || colisages.length === 0) {
        throw new Error('Aucun colisage à inclure dans le rapport');
      }

      // En-tête
      this.addHeader(dossierInfo);
      
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