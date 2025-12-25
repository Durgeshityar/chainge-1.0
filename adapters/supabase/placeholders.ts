import type {
  DatabaseChange,
  Filter,
  IDatabaseAdapter,
  IRealtimeAdapter,
  IStorageAdapter,
  ModelName,
  ModelTypeMap,
  PaginatedResult,
  PaginationOptions,
  PresenceChannel,
  QueryOptions,
  RealtimeCallback,
  StorageBucket,
  StorageFile,
  UploadOptions,
} from '../types';

const notImplemented = (method: string): Error =>
  new Error(
    `[SupabaseAdapter] ${method} is not implemented yet. Implement the Supabase database, storage, and realtime adapters before enabling the Supabase provider.`,
  );

const reject = <T>(method: string): Promise<T> => Promise.reject(notImplemented(method));

export const supabaseDatabasePlaceholder: IDatabaseAdapter = {
  get<M extends ModelName>(_model: M, _id: string): Promise<ModelTypeMap[M] | null> {
    return reject('database.get');
  },
  list<M extends ModelName>(_model: M, _options?: QueryOptions): Promise<ModelTypeMap[M][]> {
    return reject('database.list');
  },
  create<M extends ModelName>(_model: M, _data: Partial<ModelTypeMap[M]>): Promise<ModelTypeMap[M]> {
    return reject('database.create');
  },
  update<M extends ModelName>(_model: M, _id: string, _data: Partial<ModelTypeMap[M]>): Promise<ModelTypeMap[M]> {
    return reject('database.update');
  },
  delete(_model: ModelName, _id: string): Promise<void> {
    return reject('database.delete');
  },
  query<M extends ModelName>(_model: M, _filters: Filter[]): Promise<ModelTypeMap[M][]> {
    return reject('database.query');
  },
  queryNearby<M extends ModelName>(
    _model: M,
    _latitude: number,
    _longitude: number,
    _radiusKm: number,
    _options?: QueryOptions,
  ): Promise<ModelTypeMap[M][]> {
    return reject('database.queryNearby');
  },
  paginate<M extends ModelName>(_model: M, _options: PaginationOptions): Promise<PaginatedResult<ModelTypeMap[M]>> {
    return reject('database.paginate');
  },
};

export const supabaseStoragePlaceholder: IStorageAdapter = {
  upload(
    _bucket: StorageBucket,
    _path: string,
    _file: Blob | ArrayBuffer,
    _options?: UploadOptions,
  ): Promise<string> {
    return reject('storage.upload');
  },
  download(_bucket: StorageBucket, _path: string): Promise<Blob> {
    return reject('storage.download');
  },
  delete(_bucket: StorageBucket, _path: string): Promise<void> {
    return reject('storage.delete');
  },
  getPublicUrl(_bucket: StorageBucket, _path: string): string {
    throw notImplemented('storage.getPublicUrl');
  },
  list(_bucket: StorageBucket, _path?: string): Promise<StorageFile[]> {
    return reject('storage.list');
  },
};

export const supabaseRealtimePlaceholder: IRealtimeAdapter = {
  subscribe<T = unknown>(_channel: string, _event: string, _callback: RealtimeCallback<T>): () => void {
    throw notImplemented('realtime.subscribe');
  },
  subscribeToTable<M extends ModelName>(
    _table: M,
    _filter: string | null,
    _callback: RealtimeCallback<DatabaseChange<ModelTypeMap[M]>>,
  ): () => void {
    throw notImplemented('realtime.subscribeToTable');
  },
  broadcast(_channel: string, _event: string, _payload: unknown): Promise<void> {
    return reject('realtime.broadcast');
  },
  presence(_channel: string): PresenceChannel {
    throw notImplemented('realtime.presence');
  },
  unsubscribeAll(): void {
    throw notImplemented('realtime.unsubscribeAll');
  },
};
