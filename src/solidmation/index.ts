import fetch from 'node-fetch';
import { parseDevices, parseHomes } from './utils';
import { apiUrl, dataPacketSerials, loginUrl } from './constants';
import {
  LoginResBody,
  GetDataPacketRes,
  EnumHomesRes,
  Home,
  Device,
  DeviceState,
  DeviceModes,
  DeviceFanModes,
} from './types';

export class SolidmationApi {
  private token = '';
  private _homes: Array<Home> = [];
  private _devices: Array<Device> = [];

  get homes() {
    return this._homes;
  }

  get devices() {
    return this._devices;
  }

  private async post(endpoint: string, body?: Record<string, unknown>) {
    const res = await fetch(`${apiUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        token: { Token: this.token },
      }),
    });

    return res.json();
  }

  private async fetchDataPackets(homeId: number) {
    const data: GetDataPacketRes = await this.post(
      '/HomeCloudService.svc/GetDataPacket',
      {
        homeID: homeId,
        serials: dataPacketSerials,
        timeOut: 10000,
      },
    );

    return data.GetDataPacketResult;
  }

  async login(): Promise<void> {
    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: 'juliangsibecas@gmail.com',
        password: 'Sibecas0510',
      }),
    });

    const body: LoginResBody = await res.json();
    this.token = body.d;
  }

  async fetchHomes(): Promise<void> {
    const enumHomes: EnumHomesRes = await this.post(
      '/HomeCloudService.svc/EnumHomes',
    );

    if (enumHomes.EnumHomesResult.ResponseStatus.Status !== 0) {
      throw Error(
        enumHomes.EnumHomesResult.ResponseStatus.Messages[0].Description,
      );
    }

    this._homes = parseHomes(enumHomes.EnumHomesResult.Homes || []);
  }

  async getHomeDevices(id: number): Promise<Array<Device>> {
    const dataPacket = await this.fetchDataPackets(id);

    return parseDevices(dataPacket);
  }

  async fetchDevices(): Promise<void> {
    this._devices = (
      await Promise.all(this._homes.map((home) => this.getHomeDevices(home.id)))
    ).flat();
  }

  async getDeviceStatus(id: number): Promise<Device> {
    await this.fetchDevices();

    const device = this.devices.find((device) => device.id === id);

    if (!device) {
      throw Error();
    }

    return device;
  }

  async setDeviceStatus(
    id: number,
    endpointId: number,
    state: Partial<DeviceState>,
  ) {
    this._devices = this._devices.map((device) => {
      if (device.id === id) {
        return { ...device, state: { ...device.state, ...state } };
      }

      return device;
    });

    this.post('/HomeCloudCommandService.svc/HVACSetModes', {
      endpointID: endpointId,
      mode: state.mode
        ? state.mode
        : state.mode === 0
          ? DeviceModes.Off
          : DeviceModes.NoChange,
      desiredTempC: state.targetTemp || -327.68,
      fanMode: state.fanMode || DeviceFanModes.NoChange,
      flags: 255,
    });
  }
}
