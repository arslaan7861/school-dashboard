"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Camera, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";
import {
  useStudent,
  useStudentMutations,
} from "@/features/students/hooks.student";

import {
  updateStudentFormSchema,
  UpdateStudentFormValues,
} from "@/features/students/validator.student";

// Helper to format date for input (YYYY-MM-DD)
const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = Number(params.studentId);
  const sessionId = useAuthStore((s) => s.activeSessionId);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch student data
  const { data: student, isLoading: isLoadingStudent } = useStudent(
    studentId,
    Number(sessionId) || undefined,
  );
  const { updateStudentAsync, isUpdating } = useStudentMutations();
  const form = useForm<UpdateStudentFormValues>({
    resolver: zodResolver(updateStudentFormSchema),
    defaultValues: {
      admissionNo: "",
      name: "",
      gender: undefined,
      dob: "",
      fatherName: "",
      fatherPhone: undefined,
      motherName: "",
      motherPhone: undefined,
      guardianName: "",
      guardianPhone: undefined,
      email: "",
      phone: "",
      password: undefined,
    },
  });

  // Watch form values
  const watchName = form.watch("name");

  // Load student data into form
  useEffect(() => {
    if (student) {
      form.reset({
        admissionNo: student.admissionNo,
        name: student.name,
        gender: student.gender as "male" | "female" | "other" | undefined,
        dob: formatDateForInput(student.dob),
        fatherName: student.fatherName || "",
        fatherPhone: student.fatherPhone || undefined,
        motherName: student.motherName || undefined,
        motherPhone: student.motherPhone || undefined,
        guardianName: student.guardianName || undefined,
        guardianPhone: student.guardianPhone || undefined,
        email: student.user?.email || "",
        phone: student.user?.phone || "",
        password: undefined,
        address: student.address,
      });

      if (student.user?.profilePic) {
        setImagePreview(student.user.profilePic);
      }
    }
  }, [student, form]);

  // Check if form has changes
  const hasChanges = form.formState.isDirty || selectedImage !== null;

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Handle form submission
  const onSubmit = async (data: UpdateStudentFormValues) => {
    try {
      const submitData = { ...data };
      if (!submitData.password) {
        delete submitData.password;
      }

      await updateStudentAsync({
        studentId,
        data: submitData,
        image: selectedImage || undefined,
      });
      toast.success("Student updated successfully");
      router.push(`/students/${studentId}`);
    } catch (error) {
      // Error handled in mutation
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelDialog(true);
    } else {
      router.push(`/students/${studentId}`);
    }
  };

  // Loading state
  if (isLoadingStudent) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Student not found</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full space-y-6 py-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Student
          </h1>
          <p className="text-sm text-muted-foreground">
            {student.name} • {student.admissionNo}
          </p>
        </div>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Image - Full Width */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-40 w-40">
                      <AvatarImage src={imagePreview || undefined} />
                      <AvatarFallback className="bg-muted text-lg">
                        {watchName ? watchName[0].toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-background"
                      onClick={() =>
                        document.getElementById("profile-image")?.click()
                      }
                    >
                      <Camera className="h-3 w-3" />
                    </Button>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-background"
                        onClick={handleRemoveImage}
                      >
                        <span className="text-sm">×</span>
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-center text-muted-foreground">
                    <p>Click the camera icon to update photo</p>
                    <p className="text-xs">JPG, PNG • Max 5MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid Layout for Form Sections */}
            {/* Personal Information */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="admissionNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Admission Number
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Gender</FormLabel>

                        <Select
                          value={field.value ?? "male"}
                          onValueChange={(value) => {
                            console.log("value updated ", value);
                            field.onChange(value ?? undefined);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectItem value="unselected">
                              Select Gender
                            </SelectItem>

                            <SelectItem value="male">Male</SelectItem>

                            <SelectItem value="female">Female</SelectItem>

                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2 lg:col-span-4">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <textarea
                            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="House No., Street, City, State - Pincode"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Complete residential address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Phone</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Leave blank to keep current"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Min. 6 characters if changing
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Guardian Information - Spans 2 columns on large screens */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">
                  Guardian Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Father's Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Father's Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fatherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fatherPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Phone</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Mother's Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Mother's Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="motherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="motherPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Phone</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Guardian's Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Guardian's Details (if different)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="guardianName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guardianPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Phone</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || !hasChanges}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
          <div className="h-10 w-full "></div>
        </form>
      </Form>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={router.back}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
