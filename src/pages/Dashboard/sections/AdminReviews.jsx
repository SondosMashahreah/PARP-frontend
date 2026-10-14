import { useState } from "react";
import { workflowApi } from "../../../features/workflow/workflowApi.js";
import { useAdminResource } from "../../../features/admin/useAdminResource.js";
import {
  statusLabels,
  eventLabels,
  formatDate,
} from "../../../features/admin/dashboardModel.js";
import {
  AdminPanel,
  AdminError,
  AdminLoading,
  AdminEmpty,
} from "../components/AdminUi.jsx";
const load = () => workflowApi.workspace();
export default function AdminReviews({ ar }) {
  const resource = useAdminResource(load),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const t = (a, e) => (ar ? a : e);
  async function assign(e, id) {
    e.preventDefault();
    const reviewer = Number(new FormData(e.currentTarget).get("reviewer"));
    setBusy(id);
    setError("");
    setMessage("");
    try {
      await workflowApi.assignReviewer(id, reviewer);
      setMessage(t("تم تعيين عضو لجنة التقييم.", "Evaluator assigned."));
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }
  const items = (resource.data?.submissions || []).filter(
    (s) =>
      (!status || s.status === status) &&
      `${s.title} ${s.researcher_name}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <AdminPanel
      title={t("التقييم والقرارات", "Evaluations & decisions")}
      eyebrow={t(
        "متابعة الأعمال وتوزيع مهام التقييم",
        "SUBMISSIONS & EVALUATION ASSIGNMENTS",
      )}
    >
      <p className="ac-note">
        {t(
          "أحدث الأعمال المتاحة من الخادم (حتى 200 عمل). القرارات العلمية من صلاحية لجنة تقييم الأبحاث؛ مدير النظام يتابع ويعيّن أعضاء التقييم.",
          "Latest available submissions (up to 200). Scientific decisions belong to the Research Evaluation Committee; the administrator monitors and assigns evaluators.",
        )}
      </p>
      <AdminError
        error={resource.error || error}
        retry={resource.reload}
        ar={ar}
      />
      {message && <p role="status">{message}</p>}
      <div className="admin-user-filters">
        <input
          aria-label={t("بحث في الأعمال", "Search submissions")}
          placeholder={t("عنوان البحث أو الباحث", "Title or researcher")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label={t("حالة البحث", "Submission status")}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{t("كل الحالات", "All statuses")}</option>
          {Object.entries(statusLabels).map(([id, label]) => (
            <option key={id} value={id}>
              {label[ar ? 0 : 1]}
            </option>
          ))}
        </select>
      </div>
      {resource.loading && <AdminLoading ar={ar} />}
      {!resource.loading && !items.length && (
        <AdminEmpty>
          {t("لا توجد أعمال مطابقة.", "No matching submissions.")}
        </AdminEmpty>
      )}
      {items.map((s) => (
        <details key={s.id} className="admin-user-row">
          <summary>
            <strong>{s.title}</strong>
            <span>{s.researcher_name}</span>
            <span className="ac-badge">
              {statusLabels[s.status]?.[ar ? 0 : 1] || s.status}
            </span>
          </summary>
          <p>
            {s.abstract || t("لا يوجد ملخص متاح.", "No abstract available.")}
          </p>
          <small>
            #{s.id} · {s.research_field}
          </small>
          {s.file?.url && (
            <p>
              <a
                className="ac-file-link"
                href={s.file.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("فتح ملف العمل", "Open submission file")} ↗
              </a>
            </p>
          )}
          {s.events?.length > 0 && (
            <details className="ac-history">
              <summary>
                {t("سجل الإجراءات والقرارات", "Actions & decisions")}
              </summary>
              {s.events.map((event, index) => (
                <p key={`${event.created_at}-${index}`}>
                  <strong>
                    {eventLabels[event.event_type]?.[ar ? 0 : 1] ||
                      event.event_type}
                  </strong>
                  <br />
                  <small>
                    {formatDate(event.created_at, ar)} ·{" "}
                    {statusLabels[event.to_status]?.[ar ? 0 : 1] ||
                      event.to_status}
                  </small>
                  {event.note && (
                    <span className="ac-event-note">{event.note}</span>
                  )}
                </p>
              ))}
            </details>
          )}
          {s.status !== "published" && (
            <form
              className="admin-user-filters"
              onSubmit={(e) => assign(e, s.id)}
            >
              <label>
                {t("تعيين عضو لجنة التقييم", "Assign evaluator")}
                <select name="reviewer" required defaultValue="">
                  <option value="">
                    {t("اختر عضواً", "Select evaluator")}
                  </option>
                  {resource.data?.reviewers?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.full_name} — {r.specialization || r.email}
                    </option>
                  ))}
                </select>
              </label>
              <button disabled={busy === s.id}>{t("تعيين", "Assign")}</button>
            </form>
          )}
        </details>
      ))}
    </AdminPanel>
  );
}
