export interface Repository<T> {
  findById(id: number): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  remove(id: number): Promise<void>;
}
