import { internalError } from '@/server/shared/errors';
import type { ApiResponse } from '@/lib/api/types';
import type { BubbleMessageDTO, BubbleConversationDTO, InspirationUploadDTO, InspirationAnalysisDTO } from '@/lib/api/schema';

/** @module ai-bubble-assistant @description AI Bubble Assistant route handlers for conversational AI interactions, inspiration uploads, and content analysis within the shared modules */

/**
 * Sends a message to the AI bubble assistant and returns the AI-generated response.
 * Optionally continues an existing conversation when a conversationId is provided.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param message - The user message to send to the AI assistant
 * @param conversationId - Optional conversation ID to continue an existing thread
 * @returns Promise resolving to the AI response and conversation metadata
 */
export async function sendMessage(
  tenantId: string,
  message: string,
  conversationId?: string,
): Promise<ApiResponse<BubbleMessageDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Retrieves the full conversation history for a given conversation ID.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param conversationId - The conversation ID to retrieve
 * @returns Promise resolving to the conversation messages and metadata
 */
export async function getConversation(
  tenantId: string,
  conversationId: string,
): Promise<ApiResponse<BubbleConversationDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Uploads an inspiration file (image, PDF, video) for AI analysis.
 * The file is queued for processing and an analysis status is returned.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param data - The inspiration upload payload including file metadata and type
 * @returns Promise resolving to the upload confirmation and analysis status
 */
export async function uploadInspiration(
  tenantId: string,
  data: Record<string, unknown>,
): Promise<ApiResponse<InspirationUploadDTO>> {
  throw internalError('INTEGRATION_PENDING');
}

/**
 * Retrieves the AI analysis results for a previously uploaded inspiration file.
 * @param tenantId - The tenant identifier for multi-tenancy isolation
 * @param fileId - The file ID returned from a previous upload
 * @returns Promise resolving to the analysis status and results
 */
export async function getAnalysis(
  tenantId: string,
  fileId: string,
): Promise<ApiResponse<InspirationAnalysisDTO>> {
  throw internalError('INTEGRATION_PENDING');
}
