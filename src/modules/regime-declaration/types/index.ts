export type RegimeDeclarationWithDouanier = {
  id: number;
  libelleRegimeDeclaration: string;
  tauxRegime: number;
  regimeDouanier: number;
  dateCreation: string | Date;
  tRegimesDouaniers?: {
    id: number;
    libelleRegimeDouanier: string;
  } | null;
};
