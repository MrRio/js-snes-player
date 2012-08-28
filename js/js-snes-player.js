
var jsSNESPlayer = function() {
	
	function error(str) {

		if (str != '(null)') {
			alert(str);
		}
	}

	return {
		init: function() {
			

			run();
			

			console.log(window);

			var snes_spc = _spc_new();

			var filter = _spc_filter_new();
			if (!snes_spc || !filter) {
				alert('Failed to load');
			} else {
				// Load SPC file into memory				
				// @TODO: Actually load the file in


				var spc = allocate(SongData, 'i8', ALLOC_STACK);

				var spc_size = SongData.length;
				console.log(spc_size);
				var load = _spc_load_spc(snes_spc, spc, spc_size);
				error(Pointer_stringify(load));


				_spc_clear_echo(snes_spc);
				//_spc_filter_clear(filter);

				var k, v, n = 0;

				var bufferSize = 240000, sink = Sink();
				var proxy = sink.createProxy(bufferSize);
				proxy.on('audioprocess', function(buffer, channelCount){

					var buf = allocate('', 'i8', ALLOC_STACK);
					var retval = _spc_play(snes_spc, bufferSize, buf);
					//error(Pointer_stringify(retval));
					//_spc_filter_run(filter, buf, bufferSize);

					for (i = 0; i < bufferSize; i ++) {
						buffer[i] = HEAP8[i  + buf];
					}

				    //console.log(buffer);
				}, 1);
				console.log(HEAP);

			}
			
			
		}	
	}
	
}();

jsSNESPlayer.init();