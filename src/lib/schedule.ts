export interface ScheduleWindow {
  startMin: number;
  endMin: number;
}

export interface BusyScheduleRange {
  id: string;
  startMin: number;
  endMin: number;
  status: string;
}

/** Builds start times that fit availability and avoid every occupied room interval. */
export function getAvailableStartMinutes({
  windows,
  bookings,
  durationMin,
  stepMin = 30,
  nowMin,
  excludeBookingId,
}: {
  windows: ScheduleWindow[];
  bookings: BusyScheduleRange[];
  durationMin: number;
  stepMin?: number;
  nowMin?: number;
  excludeBookingId?: string;
}): number[] {
  if (!Number.isInteger(durationMin) || durationMin <= 0 || !Number.isInteger(stepMin) || stepMin <= 0) {
    return [];
  }

  const starts = new Set<number>();
  for (const window of windows) {
    for (let startMin = window.startMin; startMin + durationMin <= window.endMin; startMin += stepMin) {
      if (nowMin !== undefined && startMin <= nowMin) continue;

      const endMin = startMin + durationMin;
      const overlaps = bookings.some((booking) => {
        if (booking.status === "CANCELLED" || booking.id === excludeBookingId) return false;
        return startMin < booking.endMin && booking.startMin < endMin;
      });

      if (!overlaps) starts.add(startMin);
    }
  }

  return [...starts].sort((a, b) => a - b);
}
