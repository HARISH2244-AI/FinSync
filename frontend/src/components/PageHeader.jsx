import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "./icons";
import "./PageHeader.css";

function PageHeader({ title, subtitle, right }) {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      <button className="page-header-back" onClick={() => navigate(-1)} data-cursor-hover>
        <ArrowLeftIcon />
      </button>
      <div className="page-header-titles">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {right && <div className="page-header-right">{right}</div>}
    </div>
  );
}

export default PageHeader;