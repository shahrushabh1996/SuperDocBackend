const WorkflowDAO = require('./workflow.dao');
const Workflow = require('./workflow.model');
const WorkflowExecution = require('../workflowExecution/workflowExecution.model');
const { v4: uuidv4 } = require('uuid');
const utils = require('../common/utils');
const sanitizer = require('../utils/sanitizer');
const mongoose = require('mongoose');

class WorkflowService {
    
    async createWorkflow(workflowData, userId, organizationId) {
        try {
            // Prepare workflow data
            const workflow = {
                userId,
                organizationId,
                title: workflowData.title,
                description: workflowData.description || '',
                templateId: workflowData.templateId || null,
                status: 'draft',
                trigger: {
                    type: 'manual'
                },
                steps: [],
                metrics: {
                    totalExecutions: 0,
                    completedExecutions: 0
                },
                version: 1,
                createdBy: userId,
                updatedBy: userId
            };

            // If templateId is provided, validate it exists and clone template data
            if (workflowData.templateId) {
                const template = await this.getWorkflowTemplate(workflowData.templateId, organizationId);
                if (!template) {
                    throw new Error('Template not found');
                }
                
                // Clone template steps if they exist
                if (template.steps && template.steps.length > 0) {
                    workflow.steps = template.steps.map(step => ({
                        ...step,
                        _id: uuidv4() // Generate new IDs for cloned steps
                    }));
                }
                
                // Clone template trigger if it exists
                if (template.trigger) {
                    workflow.trigger = { ...template.trigger };
                }
            }

            // Create the workflow
            const createdWorkflow = new Workflow(workflow);
            const savedWorkflow = await createdWorkflow.save();
            
            return savedWorkflow;
        } catch (error) {
            throw new Error(`Failed to create workflow: ${error.message}`);
        }
    }

    async getWorkflowTemplate(templateId, organizationId) {
        try {
            // For now, we'll look for a workflow that can serve as a template
            // In a real system, you might have a separate WorkflowTemplate model
            const template = await Workflow.findOne({
                _id: templateId,
                organizationId,
                deletedAt: { $exists: false }
            });
            
            return template;
        } catch (error) {
            throw new Error(`Failed to fetch template: ${error.message}`);
        }
    }

