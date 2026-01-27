"use server";

import  auth  from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * Crée un nouveau client
 * Seul le nom est requis, l'entité 0 (DEFAULT ENTITY) et la session courante sont utilisés
 */
export async function createClient(data: { nom: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

    // 1. Insertion SQL brute dans la table TClients (pas la vue VClients)
    await prisma.$executeRaw`
      INSERT INTO [dbo].[TClients]
        ([Nom Client], [Entite], [Session], [Date Creation])
      VALUES
        (${data.nom}, 0, ${parseInt(session.user.id)}, SYSDATETIME())
    `;

    // 2. Récupération du client créé via la vue VClients
    const client = await prisma.$queryRaw<
      {
        ID_Client: number;
        Nom_Client: string;
        ID_Entite: number;
        Date_Creation: Date;
        Nom_Creation: string;
      }[]
    >`
      SELECT TOP 1
        [ID_Client]     AS ID_Client,
        [Nom_Client]    AS Nom_Client,
        [ID_Entite]     AS ID_Entite,
        [Date_Creation] AS Date_Creation,
        [Nom_Creation]  AS Nom_Creation
      FROM [dbo].[VClients]
      ORDER BY [ID_Client] DESC
    `;

    revalidatePath("/client");
    return { success: true, data: client[0] };
  } catch (error) {
    console.error('Erreur création client:', error);
    return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
}

/**
 * Récupère un client par ID via VClients
 */
export async function getClientById(id: string) {
  try {
    const client = await prisma.vClients.findFirst({
      where: {
        ID_Client: parseInt(id)
      }
    });

    if (!client) {
      return { success: false, error: 'Client non trouvé' };
    }

    // Adapter les noms de colonnes pour correspondre à l'interface attendue par les composants
    const adaptedClient = {
      ID_Client: client.ID_Client,
      Nom_Client: client.Nom_Client,
      ID_Entite: client.ID_Entite,
      Date_Creation: client.Date_Creation,
      Nom_Creation: client.Nom_Creation
    };

    return { success: true, data: adaptedClient };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Récupère tous les clients via VClients
 */
export async function getAllClients(
  page = 1,
  take = 10000,
  search = ""
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

    const whereClause = search ? {
      Nom_Client: {
        contains: search
      }
    } : {};

    const clients = await prisma.vClients.findMany({
      where: whereClause,
      orderBy: {
        Nom_Client: 'asc'
      },
      take: take,
      skip: (page - 1) * take
    });

    // Adapter les noms de colonnes pour correspondre à l'interface attendue par les composants
    const adaptedClients = clients.map(client => ({
      ID_Client: client.ID_Client,
      Nom_Client: client.Nom_Client,
      Date_Creation: client.Date_Creation,
      Nom_Creation: client.Nom_Creation
    }));

    return { success: true, data: adaptedClients, total: adaptedClients.length };
  } catch (error) {
    console.error("getAllClients error:", error);
    return { success: false, error };
  }
}

/**
 * Met à jour un client
 */
export async function updateClient(id: string, data: { nom: string }) {
  try {
    const client = await prisma.tClients.update({
      where: { ID_Client: parseInt(id) },
      data: {
        Nom_Client: data.nom,
      },
    });

    revalidatePath(`/client/${id}`);
    revalidatePath("/client");
    return { success: true, data: client };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Supprime un client
 */
export async function deleteClient(id: string) {
  try {
    const client = await prisma.tClients.delete({
      where: { ID_Client: parseInt(id) },
    });

    revalidatePath("/client");
    return { success: true, data: client };
  } catch (error) {
    return { success: false, error };
  }
}
