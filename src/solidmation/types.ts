export interface Home {
  id: number;
  name: string;
}

export interface RawHome {
  HomeID: number;
  Description: string;
}

export enum DeviceFanModes {
  Slow = 1,
  Mid = 2,
  High = 3,
  Auto = 254,
  NoChange = 255,
}

export enum DeviceSwingModes {
  Off = 0,
  Turbo = 8,
  Horizontal = 16,
  TurboHorizontal = 24,
}

export enum DeviceModes {
  Off = 0,
  Cool = 1,
  Heat = 2,
  Dry = 3,
  Fan = 4,
  Auto = 254,
  NoChange = 255,
}

export interface RawDeviceState {
  mode: DeviceModes;
  desiredTempC: number;
}

export interface DeviceState {
  mode: DeviceModes;
  fanMode: DeviceFanModes;
  swingMode: DeviceSwingModes;
  currentTemp: number;
  targetTemp: number;
}

export interface DeviceParams {
  temp: {
    min: number;
    max: number;
  };
}

export interface Device {
  id: number;
  endpointId: number;
  name: string;
  model: string;
  state: DeviceState;
  params: DeviceParams;
}

export interface LoginResBody {
  d: string;
}

export interface ResponseStatus {
  Messages: Array<{
    Code: number;
    Description: string;
  }>;
  Status: number;
}

export interface Endpoint {
  DeviceID: number;
  Description: string;
  DeviceModelDesc: string;
  EndpointID: number;
  EndpointType: number;
  Parameters: Array<EndpointParameter>;
}

export enum EndpointParameters {
  SetpointMin = 'SetpointMinC',
  SetpointMax = 'SetpointMaxC',
}

export interface EndpointParameter {
  Name: string;
  Value: string;
}

export enum EndpointValueTypes {
  AirConditioner = 0x0000000c,
  Mode = 14,
  SwingMode = 18,
  FanMode = 15,
  CurrentTemp = 13,
  TargetTemp = 20,
}

export interface EndpointValues {
  EndpointID: number;
  Values: Array<{
    ValueType: number;
    Value: string;
  }>;
}

export interface EnumHomesRes {
  EnumHomesResult: {
    Homes: Array<RawHome>;
    ResponseStatus: ResponseStatus;
  };
}

export interface GetDataPacketRes {
  GetDataPacketResult: {
    Endpoints?: Array<Endpoint>;
    EndpointValues: Array<EndpointValues>;
    ResponseStatus: ResponseStatus;
  };
}
