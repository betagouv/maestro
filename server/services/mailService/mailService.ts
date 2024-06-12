export type TemplateId = string | number;

export interface SendOptions {
  recipients: string[];
  subject?: string;
  content?: string;
  templateId?: TemplateId;
  params?: any;
  attachment?: {
    content: string;
    name: string;
  }[];
}

export interface MailService {
  send(options: SendOptions): Promise<void>;
  sendAnalysisRequest(options: SendOptions): Promise<void>;
}
