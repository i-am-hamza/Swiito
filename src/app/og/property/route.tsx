import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function formatINROg(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export async function GET(req: NextRequest): Promise<Response> {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return new Response("missing slug", { status: 400 });

  const { data: row } = await adminClient
    .from("properties")
    .select("id, title, display_price, listing_type, address_area")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!row) return new Response("not found", { status: 404 });

  const { data: media } = await adminClient
    .from("property_media")
    .select("url")
    .eq("property_id", row.id)
    .eq("is_cover", true)
    .limit(1);

  const coverUrl = media?.[0]?.url ?? null;
  const price = formatINROg(Number(row.display_price ?? 0));
  const suffix = row.listing_type === "rent" ? "/mo" : "";
  const area = row.address_area ?? "Ranchi";
  const title = row.title ?? "Property in Ranchi";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          fontFamily: "sans-serif",
          backgroundColor: "#0E3A1C",
        }}
      >
        {/* Background image */}
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.55,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "40px 48px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Brand */}
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#E8BC6A",
              letterSpacing: "0.05em",
            }}
          >
            SWIITO
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.2,
              maxWidth: 720,
            }}
          >
            {title}
          </div>

          {/* Price + area row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginTop: 4,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#E8BC6A",
              }}
            >
              {price}
              {suffix}
            </div>
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {area}, Ranchi
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
