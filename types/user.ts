import * as Yup from "yup";

export const userSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Password should be at least 6 characters")
    .required("Password is required"),
});
