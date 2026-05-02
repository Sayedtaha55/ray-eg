import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AiActionStatus, AiActionRisk, Prisma } from '@prisma/client';

export interface AuditActionParams {
  shopId: string;
  userId?: string;
  conversationId?: string;
  action: string;
  toolName?: string;
  params?: Record<string, any>;
  beforeState?: Record<string, any>;
  riskLevel?: AiActionRisk;
}

export interface RiskAssessment {
  level: AiActionRisk;
  requiresApproval: boolean;
  reason: string;
}

@Injectable()
export class AiAuditService {
  private readonly logger = new Logger(AiAuditService.name);

  // Risk levels for different actions
  private readonly RISK_MATRIX: Record<string, AiActionRisk> = {
    // Design changes - Low risk
    changeThemeColor: AiActionRisk.LOW,
    addSection: AiActionRisk.LOW,
    removeSection: AiActionRisk.LOW,
    reorderSections: AiActionRisk.LOW,
    changeSectionLayout: AiActionRisk.LOW,
    updateSectionContent: AiActionRisk.LOW,
    applyDesignPreset: AiActionRisk.LOW,
    suggestDesign: AiActionRisk.LOW,
    getShopStatus: AiActionRisk.LOW,
    generateContent: AiActionRisk.LOW,
    
    // Commerce changes - Medium risk (affect business)
    toggleModule: AiActionRisk.MEDIUM,
    updateShopInfo: AiActionRisk.MEDIUM,
    
    // Critical actions - High/Critical risk
    addProduct: AiActionRisk.HIGH,
    updateProduct: AiActionRisk.HIGH,
    createPromotion: AiActionRisk.HIGH,
    deleteProduct: AiActionRisk.CRITICAL,
    updatePricing: AiActionRisk.CRITICAL,
    processRefund: AiActionRisk.CRITICAL,
    cancelOrder: AiActionRisk.HIGH,
    updateInventory: AiActionRisk.HIGH,
  };

  // Tools that require explicit approval before execution
  private readonly REQUIRES_APPROVAL = new Set([
    'deleteProduct',
    'updatePricing',
    'processRefund',
    'cancelOrder',
    'updateInventory',
  ]);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Assess the risk level of a tool execution
   */
  assessRisk(toolName: string, params: Record<string, any>): RiskAssessment {
    const level = this.RISK_MATRIX[toolName] || AiActionRisk.LOW;
    const requiresApproval = this.REQUIRES_APPROVAL.has(toolName);
    
    let reason = 'Standard operation';
    if (level === AiActionRisk.CRITICAL) {
      reason = 'Destructive or financial impact';
    } else if (level === AiActionRisk.HIGH) {
      reason = 'Affects business data or customer experience';
    } else if (level === AiActionRisk.MEDIUM) {
      reason = 'Moderate visibility impact';
    }

    return { level, requiresApproval, reason };
  }

  /**
   * Log the start of an AI action
   */
  async logActionStart(params: AuditActionParams): Promise<string> {
    const risk: RiskAssessment = params.riskLevel
      ? { level: params.riskLevel, requiresApproval: this.REQUIRES_APPROVAL.has(params.toolName || ''), reason: 'Risk level provided by caller' }
      : this.assessRisk(params.toolName || '', params.params || {});
    
    const log = await this.prisma.aiAuditLog.create({
      data: {
        shopId: params.shopId,
        userId: params.userId,
        conversationId: params.conversationId,
        action: params.action,
        toolName: params.toolName,
        params: params.params as Prisma.JsonObject,
        beforeState: params.beforeState as Prisma.JsonObject,
        status: AiActionStatus.PENDING,
        riskLevel: risk.level,
        requiresApproval: risk.requiresApproval,
      },
    });

    this.logger.debug(`AI action logged: ${params.action} (${log.id})`);
    return log.id;
  }

  /**
   * Mark an action as requiring approval
   */
  async requestApproval(logId: string): Promise<void> {
    await this.prisma.aiAuditLog.update({
      where: { id: logId },
      data: {
        status: AiActionStatus.PENDING,
        requiresApproval: true,
      },
    });
  }

