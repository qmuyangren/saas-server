export class DictTypeInfo {
  id: number;
  code: string;
  name: string;
  isTree: number;
  type: number;
  status: number;
  remark: string | null;
  createdBy: number | null;
  createdAt: Date;
  updatedBy: number | null;
  updatedAt: Date;
  isDeleted: number;
  deletedBy: number | null;
  deletedAt: Date | null;
}

export class DictDataInfo {
  id: number;
  dictType: string;
  label: string;
  value: string;
  sort: number;
  status: number;
  cssClass: string | null;
  isDefault: number;
  description: string | null;
  createdBy: number | null;
  createdAt: Date;
  updatedBy: number | null;
  updatedAt: Date;
  isDeleted: number;
  deletedBy: number | null;
  deletedAt: Date | null;
}
