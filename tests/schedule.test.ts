import assert from "node:assert/strict";
import test from "node:test";

const scheduleModulePath = "../src/lib/" + "schedule";

test("rescheduling ignores the moving booking but blocks another teacher's occupied time", async () => {
  const schedule = await import(scheduleModulePath).catch(() => null);
  assert.ok(schedule, "schedule helper should exist");
  assert.equal(typeof schedule.getAvailableStartMinutes, "function");

  const starts = schedule.getAvailableStartMinutes({
    windows: [{ startMin: 540, endMin: 720 }],
    bookings: [
      { id: "moving-booking", startMin: 540, endMin: 600, status: "CONFIRMED" },
      { id: "other-teacher-booking", startMin: 600, endMin: 660, status: "PENDING" },
    ],
    durationMin: 60,
    stepMin: 30,
    excludeBookingId: "moving-booking",
  });

  assert.deepEqual(starts, [540, 660]);
});

test("cancelled lessons do not block available starts", async () => {
  const schedule = await import(scheduleModulePath).catch(() => null);
  assert.ok(schedule, "schedule helper should exist");

  const starts = schedule.getAvailableStartMinutes({
    windows: [{ startMin: 540, endMin: 660 }],
    bookings: [{ id: "cancelled-booking", startMin: 540, endMin: 600, status: "CANCELLED" }],
    durationMin: 60,
    stepMin: 30,
  });

  assert.deepEqual(starts, [540, 570, 600]);
});

test("lesson starts stay inside each teacher availability window", async () => {
  const schedule = await import(scheduleModulePath).catch(() => null);
  assert.ok(schedule, "schedule helper should exist");

  const starts = schedule.getAvailableStartMinutes({
    windows: [
      { startMin: 540, endMin: 600 },
      { startMin: 630, endMin: 720 },
    ],
    bookings: [],
    durationMin: 60,
    stepMin: 30,
  });

  assert.deepEqual(starts, [540, 630, 660]);
});