    async getWorkflows(userId, organizationId, queryParams) {
        try {
            const {
                page = 1,
                limit = 20,
                search = '',
                status = '',
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = queryParams;

            const skip = (page - 1) * limit;
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            let filter = {
                organizationId,
                deletedAt: { $exists: false }
            };

            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            if (status) {
                filter.status = status;
            }

            const workflows = await Workflow.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('createdBy', 'fullName email')
                .populate('updatedBy', 'fullName email')
                .lean();

            const total = await Workflow.countDocuments(filter);

            // Import Portal model for counting
            const Portal = require('../portal/portal.model');

            // Enhance workflows with additional data
            const enhancedWorkflows = await Promise.all(
                workflows.map(async (workflow) => {
                    // Get count of submissions (total workflow executions)
                    const submissionsCount = await WorkflowExecution.countDocuments({
                        workflowId: workflow._id,
                        organizationId
                    });

                    // Count portals linked to this workflow
                    const portalsCount = await Portal.countDocuments({
                        workflow: workflow._id,
                        organizationId,
                        deletedAt: { $exists: false }
                    });

                    return {
                        id: workflow._id,
                        title: workflow.title,
                        description: workflow.description,
                        status: workflow.status,
                        stepsCount: workflow.steps ? workflow.steps.length : 0,
                        submissionsCount,
                        portalsCount,
                        createdAt: workflow.createdAt,
                        updatedAt: workflow.updatedAt
                    };
                })
            );

            return {
                workflows: enhancedWorkflows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to retrieve workflows: ${error.message}`);
        }
    }

    async getWorkflowById(workflowId, userId, organizationId) {
        try {
            const workflow = await Workflow.findOne({
                _id: workflowId,
                organizationId,
                deletedAt: { $exists: false }
            }).populate('createdBy', 'firstName lastName email')
              .populate('updatedBy', 'firstName lastName email');
            
            if (!workflow) {
                throw new Error('Workflow not found');
            }

            // Get metadata using aggregation
            const Portal = require('../portal/portal.model');
            
            // Count submissions for this workflow
            const submissionsCount = await WorkflowExecution.countDocuments({
                workflowId: workflow._id,
                organizationId
            });

            // Count active portals referencing this workflow
            const activePortalsCount = await Portal.countDocuments({
                workflow: workflow._id,
                organizationId,
                status: 'active',
                deletedAt: { $exists: false }
            });

            // Transform the workflow data
            const transformedWorkflow = {
                id: workflow._id,
                title: workflow.title,
                description: workflow.description,
                status: workflow.status,
                trigger: workflow.trigger,
                
                // Transform steps array
                steps: workflow.steps.map(step => {
                    console.log('🔄 [getWorkflowById] Transforming step:', {
                        _id: step._id,
                        originalTitle: step.title,
                        originalName: step.name,
                        transformedTitle: step.name || step.title,
                        type: step.type
                    });
                    const transformedStep = {
                        id: step._id?.toString(),
                        _id: step._id,
                        title: step.name || step.title,
                        type: step.type,
                        order: step.order || 0,
                        required: step.required || false,
                        fields: step.config?.fields || [],
                        config: step.config || {},
                        createdAt: workflow.createdAt,
                        updatedAt: workflow.updatedAt
                    };
                    
                    // Add screen-specific fields if it's a Screen type
                    if (step.type && step.type.toLowerCase() === 'screen') {
                        if (step.config?.screenTitle) {
                            transformedStep.screenTitle = step.config.screenTitle;
                        }
                        if (step.config?.screenContent) {
                            transformedStep.screenContent = step.config.screenContent;
                        }
                    }
                    
                    return transformedStep;
                }),

                // Ensure settings object includes all required fields
                settings: {
                    allowMultipleSubmissions: workflow.settings?.allowMultipleSubmissions ?? false,
                    requireAuthentication: workflow.settings?.requireAuthentication ?? false,
                    sendEmailNotifications: workflow.settings?.sendEmailNotifications ?? true,
                    autoArchiveAfterDays: workflow.settings?.autoArchiveAfterDays ?? null,
                    emailSubject: workflow.settings?.emailSubject,
                    emailBody: workflow.settings?.emailBody,
                    daysBeforeActivation: workflow.settings?.daysBeforeActivation,
                    sendFrequency: workflow.settings?.sendFrequency,
                    maxAttempts: workflow.settings?.maxAttempts
                },

                // Add metadata object
                metadata: {
                    submissionsCount,
                    activePortalsCount
                },

                // Transform createdBy object
                createdBy: workflow.createdBy ? {
                    id: workflow.createdBy._id,
                    firstName: workflow.createdBy.firstName || '',
                    lastName: workflow.createdBy.lastName || '',
                    email: workflow.createdBy.email || ''
                } : null,

                // Transform updatedBy object
                updatedBy: workflow.updatedBy ? {
                    id: workflow.updatedBy._id,
                    firstName: workflow.updatedBy.firstName || '',
                    lastName: workflow.updatedBy.lastName || '',
                    email: workflow.updatedBy.email || ''
                } : null,

                // Include other fields
                userId: workflow.userId,
                organizationId: workflow.organizationId,
                templateId: workflow.templateId,
                metrics: workflow.metrics,
                version: workflow.version,
                createdAt: workflow.createdAt,
                updatedAt: workflow.updatedAt
            };

            return transformedWorkflow;
        } catch (error) {
            throw new Error(`Failed to retrieve workflow: ${error.message}`);
        }
    }

    async updateWorkflow(workflowId, updateData, userId, organizationId) {
        try {
            console.log('🔍 [updateWorkflow] Starting workflow update:', {
                workflowId,
                userId,
                organizationId,
                updateDataKeys: Object.keys(updateData),
                hasSteps: !!updateData.steps,
                stepsCount: updateData.steps?.length
            });

            const workflow = await Workflow.findOne({
                _id: workflowId,
                organizationId,
                deletedAt: { $exists: false }
            });
            
            if (!workflow) {
                console.error('❌ [updateWorkflow] Workflow not found:', workflowId);
                throw new Error('Workflow not found');
            }

            console.log('✅ [updateWorkflow] Found workflow:', {
                workflowId: workflow._id,
                existingStepsCount: workflow.steps?.length,
                existingSteps: workflow.steps?.map(s => ({ _id: s._id, title: s.title, name: s.name }))
            });

            // Handle step actions if provided
            if (updateData.steps && Array.isArray(updateData.steps)) {
                console.log('📝 [updateWorkflow] Processing step actions:', {
                    stepActions: updateData.steps.map(s => ({ 
                        action: s.action, 
                        id: s.id, 
                        title: s.title,
                        type: s.type,
                        order: s.order
                    }))
                });
                const processedSteps = await this.processStepActions(workflow.steps, updateData.steps);
                updateData.steps = processedSteps;
                console.log('✅ [updateWorkflow] Processed steps:', {
                    processedStepsCount: processedSteps.length,
                    processedSteps: processedSteps.map(s => ({ _id: s._id, title: s.title, name: s.name }))
                });
            }

            // Handle settings object with defaults
            if (updateData.settings) {
                updateData.settings = {
                    allowMultipleSubmissions: updateData.settings.allowMultipleSubmissions ?? false,
                    requireAuthentication: updateData.settings.requireAuthentication ?? false,
                    sendEmailNotifications: updateData.settings.sendEmailNotifications ?? true,
                    autoArchiveAfterDays: updateData.settings.autoArchiveAfterDays ?? null,
                    emailSubject: updateData.settings.emailSubject,
                    emailBody: updateData.settings.emailBody,
                    daysBeforeActivation: updateData.settings.daysBeforeActivation,
                    sendFrequency: updateData.settings.sendFrequency,
                    maxAttempts: updateData.settings.maxAttempts
                };
            }

            console.log('📤 [updateWorkflow] Sending update to MongoDB:', {
                workflowId,
                updateDataKeys: Object.keys(updateData),
                stepsToUpdate: updateData.steps?.map(s => ({ _id: s._id, title: s.title, name: s.name })),
                hasStepsInUpdate: !!updateData.steps
            });

            // Update the workflow document directly
            Object.keys(updateData).forEach(key => {
                if (key === 'steps') {
                    // For steps, we need to ensure Mongoose tracks the change
                    workflow.steps = updateData.steps;
                    workflow.markModified('steps');
                } else {
                    workflow[key] = updateData[key];
                }
            });

            workflow.updatedBy = userId;
            workflow.updatedAt = new Date();

            console.log('📊 [updateWorkflow] About to save workflow:', {
                workflowId: workflow._id,
                stepsToSave: workflow.steps?.map(s => ({ _id: s._id, title: s.title, name: s.name }))
            });

            const updatedWorkflow = await workflow.save();

            console.log('✅ [updateWorkflow] MongoDB update complete:', {
                workflowId: updatedWorkflow._id,
                updatedStepsCount: updatedWorkflow.steps?.length,
                updatedSteps: updatedWorkflow.steps?.map(s => ({ _id: s._id, title: s.title, name: s.name }))
            });

            return updatedWorkflow;
        } catch (error) {
            throw new Error(`Failed to update workflow: ${error.message}`);
        }
    }

    async processStepActions(existingSteps, stepActions) {
        console.log('🔄 [processStepActions] Starting step processing:', {
            existingStepsCount: existingSteps.length,
            stepActionsCount: stepActions.length,
            existingSteps: existingSteps.map(s => ({ _id: s._id, title: s.title, name: s.name }))
        });

        // Create a deep copy of the steps to avoid Mongoose tracking issues
        const steps = JSON.parse(JSON.stringify(existingSteps));
        
        for (const stepAction of stepActions) {
            const { action, id, ...stepData } = stepAction;
            console.log('🔸 [processStepActions] Processing step action:', {
                action,
                id,
                stepData,
                hasTitle: !!stepData.title,
                title: stepData.title
            });
            
            switch (action) {
                case 'create':
                    // Add new step with generated ID if not provided
                    const newStep = {
                        _id: id || uuidv4(),
                        title: stepData.title,
                        name: stepData.title, // Map title to name for backward compatibility
                        type: stepData.type,
                        order: stepData.order || steps.length + 1,
                        required: stepData.required || false,
                        fields: stepData.fields || [],
                        config: stepData.config || {},
                        nextSteps: stepData.nextSteps || []
                    };
                    steps.push(newStep);
                    break;
                    
                case 'update':
                    if (!id) {
                        console.error('❌ [processStepActions] Step ID is required for update action');
                        throw new Error('Step ID is required for update action');
                    }
                    const stepIndex = steps.findIndex(step => step._id === id);
                    if (stepIndex === -1) {
                        console.error('❌ [processStepActions] Step not found:', { id, existingStepIds: steps.map(s => s.id) });
                        throw new Error(`Step with ID ${id} not found`);
                    }
                    
                    console.log('📝 [processStepActions] Before update:', {
                        stepId: id,
                        currentStep: {
                            id: steps[stepIndex].id,
                            title: steps[stepIndex].title,
                            name: steps[stepIndex].name,
                            type: steps[stepIndex].type
                        }
                    });
                    
                    // Update existing step
                    steps[stepIndex] = {
                        ...steps[stepIndex],
                        ...stepData,
                        _id: id, // Preserve the _id
                        title: stepData.title || steps[stepIndex].title, // Ensure title is updated
                        name: stepData.title || steps[stepIndex].name // Map title to name if provided
                    };
                    
                    console.log('✅ [processStepActions] After update:', {
                        stepId: id,
                        updatedStep: {
                            id: steps[stepIndex].id,
                            title: steps[stepIndex].title,
                            name: steps[stepIndex].name,
                            type: steps[stepIndex].type
                        },
                        titleChanged: stepData.title !== undefined,
                        newTitle: stepData.title
                    });
                    break;
                    
                case 'delete':
                    if (!id) {
                        throw new Error('Step ID is required for delete action');
                    }
                    const deleteIndex = steps.findIndex(step => step._id === id);
                    if (deleteIndex === -1) {
                        throw new Error(`Step with ID ${id} not found`);
                    }
                    steps.splice(deleteIndex, 1);
                    break;
                    
                default:
                    throw new Error(`Invalid step action: ${action}`);
            }
        }
        
        console.log('🎯 [processStepActions] Final processed steps:', {
            totalSteps: steps.length,
            steps: steps.map(s => ({
                _id: s._id,
                title: s.title,
                name: s.name,
                type: s.type,
                order: s.order
            }))
        });
        
        return steps;
    }

    async deleteWorkflow(workflowId, userId, organizationId) {
        try {
            const workflow = await Workflow.findOne({
                _id: workflowId,
                organizationId,
                status: { $ne: 'deleted' }
            });
            
            if (!workflow) {
                throw new Error('Workflow not found');
            }

            // Check if workflow is already deleted
            if (workflow.status === 'deleted') {
                throw new Error('Workflow already deleted');
            }

            // Check for active portal dependencies
            const Portal = require('../portal/portal.model');
            const activePortalsCount = await Portal.countDocuments({
                workflow: workflowId,
                organizationId,
                status: 'active',
                deletedAt: { $exists: false }
            });

            if (activePortalsCount > 0) {
                throw new Error('Cannot delete workflow linked to active portals.');
            }

            // Apply status-based deletion logic
            if (workflow.status === 'draft') {
                // Hard delete for draft workflows
                await Workflow.findByIdAndDelete(workflowId);
            } else if (workflow.status === 'active' || workflow.status === 'archived') {
                // Soft delete for active/archived workflows
                await Workflow.findByIdAndUpdate(
                    workflowId,
                    {
                        status: 'deleted',
                        deletedAt: new Date(),
                        updatedBy: userId,
                        updatedAt: new Date()
                    },
                    { new: true }
                );
            } else {
                // For any other status, default to soft delete
                await Workflow.findByIdAndUpdate(
                    workflowId,
                    {
                        status: 'deleted',
                        deletedAt: new Date(),
                        updatedBy: userId,
                        updatedAt: new Date()
                    },
                    { new: true }
                );
            }

            return { message: 'Workflow deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete workflow: ${error.message}`);
        }
    }

    async duplicateWorkflow(workflowId, newTitle, copySteps = true, copySettings = true, userId, organizationId) {
        try {
            const originalWorkflow = await Workflow.findOne({
                _id: workflowId,
                organizationId,
                deletedAt: { $exists: false }
            });
            
            if (!originalWorkflow) {
                throw new Error('Workflow not found');
            }

            // Create duplicate workflow object, excluding fields that should not be copied
            const duplicatedWorkflowData = {
                userId,
                organizationId,
                title: newTitle,
                description: originalWorkflow.description,
                templateId: originalWorkflow.templateId,
                status: 'draft', // New workflows should start as draft
                trigger: originalWorkflow.trigger ? { ...originalWorkflow.trigger } : undefined,
                metrics: {
                    totalExecutions: 0,
                    completedExecutions: 0
                },
                version: 1, // Reset version for new workflow
                createdBy: userId,
                updatedBy: userId
            };

            // Copy steps only if copySteps is true
            if (copySteps && originalWorkflow.steps && originalWorkflow.steps.length > 0) {
                duplicatedWorkflowData.steps = originalWorkflow.steps.map(step => {
                    const stepObj = step.toObject ? step.toObject() : step;
                    return {
                        ...stepObj,
                        _id: uuidv4() // Generate new IDs for steps to avoid conflicts
                    };
                });
            } else {
                duplicatedWorkflowData.steps = [];
            }

            // Copy settings only if copySettings is true
            if (copySettings && originalWorkflow.settings) {
                duplicatedWorkflowData.settings = {
                    allowMultipleSubmissions: originalWorkflow.settings.allowMultipleSubmissions ?? false,
                    requireAuthentication: originalWorkflow.settings.requireAuthentication ?? false,
                    sendEmailNotifications: originalWorkflow.settings.sendEmailNotifications ?? true,
                    autoArchiveAfterDays: originalWorkflow.settings.autoArchiveAfterDays ?? null,
                    emailSubject: originalWorkflow.settings.emailSubject,
                    emailBody: originalWorkflow.settings.emailBody,
                    daysBeforeActivation: originalWorkflow.settings.daysBeforeActivation,
                    sendFrequency: originalWorkflow.settings.sendFrequency,
                    maxAttempts: originalWorkflow.settings.maxAttempts
                };
            }

            // Remove undefined fields
            Object.keys(duplicatedWorkflowData).forEach(key => {
                if (duplicatedWorkflowData[key] === undefined) {
                    delete duplicatedWorkflowData[key];
                }
            });

            // Create and save the duplicated workflow
            const duplicatedWorkflow = new Workflow(duplicatedWorkflowData);
            const savedWorkflow = await duplicatedWorkflow.save();

            return savedWorkflow;
        } catch (error) {
            throw new Error(`Failed to duplicate workflow: ${error.message}`);
        }
    }

    async executeWorkflow(workflowId, contactId, context, userId, organizationId) {
        try {
            // Verify workflow exists and belongs to the organization
            const workflow = await Workflow.findOne({
                _id: workflowId,
                organizationId,
                deletedAt: { $exists: false }
            });

            if (!workflow) {
                throw new Error('Workflow not found');
            }

            // Ensure workflow is active
            if (workflow.status !== 'active') {
                throw new Error('Workflow must be active to execute');
            }

            // Verify contact exists and belongs to the organization
            const Contact = require('../contact/contact.model');
            const contact = await Contact.findOne({
                _id: contactId,
                organizationId,
                deletedAt: { $exists: false }
            });

            if (!contact) {
                throw new Error('Contact not found');
            }

            // Create execution record
            const execution = new WorkflowExecution({
                workflowId,
                organizationId,
                contactId,
                status: 'pending',
                startedAt: new Date(),
                context: {
                    source: context.source || 'manual',
                    customData: context.customData || {},
                    executedBy: userId
                },
                createdBy: userId
            });

            const savedExecution = await execution.save();

            // Update workflow metrics
            await Workflow.findByIdAndUpdate(workflowId, {
                $inc: { 'metrics.totalExecutions': 1 },
                'metrics.lastExecutedAt': new Date()
            });

            return savedExecution;
        } catch (error) {
            throw new Error(`Failed to execute workflow: ${error.message}`);
        }
    }

    async getWorkflowExecutions(workflowId, userId, organizationId, queryParams) {
        try {
            // First, verify the workflow exists and belongs to the organization
            const workflow = await Workflow.findOne({
                _id: workflowId,
                organizationId,
                deletedAt: { $exists: false }
            });

            if (!workflow) {
                throw new Error('Workflow not found');
            }

            const {
                page = 1,
                limit = 20,
                status = '',
                sortBy = 'startedAt',
                sortOrder = 'desc'
            } = queryParams;

            const skip = (page - 1) * limit;
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            let filter = {
                workflowId,
                organizationId
            };

            if (status) {
                filter.status = status;
            }

            const executions = await WorkflowExecution.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('contactId', 'firstName lastName email')
                .populate('createdBy', 'fullName email')
                .lean();

            const total = await WorkflowExecution.countDocuments(filter);

            // Transform executions to match the required response format
            const transformedExecutions = executions.map(execution => ({
                id: execution._id,
                status: execution.status,
                executedBy: {
                    id: execution.createdBy?._id || null,
                    name: execution.createdBy?.fullName || 'Unknown'
                },
                contact: {
                    id: execution.contactId?._id || null,
                    name: execution.contactId ? 
                        `${execution.contactId.firstName || ''} ${execution.contactId.lastName || ''}`.trim() || 
                        execution.contactId.email || 'Unknown' : 'Unknown'
                },
                startedAt: execution.startedAt,
                completedAt: execution.completedAt
            }));

            return {
                executions: transformedExecutions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to retrieve workflow executions: ${error.message}`);
        }
    }

    async updateWorkflowStep(workflowId, stepId, stepData, userId, organizationId) {
        try {
            console.log('=== WORKFLOW UPDATE START ===');
            console.log('Workflow ID:', workflowId);
            console.log('Step ID to update:', stepId);
            console.log('Step Data:', JSON.stringify(stepData, null, 2));
            
            // First, verify the workflow exists and belongs to the organization
            const workflow = await Workflow.findOne({
                _id: workflowId,
                organizationId,
                deletedAt: { $exists: false }
            });

            if (!workflow) {
                throw new Error('Workflow not found');
            }

            console.log('Found workflow:', workflow.title);
            console.log('Current steps:', workflow.steps.map(s => ({
                _id: s._id ? s._id.toString() : 'NO_ID',
                name: s.name,
                type: s.type
            })));

            // Find the step to update (only use _id)
            const stepIndex = workflow.steps.findIndex(step => 
                step._id && step._id.toString() === stepId
            );
            if (stepIndex === -1) {
                console.log('ERROR: Step not found. Looking for:', stepId);
                console.log('Available step IDs:', workflow.steps.map(s => s._id ? s._id.toString() : 'NO_ID'));
                throw new Error('Step not found');
            }

            // Create updated step object - preserve the _id
            const updatedStep = workflow.steps[stepIndex].toObject ? 
                workflow.steps[stepIndex].toObject() : 
                { ...workflow.steps[stepIndex] };
            
            // IMPORTANT: Preserve the original _id
            updatedStep._id = workflow.steps[stepIndex]._id;
            
            console.log('Original step _id:', workflow.steps[stepIndex]._id);
            console.log('Updated step _id before changes:', updatedStep._id);

            // Update fields if provided
            if (stepData.name !== undefined) {
                updatedStep.name = stepData.name;
            }
            if (stepData.type !== undefined) {
                updatedStep.type = stepData.type;
            }
            if (stepData.config !== undefined) {
                // If this is a screen type step, sanitize the HTML content
                const isScreenType = (stepData.type && stepData.type.toLowerCase() === 'screen') || 
                                   (updatedStep.type && updatedStep.type.toLowerCase() === 'screen');
                if (isScreenType) {
                    if (stepData.config.screenContent) {
                        // Sanitize HTML content before saving
                        stepData.config.screenContent = sanitizer.sanitizeScreenContent(stepData.config.screenContent);
                    }
                }
                updatedStep.config = { ...updatedStep.config, ...stepData.config };
            }
            if (stepData.nextSteps !== undefined) {
                updatedStep.nextSteps = stepData.nextSteps;
            }
            
            console.log('Updated step _id after changes:', updatedStep._id);

            // Handle order change - this requires reordering steps
            if (stepData.order !== undefined && stepData.order !== updatedStep.order) {
                const oldOrder = updatedStep.order;
                const newOrder = stepData.order;
                
                // Update the step's order
                updatedStep.order = newOrder;
                
                // Update the step in the array
                workflow.steps[stepIndex] = updatedStep;
                
                // Reorder other steps
                workflow.steps.forEach((step, index) => {
                    if (index !== stepIndex) {
                        // If moving step down (increasing order)
                        if (newOrder > oldOrder && step.order > oldOrder && step.order <= newOrder) {
                            step.order -= 1;
                        }
                        // If moving step up (decreasing order)
                        else if (newOrder < oldOrder && step.order >= newOrder && step.order < oldOrder) {
                            step.order += 1;
                        }
                    }
                });
                
                // Sort steps by order
                workflow.steps.sort((a, b) => a.order - b.order);
            } else {
                // Just update the step without reordering
                workflow.steps[stepIndex] = updatedStep;
            }
            
            // Double-check that _id is preserved in the array
            console.log('Step _id in array after assignment:', workflow.steps[stepIndex]._id);

            console.log('About to update workflow with steps:', workflow.steps.map(s => ({
                _id: s._id ? s._id.toString() : 'NO_ID',
                name: s.name,
                order: s.order
            })));

            // Update the workflow
            const updatedWorkflow = await Workflow.findByIdAndUpdate(
                workflowId,
                {
                    steps: workflow.steps,
                    updatedBy: userId,
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            );

            if (!updatedWorkflow) {
                throw new Error('Failed to update workflow');
            }

            console.log('Workflow updated successfully');
            console.log('Updated workflow steps:', updatedWorkflow.steps.map(s => ({
                _id: s._id ? s._id.toString() : 'NO_ID',
                name: s.name,
                type: s.type
            })));

            // Find and return the updated step
            console.log('Looking for step with id:', stepId);
            console.log('Available steps:', updatedWorkflow.steps.map(s => ({ _id: s._id })));
            
            const finalUpdatedStep = updatedWorkflow.steps.find(step => 
                step._id && step._id.toString() === stepId
            );
            
            if (!finalUpdatedStep) {
                console.log('ERROR: Updated step not found!');
                console.log('Looking for stepId:', stepId);
                console.log('Step IDs after update:', updatedWorkflow.steps.map(s => ({
                    _id: s._id ? s._id.toString() : 'NO_ID',
                    matches: s._id ? s._id.toString() === stepId : false
                })));
                throw new Error(`Updated step not found with id: ${stepId}`);
            }
            
            console.log('Found updated step:', finalUpdatedStep.name);
            return finalUpdatedStep;
        } catch (error) {
            throw new Error(`Failed to update workflow step: ${error.message}`);
        }
    }

    async deleteWorkflowStep(workflowId, stepId, userId, organizationId) {
        try {
            // First, verify the workflow exists and belongs to the organization
            const workflow = await Workflow.findOne({
                _id: workflowId,
                organizationId,
                deletedAt: { $exists: false }
            });

            if (!workflow) {
                throw new Error('Workflow not found');
            }

            // Find the step to delete (only use _id)
            const stepIndex = workflow.steps.findIndex(step => 
                step._id && step._id.toString() === stepId
            );
            if (stepIndex === -1) {
                throw new Error('Step not found');
            }

            const deletedStep = workflow.steps[stepIndex];

            // Remove the step from the workflow
            workflow.steps.splice(stepIndex, 1);

            // Reorder remaining steps to maintain sequential order
            workflow.steps.forEach((step, index) => {
                if (step.order > deletedStep.order) {
                    step.order -= 1;
                }
            });

            // Remove references to the deleted step from other steps' nextSteps
            workflow.steps.forEach(step => {
                if (step.nextSteps && step.nextSteps.length > 0) {
                    step.nextSteps = step.nextSteps.filter(nextStep => nextStep.stepId !== stepId);
                }
            });

            // Update the workflow
            const updatedWorkflow = await Workflow.findByIdAndUpdate(
                workflowId,
                {
                    steps: workflow.steps,
                    updatedBy: userId,
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            );

            if (!updatedWorkflow) {
                throw new Error('Failed to update workflow');
            }

            return { message: 'Workflow step deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete workflow step: ${error.message}`);
        }
    }

    async getWorkflowAnalytics(workflowId, userId, organizationId, queryParams = {}) {
        try {
            // Verify workflow exists and belongs to the organization
            const workflow = await Workflow.findOne({
                _id: workflowId,
                organizationId,
                deletedAt: { $exists: false }
            });

            if (!workflow) {
                throw new Error('Workflow not found');
            }

            const { days = 30 } = queryParams;
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);

            // Get Portal model for counting active portals
            const Portal = require('../portal/portal.model');

            // 1. Overview Analytics
            const totalSubmissions = await WorkflowExecution.countDocuments({
                workflowId,
                organizationId
            });

            const completedSubmissions = await WorkflowExecution.countDocuments({
                workflowId,
                organizationId,
                status: 'completed'
            });

            const completionRate = totalSubmissions > 0 ? 
                Math.round((completedSubmissions / totalSubmissions) * 100 * 10) / 10 : 0;

            // Calculate average completion time
            const completedExecutions = await WorkflowExecution.find({
                workflowId,
                organizationId,
                status: 'completed',
                startedAt: { $exists: true },
                completedAt: { $exists: true }
            }).select('startedAt completedAt');

            let averageCompletionTime = 0;
            if (completedExecutions.length > 0) {
                const totalTime = completedExecutions.reduce((sum, execution) => {
                    const duration = (execution.completedAt - execution.startedAt) / 1000; // seconds
                    return sum + duration;
                }, 0);
                averageCompletionTime = Math.round(totalTime / completedExecutions.length);
            }

            const activePortals = await Portal.countDocuments({
                workflow: workflowId,
                organizationId,
                status: 'active',
                deletedAt: { $exists: false }
            });

            // 2. Trends Analytics - Daily aggregation
            const trendsAggregation = await WorkflowExecution.aggregate([
                {
                    $match: {
                        workflowId: workflow._id,
                        organizationId: workflow.organizationId,
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$createdAt"
                                }
                            },
                            status: "$status"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.date",
                        submissions: {
                            $sum: "$count"
                        },
                        completions: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$_id.status", "completed"] },
                                    "$count",
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        dropoffRate: {
                            $cond: [
                                { $gt: ["$submissions", 0] },
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                { $subtract: ["$submissions", "$completions"] },
                                                "$submissions"
                                            ]
                                        },
                                        100
                                    ]
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);

            // Format trends data
            const submissions = trendsAggregation.map(item => ({
                date: item._id,
                count: item.submissions
            }));

            const completions = trendsAggregation.map(item => ({
                date: item._id,
                count: item.completions
            }));

            const dropoffRates = trendsAggregation.map(item => ({
                date: item._id,
                rate: Math.round(item.dropoffRate * 10) / 10
            }));

            // 3. Step Analytics
            const stepAnalytics = [];
            
            if (workflow.steps && workflow.steps.length > 0) {
                for (const step of workflow.steps) {
                    // Count views (executions that reached this step)
                    const views = await WorkflowExecution.countDocuments({
                        workflowId,
                        organizationId,
                        'stepExecutions.stepId': step._id
                    });

                    // Count completions (executions that completed this step)
                    const completions = await WorkflowExecution.countDocuments({
                        workflowId,
                        organizationId,
                        'stepExecutions': {
                            $elemMatch: {
                                stepId: step._id,
                                status: 'completed'
                            }
                        }
                    });

                    const dropoffRate = views > 0 ? 
                        Math.round(((views - completions) / views) * 100 * 10) / 10 : 0;

                    stepAnalytics.push({
                        stepId: step._id,
                        stepTitle: step.name || step.title || `Step ${step.order || 1}`,
                        views,
                        completions,
                        dropoffRate
                    });
                }
            }

            return {
                overview: {
                    totalSubmissions,
                    completionRate,
                    averageCompletionTime,
                    activePortals
                },
                trends: {
                    submissions,
                    completions,
                    dropoffRates
                },
                stepAnalytics
            };

        } catch (error) {
            throw new Error(`Failed to retrieve workflow analytics: ${error.message}`);
        }
    }

