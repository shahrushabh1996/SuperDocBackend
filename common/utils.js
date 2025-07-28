// Implement all the utils here

const { v4: uuidv4 } = require('uuid');
const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');
const twilio = require('twilio');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OcrResult = require('./ocrResult.model');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Initialize SNS client
const sns = new AWS.SNS({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

class Utils {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    generateUUID() {
        return uuidv4();
    }

    // Send email using sendgrid
    async sendEmail(to, subject, text) {
        const msg = {
            to,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject,
            html: text
        };

        await sgMail.send(msg);
    }

    // Upload image in S3 bucket
    async uploadImageToS3(file) {
        const upload = await s3.upload({
            Bucket: process.env.AWS_QR_CODE_BUCKET_NAME, // using AWS_QR_CODE_BUCKET_NAME instead of S3_BUCKET_NAME
            Key: file.originalname,
            Body: file.buffer
        }).promise();

        return upload.Location;
    }

    // Generic method to upload any file to S3
    async uploadFileToS3(file, bucketName, keyPrefix = '', options = {}) {
        try {
            // Generate unique filename if not provided
            const timestamp = Date.now();
            const randomString = this.generateID(8);
            const fileExtension = file.originalname ? path.extname(file.originalname) : '';
            const fileName = options.fileName || `${timestamp}-${randomString}${fileExtension}`;
            
            // Construct S3 key
            const key = keyPrefix ? `${keyPrefix}/${fileName}` : fileName;
            
            const uploadParams = {
                Bucket: bucketName,
                Key: key,
                Body: file.buffer || file.data,
                ContentType: options.contentType || file.mimetype || 'application/octet-stream',
                ...options.additionalParams
            };

            // Add ACL if specified
            if (options.acl) {
                uploadParams.ACL = options.acl;
            }

            // Add metadata if specified
            if (options.metadata) {
                uploadParams.Metadata = options.metadata;
            }

            const upload = await s3.upload(uploadParams).promise();

            return {
                success: true,
                url: upload.Location,
                key: upload.Key,
                bucket: upload.Bucket,
                etag: upload.ETag
            };
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // By using twillio send whatsapp message
    async sendWhatsappMessage(to, text) {
        const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        const message = await client.messages.create({
            body: text,
            from: process.env.TWILIO_FROM_NUMBER,
            to: `whatsapp:${to}`
        });

        return message;
    }

    // Generate 8 character long ID combination of characters and numbers using any library
    generateID(number) {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < number; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }

    // Generate voucher codes
    generateVoucherCodes(number) {
        const codes = [];

        for (let i = 0; i < number; i++) {
            codes.push(this.generateID(20));
        }

        return codes;
    }

    // Encrypt text using AES-256-GCM
    encrypt(text) {
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const tag = cipher.getAuthTag();

        return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    }

    // Decrypt text using AES-256-GCM
    decrypt(text) {
        const [iv, tag, encrypted] = text.split(':');

        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(tag, 'hex'));

        return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    }

    // compute hmac of text
    computeHmac(text) {
        return crypto.createHmac('sha256', process.env.HMAC_SECRET).update(text).digest('hex');
    }

    // Generate OTP
    generateOtp(length) {
        return Math.floor(10 ** (length - 1) + Math.random() * (10 ** length - 10 ** (length - 1) - 1));
    }

    // Generate signed URL for S3 download
    generateSignedDownloadUrl(bucketName, key, expiresInSeconds = 300) {
        const params = {
            Bucket: bucketName,
            Key: key,
            Expires: expiresInSeconds, // 5 minutes default
        };
        
        return s3.getSignedUrl('getObject', params);
    }

    // Generate organization slug from name
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')         // Replace spaces with hyphens
            .replace(/--+/g, '-')         // Replace multiple hyphens with single hyphen
            .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
    }

    async storeQRCode(value) {
        try {
            const qrCodeBuffer = await this.generateQRCode(value);
            const qrCodeUrl = await this.uploadQRCodeToS3(qrCodeBuffer);
            return qrCodeUrl;
        } catch (error) {
            
            console.error("Error storing QR code:", error);
            throw new Error("Failed to store QR code");
        }
    }

    // Upload QR code to S3 bucket
    async uploadQRCodeToS3(qrCodeBuffer) {
        const bucketName = process.env.AWS_QR_CODE_BUCKET_NAME;
        const key = `qr-codes/${uuidv4()}.png`; // Generate unique key

        const params = {
            Bucket: bucketName,
            Key: key,
            Body: qrCodeBuffer,
            ContentType: 'image/png'
        };

        const uploadedImage = await s3.upload(params).promise();

        return uploadedImage.Location; // Return the URL of the uploaded image
    }

    // Generate QR code
    async generateQRCode(value) {
        try {
            return QRCode.toBuffer(value, { type: 'png', width: 512, height: 512 });
        } catch (error) {
            console.error("Error generating or uploading QR code:", error);
            throw new Error("Failed to generate and upload QR code");
        }
    }

    // Publish notification to SNS topic
    async publishSNSNotification(topicArn, subject, message, attributes = {}) {
        try {
            const params = {
                TopicArn: topicArn,
                Subject: subject,
                Message: JSON.stringify(message),
                MessageAttributes: {}
            };
            
            // Add message attributes if provided
            Object.keys(attributes).forEach(key => {
                params.MessageAttributes[key] = {
                    DataType: 'String',
                    StringValue: attributes[key]
                };
            });
            
            const result = await sns.publish(params).promise();
            console.log(`SNS notification published: ${result.MessageId}`);
            return result;
        } catch (error) {
            console.error('Error publishing SNS notification:', error);
            throw error;
        }
    }

    async invoiceOCR(invoiceImageBuffer) {
        try {
            // Initialize the Gemini API
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            // Convert buffer to base64 for Gemini
            const base64Image = invoiceImageBuffer.toString('base64');

            // Prepare the image part for Gemini
            const imagePart = {
                inlineData: {
                    data: base64Image,
                    mimeType: 'image/jpeg', // Adjust if needed based on your image format
                },
            };

            // Create prompt to extract invoice data and check if it's a valid invoice
            const prompt = `Is the image a valid invoice? If not, respond with the following JSON: \`\`\`json\n{ "isValidInvoice": false }\n\`\`\`. If it is a valid invoice, extract all the information from this invoice image and respond with a JSON object in the following format:

\`\`\`json
{
    "isValidInvoice": true,
    "invoiceNumber": {
        "value": "invoice number",
        "confidence": 0.99
    },
    "date": {
        "value": "invoice date",
        "confidence": 0.99
    },
    "vendorName": {
        "value": "vendor name",
        "confidence": 0.99
    },
    "items": [
        {
            "description": {
                "value": "item description",
                "confidence": 0.99
            },
            "quantity": {
                "value": quantity,
                "confidence": 0.99
            },
            "price": {
                "value": price,
                "confidence": 0.99
            }
        },
        // ... more items
    ],
    "subtotal": {
        "value": "subtotal amount",
        "confidence": 0.99
    },
    "tax": {
        "value": "tax amount",
        "confidence": 0.99
    },
    "totalAmount": {
        "value": "total amount",
        "confidence": 0.99
    }
}
\`\`\`

For each extracted field (invoiceNumber, date, vendorName, items, subtotal, tax, totalAmount), provide a 'value' and a 'confidence' score between 0 and 1. Ensure the response is a valid JSON object.`;

            // Send to Gemini
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            // Store the OCR result in the database
            await OcrResult.create({
                ocrData: text
            });

            // Parse the JSON from the text response
            let jsonResponse;
            try {
                // Look for JSON in the response text
                const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                    text.match(/{[\s\S]*?}/);

                const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
                jsonResponse = JSON.parse(jsonString);

                console.log(jsonResponse);

                if (jsonResponse && jsonResponse.isValidInvoice === false) {
                    return { isValidInvoice: false, success: false };
                }

            } catch (parseError) {
                console.error("Error parsing Gemini response to JSON:", parseError);
                // Attempt to create a structured response even if parsing fails
                jsonResponse = {
                    error: "Failed to parse response",
                    rawText: text,
                    success: false
                };
            }

            return {
                success: true,
                data: jsonResponse,
                isValidInvoice: true // Add isValidInvoice: true when OCR is successful
            };
        } catch (error) {
            console.error("Error performing invoice OCR with Gemini:", error);
            return {
                success: false,
                error: error.message,
                isValidInvoice: true // Default to true in case of error in OCR process itself, to avoid breaking existing flow. Consider revising this default based on desired error handling.
            };
        }
    }

    async generatePresignedUrl(bucketName, key, contentType, expires = 900) {
        console.log('[Utils.generatePresignedUrl] Attempting to generate presigned URL with params:');
        console.log(`  Bucket: ${bucketName}`,
                      `Key: ${key}`,
                      `ContentType: ${contentType}`,
                      `Expires: ${expires}`);
        
        // Log the Access Key ID the SDK is configured with
        // Note: Ensure this logging is appropriate for your environment's security policy.
        // Avoid logging Secret Access Keys.
        let configuredAccessKeyId = 'N/A';
        if (s3 && s3.config && s3.config.credentials && s3.config.credentials.accessKeyId) {
            configuredAccessKeyId = s3.config.credentials.accessKeyId;
        }
        console.log(`  Using AWS Access Key ID (from SDK config): ${configuredAccessKeyId}`);

        try {
            const params = {
                Bucket: bucketName.toLowerCase(),
                Key: key,
                Expires: expires,
                ContentType: contentType
            };
            const url = await s3.getSignedUrlPromise('putObject', params);
            console.log('[Utils.generatePresignedUrl] Successfully generated presigned URL:', url);
            return url;
        } catch (error) {
            console.error("[Utils.generatePresignedUrl] Error generating presigned URL:", error);
            throw new Error("Failed to generate presigned URL");
        }
    }

    // Inject metadata into template placeholders
    injectPlaceholders(template, metadata = {}) {
        const replace = (str) => {
            if (!str) return str;
            return str.replace(/{{(.*?)}}/g, (_, key) => {
                const trimmedKey = key.trim();
                const value = metadata[trimmedKey];
                
                if (value === undefined || value === null) {
                    console.warn(`[Utils.injectPlaceholders] Missing value for placeholder: {{${trimmedKey}}}`);
                    return ''; // Replace with empty string as fallback
                }
                
                return String(value);
            });
        };
        
        return {
            title: replace(template.title),
            message: replace(template.message),
            content: replace(template.content), // Support for legacy content field
            action: template.action // Keep action as-is
        };
    }

    // Get notification template by action key with optional metadata injection
    getNotificationTemplate(action, metadata = {}) {
        try {
            const templatePath = path.join(__dirname, 'template', 'notifications.json');
            const templateData = fs.readFileSync(templatePath, 'utf8');
            const templates = JSON.parse(templateData);
            
            if (templates[action]) {
                const template = templates[action];
                
                // Prioritize content over message as the main message body
                const normalizedTemplate = {
                    title: template.title || template.action || 'Notification',
                    message: template.content || template.message || '', // Prioritize content over message
                    content: template.content || template.message || '',
                    action: template.action
                };
                
                // Inject metadata into placeholders if metadata is provided
                const processedTemplate = Object.keys(metadata).length > 0 
                    ? this.injectPlaceholders(normalizedTemplate, metadata)
                    : normalizedTemplate;
                
                return {
                    success: true,
                    title: processedTemplate.title,
                    message: processedTemplate.message,
                    content: processedTemplate.content,
                    action: processedTemplate.action
                };
            } else {
                console.warn(`[Utils.getNotificationTemplate] Template not found for action: ${action}`);
                return {
                    success: false,
                    error: `Template not found for action: ${action}`
                };
            }
        } catch (error) {
            console.error('[Utils.getNotificationTemplate] Error reading notification template:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new Utils();