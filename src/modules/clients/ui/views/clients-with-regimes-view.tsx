"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsListTab } from "../components/clients-list-tab";
import { RegimesClientsTab } from "../../../regime-client/ui/components/regimes-clients-tab";

interface ClientsWithRegimesViewProps {
    currentPage: number;
}

export const ClientsWithRegimesView = ({ currentPage }: ClientsWithRegimesViewProps) => {
    const [activeTab, setActiveTab] = useState("clients");

    return (
        <div className="flex flex-col gap-y-4">
            <div className="px-4 md:px-8 py-4">
                <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
                <p className="text-muted-foreground">
                    Gérez les clients et leurs régimes de déclaration
                </p>
            </div>

            <div className="px-4 md:px-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="clients">Liste des clients</TabsTrigger>
                        <TabsTrigger value="regimes">Régimes clients</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="clients" className="mt-6">
                        <ClientsListTab />
                    </TabsContent>
                    
                    <TabsContent value="regimes" className="mt-6">
                        <RegimesClientsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};