    async reorderWorkflowSteps(workflowId, reorderInstructions, userId, organizationId) {
        try {
            // 1. Fetch the workflow
            const workflow = await Workflow.findOne({
                _id: workflowId,
                organizationId,
                deletedAt: { $exists: false }
            });

            if (!workflow) {
                throw new Error('Workflow not found');
            }

            // 2. Validate all step IDs exist
            const existingStepIds = workflow.steps.map(step => step._id.toString());
            const instructionStepIds = reorderInstructions.map(instruction => instruction.stepId);
            
            for (const instruction of reorderInstructions) {
                if (!existingStepIds.includes(instruction.stepId)) {
                    throw new Error(`Step with ID '${instruction.stepId}' not found in workflow`);
                }
            }

            // 3. Check for duplicate positions
            const positions = reorderInstructions.map(instruction => instruction.newPosition);
            const uniquePositions = new Set(positions);
            if (positions.length !== uniquePositions.size) {
                throw new Error('Multiple steps cannot have the same position');
            }

            // 4. Validate position range
            const maxPosition = workflow.steps.length;
            for (const instruction of reorderInstructions) {
                if (instruction.newPosition < 1 || instruction.newPosition > maxPosition) {
                    throw new Error(`Position must be between 1 and ${maxPosition}`);
                }
            }

            // 5. Create a mapping of stepId to newPosition
            const positionMap = new Map();
            reorderInstructions.forEach(instruction => {
                positionMap.set(instruction.stepId, instruction.newPosition);
            });

            // 6. Clone and reorder steps
            const reorderedSteps = [...workflow.steps];
            
            // Sort steps based on new positions
            reorderedSteps.sort((a, b) => {
                const posA = positionMap.has(a._id.toString()) ? positionMap.get(a._id.toString()) : a.order || 999;
                const posB = positionMap.has(b._id.toString()) ? positionMap.get(b._id.toString()) : b.order || 999;
                
                if (posA === posB) {
                    // If same position (shouldn't happen with validation), maintain original order
                    return (a.order || 0) - (b.order || 0);
                }
                return posA - posB;
            });

            // 7. Update order field for all steps
            reorderedSteps.forEach((step, index) => {
                step.order = index + 1;
            });

            // 8. Update the workflow with reordered steps
            workflow.steps = reorderedSteps;
            workflow.updatedBy = userId;
            workflow.markModified('steps');
            
            await workflow.save();

            // 9. Return formatted response
            return {
                workflowId: workflow._id.toString(),
                steps: reorderedSteps.map(step => ({
                    id: step._id.toString(),
                    title: step.name || step.title,
                    order: step.order
                }))
            };

        } catch (error) {
            throw new Error(`Failed to reorder workflow steps: ${error.message}`);
        }
    }

