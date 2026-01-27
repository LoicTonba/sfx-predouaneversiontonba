"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2 } from "lucide-react";

interface ParsedRow {
    _rowIndex: number;
    rowKey: string;
    hscode?: string;
    description: string;
    numeroCommande?: string;
    nomFournisseur?: string;
    numeroFacture?: string;
    devise: string;
    quantite: number;
    prixUnitaireColis: number;
    poidsBrut: number;
    poidsNet: number;
    volume: number;
    paysOrigine: string;
    regimeCode?: string;
    regimeRatio?: number;
    regroupementClient?: string;
}

interface EditableColisageCardProps {
    row: ParsedRow;
    index: number;
    isSelected: boolean;
    isExisting: boolean;
    onToggle: () => void;
    onEdit: () => void;
}

export const EditableColisageCard = ({
    row,
    index,
    isSelected,
    isExisting,
    onToggle,
    onEdit,
}: EditableColisageCardProps) => {

    return (
        <div
            className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                isSelected ? "bg-accent/50" : "bg-background"
            } ${isExisting ? "border-orange-300" : "border-border"}`}
        >
            <Checkbox
                checked={isSelected}
                onCheckedChange={onToggle}
                className="mt-1"
            />

            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                            {row.rowKey}
                        </span>
                        {isExisting && (
                            <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                Existe
                            </Badge>
                        )}
                        {row.hscode && (
                            <Badge variant="secondary" className="text-xs">
                                HS: {row.hscode}
                            </Badge>
                        )}
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onEdit}
                        className="h-6 w-6 p-0"
                    >
                        <Edit2 className="w-3 h-3" />
                    </Button>
                </div>

                {/* Description */}
                <p className="text-sm font-medium">{row.description}</p>

                {/* Informations principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                        <span className="font-medium">Qté:</span> {row.quantite}
                    </div>
                    <div>
                        <span className="font-medium">Prix:</span> {row.prixUnitaireColis} {row.devise}
                    </div>
                    <div>
                        <span className="font-medium">Poids:</span> {row.poidsBrut} kg
                    </div>
                    <div>
                        <span className="font-medium">Pays:</span> {row.paysOrigine}
                    </div>
                </div>

                {/* Informations supplémentaires */}
                {row.nomFournisseur && (
                    <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Fournisseur:</span> {row.nomFournisseur}
                    </div>
                )}

                {/* HS Code */}
                {row.hscode && (
                    <div className="text-xs">
                        <span className="font-medium">HS Code:</span> {row.hscode}
                    </div>
                )}

                {/* Régime */}
                {(row.regimeCode || row.regimeRatio !== undefined) && (
                    <div className="text-xs">
                        <Badge variant="outline" className="text-xs">
                            {row.regimeCode || "Régime auto"} - {row.regimeRatio || 0}% DC
                        </Badge>
                    </div>
                )}

                {/* Groupement client */}
                {row.regroupementClient && (
                    <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Groupement:</span> {row.regroupementClient}
                    </div>
                )}
            </div>
        </div>
    );
};