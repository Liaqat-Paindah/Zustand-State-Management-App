"use client";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/stores/userAuth";
import { userSchema } from "@/types/user";
import { Button } from "@base-ui/react";
import { useFormik } from "formik";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const Login = () => {
  const login = useAuth((state) => state.login);
  const router = useRouter();
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useFormik({
    initialValues: {
      name: "",
      id: 2,
      email: "",
      password: "",
    },
    validationSchema: userSchema,
    onSubmit: (values) => {
      login({
        name: values.name,
        id: values.id,
        email: values.email,
      });
      router.push("/products");
    },
  });

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="min-h-screen items-center justify-center flex bg-gray-800"
      >
        <div className="w-full max-w-md bg-gray-900 p-8 rounded-sm shadow-lg">
          <h1 className="text-2xl justify-center text-center font-bold text-gray-300 ">
            Sign-In Docker Host
          </h1>
          <p className="text-center text-sm text-gray-400 py-2">
            Welcome back to Nextify Zustand State Management App.
          </p>
          <div className="py-2">
            <label className="text-gray-400" htmlFor="">
              Name:
            </label>
            <Input
              name="name"
              id="name"
              type="text"
              className="rounded-sm"
              placeholder="Etner your name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.name && errors.name && (
              <span className="text-sm text-red-700">{errors.name}</span>
            )}
          </div>
          <div className="py-2">
            <label className="text-gray-400" htmlFor="">
              Email:
            </label>
            <Input
              name="email"
              id="email"
              type="text"
              className="rounded-sm"
              placeholder="Etner your Email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.email && errors.email ? (
              <span className="text-sm text-red-700">{errors.email}</span>
            ) : (
              <></>
            )}
          </div>{" "}
          <div className="py-2">
            <label className="text-gray-400" htmlFor="">
              Password:
            </label>
            <Input
              name="password"
              id="password"
              type="password"
              className="rounded-sm"
              placeholder="Etner your Password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.password && errors.password ? (
              <span className="text-sm text-red-700">{errors.password}</span>
            ) : (
              <></>
            )}
          </div>
          <Button
            type="submit"
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 cursor-pointer rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Login;
