export type SectionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SectionDefinition {
  sectionId: string;
  displayName: string;
  priority: number;
  icon: string;
  tabGroup: string;
}
