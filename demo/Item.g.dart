import 'itemcopy.g.dart';

class ItemEntity {
  int? id;
  bool? isBool;
  ObjEntity? obj;

  ItemEntity({
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

  ItemEntity.fromJson(Map<String, dynamic> json) {
    this._fromJson(json);
  }
}
