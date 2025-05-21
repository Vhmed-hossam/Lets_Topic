const formatDate = (iso) =>
  new Date(iso)
    .toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", " -")
    .replace(" AM", " am")
    .replace(" PM", " pm");
export default formatDate;
