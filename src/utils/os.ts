import { exec } from 'child_process';
import os from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const cpuCount = os.cpus().length;
export const sysUptime = os.uptime();
export const processUptime = process.uptime();
export const freeMem = os.freemem() / (1024 ** 2);
export const totalMem = os.totalmem() / (1024 ** 2);
export const freeMemPercentage = os.freemem() / os.totalmem();

/**
 * Get a breakdown of the free memory in the system.
 */
export const freeCommand = async (): Promise<Record<`used` | `cached`, number>> => {
    const { stdout } = await execAsync(`free -m`, { encoding: `utf-8` });

    const lines = stdout.split(`\n`);
    const strMemInfo = lines[1].replace(/[\s\n\r]+/g, ` `);
    const memInfo = strMemInfo.split(` `);

    const totalMem = parseInt(memInfo[1]);
    const freeMem = parseInt(memInfo[3]);
    const buffersMem = parseInt(memInfo[5]);
    const cachedMem = parseInt(memInfo[6]);

    const usedMem = totalMem - (freeMem + buffersMem + cachedMem);
    return {
        used: usedMem,
        cached: cachedMem
    };
};

export const harddrive = async (): Promise<Record<`total` | `used` | `free`, number>> => {
    const { stdout } = await execAsync(`df -k`, { encoding: `utf-8` });

    let total = 0;
    let used = 0;
    let free = 0;

    const lines = stdout.split(`\n`);
    const strDiskInfo = lines[1].replace(/[\s\n\r]+/g, ` `);
    const diskInfo = strDiskInfo.split(` `).map(x => Number(x));

    total = Math.ceil((diskInfo[1] * 1024) / Math.pow(1024, 2));
    used = Math.ceil(diskInfo[2] * 1024 / Math.pow(1024, 2));
    free = Math.ceil(diskInfo[3] * 1024 / Math.pow(1024, 2));

    return {
        total,
        free,
        used
    };
};

export const getProcesses = async (): Promise<string> => {
    const { stdout } = await execAsync(`ps -eo pcpu,pmem,time,args | sort -k 1 -r | head -n10`, { encoding: `utf-8` });

    const lines = stdout.split(`\n`);

    lines.shift();
    lines.pop();

    let result = ``;
    lines.forEach((_item, _i) => {
        const str = _item.replace(/[\s\n\r]+/g, ` `).split(` `);
        // result += _str[10]+" "+_str[9]+" "+_str[2]+" "+_str[3]+"\n";  // process
        result += `${str[1]} ${str[2]} ${str[3]} ${str[4].substring((str[4].length - 25))}\n`; // process
    });

    return result;
};

/**
 * Returns the load average usage for 1, 5, and 15 minutes.
 * @returns [1 minute, 5 minutes, 15 minutes]
 */
export const allLoadAvg = (): string[] => {
    const loads = os.loadavg();
    return [
        loads[0].toFixed(4),
        loads[1].toFixed(4),
        loads[2].toFixed(4)
    ];
};

/**
 * Returns the load average usage for 1, 5, or 15 minutes.
 */
export const loadAvg = (time: number): number => {
    if (time === undefined || (time !== 5 && time !== 15)) time = 1;

    const loads = os.loadavg();
    let v = 0;

    if (time === 1) v = loads[0];
    else if (time === 5) v = loads[1];
    else if (time === 15) v = loads[2];

    return v;
};

export const cpuFree = async (): ReturnType<typeof getCPUUsage> => await getCPUUsage(true);
export const cpuUsage = async (): ReturnType<typeof getCPUUsage> => await getCPUUsage(false);

export const getCPUUsage = async (free: boolean): Promise<number> => {
    const stats1 = getCPUInfo();
    const startIdle = stats1.idle;
    const startTotal = stats1.total;

    await Bun.sleep(1e3);

    const stats2 = getCPUInfo();
    const endIdle = stats2.idle;
    const endTotal = stats2.total;

    const idle = endIdle - startIdle;
    const total = endTotal - startTotal;
    const perc = idle / total;

    return free
        ? perc
        : 1 - perc;
};

export const getCPUInfo = (): Record<`idle` | `total`, number> => {
    const cpus = os.cpus();

    let user = 0;
    let nice = 0;
    let sys = 0;
    let idle = 0;
    let irq = 0;

    cpus.forEach(cpu => {
        user += cpu.times.user;
        nice += cpu.times.nice;
        sys += cpu.times.sys;
        irq += cpu.times.irq;
        idle += cpu.times.idle;
    });

    const total = user + nice + sys + idle + irq;
    return {
        idle: idle,
        total: total
    };
};
