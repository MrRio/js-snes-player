
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

				var BUF_SIZE = 1024;
				//for (var i = 0; i < 100; i ++) {
					var buf = allocate('', 'i8', ALLOC_STACK);
					var retval = _spc_play(snes_spc, BUF_SIZE, buf);
					error(Pointer_stringify(retval));

					_spc_filter_run(filter, buf, BUF_SIZE);

					//var output = Pointer_stringify(buf);
				    var total_buffer = Pointer_stringify(buf);

				//}
				console.log(total_buffer);


				function ab2str(buf) {
				  return String.fromCharCode.apply(null, new Uint16Array(buf));
				}

				function str2ab(str) {
				  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
				  var bufView = new Uint16Array(buf);
				  for (var i=0, strLen=str.length; i<strLen; i++) {
				    bufView[i] = str.charCodeAt(i);
				  }
				  return buf;
				}

				wav = str2ab(total_buffer);

				function encode64(data) {
				var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
				var PAD = '=';
				var ret = '';
				var leftchar = 0;
				var leftbits = 0;
				for (var i = 0; i < data.length; i++) {
				  leftchar = (leftchar << 8) | data[i];
				  leftbits += 8;
				  while (leftbits >= 6) {
				    var curr = (leftchar >> (leftbits-6)) & 0x3f;
				    leftbits -= 6;
				    ret += BASE[curr];
				  }
				}
				if (leftbits == 2) {
				  ret += BASE[(leftchar&3) << 4];
				  ret += PAD + PAD;
				} else if (leftbits == 4) {
				  ret += BASE[(leftchar&0xf) << 2];
				  ret += PAD;
				}
				return ret;
				}



				for (var i = 0; i < wav.length; i++)
        			wav[i] = unSign(wav[i], 8);

      			console.log(document.getElementById("audio"));

      			document.getElementById("audio").innerHTML=("<audio id=\"player\" src=\"data:audio/x-wav;base64,"+encode64(wav)+"\">");
      			document.getElementById("player").play();

				// Do HTML5 gubbins
				/*var context = new webkitAudioContext();
				var source = context.createBufferSource();

				var k, v, n = 0;

				var sink = Sink(function(buffer, channelCount){
					var BUF_SIZE = buffer.length;

					var buf = allocate('', 'i8', ALLOC_STACK);
					var retval = _spc_play(snes_spc, BUF_SIZE, buf);
					//error(Pointer_stringify(retval));

					_spc_filter_run(filter, buf, BUF_SIZE);

					//var output = Pointer_stringify(buf);
					console.log(Pointer_stringify(buf));
				    buffer = Pointer_stringify(buf);



				}, 2);*/


				//}
				
				//console.log(retval);
			}
			
			
		}	
	}
	
}();


setTimeout(function() {
	jsSNESPlayer.init();

}, 1000);


