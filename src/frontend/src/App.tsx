import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
  LogIn,
  LogOut,
  Plus,
  Loader2,
  User,
  X,
} from "lucide-react";
import { createActorWithConfig } from "./config";
import {
  useGetAllProducts,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
  useIsCallerAdmin,
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
  useGetCallerWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
  Category,
  type Product,
} from "./hooks/useQueries";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { ProductCard, ProductCardSkeleton } from "./components/ProductCard";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { ProductForm } from "./components/ProductForm";
import { ProfileSheet } from "./components/ProfileSheet";
import { useDebounce } from "./hooks/useDebounce";

// ── Seed Data ─────────────────────────────────────────────────────────────────

const SEED_PRODUCTS = [
  {
    name: "Rose Glow Serum",
    brand: "GlowLab",
    category: Category.skincare,
    description: "Hydrating vitamin C serum with rose hip oil for radiant skin.",
    price: 45.0,
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
    stockQuantity: BigInt(50),
  },
  {
    name: "Velvet Matte Lipstick",
    brand: "LuxeBeauty",
    category: Category.makeup,
    description: "Long-lasting matte formula in 20 shades.",
    price: 28.0,
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4e6232bf2f9b?w=400",
    stockQuantity: BigInt(120),
  },
  {
    name: "Argan Silk Shampoo",
    brand: "HairLux",
    category: Category.haircare,
    description: "Nourishing shampoo with argan oil for silky smooth hair.",
    price: 32.0,
    imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400",
    stockQuantity: BigInt(75),
  },
  {
    name: "Midnight Rose Parfum",
    brand: "Essence Co.",
    category: Category.fragrance,
    description: "A captivating floral musk with notes of rose, oud, and vanilla.",
    price: 95.0,
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400",
    stockQuantity: BigInt(30),
  },
  {
    name: "Shea Body Butter",
    brand: "NatureSoft",
    category: Category.bodycare,
    description: "Rich moisturizing body butter with shea and cocoa.",
    price: 22.0,
    imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400",
    stockQuantity: BigInt(60),
  },
  {
    name: "Hydra-Boost Eye Cream",
    brand: "DermaPure",
    category: Category.skincare,
    description: "Reduces dark circles and puffiness with hyaluronic acid.",
    price: 55.0,
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    stockQuantity: BigInt(40),
  },
];

const SEED_KEY = "lumiere_seeded_v1";

// ── Category Tabs ─────────────────────────────────────────────────────────────

type ActiveCategory = "all" | Category;

const CATEGORY_TABS: { value: ActiveCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: Category.skincare, label: "Skincare" },
  { value: Category.makeup, label: "Makeup" },
  { value: Category.haircare, label: "Haircare" },
  { value: Category.fragrance, label: "Fragrance" },
  { value: Category.bodycare, label: "Bodycare" },
];

// ── Profile Setup Dialog ──────────────────────────────────────────────────────

interface ProfileSetupDialogProps {
  open: boolean;
  onSubmit: (name: string) => Promise<void>;
  isPending: boolean;
}

