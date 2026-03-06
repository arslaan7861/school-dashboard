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

import { Loader2, User2, ImagePlus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  createTeacherSchema,
  updateTeacherSchema,
} from "@/features/teachers/validator.teacher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: any;
  onCreate: (data: any, form: FormType) => Promise<any> | void;
  onUpdate: (id: string, data: any, form: FormType) => Promise<any> | void;
  isCreatePending?: boolean;
  isUpdatePending?: boolean;
};

type FormType = UseFormReturn<any>;

interface UpdateDefaults {
  name: string;
  email: string;
  phone: string;
  employeeCode: string;
  joiningDate: string;
  qualification: string;
  [key: string]: any;
}

// Helper function to format date to YYYY-MM-DD for input type="date"
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

export function TeacherFormDialog({
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
    employeeCode: "",
    joiningDate: "",
    qualification: "",
  };

  // Format the joining date when editing
  const updateDefaults: UpdateDefaults = {
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    employeeCode: initial?.employeeCode ?? "",
    joiningDate: formatDateForInput(initial?.joiningDate),
    qualification: initial?.qualification ?? "",
  };

  const schema = useMemo(
    () => (isEdit ? updateTeacherSchema : createTeacherSchema),
    [isEdit],
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? updateDefaults : createDefaults,
  });

  const { reset, handleSubmit, control, formState, watch } = form;
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
      reset({
        name: initial?.name ?? "",
        email: initial?.email ?? "",
        phone: initial?.phone ?? "",
        employeeCode: initial?.employeeCode ?? "",
        joiningDate: formatDateForInput(initial?.joiningDate),
        qualification: initial?.qualification ?? "",
      });
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
    if (!isEdit) return true;

    const formChanged = Object.keys(dirtyFields).length > 0;
    return formChanged || imageChanged;
  }, [dirtyFields, imageChanged, isEdit]);

  /* ---------- SUBMIT ---------- */
  const submit = async (data: any) => {
    try {
      setIsUploading(true);

      if (isEdit) {
        const changedData: any = {};

        // Add changed form fields
        (Object.keys(dirtyFields) as Array<keyof UpdateDefaults>).forEach(
          (key) => {
            changedData[key] = data[key];
          },
        );

        // Add image if changed
        if (imageChanged) {
          changedData.image = image;
        }

        if (Object.keys(changedData).length === 0) {
          toast.info("No changes to update");
          onOpenChange(false);
          return;
        }

        await onUpdate(initial.id, changedData, form);
        toast.success("Teacher updated successfully");
      } else {
        await onCreate({ ...data, image }, form);
        toast.success("Teacher created successfully");
      }
      onOpenChange(false);
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
      ?.slice(0, 2) || "T";

  // Determine button text
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

    return isEdit ? "Update Teacher" : "Create Teacher";
  };

  // Determine if submit should be disabled
  const isSubmitDisabled =
    isPending ||
    isUploading ||
    (!isEdit && Object.keys(dirtyFields).length === 0 && !imageChanged) ||
    (isEdit && Object.keys(dirtyFields).length === 0 && !imageChanged);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="px-6 py-5 border-b bg-muted/40">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <User2 className="w-5 h-5 text-primary" />
            </div>
            {isEdit ? "Update Teacher" : "Create Teacher"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the details below to {isEdit ? "update" : "add"} a teacher
            profile.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(submit)} className="px-6 py-6 space-y-6">
            {/* PROFILE IMAGE UPLOAD */}
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

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* NAME */}
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter full name"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending || isUploading}
                        className="h-10"
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
                        placeholder="Enter email address"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending || isUploading}
                        className="h-10"
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
                        placeholder="Enter phone number"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending || isUploading}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* EMPLOYEE CODE */}
              <FormField
                control={control}
                name="employeeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter employee code"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending || isUploading}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PASSWORD - only for create */}
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
                          placeholder="Enter password"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isPending || isUploading}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* JOINING DATE - Now properly formatted */}
              <FormField
                control={control}
                name="joiningDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joining Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending || isUploading}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* QUALIFICATION */}
              <FormField
                control={control}
                name="qualification"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Qualification</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter qualification (e.g., M.Sc, B.Ed)"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending || isUploading}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ACTION FOOTER */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending || isUploading}
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
