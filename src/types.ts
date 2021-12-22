import { PlatformAccessory } from 'homebridge';
import { AirConditioner } from 'solidmation';

export type PlatformAirConditioner = PlatformAccessory<{
  device: AirConditioner;
}>;

export enum AccessoryCurrentState {
  Inactive = 0,
  Idle = 1,
  Heating = 2,
  Cooling = 3,
}

export enum AccessoryTargetState {
  Auto = 0,
  Heat = 1,
  Cool = 2,
}

export enum AccessoryFanSpeed {
  Slow = 1,
  Mid = 2,
  High = 3,
}
