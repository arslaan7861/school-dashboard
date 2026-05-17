"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Loader2,
  User,
  Mail,
  Users,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Camera,
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
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";
import { useStudentMutations } from "@/features/students/hooks.student";
import { useClasses } from "@/features/class/hooks.class";
import { useSessions } from "@/features/session/hooks.session";
import {
  createStudentFormSchema,
  CreateStudentFormValues,
} from "@/features/students/validator.student";

export default function CreateStudentPage() {
  const router = useRouter();
  const { activeSessionId } = useAuthStore();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch classes for the active session
  const { data: classesData, isLoading: isLoadingClasses } = useClasses(
    activeSessionId?.toString(),
  );
  const { data: sessionsData } = useSessions();
  const { createStudentAsync, isCreating } = useStudentMutations();

  const classes = classesData?.data || [];
  const sessions = sessionsData?.data || [];
  const currentSession = sessions.find((s) => s.id === Number(activeSessionId));

  const form = useForm<CreateStudentFormValues>({
    resolver: zodResolver(createStudentFormSchema),
    defaultValues: {
      admissionNo: "",
      name: "",
      aadhaarNumber: "",
      gender: undefined,
      dob: "",
      sessionId: activeSessionId ? Number(activeSessionId) : undefined,
      classId: undefined,
      rollNumber: undefined,
      fatherName: "",
      fatherPhone: "",
      motherName: "",
      motherPhone: "",
      guardianName: "",
      guardianPhone: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  // Watch form values for conditional rendering
  const watchClassId = form.watch("classId");
  const watchName = form.watch("name");

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
  const onSubmit = async (data: CreateStudentFormValues) => {
    try {
      await createStudentAsync({
        data,
        image: selectedImage || undefined,
      });
      toast.success("Student created successfully");
      router.push("/students");
    } catch (error) {
      // Error handled in mutation
    }
  };

  // Check if session is active
  if (!activeSessionId) {
    return (
      <div className="h-full w-full">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardContent className="py-16">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-semibold text-amber-800 mb-3">
                No Active Session
              </h2>
              <p className="text-amber-600/80 mb-6">
                Please select an active academic session to create a student.
              </p>
              <Button
                onClick={() => router.push("/dashboard/sessions")}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Go to Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full w-full space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 sticky top-0 bg-background z-10 py-4 border-b">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/students")}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
          <p className="text-muted-foreground mt-1">
            Create a new student record and account
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex gap-6 flex-col md:flex-row">
            {/* Profile Image Section */}
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
                      Click on the image to upload • JPG, PNG, GIF • Max 5MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 1: Basic Information */}
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
                        <FormLabel>Admission Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="STU2024001" {...field} />
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
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                          Aadhaar Number *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123456789012"
                            maxLength={12}
                            {...field}
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
                          onValueChange={field.onChange}
                          value={field.value}
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
                          <Input type="date" {...field} />
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
                            value={
                              currentSession?.name ||
                              `Session ${activeSessionId}`
                            }
                            disabled
                            className="bg-muted"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="classId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class *</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString()}
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
                        <FormLabel>Roll Number *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="15"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
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

                {!watchClassId && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Select a class to assign roll number
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-6 flex-col md:flex-row">
            {/* Section 2: Guardian Information */}
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
                {/* Father's Details */}
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
                            <Input placeholder="Robert Doe" {...field} />
                          </FormControl>
                          <FormMessage />
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
                            <Input placeholder="9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Mother's Details */}
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
                            <Input placeholder="Jane Doe" {...field} />
                          </FormControl>
                          <FormMessage />
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
                            <Input placeholder="9876543211" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Guardian's Details */}
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
                            <Input placeholder="Richard Roe" {...field} />
                          </FormControl>
                          <FormMessage />
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
                            <Input placeholder="9876543212" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Account Information */}
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
                <div className="grid grid-cols-1  gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
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
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="9876543213" {...field} />
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
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter password"
                              {...field}
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
                          Minimum 6 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="bg-background border-t py-4 -mx-6 px-6 sticky bottom-0">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/students")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="min-w-[140px]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Student...
                  </>
                ) : (
                  "Create Student"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
