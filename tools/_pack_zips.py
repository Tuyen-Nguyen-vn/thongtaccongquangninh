import os
import zipfile

def pack_plugin(src_dir, dst_zip, slug):
    with zipfile.ZipFile(dst_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(src_dir):
            for f in files:
                full = os.path.join(root, f)
                rel = os.path.relpath(full, src_dir).replace(os.sep, '/')
                arcname = slug + '/' + rel
                zf.write(full, arcname)
    z = zipfile.ZipFile(dst_zip, 'r')
    for info in z.infolist():
        print(f'  {info.filename} ({info.file_size} bytes)')
    print(f'  => {len(z.infolist())} entries, ZIP: {os.path.getsize(dst_zip)} bytes')
    z.close()

base = (
    '/mnt/d/.thongtaccongquangninh/tools/wp-plugins'
    if os.path.exists('/mnt/d/.thongtaccongquangninh/tools/wp-plugins')
    else r'D:\.thongtaccongquangninh\tools\wp-plugins'
)

print('=== Emergency Renderer ===')
pack_plugin(
    os.path.join(base, 'ttcqn-home-emergency-renderer'),
    os.path.join(base, 'ttcqn-home-emergency-renderer.zip'),
    'ttcqn-home-emergency-renderer'
)

print('=== Doorway Safe Renderer ===')
pack_plugin(
    os.path.join(base, 'ttcqn-doorway-safe-renderer'),
    os.path.join(base, 'ttcqn-doorway-safe-renderer.zip'),
    'ttcqn-doorway-safe-renderer'
)

print('=== Service Schema ===')
pack_plugin(
    os.path.join(base, 'ttcqn-doorway-schema'),
    os.path.join(base, 'ttcqn-doorway-schema.zip'),
    'ttcqn-doorway-schema'
)

print('=== SEO Cleanup Redirects ===')
pack_plugin(
    os.path.join(base, 'ttcqn-seo-cleanup-redirects'),
    os.path.join(base, 'ttcqn-seo-cleanup-redirects.zip'),
    'ttcqn-seo-cleanup-redirects'
)
