/* Prakhar Sahay 07/13/2016


*/

function tokenize(exp){// " (a (b c) d) " --> [a,(b c),d]
	// exp = exp.trim();
	var parts = [];

	var buffer = "";
	var depth = 1;
	for(var i=1; i<exp.length; i++){
		if(isWhiteSpace(exp[i]) && depth == 1){
			if(buffer.length > 0){
				parts.push(buffer);
				buffer = "";
			}
		}else{
			buffer += exp[i];
			if(exp[i] == "("){
				depth++;
			}else if(exp[i] == ")"){
				depth--;
				if(depth==0 && buffer.length > 1){
					// edge case for final token "...)"
					parts.push(buffer.slice(0,-1));
				}
			}
		}
	}
	// console.log(parts);
	return parts;
}

function traverse(exp,lvl){
	tokenize(exp).forEach(function (token) {
		if(token[0] == "(" && token[token.length-1] == ")"){
			traverse(token, lvl+1);
		}else{
			console.log(token+" "+lvl);
		}
	});
}

function parse(text){
	text = text.split("\n").map(stripComment).join("\n");
	console.log(text);
	traverse(text, 0);
}

function stripComment(line){
	// find first semicolon that is not part of a string
	if(line.indexOf(";") == -1){
		return line;
	}

	var insideString = false;
	for(var i=0; i<line.length; i++){
		if(line[i] == "\""){
			insideString = !insideString;
		}else if(line[i] == ";" && !insideString){
			return line.substring(0, i);
		}
	}
	return line;
}

function isWhiteSpace(char){
	return ["\n","\t"," "].indexOf(char) > -1;
}

function eval(exp, env){
	if(isLiteral(exp)){
		return exp;
	}else if(isApplication(exp)){
		apply();
	}else{
		error("Unknown expression type -- EVAL");
	}
}

function apply(proc, args){

}

function isLiteral(exp){
	return isNumber(exp) || isString(exp) || isBoolean(exp);
}

function isNumber(exp){
	return +exp !== NaN;
}

function isString(exp){
	return exp[0] == "\"" && exp[exp.length-1] == "\"";
}

function isBoolean(exp){
	return exp == "#t" || exp == "#f";
}

function isPrimitiveProcedure(proc){
	return proc[0] == "primitive";
}

function error(message){
	console.log("uh oh");
	console.log(message);
}

var primitiveProcedures = {
	car: function(c){return c.x},
	cdr: function(c){return c.y},
	cons: function(x,y){assertNargs(arguments,2);return {x:x,y:y}},
	"null?": function(x){assertNargs(arguments,1);return x === null},
	"zero?": function(x){assertNargs(arguments,1);assertNum(arguments);return x === 0},
	"eq?": function(a,b){return a === b},
	"equal?": function(a,b){return a === b},
	"1+": function(a){assertNargs(arguments,1);assertNum(arguments);return a+1},
	"-1+": function(a){assertNargs(arguments,1);assertNum(arguments);return a-1},
	quotient: function(a,b){assertNargs(arguments,2);assertNum(arguments);return Math.floor(a/b)},
	remainder: function(a,b){assertNargs(arguments,2);assertNum(arguments);return a%b},
	"/": function(){
		assertNargs(arguments,">=1");
		assertNum(arguments);
		var dividend=arguments.unshift();
		return arguments.reduce(function(a,b){return a/b},dividend);
	},
	"*": function(){
		assertNum(arguments);
		return arguments.reduce(function(a,b){return a*b},1);
	},
	"+": function(){
		assertNum(arguments);
		return arguments.reduce(function(a,b){return a+b},0);
	},
	"-": function(){
		assertNargs(arguments,">=1");
		assertNum(arguments);
		var minuend=arguments.unshift();
		return arguments.reduce(function(a,b){return a-b},minuend);
	},
	"=": function(){
		assertNargs(arguments,">=2");
		assertNum(arguments);
		for(var i=1;i<arguments.length;i++){
			if(arguments[i-1] !== arguments[i]){
				return false;
			}
		}
		return true;
	}

}

function assertNargs(){
	console.log("wip");
}

function assertNum(){
	console.log("wip");
}