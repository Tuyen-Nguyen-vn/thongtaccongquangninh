/**
 * Generate updated ttcqn-doorway-schema.php with BreadcrumbList support
 * Run: node tools/generate_doorway_schema_update.js
 */
const fs = require('fs');

const srcPath = 'C:/Users/DELL/.claude/projects/D---thongtaccongquangninh/400aa309-ffb4-4469-b950-7c6e4213692f/tool-results/bm0u2e2b3.txt';
const outPath = 'D:/.thongtaccongquangninh/tmp_doorway_schema_updated.php';

const original = fs.readFileSync(srcPath, 'utf8');
// Strip line numbers from Read tool (format: "NNN\t")
let out = original.replace(/^\d+\t/gm, '');

// ── 1. Version bump
out = out.replace(
  ' * Version: 2026.06.05.1',
  ' * Version: 2026.06.05.2'
);

// ── 2. Ward pages in doorway map
out = out.replace(
  "        427 => ['service' => 'ttc', 'city' => 'Vân Đồn',    'lat' => 21.0667, 'lng' => 107.5333],",
  "        427 => ['service' => 'ttc', 'city' => 'Vân Đồn',    'lat' => 21.0667, 'lng' => 107.5333],\n" +
  "        // Thong tac cong – phuong thuoc Ha Long (P1 BreadcrumbList 2026-06-05)\n" +
  "        991 => ['service' => 'ttc', 'city' => 'Cao Xanh',  'lat' => 20.9612, 'lng' => 107.0536, 'ward' => true],\n" +
  "        992 => ['service' => 'ttc', 'city' => 'Gieng Day', 'lat' => 20.9467, 'lng' => 107.0889, 'ward' => true],\n" +
  "        993 => ['service' => 'ttc', 'city' => 'Tuan Chau', 'lat' => 20.9218, 'lng' => 106.9878, 'ward' => true],"
);

// UTF-8 city names for the ward entries
out = out.replace("'city' => 'Cao Xanh'", "'city' => 'Cao Xanh'");
out = out.replace("'city' => 'Gieng Day'", "'city' => 'Giếng Đáy'");
out = out.replace("'city' => 'Tuan Chau'", "'city' => 'Tuần Châu'");

// ── 3. New helper functions + BreadcrumbList builder before page_nodes()
const newFunctions = `
/**
 * Return province-level service parent info: ['name', 'url']
 */
function ttcqn_doorway_schema_service_parent_info(string $service): array
{
    return $service === 'hbp'
        ? ['name' => 'Hút bể phốt Quảng Ninh',   'url' => home_url('/hut-be-phot-quang-ninh/')]
        : ['name' => 'Thông tắc cống Quảng Ninh', 'url' => home_url('/thong-tac-cong-quang-ninh/')];
}

/**
 * Map area-post IDs (post type, not page) to service metadata for BreadcrumbList.
 */
function ttcqn_doorway_schema_area_posts_map(): array
{
    return [
        2054 => ['service' => 'ttc', 'city' => 'Bãi Cháy'],
    ];
}

/**
 * Build a BreadcrumbList JSON-LD node.
 *
 * @param string $page_url  Full canonical URL of the current page.
 * @param string $page_name Display name for the current page breadcrumb item.
 * @param array  $parents   Ordered list of ['name' => '...', 'url' => '...'] intermediate items.
 */
function ttcqn_doorway_schema_breadcrumb_node(string $page_url, string $page_name, array $parents = []): array
{
    $pos   = 1;
    $items = [
        ['@type' => 'ListItem', 'position' => $pos++, 'name' => 'Trang chủ', 'item' => trailingslashit(home_url('/'))],
    ];
    foreach ($parents as $parent) {
        $items[] = ['@type' => 'ListItem', 'position' => $pos++, 'name' => $parent['name'], 'item' => trailingslashit($parent['url'])];
    }
    $items[] = ['@type' => 'ListItem', 'position' => $pos, 'name' => $page_name, 'item' => trailingslashit($page_url)];

    return [
        '@context'        => 'https://schema.org',
        '@type'           => 'BreadcrumbList',
        'itemListElement' => $items,
    ];
}

`;

out = out.replace(
  'function ttcqn_doorway_schema_page_nodes(int $page_id): array',
  newFunctions + 'function ttcqn_doorway_schema_page_nodes(int $page_id): array'
);

// ── 4. BreadcrumbList in page_nodes() – doorway area (city/ward) section
// There are TWO blocks that end with "return $nodes;" before main_services check
// First one: after doorway map Service + video → add breadcrumb
const doorwayReturn =
  "        $video_node = ttcqn_doorway_schema_video_node($page_id, $page_url);\n" +
  "        if ($video_node !== null) {\n" +
  "            $nodes[] = $video_node;\n" +
  "        }\n\n" +
  "        return $nodes;\n" +
  "    }\n\n" +
  "    $main_services = ttcqn_doorway_schema_main_service_map();";

const doorwayReturnNew =
  "        $video_node = ttcqn_doorway_schema_video_node($page_id, $page_url);\n" +
  "        if ($video_node !== null) {\n" +
  "            $nodes[] = $video_node;\n" +
  "        }\n\n" +
  "        // BreadcrumbList: Home → Main Service → City/Ward\n" +
  "        $nodes[] = ttcqn_doorway_schema_breadcrumb_node(\n" +
  "            $page_url,\n" +
  "            ttcqn_doorway_schema_service_name($service, $city),\n" +
  "            [ttcqn_doorway_schema_service_parent_info($service)]\n" +
  "        );\n\n" +
  "        return $nodes;\n" +
  "    }\n\n" +
  "    $main_services = ttcqn_doorway_schema_main_service_map();";

