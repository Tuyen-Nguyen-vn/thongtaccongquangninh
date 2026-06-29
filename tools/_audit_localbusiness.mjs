import https from "node:https";
const url = "https://thongtaccongquangninh.com/?nocache=" + Date.now();
https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (r) => {
  let d = "";
  r.on("data", (c) => (d += c));
  r.on("end", () => {
    const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m, lb = null, all = [];
    while ((m = re.exec(d))) {
      try {
        const j = JSON.parse(m[1].trim());
        const walk = (o) => { if (Array.isArray(o)) return o.forEach(walk); if (o && typeof o === "object") { all.push(o); if (o["@graph"]) walk(o["@graph"]); } };
        walk(j);
      } catch (e) {}
    }
    const businesses = all.filter(o => { const t = o["@type"]; const s = Array.isArray(t) ? t.join("+") : t; return /LocalBusiness|HomeAndConstructionBusiness/.test(s || ""); });
    console.log("So node LocalBusiness:", businesses.length, "(mong doi 1)");
    lb = businesses[0];
    if (!lb) { console.log("Khong tim thay LocalBusiness!"); return; }
    const has = (k) => lb[k] !== undefined && lb[k] !== null && !(Array.isArray(lb[k]) && lb[k].length === 0);
    const check = [
      ["name", has("name")], ["@id", has("@id")], ["url", has("url")], ["telephone", has("telephone")],
      ["image", has("image")], ["logo", has("logo")], ["address", has("address")], ["geo", has("geo")],
      ["openingHoursSpecification|openingHours", has("openingHoursSpecification") || has("openingHours")],
      ["priceRange", has("priceRange")], ["areaServed", has("areaServed")], ["sameAs", has("sameAs")],
      ["aggregateRating", has("aggregateRating")], ["review", has("review")],
      ["description", has("description")], ["hasOfferCatalog|makesOffer", has("hasOfferCatalog") || has("makesOffer")],
    ];
    console.log("\n--- FIELD CHECK (✓ co / ✗ thieu) ---");
    for (const [k, ok] of check) console.log(`  ${ok ? "✓" : "✗"} ${k}`);
    console.log("\n--- CHI TIET QUAN TRONG ---");
    console.log("openingHoursSpecification:", JSON.stringify(lb.openingHoursSpecification || lb.openingHours || "(none)"));
    console.log("areaServed              :", JSON.stringify(lb.areaServed || "(none)").slice(0, 300));
    console.log("geo                     :", JSON.stringify(lb.geo || "(none)"));
    console.log("aggregateRating         :", JSON.stringify(lb.aggregateRating || "(none)"));
    console.log("priceRange              :", JSON.stringify(lb.priceRange || "(none)"));
    console.log("image                   :", JSON.stringify(lb.image || "(none)").slice(0, 200));
  });
}).on("error", (e) => console.log("ERR", e.message));
