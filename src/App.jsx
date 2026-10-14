import { lazy, Suspense, useEffect } from "react";
import "./App.css";
import AppLayout from "./layouts/AppLayout/AppLayout.jsx";
import Home from "./pages/Home/Home.jsx";
import NotFound from "./pages/NotFound/NotFoundPage.jsx";
import { useLanguage } from "./i18n/useLanguage.js";
import { useLocation } from "./routing/useLocation.js";
import RouteEffects from "./routing/RouteEffects.jsx";
import SearchPage from "./pages/Search/SearchPage.jsx";
import LoginPage from "./pages/Login/LoginPage.jsx";
import AccountPage from "./pages/Account/AccountPage.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";
import AssistantPage from "./pages/Assistant/AssistantPage.jsx";
import { pageRoutes } from "./routing/pageRoutes.jsx";
import { useAuth } from "./features/auth/useAuth.js";
import { appHref } from "./routing/navigation.js";
import { canAccessPath } from "./features/auth/roles.js";

const PracticesPage = lazy(() => import("./pages/Practices/PracticesPage.jsx"));

const EducationMapPage = lazy(() => import("./pages/Map/MapPage.jsx"));

const PUBLIC_PATHS = new Set([
  "/",
  "/search",
  "/login",
  "/account",
  "/news",
  "/practices",
  "/repository",
]);

function App() {
  const { pathname, search, hash } = useLocation();
  const query = new URLSearchParams(search).get("q")?.slice(0, 160) || "";
  const { isArabic } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();
  const Page = pageRoutes[pathname];
  const isProtectedPath = !PUBLIC_PATHS.has(pathname);
  const isRoleAllowed =
    !isProtectedPath || !isAuthenticated || canAccessPath(user?.role, pathname);

  useEffect(() => {
    if (loading || isAuthenticated || !isProtectedPath) return;
    const next = encodeURIComponent(`${pathname}${search}${hash}`);
    window.history.replaceState(null, "", `/login?next=${next}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, [hash, isAuthenticated, isProtectedPath, loading, pathname, search]);

  useEffect(() => {
    if (loading || !isAuthenticated || !isProtectedPath || isRoleAllowed)
      return;
    window.history.replaceState(null, "", "/workspace");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, [isAuthenticated, isProtectedPath, isRoleAllowed, loading, pathname]);

  const adminWorkspace =
    isAuthenticated &&
    user?.role === "system_admin" &&
    pathname === "/workspace";
  useEffect(() => {
    if (!loading && adminWorkspace) {
      window.history.replaceState(null, "", appHref("/dashboard"));
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, [adminWorkspace, loading]);

  let content = <NotFound />;
  if (
    (adminWorkspace || loading || !isAuthenticated || !isRoleAllowed) &&
    isProtectedPath
  )
    content = null;
  else if (pathname === "/") content = <Home />;
  else if (pathname === "/practices")
    content = (
      <Suspense
        fallback={
          <p role="status">{isArabic ? "جارٍ التحميل…" : "Loading…"}</p>
        }
      >
        <PracticesPage />
      </Suspense>
    );
  else if (pathname === "/map")
    content = (
      <Suspense
        fallback={
          <p role="status">
            {isArabic ? "جارٍ تحميل الخريطة…" : "Loading map…"}
          </p>
        }
      >
        <EducationMapPage />
      </Suspense>
    );
  else if (pathname === "/search")
    content = <SearchPage query={query} key={query} />;
  else if (pathname === "/assistant") content = <AssistantPage />;
  else if (pathname === "/login") content = <LoginPage />;
  else if (pathname === "/account") content = <AccountPage />;
  else if (pathname === "/profile") content = <ProfilePage />;
  else if (Page)
    content = (
      <Suspense
        fallback={
          <p role="status">{isArabic ? "جارٍ التحميل…" : "Loading…"}</p>
        }
      >
        <Page
          key={pathname === "/dashboard" ? pathname : `${pathname}${hash}`}
        />
      </Suspense>
    );

  if (pathname === "/dashboard" || adminWorkspace)
    return (
      <>
        {content}
        <RouteEffects />
      </>
    );

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {isArabic ? "انتقل إلى المحتوى" : "Skip to content"}
      </a>
      <AppLayout>
        {content}
        <RouteEffects />
      </AppLayout>
    </div>
  );
}

export default App;
