import si from "systeminformation";
import { formatSizeUnits } from "./files.js";
 /*{
    const partitionsSize = await fsSize(device);
    const totalSize = partitionsSize.map(
      ({ size: size1, used: used1 }, { size: size2, used: used2 }) => {
        return {
          size: size1 + size2,
          used: used1 + used2,
        };
      },
      {
        used: 0,
        size: 0,
      }
    );
        return {
      device,
      used: formatSizeUnits(totalSize.used),
      size: formatSizeUnits(totalSize.size),
    };
    

    const totalSize = partitionsSize;
  }*/
const promisify = (fun) => {
  return (...props) => new Promise((resolve) => fun(...props, resolve));
};

const fsSize = promisify(si.fsSize);
const diskLayout = promisify(si.diskLayout);
export const getStorageDevices = async () => {
  const devices = await diskLayout();
  const disks = devices.map(async ({ device }) => ({
    device,
    disks: await fsSize(device),
  }));

  return await Promise.all(disks);
};
