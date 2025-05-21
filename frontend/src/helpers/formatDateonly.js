const formatDateOnly = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
export default formatDateOnly;
