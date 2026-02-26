import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, UserCircle2, LogOut, ShieldCheck, Calendar, User, Heart, Trash2 } from "lucide-react";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
  useIsCallerAdmin,
  useGetCallerWishlist,
  useRemoveFromWishlist,
} from "@/hooks/useQueries";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function ProfileSheet({ open, onOpenChange, onLogout, isAuthenticated = false }: ProfileSheetProps) {
  const queryClient = useQueryClient();
  const profileQuery = useGetCallerUserProfile(isAuthenticated);
  const adminQuery = useIsCallerAdmin(isAuthenticated);
  const saveProfile = useSaveCallerUserProfile();
  const wishlistQuery = useGetCallerWishlist(isAuthenticated);
  const removeFromWishlist = useRemoveFromWishlist();

  const currentName = profileQuery.data?.name ?? "";
  const isAdmin = adminQuery.data ?? false;

  const [nameInput, setNameInput] = useState(currentName);
  const [avatarVisible, setAvatarVisible] = useState(false);

  // Sync nameInput when profile data loads or changes
  useEffect(() => {
    setNameInput(currentName);
  }, [currentName]);

  // Trigger avatar entrance animation when sheet opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setAvatarVisible(true), 80);
      return () => clearTimeout(timer);
    } else {
      setAvatarVisible(false);
    }
  }, [open]);

  const initials = nameInput.trim() ? getInitials(nameInput) : "?";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    try {
      await saveProfile.mutateAsync({ name: trimmed });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] }),
        queryClient.invalidateQueries({ queryKey: ["auth", "isAdmin"] }),
      ]);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const handleLogoutClick = () => {
    onOpenChange(false);
    onLogout?.();
  };

  const isDirty = nameInput.trim() !== currentName && nameInput.trim() !== "";
  const wishlistItems = wishlistQuery.data ?? [];

  const handleRemoveFromWishlist = async (productId: bigint) => {
    try {
      await removeFromWishlist.mutateAsync(productId);
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove from wishlist");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-sm bg-card border-border flex flex-col"
      >
        <SheetHeader className="pb-0">
          <SheetTitle className="font-display text-xl text-card-foreground">
            My Profile
          </SheetTitle>
          <SheetDescription className="font-body text-xs text-muted-foreground tracking-wider">
            Manage your personal details
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-5 bg-border" />

        {/* Wishlist section */}
        <div className="mb-1">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-rose-400" />
            <p className="font-body text-xs tracking-wider uppercase text-muted-foreground">
              Wishlist
            </p>
            {wishlistItems.length > 0 && (
              <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-500 text-[10px] font-body font-600">
                {wishlistItems.length}
              </span>
            )}
          </div>

          {wishlistQuery.isLoading ? (
            <div className="flex items-center gap-2 py-3 px-3 rounded-lg bg-background border border-border">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="font-body text-xs text-muted-foreground">Loading wishlist...</span>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-5 rounded-lg bg-background border border-border border-dashed">
              <Heart className="w-6 h-6 text-muted-foreground/40" />
              <p className="font-body text-xs text-muted-foreground text-center">
                No saved products yet
              </p>
              <p className="font-body text-[10px] text-muted-foreground/60 text-center">
                Tap the heart on any product to save it
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-48 rounded-lg">
              <div className="space-y-1.5 pr-1">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id.toString()}
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2 bg-background border border-border group/wishitem hover:border-rose-200 transition-colors"
                  >
                    {/* Product image */}
                    <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-petal">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect fill='%23f9e8ef' width='40' height='40'/%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs text-foreground font-500 truncate leading-snug">
                        {item.name}
                      </p>
                      <p className="font-display text-xs text-primary font-600">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      aria-label={`Remove ${item.name} from wishlist`}
                      disabled={removeFromWishlist.isPending}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover/wishitem:opacity-100 shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <Separator className="my-4 bg-border" />

        {/* Avatar + role badge */}
        <div
          className="flex flex-col items-center gap-3 py-4"
          style={{
            opacity: avatarVisible ? 1 : 0,
            transform: avatarVisible ? "scale(1) translateY(0)" : "scale(0.92) translateY(8px)",
            transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div className="relative">
            {/* Decorative rose-gold ring */}
            <div
              className="absolute -inset-2 rounded-full pointer-events-none"
              style={{
                background:
                  "conic-gradient(from 180deg, oklch(0.72 0.08 35 / 0.3), transparent 40%, oklch(0.72 0.08 35 / 0.3) 70%, transparent)",
              }}
            />
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-display font-600 select-none shadow-lg relative"
              style={{
                background: isAdmin
                  ? "oklch(0.38 0.07 330 / 0.12)"
                  : "oklch(0.91 0.04 355 / 0.5)",
                border: isAdmin
                  ? "2px solid oklch(0.38 0.07 330 / 0.3)"
                  : "2px solid oklch(0.72 0.08 35 / 0.3)",
                color: isAdmin
                  ? "oklch(0.38 0.07 330)"
                  : "oklch(0.52 0.04 320)",
              }}
            >
              {nameInput.trim() ? (
                initials
              ) : (
                <UserCircle2 className="w-12 h-12 opacity-40" />
              )}
            </div>
          </div>

          {/* Name display */}
          {currentName && (
            <p className="font-display text-base text-foreground font-500 tracking-wide">
              {currentName}
            </p>
          )}

          <Badge
            className={
              isAdmin
                ? "font-body text-xs tracking-widest uppercase px-3 py-0.5 bg-primary/10 text-primary border-primary/30 border"
                : "font-body text-xs tracking-widest uppercase px-3 py-0.5 bg-muted text-muted-foreground border-border border"
            }
          >
            {isAdmin ? "Admin" : "Member"}
          </Badge>
        </div>

        <Separator className="my-5 bg-border" />

        {/* Edit form */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col gap-5 overflow-y-auto">
          <div className="space-y-2">
            <Label
              htmlFor="profile-sheet-name"
              className="font-body text-xs tracking-wider uppercase text-muted-foreground"
            >
              Display Name
            </Label>
            <Input
              id="profile-sheet-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name..."
              className="bg-background border-border font-body text-sm"
              autoComplete="name"
            />
            <p className="text-xs text-muted-foreground font-body">
              This name will appear across your LUMIÈRE account.
            </p>
          </div>

          <Button
            type="submit"
            disabled={!isDirty || saveProfile.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body text-sm"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Update Name"
            )}
          </Button>

          <Separator className="bg-border" />

          {/* Account Info */}
          <div className="space-y-1">
            <p className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-3">
              Account
            </p>

            {/* Role row */}
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 bg-background border border-border">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {isAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs text-muted-foreground tracking-wide">Role</p>
                <p className="font-body text-sm text-foreground font-500">
                  {isAdmin ? "Administrator" : "Member"}
                </p>
              </div>
              <Badge
                className={
                  isAdmin
                    ? "font-body text-[10px] tracking-widest uppercase px-2 py-0 bg-primary/10 text-primary border-primary/30 border"
                    : "font-body text-[10px] tracking-widest uppercase px-2 py-0 bg-muted text-muted-foreground border-border border"
                }
              >
                {isAdmin ? "Admin" : "Member"}
              </Badge>
            </div>

            {/* Member since row */}
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 bg-background border border-border">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs text-muted-foreground tracking-wide">Member Since</p>
                <p className="font-body text-sm text-foreground font-500">2026</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          {onLogout && (
            <>
              <Separator className="bg-border" />
              <div className="mt-auto pb-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/60 font-body text-sm gap-2 transition-colors"
                  onClick={handleLogoutClick}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
