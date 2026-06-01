import "./style.css";

const params = new URLSearchParams(window.location.search);
if (params.get("variant") === "github") {
  document.documentElement.dataset.ogVariant = "github";
}
