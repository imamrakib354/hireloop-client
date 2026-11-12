export function salaryUnit(frequency: string) {
  switch (frequency) {
    case "hourly":
      return "hr"
    case "monthly":
      return "month"
    case "yearly":
      return "year"
    default:
      return ""
  }
}

export function formatCompensation(
  min: string,
  max: string,
  frequency: string
) {
  const unit = salaryUnit(frequency)
  const range = min && max ? `$${min} – $${max}` : "—"
  return range !== "—" && unit ? `${range} / ${unit}` : range
}

export function deadlineDetails(deadline: string, now = new Date()) {
  const date = new Date(`${deadline?.slice(0, 10)}T23:59:59.999Z`)
  if (Number.isNaN(date.getTime())) return { label: "—", status: "—" }
  return {
    label: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }),
    status: date < now ? "Expired" : "Open",
  }
}
