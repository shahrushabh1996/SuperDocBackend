const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs'); // Add fs module

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Title', // Change this
      version: '1.0.0',
      description: 'API documentation for your application', // Change this
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`, // Added /api prefix
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { // Example: Define a security scheme if you use authentication
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: { // Added schemas section
        Admin: {
          type: 'object',
          required: ['name', 'mobileNumber', 'username', 'email', 'password', 'roles'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            mobileNumber: { type: 'string', example: '1234567890' },
            username: { type: 'string', example: 'johndoe' },
            email: { type: 'string', format: 'email', example: 'johndoe@example.com' },
            password: { type: 'string', format: 'password', example: 'strongpassword123' },
            roles: {
              type: 'array',
              items: {
                type: 'object',
                required: ['component', 'permissions'],
                properties: {
                  component: { type: 'string', example: 'Corporate' },
                  permissions: {
                    type: 'array',
                    items: { type: 'string', enum: ['Create', 'Edit', 'Delete', 'Read'] },
                    example: ['Create', 'Read']
                  }
                }
              }
            },
            img: { type: 'string', format: 'url', example: 'http://example.com/image.png', nullable: true }
          }
        },
        AdminUpdate: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Doe' },
            mobileNumber: { type: 'string', example: '1234567890' },
            username: { type: 'string', example: 'johndoe' },
            email: { type: 'string', format: 'email', example: 'johndoe@example.com' },
            password: { type: 'string', format: 'password', example: 'newstrongpassword123' },
            roles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  component: { type: 'string', example: 'Users' },
                  permissions: {
                    type: 'array',
                    items: { type: 'string', enum: ['Create', 'Edit', 'Delete', 'Read'] },
                    example: ['Edit', 'Delete']
                  }
                }
              },
              nullable: true
            },
            img: { type: 'string', format: 'url', example: 'http://example.com/new_image.png', nullable: true },
            status: { type: 'string', enum: ['active', 'inactive'], example: 'active', nullable: true }
          }
        }
      }
    },
    // If you use security globally, uncomment this:
    // security: [
    //   {
    //     bearerAuth: [],
    //   },
    // ],
  },
  // Path to the API docs (typically your route files)
  apis: ['./routes.js', './**/routes.js', './**/*.controller.js', './**/*.route.js', './**/*.routes.js'], // Include root routes.js and routes in module directories
};

// console.log("Swagger Options:", JSON.stringify(options)); // Keep or remove logging options

const swaggerSpec = swaggerJsdoc(options);

// console.log("Generated Swagger Spec:", JSON.stringify(swaggerSpec)); // Remove or keep direct logging

module.exports = swaggerSpec; 