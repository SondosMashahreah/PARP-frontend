import { useState } from "react";
import { useAuth } from "../../features/auth/useAuth.js";
import { useLanguage } from "../../i18n/useLanguage.js";
import { useLocation } from "../../routing/useLocation.js";
import { workflowApi } from "../../features/workflow/workflowApi.js";
import { useAdminResource } from "../../features/admin/useAdminResource.js";
import {
  adminSection,
  adminSections,
  formatDate,
} from "../../features/admin/dashboardModel.js";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout.jsx";
import { AdminError, AdminLoading } from "./components/AdminUi.jsx";
import AdminOverview from "./sections/AdminOverview.jsx";
import AdminUsers from "./sections/AdminUsers.jsx";
import AdminNews from "./sections/AdminNews.jsx";
import AdminReviews from "./sections/AdminReviews.jsx";
import AdminActivity from "./sections/AdminActivity.jsx";
import PlatformAdmin from "./components/PlatformAdmin.jsx";
import "./DashboardPage.css";
const load = () => workflowApi.adminDashboard();
function Dashboard() {
  const { user } = useAuth(),
    { isArabic: ar } = useLanguage(),
    { hash } = useLocation();
  const [revision, setRevision] = useState(0),
    resource = useAdminResource(load, revision);
  const section = adminSection(hash),
    current = adminSections.find((s) => s.id === section);
  return (
    <AdminLayout
      section={section}
      refreshing={resource.loading}
      onRefresh={() => setRevision((n) => n + 1)}
    >
      <header className="ac-heading">
        <div>
          <span className="ac-eyebrow">PARP / CONTROL CENTER</span>
          <h1>
            {section === "overview"
              ? ar
                ? "نظرة شاملة، إدارة أوضح."
                : "A clear view. Better control."
              : ar
                ? current.ar
                : current.en}
          </h1>
          <p>
            {section === "overview"
              ? ar
                ? `أهلاً ${user.full_name}، إليك صورة المنصة اليوم.`
                : `Welcome ${user.full_name}. Here is your platform at a glance.`
              : ar
                ? "مساحة مستقلة لإدارة المنصة ومتابعة أعمالها."
                : "A dedicated space to manage your platform and its activity."}
          </p>
        </div>
        {resource.data && (
          <span className="ac-updated">
            <i />
            {ar ? "آخر تحديث" : "Last updated"}
            <small>{formatDate(resource.data.generated_at, ar)}</small>
          </span>
        )}
      </header>
      <AdminError error={resource.error} retry={resource.reload} ar={ar} />
      {(section === "overview" || section === "activity") &&
        resource.loading &&
        !resource.data && <AdminLoading ar={ar} />}
      {section === "overview" && resource.data && (
        <AdminOverview data={resource.data} ar={ar} />
      )}
      <div key={`${section}-${revision}`}>
        {section === "users" && <AdminUsers />}
        {section === "news" && <AdminNews ar={ar} />}{" "}
        {section === "reviews" && <AdminReviews ar={ar} />}{" "}
        {section === "payments" && <PlatformAdmin />}
        {section === "activity" && resource.data && (
          <AdminActivity data={resource.data} ar={ar} />
        )}
      </div>
      <footer className="ac-footer">
        PARP <span>·</span> {ar ? "لوحة إدارة النظام" : "System administration"}
      </footer>
    </AdminLayout>
  );
}
export default function DashboardPage() {
  const { user } = useAuth();
  return user?.role === "system_admin" ? <Dashboard /> : null;
}