function ProfileSetupDialog({ open, onSubmit, isPending }: ProfileSetupDialogProps) {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name.trim());
  };

  return (
    <Dialog open={open}>
        <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-petal flex items-center justify-center mb-3">
            <User className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="font-display text-2xl text-card-foreground">
            Welcome to LUMIÈRE
          </DialogTitle>
          <DialogDescription className="font-body text-muted-foreground text-sm">
            Tell us your name to personalize your experience.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2">
          <div className="space-y-3">
            <Label htmlFor="profile-name" className="font-body text-xs tracking-wider uppercase text-muted-foreground">
              Your Name
            </Label>
            <Input
              id="profile-name"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border font-body"
              autoFocus
            />
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const queryClient = useQueryClient();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  // Admin status via real backend query
  const adminQuery = useIsCallerAdmin(isAuthenticated);
  const isAdmin = isAuthenticated && (adminQuery.data ?? false);

  // User profile
  const profileQuery = useGetCallerUserProfile(isAuthenticated);
  const saveProfile = useSaveCallerUserProfile();

  // Show profile setup only after we know the user is logged in and has no profile
  const showProfileSetup =
    isAuthenticated &&
    !profileQuery.isLoading &&
    profileQuery.isFetched &&
    profileQuery.data === null;

  // ── UI State ──────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("all");
  const [sortAscending, setSortAscending] = useState<boolean | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adminSheetOpen, setAdminSheetOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [seeded, setSeeded] = useState(false);

  // Mutations
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Wishlist
  const wishlistQuery = useGetCallerWishlist(isAuthenticated);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  // Set of wishlisted product IDs for O(1) lookups
  const wishlistedIds = useMemo<Set<string>>(() => {
    const items = wishlistQuery.data ?? [];
    return new Set(items.map((p) => p.id.toString()));
  }, [wishlistQuery.data]);

  const wishlistCount = wishlistQuery.data?.length ?? 0;

  // Seed on first load
  useEffect(() => {
    const alreadySeeded = localStorage.getItem(SEED_KEY);
    if (alreadySeeded) {
      setSeeded(true);
      return;
    }
    let cancelled = false;
    const seed = async () => {
      try {
        const actor = await createActorWithConfig();
        await Promise.all(
          SEED_PRODUCTS.map((p) =>
            actor.addProduct(p.name, p.brand, p.category, p.description, p.price, p.imageUrl, p.stockQuantity)
          )
        );
        if (!cancelled) {
          localStorage.setItem(SEED_KEY, "1");
          setSeeded(true);
        }
      } catch {
        if (!cancelled) setSeeded(true);
      }
    };
    seed();
    return () => { cancelled = true; };
  }, []);

  // Data fetching
  const allProductsQuery = useGetAllProducts();

  // Filtered / sorted products derived from allProductsQuery.data
  const displayedProducts = useMemo<Product[]>(() => {
    const all = allProductsQuery.data ?? [];
    if (!seeded && all.length === 0) return [];

    let products = [...all];

    // Search filter
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (activeCategory !== "all") {
      products = products.filter((p) => p.category === activeCategory);
    }

    // Sort
    if (sortAscending !== null) {
      products = [...products].sort((a, b) =>
        sortAscending ? a.price - b.price : b.price - a.price
      );
    }

    return products;
  }, [allProductsQuery.data, debouncedSearch, activeCategory, sortAscending, seeded]);

  const isLoading = allProductsQuery.isLoading || !seeded;

  // ── Auth Handlers ─────────────────────────────────────────────────────────

  const handleLogin = useCallback(async () => {
    try {
      await login();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      } else {
        console.error("Login error:", error);
      }
    }
  }, [login, clear]);

  const handleLogout = useCallback(async () => {
    await clear();
    queryClient.clear();
  }, [clear, queryClient]);

  const handleSaveProfile = useCallback(async (name: string) => {
    try {
      await saveProfile.mutateAsync({ name });
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  }, [saveProfile]);

  // ── Product Handlers ──────────────────────────────────────────────────────

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  }, []);

  const handleEditFromDetail = useCallback((product: Product) => {
    setEditingProduct(product);
    setAdminSheetOpen(true);
  }, []);

  const handleDeleteFromDetail = useCallback((product: Product) => {
    setDeleteTarget(product);
  }, []);

  const handleAddOrUpdate = useCallback(
    async (data: {
      name: string;
      brand: string;
      category: Category;
      description: string;
      price: number;
      imageUrl: string;
      stockQuantity: bigint;
    }) => {
      try {
        if (editingProduct) {
          await updateProduct.mutateAsync({ ...data, id: editingProduct.id });
          toast.success("Product updated successfully");
        } else {
          await addProduct.mutateAsync(data);
          toast.success("Product added successfully");
        }
        setAdminSheetOpen(false);
        setEditingProduct(null);
      } catch {
        toast.error(editingProduct ? "Failed to update product" : "Failed to add product");
      }
    },
    [editingProduct, addProduct, updateProduct]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete product");
    }
  }, [deleteTarget, deleteProduct]);

  const openAddProduct = () => {
    setEditingProduct(null);
    setAdminSheetOpen(true);
  };

  const handleWishlistToggle = useCallback(async (product: Product) => {
    if (!isAuthenticated) return;
    const isWishlisted = wishlistedIds.has(product.id.toString());
    try {
      if (isWishlisted) {
        await removeFromWishlist.mutateAsync(product.id);
        toast.success(`Removed from wishlist`);
      } else {
        await addToWishlist.mutateAsync(product.id);
        toast.success(`Added to wishlist`);
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  }, [isAuthenticated, wishlistedIds, addToWishlist, removeFromWishlist]);

  const isFormPending = addProduct.isPending || updateProduct.isPending;

  // Display name for logged-in user
  const displayName = profileQuery.data?.name;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" />

      {/* Profile Setup Dialog */}
      <ProfileSetupDialog
        open={showProfileSetup}
        onSubmit={handleSaveProfile}
        isPending={saveProfile.isPending}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex flex-col items-start">
            <span className="lumiere-brand text-xl text-foreground tracking-[0.25em]">
              LUMIÈRE
            </span>
            <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-body -mt-0.5">
              Beauty Essentials
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Add Product — admin only */}
            {isAdmin && (
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-body text-xs gap-1.5 hidden sm:flex"
                onClick={openAddProduct}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Product
              </Button>
            )}

            {/* Auth button */}
            {isInitializing ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="font-body text-xs gap-1.5 border-border"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </Button>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Profile button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="font-body text-xs gap-1.5 border-border hover:bg-secondary relative"
                  onClick={() => setProfileSheetOpen(true)}
                  aria-label="Open profile"
                >
                  <User className="w-3.5 h-3.5" />
                  {displayName && (
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {displayName}
                    </span>
                  )}
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-body font-600 leading-none">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="font-body text-xs gap-1.5 border-border hover:bg-secondary"
                  onClick={handleLogout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="font-body text-xs gap-1.5 border-border hover:bg-secondary"
                onClick={handleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="h-[280px] sm:h-[360px] relative">
            <img
              src="/assets/generated/cosmetics-hero.dim_1200x400.jpg"
              alt="Luxury cosmetics collection"
              className="w-full h-full object-cover"
            />
            <div className="hero-overlay absolute inset-0" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-500 tracking-wide mb-3 rose-gold-underline">
                Beauty Essentials
              </h1>
              <p className="text-white/80 font-body text-sm sm:text-base tracking-widest uppercase mt-4">
                Curated Luxury · Timeless Elegance
              </p>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 bg-card border-border font-body text-sm pr-8"
                placeholder="Search products, brands..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <Button
              variant="outline"
              size="sm"
              className={`border-border font-body text-xs gap-1.5 shrink-0 ${
                sortAscending !== null ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary"
              }`}
              onClick={() =>
                setSortAscending((prev) =>
                  prev === null ? true : prev === true ? false : null
                )
              }
            >
              {sortAscending === null ? (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Sort by Price
                </>
              ) : sortAscending ? (
                <>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Price: Low → High
                </>
              ) : (
                <>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Price: High → Low
                </>
              )}
            </Button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-body tracking-wider transition-all duration-200 ${
                  activeCategory === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}
                onClick={() => setActiveCategory(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="container max-w-7xl mx-auto px-4 pb-16">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
                <ProductCardSkeleton key={key} />
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-petal flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl text-foreground mb-2">No products found</h2>
              <p className="text-muted-foreground font-body text-sm max-w-xs">
                {debouncedSearch
                  ? `No results for "${debouncedSearch}". Try a different search term.`
                  : "No products in this category yet."}
              </p>
              {(debouncedSearch || activeCategory !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-6 border-border font-body"
                  onClick={() => {
                    setSearchInput("");
                    setActiveCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground font-body tracking-wider mb-4">
                {displayedProducts.length} product{displayedProducts.length !== 1 ? "s" : ""}
                {activeCategory !== "all" ? ` in ${activeCategory}` : ""}
                {debouncedSearch ? ` matching "${debouncedSearch}"` : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((product, i) => (
                  <ProductCard
                    key={product.id.toString()}
                    product={product}
                    onClick={handleProductClick}
                    animationClass={`stagger-${Math.min(i + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}`}
                    isWishlisted={wishlistedIds.has(product.id.toString())}
                    onWishlistToggle={handleWishlistToggle}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="lumiere-brand text-sm text-muted-foreground tracking-[0.2em]">
            LUMIÈRE
          </span>
          <p className="text-xs font-body text-muted-foreground flex items-center gap-1">
            © 2026. Built with{" "}
            <Heart className="w-3 h-3 text-primary fill-primary" />{" "}
            using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
        isAdmin={isAdmin}
      />

      {/* Admin Sheet */}
      <Sheet
        open={adminSheetOpen}
        onOpenChange={(v) => {
          if (!v) {
            setAdminSheetOpen(false);
            setEditingProduct(null);
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-border">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-display text-xl text-card-foreground">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductForm
            initialProduct={editingProduct}
            onSubmit={handleAddOrUpdate}
            onCancel={() => {
              setAdminSheetOpen(false);
              setEditingProduct(null);
            }}
            isPending={isFormPending}
          />
        </SheetContent>
      </Sheet>

      {/* Profile Sheet */}
      <ProfileSheet
        open={profileSheetOpen}
        onOpenChange={setProfileSheetOpen}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">Delete Product?</AlertDialogTitle>
            <AlertDialogDescription className="font-body text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-500 text-foreground">{deleteTarget?.name}</span>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
            >
              {deleteProduct.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
