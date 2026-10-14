import { roleLabel } from "../../../features/auth/roles.js";
import {
  chartRows,
  formatCount,
  statusLabels,
} from "../../../features/admin/dashboardModel.js";
import { AdminMetric, AdminPanel, AdminEmpty } from "../components/AdminUi.jsx";
import { RouteLink } from "../../../routing/clientRouter.jsx";
export default function AdminOverview({ data, ar }) {
  const t = (a, e) => (ar ? a : e);
  const m = data.metrics || {},
    edu = data.education || {},
    statuses = data.research_statuses || {};
  const cards = [
    [t("إجمالي المستخدمين", "Total users"), m.users_total, "users"],
    [t("الحسابات الفعالة", "Active accounts"), m.users_active, "activity"],
    [t("البحوث والممارسات", "Research & practices"), m.research_total, "news"],
    [t("الأعمال المنشورة", "Published works"), statuses.published, "reviews"],
    [t("المديريات", "Directorates"), edu.directorates, "school"],
    [t("المدارس", "Schools"), edu.schools, "school"],
    [
      t("تقييمات بانتظار الإنجاز", "Reviews awaiting completion"),
      m.reviews_waiting,
      "reviews",
    ],
    [
      t("طلبات اعتماد الارتباط", "Affiliation requests"),
      m.pending_affiliations,
      "users",
    ],
  ];
  const roles = chartRows(data.role_distribution),
    total = roles.reduce((n, r) => n + r.value, 0);
  const segments = roles.map((row, index) => ({
    ...row,
    start: total
      ? (roles.slice(0, index).reduce((n, r) => n + r.value, 0) / total) * 100
      : 0,
    length: total ? (row.value / total) * 100 : 0,
  }));
  const bars = chartRows(
      Object.entries(statuses).map(([key, value]) => ({ key, value })),
    ),
    max = Math.max(1, ...bars.map((r) => r.value));
  return (
    <>
      <div className="ac-metrics">
        {cards.map(([label, value, icon], i) => (
          <AdminMetric
            key={label}
            label={label}
            value={value}
            icon={icon}
            ar={ar}
            index={i}
          />
        ))}
      </div>
      <div className="ac-charts">
        <AdminPanel
          title={t("مجتمع المنصة", "Platform community")}
          eyebrow={t("توزيع الحسابات حسب الدور", "ACCOUNTS BY ROLE")}
        >
          <div className="ac-donut-wrap">
            <div className="ac-donut">
              <svg
                viewBox="0 0 200 200"
                role="img"
                aria-label={t(
                  "توزيع الحسابات؛ القيم موضحة في القائمة",
                  "Account distribution; values listed below",
                )}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="76"
                  fill="none"
                  stroke="#443351"
                  strokeWidth="23"
                />
                {segments
                  .filter((r) => r.value > 0)
                  .map((r) => (
                    <circle
                      key={r.key}
                      cx="100"
                      cy="100"
                      r="76"
                      pathLength="100"
                      fill="none"
                      stroke={r.color}
                      strokeWidth="23"
                      strokeDasharray={`${r.length} ${100 - r.length}`}
                      strokeDashoffset={-r.start}
                      transform="rotate(-90 100 100)"
                    >
                      <title>{`${roleLabel(r.key, ar)}: ${r.value}`}</title>
                    </circle>
                  ))}
              </svg>
              <div>
                <strong>{formatCount(total, ar)}</strong>
                <small>{t("حساب", "accounts")}</small>
              </div>
            </div>
            <ul className="ac-legend">
              {roles.map((r) => (
                <li key={r.key}>
                  <i style={{ background: r.color }} />
                  <span>{roleLabel(r.key, ar)}</span>
                  <strong>{formatCount(r.value, ar)}</strong>
                </li>
              ))}
            </ul>
          </div>
          {!total && (
            <AdminEmpty>
              {t("لا توجد حسابات لعرض توزيعها", "No account distribution yet")}
            </AdminEmpty>
          )}
        </AdminPanel>
        <AdminPanel
          title={t("مسار البحوث والممارسات", "Research & practice workflow")}
          eyebrow={t(
            "التوزيع حسب الحالة الحالية",
            "CURRENT STATUS DISTRIBUTION",
          )}
        >
          <div className="ac-bars">
            {bars.map((r) => (
              <div className="ac-bar" key={r.key}>
                <div>
                  <span>{statusLabels[r.key]?.[ar ? 0 : 1] || r.key}</span>
                  <strong>{formatCount(r.value, ar)}</strong>
                </div>
                <span className="ac-bar-track">
                  <i
                    style={{
                      width: `${(r.value / max) * 100}%`,
                      background: r.color,
                    }}
                  />
                </span>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
      <div className="ac-quick-links">
        {[
          [
            "users",
            t("إدارة المجتمع", "Manage community"),
            t(
              "الحسابات والصلاحيات واعتماد الارتباط المؤسسي",
              "Accounts, permissions and affiliation approvals",
            ),
          ],
          [
            "reviews",
            t("متابعة التقييم", "Follow evaluations"),
            t(
              "متابعة الأبحاث وتعيين لجنة التقييم",
              "Track submissions and assign evaluators",
            ),
          ],
          [
            "payments",
            t("إدارة النشر", "Manage publication"),
            t(
              "مراجعة الرسوم وتأكيد الدفعات الفعلية",
              "Review fees and confirm offline payments",
            ),
          ],
        ].map(([id, title, desc]) => (
          <RouteLink key={id} to={`/dashboard#${id}`}>
            <span>{title}</span>
            <p>{desc}</p>
            <b aria-hidden="true">{ar ? "←" : "→"}</b>
          </RouteLink>
        ))}
      </div>
    </>
  );
}
