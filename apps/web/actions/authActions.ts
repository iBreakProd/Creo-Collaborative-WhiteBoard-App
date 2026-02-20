"use server";
import { UserSigninSchema, UserSignupSchema } from "@workspace/common/types";
import axiosInstance from "@/lib/axios/axiosInstance";
import { cookies } from "next/headers";

export interface FormState {
  message: string;
  user?: {
    id: string;
    name: string;
    username: string;
  };
  errors?: any;
}

export async function signupAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawFormData = {
    name: `${formData.get("firstname")} ${formData.get("lastname")}`,
    username: `${formData.get("username")}`,
    password: `${formData.get("password")}`,
  };

  if (formData.get("password") !== formData.get("verify-password")) {
    return { message: "Passwords do not match." };
  }

  const validatedFields = UserSignupSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your inputs.",
    };
  }

  try {
    const res = await axiosInstance.post("/auth/signup", validatedFields.data);
    if (res.data.token) {
      (await cookies()).set("jwt", res.data.token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }
    return {
      user: {
        id: res.data.user.id,
        name: res.data.user.name,
        username: res.data.user.username,
      },
      message: "User created successfully.",
    };
  } catch (error: any) {
    console.log(error);
    if (error?.response?.data?.message) {
      return { message: error.response.data.message };
    }
    return { message: "Could not create user." };
  }
}

export async function signinAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawFormData = {
    username: `${formData.get("username")}`,
    password: `${formData.get("password")}`,
  };

  const validatedFields = UserSigninSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your inputs.",
    };
  }

  try {
    const res = await axiosInstance.post("/auth/signin", validatedFields.data);
    if (res.data.token) {
      (await cookies()).set("jwt", res.data.token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }
    return {
      user: {
        id: res.data.user.id,
        name: res.data.user.name,
        username: res.data.user.username,
      },
      message: "User logged in successfully.",
    };
  } catch (error: any) {
    console.log(error);
    if (error?.response?.data?.message) {
      return { message: error.response.data.message };
    }
    return { message: "Could not login user." };
  }
}

export async function signoutAction() {
  try {
    const res = await axiosInstance.post("/auth/signout");
    if (res.data.message) {
      (await cookies()).delete("jwt");
      return { message: res.data.message };
    } else {
      return { message: "Could not logout user." };
    }
  } catch (error) {
    console.log(error);
  }
}
