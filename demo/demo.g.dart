class DemoEntity {
  List<String>? list;
  List<List2 : ItemEntity>? list2 : ItemEntity;
  Info : InfoEntity? info : InfoEntity;

  DemoEntity({
    this.list,
    this.list2 : ItemEntity,
    this.info : InfoEntity,
  });
  void _fromJson(Map<String, dynamic> json) {
  if (json["list"] != null) {
  var v = json["list"];
  List<String> arr0 = [];
  v.forEach((v) {
  arr0.add(v.toString());
  });
    list = arr0;
    }
  if (json["list2 : ItemEntity"] != null) {
  var v = json["list2 : ItemEntity"];
  List<List2 : ItemEntity> arr0 = [];
  v.forEach((v) {
  arr0.add(List2 : ItemEntity.fromJson(v));
  });
    list2 : ItemEntity = arr0;
    }
    info : InfoEntity = (json["info : InfoEntity"] != null) ? Info : InfoEntity.fromJson(json["info : InfoEntity"]) : null;
  }
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    if (list != null) {
      var v = list??[];
      var arr0 = [];
  v.forEach((v) {
  arr0.add(v);
  });
      data["list"] = arr0;
    }
    if (list2 : ItemEntity != null) {
      var v = list2 : ItemEntity??[];
      var arr0 = [];
  v.forEach((v) {
  arr0.add(v.toJson());
  });
      data["list2 : ItemEntity"] = arr0;
    }
    if (info : InfoEntity != null) {
      data["info : InfoEntity"] = info : InfoEntity?.toJson();
    }
    return data;
  }
  DemoEntity.fromJson(Map<String, dynamic> json){
                this._fromJson(json);
            }

}

class Info : InfoEntity {
  String? name;

  Info : InfoEntity({
    this.name,
  });
  void _fromJson(Map<String, dynamic> json) {
    name = json["name"];
  }
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data["name"] = name;
    return data;
  }
  Info : InfoEntity.fromJson(Map<String, dynamic> json){
                this._fromJson(json);
            }

}

class List2 : ItemEntity {
  int? id;

  List2 : ItemEntity({
    this.id,
  });
  void _fromJson(Map<String, dynamic> json) {
    id = json["id"];
  }
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data["id"] = id;
    return data;
  }
  List2 : ItemEntity.fromJson(Map<String, dynamic> json){
                this._fromJson(json);
            }

}
