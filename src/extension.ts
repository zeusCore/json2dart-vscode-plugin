// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as parser from './lib/parser'
// const compiler = require('./lib/compiler')

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('dartx.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from dartx 三生三ss世fuck!');
	});



	// console.log('activate')
	// onLanguage:python
 
	vscode.workspace.onDidSaveTextDocument(async (document) => {
		const text = document.getText();
		const json = parser.compile(text);
		console.log(json)
	})
	vscode.workspace.onDidChangeTextDocument(event => {
		console.log('file changed' + event.document.fileName)
	});




	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
