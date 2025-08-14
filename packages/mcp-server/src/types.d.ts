// Type declarations for external modules

declare module 'jpglens/playwright' {
  export function analyzeUserJourney(page: any, options: any): Promise<any>;
  export function analyzeCompleteJourney(page: any, journey: any): Promise<any>;
}

declare module '@playwright/test' {
  export const chromium: {
    launch(options?: { headless?: boolean }): Promise<{
      newPage(): Promise<any>;
      close(): Promise<void>;
    }>;
  };
}
