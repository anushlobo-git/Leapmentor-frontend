// src/components/mentee/dashboard/history/StatusBadge.jsx
import { STATUS_STYLES } from "./constants";

const StatusBadge = ({ status }) => (
  <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full capitalize w-fit ${STATUS_STYLES[status]}`}>
    {status}
  </span>
);

export default StatusBadge;