import { useCallback, useState } from "react";
import { useLanguage } from "../../../i18n/useLanguage.js";
import { ROLE_OPTIONS } from "../../../features/auth/roles.js";
import { platformApi } from "../../../features/platform/platformApi.js";
import { useAdminResource } from "../../../features/admin/useAdminResource.js";
import { AdminLoading, AdminError } from "./AdminUi.jsx";

export default function PlatformAdmin({ mode = "payments", onSaved }) {
  const { isArabic } = useLanguage(),
    t = (a, e) => (isArabic ? a : e);
  const load = useCallback(
    () => platformApi.get(mode === "payments" ? "/payments" : "/conferences"),
    [mode],
  );
  const payments = useAdminResource(load),
    conferences = mode === "accounts" ? payments : { data: [], error: "" };
  const [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [role, setRole] = useState("researcher");
  async function submit(event, path, method, transform) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = transform(data);
      if (
        mode === "payments" &&
        payload.confirmed &&
        payload.paid_agorot < payload.required_agorot
      )
        throw new Error(
          t(
            "المبلغ المدفوع أقل من الرسوم المطلوبة.",
            "Paid amount is less than the required fee.",
          ),
        );
      await platformApi[method](path, payload);
      setMessage(t("تم الحفظ", "Saved"));
      payments.reload();
      onSaved?.();
      if (method === "post") {
        form.reset();
        setRole("researcher");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="ac-panel ac-management">
      <h2>
        {mode === "accounts"
          ? t("إدارة الحسابات", "Account administration")
          : t("النشر والدفع", "Publication & payments")}
      </h2>
      <AdminError
        error={payments.error || error}
        retry={payments.reload}
        ar={isArabic}
      />
      {payments.loading && <AdminLoading ar={isArabic} />}
      {message && <p role="status">{message}</p>}
      {mode === "accounts" && (
        <>
          <details>
            <summary>{t("إنشاء مستخدم", "Create user")}</summary>
            <form
              className="admin-user-form"
              onSubmit={(e) =>
                submit(e, "/users", "post", (d) => ({
                  ...d,
                  conference_id: d.conference_id
                    ? Number(d.conference_id)
                    : null,
                  username: d.username || null,
                }))
              }
            >
              <label>
                {t("الاسم", "Name")}
                <input
                  name="full_name"
                  required
                  minLength={2}
                  maxLength={150}
                />
              </label>
              <label>
                {t("الإيميل", "Email")}
                <input type="email" name="email" required />
              </label>
              <label>
                {t("الدور", "Role")}
                <select
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {isArabic ? r.ar : r.en}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t(
                  "كلمة مرور: 10 أحرف، كبير وصغير ورقم ورمز",
                  "Password: 10 characters, uppercase, lowercase, number, symbol",
                )}
                <input
                  type="password"
                  name="password"
                  required
                  minLength={10}
                  maxLength={72}
                  autoComplete="new-password"
                />
              </label>
              {role === "organizing_committee" && (
                <>
                  <label>
                    {t("اسم المستخدم", "Username")}
                    <input
                      name="username"
                      required
                      pattern="[a-zA-Z0-9_.-]{3,80}"
                    />
                  </label>
                  <label>
                    {t("المؤتمر", "Conference")}
                    <select name="conference_id" required defaultValue="">
                      <option value="">—</option>
                      {conferences.data?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p>
                    {t(
                      "يغيّر عضو اللجنة كلمة المرور عند أول دخول.",
                      "The committee member changes the password on first sign-in.",
                    )}
                  </p>
                </>
              )}
              <button disabled={busy || payments.loading}>
                {t("إنشاء الحساب", "Create account")}
              </button>
            </form>
          </details>
          <details>
            <summary>
              {t(
                "إعداد أو إعادة تعيين حساب لجنة منظمة موجود",
                "Configure or reset an existing organizing account",
              )}
            </summary>
            <p>
              {t(
                "استخدمي رقم المستخدم من جدول المستخدمين. هذا يحافظ على الحساب ومساهماته.",
                "Use the user ID from the accounts table. Existing history is preserved.",
              )}
            </p>
            <form
              className="admin-user-form"
              onSubmit={(e) => {
                const id = new FormData(e.currentTarget).get("user_id");
                submit(e, `/users/${id}/committee`, "put", (d) => ({
                  username: d.username,
                  conference_id: Number(d.conference_id),
                  password: d.password,
                }));
              }}
            >
              <label>
                {t("رقم المستخدم", "User ID")}
                <input name="user_id" type="number" min="1" required />
              </label>
              <label>
                {t("اسم المستخدم", "Username")}
                <input
                  name="username"
                  pattern="[a-zA-Z0-9_.-]{3,80}"
                  required
                />
              </label>
              <label>
                {t("المؤتمر", "Conference")}
                <select name="conference_id" required defaultValue="">
                  <option value="">—</option>
                  {conferences.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("كلمة مرور مؤقتة", "Temporary password")}
                <input
                  type="password"
                  name="password"
                  minLength={10}
                  maxLength={72}
                  required
                  autoComplete="new-password"
                />
              </label>
              <button disabled={busy || payments.loading}>
                {t(
                  "حفظ وإلزام تغيير كلمة المرور",
                  "Save and require password change",
                )}
              </button>
            </form>
          </details>
        </>
      )}
      {mode === "payments" && (
        <>
          <h3>
            {t(
              "طلبات رسوم النشر — تأكيد الأدمين فقط",
              "Publication payments — administrator confirmation only",
            )}
          </h3>
          {payments.data?.length === 0 && (
            <p>{t("لا توجد طلبات بعد", "No requests yet")}</p>
          )}
          {payments.data?.map((p) => (
            <details
              className="admin-user-row"
              key={`${p.submission_id}-${p.required_agorot}-${p.paid_agorot}-${p.confirmed}-${p.receipt}`}
            >
              <summary>
                {p.title} · {p.researcher} · {p.confirmed ? "✓" : "◷"}
              </summary>
              <p>
                {p.directorate} / {p.school}
              </p>
              <form
                className="admin-user-form"
                onSubmit={(e) =>
                  submit(e, `/payments/${p.submission_id}`, "put", (d) => ({
                    required_agorot: Math.round(Number(d.required) * 100),
                    paid_agorot: Math.round(Number(d.paid) * 100),
                    receipt: d.receipt,
                    confirmed: d.confirmed === "on",
                  }))
                }
              >
                <label>
                  {t("الرسوم المطلوبة ₪", "Required ₪")}
                  <input
                    type="number"
                    name="required"
                    min="0"
                    max="1000000"
                    step="0.01"
                    required
                    defaultValue={p.required_agorot / 100}
                  />
                </label>
                <label>
                  {t("المبلغ المدفوع ₪", "Paid ₪")}
                  <input
                    type="number"
                    name="paid"
                    min="0"
                    max="1000000"
                    step="0.01"
                    required
                    defaultValue={p.paid_agorot / 100}
                  />
                </label>
                <label>
                  {t("الإيصال / ملاحظة", "Receipt / note")}
                  <input
                    name="receipt"
                    maxLength={250}
                    defaultValue={p.receipt}
                  />
                </label>
                <label className="admin-user-toggle">
                  <input
                    type="checkbox"
                    name="confirmed"
                    defaultChecked={p.confirmed}
                  />
                  {t(
                    "أؤكد استيفاء الدفع الفعلي والسماح بالنشر",
                    "I confirm receipt of payment and authorize publication",
                  )}
                </label>
                <button disabled={busy || payments.loading}>
                  {t("حفظ الاعتماد", "Save confirmation")}
                </button>
              </form>
              <details>
                <summary>{t("سجل التغييرات", "Audit history")}</summary>
                {(p.history || []).map((h, i) => (
                  <p key={i}>
                    #{h.actor_id} · {new Date(h.at).toLocaleString()} ·{" "}
                    {h.after.paid_agorot / 100} ₪ · {String(h.after.confirmed)}
                  </p>
                ))}
              </details>
            </details>
          ))}
        </>
      )}
    </section>
  );
}
