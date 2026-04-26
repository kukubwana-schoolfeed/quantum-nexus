import * as db from '@/lib/db';
import type { ApiResponse } from '@/lib/api/types';
import type { DailyBlogScheduleDTO, QaTaskDTO, DirectorySubmissionDTO } from '@/lib/api/schema';

/** @module seo-domination-engine @description SEO domination schedule and directory submission routes for tenant businesses */

/**
 * Retrieves the daily blog posting schedule for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @returns Promise resolving to the daily blog schedule
 */
export async function getDailyBlogSchedule(tenantId: string): Promise<ApiResponse<DailyBlogScheduleDTO>> {
  const tasks = await db.seoQueries.listSeoTasks(tenantId, {
    task_type: 'blog_post',
    task_date: new Date().toISOString().split('T')[0],
  });

  const schedule: DailyBlogScheduleDTO = {
    posts: tasks.map(t => ({
      time: '09:00',
      keyword: t.target_keyword ?? '',
      postId: t.content_post_id,
    })),
  };

  return { success: true, data: schedule };
}

/**
 * Retrieves pending Q&A seeding tasks for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @param params - Optional filter and pagination parameters
 * @returns Promise resolving to the Q&A tasks
 */
export async function getQaTasks(tenantId: string, params?: Record<string, unknown>): Promise<ApiResponse<QaTaskDTO[]>> {
  const result = await db.seoQueries.listQaTasks(tenantId, params);
  return { success: true, data: result };
}

/**
 * Confirms that a Q&A question has been posted for a given task.
 * @param tenantId - The unique identifier of the tenant
 * @param taskId - The unique identifier of the Q&A task
 * @returns Promise resolving to the confirmation result with success and status
 */
export async function confirmQuestionPosted(tenantId: string, taskId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
  await db.seoQueries.updateSeoTask(tenantId, taskId, {
    question_posted_at: new Date().toISOString(),
  });
  return { success: true, data: { success: true, message: 'Question posted confirmed' } };
}

/**
 * Submits a directory listing for a tenant.
 * @param tenantId - The unique identifier of the tenant
 * @param data - The directory submission payload
 * @returns Promise resolving to the directory submission result
 */
export async function submitDirectory(tenantId: string, data: Record<string, unknown>): Promise<ApiResponse<DirectorySubmissionDTO>> {
  await db.seoQueries.createSeoTask(tenantId, {
    task_type: 'directory_submission',
    task_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    ...data,
  } as Partial<db.SeoTaskRow>);

  return {
    success: true,
    data: {
      id: '',
      directoryName: '',
      status: 'pending',
      listingUrl: null,
    },
  };
}
