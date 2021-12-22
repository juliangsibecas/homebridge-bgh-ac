import { AirConditionerFanModes, AirConditionerModes } from 'solidmation';
import {
  AccessoryCurrentState,
  AccessoryFanSpeed,
  AccessoryTargetState,
} from './types';

export const parseAccessoryCurrentState = (
  deviceMode: AirConditionerModes,
  currentTemp: number,
  targetTemp: number
): number => {
  if (deviceMode === AirConditionerModes.Off) {
    return AccessoryCurrentState.Inactive;
  }

  if (
    currentTemp < targetTemp &&
    (deviceMode === AirConditionerModes.Heat ||
      deviceMode === AirConditionerModes.Auto)
  ) {
    return AccessoryCurrentState.Heating;
  }

  if (
    currentTemp > targetTemp &&
    (deviceMode === AirConditionerModes.Cool ||
      deviceMode === AirConditionerModes.Auto)
  ) {
    return AccessoryCurrentState.Cooling;
  }

  return AccessoryCurrentState.Idle;
};

export const parseAccessoryTargetState = (
  deviceMode: AirConditionerModes
): number => {
  const dict = {
    [AirConditionerModes.Auto]: AccessoryTargetState.Auto,
    [AirConditionerModes.Heat]: AccessoryTargetState.Heat,
    [AirConditionerModes.Cool]: AccessoryTargetState.Cool,
  };

  return dict[deviceMode] || AccessoryTargetState.Auto;
};

export const parseAirConditionerMode = (
  accessoryState: AccessoryTargetState
) => {
  const dict = {
    [AccessoryTargetState.Auto]: AirConditionerModes.Auto,
    [AccessoryTargetState.Heat]: AirConditionerModes.Heat,
    [AccessoryTargetState.Cool]: AirConditionerModes.Cool,
  };

  return dict[accessoryState];
};

export const parseAccessoryFanSpeed = (
  deviceFanMode: AirConditionerFanModes
) => {
  const dict = {
    [AirConditionerFanModes.Auto]: AccessoryFanSpeed.Mid,

    [AirConditionerFanModes.Slow]: AccessoryFanSpeed.Slow,
    [AirConditionerFanModes.Mid]: AccessoryFanSpeed.Mid,
    [AirConditionerFanModes.High]: AccessoryFanSpeed.High,
  };

  return dict[deviceFanMode] || 0;
};

export const parseAirConditionerFanMode = (
  accessoryAccessoryFanSpeed: AccessoryFanSpeed
) => {
  const dict = {
    [AccessoryFanSpeed.Slow]: AirConditionerFanModes.Slow,
    [AccessoryFanSpeed.Mid]: AirConditionerFanModes.Mid,
    [AccessoryFanSpeed.High]: AirConditionerFanModes.High,
  };

  return dict[accessoryAccessoryFanSpeed] || AirConditionerFanModes.Auto;
};
