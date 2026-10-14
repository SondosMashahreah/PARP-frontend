import { useCallback, useState } from "react";
import { ROLE_OPTIONS, roleLabel } from "../../../features/auth/roles.js";
import { workflowApi } from "../../../features/workflow/workflowApi.js";
import { useAdminResource } from "../../../features/admin/useAdminResource.js";
import { formatCount } from "../../../features/admin/dashboardModel.js";
import { useLanguage } from "../../../i18n/useLanguage.js";
import PlatformAdmin from "../components/PlatformAdmin.jsx";
import {
  AdminPanel,
  AdminError,
  AdminLoading,
  AdminEmpty,
} from "../components/AdminUi.jsx";
const pageSize = 50;
const loadSummary = () => workflowApi.adminDashboard();
export default function AdminUsers() {
  const { isArabic: ar } = useLanguage(),
    t = (a, e) => (ar ? a : e);
  const [filters, setFilters] = useState({
    q: "",
    role: "",
    active: "",
    offset: 0,
  });
  const loader = useCallback(
    () => workflowApi.adminUsers({ limit: pageSize, ...filters }),
    [filters],
  );
  const users = useAdminResource(loader),
    summary = useAdminResource(loadSummary);
  const [busy, setBusy] = useState(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const saved = () => {
    users.reload();
    summary.reload();
  };
  async function mutate(id, action) {
    setBusy(id);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(t("تم الحفظ بنجاح.", "Changes saved."));
      saved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }
  function saveUser(e, target) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    mutate(`user-${target.id}`, () =>
      workflowApi.updateUserAccess(target.id, {
        role: form.get("role"),
        is_active: form.get("is_active") === "on",
        governorate_id: form.get("governorate_id") || null,
        directorate_id: form.get("directorate_id") || null,
        school_id: form.get("school_id") || null,
        specialization: form.get("specialization") || null,
        research_field: form.get("research_field") || null,
      }),
    );
  }
  const list = users.data?.items || [],
    total = users.data?.total || 0,
    pending = summary.data?.pending_affiliations || [];
  return (
    <>
      <PlatformAdmin mode="accounts" onSaved={saved} />
      <AdminError error={error} ar={ar} />
      {message && <p role="status">{message}</p>}
      <AdminPanel
        title={t("اعتماد الارتباط المؤسسي", "Affiliation approvals")}
        eyebrow={t(
          "آخر 12 طلباً متاحاً؛ يتجدد بعد الاعتماد",
          "LATEST 12 REQUESTS; REFRESHED AFTER APPROVAL",
        )}
      >
        <AdminError error={summary.error} retry={summary.reload} ar={ar} />
        {summary.loading && !summary.data && <AdminLoading ar={ar} />}
        {pending.map((r) => (
          <article className="ac-list-row" key={r.user.id}>
            <div>
              <strong>{r.user.full_name}</strong>
              <small>{r.user.email}</small>
              <small>
                {r.affiliation?.school_id ||
                  r.affiliation?.directorate_id ||
                  "—"}
              </small>
            </div>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() =>
                mutate(`approval-${r.user.id}`, () =>
                  workflowApi.approveAffiliation(r.user.id),
                )
              }
            >
              {t("اعتماد", "Approve")}
            </button>
          </article>
        ))}
        {!summary.loading && !summary.error && !pending.length && (
          <AdminEmpty>
            {t("لا توجد طلبات معلقة.", "No pending requests.")}
          </AdminEmpty>
        )}
      </AdminPanel>
      <AdminPanel
        title={t("المستخدمون والصلاحيات", "Users & permissions")}
        eyebrow={
          users.data
            ? `${formatCount(total, ar)} ${t("حساب", "accounts")}`
            : undefined
        }
      >
        <form
          className="admin-user-filters"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setFilters({
              q: String(f.get("q")).trim(),
              role: f.get("role"),
              active: f.get("active"),
              offset: 0,
            });
          }}
          onReset={() => setFilters({ q: "", role: "", active: "", offset: 0 })}
        >
          <input
            name="q"
            aria-label={t("ابحث بالاسم أو البريد", "Search name or email")}
            placeholder={t("ابحث بالاسم أو البريد", "Search name or email")}
            maxLength={150}
          />
          <select
            name="role"
            aria-label={t("تصفية حسب الدور", "Filter by role")}
            defaultValue=""
          >
            <option value="">{t("كل الأدوار", "All roles")}</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {ar ? r.ar : r.en}
              </option>
            ))}
          </select>
          <select
            name="active"
            aria-label={t("تصفية حسب حالة الحساب", "Filter by account status")}
            defaultValue=""
          >
            <option value="">{t("كل الحالات", "All statuses")}</option>
            <option value="true">{t("فعال", "Active")}</option>
            <option value="false">{t("موقوف", "Disabled")}</option>
          </select>
          <button disabled={users.loading}>{t("بحث", "Search")}</button>
          <button type="reset">{t("مسح", "Clear")}</button>
        </form>
        <AdminError error={users.error} retry={users.reload} ar={ar} />
        {users.loading && <AdminLoading ar={ar} />}
        {!users.loading && !users.error && !list.length && (
          <AdminEmpty>
            {t("لا توجد حسابات مطابقة.", "No matching accounts.")}
          </AdminEmpty>
        )}
        {!users.loading &&
          list.map((target) => (
            <details
              key={`${target.id}-${target.role}-${target.is_active}-${JSON.stringify(target.affiliation)}`}
              className="admin-user-row"
            >
              <summary>
                <span className="admin-user-avatar" aria-hidden="true">
                  {target.full_name?.trim()?.charAt(0) || "#"}
                </span>
                <span className="admin-user-main">
                  <strong>
                    {target.full_name} · #{target.id}
                  </strong>
                  <small>{target.email}</small>
                </span>
                <span>{roleLabel(target.role, ar)}</span>
                <span
                  className={`admin-user-status ${target.is_active ? "is-active" : ""}`}
                >
                  {target.is_active
                    ? t("فعال", "Active")
                    : t("موقوف", "Disabled")}
                </span>
                <span className="admin-user-verified">
                  {target.is_verified
                    ? t("موثق", "Verified")
                    : t("غير موثق", "Not verified")}
                </span>
              </summary>
              <form
                className="admin-user-form"
                onSubmit={(e) => saveUser(e, target)}
              >
                <label>
                  {t("الدور", "Role")}
                  <select name="role" defaultValue={target.role}>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {ar ? r.ar : r.en}
                      </option>
                    ))}
                  </select>
                </label>
                {[
                  ["governorate_id", "معرّف المحافظة", "Governorate ID"],
                  ["directorate_id", "معرّف المديرية", "Directorate ID"],
                  ["school_id", "معرّف المدرسة", "School ID"],
                  ["specialization", "التخصص", "Specialization"],
                  ["research_field", "مجال البحث", "Research field"],
                ].map(([name, a, e]) => (
                  <label key={name}>
                    {t(a, e)}
                    <input
                      name={name}
                      defaultValue={target.affiliation?.[name] || ""}
                    />
                  </label>
                ))}
                <label className="admin-user-toggle">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={target.is_active}
                  />
                  <span>{t("الحساب فعال", "Account enabled")}</span>
                </label>
                <button disabled={busy !== null}>
                  {busy === `user-${target.id}`
                    ? t("جارٍ الحفظ…", "Saving…")
                    : t("حفظ التعديلات", "Save changes")}
                </button>
              </form>
            </details>
          ))}
        <div className="ac-pagination">
          <button
            type="button"
            disabled={users.loading || filters.offset === 0}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                offset: Math.max(0, f.offset - pageSize),
              }))
            }
          >
            {t("السابق", "Previous")}
          </button>
          <span>
            {total ? filters.offset + 1 : 0}–
            {Math.min(filters.offset + pageSize, total)} / {total}
          </span>
          <button
            type="button"
            disabled={users.loading || filters.offset + pageSize >= total}
            onClick={() =>
              setFilters((f) => ({ ...f, offset: f.offset + pageSize }))
            }
          >
            {t("التالي", "Next")}
          </button>
        </div>
      </AdminPanel>
    </>
  );
}
