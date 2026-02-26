import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { type Product, Category } from "../hooks/useQueries";

interface ProductFormData {
  name: string;
  brand: string;
  category: Category;
  description: string;
  price: string;
  imageUrl: string;
  stockQuantity: string;
}

const DEFAULT_FORM: ProductFormData = {
  name: "",
  brand: "",
  category: Category.skincare,
  description: "",
  price: "",
  imageUrl: "",
  stockQuantity: "",
};

const CATEGORY_OPTIONS = [
  { value: Category.skincare, label: "Skincare" },
  { value: Category.makeup, label: "Makeup" },
  { value: Category.haircare, label: "Haircare" },
  { value: Category.fragrance, label: "Fragrance" },
  { value: Category.bodycare, label: "Bodycare" },
];

interface ProductFormProps {
  initialProduct?: Product | null;
  onSubmit: (data: {
    name: string;
    brand: string;
    category: Category;
    description: string;
    price: number;
    imageUrl: string;
    stockQuantity: bigint;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function ProductForm({ initialProduct, onSubmit, onCancel, isPending }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(() =>
    initialProduct
      ? {
          name: initialProduct.name,
          brand: initialProduct.brand,
          category: initialProduct.category,
          description: initialProduct.description,
          price: initialProduct.price.toString(),
          imageUrl: initialProduct.imageUrl,
          stockQuantity: initialProduct.stockQuantity.toString(),
        }
      : DEFAULT_FORM
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  useEffect(() => {
    if (initialProduct) {
      setForm({
        name: initialProduct.name,
        brand: initialProduct.brand,
        category: initialProduct.category,
        description: initialProduct.description,
        price: initialProduct.price.toString(),
        imageUrl: initialProduct.imageUrl,
        stockQuantity: initialProduct.stockQuantity.toString(),
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
  }, [initialProduct]);

  const setField = <K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.brand.trim()) newErrors.brand = "Brand is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) newErrors.price = "Enter a valid price";
    const stock = parseInt(form.stockQuantity, 10);
    if (isNaN(stock) || stock < 0) newErrors.stockQuantity = "Enter a valid stock quantity";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      description: form.description.trim(),
      price: parseFloat(form.price),
      imageUrl: form.imageUrl.trim(),
      stockQuantity: BigInt(parseInt(form.stockQuantity, 10)),
    });
  };

  const inputClass = "bg-background border-input font-body text-sm focus:ring-ring";
  const labelClass = "text-xs font-body tracking-wide text-muted-foreground uppercase";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="pf-name" className={labelClass}>
            Product Name *
          </Label>
          <Input
            id="pf-name"
            className={inputClass}
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Rose Glow Serum"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        {/* Brand */}
        <div className="space-y-1.5">
          <Label htmlFor="pf-brand" className={labelClass}>
            Brand *
          </Label>
          <Input
            id="pf-brand"
            className={inputClass}
            value={form.brand}
            onChange={(e) => setField("brand", e.target.value)}
            placeholder="GlowLab"
          />
          {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label className={labelClass}>Category *</Label>
          <Select
            value={form.category}
            onValueChange={(val) => setField("category", val as Category)}
          >
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="font-body">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <Label htmlFor="pf-price" className={labelClass}>
            Price (USD) *
          </Label>
          <Input
            id="pf-price"
            type="number"
            step="0.01"
            min="0"
            className={inputClass}
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
            placeholder="45.00"
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>

        {/* Stock */}
        <div className="space-y-1.5">
          <Label htmlFor="pf-stock" className={labelClass}>
            Stock Quantity *
          </Label>
          <Input
            id="pf-stock"
            type="number"
            min="0"
            className={inputClass}
            value={form.stockQuantity}
            onChange={(e) => setField("stockQuantity", e.target.value)}
            placeholder="50"
          />
          {errors.stockQuantity && <p className="text-xs text-destructive">{errors.stockQuantity}</p>}
        </div>

        {/* Image URL */}
        <div className="space-y-1.5">
          <Label htmlFor="pf-image" className={labelClass}>
            Image URL
          </Label>
          <Input
            id="pf-image"
            className={inputClass}
            value={form.imageUrl}
            onChange={(e) => setField("imageUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="pf-desc" className={labelClass}>
          Description *
        </Label>
        <Textarea
          id="pf-desc"
          className={`${inputClass} min-h-[80px] resize-none`}
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Product description..."
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-border font-body"
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {initialProduct ? "Updating..." : "Adding..."}
            </>
          ) : initialProduct ? (
            "Update Product"
          ) : (
            "Add Product"
          )}
        </Button>
      </div>
    </form>
  );
}
