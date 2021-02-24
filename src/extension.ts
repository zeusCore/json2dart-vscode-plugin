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

    bind(vscode.workspace.createFileSystemWatcher('**/*.d.json'));
    bind(vscode.workspace.createFileSystemWatcher('**/*.dart.json'));

    generateAll();

    context.subscriptions.push(disposable);
    function bind(fileWatcher: vscode.FileSystemWatcher) {
        fileWatcher.onDidChange((uri) => {
            generateByUri(uri);
        });
        fileWatcher.onDidCreate((uri) => {
            generateByUri(uri);
        });
        fileWatcher.onDidDelete((uri) => {
            deleteGFile(uri);
        });
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}

function deleteGFile(uri: vscode.Uri) {
    if (uri.fsPath.includes('.d.json') || uri.fsPath.includes('.dart.json')) {
        if (compiledJson.has(uri.fsPath)) {
            compiledJson.delete(uri.fsPath);
        }
        const gfile = uri.fsPath.replace(/\.(d|dart)\.json/, '.g.dart');
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
    vscode.workspace.findFiles('**/*.dart.json').then((uris) => {
        uris.forEach(generateByUri);
    });
}

function generate(filePath: string, content: string) {
    if (filePath.includes('.d.json') || filePath.includes('.dart.json')) {
        const targetPath = filePath.replace(/\.(d(art)?)\.json/, '.g.dart');
        const fileName = targetPath.split(/[\\\/]/).pop() || '';
        const className = fileName.split('.')[0].replace(/\W/, '');

        if (!/[a-zA-Z_]/.test(className[0])) {
            vscode.window.showErrorMessage(
                `File name should be start with /[a-zA-Z]/: ${className}`
            );
            return;
        }
        let jsonObject;
        let code;
        let useData;
        let isTpl = false;
        let useMock = false;
        let jsonTpl;

        try {
            jsonObject = JSON.parse(content);

            jsonTpl = jsonObject['@fromJson'];

            if (!jsonTpl) {
                jsonTpl = jsonObject;
            } else {
                isTpl = !!jsonObject['@template'];
                useData = !!jsonObject['@useData'];
                useMock = !!jsonObject['@useMock'];
            }

            if (isTpl) {
                jsonTpl = Mock.mock(jsonTpl);
            }
        } catch (e) {
            vscode.window.showErrorMessage(
                `File content cannot be converted to JSON: ${filePath}`
            );
            return;
        }
        try {
            code = json2dart(className, jsonTpl, { useData, useMock });
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
