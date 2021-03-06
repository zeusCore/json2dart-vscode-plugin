class ItemcopyEntity {
  int? id;
  bool? isBool;
  ObjEntity? obj;

  ItemcopyEntity({
    this.id,
    this.isBool,
    this.obj,
  });
  void _fromJson(Map<String, dynamic> json) {
    id = json["id"];
    isBool = json["isBool"];
    obj = (json["obj"] != null) ? ObjEntity.fromJson(json["obj"]) : null;
  }
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = Map<String, dynamic>();
    data["id"] = id;
    data["isBool"] = isBool;
    if (obj != null) {
      data["obj"] = obj?.toJson();
    }
    return data;
  }
  ItemcopyEntity.fromJson(Map<String, dynamic> json){
                this._fromJson(json);
            }

}

class ObjEntity {
  String? name;

  ObjEntity({
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
  ObjEntity.fromJson(Map<String, dynamic> json){
                this._fromJson(json);
            }

}
