export type RegimeDeclarationWithDouanier = {
  id: number;
  libelleRegimeDeclaration: string;
  tauxDC: number;
  regimeDouanier: number;
  dateCreation: string | Date;
  tRegimesDouaniers?: {
    id: number;
    libelleRegimeDouanier: string;
  } | null;
};
