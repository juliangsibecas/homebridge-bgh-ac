import {
  Device,
  DeviceFanModes,
  DeviceModes,
  DeviceState,
  EndpointParameter,
  EndpointParameters,
  EndpointValues,
  EndpointValueTypes,
  GetDataPacketRes,
  Home,
  RawHome,
} from '../types';

const getEndpointValue = (
  data: EndpointValues['Values'],
  valueType: EndpointValueTypes,
) => Number((data.find((row) => row.ValueType === valueType) || {}).Value || 0);

const getEndpointParameter = (
  data: Array<EndpointParameter>,
  valueName: EndpointParameters,
) => Number((data.find((row) => row.Name === valueName) || {}).Value) || 0;

const parseEndpointValues = (data: EndpointValues['Values']): DeviceState => {
  return {
    mode: getEndpointValue(data, EndpointValueTypes.Mode) as DeviceModes,
    fanMode: getEndpointValue(
      data,
      EndpointValueTypes.FanMode,
    ) as DeviceFanModes,
    targetTemp: getEndpointValue(data, EndpointValueTypes.TargetTemp),
    currentTemp: getEndpointValue(data, EndpointValueTypes.CurrentTemp),
    swingMode: getEndpointValue(data, EndpointValueTypes.SwingMode),
  };
};

const parseEndpointParameters = (data: Array<EndpointParameter>) => {
  return {
    temp: {
      min: getEndpointParameter(data, EndpointParameters.SetpointMin),
      max: getEndpointParameter(data, EndpointParameters.SetpointMax),
    },
  };
};

export const parseHomes = (rawHomes: Array<RawHome>): Array<Home> =>
  rawHomes.map((rawHome) => ({
    id: rawHome.HomeID,
    name: rawHome.Description,
  }));

export const parseDevices = (
  data: GetDataPacketRes['GetDataPacketResult'],
): Array<Device> => {
  const { EndpointValues, Endpoints } = data;

  if (!Endpoints) {
    return [];
  }

  return Endpoints.filter(
    (endpoint) => endpoint.EndpointType === EndpointValueTypes.AirConditioner,
  ).map((endpoint) => {
    const endpointValues = EndpointValues.find(
      (values) => values.EndpointID === endpoint.EndpointID,
    );

    if (!endpointValues) {
      throw new Error();
    }

    return {
      id: endpoint.DeviceID,
      endpointId: endpoint.EndpointID,
      name: endpoint.Description,
      model: endpoint.DeviceModelDesc,
      state: parseEndpointValues(endpointValues.Values),
      params: parseEndpointParameters(endpoint.Parameters),
    };
  });
};
