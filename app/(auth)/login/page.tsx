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
    status,
  } = useFormik({
    initialValues: {
      id: 2,
      email: "",
      password: "",
    },
    validationSchema: userSchema,
    onSubmit: async (values, { setStatus }) => {
      setStatus(undefined);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          setStatus(data.message ?? "Unable to sign in");
          return;
        }

        login({
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
        });
        router.push("/products");
      } catch {
        setStatus("Unable to sign in. Please try again.");
      }
    },
  });

  return (
    <div>
   
      <form
        onSubmit={handleSubmit}
        className="min-h-screen items-center justify-center flex "
      >
        
        <div className="w-full max-w-md  p-8 bg-white  rounded-sm border border-slate-200   shadow-sm dark:border-white/10 dark:bg-white/5 ">
          <h1 className="text-2xl justify-center text-center font-bold text-gray-700 ">
            Sign-In  
          </h1>
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-sm bg-blue-500/10 blur-[120px] dark:bg-cyan-500/10" />

        <div className="absolute -left-32 top-1/3 h-72 w-72 rounded-sm bg-purple-500/10 blur-[100px]" />

        <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-sm bg-cyan-500/10 blur-[100px]" />
      </div>
          <p className="text-center text-sm text-gray-700 py-2">
            Welcome to Nextify Services
          </p>
          {status ? (
            <p className="text-sm text-red-700" role="alert">
              {status}
            </p>
          ) : null}
          <div className="py-2">
            <label className="text-gray-700" htmlFor="">
              Email:
            </label>
            <Input
              name="email"
              id="email"
              type="text"
              className="rounded-sm my-2"
              placeholder="Info@yourbusiness.com"
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
            <label className="text-gray-700" htmlFor="">
              Password:
            </label>
            <Input
              name="password"
              id="password"
              type="password"
              className="rounded-sm my-2"
              placeholder="******"
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
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 cursor-pointer rounded-md bg-linear-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-sm shadow-blue-500/25 hover:scale-[1.02] hover:shadow-sm hover:shadow-blue-500/30"
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
