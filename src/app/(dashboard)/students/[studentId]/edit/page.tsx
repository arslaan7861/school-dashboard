"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Loader2,
  Camera,
  User,
  Mail,
  Users,
  X,
  Eye,
  EyeOff,
  IdCard,
} from "lucide-react";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
import { useClasses } from "@/features/class/hooks.class";

const formatDateForInput = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = Number(params.studentId);
  const sessionId = useAuthStore((s) => s.activeSessionId);

  const { data: classesData, isLoading: isLoadingClasses } = useClasses(
    sessionId ? Number(sessionId) : undefined,
  );
  const classes = classesData?.data || [];

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectKey, setSelectKey] = useState(0);

  const { data: student, isLoading: isLoadingStudent } = useStudent(
    studentId,
    Number(sessionId) || undefined,
  );
  const { updateStudentAsync, isUpdating } = useStudentMutations();

  const form = useForm<UpdateStudentFormValues>({
    resolver: zodResolver(updateStudentFormSchema),
    defaultValues: {
      admissionNo: "",
      aadhaarNumber: "",
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
      classId: undefined,
      sessionId: sessionId ? Number(sessionId) : undefined,
      rollNumber: undefined,
      address: undefined,
    },
  });

  const watchName = form.watch("name");
  const hasChanges = form.formState.isDirty || selectedImage !== null;
  const hasReset = useRef(false);

  useEffect(() => {
    if (student && !isLoadingClasses && !hasReset.current) {
      hasReset.current = true;
      form.reset({
        admissionNo: student.admissionNo ?? "",
        name: student.name ?? "",
        gender: (student.gender as "male" | "female" | "other") ?? undefined,
        dob: formatDateForInput(student.dob),
        fatherName: student.fatherName ?? "",
        fatherPhone: student.fatherPhone ?? undefined,
        motherName: student.motherName ?? undefined,
        motherPhone: student.motherPhone ?? undefined,
        guardianName: student.guardianName ?? undefined,
        guardianPhone: student.guardianPhone ?? undefined,
        email: student.user?.email ?? "",
        phone: student.user?.phone ?? "",
        password: undefined,
        address: student.address ?? undefined,
        classId: student.classRelation?.classId ? Number(student.classRelation.classId) : undefined,
        sessionId:
          student.classRelation?.sessionId ? Number(student.classRelation.sessionId) : (sessionId ? Number(sessionId) : undefined),
        rollNumber: student.classRelation?.rollNumber?.toString() ?? undefined,
        aadhaarNumber: student.aadhaarNumber ?? "",
      });
      setSelectKey((k) => k + 1);
      if (student.user?.profilePic) {
        setImagePreview(student.user.profilePic);
      }
    }
  }, [student, isLoadingClasses, form, sessionId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: UpdateStudentFormValues) => {
    try {
      const submitData = { ...data };
      if (!submitData.password) delete submitData.password;

      await updateStudentAsync(
        { studentId, data: submitData, image: selectedImage || undefined },
        {
          onError: (e) => {
            toast.error(e.message);
            if (e.errors?.length) {
              e.errors.forEach(({ field, message }) => {
                form.setError(field as keyof UpdateStudentFormValues, {
                  message,
                });
              });
            }
          },
        },
      );
      toast.success("Student updated successfully");
      router.back();
    } catch {
      // handled in onError
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelDialog(true);
    } else {
      router.back();
    }
  };

  if (isLoadingStudent || isLoadingClasses) {
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
    <div className="h-full w-full space-y-6 pb-10">
      {/* Header — matches create page sticky style */}
      <div className="flex items-center gap-4 sticky top-0 bg-background z-10 py-4 border-b">
        <Button
          variant="outline"
          size="icon"
          onClick={handleCancel}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
          <p className="text-muted-foreground mt-1">
            {student.name} • {student.admissionNo}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Row 1: Profile Image + Basic Information */}
          <div className="flex gap-6 flex-col md:flex-row">
            {/* Profile Image */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-primary/20 cursor-pointer transition-all group-hover:border-primary/40">
                      <AvatarImage src={imagePreview || undefined} />
                      <AvatarFallback className="bg-primary/5 text-primary text-4xl">
                        {watchName ? watchName[0].toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image"
                    />

                    <div
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() =>
                        document.getElementById("profile-image")?.click()
                      }
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </div>

                    {imagePreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Profile Picture</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click on image to upload • JPG, PNG • Max 5MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="grow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Student's personal and academic details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="admissionNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
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
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aadhaarNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <IdCard className="w-3 h-3" />
                          Aadhaar Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123456789012"
                            maxLength={12}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          key={`gender-${selectKey}`}
                          value={field.value ?? ""}
                          onValueChange={(value) =>
                            field.onChange(value || undefined)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sessionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Session</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value?.toString() ?? ""}
                            disabled
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="classId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <Select
                          key={`classId-${selectKey}`}
                          value={field.value?.toString() ?? ""}
                          onValueChange={(value) =>
                            field.onChange(value ? Number(value) : undefined)
                          }
                          disabled={isLoadingClasses}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem
                                key={cls.id}
                                value={cls.id.toString()}
                              >
                                {cls.name} - {cls.section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rollNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="15"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Required when changing class
                        </FormDescription>
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
                            value={field.value ?? ""}
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
          </div>

          {/* Row 2: Guardian Information + Account Information */}
          <div className="flex gap-6 flex-col md:flex-row">
            {/* Guardian Information */}
            <Card className="flex-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Guardian Information
                </CardTitle>
                <CardDescription>
                  Parent or guardian contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Father */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Optional
                    </Badge>
                    Father's Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fatherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Father's Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fatherPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Father's Phone</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Mother */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Optional
                    </Badge>
                    Mother's Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="motherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mother's Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="motherPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mother's Phone</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Guardian */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Optional
                    </Badge>
                    Guardian's Details (if different)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="guardianName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guardian's Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guardianPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guardian's Phone</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Login credentials and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            value={field.value ?? ""}
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
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
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
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Leave blank to keep current"
                              {...field}
                              value={field.value ?? ""}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Min. 6 characters if changing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky Action Bar — matches create page */}
          <div className="bg-background border-t py-4 -mx-6 px-6 sticky bottom-0">
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !hasChanges}
                className="min-w-[140px]"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>

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
