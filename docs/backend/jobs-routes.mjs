// Copy this file into the Express backend. See ../browse-jobs-backend.md.
const jobTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
]

function text(value, name, maxLength = 200) {
  if (value === undefined) return ""
  if (typeof value !== "string" || value.length > maxLength) {
    throw new Error(`Invalid ${name}.`)
  }
  return value.trim()
}

function salary(value, name) {
  const amount = text(value, name, 30)
  if (!amount) return null
  const number = Number(amount)
  if (!Number.isFinite(number) || number < 0)
    throw new Error(`Invalid ${name}.`)
  return number
}

export function buildJobsQuery(params) {
  const query = {}
  const search = text(params.search, "search")
  const category = text(params.category, "category", 100)
  const remote = text(params.isRemote, "isRemote", 5)
  const frequency = text(params.salaryFrequency, "salaryFrequency", 10)
  const minSalary = salary(params.minSalary, "minSalary")
  const maxSalary = salary(params.maxSalary, "maxSalary")

  if (minSalary !== null && maxSalary !== null && minSalary > maxSalary) {
    throw new Error("Maximum salary must be at least the minimum.")
  }

  if (params.jobType !== undefined) {
    const types = Array.isArray(params.jobType)
      ? params.jobType
      : [params.jobType]
    if (
      types.length > jobTypes.length ||
      !types.every((type) => jobTypes.includes(type))
    ) {
      throw new Error("Invalid jobType.")
    }
    if (types.length) query.jobType = { $in: [...new Set(types)] }
  }
  if (category) query.category = category
  if (remote) {
    if (!["true", "false"].includes(remote))
      throw new Error("Invalid isRemote.")
    query.isRemote = remote === "true"
  }
  if (search) {
    // Treat user input as literal text, not as executable regex syntax.
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    query.$or = ["title", "companyName", "location"].map((field) => ({
      [field]: { $regex: escaped, $options: "i" },
    }))
  }

  const expressions = []
  if (frequency) {
    if (!["hourly", "monthly", "yearly"].includes(frequency)) {
      throw new Error("Invalid salaryFrequency.")
    }
    expressions.push({
      $eq: [
        {
          $cond: [
            { $in: [{ $ifNull: ["$salaryFrequency", ""] }, [""]] },
            "$frequency",
            "$salaryFrequency",
          ],
        },
        frequency,
      ],
    })
  }

  // Old records may store salaries as strings. Convert only for comparison;
  // invalid/missing salaries must not match a numeric salary filter.
  for (const [field, amount, operator] of [
    ["minSalary", minSalary, "$gte"],
    ["maxSalary", maxSalary, "$lte"],
  ]) {
    if (amount === null) continue
    const numeric = {
      $convert: {
        input: `$${field}`,
        to: "double",
        onError: null,
        onNull: null,
      },
    }
    expressions.push(
      { $ne: [numeric, null] },
      { [operator]: [numeric, amount] }
    )
  }
  if (expressions.length) query.$expr = { $and: expressions }
  return query
}

export function registerJobsRoutes(app, jobs) {
  // Register this BEFORE an existing GET /jobs/:id route.
  app.get("/jobs/filters", async (_req, res) => {
    try {
      const [categories, counts] = await Promise.all([
        jobs.distinct("category", { category: { $type: "string", $ne: "" } }),
        jobs
          .aggregate([
            { $match: { jobType: { $in: jobTypes } } },
            { $group: { _id: "$jobType", count: { $sum: 1 } } },
          ])
          .toArray(),
      ])
      res.send({
        categories: categories.sort(),
        jobTypeCounts: Object.fromEntries(
          counts.map(({ _id, count }) => [_id, count])
        ),
      })
    } catch (error) {
      console.error("Could not load job filters:", error)
      res.status(500).send({ error: "Could not load job filter options." })
    }
  })

  app.get("/jobs", async (req, res) => {
    let query
    try {
      query = buildJobsQuery(req.query)
    } catch (error) {
      return res.status(400).send({ error: error.message })
    }
    try {
      const result = await jobs.find(query).toArray()
      res.send(result)
    } catch (error) {
      console.error("Could not load jobs:", error)
      res.status(500).send({ error: "Could not load jobs." })
    }
  })
}
