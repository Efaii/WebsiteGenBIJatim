"use server";

import { z } from "zod";

const API_BASE =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Alamat email tidak valid"),
  subject: z.string().min(5, "Perihal minimal 5 karakter"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
  };
};

export async function submitContactForm(
  prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const validatedFields = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      message: "Mohon perbaiki bagian yang ditandai di bawah ini.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const response = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedFields.data),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        status: "error",
        message:
          "Pesan gagal dikirim ke server. Silakan coba lagi atau kirim email ke sekretariat@genbijatim.id.",
      };
    }
  } catch {
    return {
      status: "error",
      message:
        "Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi, atau kirim email ke sekretariat@genbijatim.id.",
    };
  }

  return {
    status: "success",
    message:
      "Terima kasih! Pesan Anda sudah kami terima dan akan dibalas melalui email.",
  };
}
