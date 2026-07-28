import { buildImprovementReportEmail, submitImprovementReport } from './submit';
import type { ImprovementReportEmail, ImprovementReportReporter } from './submit';
import type { CreateImprovementReportData, IImprovementReport } from '@librechat/data-schemas';

const reporter: ImprovementReportReporter = {
  id: '6a38e4e49703a55b4169b8c7',
  email: 'marco@digitalautomations.it',
  name: 'Marco',
};

const recipient = 'support@digitalautomations.it';

const validBody = {
  description: 'Il selettore modelli è lento con molti agenti',
  priority: 'Alta',
  area: 'Chat',
};

/** In-memory stand-in for the Mongoose model: real behaviour, no database. */
function createStore() {
  const saved: CreateImprovementReportData[] = [];
  const emailSentIds: string[] = [];
  return {
    saved,
    emailSentIds,
    createImprovementReport: async (data: CreateImprovementReportData) => {
      saved.push(data);
      return { _id: 'report-1', ...data } as unknown as IImprovementReport;
    },
    markImprovementReportEmailSent: async (reportId: string) => {
      emailSentIds.push(reportId);
    },
  };
}

describe('buildImprovementReportEmail', () => {
  it('addresses the support inbox and carries the reporter in the payload', () => {
    const email = buildImprovementReportEmail({
      report: { description: 'Testo', priority: 'Media', area: 'Agenti' },
      reporter,
      recipient,
      appVersion: 'v0.8.7-simpleai.1',
    });

    expect(email.email).toBe(recipient);
    expect(email.subject).toBe('[Simple AI] Segnalazione - Agenti - Priorità Media');
    expect(email.payload.reporterEmail).toBe('marco@digitalautomations.it');
    expect(email.payload.reporterName).toBe('Marco');
    expect(email.payload.appVersion).toBe('v0.8.7-simpleai.1');
  });

  it('falls back to username then id when the name is missing', () => {
    const withUsername = buildImprovementReportEmail({
      report: { description: 'Testo', priority: 'Bassa', area: 'Altro' },
      reporter: { id: 'abc', username: 'mnucci' },
      recipient,
    });
    expect(withUsername.payload.reporterName).toBe('mnucci');

    const withId = buildImprovementReportEmail({
      report: { description: 'Testo', priority: 'Bassa', area: 'Altro' },
      reporter: { id: 'abc' },
      recipient,
    });
    expect(withId.payload.reporterName).toBe('abc');
    expect(withId.payload.reporterEmail).toBe('');
  });
});

describe('submitImprovementReport', () => {
  it('persists the report and reports the email as sent', async () => {
    const store = createStore();
    const sent: ImprovementReportEmail[] = [];

    const result = await submitImprovementReport({
      body: validBody,
      reporter,
      recipient,
      appVersion: 'v0.8.7-simpleai.1',
      ...store,
      sendEmail: async (params) => {
        sent.push(params);
        return {};
      },
    });

    expect(result).toEqual({ success: true, data: { reportId: 'report-1', emailSent: true } });
    expect(store.saved).toHaveLength(1);
    expect(store.saved[0]).toMatchObject({
      user: reporter.id,
      email: reporter.email,
      description: validBody.description,
      priority: 'Alta',
      area: 'Chat',
      appVersion: 'v0.8.7-simpleai.1',
    });
    expect(store.emailSentIds).toEqual(['report-1']);
    expect(sent).toHaveLength(1);
  });

  it('keeps the stored report when email delivery fails', async () => {
    const store = createStore();

    const result = await submitImprovementReport({
      body: validBody,
      reporter,
      recipient,
      ...store,
      sendEmail: async () => {
        throw new Error('SMTP unreachable');
      },
    });

    expect(result).toEqual({ success: true, data: { reportId: 'report-1', emailSent: false } });
    expect(store.saved).toHaveLength(1);
    expect(store.emailSentIds).toEqual([]);
  });

  it('rejects an empty description without saving or sending', async () => {
    const store = createStore();
    let sendCalls = 0;

    const result = await submitImprovementReport({
      body: { description: '   ', priority: 'Media', area: 'Chat' },
      reporter,
      recipient,
      ...store,
      sendEmail: async () => {
        sendCalls += 1;
        return {};
      },
    });

    expect(result.success).toBe(false);
    expect(store.saved).toHaveLength(0);
    expect(sendCalls).toBe(0);
  });

  it('rejects a priority outside the allowed list', async () => {
    const store = createStore();

    const result = await submitImprovementReport({
      body: { description: 'Testo valido', priority: 'Urgentissima', area: 'Chat' },
      reporter,
      recipient,
      ...store,
      sendEmail: async () => ({}),
    });

    expect(result.success).toBe(false);
    expect(store.saved).toHaveLength(0);
  });

  it('rejects a description over the length limit', async () => {
    const store = createStore();

    const result = await submitImprovementReport({
      body: { description: 'a'.repeat(5001), priority: 'Media', area: 'Chat' },
      reporter,
      recipient,
      ...store,
      sendEmail: async () => ({}),
    });

    expect(result.success).toBe(false);
    expect(store.saved).toHaveLength(0);
  });

  it('trims the description before persisting', async () => {
    const store = createStore();

    await submitImprovementReport({
      body: { description: '  spazi attorno  ', priority: 'Media', area: 'Chat' },
      reporter,
      recipient,
      ...store,
      sendEmail: async () => ({}),
    });

    expect(store.saved[0].description).toBe('spazi attorno');
  });
});
