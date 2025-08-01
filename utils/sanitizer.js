const DOMPurify = require('isomorphic-dompurify');

class Sanitizer {
    /**
     * Sanitize HTML content for screen type workflow steps
     * @param {string} content - HTML content to sanitize
     * @returns {string} - Sanitized HTML content
     */
    sanitizeScreenContent(content) {
        if (!content) return '';

        // Configuration for allowed tags and attributes
        const config = {
            ALLOWED_TAGS: [
                'p', 'br', 'strong', 'em', 'u', 's', 'a', 'img',
                'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'div', 'span', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
            ],
            ALLOWED_ATTR: [
                'href', 'src', 'alt', 'class', 'style', 'target',
                'width', 'height', 'align', 'valign'
            ],
            ALLOWED_STYLES: {
                '*': [
                    'color', 'background-color', 'font-size', 'font-weight',
                    'text-align', 'padding', 'margin', 'border', 'border-radius',
                    'max-width', 'height', 'width', 'display', 'float'
                ]
            },
            // Ensure external links open in new tab
            ADD_ATTR: ['target'],
            // Don't allow data URIs except for images
            ALLOW_DATA_ATTR: false,
            DATA_URI_TAGS: ['img'],
            // Remove dangerous protocols
            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
        };

        // Sanitize the content
        let sanitized = DOMPurify.sanitize(content, config);

        // Additional processing: ensure all external links have target="_blank"
        if (sanitized.includes('<a ')) {
            sanitized = sanitized.replace(
                /<a\s+([^>]*href=["'](?:https?:\/\/)[^"']+["'][^>]*)>/gi,
                (match, attributes) => {
                    if (!attributes.includes('target=')) {
                        return `<a ${attributes} target="_blank" rel="noopener noreferrer">`;
                    }
                    return match;
                }
            );
        }

        return sanitized;
    }

    /**
     * Sanitize plain text input (removes all HTML)
     * @param {string} text - Text to sanitize
     * @returns {string} - Plain text without HTML
     */
    sanitizePlainText(text) {
        if (!text) return '';
        return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
    }

    /**
     * Validate content length
     * @param {string} content - Content to validate
     * @param {number} maxLength - Maximum allowed length (default: 50000)
     * @returns {boolean} - True if content is within limits
     */
    validateContentLength(content, maxLength = 50000) {
        return !content || content.length <= maxLength;
    }

    /**
     * Get safe content preview (truncated and sanitized)
     * @param {string} content - HTML content
     * @param {number} maxLength - Maximum preview length (default: 200)
     * @returns {string} - Safe preview text
     */
    getContentPreview(content, maxLength = 200) {
        const plainText = this.sanitizePlainText(content);
        if (plainText.length <= maxLength) {
            return plainText;
        }
        return plainText.substring(0, maxLength) + '...';
    }
}

module.exports = new Sanitizer();