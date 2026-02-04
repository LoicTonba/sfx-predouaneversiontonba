"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { deleteColisage, deleteAllColisagesByDossierId } from "../../../colisages/server/colisage-actions";

interface DeleteAllColisagesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    colisages: any[];
    selectedRows?: any[];
    dossierId?: number;  // ID du dossier pour suppression en masse
    onSuccess: () => void;
}

export const DeleteAllColisagesDialog = ({
    open,
    onOpenChange,
    colisages,
    selectedRows = [],
    onSuccess,
}: DeleteAllColisagesDialogProps) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const isDeleteAll = selectedRows.length === 0;
    const itemsToDelete = isDeleteAll ? colisages : selectedRows;
    const count = itemsToDelete.length;

    const handleDelete = async () => {
        if (count === 0) return;

        setIsDeleting(true);
        setProgress({ current: 0, total: count });

        try {
            let successCount = 0;
            let errorCount = 0;

            for (let i = 0; i < itemsToDelete.length; i++) {
                const item = itemsToDelete[i];
                setProgress({ current: i + 1, total: count });

                try {
                    const result = await deleteColisage(item.ID_Colisage_Dossier.toString());
                    if (result.success) {
                        successCount++;
                    } else {
                        errorCount++;
                        console.error(`Erreur suppression colisage ${item.ID_Colisage_Dossier}:`, result.error);
                    }
                } catch (error) {
                    errorCount++;
                    console.error(`Erreur suppression colisage ${item.ID_Colisage_Dossier}:`, error);
                }

                // Petite pause pour éviter de surcharger le serveur
                if (i < itemsToDelete.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Afficher les résultats
            if (successCount > 0) {
                toast.success(`${successCount} colisage(s) supprimé(s) avec succès`);
            }

            if (errorCount > 0) {
                toast.error(`${errorCount} colisage(s) n'ont pas pu être supprimés`);
            }

            // Fermer la modal et actualiser
            onOpenChange(false);
            onSuccess();

        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            toast.error("Erreur lors de la suppression des colisages");
        } finally {
            setIsDeleting(false);
            setProgress({ current: 0, total: 0 });
        }
    };

    const handleCancel = () => {
        if (!isDeleting) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Confirmer la suppression
                    </DialogTitle>
                    <DialogDescription>
                        {isDeleteAll ? (
                            <>
                                Voulez-vous vraiment supprimer <strong>TOUS les {count} colisages</strong> ?
                                <br />
                                Cette action est <strong>irréversible</strong>.
                            </>
                        ) : (
                            <>
                                Voulez-vous vraiment supprimer les <strong>{count} colisage(s) sélectionné(s)</strong> ?
                                <br />
                                Cette action est <strong>irréversible</strong>.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {isDeleting && (
                    <div className="py-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">
                                Suppression en cours...
                            </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                            <div
                                className="bg-destructive h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(progress.current / progress.total) * 100}%`,
                                }}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {progress.current} / {progress.total} colisages traités
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isDeleting}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || count === 0}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Suppression...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer {count} colisage(s)
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};