    async generatePresignedUrl(workflowId, fileName, contentType, stepId, expires, userId, organizationId) {
        try {
            // 1. Verify workflow exists and user has access
            const workflow = await Workflow.findOne({
                _id: workflowId,
                organizationId,
                deletedAt: { $exists: false }
            });

            if (!workflow) {
                throw new Error('Workflow not found');
            }

            // 2. If stepId provided, verify it exists in workflow
            if (stepId && workflow.steps) {
                const stepExists = workflow.steps.some(step => step._id && step._id.toString() === stepId);
                if (!stepExists) {
                    throw new Error('Step not found in workflow');
                }
            }

            // 3. Generate unique S3 key
            const timestamp = Date.now();
            const randomString = utils.generateID(8);
            const fileExtension = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
            const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
            
            // Structure: workflows/{organizationId}/{workflowId}/{stepId?}/{timestamp}-{random}-{filename}
            let key = `workflows/${organizationId}/${workflowId}/`;
            if (stepId) {
                key += `${stepId}/`;
            }
            key += `${timestamp}-${randomString}-${sanitizedFileName}`;

            // 4. Get bucket name from environment
            const bucketName = process.env.AWS_WORKFLOW_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;
            
            if (!bucketName) {
                throw new Error('S3 bucket configuration missing');
            }

            // 5. Generate presigned URL
            const presignedUrl = await utils.generatePresignedUrl(
                bucketName,
                key,
                contentType,
                expires
            );

            // 6. Calculate expiration timestamp
            const expiresAt = new Date(Date.now() + (expires * 1000));

            // 7. Log the file upload request for tracking (optional)
            console.log(`[WorkflowService] Generated presigned URL for workflow ${workflowId}:`, {
                userId,
                organizationId,
                workflowId,
                stepId,
                fileName,
                contentType,
                key,
                expiresAt
            });

            // 8. Return the presigned URL details
            return {
                uploadUrl: presignedUrl,
                key,
                expiresAt: expiresAt.toISOString()
            };

        } catch (error) {
            console.error('[WorkflowService] Error generating presigned URL:', error);
            throw error;
        }
    }