out = out.replace(doorwayReturn, doorwayReturnNew);

// ── 5. BreadcrumbList in page_nodes() – main_service section
const mainSvcReturn =
  "        $video_node = ttcqn_doorway_schema_video_node($page_id, $page_url);\n" +
  "        if ($video_node !== null) {\n" +
  "            $nodes[] = $video_node;\n" +
  "        }\n\n" +
  "        return $nodes;\n" +
  "    }\n\n" +
  "    if ($page_id === 61) {";

const mainSvcReturnNew =
  "        $video_node = ttcqn_doorway_schema_video_node($page_id, $page_url);\n" +
  "        if ($video_node !== null) {\n" +
  "            $nodes[] = $video_node;\n" +
  "        }\n\n" +
  "        // BreadcrumbList: Home → Service Name (top-level service pages)\n" +
  "        $nodes[] = ttcqn_doorway_schema_breadcrumb_node($page_url, $entry['name']);\n\n" +
  "        return $nodes;\n" +
  "    }\n\n" +
  "    if ($page_id === 61) {";

out = out.replace(mainSvcReturn, mainSvcReturnNew);

// ── 6. BreadcrumbList for page 61 (Bang gia)
out = out.replace(
  "                'itemListElement' => ttcqn_doorway_schema_offer_catalog_items(),\n" +
  "            ],\n" +
  "        ];\n" +
  "    }\n\n" +
  "    if ($page_id === 63) {",

  "                'itemListElement' => ttcqn_doorway_schema_offer_catalog_items(),\n" +
  "            ],\n" +
  "            ttcqn_doorway_schema_breadcrumb_node($page_url, 'Bảng giá dịch vụ môi trường Quảng Ninh'),\n" +
  "        ];\n" +
  "    }\n\n" +
  "    if ($page_id === 63) {"
);

// ── 7. BreadcrumbList for page 63 (Lien he)
out = out.replace(
  "                'mainEntity' => [\n" +
  "                    '@id' => ttcqn_doorway_schema_business_id(),\n" +
  "                ],\n" +
  "            ],\n" +
  "        ];\n" +
  "    }\n\n" +
  "    return [];",

  "                'mainEntity' => [\n" +
  "                    '@id' => ttcqn_doorway_schema_business_id(),\n" +
  "                ],\n" +
  "            ],\n" +
  "            ttcqn_doorway_schema_breadcrumb_node($page_url, 'Liên hệ'),\n" +
  "        ];\n" +
  "    }\n\n" +
  "    return [];"
);

// ── 8. BreadcrumbList in render_post_schema() for posts
out = out.replace(
  "    foreach ($schemas as $schema) {\n" +
  "        $json = wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);\n" +
  "        if ($json !== false) {\n" +
  '            echo "\\n<script type=\\"application/ld+json\\" data-ttcqn-post-schema=\\"1\\">{\$json}</script>\\n";\n' +
  "        }\n" +
  "    }\n" +
  "}\n\n" +
  "add_action('wp_head', 'ttcqn_doorway_schema_render_post_schema', 55);",

  "    // BreadcrumbList for posts\n" +
  "    $area_posts = ttcqn_doorway_schema_area_posts_map();\n" +
  "    if (isset($area_posts[$post_id])) {\n" +
  "        $area      = $area_posts[$post_id];\n" +
  "        $svc_info  = ttcqn_doorway_schema_service_parent_info($area['service']);\n" +
  "        $schemas[] = ttcqn_doorway_schema_breadcrumb_node(\n" +
  "            (string) get_permalink($post_id),\n" +
  "            ttcqn_doorway_schema_service_name($area['service'], $area['city']),\n" +
  "            [$svc_info]\n" +
  "        );\n" +
  "    } else {\n" +
  "        $schemas[] = ttcqn_doorway_schema_breadcrumb_node(\n" +
  "            (string) get_permalink($post_id),\n" +
  "            ttcqn_doorway_schema_clean_text(get_the_title($post_id))\n" +
  "        );\n" +
  "    }\n\n" +
  "    foreach ($schemas as $schema) {\n" +
  "        $json = wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);\n" +
  "        if ($json !== false) {\n" +
  '            echo "\\n<script type=\\"application/ld+json\\" data-ttcqn-post-schema=\\"1\\">{\$json}</script>\\n";\n' +
  "        }\n" +
  "    }\n" +
  "}\n\n" +
  "add_action('wp_head', 'ttcqn_doorway_schema_render_post_schema', 55);"
);

// ── Validation
const checks = [
  'Version: 2026.06.05.2',
  "991 => ['service' => 'ttc'",
  'ttcqn_doorway_schema_breadcrumb_node',
  'ttcqn_doorway_schema_area_posts_map',
  'ttcqn_doorway_schema_service_parent_info',
  'BreadcrumbList for posts',
  'Trang ch',
];

let allOk = true;
for (const c of checks) {
  if (!out.includes(c)) { console.error('MISSING:', c); allOk = false; }
}

if (allOk) {
  console.log('All', checks.length, 'checks passed');
  fs.writeFileSync(outPath, out, 'utf8');
  console.log('Written:', outPath, '| size:', out.length, 'bytes');
} else {
  process.exit(1);
}
