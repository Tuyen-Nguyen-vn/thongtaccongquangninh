<?php
/**
 * Plugin Name: TTCQN WR26 (one-shot TTCQN_DEBUG grep)
 * Version: 1.0
 */
add_action('rest_api_init', function() {
  register_rest_route('ttcqn-wr26/v1', '/run', [
    'methods' => 'GET',
    'callback' => function() {
      $pluginDir = WP_PLUGIN_DIR;
      $results = [];
      $rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($pluginDir));
      foreach ($rii as $file) {
        if ($file->isDir() || $file->getExtension() !== 'php') continue;
        $path = $file->getPathname();
        $content = @file_get_contents($path);
        if ($content === false) continue;
        if (strpos($content, 'TTCQN_DEBUG') !== false) {
          $lines = explode("
", $content);
          foreach ($lines as $i => $line) {
            if (strpos($line, 'TTCQN_DEBUG') !== false) {
              $results[] = ['file' => str_replace($pluginDir, '', $path), 'line' => $i+1, 'code' => trim($line)];
            }
          }
        }
      }
      // Also check mu-plugins
      $muDir = WPMU_PLUGIN_DIR;
      if (is_dir($muDir)) {
        $rii2 = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($muDir));
        foreach ($rii2 as $file) {
          if ($file->isDir() || $file->getExtension() !== 'php') continue;
          $content = @file_get_contents($file->getPathname());
          if ($content && strpos($content, 'TTCQN_DEBUG') !== false) {
            $lines = explode("
", $content);
            foreach ($lines as $i => $line) {
              if (strpos($line, 'TTCQN_DEBUG') !== false) {
                $results[] = ['file' => 'mu-plugins/'.basename($file->getPathname()), 'line' => $i+1, 'code' => trim($line)];
              }
            }
          }
        }
      }
      return $results;
    },
    'permission_callback' => '__return_true',
  ]);
});