    async addWorkflowStep(workflowId, stepData, userId, organizationId) {
        try {
            console.log('📝 [addWorkflowStep] Adding new step to workflow:', {
                workflowId,
                stepData: {
                    title: stepData.title,
                    type: stepData.type,
                    order: stepData.order,
                    required: stepData.required
                }
            });

            // 1. Fetch the workflow
            const workflow = await Workflow.findOne({
                _id: workflowId,
                organizationId,
                deletedAt: { $exists: false }
            });

            if (!workflow) {
                throw new Error('Workflow not found');
            }

            // 2. Check if step ID already exists
            const existingStep = workflow.steps.find(step => step.id === stepData.stepId);
            if (existingStep) {
                throw new Error('Step ID already exists in workflow');
            }

            // 3. Determine step order
            let stepOrder = stepData.order;
            if (!stepOrder) {
                // Auto-append to end
                stepOrder = workflow.steps.length + 1;
            } else {
                // If explicit order provided, shift existing steps
                workflow.steps.forEach(step => {
                    if (step.order >= stepOrder) {
                        step.order += 1;
                    }
                });
            }

            // 4. Create the new step object
            const newStep = {
                _id: new mongoose.Types.ObjectId(), // Generate MongoDB ObjectId
                id: stepData.stepId, // Use provided stepId as id field
                title: stepData.title,
                name: stepData.title, // Map title to name for backward compatibility
                type: stepData.type.toLowerCase(), // Ensure lowercase for consistency
                order: stepOrder,
                required: stepData.required || false,
                config: stepData.config || {},
                nextSteps: stepData.nextSteps || [],
                fields: stepData.config?.fields || []
            };

            // 5. Handle type-specific config sanitization
            if (stepData.type && stepData.type.toLowerCase() === 'screen' && stepData.config) {
                if (stepData.config.screenContent) {
                    newStep.config.screenContent = sanitizer.sanitizeScreenContent(stepData.config.screenContent);
                }
            }

            console.log('✅ [addWorkflowStep] New step created:', {
                _id: newStep._id,
                id: newStep.id,
                title: newStep.title,
                order: newStep.order
            });

            // 6. Add step to workflow
            workflow.steps.push(newStep);
            
            // Sort steps by order
            workflow.steps.sort((a, b) => a.order - b.order);

            // 7. Update workflow metadata
            workflow.updatedBy = userId;
            workflow.updatedAt = new Date();
            workflow.markModified('steps');

            // 8. Save the workflow
            const updatedWorkflow = await workflow.save();

            console.log('💾 [addWorkflowStep] Workflow saved with new step:', {
                workflowId: updatedWorkflow._id,
                totalSteps: updatedWorkflow.steps.length
            });

            // 9. Find and return the newly added step
            const addedStep = updatedWorkflow.steps.find(step => step._id.toString() === newStep._id.toString());
            
            if (!addedStep) {
                throw new Error('Failed to retrieve newly added step');
            }

            return addedStep;

        } catch (error) {
            console.error('❌ [addWorkflowStep] Error:', error);
            throw new Error(`Failed to add workflow step: ${error.message}`);
        }
    }
}

module.exports = new WorkflowService();