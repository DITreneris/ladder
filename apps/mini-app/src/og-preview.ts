import "./style.css";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";

const params = new URLSearchParams(window.location.search);
if (params.get("variant") === "github") {
  document.documentElement.dataset.ogVariant = "github";
}
