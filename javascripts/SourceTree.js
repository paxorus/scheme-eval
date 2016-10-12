/**
 * Prakhar Sahay 10/09/2016
 *
 * SourceTree manages a representation of the editor, making heavy use of Parser. 
 */

function SourceTree(source) {

	this.construct = function () {
		this.source = source;
		try {
			this.tree = Parser.parse(source);
			Parser.validate(this.tree);// can throw exceptions
		} catch (e) {
			terminal.error(e);
			return;
		}
	};

	this.run = function () {
		try {
			var initialEnv = setupEnvironment();// stack
			return this.tree.children.map(function (topLevelExp) {
				return eval(topLevelExp, initialEnv);
			});
		} catch (e) {
			terminal.error(e);
			return [];
		}
	};

	this.construct();
}
