// src/types/lru-cache.d.ts

declare module 'lru-cache' {
    export default class LRU<K, V> {
      constructor(options?: {
        max?: number;
        ttl?: number;
        [key: string]: any;
      });
  
      has(key: K): boolean;
      get(key: K): V | undefined;
      set(key: K, value: V): void;
      del(key: K): void;
      clear(): void;
    }
  }
  