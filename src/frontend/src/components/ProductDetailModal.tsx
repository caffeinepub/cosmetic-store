import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Product, Category } from "../hooks/useQueries";
import { CATEGORY_STYLES } from "./ProductCard";
import { Pencil, Trash2, Package } from "lucide-react";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isAdmin: boolean;
}

export function ProductDetailModal({
  product,
  open,
  onClose,
  onEdit,
  onDelete,
  isAdmin,
}: ProductDetailModalProps) {
  if (!product) return null;

  const catStyle = CATEGORY_STYLES[product.category] ?? CATEGORY_STYLES[Category.skincare];
  const isOutOfStock = Number(product.stockQuantity) === 0;
  const isLowStock = Number(product.stockQuantity) <= 10 && !isOutOfStock;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl bg-card border-border">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto bg-petal overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f9e8ef' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%23c1899a' font-size='14' font-family='serif'%3ENo Image%3C/text%3E%3C/svg%3E";
              }}
            />
            <span
              className={`absolute top-4 left-4 text-[10px] font-body font-500 tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-sm ${catStyle.bg} ${catStyle.text}`}
            >
              {catStyle.label}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-col p-6 md:p-8">
            <DialogHeader className="mb-4 text-left">
              <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
                {product.brand}
              </p>
              <DialogTitle className="font-display text-2xl font-500 text-card-foreground leading-tight">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-display text-3xl font-600 text-primary">
                ${product.price.toFixed(2)}
              </span>
              {isOutOfStock && (
                <span className="text-xs tracking-wider uppercase px-2.5 py-1 rounded-full bg-destructive/15 text-destructive">
                  Sold Out
                </span>
              )}
              {isLowStock && (
                <span className="text-xs tracking-wider uppercase px-2.5 py-1 rounded-full bg-[oklch(0.82_0.12_60/0.2)] text-[oklch(0.45_0.1_60)]">
                  Low Stock
                </span>
              )}
            </div>

            <p               className="text-sm font-body text-muted-foreground leading-relaxed mb-5 grow">
              {product.description}
            </p>

            {/* Stock info */}
            <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-muted/50 border border-border">
              <Package className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-body text-muted-foreground">
                {Number(product.stockQuantity)} units available
              </span>
            </div>

            {/* Admin actions */}
            {isAdmin && (
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border hover:bg-secondary hover:text-secondary-foreground font-body"
                  onClick={() => {
                    onEdit(product);
                    onClose();
                  }}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 font-body"
                  onClick={() => {
                    onDelete(product);
                    onClose();
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
