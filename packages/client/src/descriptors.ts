import type { DescriptorValues } from "@polkadot-api/codegen"
import type { HexString, OpaqueKeyHash } from "@polkadot-api/substrate-bindings"
import { FixedSizeArray } from "./types"

export type PlainDescriptor<T> = { _type?: T }
export type StorageDescriptor<
  Args extends Array<any>,
  T,
  Optional extends true | false,
  Opaque extends string,
> = { _type: T; _args: Args; _optional: Optional; _Opaque: Opaque }

export type TxDescriptor<Args extends {} | undefined> = {
  ___: Args
}

export type RuntimeDescriptor<Args extends Array<any>, T> = [Args, T]

// pallet -> name -> descriptor
export type DescriptorEntry<T> = Record<string, Record<string, T>>

export type PalletsTypedef<
  St extends DescriptorEntry<StorageDescriptor<any, any, any, any>>,
  Tx extends DescriptorEntry<TxDescriptor<any>>,
  Ev extends DescriptorEntry<PlainDescriptor<any>>,
  Err extends DescriptorEntry<PlainDescriptor<any>>,
  Ct extends DescriptorEntry<PlainDescriptor<any>>,
  Vw extends DescriptorEntry<RuntimeDescriptor<any, any>>,
> = {
  __storage: St
  __tx: Tx
  __event: Ev
  __error: Err
  __const: Ct
  __view: Vw
}

export type ApisTypedef<
  T extends DescriptorEntry<RuntimeDescriptor<any, any>>,
> = T

export { DescriptorValues }

export type ChainDefinition = {
  descriptors: Promise<DescriptorValues> & {
    pallets: PalletsTypedef<any, any, any, any, any, any>
    apis: ApisTypedef<any>
  }
  asset: PlainDescriptor<any>
  metadataTypes: Promise<Uint8Array>
  getMetadata: () => Promise<Uint8Array>
  genesis: HexString | undefined
}

type BuildTuple<L extends number, E, R extends Array<E>> = R["length"] extends L
  ? R
  : BuildTuple<L, E, [E, ...R]>
type UnwrapFixedSizeArray<T extends Array<any>> = T extends [] | [any, ...any[]]
  ? T
  : T extends FixedSizeArray<infer L, infer E>
    ? number extends L
      ? T
      : BuildTuple<L, E, []>
    : T
type ApplyOpaque<Key extends Array<any>, Opaque> = {
  [K in keyof Key]: K extends Opaque ? OpaqueKeyHash : Key[K]
}

type ExtractStorage<
  T extends DescriptorEntry<StorageDescriptor<any, any, any, any>>,
> = {
  [K in keyof T]: {
    [KK in keyof T[K]]: T[K][KK] extends StorageDescriptor<
      infer Key,
      infer Value,
      infer Optional,
      infer Opaque
    >
      ? {
          KeyArgs: UnwrapFixedSizeArray<Key>
          KeyArgsOut: ApplyOpaque<UnwrapFixedSizeArray<Key>, Opaque>
          Value: Value
          IsOptional: Optional
        }
      : unknown
  }
}

type ExtractTx<T extends DescriptorEntry<TxDescriptor<any>>> = {
  [K in keyof T]: {
    [KK in keyof T[K]]: T[K][KK] extends TxDescriptor<infer Args>
      ? Args
      : unknown
  }
}

type ExtractPlain<T extends DescriptorEntry<PlainDescriptor<any>>> = {
  [K in keyof T]: {
    [KK in keyof T[K]]: T[K][KK] extends PlainDescriptor<infer Value>
      ? Value
      : unknown
  }
}

type ExtractRuntime<T extends DescriptorEntry<RuntimeDescriptor<any, any>>> = {
  [K in keyof T]: {
    [KK in keyof T[K]]: T[K][KK] extends RuntimeDescriptor<
      infer Args,
      infer Value
    >
      ? {
          Args: Args
          Value: Value
        }
      : unknown
  }
}

export type ApisFromDef<
  T extends DescriptorEntry<RuntimeDescriptor<any, any>>,
> = ExtractRuntime<T>

export type QueryFromPalletsDef<
  T extends PalletsTypedef<any, any, any, any, any, any>,
> = ExtractStorage<T["__storage"]>

export type TxFromPalletsDef<
  T extends PalletsTypedef<any, any, any, any, any, any>,
> = ExtractTx<T["__tx"]>

export type EventsFromPalletsDef<
  T extends PalletsTypedef<any, any, any, any, any, any>,
> = ExtractPlain<T["__event"]>

export type ErrorsFromPalletsDef<
  T extends PalletsTypedef<any, any, any, any, any, any>,
> = ExtractPlain<T["__error"]>

export type ConstFromPalletsDef<
  T extends PalletsTypedef<any, any, any, any, any, any>,
> = ExtractPlain<T["__const"]>

export type ViewFnsFromPalletsDef<
  T extends PalletsTypedef<any, any, any, any, any, any>,
> = ExtractRuntime<T["__view"]>
