"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  createAdminSchema,
  updateAdminSchema,
} from "@/features/admin/validators.admin";

import { Loader2, ImagePlus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: any;
  onCreate: (data: any, form: FormType) => Promise<any> | void;
  onUpdate: (id: number, data: any, form: FormType) => Promise<any> | void;
  isCreatePending?: boolean;
  isUpdatePending?: boolean;
};

type FormType = UseFormReturn<any>;

// Define the shape of update defaults
interface UpdateDefaults {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  [key: string]: any;
}

export function AdminFormDialog({
  open,
  onOpenChange,
  initial,
  onCreate,
  onUpdate,
  isCreatePending = false,
  isUpdatePending = false,
}: Props) {
  const isEdit = !!initial;
  const isPending = isEdit ? isUpdatePending : isCreatePending;

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createDefaults: any = {
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "admin" as UserRole,
  };

  const updateDefaults: UpdateDefaults = {
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    role: initial?.role ?? "admin",
  };

  const schema = useMemo(
    () => (isEdit ? updateAdminSchema : createAdminSchema),
    [isEdit],
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? updateDefaults : createDefaults,
  });

  const { reset, handleSubmit, control, formState } = form;
  const { isSubmitting, dirtyFields } = formState;

  /* ---------- IMAGE PREVIEW ---------- */
  const handleImageChange = (file: File | null) => {
    setImage(file);
    setImageChanged(true);
    setUploadProgress(0);

    if (!file) {
      setPreview(null);
      return;
    }

    // Simulate upload progress (optional)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    const reader = new FileReader();
    reader.onloadend = () => {
      clearInterval(interval);
      setUploadProgress(100);
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setImage(null);
    setPreview(initial?.profilePic || null);
    setImageChanged(false);
    setUploadProgress(0);
  };

  /* ---------- RESET ON OPEN ---------- */
  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      reset(updateDefaults);
      setPreview(initial?.profilePic || null);
    } else {
      reset(createDefaults);
      setPreview(null);
    }

    setImage(null);
    setImageChanged(false);
    setIsUploading(false);
    setUploadProgress(0);
  }, [open, initial, isEdit, reset]);

  /* ---------- CHECK IF ANYTHING CHANGED ---------- */
  const hasChanges = useMemo(() => {
    if (!isEdit) return true; // Create mode always has changes

    // Check if any form field is dirty (changed) OR image changed
    const formChanged = Object.keys(dirtyFields).length > 0;

    return formChanged || imageChanged;
  }, [dirtyFields, imageChanged, isEdit]);

  /* ---------- SUBMIT ---------- */
  const submit = async (data: any) => {
    try {
      setIsUploading(true);

      if (isEdit) {
        // For update, only send changed fields
        const changedData: any = {};

        // Add changed form fields (only the ones that are dirty)
        (Object.keys(dirtyFields) as Array<keyof UpdateDefaults>).forEach(
          (key) => {
            changedData[key] = data[key];
          },
        );

        // Add image if changed (even if no form fields changed)
        if (imageChanged) {
          changedData.image = image;
        }

        // Only proceed if there are changes
        if (Object.keys(changedData).length === 0) {
          toast.info("No changes to update");
          onOpenChange(false);
          return;
        }

        await onUpdate(initial.id, changedData, form);
      } else {
        // For create, send all data including image
        await onCreate({ ...data, image }, form);
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const initials =
    initial?.name
      ?.split(" ")
      ?.map((n: string) => n[0])
      ?.join("")
      ?.toUpperCase()
      ?.slice(0, 2) || "AD";

  // Determine button text and state
  const getButtonContent = () => {
    if (isPending) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {isEdit ? "Updating..." : "Creating..."}
        </>
      );
    }

    if (isUploading) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Uploading {uploadProgress > 0 && `${uploadProgress}%`}...
        </>
      );
    }

    if (isEdit && imageChanged && Object.keys(dirtyFields).length === 0) {
      return (
        <>
          <Upload className="w-4 h-4 mr-2" />
          Upload Image Only
        </>
      );
    }

    return isEdit ? "Update Admin" : "Create Admin";
  };

  // Determine if submit should be disabled
  // FIXED: Button should be enabled if ANY field is dirty OR image changed
  const isSubmitDisabled =
    isPending ||
    isUploading ||
    (!isEdit && Object.keys(dirtyFields).length === 0 && !imageChanged) || // Create mode needs at least one field
    (isEdit && Object.keys(dirtyFields).length === 0 && !imageChanged); // Edit mode needs at least one change

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update Admin" : "Create Admin"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(submit)} className="space-y-5 mt-2">
            {/* IMAGE UPLOAD */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-muted">
                  <AvatarImage src={preview || undefined} />
                  <AvatarFallback className="text-lg bg-primary/10">
                    {isUploading || isPending ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      initials
                    )}
                  </AvatarFallback>
                </Avatar>

                {/* Upload Progress Ring */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      className="text-muted-foreground/20"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="transparent"
                      r="38"
                      cx="48"
                      cy="48"
                    />
                    <circle
                      className="text-primary"
                      strokeWidth="3"
                      strokeDasharray={239}
                      strokeDashoffset={239 - (239 * uploadProgress) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="38"
                      cx="48"
                      cy="48"
                    />
                  </svg>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                    <ImagePlus className="w-4 h-4" />
                    {preview ? "Change Image" : "Upload Image"}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={isPending || isUploading}
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] || null)
                    }
                  />
                </label>

                {imageChanged && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80 transition-colors"
                      disabled={isPending || isUploading}
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </>
                )}
              </div>

              {imageChanged && (
                <Badge variant="outline" className="text-xs">
                  {Object.keys(dirtyFields).length === 0
                    ? "Only image will be updated"
                    : "Image + details will be updated"}
                </Badge>
              )}
            </div>

            <Separator />

            {/* NAME */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending || isUploading}
                      placeholder="Enter full name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EMAIL */}
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending || isUploading}
                      placeholder="Enter email address"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PHONE */}
            <FormField
              control={control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending || isUploading}
                      placeholder="Enter phone number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PASSWORD ONLY CREATE */}
            {!isEdit && (
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        disabled={isPending || isUploading}
                        placeholder="Enter password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isPending || isUploading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="min-w-[140px]"
              >
                {getButtonContent()}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
