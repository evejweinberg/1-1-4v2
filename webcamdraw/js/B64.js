// B64 - Base 64 encoding/decoding library v0.1
// Copyright (c) 2009 Weston Cann  
B64 = (function () {

	var _keystr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	function _3to4(a,b,c) {
		// Does the heavy lifting of B64 encoding
		// take three 8 bit values, divide them into 4 6 bit values, 
		// use to each 6 bit value to index _keystr
		var ah6 = (a >> 2); 				// top 6 bits of a
		var al2 = ((a & 0x03) << 4);		// last 2 bits of a as 1st 2 bits of 6
		var rv = [ _keystr.charAt(ah6) ];	// you get the idea
		if(b == '=') 
			rv.push(_keystr.charAt(al2),'==');  	
		else {
			rv[1] = _keystr.charAt(al2 | (b >> 4));
			var bl4 = (b & 0x0f) << 2;	
			if(c == '=') 
				rv.push(_keystr.charAt(bl4),'=');
			else {
				rv[2] = _keystr.charAt(bl4 | (c >> 6));
				rv[3] = _keystr.charAt(c & 0x3f);
			}
		}
		return rv;
	}

	var _revkey = { '=' : '=' } 	// pretty, eh?
	for(var i=0; i < _keystr.length; i++) 
		_revkey[_keystr[i]] = i;

	function _4to3(a,b,c,d) {
		// Heavy lifting of Base 64 decoding: 
		// take four b64 digits, key each to a 6 bit number, 
		// bit twiddle to 3 bytes 
		try { a = _revkey[a]; b = _revkey[b]; c = _revkey[c]; d = _revkey[d]; }
		catch (e) { throw "Non base-64 characters found while decoding"; }
		var rv = [ (a << 2) | (b >> 4) ];
		var bl4 = (b & 0xf) << 4;
		if(c == '=')
			rv[1] = bl4;
		else {
			rv[1] = (bl4 | (c >> 2));
			var cl2 = ((c & 0x3) << 6);
			if(d == '=') 
				rv[2] = cl2;
			else 
				rv[2] = (cl2 | d);
		}
		return rv;
	}

	return {
		encode: function (arg) {
			var rv = [],i=0;
			if(typeof arg == 'string') {
				while(arg[i] != null) 
					rv.push.apply(rv,_3to4(
						arg.charCodeAt(i++),
						arg[i] ? arg.charCodeAt(i++) : '=',
						arg[i] ? arg.charCodeAt(i++) : '='
					));
			} else if(arg && arg.slice) {
				while(arg[i] != null) 
					rv.push.apply(rv,_3to4(
						arg[i++],							//arg[i]
						arg[i] != null ? arg[i++] : '=',	//arg[i+1]
						arg[i] != null ? arg[i++] : '='		//arg[i+2]
					));										//i+=3
			} else if(arg && arg.read) {
				var c,d,e;
				while((c = arg.read()) != -1) {
					rv.push.apply(rv,_3to4(
						c,
						(d = arg.read()) != -1 ? d : '=',
						(e = arg.read()) != -1 ? e : '='
					));
				}
			} else
				throw "argument to B64.encode must be string, array, or object with read method";
			return rv.join('');
		},
		decode: function (s,resultType) {
			if(typeof s != 'string') 
				throw "argument 1 to B64.decode must be a base64 encoded string";
			/*if(s.length % 4 != 0)
				throw "base64 encoded string must have length divisible by 4";*/
			var i = 0, rv = [];
			while(s[i])              //s[i]   s[i+1] s[i+2] s[i+3]  ; i += 4
				rv.push.apply(rv,_4to3(s[i++],s[i++],s[i++],s[i++]));
			while(rv[rv.length-1] == 0) rv.pop(); 
			if(resultType == Array) 
				return rv;
			for(i = 0; i < rv.length; i++)
				rv[i] = String.fromCharCode(rv[i]);
			return rv.join('');
		}
	}
})();
