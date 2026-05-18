import { prisma } from "./db";
import type { AppEvent } from "./events";
import { subscribe } from "./events";

// Engine de automações simples: escuta eventos e executa steps configurados.
// Triggers suportados:
//   - deal.moved → quando deal muda de stage
//   - deal.created
//   - task.completed
//   - contact.created
// Steps:
//   - createTask({ title, dueInHours })
//   - createActivity({ type, title, body })
//   - notify({ title, body, type })

interface Trigger { type: string; conditions?: Record<string, any>; }
interface Step { type: string; params?: Record<string, any>; }

async function runAutomation(autoId: string, evt: AppEvent) {
  const a = await prisma.automation.findUnique({ where: { id: autoId } });
  if (!a || !a.active || a.organizationId !== evt.org) return;
  const trigger: Trigger = JSON.parse(a.trigger);
  if (trigger.type !== evt.type) return;

  // Match conditions (simple: stage equality)
  if (trigger.conditions?.toStage && evt.payload?.toStageId !== trigger.conditions.toStage) return;

  const steps: Step[] = JSON.parse(a.steps);
  for (const step of steps) {
    try {
      if (step.type === "createTask") {
        const dueAt = step.params?.dueInHours
          ? new Date(Date.now() + step.params.dueInHours * 3600_000)
          : null;
        await prisma.task.create({
          data: {
            organizationId: evt.org,
            title: String(step.params?.title ?? "Tarefa automática"),
            priority: step.params?.priority ?? "media",
            dueAt,
            dealId: evt.payload?.dealId ?? null,
            contactId: evt.payload?.contactId ?? null,
            assigneeId: evt.payload?.ownerId ?? null,
          },
        });
      } else if (step.type === "createActivity") {
        await prisma.activity.create({
          data: {
            organizationId: evt.org,
            type: step.params?.activityType ?? "system",
            title: String(step.params?.title ?? "Ação automática"),
            body: step.params?.body ?? null,
            dealId: evt.payload?.dealId ?? null,
            contactId: evt.payload?.contactId ?? null,
            authorName: "Automação · " + a.name,
          },
        });
      } else if (step.type === "notify" && evt.payload?.ownerId) {
        await prisma.notification.create({
          data: {
            organizationId: evt.org,
            userId: evt.payload.ownerId,
            type: step.params?.tone ?? "info",
            title: String(step.params?.title ?? "Nova notificação"),
            body: step.params?.body ?? null,
            link: evt.payload?.dealId ? `/pipeline?deal=${evt.payload.dealId}` : null,
          },
        });
      }
    } catch (e) {
      console.error("[automation] step failed", a.name, step.type, e);
    }
  }

  await prisma.automation.update({
    where: { id: a.id },
    data: { runs: { increment: 1 }, lastRunAt: new Date() },
  });
}

let bootstrapped = false;
export function bootstrapAutomations() {
  if (bootstrapped) return;
  bootstrapped = true;
  subscribe(async (evt) => {
    if (evt.type.startsWith("audit") || evt.type === "sse.ping") return;
    const autos = await prisma.automation.findMany({
      where: { organizationId: evt.org, active: true },
    });
    for (const a of autos) {
      try {
        const t: Trigger = JSON.parse(a.trigger);
        if (t.type === evt.type) runAutomation(a.id, evt);
      } catch {}
    }
  });
}
