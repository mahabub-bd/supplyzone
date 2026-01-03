export enum Role {
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  STAFF = 'staff',
  USER = 'user',
  MANAGER = 'manager',
  SUPPORT = 'support',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPEND = 'suspend',
  DEACTIVE = 'deactive',
}
export enum StorageType {
  S3 = 'S3',
  LOCAL = 'LOCAL',
  FTP = 'FTP',
}

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  INCOME = 'income',
  EXPENSE = 'expense',
}
