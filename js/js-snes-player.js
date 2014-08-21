/*  js-snes-player - a HTML SNES SPC file player
	(c) 2012 James Hall
*/


	bufferSize = 16384;

var jsSNESPlayer = function() {
	

	function error(str) {

		if (str != '(null)') {
			alert(str);
		}
	}

	var proxy;
	var proxy;
	var first

	var play = function(SongData) {
		//run();
		//console.log(window);

		console.log('Make new SPC instance...');
		var snes_spc = _spc_new();

		console.log('Load filter...');
		var filter = _spc_filter_new();
		if (!snes_spc || !filter) {
			alert('Failed to load');
		} else {
			// Load SPC file into memory				
			// @TODO: Actually load the file in


			var spc = allocate(SongData, 'i8', ALLOC_STACK);

			console.log('Load SPC data into pointer...');

			var spc_size = SongData.length;

			console.log('SPC size is ' + spc_size);

			console.log('Loading SPC');
			var load = _spc_load_spc(snes_spc, spc, spc_size);
			error(Pointer_stringify(load));
			console.log('SPC file loaded');

			_spc_set_tempo(snes_spc, 320);
			_spc_set_output();
			_spc_clear_echo(snes_spc);
			_spc_filter_clear(filter);

			console.log('Creating audio sink...');
			 buf = allocate('', 'i8', ALLOC_STACK);
			myaudioprocess= function(buffer, channelCount){
console.log("called");
				var retval = _spc_play(snes_spc, bufferSize / 2, buf);
				_spc_filter_run(filter, buf, bufferSize);

				for (i = 0; i < bufferSize; i ++) {

					// Take a mono stream
					if ((i - 1) % 2 == 0) {
						buffer[i] = HEAP8[i  + buf] / 120;

					} else {
						buffer[i] = HEAP8[i + buf - 1] / 120;

					}
				}
				console.log('Send audio to buffer... Memory points from HEAP ' + i + ' to ' + (i + buf));
			};

		}
			
context = new AudioContext();


audioNode = context.createScriptProcessor(bufferSize, 0, 1);

audioNode.onaudioprocess = function(audioProcessingEvent) {

  // The output buffer contains the samples that will be modified and played
   outputBuffer = audioProcessingEvent.outputBuffer;
 for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
 outData = outputBuffer.getChannelData(channel);


myaudioprocess(outData,1);
}}

audioNode.connect(context.destination);
	}


	return {
		init: function() {
			$.get('songs/index.json', function(response) {
				$.each(response, function() {
					$('.song-selector').append('<option value="' + this + '">' + this + '</option>');
				});
			});

			$(document).ready(function() {
				$('.js-snes-start').click(function() {
					console.log('Start playing');

					var song = $('.song-selector').val();
					if (song == null) {
						alert('You need to select a song first silly!');
					} else {
						$.get('songs/' + song + '.json', function(response) {
							console.log(response);

							play(response);
						});
					}

				});

				$('.js-snes-stop').click(function() {
					console.log(proxy);
					proxy.parentSink.kill();

				})
			});

		}	
	}
	
}();

//setTimeout(function() {
	jsSNESPlayer.init();
//}, 2000);






