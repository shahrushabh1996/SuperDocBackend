const mongoose = require('mongoose');

// Mock workflow data
const mockWorkflow = {
    _id: new mongoose.Types.ObjectId(),
    steps: [
        {
            id: 'step-1',
            title: 'Original Title 1',
            name: 'Original Name 1',
            type: 'form',
            order: 1
        },
        {
            id: 'step-2', 
            title: 'Original Title 2',
            name: 'Original Name 2',
            type: 'document',
            order: 2
        }
    ]
};

// Mock update data
const updateData = {
    steps: [
        {
            action: 'update',
            id: 'step-1',
            title: 'Updated Title 1'
        }
    ]
};

// Test processStepActions function
async function processStepActions(existingSteps, stepActions) {
    const steps = [...existingSteps];
    
    for (const stepAction of stepActions) {
        const { action, id, ...stepData } = stepAction;
        
        switch (action) {
            case 'update':
                if (!id) {
                    throw new Error('Step ID is required for update action');
                }
                const stepIndex = steps.findIndex(step => step.id === id);
                if (stepIndex === -1) {
                    throw new Error(`Step with ID ${id} not found`);
                }
                // Update existing step
                steps[stepIndex] = {
                    ...steps[stepIndex],
                    ...stepData,
                    id: id, // Preserve the ID
                    title: stepData.title || steps[stepIndex].title, // Ensure title is updated
                    name: stepData.title || steps[stepIndex].name // Map title to name if provided
                };
                console.log('Updated step:', steps[stepIndex]);
                break;
        }
    }
    
    return steps;
}

// Test the function
async function test() {
    console.log('Original steps:');
    console.log(JSON.stringify(mockWorkflow.steps, null, 2));
    
    console.log('\nUpdate data:');
    console.log(JSON.stringify(updateData, null, 2));
    
    const processedSteps = await processStepActions(mockWorkflow.steps, updateData.steps);
    
    console.log('\nProcessed steps:');
    console.log(JSON.stringify(processedSteps, null, 2));
    
    // Simulate MongoDB update
    console.log('\nSimulating MongoDB update...');
    const updatedWorkflow = {
        ...mockWorkflow,
        steps: processedSteps,
        updatedAt: new Date()
    };
    
    console.log('\nUpdated workflow steps:');
    console.log(JSON.stringify(updatedWorkflow.steps, null, 2));
    
    // Test getWorkflowById transformation
    console.log('\nTesting getWorkflowById transformation...');
    const transformedSteps = updatedWorkflow.steps.map(step => ({
        id: step.id || step._id?.toString(),
        title: step.name || step.title,
        type: step.type,
        order: step.order || 0,
        required: step.required || false,
        fields: step.config?.fields || [],
        createdAt: updatedWorkflow.createdAt,
        updatedAt: updatedWorkflow.updatedAt
    }));
    
    console.log('\nTransformed steps for response:');
    console.log(JSON.stringify(transformedSteps, null, 2));
}

test().catch(console.error);