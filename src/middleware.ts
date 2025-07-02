import { 
    convexAuthNextjsMiddleware, 
    nextjsMiddlewareRedirect, 
    createRouteMatcher, 
    isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
 
const isPublicPage = createRouteMatcher(["/auth"])

export default convexAuthNextjsMiddleware(async (request) => {
    const isAuthed = await isAuthenticatedNextjs();

    if (!isPublicPage(request) && !isAuthed) {
        return nextjsMiddlewareRedirect(request, "/auth");
    }

    if (isPublicPage(request) && isAuthed) {
        return nextjsMiddlewareRedirect(request, "/");
    }
});
 
export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};