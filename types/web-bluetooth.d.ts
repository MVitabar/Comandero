// Web Bluetooth API TypeScript definitions
// This file provides type definitions for the Web Bluetooth API

interface BluetoothLEScanFilters {
  services?: string[]
  name?: string
  namePrefix?: string
}

interface BluetoothLEScanOptions {
  acceptAllDevices?: boolean
  filters?: BluetoothLEScanFilters[]
  optionalServices?: string[]
}

interface BluetoothRemoteGATTService {
  device: BluetoothDevice
  uuid: string
  isPrimary: boolean
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>
  getCharacteristics(characteristic?: string): Promise<BluetoothRemoteGATTCharacteristic[]>
}

interface BluetoothRemoteGATTCharacteristic {
  service: BluetoothRemoteGATTService
  uuid: string
  value?: DataView
  readValue(): Promise<DataView>
  writeValue(value: BufferSource): Promise<void>
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  addEventListener(type: string, listener: (this: BluetoothRemoteGATTCharacteristic, ev: Event) => any): void
  removeEventListener(type: string, listener: (this: BluetoothRemoteGATTCharacteristic, ev: Event) => any): void
}

interface BluetoothRemoteGATTServer {
  device: BluetoothDevice
  connected: boolean
  connect(): Promise<BluetoothRemoteGATTServer>
  disconnect(): void
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>
  getPrimaryServices(service?: string): Promise<BluetoothRemoteGATTService[]>
}

interface BluetoothDevice {
  id: string
  name?: string
  gatt?: BluetoothRemoteGATTServer
  addEventListener(type: string, listener: (this: BluetoothDevice, ev: Event) => any): void
  removeEventListener(type: string, listener: (this: BluetoothDevice, ev: Event) => any): void
}

interface RequestDeviceOptions extends BluetoothLEScanOptions {
  optionalServices?: string[]
}

interface Bluetooth {
  getAvailability(): Promise<boolean>
  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>
}

interface Navigator {
  bluetooth?: Bluetooth
}

// WebUSB API TypeScript definitions
interface USBDeviceFilter {
  vendorId?: number
  productId?: number
  classCode?: number
  subclassCode?: number
  protocolCode?: number
  serialNumber?: string
}

interface USBDevice {
  device: USB
  vendorId: number
  productId: number
  productVersion: number
  manufacturerName?: string
  productName?: string
  serialNumber?: string
  configurations: USBConfiguration[]
  open(): Promise<void>
  close(): Promise<void>
  selectConfiguration(configurationValue: number): Promise<void>
  claimInterface(interfaceNumber: number): Promise<void>
  releaseInterface(interfaceNumber: number): Promise<void>
  selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void>
  transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>
  transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>
  reset(): Promise<void>
}

interface USBConfiguration {
  configurationValue: number
  configurationName?: string
  interfaces: USBInterface[]
}

interface USBInterface {
  interfaceNumber: number
  alternate: USBAlternateInterface
  alternates: USBAlternateInterface[]
  claimed: boolean
}

interface USBAlternateInterface {
  alternateSetting: number
  interfaceClass: number
  interfaceSubclass: number
  interfaceProtocol: number
  interfaceName?: string
  endpoints: USBEndpoint[]
}

interface USBEndpoint {
  endpointNumber: number
  direction: 'in' | 'out'
  type: 'bulk' | 'interrupt' | 'isochronous'
  packetSize: number
}

interface USBInTransferResult {
  data: DataView
  status: USBTransferStatus
}

interface USBOutTransferResult {
  bytesWritten: number
  status: USBTransferStatus
}

type USBTransferStatus = 'ok' | 'stall' | 'babble'

interface USBConnectionEvent extends Event {
  device: USBDevice
}

interface USB {
  getDevices(): Promise<USBDevice[]>
  requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>
  addEventListener(type: 'connect', listener: (this: USB, ev: USBConnectionEvent) => void): void
  addEventListener(type: 'disconnect', listener: (this: USB, ev: USBConnectionEvent) => void): void
  removeEventListener(type: 'connect', listener: (this: USB, ev: USBConnectionEvent) => void): void
  removeEventListener(type: 'disconnect', listener: (this: USB, ev: USBConnectionEvent) => void): void
}

interface USBDeviceRequestOptions {
  filters: USBDeviceFilter[]
}

interface Navigator {
  usb?: USB
}
