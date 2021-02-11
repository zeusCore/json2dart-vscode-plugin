import * as vscode from 'vscode';

function showInfo(message, type) {
    switch (type) {
        case 'info':
            vscode.window.showInformationMessage(message);
            break;
        case 'error':
            vscode.window.showErrorMessage(message);
            break;
    }
}
export default function generate(rootClass, jsonObj) {
    //snake to camel
    const snakeToCamel = (str) =>
        str.replace(/([-_][a-zA-Z])/g, (group) =>
            group.toUpperCase().replace('-', '').replace('_', '')
        );

    //去除重复元素
    let removeSurplusElement = (obj) => {
        if (Array.isArray(obj)) {
            obj.length = 1;
            removeSurplusElement(obj[0]);
        } else if (typeof obj === 'object') {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    removeSurplusElement(obj[key]);
                }
            }
        }
    };
    //大写转换
    let uppercaseFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    //Dart关键字保护
    let dartKeywordDefence = (key) => {
        if (typeof key === 'string') {
            //https://dart.dev/guides/language/language-tour
            let reservedKeywords = [
                'num',
                'double',
                'int',
                'String',
                'bool',
                'List',
                'abstract',
                'dynamic',
                'implements',
                'show',
                'as',
                'else',
                'import',
                'static',
                'assert',
                'enum',
                'in',
                'super',
                'async',
                'export',
                'interface',
                'switch',
                'await',
                'extends',
                'is',
                'sync',
                'break',
                'external',
                'library',
                'this',
                'case',
                'factory',
                'mixin',
                'throw',
                'catch',
                'false',
                'new',
                'true',
                'class',
                'final',
                'null',
                'try',
                'const',
                'finally',
                'on',
                'typedef',
                'continue',
                'for',
                'operator',
                'var',
                'covariant',
                'Function',
                'part',
                'void',
                'default',
                'get',
                'rethrow',
                'while',
                'deferred',
                'hide',
                'return',
                'with',
                'do',
                'if',
                'set',
                'yield'
            ];
            if (reservedKeywords.includes(key)) {
                return `the${uppercaseFirst(key)}`;
            }
        }
        return key;
    };

    //泛型字符串生成器
    let genericStringGenerator = (innerClass, count) => {
        let genericStrings = [innerClass];
        while (count) {
            genericStrings.unshift('List<');
            genericStrings.push('>');
            count--;
        }
        let genericString = genericStrings.join('');
        return genericString;
    };

    //!获取最内层对象,类型和层数
    let getInnerObjInfo = (arr, className) => {
        let count = 0;
        let getInnerObj = (arr) => {
            if (Array.isArray(arr)) {
                let first = arr[0];
                count++;
                return getInnerObj(first);
            } else {
                return arr;
            }
        };

        let inner = getInnerObj(arr);
        let innerClass = className;
        if (typeof inner === 'boolean') {
            //we don't handle boolean
            innerClass = 'bool';
        } else {
            if (typeof inner === 'string') {
                innerClass = 'String';
            }
            if (typeof inner === 'number') {
                if (Number.isInteger(inner)) {
                    innerClass = 'int';
                } else {
                    innerClass = 'double';
                }
            }
        }
        return { inner, innerClass, count };
    };
    //!获取数组循环语句
    let getIterateLines = (arr, className, key, legalKey, jsonKey) => {
        if (legalKey == 'data') {
            legalKey = 'this.data';
        }

        function makeBlank(count) {
            let str = '';
            for (let index = 0; index < count + 1; index++) {
                str += '  ';
            }
            return str;
        }

        let { inner, innerClass, count } = getInnerObjInfo(arr, className);
        if (inner === undefined || inner === null) {
            showInfo(
                `the property named &nbsp <b>'${key}'</b> &nbsp is an EMPTY array ! parse process is failed !`
            );
            return {
                fromJsonLinesJoined: '    >>>>>>error<<<<<<\n',
                toJsonLinesJoined: '    >>>>>>error<<<<<<\n'
            };
        }
        let total = count;
        let fromJsonLines = [];
        let toJsonLines = [];

        count--;

        if (typeof inner === 'object') {
            fromJsonLines.push(
                `${makeBlank(count * 3)}v.forEach((v) {\n${makeBlank(
                    count * 4
                )}arr${count}.add(${className}.fromJson(v));\n${makeBlank(
                    count * 3
                )}});`
            );
            toJsonLines.push(
                `${makeBlank(count * 3)}v.forEach((v) {\n${makeBlank(
                    count * 4
                )}arr${count}.add(v.toJson());\n${makeBlank(count * 3)}});`
            );
        } else {
            let toType = 'v';
            if (typeof inner === 'boolean') {
                //we don't handle boolean
            } else {
                if (typeof inner === 'string') {
                    toType = 'v.toString()';
                }
                if (typeof inner === 'number') {
                    if (Number.isInteger(inner)) {
                        toType = 'v.toInt()';
                    } else {
                        toType = 'v.toDouble()';
                    }
                }
            }
            if (
                typeof inner === 'string' ||
                typeof inner === 'number' ||
                typeof inner === 'boolean'
            ) {
                fromJsonLines.push(
                    `${makeBlank(count * 3)}v.forEach((v) {\n${makeBlank(
                        count * 4
                    )}arr${count}.add(${toType});\n${makeBlank(count * 3)}});`
                );
                toJsonLines.push(
                    `${makeBlank(count * 3)}v.forEach((v) {\n${makeBlank(
                        count * 4
                    )}arr${count}.add(v);\n${makeBlank(count * 3)}});`
                );
            }
        }

        while (count) {
            fromJsonLines.unshift(
                `${makeBlank(count * 2)}v.forEach((v) {\n${makeBlank(
                    count * 3
                )}var arr${count} = ${genericStringGenerator(
                    innerClass,
                    total - count
                )}();`
            );
            fromJsonLines.push(
                `${makeBlank(count * 3)}arr${
                    count - 1
                }.add(arr${count});\n${makeBlank(count * 2)}});`
            );
            toJsonLines.unshift(
                `${makeBlank(count * 2)}v.forEach((v) {\n${makeBlank(
                    count * 3
                )}var arr${count} = List();`
            );
            toJsonLines.push(
                `${makeBlank(count * 3)}arr${
                    count - 1
                }.add(arr${count});\n${makeBlank(count * 2)}});`
            );
            count--;
        }

        let typeCheck = '';
        fromJsonLines.unshift(
            `${makeBlank(
                count * 2
            )}if (json[${jsonKey}] != null${typeCheck}) {\n${makeBlank(
                count * 2
            )}var v = json[${jsonKey}];\n${makeBlank(
                count * 2
            )}var arr0 = ${genericStringGenerator(innerClass, total)}();`
        );
        fromJsonLines.push(
            `${makeBlank(count * 2)}${makeBlank(
                count
            )}${legalKey} = arr0;\n    }\n`
        );
        toJsonLines.unshift(
            `    if (${legalKey} != null) {\n      var v = ${legalKey};\n      var arr0 = List();`
        );
        toJsonLines.push(`      data[${jsonKey}] = arr0;\n    }\n`);

        let fromJsonLinesJoined = fromJsonLines.join('\r\n');
        let toJsonLinesJoined = toJsonLines.join('\r\n');
        return { fromJsonLinesJoined, toJsonLinesJoined };
    };

    //!json对象转dart
    let objToDart = (jsonObj, prefix, baseClass) => {
        if (Array.isArray(jsonObj)) {
            return objToDart(jsonObj[0], prefix, baseClass);
        }

        const props = Object.keys(jsonObj);
        const hasProps = props.length;

        let lines = [];

        let jsonKeysLines = [];

        let propsLines = [];
        let constructorLines = [];
        let fromJsonLines = [];
        let toJsonLines = [];

        let className = `${prefix}${uppercaseFirst(baseClass)}`;

        className = snakeToCamel(className);

        lines.push(`class ${className} {`);
        // lines.push(`/*\r\n${JSON.stringify(jsonObj, null, 2)} \r\n*/\r\n`);

        constructorLines.push(`  ${className}({\n`);
        fromJsonLines.push(
            `  ${className}.fromJson(Map<String, dynamic> json) {\n`
        );
        toJsonLines.push(`  Map<String, dynamic> toJson() {\n`);
        toJsonLines.push(
            `    final Map<String, dynamic> data = Map<String, dynamic>();\n`
        );

        for (let key in jsonObj) {
            if (jsonObj.hasOwnProperty(key)) {
                let element = jsonObj[key];

                let legalKey = dartKeywordDefence(key);

                legalKey = snakeToCamel(legalKey);

                let thisData = '';
                if (key === 'data') {
                    thisData = 'this.';
                }

                let jsonKey = `"${key}"`;

                jsonKeysLines.push(`const String ${jsonKey} = "${key}";`);
                constructorLines.push(`    this.${legalKey},\n`);
                if (element === null) {
                    //!显示错误信息
                    showInfo(
                        `the Property named '${key}' is null, which will be treated as String type`,
                        'error'
                    );
                    element = '';
                }
                if (typeof element === 'object') {
                    let subClassName = `${className}${uppercaseFirst(key)}`;

                    subClassName = snakeToCamel(subClassName);

                    if (Array.isArray(element)) {
                        let { inner, innerClass, count } = getInnerObjInfo(
                            element,
                            subClassName
                        );
                        let {
                            fromJsonLinesJoined,
                            toJsonLinesJoined
                        } = getIterateLines(
                            element,
                            subClassName,
                            key,
                            legalKey,
                            jsonKey
                        );
                        let genericString = genericStringGenerator(
                            innerClass,
                            count
                        );
                        propsLines.push(`  ${genericString} ${legalKey};\n`);
                        fromJsonLines.push(fromJsonLinesJoined);
                        toJsonLines.push(toJsonLinesJoined);
                        if (typeof inner === 'object') {
                            lines.unshift(objToDart(element, className, key));
                        }
                    } else {
                        lines.unshift(objToDart(element, className, key));
                        propsLines.push(`  ${subClassName} ${legalKey};\n`);
                        let typeCheck = '';
                        fromJsonLines.push(
                            `    ${legalKey} = (json[${jsonKey}] != null${typeCheck}) ? ${subClassName}.fromJson(json[${jsonKey}]) : null;\n`
                        );
                        toJsonLines.push(
                            `    if (${legalKey} != null) {\n      data[${jsonKey}] = ${thisData}${legalKey}.toJson();\n    }\n`
                        );
                    }
                } else {
                    let toType = `json[${jsonKey}]`;
                    let type = '';
                    if (typeof element === 'boolean') {
                        //bool is special
                        type = 'bool';
                    } else {
                        if (typeof element === 'string') {
                            toType = `json[${jsonKey}]?.toString()`;
                            type = 'String';
                        } else if (typeof element === 'number') {
                            if (Number.isInteger(element)) {
                                toType = `json[${jsonKey}]?.toInt()`;
                                type = 'int';
                            } else {
                                toType = `json[${jsonKey}]?.toDouble()`;
                                type = 'double';
                            }
                        }
                    }
                    propsLines.push(`  ${type} ${legalKey};\n`);
                    fromJsonLines.push(`    ${legalKey} = ${toType};\n`);
                    toJsonLines.push(
                        `    data[${jsonKey}] = ${thisData}${legalKey};\n`
                    );
                }
            }
        }

        constructorLines.push(`  });`);
        fromJsonLines.push(`  }`);
        toJsonLines.push(`    return data;\n  }`);

        lines.push(propsLines.join(''));

        hasProps && lines.push(constructorLines.join(''));

        lines.push(fromJsonLines.join(''));
        lines.push(toJsonLines.join(''));

        lines.push(`}\n`);

        let linesOutput = lines.join('\r\n');

        return linesOutput;
    };

    rootClass = snakeToCamel(rootClass);
    rootClass = uppercaseFirst(rootClass);

    removeSurplusElement(jsonObj);

    return objToDart(jsonObj, rootClass, '');
}
