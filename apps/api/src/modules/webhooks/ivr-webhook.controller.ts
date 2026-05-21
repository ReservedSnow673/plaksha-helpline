import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  Inject,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { IVR_PROVIDER, type IvrProvider } from '../../adapters/ivr/ivr.provider';
import {
  buildBridgeInstructions,
  buildDepartmentInstructions,
  buildGoodbyeInstructions,
  buildWelcomeInstructions,
  DTMF_DEPARTMENT,
  DTMF_LANGUAGE,
} from '../../adapters/ivr/ivr-tree';
import { Public } from '../../common/decorators/public.decorator';
import { CallsService } from '../calls/calls.service';
import { IncidentsService } from '../incidents/incidents.service';

@Controller('webhooks/ivr')
export class IvrWebhookController {
  private readonly logger = new Logger(IvrWebhookController.name);

  constructor(
    @Inject(IVR_PROVIDER) private readonly ivr: IvrProvider,
    private readonly calls: CallsService,
    private readonly incidents: IncidentsService,
  ) {}

  @Public()
  @Post('voice/incoming')
  async incoming(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>,
    @Body() body: Record<string, unknown>,
  ) {
    this.verify(req, headers, body);
    const event = this.ivr.parseWebhook(headers, body);
    await this.calls.upsert({
      provider: this.ivr.identifier === 'mock' ? 'MOCK' : this.ivr.identifier === 'twilio' ? 'TWILIO' : 'EXOTEL',
      providerCallSid: event.callSid,
      direction: 'INBOUND',
      fromE164: event.fromE164,
      toE164: event.toE164,
    });
    const { contentType, body: response } = this.ivr.buildResponse(buildWelcomeInstructions());
    res.setHeader('Content-Type', contentType);
    res.send(response);
  }

  @Public()
  @Post('voice/language')
  async language(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>,
    @Body() body: Record<string, unknown>,
  ) {
    this.verify(req, headers, body);
    const event = this.ivr.parseWebhook(headers, body);
    const lang = event.digits ? DTMF_LANGUAGE[event.digits] : undefined;
    if (!lang) {
      const { contentType, body: response } = this.ivr.buildResponse(buildWelcomeInstructions());
      res.setHeader('Content-Type', contentType);
      return res.send(response);
    }
    await this.calls.appendIvrStep(event.callSid, `lang:${lang}`);
    const { contentType, body: response } = this.ivr.buildResponse(buildDepartmentInstructions(lang));
    res.setHeader('Content-Type', contentType);
    return res.send(response);
  }

  @Public()
  @Post('voice/department')
  async department(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>,
    @Body() body: Record<string, unknown>,
  ) {
    this.verify(req, headers, body);
    const event = this.ivr.parseWebhook(headers, body);
    const code = event.digits ? DTMF_DEPARTMENT[event.digits] : undefined;
    if (!code) {
      const { contentType, body: response } = this.ivr.buildResponse(buildWelcomeInstructions());
      res.setHeader('Content-Type', contentType);
      return res.send(response);
    }
    await this.calls.appendIvrStep(event.callSid, `dept:${code}`);

    const incident = await this.incidents.create(
      {
        category: code as never,
        channel: 'IVR',
        language: 'en',
        anonymous: false,
      },
      null,
      null,
    );

    await this.calls.updateStatus(event.callSid, 'IN_PROGRESS', { incidentId: incident.id });

    const { contentType, body: response } = this.ivr.buildResponse(
      buildBridgeInstructions('en', []),
    );
    res.setHeader('Content-Type', contentType);
    return res.send(response);
  }

  @Public()
  @Post('voice/status')
  async status(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>,
    @Body() body: Record<string, unknown>,
  ) {
    this.verify(req, headers, body);
    const event = this.ivr.parseWebhook(headers, body);
    if (event.type === 'call.completed') {
      await this.calls.updateStatus(event.callSid, 'COMPLETED', {
        endedAt: new Date(),
        durationSeconds: event.recordingDurationSeconds ?? null,
      });
    }
    res.status(204).send();
  }

  @Public()
  @Post('voice/recording')
  async recording(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>,
    @Body() body: Record<string, unknown>,
  ) {
    this.verify(req, headers, body);
    const event = this.ivr.parseWebhook(headers, body);
    if (event.recordingUrl) {
      await this.calls.updateStatus(event.callSid, 'COMPLETED', { recordingUrl: event.recordingUrl });
    }
    const { contentType, body: response } = this.ivr.buildResponse(buildGoodbyeInstructions('en'));
    res.setHeader('Content-Type', contentType);
    res.send(response);
  }

  private verify(req: Request, headers: Record<string, string>, body: Record<string, unknown>): void {
    if (this.ivr.identifier === 'mock') return;
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    if (!this.ivr.verifySignature(url, headers, body)) {
      this.logger.warn(`IVR webhook signature failed url=${url}`);
      throw new ForbiddenException('Invalid webhook signature');
    }
  }
}
