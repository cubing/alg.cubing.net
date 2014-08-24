// Define the site base here
var site_base = "http://alg.cubing.net";

// Preset list for easier use of this API
// Using var instead of const to provide some backwards compatibilty with old IE 

var PRESET_OLL = {
	'view' : 'playback',
	'type' : 'alg',
	'puzzle' : '3x3x3',
	'stage' : 'OLL'
};

var PRESET_PLL = {
	'view' : 'playback',
	'type' : 'alg',
	'puzzle' : '3x3x3',
	'stage' : 'PLL'
};


function generateLink(infos, preset){
	if(infos != undefined){
		//We handle the presets:
		if(preset != undefined){
			for(var key in preset){
				if(!infos.hasOwnProperty(key)){
					//We avoid conflicts beetwen presets and user vars:
					//If both preset and infos have same property, we keep the infos property
					infos[key] = preset[key];					
				}
			}
		}
		var param_list = '/?';
		for(var key in infos){
			if(key == "alg"){
				param_list += (key+'='+encode_alg(infos[key])+'&');
			} else {
				param_list += (key+'='+encodeURIComponent(infos[key])+'&');
			}
		}
		param_list = param_list.substr(0, param_list.length-1);
		return site_base+param_list;
	} else {
		return site_base;
	}
}
function encode_alg(alg){
	alg = alg.trim();
	move_list = alg.split(' ');
	for(var key in move_list){
		move_list[key] = move_list[key].replace("'", '-');
	}
	alg = move_list.join('_');
	console.log(alg);
	return encodeURIComponent(alg);
}
