/**
 * Types pour le module de conversion
 */

export interface Conversion {
    idConvertion: number;
    dateConvertion: Date;
    idEntite: number;
    dateCreation: Date;
    nomCreation: string | null;
}

export interface TauxChange {
    idTauxChange: number;
    idConvertion: number;
    devise: string;
    tauxChange: number;
    dateCreation: Date;
    nomCreation: string | null;
}

export interface CreateConversionInput {
    dateConvertion: Date;
    entite: number;
}

export interface CreateTauxChangeInput {
    convertion: number;
    devise: number;
    tauxChange: number;
}