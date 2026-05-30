import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@awakencircle.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password.');
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        // Retrieve the admin user from the database using our verified Prisma Client
        const admin = await prisma.admin.findUnique({
          where: { email: normalizedEmail },
        });

        // Fail securely: do not reveal whether the email exists or password is wrong in general error logs
        if (!admin) {
          throw new Error('Invalid email or password.');
        }

        // Verify the provided password with the stored bcrypt hash
        const isPasswordCorrect = await bcrypt.compare(credentials.password, admin.password);

        if (!isPasswordCorrect) {
          throw new Error('Invalid email or password.');
        }

        // Return a production-safe user session object
        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    // Inject custom ID and Role from database record into JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Populate session user fields with custom ID and Role from JWT token
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // Session persists for 24 hours
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login', // Redirect errors back to the premium login page
  },
  secret: process.env.NEXTAUTH_SECRET,
};
