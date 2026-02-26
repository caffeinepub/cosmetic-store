import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { Category, type Product, type UserProfile } from "../backend.d";
import { createActorWithConfig } from "../config";

export { Category };
export type { Product, UserProfile };

// ── Query Keys ──────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  allProducts: ["products", "all"] as const,
  productsByCategory: (cat: Category) => ["products", "category", cat] as const,
  sortedByPrice: (asc: boolean) => ["products", "sorted", asc] as const,
  search: (term: string) => ["products", "search", term] as const,
};

// ── Queries ──────────────────────────────────────────────────────────────────

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: QUERY_KEYS.allProducts,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFilterByCategory(category: Category | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: QUERY_KEYS.productsByCategory(category as Category),
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.filterByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useGetProductsSortedByPrice(ascending: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: QUERY_KEYS.sortedByPrice(ascending),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsSortedByPrice(ascending);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchProducts(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: QUERY_KEYS.search(searchTerm),
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchProducts(searchTerm.trim());
    },
    enabled: !!actor && !isFetching && searchTerm.trim().length > 0,
  });
}

// ── Auth Queries ─────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["auth", "isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      const actor = await createActorWithConfig();
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useAddProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      brand: string;
      category: Category;
      description: string;
      price: number;
      imageUrl: string;
      stockQuantity: bigint;
    }) => {
      const actor = await createActorWithConfig();
      return actor.addProduct(
        params.name,
        params.brand,
        params.category,
        params.description,
        params.price,
        params.imageUrl,
        params.stockQuantity
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      brand: string;
      category: Category;
      description: string;
      price: number;
      imageUrl: string;
      stockQuantity: bigint;
    }) => {
      const actor = await createActorWithConfig();
      return actor.updateProduct(
        params.id,
        params.name,
        params.brand,
        params.category,
        params.description,
        params.price,
        params.imageUrl,
        params.stockQuantity
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      const actor = await createActorWithConfig();
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
