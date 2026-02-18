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

    // Validation métier minimale: éviter les INSERT avec nom vide.
    const nomClient = data.nom?.trim();
    if (!nomClient) {
      throw new Error("Le nom du client est obligatoire");
    }

    // L'ID utilisateur vient de la session Better Auth (string), on le convertit proprement.
    const sessionId = Number(session.user.id);
    if (!Number.isInteger(sessionId)) {
      throw new Error("Session utilisateur invalide");
    }

    // Prisma n'expose pas createOne sur TClients avec le client généré actuel.
    // On passe donc par SQL brut paramétré.
    //
    // Important: TClients possède des triggers actifs en base.
    // SQL Server interdit `OUTPUT ...` direct (sans INTO) sur une table avec trigger.
    // On capture donc la ligne insérée via `OUTPUT ... INTO @Inserted`,
    // puis on fait un SELECT final sur cette table variable.
    const now = new Date();
    const insertedRows = await prisma.$queryRaw<
      Array<{
        ID_Client: number;
        Nom_Client: string;
        Entite: number;
        Session: number;
        Date_Creation: Date;
      }>
    >`
      DECLARE @Inserted TABLE (
        ID_Client INT,
        Nom_Client NVARCHAR(200),
        Entite INT,
        Session INT,
        Date_Creation DATETIME
      );

      INSERT INTO dbo.TClients ([Nom Client], [Entite], [Session], [Date Creation])
      OUTPUT
        INSERTED.[ID Client],
        INSERTED.[Nom Client],
        INSERTED.[Entite],
        INSERTED.[Session],
        INSERTED.[Date Creation]
      INTO @Inserted (ID_Client, Nom_Client, Entite, Session, Date_Creation)
      VALUES (${nomClient}, ${0}, ${sessionId}, ${now});

      SELECT
        I.ID_Client,
        I.Nom_Client,
        I.Entite,
        I.Session,
        I.Date_Creation
      FROM @Inserted AS I;
    `;

    const client = insertedRows[0];
    if (!client) {
      throw new Error("Echec de creation du client");
    }
    
    revalidatePath("/client");
    return { success: true, data: client };
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
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
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
        Entite: 0, // Entité par défaut
      },
    });

    revalidatePath(`/client/${id}`);
    revalidatePath("/client");
    return { success: true, data: client };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' };
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
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}
