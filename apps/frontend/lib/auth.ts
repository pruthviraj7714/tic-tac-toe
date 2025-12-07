import CredentialsProvider from "next-auth/providers/credentials"
import { BACKEND_URL } from "./config";
import { NextAuthOptions } from "next-auth";

export const authOptions : NextAuthOptions = {
  providers: [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
          username: { label: "Username", type: "text", placeholder: "tony" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials, req) {
          const res = await fetch(`${BACKEND_URL}/user/signin`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" }
          })

          if (!res.ok) return null;

          const data = await res.json();
          if (!data.token) return null;
  
          return {
            id: data.id,
            token: data.token,
          };
        }
      })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.id = user.id
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
      };
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};