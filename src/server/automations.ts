import { db } from "./models";
import type { AppEvent } from "./events";
import { subscribe } from "./events";
import { cuid } from "./store";

async function runAutomation(autoId: string, evt: AppEvent) {
  const a = await db.automations.get(autoId);
  if (!a || !a.active || a.organizationId !== evt.org) return;
  if (a.trigger.type !== evt.type) return;
  if (a.trigger.conditions?.toStage && evt.payload?.toStageId !== a.trigger.conditions.toStage)
    return;

  for (const step of a.steps) {
    try {
      if (step.type === "createTask") {
        const dueAt = step.params?.dueInHours
          ? new Date(Date.now() + step.params.dueInHours * 3600_000).toISOString()
          : null;
        await db.tasks.put({
          id: cuid(),
          organizationId: evt.org,
          title: String(step.params?.title ?? "Tarefa automática"),
          description: null,
          status: "todo",
          priority: step.params?.priority ?? "media",
          dueAt,
          completedAt: null,
          dealId: evt.payload?.dealId ?? null,
          contactId: evt.payload?.contactId ?? null,
          assigneeId: evt.payload?.ownerId ?? null,
        });
      } else if (step.type === "createActivity") {
        await db.activities.put({
          id: cuid(),
          organizationId: evt.org,
          type: step.params?.activityType ?? "system",
          title: String(step.params?.title ?? "Ação automática"),
          body: step.params?.body ?? null,
          meta: null,
          dealId: evt.payload?.dealId ?? null,
          contactId: evt.payload?.contactId ?? null,
          authorId: null,
          authorName: "Automação · " + a.name,
        });
      } else if (step.type === "notify" && evt.payload?.ownerId) {
        await db.notifications.put({
          id: cuid(),
          organizationId: evt.org,
          userId: evt.payload.ownerId,
          type: step.params?.tone ?? "info",
          title: String(step.params?.title ?? "Nova notificação"),
          body: step.params?.body ?? null,
          read: false,
          link: evt.payload?.dealId ? `/pipeline?deal=${evt.payload.dealId}` : null,
        });
      }
    } catch (e) {
      console.error("[automation] step failed", a.name, step.type, e);
    }
  }

  await db.automations.patch(a.id, {
    runs: (a.runs ?? 0) + 1,
    lastRunAt: new Date().toISOString(),
  });
}

let bootstrapped = false;
export function bootstrapAutomations() {
  if (bootstrapped) return;
  bootstrapped = true;
  subscribe(async (evt) => {
    if (evt.type === "sse.ping") return;
    const autos = await db.automations.filter(
      (a) => a.organizationId === evt.org && a.active && a.trigger.type === evt.type
    );
    for (const a of autos) runAutomation(a.id, evt);
  });
}
