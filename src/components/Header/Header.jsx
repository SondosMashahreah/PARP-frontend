import { canAccessPath } from "../../features/auth/roles.js";
import { useCallback, useEffect, useRef, useState } from "react";
import HeaderLogo from "./HeaderLogo.jsx";
import HeaderSearch from "./HeaderSearch.jsx";
import Notifications from "./Notifications.jsx";
import Sidebar from "./Sidebar.jsx";
import Icon from "../ui/Icon.jsx";
import IconButton from "../ui/IconButton.jsx";
import { RouteLink } from "../../routing/clientRouter.jsx";
import { useLanguage } from "../../i18n/useLanguage.js";
import { useAuth } from "../../features/auth/useAuth.js";
import { roleLabel } from "../../features/auth/roles.js";
import "./Header.css";

export default function Header() {
  const [activePanel, setActivePanel] = useState(null);
  const closePanel = useCallback(() => setActivePanel(null), []);
  const headerRef = useRef(null);
  const accountRef = useRef(null);
  const accountButton = useRef(null);
  const { isArabic, dir, toggleLanguage } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const header = headerRef.current;
    const measure = () =>
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const openSidebar = () => {
      if (isAuthenticated) setActivePanel("sidebar");
    };
    window.addEventListener("parp:open-sidebar", openSidebar);
    return () => window.removeEventListener("parp:open-sidebar", openSidebar);
  }, [isAuthenticated]);

  useEffect(() => {
    if (activePanel !== "account") return;
    const outside = (e) => {
      if (!accountRef.current?.contains(e.target)) closePanel();
    };
    const escape = (e) => {
      if (e.key === "Escape") {
        closePanel();
        accountButton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [activePanel, closePanel]);

  const guestLinks = isArabic
    ? [
        ["news", "آخر الأخبار", "الأخبار"],
        ["stats", "المنصة بالأرقام", "أرقامنا"],
        ["space-journey", "رحلة الباحث", "رحلتك"],
        ["contact", "تواصل معنا", "تواصل معنا"],
      ]
    : [
        ["news", "Latest news", "News"],
        ["stats", "Platform stats", "Stats"],
        ["space-journey", "Research journey", "Journey"],
        ["contact", "Contact us", "Contact"],
      ];
  const memberLinks = isArabic
    ? [
        ["/", "الرئيسية", "الرئيسية"],
        ["/workspace", "مساحة العمل", "العمل"],
        ["/excellence", "قاعة التميز", "التميز"],
        ["/map", "الخريطة", "الخريطة"],
        ["/#contact", "تواصل معنا", "تواصل معنا"],
      ]
    : [
        ["/", "Home", "Home"],
        ["/workspace", "Workspace", "Workspace"],
        ["/excellence", "Hall of Excellence", "Excellence"],
        ["/map", "Map", "Map"],
        ["/#contact", "Contact us", "Contact"],
      ];
  const links = isAuthenticated
    ? memberLinks
        .filter(([to]) => to !== "/map" || canAccessPath(user?.role, to))
        .map((link) =>
          user?.role === "system_admin" && link[0] === "/workspace"
            ? [
                "/dashboard",
                isArabic ? "لوحة التحكم" : "Dashboard",
                isArabic ? "الإدارة" : "Dashboard",
              ]
            : link,
        )
    : guestLinks.map(([id, label, short]) => [`/#${id}`, label, short]);
  const accountName = isAuthenticated
    ? user?.full_name || (isArabic ? "الملف الشخصي" : "Profile")
    : isArabic
      ? "تسجيل الدخول"
      : "Log in";
  const accountRole = isAuthenticated ? roleLabel(user?.role, isArabic) : "";
  const accountLabel = accountRole
    ? `${accountName} — ${accountRole}`
    : accountName;

  return (
    <header className="site-header" ref={headerRef} dir={dir}>
      <div className="site-header__inner">
        <HeaderLogo />
        <HeaderSearch />
        <div className="site-header__actions">
          <button
            type="button"
            className="site-header__language"
            onClick={toggleLanguage}
            aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
            title={isArabic ? "English" : "العربية"}
            lang={isArabic ? "en" : "ar"}
          >
            <Icon name="globe" />
            <span>{isArabic ? "EN" : "ع"}</span>
          </button>
          {isAuthenticated && user?.role === "system_admin" ? (
            <div
              className="site-header__account-menu"
              ref={accountRef}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) closePanel();
              }}
            >
              <button
                ref={accountButton}
                type="button"
                className="site-header__login"
                aria-expanded={activePanel === "account"}
                aria-controls="admin-account-links"
                onClick={() =>
                  setActivePanel((current) =>
                    current === "account" ? null : "account",
                  )
                }
              >
                <Icon name="user" />
                <span className="site-header__account-text">
                  <span className="site-header__account-name">
                    {accountName}
                  </span>
                  <small className="site-header__account-role">
                    {accountRole} ▾
                  </small>
                </span>
              </button>
              {activePanel === "account" && (
                <div
                  id="admin-account-links"
                  className="site-header__account-links"
                >
                  <RouteLink to="/dashboard" onClick={closePanel}>
                    {isArabic ? "صفحة الداشبورد" : "Dashboard"}
                  </RouteLink>
                  <RouteLink to="/profile" onClick={closePanel}>
                    {isArabic ? "الملف الشخصي" : "My profile"}
                  </RouteLink>
                </div>
              )}
            </div>
          ) : (
            <>
              <RouteLink
                className="site-header__login"
                to={isAuthenticated ? "/profile" : "/login"}
                aria-label={accountLabel}
                title={accountLabel}
                onClick={closePanel}
              >
                <Icon name="user" />
                {isAuthenticated ? (
                  <span className="site-header__account-text">
                    <span className="site-header__account-name">
                      {accountName}
                    </span>
                    <small className="site-header__account-role">
                      {accountRole}
                    </small>
                  </span>
                ) : (
                  <span>{accountName}</span>
                )}
              </RouteLink>
            </>
          )}
          {isAuthenticated && (
            <>
              <Notifications
                isOpen={activePanel === "notifications"}
                onToggle={() =>
                  setActivePanel((current) =>
                    current === "notifications" ? null : "notifications",
                  )
                }
                onClose={closePanel}
              />
              <IconButton
                className="site-header__menu"
                aria-label={isArabic ? "فتح القائمة" : "Open menu"}
                aria-expanded={activePanel === "sidebar"}
                aria-controls="main-sidebar"
                aria-haspopup="dialog"
                onClick={() => setActivePanel("sidebar")}
              >
                <Icon name="menu" />
              </IconButton>
            </>
          )}
        </div>
      </div>
      <nav
        className="site-header__nav"
        aria-label={isArabic ? "أقسام الصفحة الرئيسية" : "Homepage sections"}
      >
        {links.map(([id, label, shortLabel]) => (
          <RouteLink key={id} to={id} onClick={closePanel} aria-label={label}>
            <span className="site-header__nav-full">{label}</span>
            <span className="site-header__nav-short" aria-hidden="true">
              {shortLabel}
            </span>
          </RouteLink>
        ))}
      </nav>
      {isAuthenticated && (
        <Sidebar isOpen={activePanel === "sidebar"} onClose={closePanel} />
      )}
    </header>
  );
}
