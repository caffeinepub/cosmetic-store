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
import { Loader2, UserCircle2 } from "lucide-react";
import { useGetCallerUserProfile, useSaveCallerUserProfile } from "@/hooks/useQueries";
import { useIsCallerAdmin } from "@/hooks/useQueries";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const queryClient = useQueryClient();
  const profileQuery = useGetCallerUserProfile();
  const adminQuery = useIsCallerAdmin();
  const saveProfile = useSaveCallerUserProfile();

  const currentName = profileQuery.data?.name ?? "";
  const isAdmin = adminQuery.data ?? false;

  const [nameInput, setNameInput] = useState(currentName);

  // Sync nameInput when profile data loads or changes
  useEffect(() => {
    setNameInput(currentName);
  }, [currentName]);

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
      toast.success("Profile saved successfully");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const isDirty = nameInput.trim() !== currentName && nameInput.trim() !== "";

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

        {/* Avatar + role badge */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-600 select-none shadow-lg"
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
                <UserCircle2 className="w-10 h-10 opacity-40" />
              )}
            </div>
            {/* Decorative rose-gold ring */}
            <div
              className="absolute -inset-1.5 rounded-full pointer-events-none"
              style={{
                background:
                  "conic-gradient(from 180deg, oklch(0.72 0.08 35 / 0.25), transparent, oklch(0.72 0.08 35 / 0.25))",
              }}
            />
          </div>

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
        <form onSubmit={handleSave} className="flex-1 flex flex-col gap-5">
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

          <div className="mt-auto pt-2">
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
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
