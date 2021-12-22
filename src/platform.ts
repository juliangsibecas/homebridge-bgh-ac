import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformConfig,
  Service,
  Characteristic,
} from 'homebridge';
import { Solidmation } from 'solidmation';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { AirConditionerAccessory } from './accessory';
import { PlatformAirConditioner } from './types';

export class AirConditionerPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic =
    this.api.hap.Characteristic;

  public readonly accessories: Array<PlatformAirConditioner> = [];

  private solidmation: Solidmation;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.solidmation = new Solidmation();

    this.api.on('didFinishLaunching', async () => {
      await this.solidmation.login(this.config.username, this.config.password);
      await this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAirConditioner) {
    this.accessories.push(accessory);
  }

  async discoverDevices() {
    const devices = await this.solidmation.getDevices();

    for (const device of devices) {
      const uuid = this.api.hap.uuid.generate(device.id.toString());

      const existingAccessory = this.accessories.find(
        (accessory) => accessory.UUID === uuid,
      );

      if (existingAccessory) {
        existingAccessory.context.device = device;
        new AirConditionerAccessory(this, existingAccessory);
      } else {
        const accessory: PlatformAirConditioner =
          new this.api.platformAccessory(device.name, uuid);

        accessory.context.device = device;

        new AirConditionerAccessory(this, accessory);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);
      }
    }
  }
}
