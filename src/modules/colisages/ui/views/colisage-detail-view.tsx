"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Colisage {
    ID_Colisage_Dossier: number;
    Description_Colis?: string;
    HS_Code?: string;
    Libelle_Regime_Declaration?: string;
    Nom_Fournisseur?: string;
    No_Commande?: string;
    No_Facture?: string;
    Item_No?: string;
    Pays_Origine?: string;
    Regroupement_Client?: string;
    Qte_Colis?: number;
    Prix_Unitaire_Colis?: number;
    Poids_Brut?: number;
    Poids_Net?: number;
    Volume?: number;
    Code_Devise?: string;
    Date_Creation?: string;
    Nom_Creation?: string;
    Upload_Key?: string;
}

interface ColisageDetailViewProps {
    dossierId: number;
    colisage: Colisage;
}

export const ColisageDetailView = ({ dossierId, colisage }: ColisageDetailViewProps) => {
    const formatNumber = (value: any) => {
        const num = Number(value);
        return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    const formatDate = (date: any) => {
        if (!date) return "-";
        try {
            return new Date(date).toLocaleDateString("fr-FR");
        } catch {
            return "-";
        }
    };

    return (
        <div className="px-4 md:px-8 pb-8 space-y-6">
            {/* Informations générales */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Description
                            </label>
                            <p className="text-sm mt-1">
                                {colisage.Description_Colis || "-"}
                            </p>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                HS Code
                            </label>
                            <p className="text-sm mt-1">
                                {colisage.HS_Code || "-"}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Régime de déclaration
                            </label>
                            <div className="mt-1">
                                {colisage.Libelle_Regime_Declaration ? (
                                    <Badge variant="outline">
                                        {colisage.Libelle_Regime_Declaration}
                                    </Badge>
                                ) : (
                                    <span className="text-sm text-muted-foreground">-</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Fournisseur
                            </label>
                            <p className="text-sm mt-1">
                                {colisage.Nom_Fournisseur || "-"}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                N° Commande
                            </label>
                            <p className="text-sm mt-1">
                                {colisage.No_Commande || "-"}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                N° Facture
                            </label>
                            <p className="text-sm mt-1">
                                {colisage.No_Facture || "-"}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                N° Item
                            </label>
                            <p className="text-sm mt-1">
                                {colisage.Item_No || "-"}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Pays d'origine
                            </label>
                            <p className="text-sm mt-1">
                                {colisage.Pays_Origine || "-"}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Regroupement client
                            </label>
                            <p className="text-sm mt-1">
                                {colisage.Regroupement_Client || "-"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quantités et mesures */}
            <Card>
                <CardHeader>
                    <CardTitle>Quantités et mesures</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">
                                {formatNumber(colisage.Qte_Colis)}
                            </p>
                            <p className="text-sm text-muted-foreground">Quantité</p>
                        </div>

                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">
                                {formatNumber(colisage.Poids_Brut)} kg
                            </p>
                            <p className="text-sm text-muted-foreground">Poids brut</p>
                        </div>

                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">
                                {formatNumber(colisage.Poids_Net)} kg
                            </p>
                            <p className="text-sm text-muted-foreground">Poids net</p>
                        </div>

                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">
                                {formatNumber(colisage.Volume)} m³
                            </p>
                            <p className="text-sm text-muted-foreground">Volume</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Informations financières */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations financières</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Devise
                            </label>
                            <p className="text-sm mt-1 font-medium">
                                {colisage.Code_Devise || "-"}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Prix unitaire
                            </label>
                            <p className="text-sm mt-1 font-medium">
                                {formatNumber(colisage.Prix_Unitaire_Colis)} {colisage.Code_Devise}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Valeur totale
                            </label>
                            <p className="text-lg font-bold text-green-600">
                                {formatNumber(
                                    Number(colisage.Qte_Colis) * Number(colisage.Prix_Unitaire_Colis)
                                )} {colisage.Code_Devise}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Informations système */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations système</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Date de création
                            </label>
                            <p className="text-sm mt-1">
                                {formatDate(colisage.Date_Creation)}
                            </p>
                        </div>

    
                    {colisage.Upload_Key && (
                        <>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Clé d'import
                                </label>
                                <p className="text-sm mt-1 font-mono text-muted-foreground">
                                    {colisage.Upload_Key}
                                </p>
                            </div>
                        </>
                    )}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};