import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { toast } from "react-toastify";
import { useLoginMutation } from "../../features/auth/authApi";
import { FormField } from "../form/form-elements/SelectFiled";
import Checkbox from "../form/input/Checkbox";
import Input from "../form/input/InputField";

import PasswordInput from "../form/input/PasswordInput";
import Button from "../ui/button/Button";

const formSchema = z.object({
  identifier: z.string().min(1, "Email / Username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type FormFields = z.infer<typeof formSchema>;

export default function SignInForm() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
      remember: false,
    },
  });

  const remember = watch("remember");

  const onSubmit = async (data: FormFields) => {
    try {
      await login({
        identifier: data.identifier,
        password: data.password,
      }).unwrap();

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      const message =
        error?.data?.message || "Invalid credentials, please try again!";
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto py-16">
      <h1 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white">
        Sign In
      </h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">
        Enter your login credentials to continue
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Identifier */}
        <FormField
          label={
            <>
              Email or Username <span className="text-red-500">*</span>
            </>
          }
          error={errors.identifier?.message}
        >
          <Input placeholder="example@gmail.com" {...register("identifier")} />
        </FormField>

        {/* Password */}
        <FormField
          label={
            <>
              Password <span className="text-red-500">*</span>
            </>
          }
          error={errors.password?.message}
        >
          <PasswordInput
            placeholder="Enter password"
            {...register("password")}
          />
        </FormField>

        {/* Remember Me */}
        <div className="flex items-center gap-3">
          <Checkbox
            checked={!!remember}
            onChange={(val) => setValue("remember", val)}
          />
          <span className="text-gray-700 dark:text-gray-400 text-sm">
            Keep me logged in
          </span>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="sm" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
