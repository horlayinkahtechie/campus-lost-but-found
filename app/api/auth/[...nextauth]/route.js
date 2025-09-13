import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/app/lib/supabaseClient";

const generateUserId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let userId = "";
  for (let i = 0; i < 10; i++) {
    userId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return userId;
};

const user_id = generateUserId();

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      try {
        const adminEmails = ["horlayinkah2005@gmail.com"];
        const isAdmin = adminEmails.includes(user.email);

        const { error } = await supabase.from("users").upsert(
          {
            user_id: user_id,
            email: user.email,
            full_name: user.name,

            role: isAdmin ? "admin" : "user",
            email_verified: true,
          },
          { onConflict: "email" }
        );

        if (error) throw error;

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async jwt({ token }) {
      const adminEmails = ["horlayinkah2005@gmail.com"];
      token.role = adminEmails.includes(token.email) ? "admin" : "user";
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