  /**
   * Approve an action for execution
   */
  async approveAction(logId: string, approvedBy: string): Promise<void> {
    await this.prisma.aiAuditLog.update({
      where: { id: logId },
      data: {
        approvedBy,
        approvedAt: new Date(),
        status: AiActionStatus.APPROVED,
      },
    });

    this.logger.log(`AI action approved: ${logId} by ${approvedBy}`);
  }

  /**
   * Reject an action
   */
  async rejectAction(logId: string, reason?: string): Promise<void> {
    await this.prisma.aiAuditLog.update({
      where: { id: logId },
      data: {
        status: AiActionStatus.REJECTED,
        errorMessage: reason || 'Rejected by user',
      },
    });
  }

  /**
   * Mark an action as executed successfully
   */
  async logActionSuccess(
    logId: string,
    afterState?: Record<string, any>,
    executionTimeMs?: number,
    costTokens?: number,
    costUsd?: number,
  ): Promise<void> {
    await this.prisma.aiAuditLog.update({
      where: { id: logId },
      data: {
        status: AiActionStatus.EXECUTED,
        afterState: afterState as Prisma.JsonObject,
        executionTimeMs,
        costTokens,
        costUsd,
      },
    });
  }

  /**
   * Log an action failure
   */
  async logActionFailure(
    logId: string,
    errorMessage: string,
    rollbackData?: Record<string, any>,
  ): Promise<void> {
    await this.prisma.aiAuditLog.update({
      where: { id: logId },
      data: {
        status: AiActionStatus.FAILED,
        errorMessage,
        rollbackData: rollbackData as Prisma.JsonObject,
      },
    });

    this.logger.error(`AI action failed: ${logId} - ${errorMessage}`);
  }

  /**
   * Get audit trail for a shop
   */
  async getAuditTrail(
    shopId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: AiActionStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const { limit = 50, offset = 0, status, startDate, endDate } = options || {};

    const where: Prisma.AiAuditLogWhereInput = { shopId };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.aiAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.aiAuditLog.count({ where }),
    ]);

    return { logs, total, limit, offset };
  }

  /**
   * Get pending approvals for a shop
   */
  async getPendingApprovals(shopId: string) {
    return this.prisma.aiAuditLog.findMany({
      where: {
        shopId,
        status: AiActionStatus.PENDING,
        requiresApproval: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Get cost analytics for a shop
   */
  async getCostAnalytics(shopId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.aiAuditLog.findMany({
      where: {
        shopId,
        createdAt: { gte: startDate },
        status: AiActionStatus.EXECUTED,
      },
      select: {
        costTokens: true,
        costUsd: true,
        createdAt: true,
        toolName: true,
      },
    });

    const totalTokens = logs.reduce((sum, log) => sum + (log.costTokens || 0), 0);
    const totalCost = logs.reduce((sum, log) => sum + (log.costUsd || 0), 0);

    // Group by tool
    const byTool = logs.reduce((acc, log) => {
      const tool = log.toolName || 'chat';
      if (!acc[tool]) acc[tool] = { count: 0, tokens: 0, cost: 0 };
      acc[tool].count++;
      acc[tool].tokens += log.costTokens || 0;
      acc[tool].cost += log.costUsd || 0;
      return acc;
    }, {} as Record<string, { count: number; tokens: number; cost: number }>);

    return {
      period: days,
      totalCalls: logs.length,
      totalTokens,
      totalCost,
      byTool,
    };
  }

  /**
   * Rollback an action (if supported)
   */
  async rollbackAction(logId: string): Promise<boolean> {
    const log = await this.prisma.aiAuditLog.findUnique({
      where: { id: logId },
    });

    if (!log || !log.beforeState) {
      return false;
    }

    // Update status to rolled back
    await this.prisma.aiAuditLog.update({
      where: { id: logId },
      data: { status: AiActionStatus.ROLLED_BACK },
    });

    this.logger.log(`AI action rolled back: ${logId}`);
    return true;
  }
}
