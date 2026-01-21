import { Button } from "@/components/ui/button";

interface Props {
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void;
}


export const DataPagination = ({
    currentPage,
    totalPages,
    onPageChange
}: Props) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex-1 text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages || 1}
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size={"sm"}
                >
                    Precedent
                </Button>
                <Button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    variant="outline"
                    size={"sm"}
                >
                    Suivant
                </Button>
            </div>
        </div>
    );
}