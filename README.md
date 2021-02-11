# Automatically Convert Json To Dart

This extention automatically convert `*.d.json` to `*.g.dart`, which is very easy to use.

## How to trigger generation

1. When open a folder, it will compile all of the json file matching the glob pattern `**/*.d.json` 
2. Create a json file with the name suffix `.d.json`.
3. Rename or Save the json file `XXX.d.json`.
4. Open command pallete and find `AutoJson2Dart:Convert all *.d.json to *.g.dart`.

Delete a json file with name `XXX.d.json` will also delete the dart file `XXX.g.dart` at the same time.

## Sample

File: `/my-sample.d.json`

```json
{
  "list": [{ "id": 0, "message": "hello world.", "show": false }],
  "info": {
    "id": 1,
    "name": "Steve",
  },
}
```

Generated file: `/my-sample.g.dart`

```dart
class MySampleInfo {
  int id;
  String name;

  MySampleInfo({
    this.id,
    this.name,
  });
  MySampleInfo.fromJson(Map<String, dynamic> json) {
    id = json["id"]?.toInt();
    name = json["name"]?.toString();
  }
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data["id"] = id;
    data["name"] = name;
    return data;
  }
}

class MySampleList {
  int id;
  String message;
  bool theShow;

  MySampleList({
    this.id,
    this.message,
    this.theShow,
  });
  MySampleList.fromJson(Map<String, dynamic> json) {
    id = json["id"]?.toInt();
    message = json["message"]?.toString();
    theShow = json["show"];
  }
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data["id"] = id;
    data["message"] = message;
    data["show"] = theShow;
    return data;
  }
}

class MySample {
  List<MySampleList> list;
  MySampleInfo info;

  MySample({
    this.list,
    this.info,
  });
  MySample.fromJson(Map<String, dynamic> json) {
    if (json["list"] != null) {
      var v = json["list"];
      var arr0 = List<MySampleList>();
      v.forEach((v) {
        arr0.add(MySampleList.fromJson(v));
      });
      list = arr0;
    }
    info = (json["info"] != null) ? MySampleInfo.fromJson(json["info"]) : null;
  }
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    if (list != null) {
      var v = list;
      var arr0 = List();
      v.forEach((v) {
        arr0.add(v.toJson());
      });
      data["list"] = arr0;
    }
    if (info != null) {
      data["info"] = info.toJson();
    }
    return data;
  }
}

```

