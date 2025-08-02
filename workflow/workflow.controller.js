const workflowService = require('./workflow.service');
const workflowValidation = require('./workflow.validation');

class WorkflowController {
    constructor() {}

    async createWorkflow(req, res) {
        try {
            // Validate request body
            const { error, value } = await workflowValidation.createWorkflow(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const workflow = await workflowService.createWorkflow(value, userId, organizationId);

            return res.status(201).json({
                success: true,
                message: 'Workflow created successfully',
                data: {
                    _id: workflow._id,
                    title: workflow.title,
                    description: workflow.description,
                    templateId: workflow.templateId,
                    status: workflow.status,
                    settings: workflow.settings,
                    organizationId: workflow.organizationId,
                    userId: workflow.userId,
                    createdAt: workflow.createdAt,
                    updatedAt: workflow.updatedAt
                }
            });

        } catch (error) {
            console.error('Error creating workflow:', error);
            if (error.message === 'Template not found') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid template ID provided'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getWorkflows(req, res) {
        try {
            const { error, value } = await workflowValidation.getWorkflows(req.query);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const result = await workflowService.getWorkflows(userId, organizationId, value);

            return res.status(200).json({
                success: true,
                data: {
                    workflows: result.workflows,
                    pagination: {
                        total: result.pagination.total,
                        page: result.pagination.page,
                        limit: result.pagination.limit,
                        pages: result.pagination.pages
                    }
                }
            });

        } catch (error) {
            console.error('Error getting workflows:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getWorkflowById(req, res) {
        try {
            const { error, value } = await workflowValidation.validateWorkflowId(req.params);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const workflow = await workflowService.getWorkflowById(value.id, userId, organizationId);

            return res.status(200).json({
                success: true,
                data: workflow
            });

        } catch (error) {
            console.error('Error getting workflow:', error);
            if (error.message === 'Workflow not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateWorkflow(req, res) {
        try {
            console.log('🔵 [updateWorkflow Controller] Received request:', {
                workflowId: req.params.id,
                bodyKeys: Object.keys(req.body),
                hasSteps: !!req.body.steps,
                stepsCount: req.body.steps?.length,
                steps: req.body.steps?.map(s => ({
                    action: s.action,
                    id: s.id,
                    title: s.title,
                    type: s.type,
                    order: s.order
                }))
            });

            const requestData = {
                id: req.params.id,
                ...req.body
            };

            const { error, value } = await workflowValidation.updateWorkflow(requestData);
            if (error) {
                console.error('❌ [updateWorkflow Controller] Validation error:', error.details[0].message);
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            console.log('✅ [updateWorkflow Controller] Validation passed:', {
                validatedKeys: Object.keys(value),
                hasSteps: !!value.steps,
                validatedSteps: value.steps?.map(s => ({
                    action: s.action,
                    id: s.id,
                    title: s.title,
                    type: s.type
                }))
            });

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const { id, ...updateData } = value;
            await workflowService.updateWorkflow(id, updateData, userId, organizationId);
            
            // Get the formatted workflow response
            const formattedWorkflow = await workflowService.getWorkflowById(id, userId, organizationId);

            console.log('🔷 [updateWorkflow Controller] Formatted response:', {
                workflowId: formattedWorkflow._id,
                stepsCount: formattedWorkflow.steps?.length,
                formattedSteps: formattedWorkflow.steps?.map(s => ({
                    id: s.id,
                    title: s.title,
                    name: s.name,
                    type: s.type
                }))
            });

            return res.status(200).json({
                success: true,
                data: formattedWorkflow
            });

        } catch (error) {
            console.error('Error updating workflow:', error);
            if (error.message === 'Workflow not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async deleteWorkflow(req, res) {
        try {
            const { error, value } = await workflowValidation.validateWorkflowId(req.params);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const result = await workflowService.deleteWorkflow(value.id, userId, organizationId);

            return res.status(200).json({
                success: true,
                message: result.message
            });

        } catch (error) {
            console.error('Error deleting workflow:', error);
            if (error.message === 'Workflow not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message === 'Cannot delete workflow linked to active portals.' || 
                error.message === 'Workflow already deleted') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async duplicateWorkflow(req, res) {
        try {
            const requestData = {
                id: req.params.id,
                title: req.body.title,
                copySteps: req.body.copySteps,
                copySettings: req.body.copySettings
            };

            const { error, value } = await workflowValidation.duplicateWorkflow(requestData);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const duplicatedWorkflow = await workflowService.duplicateWorkflow(
                value.id, 
                value.title, 
                value.copySteps, 
                value.copySettings, 
                userId, 
                organizationId
            );

            return res.status(201).json({
                success: true,
                message: 'Workflow duplicated successfully',
                data: {
                    id: duplicatedWorkflow._id,
                    title: duplicatedWorkflow.title,
                    description: duplicatedWorkflow.description,
                    status: duplicatedWorkflow.status,
                    stepsCount: duplicatedWorkflow.steps ? duplicatedWorkflow.steps.length : 0,
                    settings: duplicatedWorkflow.settings,
                    createdAt: duplicatedWorkflow.createdAt,
                    updatedAt: duplicatedWorkflow.updatedAt
                }
            });

        } catch (error) {
            console.error('Error duplicating workflow:', error);
            if (error.message === 'Workflow not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async executeWorkflow(req, res) {
        try {
            // Validate request
            const requestData = {
                id: req.params.id,
                contactId: req.body.contactId,
                context: req.body.context || {}
            };

            const { error, value } = await workflowValidation.executeWorkflow(requestData);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const execution = await workflowService.executeWorkflow(
                value.id,
                value.contactId,
                value.context,
                userId,
                organizationId
            );

            return res.status(200).json({
                success: true,
                message: 'Workflow execution started',
                data: {
                    executionId: execution._id
                }
            });

        } catch (error) {
            console.error('Error executing workflow:', error);
            if (error.message === 'Workflow not found' || error.message === 'Contact not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message === 'Workflow must be active to execute') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getWorkflowExecutions(req, res) {
        try {
            // Validate workflow ID
            const { error: idError, value: idValue } = await workflowValidation.validateWorkflowId(req.params);
            if (idError) {
                return res.status(400).json({
                    success: false,
                    message: idError.details[0].message
                });
            }

            // Validate query parameters
            const { error: queryError, value: queryValue } = await workflowValidation.getWorkflowExecutions(req.query);
            if (queryError) {
                return res.status(400).json({
                    success: false,
                    message: queryError.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const result = await workflowService.getWorkflowExecutions(idValue.id, userId, organizationId, queryValue);

            return res.status(200).json({
                success: true,
                data: {
                    executions: result.executions,
                    pagination: {
                        total: result.pagination.total,
                        page: result.pagination.page,
                        limit: result.pagination.limit,
                        pages: result.pagination.pages
                    }
                }
            });

        } catch (error) {
            console.error('Error getting workflow executions:', error);
            if (error.message === 'Workflow not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateWorkflowStep(req, res) {
        try {
            // Validate workflow and step IDs
            const { error: idError, value: idValue } = await workflowValidation.validateWorkflowStepIds(req.params);
            if (idError) {
                return res.status(400).json({
                    success: false,
                    message: idError.details[0].message
                });
            }

            // Validate request body
            const requestData = {
                workflowId: idValue.id,
                stepId: idValue.stepId,
                ...req.body
            };

            const { error: bodyError, value: bodyValue } = await workflowValidation.updateWorkflowStep(requestData);
            if (bodyError) {
                return res.status(400).json({
                    success: false,
                    message: bodyError.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            // Extract step data from validated body
            const { workflowId, stepId, ...stepData } = bodyValue;

            const updatedStep = await workflowService.updateWorkflowStep(
                workflowId,
                stepId,
                stepData,
                userId,
                organizationId
            );

            return res.status(200).json({
                success: true,
                message: 'Workflow step updated successfully',
                data: {
                    _id: updatedStep._id,
                    name: updatedStep.name,
                    type: updatedStep.type,
                    order: updatedStep.order,
                    config: updatedStep.config,
                    nextSteps: updatedStep.nextSteps
                }
            });

        } catch (error) {
            console.error('Error updating workflow step:', error);
            if (error.message === 'Workflow not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Workflow not found'
                });
            }
            if (error.message === 'Step not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Step not found'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async deleteWorkflowStep(req, res) {
        try {
            // Validate workflow and step IDs
            const { error, value } = await workflowValidation.validateWorkflowStepIds(req.params);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            await workflowService.deleteWorkflowStep(
                value.id,
                value.stepId,
                userId,
                organizationId
            );

            return res.status(200).json({
                success: true,
                message: 'Workflow step deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting workflow step:', error);
            if (error.message === 'Workflow not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Workflow not found'
                });
            }
            if (error.message === 'Step not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Step not found'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getWorkflowAnalytics(req, res) {
        try {
            const { error, value } = await workflowValidation.validateWorkflowAnalytics({
                ...req.params,
                ...req.query
            });
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const analytics = await workflowService.getWorkflowAnalytics(
                value.id, 
                userId, 
                organizationId, 
                { days: value.days }
            );

            return res.status(200).json({
                success: true,
                data: analytics
            });

        } catch (error) {
            console.error('Error getting workflow analytics:', error);
            if (error.message === 'Workflow not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async reorderSteps(req, res) {
        try {
            const requestData = {
                id: req.params.id,
                steps: req.body.steps
            };

            const { error, value } = await workflowValidation.reorderSteps(requestData);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const result = await workflowService.reorderWorkflowSteps(
                value.id,
                value.steps,
                userId,
                organizationId
            );

            return res.status(200).json({
                success: true,
                message: 'Steps reordered successfully',
                data: {
                    workflowId: result.workflowId,
                    steps: result.steps
                }
            });

        } catch (error) {
            console.error('Error reordering workflow steps:', error);
            if (error.message === 'Workflow not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message.includes('not found in workflow') || 
                error.message.includes('Multiple steps cannot have the same position') ||
                error.message.includes('Position must be between')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async generatePresignedUrl(req, res) {
        try {
            // Combine params and body for validation
            const requestData = {
                id: req.params.id,
                fileName: req.body.fileName,
                contentType: req.body.contentType,
                stepId: req.body.stepId,
                expires: req.body.expires
            };

            // Validate request
            const { error, value } = await workflowValidation.generatePresignedUrl(requestData);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            // Generate presigned URL through service
            const result = await workflowService.generatePresignedUrl(
                value.id,
                value.fileName,
                value.contentType,
                value.stepId,
                value.expires,
                userId,
                organizationId
            );

            return res.status(200).json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error('Error generating presigned URL:', error);
            if (error.message === 'Workflow not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new WorkflowController();