import { JobRunner, type JobName } from "./runner";

export interface ScheduledTask {
  name: JobName;
  intervalMs: number;
  lastRun?: number;
}

const SCHEDULES: ScheduledTask[] = [
  { name: "reservation_expiry", intervalMs: 60 * 1000 }, // every minute
  { name: "notification_dispatch", intervalMs: 60 * 1000 }, // every minute
  { name: "alert_digest", intervalMs: 60 * 60 * 1000 }, // hourly
  { name: "bank_transfer_expiry", intervalMs: 60 * 60 * 1000 }, // hourly
  { name: "batch_expiry_check", intervalMs: 24 * 60 * 60 * 1000 }, // nightly
  { name: "retention_cleanup", intervalMs: 24 * 60 * 60 * 1000 }, // nightly
];

export class BackgroundWorker {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private schedules: ScheduledTask[] = [...SCHEDULES];

  /**
   * Starts the background job polling loop.
   */
  start(tickIntervalMs = 15000): void {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timer = setInterval(async () => {
      await this.tick();
    }, tickIntervalMs);

    // Initial tick on start
    void this.tick();
  }

  /**
   * Evaluates each scheduled task against its execution interval.
   */
  async tick(): Promise<void> {
    const now = Date.now();
    for (const task of this.schedules) {
      if (!task.lastRun || now - task.lastRun >= task.intervalMs) {
        task.lastRun = now;
        try {
          await JobRunner.runJob(task.name);
        } catch (err) {
          console.error(
            `Unhandled error running background job ${task.name}:`,
            err,
          );
        }
      }
    }
  }

  /**
   * Gracefully shuts down the background worker.
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }
}
