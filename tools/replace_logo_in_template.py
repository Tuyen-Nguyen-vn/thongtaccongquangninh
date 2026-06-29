import os

filepath = r"d:\.thongtaccongquangninh\tools\wp-plugins\ttcqn-home-emergency-renderer\templates\page-home-direct.php"

if not os.path.exists(filepath):
    print("Template file not found!")
    exit(1)

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace first target
target1 = "$header_logo_rendered_url = 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/logo-moi-truong-do-thi-so-1-quang-ninh-header.png';"
replacement1 = "$header_logo_rendered_url = 'https://thongtaccongquangninh.com/wp-content/plugins/ttcqn-home-emergency-renderer/assets/logo-moi-truong-do-thi-so-1-quang-ninh-header.webp';"

# Replace second target
target2 = """    $home_renderer_header_logo = dirname(__DIR__) . '/assets/logo-moi-truong-do-thi-so-1-quang-ninh-header.png';
    if (file_exists($home_renderer_header_logo)) {
        $header_logo_rendered_url = plugins_url('assets/logo-moi-truong-do-thi-so-1-quang-ninh-header.png', $home_renderer_main_file);
    }"""
replacement2 = """    $home_renderer_header_logo = dirname(__DIR__) . '/assets/logo-moi-truong-do-thi-so-1-quang-ninh-header.webp';
    if (file_exists($home_renderer_header_logo)) {
        $header_logo_rendered_url = plugins_url('assets/logo-moi-truong-do-thi-so-1-quang-ninh-header.webp', $home_renderer_main_file);
    }"""

count1 = content.count(target1)
count2 = content.count(target2)

print(f"Target 1 count: {count1}")
print(f"Target 2 count: {count2}")

if count1 > 0:
    content = content.replace(target1, replacement1)
if count2 > 0:
    content = content.replace(target2, replacement2)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Replacement complete!")
