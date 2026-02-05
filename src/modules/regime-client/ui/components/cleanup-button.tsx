"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cleanupAllRegimes } from "../../../clients/server/cleanup-actions";

export const CleanupButton = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleCleanup = async () => {
        if (!confirm("⚠️ ATTENTION: Ceci va supprimer TOUTES les associations régime-client. Voulez-vous continuer ?")) {
            return;
        }

        setIsLoading(true);
        try {
            const result = await cleanupAllRegimes();
            if (result.success) {
                toast.success(`Nettoyage terminé: ${result.message}`);
                // Recharger la page
                window.location.reload();
            } else {
                toast.error(result.error || "Erreur lors du nettoyage");
            }
        } catch (error) {
            toast.error("Erreur lors du nettoyage");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="destructive"
            onClick={handleCleanup}
            disabled={isLoading}
            className="mb-4"
        >
            <Trash2 className="h-4 w-4 mr-2" />
            {isLoading ? "Suppression..." : "Supprimer toutes les associations"}
        </Button>
    );
};
