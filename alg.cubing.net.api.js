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


// Main class for the API
//Just call it with the URL of the site;

var CubingAPI(baseSite){

	this.PRESET_OLL = {
		'view' : 'playback',
		'type' : 'alg',
		'puzzle' : '3x3x3',
		'stage' : 'OLL'
	};

	this.PRESET_PLL = {
		'view' : 'playback',
		'type' : 'alg',
		'puzzle' : '3x3x3',
		'stage' : 'PLL'
	};
	
	this.baseSite = baseSite;

	this.escape_alg = function(alg) {
    		if (!alg) {return alg;}
    		var escaped = alg;
    		escaped = escaped.replace(/_/g, "&#95;").replace(/ /g, "_");
    		escaped = escaped.replace(/\+/g, "&#2b;");
    		escaped = escaped.replace(/-/g, "&#45;").replace(/'/g, "-");
    		return escaped;
	}

	this.toBeEscaped = ['alg', 'scramble']; // We set here the var that should be escaped with escape_alg;

	this.generateLink(infos, preset){
		

	}
	this.generateOLL(){

	}
	this.generatePLL(){

	}

	// Encode a query string from datas
	this.encode_query(data){
		var ret = [];
		for(var d in data){
			if(d in this.toBeEscaped){
				data[d] = this.escape_alg(data[d]);		
			}
			ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));	
		
		}
		return ret.join("&");
	}
}



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

		// We place every type to be escaped here
		var to_be_escaped = ['alg', 'scramble'];



		for(var key in infos){
			if(key == "alg"){
				param_list += (key+'='+escape_alg(infos[key])+'&');
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

