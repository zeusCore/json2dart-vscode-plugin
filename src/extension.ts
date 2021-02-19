// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as Mock from 'mockjs';
const json2dart = require('./lib/json2dart.js').default;
import saveAsFile from './lib/fileSaver';

const compiledJson: Set<string> = new Set();

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        'auto-json2dart.convertAllDJsonToDart',
        () => {
            generateAll();
            vscode.window.showInformationMessage('convert done!');
        }
    );

    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.d.json');
    fileWatcher.onDidChange((uri) => {
        generateByUri(uri);
    });
    fileWatcher.onDidCreate((uri) => {
        generateByUri(uri);
    });
    fileWatcher.onDidDelete((uri) => {
        deleteGFile(uri);
    });

    generateAll();

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function deleteGFile(uri: vscode.Uri) {
    if (uri.fsPath.includes('.d.json')) {
        if (compiledJson.has(uri.fsPath)) {
            compiledJson.delete(uri.fsPath);
        }
        const gfile = uri.fsPath.replace(/\.(d|tpl)\.json/, '.g.dart');
        if (fs.existsSync(gfile)) {
            vscode.workspace.fs.delete(vscode.Uri.parse(gfile));
        }
    }
}

function generateByUri(uri: vscode.Uri) {
    const content = fs.readFileSync(uri.fsPath, { encoding: 'utf-8' });
    if (content) generate(uri.fsPath, content);
}

function generateByDocument(document: vscode.TextDocument) {
    generate(document.fileName, document.getText());
}

function generateAll() {
    vscode.workspace.findFiles('**/*.d.json').then((uris) => {
        uris.forEach(generateByUri);
    });
    vscode.workspace.findFiles('**/*.tpl.json').then((uris) => {
        uris.forEach(generateByUri);
    });
}

function generate(filePath: string, content: string) {
    if (filePath.includes('.d.json') || filePath.includes('.tpl.json')) {
        const targetPath = filePath.replace(
            /(\.mock)?\.(d(art)?|tpl?)\.json/,
            '.g.dart'
        );
        const fileName = targetPath.split(/[\\\/]/).pop() || '';
        const className = fileName.split('.')[0].replace(/\W/, '');
        const isTpl = filePath.includes('.tpl.json');
        const isMock = filePath.includes('.mock.');
        if (!/[a-zA-Z_]/.test(className[0])) {
            vscode.window.showErrorMessage(
                `File name should be start with /[a-zA-Z]/: ${className}`
            );
            return;
        }
        let jsonObject;
        let code;
        try {
            jsonObject = JSON.parse(content);
            if (isTpl) {
                jsonObject = Mock.mock(jsonObject);
            }
        } catch (e) {
            vscode.window.showErrorMessage(
                `File content cannot be converted to JSON: ${filePath}`
            );
            return;
        }
        try {
            code = json2dart(className, jsonObject, isMock);
        } catch (e) {
            vscode.window.showErrorMessage(
                `Unexpected error occurred when generate json to dart: ${filePath}`
            );
            return;
        }
        saveAsFile(targetPath, code);
        compiledJson.add(filePath);
    }
}
