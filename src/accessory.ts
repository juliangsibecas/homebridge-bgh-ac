import { Service, PlatformAccessory } from 'homebridge';
import {
  AirConditioner,
  AirConditionerFanModes,
  AirConditionerModes,
  AirConditionerState,
} from 'solidmation';
import { AirConditionerPlatform } from './platform';
import {
  parseAccessoryCurrentState,
  parseAccessoryFanSpeed,
  parseAccessoryTargetState,
  parseAirConditionerFanMode,
  parseAirConditionerMode,
} from './utils';

export class AirConditionerAccessory {
  private service: Service;
  private device: AirConditioner;
  private lastState: AirConditionerState;

  constructor(
    private readonly platform: AirConditionerPlatform,
    private readonly accessory: PlatformAccessory<{ device: AirConditioner }>,
  ) {
    this.device = this.accessory.context.device;

    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'BGH')
      .setCharacteristic(
        this.platform.Characteristic.Model,
        this.accessory.context.device.model,
      )
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        this.device.id.toString(),
      );

    this.lastState = this.device.state;

    this.service =
      this.accessory.getService(this.platform.Service.HeaterCooler) ||
      this.accessory.addService(this.platform.Service.HeaterCooler);

    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      this.accessory.context.device.name,
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.Active)
      .onGet(this.handleActiveGet.bind(this))
      .onSet(this.handleActiveSet.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState)
      .onGet(this.handleCurrentHeaterCoolerStateGet.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
      .onGet(this.handleTargetHeaterCoolerStateGet.bind(this))
      .onSet(this.handleTargetHeaterCoolerStateSet.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));

    this.service
      .getCharacteristic(
        this.platform.Characteristic.HeatingThresholdTemperature,
      )
      .setProps({
        minValue: this.accessory.context.device.params.temp.min,
        maxValue: this.accessory.context.device.params.temp.max,
        minStep: 1,
      })
      .onGet(this.handleTargetTemperatureGet.bind(this))
      .onSet(this.handleTargetTemperatureSet.bind(this));

    this.service
      .getCharacteristic(
        this.platform.Characteristic.CoolingThresholdTemperature,
      )
      .setProps({
        minValue: this.accessory.context.device.params.temp.min,
        maxValue: this.accessory.context.device.params.temp.max,
        minStep: 1,
      })
      .onGet(this.handleTargetTemperatureGet.bind(this))
      .onSet(this.handleTargetTemperatureSet.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.RotationSpeed)
      .setProps({
        minValue: 0,
        maxValue: AirConditionerFanModes.High,
        minStep: 1,
      })
      .onGet(this.handleRotationSpeedGet.bind(this))
      .onSet(this.handleRotationSpeedSet.bind(this));
  }

  private async setDeviceStatus(state: Partial<AirConditionerState>) {
    if (state.mode === AirConditionerModes.Off) {
      this.lastState = {
        ...this.lastState,
        ...state,
      };
    }

    this.device.setStatus(state);
  }

  async handleActiveGet() {
    return this.device.state.mode === AirConditionerModes.Off
      ? this.platform.Characteristic.Active.INACTIVE
      : this.platform.Characteristic.Active.ACTIVE;
  }

  async handleActiveSet(value: unknown) {
    const state: Partial<AirConditionerState> = {};

    if (value) {
      if (this.device.state.mode !== AirConditionerModes.Off) {
        return;
      }

      if (this.lastState && this.lastState.mode) {
        state.mode = this.lastState.mode;
        state.targetTemp = this.lastState.targetTemp;
      } else {
        state.mode = AirConditionerModes.Auto;
      }
    } else {
      state.mode = AirConditionerModes.Off;
    }

    this.setDeviceStatus(state);
  }

  async handleCurrentHeaterCoolerStateGet() {
    return parseAccessoryCurrentState(
      this.device.state.mode,
      this.device.state.currentTemp,
      this.device.state.targetTemp,
    );
  }

  async handleTargetHeaterCoolerStateGet() {
    return parseAccessoryTargetState(this.device.state.mode);
  }

  async handleTargetHeaterCoolerStateSet(value: unknown) {
    const mode = parseAirConditionerMode(Number(value));

    if (this.device.state.mode === mode) {
      return;
    }

    await this.setDeviceStatus({
      mode,
    });
  }

  async handleCurrentTemperatureGet() {
    return this.device.state.currentTemp;
  }

  async handleTargetTemperatureGet() {
    return this.device.state.targetTemp;
  }

  async handleTargetTemperatureSet(value: unknown) {
    if (this.device.state.targetTemp === value) {
      return;
    }

    await this.setDeviceStatus({
      targetTemp: value as number,
    });
  }

  async handleRotationSpeedGet() {
    return parseAccessoryFanSpeed(this.device.state.fanMode);
  }

  async handleRotationSpeedSet(value: unknown) {
    const fanMode = parseAirConditionerFanMode(value as number);

    if (this.device.state.fanMode === fanMode) {
      return;
    }

    this.setDeviceStatus({
      fanMode,
    });
  }
}
