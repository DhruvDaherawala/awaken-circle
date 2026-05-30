import { withAuth } from 'next-auth/middleware';

const authMiddleware = withAuth({
  callbacks: {
    // Returns true if the token is validly present, signifying authenticated admin
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: '/admin/login', // Explicit redirect path for logged-out requests
  },
});

export const proxy = authMiddleware;
export default authMiddleware;

export const config = {
  matcher: [
    // Protect all admin portal subpaths explicitly, except the sign-in page which is auto-bypassed by next-auth
    '/admin/:path*',
  ],
};
