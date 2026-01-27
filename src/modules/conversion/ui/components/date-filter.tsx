"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, X } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateFilterProps {
    onFilter: (startDate: string | null, endDate: string | null) => void;
}

export const DateFilter = ({ onFilter }: DateFilterProps) => {
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);

    const handleApplyFilter = () => {
        onFilter(
            startDate || null,
            endDate || null
        );
        setIsOpen(false);
    };

    const handleClearFilter = () => {
        setStartDate("");
        setEndDate("");
        onFilter(null, null);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Filtrer par date
                    {(startDate || endDate) && (
                        <span className="ml-2 px-1 bg-blue-100 text-blue-800 rounded text-xs">
                            Actif
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Filtrer par période</h4>
                        <p className="text-sm text-muted-foreground">
                            Sélectionnez une ou deux dates pour filtrer les conversions
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="startDate">Date de début (optionnelle)</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                placeholder="Date de début"
                            />
                        </div>
                        
                        <div className="space-y-1">
                            <Label htmlFor="endDate">Date de fin (optionnelle)</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder="Date de fin"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilter}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Effacer
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleApplyFilter}
                        >
                            Appliquer
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};