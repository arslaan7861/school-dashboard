"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, UploadCloud, X, Image as ImageIcon, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { ImageCropper } from "@/components/ui/image-cropper";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

import { AnnouncementAudience } from "@/features/announcement/types.announcement";
import { useCreateAnnouncement } from "@/features/announcement/hooks.announcement";
import { useClasses } from "@/features/class/hooks.class";
import { useAuthStore } from "@/store/authStore";
import { useAnnouncementModalStore, closeCreateAnnouncementModal } from "@/store/modals/announcement.modal.store";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters"),
  audienceType: z.nativeEnum(AnnouncementAudience),
  classIds: z.array(z.number()).optional(),
  sendNotification: z.boolean().default(false),
  files: z.any().optional(),
}).refine(
  (data) => {
    if (data.audienceType === AnnouncementAudience.CLASS && (!data.classIds || data.classIds.length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: "Please select at least one class",
    path: ["classIds"],
  }
);

type FormValues = z.infer<typeof formSchema>;

export function CreateAnnouncementModal() {
  const { isOpen, announcementData, onSuccess } = useAnnouncementModalStore((s) => s.createAnnouncementModal);
  
  const activeSessionId = useAuthStore((s) => s.activeSessionId);
  const { data: classesData, isLoading: isLoadingClasses } = useClasses(activeSessionId || undefined);
  const classes = classesData?.data || [];

  const createMutation = useCreateAnnouncement();

  const [files, setFiles] = useState<File[]>([]);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [currentImageToCrop, setCurrentImageToCrop] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      message: "",
      audienceType: AnnouncementAudience.ALL,
      classIds: [],
      sendNotification: true,
    },
  });

  const audienceType = form.watch("audienceType");

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: "",
        message: "",
        audienceType: AnnouncementAudience.ALL,
        classIds: [],
        sendNotification: true,
      });
      setFiles([]);
    }
  }, [isOpen, form]);

  const onDrop = (acceptedFiles: File[]) => {
    const imageFile = acceptedFiles.find((f) => f.type.startsWith("image/"));
    if (imageFile) {
      setCurrentImageToCrop(imageFile);
      setCropDialogOpen(true);
      
      const otherFiles = acceptedFiles.filter((f) => f !== imageFile);
      if (otherFiles.length > 0) {
        setFiles((prev: File[]) => [...prev, ...otherFiles]);
      }
    } else {
      setFiles((prev: File[]) => [...prev, ...acceptedFiles]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev: File[]) => prev.filter((_: File, i: number) => i !== index));
  };

  if (!isOpen) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      if (!activeSessionId) {
        toast.error("No active session found");
        return;
      }

        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("message", values.message);
        formData.append("sessionId", activeSessionId.toString());
        formData.append("audienceType", values.audienceType);
        
        if (values.audienceType === AnnouncementAudience.CLASS && values.classIds) {
          formData.append("classIds", JSON.stringify(values.classIds));
        }
        
        formData.append("sendNotification", values.sendNotification ? "true" : "false");

      if (files.length > 0) {
        files.forEach((file: File) => {
          formData.append("files", file);
        });
      }

      await createMutation.mutateAsync(formData);
      toast.success("Announcement created successfully");

      closeCreateAnnouncementModal();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  const isLoading = createMutation.isPending;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={closeCreateAnnouncementModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>
              Publish a new announcement to students and parents.
            </DialogDescription>
          </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-4 p-1">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter announcement title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your announcement message here..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="audienceType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                          <FormLabel>Audience</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={AnnouncementAudience.ALL} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  All Students (School-wide)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={AnnouncementAudience.CLASS} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Specific Classes
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {audienceType === AnnouncementAudience.CLASS && (
                      <FormField
                        control={form.control}
                        name="classIds"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Select Classes</FormLabel>
                              <FormDescription>
                                Choose which classes will receive this announcement.
                              </FormDescription>
                            </div>
                            
                            {isLoadingClasses ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-md bg-muted/20">
                                {classes.map((cls: any) => (
                                  <FormField
                                    key={cls.id}
                                    control={form.control}
                                    name="classIds"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={cls.id}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(cls.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...(field.value || []), cls.id])
                                                  : field.onChange(
                                                      field.value?.filter((value) => value !== cls.id)
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal text-sm">
                                            {cls.name} - {cls.section}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="sendNotification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm mt-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Send Push Notification
                            </FormLabel>
                            <FormDescription>
                              Notify targeted students immediately on their devices.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="mt-4">
                      <FormLabel>Attachments (Optional)</FormLabel>
                      <div
                        {...getRootProps()}
                        className={`mt-2 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                          isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
                        }`}
                      >
                        <input {...getInputProps()} />
                        <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Drag & drop files here, or click to select</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOCX, PNG, JPG</p>
                      </div>

                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium">Selected Files</p>
                          <div className="flex flex-col gap-2">
                            {files.map((file: File, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 border rounded-md bg-muted/20"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  {file.type.startsWith("image/") ? (
                                    <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                                  ) : (
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                  )}
                                  <span className="text-xs font-medium truncate max-w-[200px] sm:max-w-[300px]">
                                    {file.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-3 pt-4 border-t mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={closeCreateAnnouncementModal}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Announcement
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <ImageCropper
      open={cropDialogOpen}
      onOpenChange={setCropDialogOpen}
      imageFile={currentImageToCrop}
      onCropComplete={(croppedFile) => {
        setFiles((prev: File[]) => [...prev, croppedFile]);
        setCurrentImageToCrop(null);
      }}
    />
  </>
  );
}
