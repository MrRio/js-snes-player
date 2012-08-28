
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


				//_spc_clear_echo(snes_spc);
				//_spc_filter_clear(filter);

				var BUF_SIZE = 48;

				var buf;

				for (i = 0; i < 5; i ++) {
					var buf = null;
					//var spc_play = cwrap('spc_play', 'string');

					//console.log(spc_play());

					//_spc_play(snes_spc, BUF_SIZE, buf_pointer);



				}
				
				//console.log(retval);
			}
			
			
		}	
	}
	
}();

jsSNESPlayer.init();


