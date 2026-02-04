"use client";

import { create } from "zustand";

interface ColisageSearchStore {
    search: string;
    setSearch: (search: string) => void;
}

export const useColisageSearch = create<ColisageSearchStore>((set) => ({
    search: "",
    setSearch: (search: string) => set({ search }),
}));