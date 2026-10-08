export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.SUPABASE_MANAGEMENT_TOKEN;
  const projectRef =
    process.env.SUPABASE_PROJECT_REF || "hozpikyxilmedzsyquct";

  if (!token) {
    return res.status(503).json({
      ok: false,
      code: "not_configured",
      error: "SUPABASE_MANAGEMENT_TOKEN is not configured"
    });
  }

  const started = Date.now();

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      }
    );

    const text = await response.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }

    if (!response.ok) {
      return res.status(response.status >= 500 ? 502 : response.status).json({
        ok: false,
        code: "management_api_error",
        error: data?.message || data?.error || "Supabase Management API error"
      });
    }

    return res.status(200).json({
      ok: true,
      project: {
        ref: projectRef,
        name: data?.name || null,
        status: data?.status || data?.status_message || "available",
        region: data?.region || null
      },
      latencyMs: Date.now() - started,
      checkedAt: new Date().toISOString()
    });
  } catch {
    return res.status(502).json({
      ok: false,
      code: "upstream_unreachable",
      error: "Nie udało się połączyć z Supabase Management API"
    });
  }
}
