import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { type Product, Category } from "../hooks/useQueries";

// Category badge colors
const CATEGORY_STYLES: Record<Category, { bg: string; text: string; label: string }> = {
  [Category.skincare]: {
    bg: "bg-[oklch(0.94_0.04_150/0.25)]",
    text: "text-[oklch(0.35_0.08_150)]",
    label: "Skincare",
  },
  [Category.makeup]: {
    bg: "bg-[oklch(0.94_0.04_355/0.35)]",
    text: "text-[oklch(0.38_0.09_355)]",
    label: "Makeup",
  },
  [Category.haircare]: {
    bg: "bg-[oklch(0.94_0.04_60/0.35)]",
    text: "text-[oklch(0.42_0.09_60)]",
    label: "Haircare",
  },
  [Category.fragrance]: {
    bg: "bg-[oklch(0.93_0.04_290/0.3)]",
    text: "text-[oklch(0.38_0.08_290)]",
    label: "Fragrance",
  },
  [Category.bodycare]: {
    bg: "bg-[oklch(0.94_0.04_35/0.3)]",
    text: "text-[oklch(0.42_0.08_35)]",
    label: "Bodycare",
  },
};

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  className?: string;
  animationClass?: string;
  isWishlisted?: boolean;
  onWishlistToggle?: (product: Product) => Promise<void>;
  isAuthenticated?: boolean;
}

export function ProductCard({
  product,
  onClick,
  className = "",
  animationClass = "",
  isWishlisted = false,
  onWishlistToggle,
  isAuthenticated = false,
}: ProductCardProps) {
  const catStyle = CATEGORY_STYLES[product.category] ?? CATEGORY_STYLES[Category.skincare];
  const isLowStock = Number(product.stockQuantity) <= 10;
  const isOutOfStock = Number(product.stockQuantity) === 0;
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || !onWishlistToggle || isTogglingWishlist) return;
    setIsTogglingWishlist(true);
    try {
      await onWishlistToggle(product);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <button
      type="button"
      className={`product-card bg-card rounded-xl cursor-pointer group page-fade-in ${animationClass} ${className} text-left w-full`}
      onClick={() => onClick(product)}
      aria-label={`View ${product.name} by ${product.brand}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-xl aspect-[4/3] bg-petal">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f9e8ef' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%23c1899a' font-size='14' font-family='serif'%3ENo Image%3C/text%3E%3C/svg%3E";
          }}
        />
        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 text-[10px] font-body font-500 tracking-widest uppercase px-2.5 py-1 rounded-full backdrop-blur-sm ${catStyle.bg} ${catStyle.text}`}
        >
          {catStyle.label}
        </span>

        {/* Wishlist heart button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          title={
            !isAuthenticated
              ? "Login to save to wishlist"
              : isWishlisted
              ? "Remove from wishlist"
              : "Save to wishlist"
          }
          className={`
            absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center
            backdrop-blur-sm transition-all duration-200
            ${isAuthenticated
              ? isWishlisted
                ? "bg-rose-50/90 text-rose-500 shadow-sm hover:bg-rose-100/90 hover:scale-110"
                : "bg-white/70 text-muted-foreground hover:text-rose-400 hover:bg-white/90 hover:scale-110"
              : "bg-white/50 text-muted-foreground/40 cursor-not-allowed"
            }
          `}
          disabled={!isAuthenticated || isTogglingWishlist}
        >
          {isTogglingWishlist ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Heart
              className={`w-3.5 h-3.5 transition-all duration-200 ${
                isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : ""
              }`}
            />
          )}
        </button>

        {/* Stock badge */}
        {isOutOfStock && (
          <span className="absolute top-3 right-3 text-[10px] font-body tracking-wider uppercase px-2.5 py-1 rounded-full bg-destructive/15 text-destructive backdrop-blur-sm">
            Sold Out
          </span>
        )}
        {isLowStock && !isOutOfStock && (
          <span className="absolute top-3 right-3 text-[10px] font-body tracking-wider uppercase px-2.5 py-1 rounded-full bg-[oklch(0.82_0.12_60/0.2)] text-[oklch(0.45_0.1_60)] backdrop-blur-sm">
            Low Stock
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs font-body text-muted-foreground tracking-widest uppercase mb-1">
          {product.brand}
        </p>
        <h3 className="font-display text-base font-500 text-card-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="font-display text-lg font-600 text-primary">
            ₹{product.price.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground font-body">
            {Number(product.stockQuantity)} in stock
          </span>
        </div>
      </div>
    </button>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden">
      <div className="aspect-[4/3] shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 shimmer rounded-full" />
        <div className="h-4 w-3/4 shimmer rounded-md" />
        <div className="h-3 w-1/2 shimmer rounded-md" />
        <div className="flex justify-between mt-3">
          <div className="h-5 w-16 shimmer rounded-md" />
          <div className="h-3 w-20 shimmer rounded-md" />
        </div>
      </div>
    </div>
  );
}

export { CATEGORY_STYLES };
