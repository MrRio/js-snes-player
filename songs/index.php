<?php
$folders = glob('*');

$all_files = array();
foreach ($folders as $folder) {
	$files = glob($folder . '/*');
	$all_files = array_merge($all_files, $files);
}

foreach ($all_files as $file) {
	$file = str_replace(' ', '\ ', $file);
	echo 'python ../../emscripten/tools/file2json.py ' . $file . ' > ' . $file . '.json' . "\n";
}

//echo json_encode($all_files);
?>