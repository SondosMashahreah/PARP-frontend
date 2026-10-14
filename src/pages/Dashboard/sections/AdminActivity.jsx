import {
  eventLabels,
  statusLabels,
  formatDate,
} from "../../../features/admin/dashboardModel.js";
import { AdminPanel, AdminEmpty } from "../components/AdminUi.jsx";
export default function AdminActivity({ data, ar }) {
  return (
    <AdminPanel
      title={ar ? "آخر نشاط على المنصة" : "Recent platform activity"}
      eyebrow={
        ar
          ? "آخر 12 حدثاً متاحاً من الخادم"
          : "LATEST 12 EVENTS AVAILABLE FROM THE SERVER"
      }
    >
      {data.recent_activity?.length ? (
        <ol className="ac-timeline">
          {data.recent_activity.map((item) => (
            <li key={item.id}>
              <i />
              <div>
                <strong>
                  {eventLabels[item.event_type]?.[ar ? 0 : 1] ||
                    item.event_type}
                </strong>
                <p>{item.submission_title}</p>
                <small>
                  {item.actor_name} ·{" "}
                  {statusLabels[item.to_status]?.[ar ? 0 : 1] || item.to_status}
                </small>
              </div>
              <time dateTime={item.created_at}>
                {formatDate(item.created_at, ar)}
              </time>
            </li>
          ))}
        </ol>
      ) : (
        <AdminEmpty>
          {ar ? "لا يوجد نشاط حديث." : "No recent activity."}
        </AdminEmpty>
      )}
    </AdminPanel>
  );
}
