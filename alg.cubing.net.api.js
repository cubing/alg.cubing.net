

// Main class for the API
//Just call it with the URL of the site;
// Typical call : var api = new CubingAPI('alg.cubing.net');


function CubingAPI(baseSite){
	// This little custom exception will be usefull
	function IllegalArgumentException(message) {
    		this.message = message;
	}

	//Reimplement in_array : We will need it;
	// This is copy of Jquery in_array function;
	function in_array(needle, haystack) {
   	 	var length = haystack.length;
    		for(var i = 0; i < length; i++) {
        		if(haystack[i] == needle) return true;
		}
 		return false;
	}
	
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


	// The allowed GET options in a list. Any value out of this list passed to generate_link will throw and exception
	this.allowedOptions = ['alg', 
		'setup',
		'puzzle',
		'type',
		'scheme',
		'stage',
		'title',
		'view'
	];


	/* This big object contains restriction for certains values.
	 * To add a restriction for an option, add this option name as key
	 * Bind the option name to an array of two vars : The type of restriction (can be regex or set);
	 * The second var is the set or the regex.
	 *
	 * Simple example, to allow only "ABC" and "CDE" values for "foo" option, it would be:
	 * "foo" : ['set', ["ABC", "CDE"]]
	 *
	 * To allow regex, this is similar:
	 * "bar" : ['regex', /^bar$/g]; 
	 */
	this.constraint = {
		'puzzle' : ['set',
			[
				'1x1x1',
				'2x2x2',
				'3x3x3',
				'4x4x4',
				'5x5x5',
				'6x6x6',
				'7x7x7',
				'8x8x8',
				'9x9x9',
				'17x17x17'
			]	
		], // We could rewrite this one with regex...
		'stage' : ['set',
			[
				'full',
				'PLL',
				'OLL',
				'LL',
				'F2L',
				'CLS',
				'ELS',
				'L6E',
				'WV'
			]
		],
		'type' : ['set',
			[
				'moves',
				'reconstruction',
				'alg',
				'reconstruction-end-with-setup'
			]
		],
		'scheme' : ['set',
			[
				'boy',
				'japanese',
				'custom' // Should we allow custom scheme for link generation? it could be useless
			]
		],
		'view' : ['set',
			[
				'editor',
				'playback',
				'fullscreen'
			]
		]
		// Maybe could we add a char number limit for titles?
		
	};


	this.escape_alg = function(alg) {
    		if (!alg) {return alg;}
    		var escaped = alg;
    		escaped = escaped.replace(/_/g, "&#95;").replace(/ /g, "_");
    		escaped = escaped.replace(/\+/g, "&#2b;");
    		escaped = escaped.replace(/-/g, "&#45;").replace(/'/g, "-");
    		return escaped;
	}

	this.toBeEscaped = ['alg', 'setup']; // We set here the var that should be escaped with escape_alg;

	this.generate_link = function(infos, preset){
		//If a preset is passed, we merge it with infos
		//TODO Create an array containing all the preset and check preset validity
		if(preset != undefined){
			for(var key in preset){
				if(!infos.hasOwnProperty(key)){
					//We avoid conflicts beetwen presets and user vars:
					//If both preset and infos have same property, we keep the infos property
					infos[key] = preset[key];					
				}
			}
		}
		try{
			var encodedDatas = this.encode_query(infos);
			return 'http://'+this.baseSite+'/?'+encodedDatas;
		} catch (e){
			console.log(e);
			//In case of exception during query encoding, return false
			return false;
		}	

	}
	this.generate_oll = function(alg, name){
		infos = {'alg' : alg};
		if(name != undefined){
			infos['title'] = name;
		}
		return this.generate_link(infos, this.PRESET_OLL);
	}
	this.generate_pll = function(alg, name){
		infos = {'alg' : alg};
		if(name != undefined){
			infos['title'] = name;
		}
		return this.generate_link(infos, this.PRESET_PLL);
	}

	// Encode a query string from datas
	this.encode_query = function(data){
		var ret = [];
		for(var d in data){
			//We first check if this data is allowed:
			if(in_array(d, this.allowedOptions)){
				// Now we compute restrictions to see if the value is good:
				if(d in this.constraint){ // if the data is restricted
					switch(this.constraint[d][0]){
						case 'regex':
							if(!data[d].match(this.constraint[d][1])){throw new IllegalArgumentException('The given value for ' + d +' doesn\'t respect his restrictions')}
							break;
						case 'set':
							if(!in_array(data[d], this.constraint[d][1])){throw new IllegalArgumentException('The given value for ' + d +' doesn\'t respect his restrictions')}
							break;
		
						default:
							// Bad use of constraint. Throw an exception to notify it
							throw{
								'name':'IllegalModifierException',
								'message' : 'The modifiers for constraint object can only be "regex" or "set" (given '+this.constraint[d][O]+')'
							};	
							break;
					}
				}
				if(in_array(d,this.toBeEscaped)){
					data[d] = this.escape_alg(data[d]);		
				}
				ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));	
		
			} else {
				throw new IllegalArgumentException(d +' isn\'t in the allowed options');
			}
		}
		return ret.join("&");
	}
}



