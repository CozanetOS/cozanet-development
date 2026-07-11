import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project } from '../types';
import pino from 'pino';

const logger = pino({ name: 'project-manager' });

export class ProjectManager {
  static readonly ENGINE_ID = 'dev:projects';
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'placeholder-key';

    logger.info({ supabaseUrl }, 'Initializing Supabase Client for Projects Management');
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Creates a new metadata project entry in Supabase
   */
  async createProject(name: string, description?: string, repoUrl?: string): Promise<Project> {
    logger.info({ name, repoUrl }, 'Creating project metadata record');

    const { data, error } = await this.supabase
      .from('projects')
      .insert([
        {
          name,
          description,
          repo_url: repoUrl,
          status: 'active',
          notes: []
        }
      ])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create project in Supabase database', error);
      // Fallback in-memory mock if supabase credentials are not present or fail
      return {
        id: Math.random().toString(36).substr(2, 9),
        name,
        description,
        repo_url: repoUrl,
        status: 'active',
        notes: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    return data as Project;
  }

  /**
   * Retrieves metadata of project by UUID/ID
   */
  async getProject(id: string): Promise<Project | null> {
    logger.info({ id }, 'Retrieving project metadata record');

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error({ id }, 'Failed to retrieve project from Supabase database');
      return null;
    }

    return data as Project;
  }

  /**
   * Retrieves all projects
   */
  async listProjects(): Promise<Project[]> {
    logger.info('Listing all projects');

    const { data, error } = await this.supabase
      .from('projects')
      .select('*');

    if (error) {
      logger.error('Failed to query list of projects from Supabase database');
      return [];
    }

    return data as Project[];
  }

  /**
   * Updates state status of a project
   */
  async updateProjectStatus(id: string, status: string): Promise<void> {
    logger.info({ id, status }, 'Updating project status');

    const { error } = await this.supabase
      .from('projects')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      logger.error({ id }, 'Failed to update project status in Supabase');
    }
  }

  /**
   * Adds custom log notes / annotations to project
   */
  async addNote(id: string, note: string): Promise<void> {
    logger.info({ id }, 'Appending design/development note to project');

    // Retrieve active notes first
    const project = await this.getProject(id);
    const existingNotes = project?.notes || [];
    const updatedNotes = [...existingNotes, note];

    const { error } = await this.supabase
      .from('projects')
      .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      logger.error({ id }, 'Failed to add developer note in Supabase');
    }
  }
}
