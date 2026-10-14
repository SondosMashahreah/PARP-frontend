import { useEffect, useRef, useState } from "react";
import { RouteLink } from "../../routing/clientRouter.jsx";
import { useLanguage } from "../../i18n/useLanguage.js";
import { useAuth } from "../../features/auth/useAuth.js";
import { adminSections } from "../../features/admin/dashboardModel.js";
import { AdminIcon } from "../../pages/Dashboard/components/AdminUi.jsx";
import logo from "../../components/Header/img/logo.png";
import "./AdminLayout.css";
export default function AdminLayout({
  section,
  children,
  onRefresh,
  refreshing,
}) {
  const { isArabic: ar, dir, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const t = (a, e) => (ar ? a : e);
  useEffect(() => {
    const el = dialog.current;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  const current =
    adminSections.find((item) => item.id === section) || adminSections[0];
  const navigation = (
    <>
      <RouteLink
        to="/dashboard"
        className="ac-brand"
        onClick={() => setOpen(false)}
      >
        <span className="ac-brand-logo">
          <img src={logo} alt="PARP" />
        </span>
        <span>
          <strong>
            PARP<span> / </span>ADMIN
          </strong>
          <small>{t("مركز إدارة المنصة", "Platform control center")}</small>
        </span>
      </RouteLink>
      <div className="ac-rail-profile">
        <span className="ac-avatar">
          {user.full_name?.trim().charAt(0) || "A"}
        </span>
        <div>
          <strong>{user.full_name}</strong>
          <small>{t("مدير النظام", "System administrator")}</small>
        </div>
        <span className="ac-role-dot" aria-hidden="true" />
      </div>
      <p className="ac-nav-label">{t("مساحة الإدارة", "MANAGEMENT")}</p>
      <nav aria-label={t("أقسام لوحة التحكم", "Dashboard navigation")}>
        {adminSections.map((item, i) => (
          <RouteLink
            key={item.id}
            to={`/dashboard#${item.id}`}
            className={`ac-nav-link ${section === item.id ? "is-active" : ""}`}
            aria-current={section === item.id ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            <AdminIcon name={item.icon} />
            <span>{ar ? item.ar : item.en}</span>
            <small>{String(i + 1).padStart(2, "0")}</small>
          </RouteLink>
        ))}
      </nav>
      <div className="ac-rail-bottom">
        <RouteLink to="/" onClick={() => setOpen(false)}>
          <AdminIcon name="arrow" />
          {t("العودة إلى المنصة", "Back to platform")}
        </RouteLink>
        <RouteLink to="/profile" onClick={() => setOpen(false)}>
          <AdminIcon name="users" />
          {t("ملفي الشخصي", "My profile")}
        </RouteLink>
        <button type="button" onClick={logout}>
          <AdminIcon name="exit" />
          {t("تسجيل الخروج", "Sign out")}
        </button>
        <small>PALESTINIAN ACTION RESEARCH PLATFORM</small>
      </div>
    </>
  );
  return (
    <div className="admin-console" dir={dir}>
      <a className="skip-link" href="#admin-content">
        {t("انتقل إلى محتوى الإدارة", "Skip to administration content")}
      </a>
      <aside className="ac-rail">{navigation}</aside>
      <dialog
        ref={dialog}
        className="ac-nav-dialog"
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        aria-label={t("قائمة الإدارة", "Administration menu")}
      >
        <button
          type="button"
          className="ac-dialog-close"
          onClick={() => setOpen(false)}
          aria-label={t("إغلاق القائمة", "Close menu")}
        >
          <AdminIcon name="close" />
        </button>
        {navigation}
      </dialog>
      <div className="ac-body">
        <header className="ac-topbar">
          <div className="ac-topbar-path">
            <button
              type="button"
              className="ac-mobile-toggle"
              onClick={() => setOpen(true)}
              aria-label={t("فتح قائمة الإدارة", "Open administration menu")}
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              <AdminIcon name="menu" />
            </button>
            <span>PARP</span>
            <i>/</i>
            <strong>{ar ? current.ar : current.en}</strong>
          </div>
          <div className="ac-topbar-actions">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={ar ? "Switch to English" : "التبديل إلى العربية"}
            >
              {ar ? "EN" : "عربي"}
            </button>
            <button
              type="button"
              className="ac-icon-button"
              onClick={onRefresh}
              disabled={refreshing}
              aria-label={t("تحديث البيانات", "Refresh data")}
            >
              <AdminIcon name="refresh" />
            </button>
            <span
              className="ac-avatar ac-avatar--small"
              aria-label={user.full_name}
            >
              {user.full_name?.trim().charAt(0) || "A"}
            </span>
          </div>
        </header>
        <main id="admin-content" tabIndex={-1} className="ac-main">
          {children}
        </main>
      </div>
    </div>
  );
}
