import { queueEntries, type QueueEntry, type InsertQueueEntry } from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, sql, count } from "drizzle-orm";

export interface IStorage {
  // Queue management
  addToQueue(entry: InsertQueueEntry, ipAddress: string): Promise<QueueEntry>;
  getActiveEntry(): Promise<QueueEntry | undefined>;
  getQueueByPosition(): Promise<QueueEntry[]>;
  getQueueStats(): Promise<{
    total: number;
    active: number;
    waiting: number;
    completed: number;
  }>;
  getEntryByIp(ipAddress: string): Promise<QueueEntry | undefined>;
  markCompleted(id: string): Promise<boolean>;
  activateNextEntry(): Promise<QueueEntry | undefined>;
  updateEntryExpiration(id: string, expiresAt: Date): Promise<boolean>;
  getExpiredEntries(): Promise<QueueEntry[]>;
  removeExpiredEntry(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async addToQueue(entry: InsertQueueEntry, ipAddress: string): Promise<QueueEntry> {
    // Check if IP already has an entry
    const existingEntry = await this.getEntryByIp(ipAddress);
    if (existingEntry && !existingEntry.isCompleted) {
      throw new Error("Ya tienes un código en la cola. Solo se permite un código por IP.");
    }

    // Get next position
    const [{ maxPosition }] = await db
      .select({ maxPosition: sql<number>`COALESCE(MAX(${queueEntries.position}), 0)` })
      .from(queueEntries)
      .where(eq(queueEntries.isCompleted, false));

    const nextPosition = (maxPosition || 0) + 1;

    // Check if this should be the first active entry
    const activeEntry = await this.getActiveEntry();
    const shouldBeActive = !activeEntry;

    const now = new Date();
    const expiresAt = shouldBeActive ? new Date(now.getTime() + 20 * 60 * 1000) : null;

    const [newEntry] = await db
      .insert(queueEntries)
      .values({
        ...entry,
        ipAddress,
        position: nextPosition,
        isActive: shouldBeActive,
        startedAt: shouldBeActive ? now : null,
        expiresAt,
      })
      .returning();

    return newEntry;
  }

  async getActiveEntry(): Promise<QueueEntry | undefined> {
    const [entry] = await db
      .select()
      .from(queueEntries)
      .where(and(eq(queueEntries.isActive, true), eq(queueEntries.isCompleted, false)))
      .limit(1);

    return entry || undefined;
  }

  async getQueueByPosition(): Promise<QueueEntry[]> {
    return await db
      .select()
      .from(queueEntries)
      .where(eq(queueEntries.isCompleted, false))
      .orderBy(asc(queueEntries.position));
  }

  async getQueueStats(): Promise<{
    total: number;
    active: number;
    waiting: number;
    completed: number;
  }> {
    const [stats] = await db
      .select({
        total: count(),
        active: sql<number>`SUM(CASE WHEN ${queueEntries.isActive} = true AND ${queueEntries.isCompleted} = false THEN 1 ELSE 0 END)`,
        waiting: sql<number>`SUM(CASE WHEN ${queueEntries.isActive} = false AND ${queueEntries.isCompleted} = false THEN 1 ELSE 0 END)`,
        completed: sql<number>`SUM(CASE WHEN ${queueEntries.isCompleted} = true THEN 1 ELSE 0 END)`,
      })
      .from(queueEntries);

    return {
      total: Number(stats.total),
      active: Number(stats.active),
      waiting: Number(stats.waiting),
      completed: Number(stats.completed),
    };
  }

  async getEntryByIp(ipAddress: string): Promise<QueueEntry | undefined> {
    const [entry] = await db
      .select()
      .from(queueEntries)
      .where(and(eq(queueEntries.ipAddress, ipAddress), eq(queueEntries.isCompleted, false)))
      .limit(1);

    return entry || undefined;
  }

  async markCompleted(id: string): Promise<boolean> {
    const [updated] = await db
      .update(queueEntries)
      .set({ isCompleted: true, isActive: false })
      .where(eq(queueEntries.id, id))
      .returning();

    if (updated) {
      // Activate next entry
      await this.activateNextEntry();
      return true;
    }
    return false;
  }

  async activateNextEntry(): Promise<QueueEntry | undefined> {
    const nextEntry = await db
      .select()
      .from(queueEntries)
      .where(and(eq(queueEntries.isActive, false), eq(queueEntries.isCompleted, false)))
      .orderBy(asc(queueEntries.position))
      .limit(1);

    if (nextEntry.length === 0) return undefined;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 20 * 60 * 1000);

    const [activated] = await db
      .update(queueEntries)
      .set({
        isActive: true,
        startedAt: now,
        expiresAt,
      })
      .where(eq(queueEntries.id, nextEntry[0].id))
      .returning();

    return activated;
  }

  async updateEntryExpiration(id: string, expiresAt: Date): Promise<boolean> {
    const [updated] = await db
      .update(queueEntries)
      .set({ expiresAt })
      .where(eq(queueEntries.id, id))
      .returning();

    return !!updated;
  }

  async getExpiredEntries(): Promise<QueueEntry[]> {
    const now = new Date();
    return await db
      .select()
      .from(queueEntries)
      .where(
        and(
          eq(queueEntries.isActive, true),
          eq(queueEntries.isCompleted, false),
          sql`${queueEntries.expiresAt} < ${now}`
        )
      );
  }

  async removeExpiredEntry(id: string): Promise<boolean> {
    const [updated] = await db
      .update(queueEntries)
      .set({ isActive: false })
      .where(eq(queueEntries.id, id))
      .returning();

    return !!updated;
  }
}

export const storage = new DatabaseStorage();
