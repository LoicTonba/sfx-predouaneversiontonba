// ============================================================================
// MODULE USE-COLISAGE-PDF-REPORT.TS - HOOK RAPPORT PDF COLISAGES
// ============================================================================
// Rôle global : Ce hook React gère la génération de rapports PDF pour les colisages.
// Il coordonne la récupération des données depuis le serveur et la génération du PDF
// en utilisant le service ColisagePDFReportV2. Gère les états de chargement et les notifications.
//
// Architecture :
// - Hook personnalisé React avec gestion d'état
// - Intégration avec le système de notifications (toast)
// - Communication avec les actions serveur pour les données
// - Utilisation du service de génération PDF V2
// ============================================================================

// Import des bibliothèques et modules nécessaires
import { useState } from 'react';  // Hook d'état React
import { toast } from 'sonner';  // Système de notifications toast
import { getColisageReportData } from '../server/colisage-report-actions';  // Action serveur pour récupérer les données
import { ColisagePDFReportV2 } from '../../dossiers/services/colisage-pdf-report-v2';  // Service de génération PDF V2

/**
 * ============================================================================
 * HOOK : useColisagePDFReport
 * ============================================================================
 * Rôle global : Hook personnalisé pour gérer la génération de rapports PDF des colisages.
 * Fournit une fonction pour générer le PDF et un état pour suivre la progression.
 * 
 * Retour : { generatePDFReport: Function, isGenerating: boolean }
 * ============================================================================
 */
export const useColisagePDFReport = () => {
  // --------------------------------------------------------------------
  // 1️⃣ ÉTAT DE GESTION
  // --------------------------------------------------------------------
  const [isGenerating, setIsGenerating] = useState(false);  // État pour suivre si le PDF est en cours de génération

  /**
   * ============================================================================
   * FONCTION : generatePDFReport
   * ============================================================================
   * Rôle global : Génère un rapport PDF pour un dossier donné en récupérant les données
   * du serveur et en utilisant le service de génération PDF V2.
   * 
   * Paramètre : @param dossierId - ID du dossier pour lequel générer le rapport
   * ============================================================================
   */
  const generatePDFReport = async (dossierId: number) => {
    // --------------------------------------------------------------------
    // 1️⃣ DÉBUT DE LA GÉNÉRATION
    // --------------------------------------------------------------------
    setIsGenerating(true);  // Active l'état de chargement
    
    try {
      // ----------------------------------------------------------------
      // 1.1️⃣ RÉCUPÉRATION DES DONNÉES
      // ----------------------------------------------------------------
      // Appelle l'action serveur pour récupérer les données du dossier et des colisages
      const result = await getColisageReportData(dossierId);
      
      // ----------------------------------------------------------------
      // 1.2️⃣ VALIDATION DES DONNÉES
      // ----------------------------------------------------------------
      if (!result.success) {
        // Affiche une erreur si la récupération des données a échoué
        toast.error(result.error || 'Erreur lors de la récupération des données');
        return;  // Arrête la fonction en cas d'erreur
      }

      // Vérifie s'il y a des colisages à inclure dans le rapport
      if (!result.data || !result.data.colisages || result.data.colisages.length === 0) {
        toast.error('Aucun colisage trouvé pour ce dossier');  // Notification d'absence de données
        return;  // Arrête la fonction si pas de colisages
      }

      // ----------------------------------------------------------------
      // 1.3️⃣ GÉNÉRATION DU PDF
      // ----------------------------------------------------------------
      // Crée une nouvelle instance du service de génération PDF V2
      const pdfReport = new ColisagePDFReportV2();
      // Génère le rapport PDF avec les informations du dossier et les colisages
      await pdfReport.generateReport(result.data.dossierInfo, result.data.colisages);
      
      // ----------------------------------------------------------------
      // 1.4️⃣ NOTIFICATION DE SUCCÈS
      // ----------------------------------------------------------------
      toast.success('Rapport PDF généré avec succès');  // Notifie l'utilisateur du succès
    } catch (error: any) {
      // ----------------------------------------------------------------
      // 1.5️⃣ GESTION DES ERREURS
      // ----------------------------------------------------------------
      console.error('Erreur lors de la génération du PDF:', error);  // Log l'erreur pour le débogage
      toast.error('Erreur lors de la génération du rapport PDF');  // Notifie l'utilisateur de l'erreur
    } finally {
      // ----------------------------------------------------------------
      // 1.6️⃣ FIN DE LA GÉNÉRATION
      // ----------------------------------------------------------------
      setIsGenerating(false);  // Désactive l'état de chargement (exécuté en tout cas)
    }
  };

  // --------------------------------------------------------------------
  // 2️⃣ RETOUR DU HOOK
  // --------------------------------------------------------------------
  return {
    generatePDFReport,  // Fonction pour générer le rapport PDF
    isGenerating        // État de chargement (true = génération en cours)
  };
};