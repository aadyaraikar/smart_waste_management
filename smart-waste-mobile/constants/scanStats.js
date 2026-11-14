let scanStats = {
  dailyScans: 1,
  totalPoints: 860,
  itemsDiverted: 3,
};

export function getScanStats() {
  return { ...scanStats };
}

export function recordScan(points = 250) {
  scanStats = {
    dailyScans: Math.min(scanStats.dailyScans + 1, 4),
    totalPoints: scanStats.totalPoints + points,
    itemsDiverted: scanStats.itemsDiverted + 1,
  };

  return getScanStats();
}
