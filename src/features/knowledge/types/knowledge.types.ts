export type NuggetCategory = 'til' | 'best_practice' | 'gotcha' | 'quick_tip' | 'command_ref' | 'troubleshooting';
export type ComplexityLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface KnowledgeNugget {
  id: number;
  title: string;
  category: NuggetCategory;
  content: string;
  code_example?: string;
  expected_result?: string;
  technology: string;
  complexity_level: ComplexityLevel;
  external_references?: string[]; // Parsed JSON
  incident_id?: number;
  applicable_to?: string[]; // Parsed JSON
  usage_count: number;
  helpful_count: number;
  rating_sum: number;
  rating_count: number;
  is_verified: boolean;
  verified_by?: number;
  verified_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  User?: {
    id: number;
    full_name: string;
  };
  Tags?: {
    id: number;
    name: string;
  }[];
}

export interface CreateNuggetDTO {
  title: string;
  category: NuggetCategory;
  content: string;
  code_example?: string;
  expected_result?: string;
  technology: string;
  complexity_level: ComplexityLevel;
  external_references?: string[];
  incident_id?: number;
  applicable_to?: string[];
  tags?: string[];
}

export interface UpdateNuggetDTO extends Partial<CreateNuggetDTO> {}

export interface NuggetFilters {
  search?: string;
  category?: NuggetCategory;
  technology?: string;
  complexity_level?: ComplexityLevel;
}

// Knowledge Topics
export type KnowledgeTopicStatus = 'to_learn' | 'in_progress' | 'mastered';

export interface KnowledgeTopic {
  id: number;
  title: string;
  description: string;
  status: KnowledgeTopicStatus;
  tags?: string[]; // Parsed JSON
  created_by: number;
  created_at: string;
  updated_at: string;
  User?: {
    id: number;
    full_name: string;
  };
}

export interface CreateTopicDto {
  title: string;
  description: string;
  status: KnowledgeTopicStatus;
  tags?: string[];
}

export interface UpdateTopicDto extends Partial<CreateTopicDto> {}

// Knowledge Resources
export type KnowledgeResourceType = 'documentation' | 'video' | 'course' | 'article' | 'other';

export interface KnowledgeResource {
  id: number;
  topic_id: number;
  title: string;
  type: KnowledgeResourceType;
  url?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateResourceDto {
  topic_id: number;
  title: string;
  type: KnowledgeResourceType;
  url?: string;
}

export interface UpdateResourceDto extends Partial<Omit<CreateResourceDto, 'topic_id'>> {
  is_completed?: boolean;
}
